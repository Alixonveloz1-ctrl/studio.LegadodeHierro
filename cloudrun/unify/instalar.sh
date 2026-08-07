#!/bin/bash
# ==============================================================================
#  INSTALADOR DEL SERVICIO DE UNIFICACION - LEGADO DE HIERRO
#  Copia TODO este archivo, pegalo en la terminal de Cloud Shell y presiona
#  Enter. Al final te entrega DOS datos para pegar en Vercel. Nada mas.
# ==============================================================================
set -e

# El proyecto se fija aqui mismo: si ya hay uno activo se respeta, si no, se pone
# el de Legado de Hierro. Asi el script funciona en cualquier terminal.
PROYECTO=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROYECTO" ] || [ "$PROYECTO" = "(unset)" ]; then
  PROYECTO="creaciondecontenido1"
fi
gcloud config set project "$PROYECTO" >/dev/null 2>&1 || true
REGION="us-central1"
BUCKET="creancion-de-contenido"
echo ""
echo ">>> Proyecto: $PROYECTO | Region: $REGION | Bucket: $BUCKET"
echo ">>> Este proceso tarda unos 5-8 minutos. No cierres la ventana."
echo ""

mkdir -p ~/legado-unify && cd ~/legado-unify

cat > package.json <<'ARCHIVO_FIN'
{
  "name": "legado-unify",
  "version": "1.0.0",
  "description": "Une los clips de Veo, ajusta la velocidad al audio de ElevenLabs y entrega un solo video final",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@google-cloud/storage": "^7.0.0"
  }
}
ARCHIVO_FIN

cat > Dockerfile <<'ARCHIVO_FIN'
# Servicio legado-unify: Node 20 + ffmpeg (para medir, ajustar velocidad, unir y pegar audio)
# Base fijada a bookworm (Debian 12): garantiza ffmpeg 5.1+, con soporte de
# amix normalize=0, acrossfade y alimiter que usa el pipeline de audio.
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV NODE_ENV=production
CMD ["node", "index.js"]
ARCHIVO_FIN

cat > index.js <<'ARCHIVO_FIN'
// Servicio de unificacion de video + audio — LEGADO DE HIERRO (punto 4 del plan).
// Corre en Cloud Run, en el mismo proyecto de Google Cloud que todo lo demas.
//
// QUE HACE (el mismo proceso que se hacia a mano en CapCut):
//   1. Descarga los clips de Veo (URLs firmadas del bucket) y las partes MP3 de
//      la narracion de ElevenLabs (vienen en el cuerpo de la peticion).
//   2. Mide la duracion real de cada clip y del audio (ffprobe).
//   3. Calcula UNA sola proporcion de velocidad que, aplicada a todos los clips
//      por igual, hace que la suma total encaje con el audio.
//   4. El ULTIMO clip recibe un ajuste fino adicional para cerrar la fraccion
//      de segundo que sobre o falte.
//   5. Une los clips ya ajustados en orden y les pega la narracion encima.
//   6. Sube el MP4 final al bucket y escribe unify/<jobId>.json con el estado.
//
// CALIDAD DE AUDIO: la narracion se mantiene en WAV sin perdida durante todo el
// proceso y solo se codifica a AAC UNA vez al final (256k). La voz al 100% y la
// musica al volumen elegido se suman con amix normalize=0 (sin bajar la voz a la
// mitad) y un alimiter evita saturacion. Las costuras entre partes MP3 y el loop
// de la musica van sin "clicks".
//
// DISEÑO ANTI-PUNTO-CIEGO: este servicio NUNCA "se cae en silencio". Cualquier
// error se captura y se escribe como mensaje claro en unify/<jobId>.json, que
// Vercel lee y registra en SUS logs — los errores siempre se pueden leer desde
// Vercel, sin necesidad de entrar a los registros de Cloud Run.
//
// La peticion /start responde el jobId DE INMEDIATO y el trabajo sigue en
// segundo plano; por eso el servicio debe desplegarse con --no-cpu-throttling.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { Storage } = require('@google-cloud/storage');

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

async function processJob(jobId, videos, audioParts, music, srt, objetivoSeg) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'unify-'));
  try {
    // 1. Descargar clips y escribir las partes de audio
    const clipFiles = [];
    for (let i = 0; i < videos.length; i++) {
      const f = path.join(dir, 'clip' + i + '.mp4');
      await download(videos[i], f);
      clipFiles.push(f);
    }
    const partFiles = [];
    for (let i = 0; i < audioParts.length; i++) {
      const f = path.join(dir, 'audio' + i + '.mp3');
      fs.writeFileSync(f, Buffer.from(audioParts[i], 'base64'));
      partFiles.push(f);
    }

    // 2. Construir la narracion como WAV SIN PERDIDA (nunca AAC intermedio).
    //    La voz de ElevenLabs solo se codifica una vez (el AAC final del paso 7);
    //    asi no se apila la degradacion de re-codificar en cada paso.
    //    Todo a 48000 Hz estereo. Con varias partes, las costuras se unen con un
    //    crossfade corto que elimina el "click" (priming del MP3) entre partes.
    const audioFull = path.join(dir, 'narracion.wav');
    if (partFiles.length === 1) {
      await run('ffmpeg', ['-y', '-i', partFiles[0],
        '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', audioFull]);
    } else {
      const inputs = [];
      partFiles.forEach(f => inputs.push('-i', f));
      let fc = '';
      partFiles.forEach((_, i) => {
        // cada parte a 48k estereo antes de empalmar (evita colapso a mono)
        fc += '[' + i + ':a]aresample=48000,aformat=channel_layouts=stereo[a' + i + '];';
      });
      let prev = '[a0]';
      for (let i = 1; i < partFiles.length; i++) {
        const out = (i === partFiles.length - 1) ? '[mix]' : '[x' + i + ']';
        fc += prev + '[a' + i + ']acrossfade=d=0.05:c1=tri:c2=tri' + out + ';';
        prev = out;
      }
      fc = fc.replace(/;$/, '');
      await run('ffmpeg', ['-y'].concat(inputs, [
        '-filter_complex', fc,
        '-map', '[mix]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', audioFull,
      ]));
    }

    // 3. Medir duraciones
    const audioDur = await probeDuration(audioFull);
    const clipDurs = [];
    for (const f of clipFiles) clipDurs.push(await probeDuration(f));
    const totalVideo = clipDurs.reduce((a, b) => a + b, 0);

    // 4. UNA sola proporcion para todos (el calculo manual de siempre):
    //    factor > 1 acelera, factor < 1 alenta.
    const factor = totalVideo / audioDur;
    if (factor < 0.4 || factor > 3.5) {
      throw new Error('La diferencia entre video (' + totalVideo.toFixed(1) + 's) y audio (' + audioDur.toFixed(1) + 's) es demasiado grande para un ajuste de velocidad razonable (factor ' + factor.toFixed(2) + '). Genera mas o menos clips.');
    }

    // Duracion objetivo de cada clip con el factor comun; el ultimo cierra el resto.
    const targets = clipDurs.map(d => d / factor);
    const sumFirst = targets.slice(0, -1).reduce((a, b) => a + b, 0);
    let lastTarget = audioDur - sumFirst; // ajuste fino del ultimo clip
    const lastIdx = clipFiles.length - 1;
    if (lastTarget < 0.5) lastTarget = targets[lastIdx]; // caso raro: no forzar un ultimo clip absurdo

    // 4b. TAMANO COMUN. El paso 6 concatena con "-c copy", que exige que todos los
    //     clips midan exactamente igual. Trayendo clips del banco es facil mezclar
    //     aspectos distintos, y antes eso producia un MP4 destrozado que se
    //     marcaba como terminado igual. Se toma el tamano del primero como
    //     objetivo y se encajan los demas con scale+pad (sin deformar).
    const tam = [];
    for (const f of clipFiles) tam.push(await probeSize(f));
    const destino = tam[0];
    const mezclados = tam.some(t => t.w !== destino.w || t.h !== destino.h);
    if (mezclados) {
      console.log('[' + jobId + '] clips de distinto tamano (' +
        tam.map(t => t.w + 'x' + t.h).join(', ') + ') -> se normalizan a ' + destino.w + 'x' + destino.h);
    }
    const encaje = 'scale=' + destino.w + ':' + destino.h + ':force_original_aspect_ratio=decrease,'
      + 'pad=' + destino.w + ':' + destino.h + ':(ow-iw)/2:(oh-ih)/2:color=black,setsar=1';

    // 5. Reescalar cada clip (video sin audio propio: los generadores no producen audio)
    const scaled = [];
    for (let i = 0; i < clipFiles.length; i++) {
      const target = i === lastIdx ? lastTarget : targets[i];
      const f = clipDurs[i] / target; // setpts=PTS/f
      const out = path.join(dir, 'scaled' + i + '.mp4');
      const vf = 'setpts=PTS/' + f.toFixed(6) + (mezclados ? ',' + encaje : '');
      await run('ffmpeg', ['-y', '-i', clipFiles[i],
        '-vf', vf,
        '-r', '30', '-an',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-pix_fmt', 'yuv420p', out,
      ]);
      scaled.push(out);
    }

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
        // La pista ya cubre todo el video: no hace falta repetir (cero costuras).
        await run('ffmpeg', ['-y', '-i', musicWav, '-af', fadeOut,
          '-c:a', 'pcm_s16le', musicBed]);
      } else {
        // Repetir con crossfade en cada union. Cada copia extra aporta (musDur - X).
        const per = musDur - X;
        let copies = Math.ceil((need - musDur) / per) + 1;
        if (copies < 2) copies = 2;
        if (copies > 12) copies = 12; // tope de seguridad
        const inputs = [];
        for (let i = 0; i < copies; i++) inputs.push('-i', musicWav);
        let fc = '';
        let prev = '[0:a]';
        for (let i = 1; i < copies; i++) {
          const out = (i === copies - 1) ? '[xf]' : ('[m' + i + ']');
          fc += prev + '[' + i + ':a]acrossfade=d=' + X.toFixed(2) + ':c1=tri:c2=tri' + out + ';';
          prev = out;
        }
        fc += prev + fadeOut + '[bed]';
        await run('ffmpeg', ['-y'].concat(inputs, [
          '-filter_complex', fc, '-map', '[bed]', '-c:a', 'pcm_s16le', musicBed]));
      }

      // Mezcla: voz al 100% + musica a VOL. amix normalize=0 evita que la voz se
      // baje a la mitad; alimiter (-1 dBFS, con lookahead) impide cualquier
      // recorte por picos SIN el escalon del hard-clip => sin distorsion ni clicks.
      const fc =
        '[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.0[nar];' +
        '[2:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=' + vol.toFixed(3) + '[mus];' +
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
    if (finalSize.w > finalSize.h) {
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
    try { await writeStatus(jobId, { status: 'error', message: e.message }); } catch (e2) {
      console.error('[' + jobId + '] no se pudo escribir el estado de error: ' + e2.message);
    }
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/') {
    return res.end(JSON.stringify({ ok: true, service: 'legado-unify' }));
  }
  if (req.method !== 'POST' || req.url !== '/start') {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not found' }));
  }
  if (!UNIFY_KEY || req.headers['x-unify-key'] !== UNIFY_KEY) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Clave invalida' }));
  }
  if (!BUCKET) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'BUCKET no configurado en el servicio' }));
  }
  let body = '';
  let size = 0;
  req.on('data', (c) => {
    size += c.length;
    if (size > 40 * 1024 * 1024) { req.destroy(); return; }
    body += c;
  });
  req.on('end', () => {
    let data = {};
    try { data = JSON.parse(body); } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'JSON invalido' }));
    }
    const videos = Array.isArray(data.videos) ? data.videos : [];
    const audioParts = Array.isArray(data.audioParts) ? data.audioParts : [];
    if (!videos.length || videos.length > 10) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Se necesitan entre 1 y 10 clips' }));
    }
    if (!audioParts.length) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Falta el audio de la narracion' }));
    }
    // Musica opcional: {object: 'musica/xxx.mp3', volume: 0-1}. Solo se aceptan
    // pistas de la carpeta musica/ del bucket (nunca rutas arbitrarias).
    let music = null;
    if (data.music && typeof data.music.object === 'string') {
      const obj = data.music.object;
      if (obj.indexOf('musica/') === 0 && obj.indexOf('..') === -1 && obj.length < 200) {
        music = { object: obj, volume: data.music.volume };
      }
    }
    // Subtitulos ya cronometrados que manda el navegador (formato SRT). Se acota
    // el tamano: un guion de 60 s son unos 2 KB, asi que 200 KB es de sobra y
    // evita que un cuerpo enorme tumbe el servicio.
    let srt = null;
    if (typeof data.srt === 'string' && data.srt.trim() && data.srt.length < 200000) srt = data.srt;
    const objetivoSeg = Number(data.targetSeconds) || 0;

    const jobId = 'job-' + crypto.randomBytes(10).toString('hex');
    // Responder YA y trabajar en segundo plano (requiere --no-cpu-throttling).
    res.end(JSON.stringify({ jobId: jobId }));
    processJob(jobId, videos, audioParts, music, srt, objetivoSeg);
  });
});

server.listen(PORT, () => console.log('legado-unify escuchando en ' + PORT + ' (bucket: ' + BUCKET + ')'));
ARCHIVO_FIN

CLAVE=$(openssl rand -hex 24)

echo ">>> Activando los servicios necesarios..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project "$PROYECTO" --quiet

echo ">>> Desplegando el servicio legado-unify en Cloud Run..."
gcloud run deploy legado-unify --source . --project "$PROYECTO" --region "$REGION" --allow-unauthenticated --memory 2Gi --cpu 2 --timeout 600 --no-cpu-throttling --min-instances 0 --max-instances 2 --set-env-vars "BUCKET=$BUCKET,UNIFY_KEY=$CLAVE" --quiet

URL=$(gcloud run services describe legado-unify --project "$PROYECTO" --region "$REGION" --format='value(status.url)')

echo ">>> Dando permiso al servicio para guardar el video final en el bucket..."
PROJECT_NUMBER=$(gcloud projects describe "$PROYECTO" --format='value(projectNumber)')
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:${{PROJECT_NUMBER}}-compute@developer.gserviceaccount.com" --role="roles/storage.objectAdmin" --quiet >/dev/null

echo ""
echo "=================================================================="
echo "  LISTO. AHORA COPIA ESTOS DOS DATOS Y PEGALOS EN VERCEL"
echo "  (Settings -> Environment Variables -> Add)"
echo "=================================================================="
echo ""
echo "  Nombre:  CLOUD_RUN_UNIFY_URL"
echo "  Valor:   $URL"
echo ""
echo "  Nombre:  UNIFY_KEY"
echo "  Valor:   $CLAVE"
echo ""
echo "  Despues en Vercel: Deployments -> (...) del ultimo -> Redeploy"
echo "=================================================================="
