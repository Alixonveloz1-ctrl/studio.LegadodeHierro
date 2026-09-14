// Montaje personal persistente de Legado de Hierro.
// HTTP only records the request and starts a Cloud Run Job. The job measures
// narration, reuses cached scene segments and renders mixed images/videos at
// their natural speed, with looped music and subtitles. No media in HTTP bodies.
// A failed task persists its error and retries once; the phone can reconnect.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { Storage } = require('@google-cloud/storage');
const {GoogleAuth} = require('google-auth-library');
const {fitTimeline,validateShots,videoSpeed} = require('./timeline');

// VERSION DEL SERVICIO. Cambia cada vez que se toca este archivo, y la
// herramienta la compara con la que espera para decir sola si el Cloud Run que
// hay corriendo esta al dia o le falta la ultima actualizacion. Antes no habia
// forma de saberlo desde fuera y habia que preguntarlo, que es absurdo.
const VERSION = '2026-09-14.1';

const PORT = process.env.PORT || 8080;
// Sin nombres de respaldo: el bucket SIEMPRE viene de la variable BUCKET del despliegue.
const BUCKET = (process.env.BUCKET || '').replace('gs://', '').replace(/\/.*$/, '');
const UNIFY_KEY = process.env.UNIFY_KEY || '';
const storage = new Storage();

function run(cmd, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs || 240000, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(cmd + ' fallo: ' + (stderr || err.message).slice(-800)));
      resolve({ stdout, stderr });
    });
  });
}

async function probeDuration(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', file,
  ]);
  const d = parseFloat(String(stdout).trim());
  if (!isFinite(d) || d <= 0) throw new Error('No se pudo medir la duracion de ' + path.basename(file));
  return d;
}

// Tamano real del video. Hace falta porque el paso de concatenar usa "-c copy":
// si se mezclan clips de distinta resolucion (algo perfectamente posible trayendo
// clips del banco generados con otro aspecto), el resultado es un archivo roto
// SIN que ffmpeg avise, y el trabajo se marcaba igualmente como terminado.
async function probeSize(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0:s=x', file,
  ]);
  const m = /(\d+)x(\d+)/.exec(String(stdout).trim());
  if (!m) throw new Error('No se pudo medir el tamano de ' + path.basename(file));
  return { w: parseInt(m[1], 10), h: parseInt(m[2], 10) };
}

// Los subtitulos llegan como SRT. Se escriben a fichero y se queman con el filtro
// "subtitles". Hay que escapar la ruta: en el grafo de filtros de ffmpeg, los ":"
// y las "," separan argumentos.
function rutaParaFiltro(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

// Estilo de los subtitulos, como linea "Style:" de ASS.
//
// OJO CON LAS UNIDADES, que es donde esto falla en silencio: los valores de un
// estilo ASS NO estan en pixeles del video, sino en el espacio de referencia que
// declara el propio fichero (PlayResX/PlayResY). Cuando ffmpeg convierte un SRT
// pone 384x288 por defecto, asi que un MarginV calculado sobre 1920 empuja el
// texto fuera de la pantalla y el video sale SIN subtitulos, sin ningun error.
// Por eso mas abajo se reescribe PlayRes al tamano real del video: asi estos
// numeros si son pixeles de verdad y se pueden razonar.
//
// Blanco, negrita, borde negro grueso y sombra: se lee sobre cualquier imagen.
// El margen inferior deja libre la franja donde Facebook pone sus botones.
function estiloSubs(alto) {
  const fs = Math.round(alto * 0.045);          // ~86 px con 1920 de alto
  const margen = Math.round(alto * 0.17);       // despeja la interfaz de Reels
  const outline = Math.max(3, Math.round(fs * 0.09));
  const sombra = Math.max(1, Math.round(fs * 0.03));
  // Orden de los campos del formato V4+ (no se puede alterar):
  // Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,
  // Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,
  // Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
  return 'Style: Default,DejaVu Sans,' + fs + ',&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,'
    + '-1,0,0,0,100,100,0,0,1,' + outline + ',' + sombra + ',2,60,60,' + margen + ',1';
}

// Convierte el SRT en un ASS con la resolucion de referencia del VIDEO REAL y
// con nuestro estilo. Devuelve la ruta del .ass listo para el filtro.
async function prepararSubs(dir, srt, ancho, alto) {
  const srtFile = path.join(dir, 'subs.srt');
  fs.writeFileSync(srtFile, String(srt), 'utf8');
  const assFile = path.join(dir, 'subs.ass');
  // ffmpeg hace la conversion de formato; nosotros solo corregimos cabecera y estilo.
  await run('ffmpeg', ['-y', '-i', srtFile, assFile], 60000);
  let ass = fs.readFileSync(assFile, 'utf8');
  ass = ass.replace(/PlayResX:\s*\d+/, 'PlayResX: ' + ancho)
           .replace(/PlayResY:\s*\d+/, 'PlayResY: ' + alto)
           .replace(/^Style: Default,.*$/m, estiloSubs(alto));
  // Si alguna de las dos sustituciones no encajo, mejor fallar aqui que entregar
  // un video sin subtitulos creyendo que los lleva.
  if (ass.indexOf('Style: Default,DejaVu Sans,') < 0) throw new Error('No se pudo aplicar el estilo al ASS');
  if (ass.indexOf('PlayResY: ' + alto) < 0) throw new Error('No se pudo fijar PlayRes en el ASS');
  fs.writeFileSync(assFile, ass, 'utf8');
  return assFile;
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('No se pudo descargar un clip (HTTP ' + r.status + '). Puede que la URL firmada haya expirado: regenera los videos e intenta de nuevo.');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 1000) throw new Error('Un clip llego vacio o corrupto.');
  fs.writeFileSync(dest, buf);
}

async function writeStatus(jobId, obj) {
  await storage.bucket(BUCKET).file('unify/' + jobId + '.json')
    .save(JSON.stringify(obj), { contentType: 'application/json' });
}

// IMAGEN FIJA -> CLIP CON MOVIMIENTO (respaldo cuando no hay creditos para Veo).
//
// Una imagen quieta durante 8 segundos mata la retencion: parece una diapositiva.
// Aqui se le da un acercamiento lento y una deriva suave (lo que en television
// llaman "Ken Burns"), que es lo que hace que se vea como plano de cine y no
// como una foto pegada.
//
// COMO SE HACE, y por que asi: el filtro zoompan trabaja fotograma a fotograma y
// si se aplica directo sobre la imagen final el borde "tiembla" (salta de pixel
// en pixel). Por eso primero se AMPLIA la imagen 4x, se hace el movimiento sobre
// esa version grande, y se reduce al tamano final: el temblor queda por debajo
// del pixel y el movimiento sale liso.
async function imagenAClip(imgFile, salida, segundos, ancho, alto, indice) {
  const FPS = 30;
  const frames = Math.max(2, Math.round(segundos * FPS));
  const SUP = 4;                                   // factor de sobremuestreo
  const zoomFinal = 1.14;                          // 14% de acercamiento total
  const paso = (zoomFinal - 1) / frames;
  // Se alterna el sentido para que dos imagenes seguidas no se muevan igual.
  const modo = indice % 4;
  const zExpr = (modo === 1 || modo === 3)
    ? ('max(' + zoomFinal.toFixed(4) + '-on*' + paso.toFixed(8) + ',1.0)')  // alejarse
    : ('min(1.0+on*' + paso.toFixed(8) + ',' + zoomFinal.toFixed(4) + ')'); // acercarse
  // Deriva suave hacia un lado, distinta segun el indice.
  const xs = ['iw/2-(iw/zoom/2)', 'iw/2-(iw/zoom/2)+(on/' + frames + ')*(iw*0.04)',
              'iw/2-(iw/zoom/2)-(on/' + frames + ')*(iw*0.04)', 'iw/2-(iw/zoom/2)'];
  const ys = ['ih/2-(ih/zoom/2)-(on/' + frames + ')*(ih*0.03)', 'ih/2-(ih/zoom/2)',
              'ih/2-(ih/zoom/2)', 'ih/2-(ih/zoom/2)+(on/' + frames + ')*(ih*0.03)'];
  const vf = 'scale=' + (ancho * SUP) + ':' + (alto * SUP)
    + ':force_original_aspect_ratio=increase,crop=' + (ancho * SUP) + ':' + (alto * SUP) + ','
    + "zoompan=z='" + zExpr + "':x='" + xs[modo] + "':y='" + ys[modo] + "'"
    + ':d=' + frames + ':s=' + ancho + 'x' + alto + ':fps=' + FPS
    + ',setsar=1';
  await run('ffmpeg', ['-y', '-loop', '1', '-i', imgFile, '-frames:v', String(frames),
    '-vf', vf, '-r', String(FPS), '-an',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', salida,
  ], 300000);
}

async function processJob(jobId, payload) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unify-'));
  const {shots,audioObjects,music,srt,targetSeconds:objetivoSeg,aspect} = payload;
  const progress = async stage=>writeStatus(jobId,{status:'running',stage,updatedAt:new Date().toISOString()});
  try {
    await progress('Preparando la narración guardada');
    const partFiles=[];
    for(let i=0;i<audioObjects.length;i++){
      const source=path.join(dir,'source-audio-'+i);
      await storage.bucket(BUCKET).file(audioObjects[i]).download({destination:source});
      const normalized=path.join(dir,'audio-'+i+'.wav');
      await run('ffmpeg',['-y','-i',source,'-ar','48000','-ac','2','-c:a','pcm_s16le',normalized]);
      partFiles.push(normalized);fs.rmSync(source,{force:true});
    }
    // Concat preserves every sample. Crossfading narration shortened each boundary
    // and accumulated a subtitle offset in long episodes.
    const audioList=path.join(dir,'audio-list.txt');
    fs.writeFileSync(audioList,partFiles.map(f=>"file '"+f+"'").join('\n'));
    const audioFull=path.join(dir,'narracion.wav');
    await run('ffmpeg',['-y','-f','concat','-safe','0','-i',audioList,'-c:a','pcm_s16le',audioFull]);
    for(const f of partFiles)fs.rmSync(f,{force:true});
    const audioDur=await probeDuration(audioFull),timeline=fitTimeline(shots,audioDur);
    const destino=aspect==='16:9'?{w:1280,h:720}:aspect==='1:1'?{w:1080,h:1080}:aspect==='4:5'?{w:864,h:1080}:{w:720,h:1280};
    const factor=1,totalVideo=audioDur,scaled=[],sources=new Map();
    const encaje='scale='+destino.w+':'+destino.h+':force_original_aspect_ratio=increase,crop='+destino.w+':'+destino.h+',setsar=1';
    for(let i=0;i<timeline.length;i++){
      const shot=timeline[i];await progress('Montando toma '+(i+1)+' de '+timeline.length);
      const out=path.join(dir,'scaled'+i+'.mp4');
      const cacheKey=crypto.createHash('sha256').update(JSON.stringify({v:VERSION,...shot,aspect})).digest('hex');
      const cached=storage.bucket(BUCKET).file('unify/parts/'+jobId+'/'+cacheKey+'.mp4');
      if((await cached.exists())[0]){await cached.download({destination:out});scaled.push(out);continue;}
      let source=sources.get(shot.object);
      if(!source){source=path.join(dir,'source-'+i+(shot.kind==='image'?'.png':'.mp4'));await storage.bucket(BUCKET).file(shot.object).download({destination:source});sources.set(shot.object,source);}
      if(shot.kind==='image')await imagenAClip(source,out,shot.duration,destino.w,destino.h,i);
      else{
        // One continuous pass. Adjacent references were merged in fitTimeline.
        const speed=videoSpeed(await probeDuration(source),shot.duration);
        await run('ffmpeg',['-y','-i',source,'-t',shot.duration.toFixed(6),'-vf','setpts='+speed.toFixed(8)+'*(PTS-STARTPTS),'+encaje,'-r','30','-frames:v',String(shot.frames),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',out]);
      }
      await cached.save(fs.readFileSync(out),{contentType:'video/mp4'});scaled.push(out);
    }
    await progress('Uniendo las tomas y preparando los subtítulos');

    // 6. Concatenar en orden
    const listFile = path.join(dir, 'list.txt');
    fs.writeFileSync(listFile, scaled.map(f => "file '" + f + "'").join('\n'));
    let joined = path.join(dir, 'joined.mp4');
    await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joined]);

    // 6b. SUBTITULOS QUEMADOS. En Facebook la mayoria mira SIN sonido: si en los
    //     primeros segundos no hay texto en pantalla, se van antes de oir nada.
    //     Los tiempos por caracter de ElevenLabs ya se calculan en el navegador y
    //     hasta ahora solo acababan en un .srt suelto dentro del ZIP; el reel tenia
    //     que pasar por CapCut solo por esto. Aqui se queman de una vez.
    //     Obliga a reencodear el video en ESTE paso (antes era copy), pero el paso 7
    //     ya no reencodea video, asi que sigue habiendo un solo encode de video.
    let subsPuestos = false;
    if (srt && String(srt).trim()) {
      const conSubs = path.join(dir, 'joined_subs.mp4');
      try {
        const assFile = await prepararSubs(dir, srt, destino.w, destino.h);
        const filtro = 'ass=' + rutaParaFiltro(assFile);
        await run('ffmpeg', ['-y', '-i', joined, '-vf', filtro,
          '-r', '30', '-an',
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
          '-pix_fmt', 'yuv420p', conSubs,
        ], 420000);
        joined = conSubs;
        subsPuestos = true;
      } catch (e) {
        // Si el quemado falla (una fuente que no esta, un SRT mal formado), NO se
        // tira el trabajo entero: sale el video sin subtitulos y se avisa en el
        // estado. Perder el reel por los subtitulos seria peor que no tenerlos.
        console.warn('[' + jobId + '] no se pudieron quemar los subtitulos: ' + e.message);
      }
    }

    // 7. Pegar la narracion encima — y, si se pidio, la MUSICA DE FONDO debajo.
    //    Codificacion AAC UNA sola vez (256k), a partir del WAV sin perdida.
    const finalFile = path.join(dir, 'final.mp4');
    // Ajustes de codec de audio compartidos por ambos caminos: un solo encode AAC-LC 256k.
    const AAC = ['-c:a', 'aac', '-b:a', '256k', '-profile:a', 'aac_low', '-ar', '48000', '-ac', '2'];
    // NIVELADO al estandar de redes (-14 LUFS). Sin esto, dos reels seguidos salen
    // a volumenes distintos segun el motor de voz que se uso (ElevenLabs, Gemini-TTS
    // y Chirp no coinciden), y Facebook aplica su propia normalizacion encima, que
    // castiga al que llega bajo. Con esto todos los reels suenan igual de fuertes.
    const LOUDNORM = 'loudnorm=I=-14:TP=-1:LRA=11';
    if (music && music.object) {
      const musicSrc = path.join(dir, 'music_src' + path.extname(music.object || '.mp3'));
      try {
        await storage.bucket(BUCKET).file(music.object).download({ destination: musicSrc });
      } catch (e) {
        throw new Error('No se pudo descargar la musica "' + music.object + '" del bucket: ' + e.message);
      }
      let vol = Number(music.volume);
      if (!isFinite(vol) || vol < 0 || vol > 1) vol = 0.18;
      // Pre: musica -> WAV 48k estereo (PCM, sin perdida).
      const musicWav = path.join(dir, 'music_wav.wav');
      await run('ffmpeg', ['-y', '-i', musicSrc,
        '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', musicWav]);

      // CAMA DE MUSICA SIN COSTURA. Antes se repetia con -stream_loop, que pega
      // copia tras copia: en cada vuelta el final chocaba de golpe con el inicio y
      // se oia un corte seco. Ahora se mide la narracion y se arma la musica al
      // largo justo, uniendo cada repeticion con un CROSSFADE (fundido cruzado),
      // asi nunca hay un corte. Al final, un fundido de salida para que no se corte
      // en seco cuando termina el video.
      const narDur = await probeDuration(audioFull);
      const musDur = await probeDuration(musicWav);
      const musicBed = path.join(dir, 'music_bed.wav');
      const X = Math.min(2, Math.max(0.5, musDur / 3)); // segundos de crossfade
      const need = narDur + 1.0;                        // cubrir todo el video con margen
      const fadeOutD = Math.min(1.5, musDur / 2);
      const fadeStart = Math.max(0, narDur - fadeOutD);
      const fadeOut = 'afade=t=out:st=' + fadeStart.toFixed(2) + ':d=' + fadeOutD.toFixed(2);

      if (musDur >= need) {
        await run('ffmpeg',['-y','-i',musicWav,'-t',narDur.toFixed(3),'-af',fadeOut,'-c:a','pcm_s16le',musicBed]);
      } else {
        // Build one seamless loop, then stream it for the measured duration.
        // Unlike a capped list of 12 copies, this covers 8 minutes or an hour.
        const loop=path.join(dir,'music-loop.wav');
        const cross=Math.min(2,musDur/4);
        await run('ffmpeg',['-y','-i',musicWav,'-i',musicWav,'-filter_complex',
          '[0:a][1:a]acrossfade=d='+cross.toFixed(4)+':c1=tri:c2=tri,atrim=start='+cross.toFixed(4)+':end='+musDur.toFixed(4)+',asetpts=PTS-STARTPTS[loop]',
          '-map','[loop]','-c:a','pcm_s16le',loop]);
        // Crossfade the tail of a copy with the next head, then take exactly
        // one cyclic period beginning after that head; the join is continuous.
        await run('ffmpeg',['-y','-stream_loop','-1','-i',loop,'-t',narDur.toFixed(3),'-af',fadeOut,'-c:a','pcm_s16le',musicBed]);
      }

      // Mezcla: voz al 100% + musica a VOL. amix normalize=0 evita que la voz se
      // baje a la mitad; alimiter (-1 dBFS, con lookahead) impide cualquier
      // recorte por picos SIN el escalon del hard-clip => sin distorsion ni clicks.
      const fc =
        '[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.0[nar];' +
        // LA MUSICA, APLANADA ANTES DE MEZCLARLA.
        //
        // Una pieza generada tiene su dinamica: pasajes suaves y subidas. Como
        // musica de fondo eso es un problema — en las subidas tapa la voz, y si
        // se baja el volumen para que no la tape, en los pasajes suaves no se
        // oye. No hay volumen manual que valga para las dos cosas.
        //
        // dynaudnorm empareja el nivel a lo largo de toda la pieza (ventana de
        // ~3 s, sin bombear), acompressor recorta lo que aun sobresalga y
        // loudnorm la deja en un nivel conocido antes de aplicar el volumen
        // elegido. Resultado: la musica suena igual de presente todo el rato y
        // el volumen que se elige significa lo mismo de principio a fin.
        '[2:a]aformat=sample_fmts=fltp:channel_layouts=stereo,' +
        'dynaudnorm=f=250:g=15:p=0.9:m=8:r=0.9:s=12,' +
        'acompressor=threshold=0.1:ratio=4:attack=20:release=250:makeup=1,' +
        'loudnorm=I=-24:TP=-6:LRA=3,' +
        'volume=' + vol.toFixed(3) + '[mus];' +
        '[nar][mus]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[premix];' +
        '[premix]alimiter=level=0:limit=0.891:attack=5:release=50:asc=1,' + LOUDNORM + '[a]';
      await run('ffmpeg', ['-y', '-i', joined, '-i', audioFull, '-i', musicBed,
        '-filter_complex', fc,
        '-map', '0:v:0', '-map', '[a]',
        '-c:v', 'copy'].concat(AAC, [
        '-movflags', '+faststart', '-shortest', finalFile,
      ]));
    } else {
      // Sin musica: video + narracion WAV -> UN encode AAC 256k (antes eran 2 encodes).
      await run('ffmpeg', ['-y', '-i', joined, '-i', audioFull,
        '-filter_complex', '[1:a]' + LOUDNORM + '[a]',
        '-map', '0:v:0', '-map', '[a]',
        '-c:v', 'copy'].concat(AAC, [
        '-movflags', '+faststart', '-shortest', finalFile,
      ]));
    }

    // 8. CONTROL DE CALIDAD. Antes el MP4 salia de aqui y se ofrecia para descargar
    //    sin comprobar NADA: si algo habia salido mal, el estado decia "done"
    //    igualmente. Ahora se mide el archivo terminado y los avisos viajan con el
    //    resultado, para que no se publique un reel roto sin darse cuenta.
    const avisos = [];
    const finalSize = await probeSize(finalFile);
    const finalDur = await probeDuration(finalFile);
    if (aspect==='9:16' && finalSize.w > finalSize.h) {
      avisos.push('El video salio horizontal (' + finalSize.w + 'x' + finalSize.h + '). Para Reels tiene que ser vertical.');
    }
    // La imagen y el sonido tienen que durar lo mismo: si no, hay un trozo mudo
    // al final o la voz se corta.
    if (Math.abs(finalDur - audioDur) > 1.0) {
      avisos.push('La imagen dura ' + finalDur.toFixed(1) + 's y la narracion ' + audioDur.toFixed(1) + 's.');
    }
    // Duracion objetivo (30 o 60 s): si se pasa mucho, el reel no encaja.
    const obj = Number(objetivoSeg);
    if (isFinite(obj) && obj > 0 && Math.abs(finalDur - obj) / obj > 0.15) {
      avisos.push('Dura ' + finalDur.toFixed(1) + 's y el objetivo eran ' + obj + 's.');
    }
    if (srt && String(srt).trim() && !subsPuestos) {
      avisos.push('No se pudieron quemar los subtitulos; el video sale sin ellos.');
    }
    if (avisos.length) console.warn('[' + jobId + '] avisos de calidad: ' + avisos.join(' | '));

    // Subir el resultado y marcar el trabajo como terminado
    const object = 'unify/' + jobId + '.mp4';
    await storage.bucket(BUCKET).upload(finalFile, {
      destination: object,
      metadata: { contentType: 'video/mp4' },
    });
    await writeStatus(jobId, {
      status: 'done',
      object: object,
      factor: Number(factor.toFixed(4)),
      videoSeconds: Number(totalVideo.toFixed(2)),
      audioSeconds: Number(audioDur.toFixed(2)),
      // Datos del archivo REAL que se subio, no de lo que se pretendia hacer.
      ancho: finalSize.w, alto: finalSize.h,
      duracion: Number(finalDur.toFixed(2)),
      subtitulos: subsPuestos,
      avisos: avisos,
    });
    console.log('[' + jobId + '] listo: ' + object + ' (factor ' + factor.toFixed(3) + ')');
  } catch (e) {
    // El error NUNCA se pierde: queda en el bucket y Vercel lo registra al leerlo.
    console.error('[' + jobId + '] error: ' + e.message);
    try { await writeStatus(jobId, { status: 'error', message: e.message,updatedAt:new Date().toISOString() }); } catch (e2) {
      console.error('[' + jobId + '] no se pudo escribir el estado de error: ' + e2.message);
    }
    throw e;
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
}

// A Cloud Run Job executes to completion independently of HTTP and the phone.
// Both the request and every finished visual segment are persisted in GCS.
const auth = new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
async function runWorker(jobId){
  if(!/^job-[a-f0-9]{24}$/.test(jobId))throw new Error('jobId inválido');
  const bucket=storage.bucket(BUCKET),state=bucket.file('unify/'+jobId+'.json');
  try{const [raw]=await state.download();if(JSON.parse(raw).status==='done')return;}catch(e){if(e.code!==404)throw e;}
  const lock=bucket.file('unify/locks/'+jobId+'.json');
  let generation=0;
  try{
    const [meta]=await lock.getMetadata();generation=meta.generation;
    const [raw]=await lock.download();const lease=JSON.parse(raw);
    if(lease.until>Date.now() && lease.execution!==(process.env.CLOUD_RUN_EXECUTION || 'local'))return;
  }catch(e){if(e.code!==404)throw e;}
  try{await lock.save(JSON.stringify({execution:process.env.CLOUD_RUN_EXECUTION || 'local',until:Date.now()+3700000}),{contentType:'application/json',preconditionOpts:{ifGenerationMatch:generation}});}catch(e){if(e.code===412)return;throw e;}
  try{
    const [raw]=await bucket.file('unify/requests/'+jobId+'.json').download();
    await processJob(jobId,JSON.parse(raw));
  }finally{await lock.delete().catch(()=>{});}
}
async function startJob(data){
  validateShots(data.shots);
  if(!Array.isArray(data.audioObjects)||!data.audioObjects.length||data.audioObjects.length>200||!data.audioObjects.every(o=>typeof o==='string'&&/^legado-studio\/media\//.test(o)&&!o.includes('..')))throw new Error('Referencias de audio inválidas');
  if(!['9:16','16:9','1:1','4:5'].includes(data.aspect))throw new Error('Formato inválido');
  if(data.music&&(!/^musica\//.test(data.music.object)||data.music.object.includes('..')))throw new Error('Música inválida');
  const resource=process.env.RENDER_JOB_RESOURCE;
  if(!/^projects\/[^/]+\/locations\/[^/]+\/jobs\/[^/]+$/.test(resource || ''))throw new Error('Falta instalar el ejecutor de montaje. Ejecuta el actualizador de Cloud Run de esta versión.');
  const jobId='job-'+crypto.createHash('sha256').update(JSON.stringify({version:VERSION,...data})).digest('hex').slice(0,24);
  const bucket=storage.bucket(BUCKET),state=bucket.file('unify/'+jobId+'.json');
  try{const [raw]=await state.download(),d=JSON.parse(raw);if(d.status==='done'||(d.status==='running'&&Date.now()-Date.parse(d.updatedAt)<3700000)||(d.status==='queued'&&Date.now()-Date.parse(d.updatedAt)<90000))return jobId;}catch(e){if(e.code!==404)throw e;}
  const request=bucket.file('unify/requests/'+jobId+'.json');
  try{await request.save(JSON.stringify(data),{contentType:'application/json',preconditionOpts:{ifGenerationMatch:0}});}catch(e){if(e.code!==412)throw e;}
  await writeStatus(jobId,{status:'queued',stage:'Montaje en cola',updatedAt:new Date().toISOString()});
  try{
    const client=await auth.getClient();
    await client.request({url:'https://run.googleapis.com/v2/'+resource+':run',method:'POST',timeout:15000,data:{overrides:{containerOverrides:[{env:[{name:'LH_JOB_ID',value:jobId}]}]}}});
  }catch(e){await writeStatus(jobId,{status:'error',message:'No se pudo arrancar el ejecutor de montaje. '+e.message,updatedAt:new Date().toISOString()});throw e;}
  return jobId;
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.method==='GET'&&req.url==='/')return res.end(JSON.stringify({ok:true,service:'legado-unify',version:VERSION,continuousVideo:true,durable:!!process.env.RENDER_JOB_RESOURCE}));
  if(req.method!=='POST'||req.url!=='/start'){res.statusCode=404;return res.end(JSON.stringify({error:'Ruta desconocida'}));}
  const supplied=Buffer.from(String(req.headers['x-unify-key']||'')),expected=Buffer.from(UNIFY_KEY);
  if(!UNIFY_KEY||supplied.length!==expected.length||!crypto.timingSafeEqual(supplied,expected)){res.statusCode=401;return res.end(JSON.stringify({error:'Clave inválida'}));}
  try{
    let size=0,body=[];for await(const c of req){size+=c.length;if(size>2*1024*1024)throw new Error('El montaje debe enviar referencias, no archivos');body.push(c);}
    const data=JSON.parse(Buffer.concat(body).toString());const jobId=await startJob(data);res.end(JSON.stringify({jobId}));
  }catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}));}
});
if(require.main===module){
  if(process.env.LH_JOB_ID)runWorker(process.env.LH_JOB_ID).then(()=>process.exit(0)).catch(e=>{console.error(e.message);process.exit(1);});
  else server.listen(PORT,()=>console.log('legado-unify '+VERSION+' escuchando en '+PORT));
}
module.exports={processJob,runWorker,startJob,server,fitTimeline,imagenAClip,prepararSubs,probeDuration,probeSize};
