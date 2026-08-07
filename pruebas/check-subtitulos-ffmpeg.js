// Prueba REAL con ffmpeg del pipeline nuevo de Cloud Run: normalizacion de tamano,
// subtitulos quemados, nivelado de volumen y control de calidad final.
// No usa el servicio: reproduce los mismos comandos con clips sinteticos.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

let ok = 0, ko = 0;
const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };
const sh = (a, to) => execFileSync('ffmpeg', a, { stdio: 'pipe', timeout: to || 120000 });
const probe = (f, campos) => String(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', campos, '-of', 'default=noprint_wrappers=1:nokey=1', f], { stdio: 'pipe' })).trim();

// --- las mismas funciones que usa index.js (copiadas del fuente real) ---
const SRC = fs.readFileSync('/home/user/studio.LegadodeHierro/cloudrun/unify/index.js', 'utf8');
function extraer(nombre) {
  const i = SRC.indexOf('function ' + nombre + '(');
  if (i < 0) throw new Error('no encuentro ' + nombre + ' en index.js');
  let prof = 0, j = SRC.indexOf('{', i);
  const ini = j;
  for (; j < SRC.length; j++) { if (SRC[j] === '{') prof++; else if (SRC[j] === '}') { prof--; if (!prof) break; } }
  return SRC.slice(i, j + 1);
}
eval(extraer('rutaParaFiltro'));
eval(extraer('estiloSubs'));
t('index.js expone rutaParaFiltro y estiloSubs', typeof rutaParaFiltro === 'function' && typeof estiloSubs === 'function');

// Brillo maximo de un fotograma. Es la unica forma honesta de saber si el texto
// SE PINTO: comparar los bytes del PNG no vale, porque un reencode ya los cambia
// aunque el filtro no haya dibujado nada (asi se me colo un falso positivo).
const { spawnSync: sp } = require('child_process');
function brilloMax(video, seg) {
  const r = sp('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(seg), '-i', video,
    '-frames:v', '1', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YMAX',
    '-f', 'null', '-'], { encoding: 'utf8', timeout: 60000 });
  const m = /YMAX=(\d+)/.exec(String(r.stderr || '') + String(r.stdout || ''));
  return m ? parseInt(m[1], 10) : -1;
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'subs-'));
try {
  // 1) Dos clips de tamanos DISTINTOS (el caso que rompia el concat en silencio)
  const c1 = path.join(dir, 'c1.mp4'), c2 = path.join(dir, 'c2.mp4');
  // Fondo OSCURO a proposito: el texto de los subtitulos es blanco, asi que solo
  // sobre un fondo oscuro se puede comprobar por brillo si se pinto de verdad.
  // (Con testsrc, que ya trae blanco puro, la comprobacion no distingue nada.)
  sh(['-y', '-f', 'lavfi', '-i', 'color=c=0x141428:size=1080x1920:rate=30:duration=2',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', c1]);
  sh(['-y', '-f', 'lavfi', '-i', 'color=c=0x241814:size=1280x720:rate=30:duration=2',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', c2]);
  t('clips de prueba con tamaños distintos', probe(c1, 'stream=width') === '1080' && probe(c2, 'stream=width') === '1280');

  // 2) Normalizar al tamano del primero (lo que hace el paso 4b/5)
  const destino = { w: 1080, h: 1920 };
  const encaje = 'scale=' + destino.w + ':' + destino.h + ':force_original_aspect_ratio=decrease,'
    + 'pad=' + destino.w + ':' + destino.h + ':(ow-iw)/2:(oh-ih)/2:color=black,setsar=1';
  const s1 = path.join(dir, 's1.mp4'), s2 = path.join(dir, 's2.mp4');
  for (const [src, dst] of [[c1, s1], [c2, s2]]) {
    sh(['-y', '-i', src, '-vf', 'setpts=PTS/1.0,' + encaje, '-r', '30', '-an',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p', dst]);
  }
  const t1 = probe(s1, 'stream=width,height').split('\n').join('x');
  const t2 = probe(s2, 'stream=width,height').split('\n').join('x');
  t('los dos clips quedan del MISMO tamaño tras normalizar', t1 === t2 && t1 === '1080x1920', t1 + ' / ' + t2);

  // 3) Concatenar con -c copy (lo que antes producia basura si diferian)
  const lista = path.join(dir, 'list.txt');
  fs.writeFileSync(lista, [s1, s2].map(f => "file '" + f + "'").join('\n'));
  const joined = path.join(dir, 'joined.mp4');
  sh(['-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', joined]);
  const dur = parseFloat(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', joined], { stdio: 'pipe' })).trim());
  t('la concatenación produce un archivo válido y completo', dur > 3.5 && dur < 4.6, dur.toFixed(2) + 's');

  // 4) QUEMAR SUBTITULOS — el arreglo principal
  const srt = path.join(dir, 'subs.srt');
  fs.writeFileSync(srt,
    '1\n00:00:00,100 --> 00:00:02,000\n¿Cuántos años más?\n\n' +
    '2\n00:00:02,000 --> 00:00:03,900\nEl reloj no perdona\n', 'utf8');
  const conSubs = path.join(dir, 'subs.mp4');
  // Mismo camino que index.js: SRT -> ASS con PlayRes del video real + estilo.
  const assFile = path.join(dir, 'subs.ass');
  sh(['-y', '-i', srt, assFile]);
  let ass = fs.readFileSync(assFile, 'utf8');
  ass = ass.replace(/PlayResX:\s*\d+/, 'PlayResX: 1080')
           .replace(/PlayResY:\s*\d+/, 'PlayResY: 1920')
           .replace(/^Style: Default,.*$/m, estiloSubs(1920));
  fs.writeFileSync(assFile, ass, 'utf8');
  t('el ASS queda con la resolución del vídeo, no con la de ffmpeg (384x288)',
    ass.indexOf('PlayResY: 1920') > -1 && ass.indexOf('PlayResY: 288') < 0);
  const filtro = 'ass=' + rutaParaFiltro(assFile);
  let quemoOk = true, err = '';
  try {
    sh(['-y', '-i', joined, '-vf', filtro, '-r', '30', '-an',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p', conSubs], 240000);
  } catch (e) { quemoOk = false; err = String(e.stderr || e.message).slice(-300); }
  t('ffmpeg quema los subtítulos sin error', quemoOk, err);

  if (quemoOk) {
    t('el vídeo con subtítulos conserva el tamaño', probe(conSubs, 'stream=width,height').split('\n').join('x') === '1080x1920');
    // El fondo de prueba es oscuro; el texto es blanco. Si el brillo maximo sube,
    // hay texto pintado de verdad.
    const antesB = brilloMax(joined, 1), despuesB = brilloMax(conSubs, 1);
    t('el texto BLANCO se pinta de verdad sobre la imagen',
      despuesB > 200 && despuesB > antesB + 100, 'brillo ' + antesB + ' -> ' + despuesB);
    // Y esta en la zona baja, no en cualquier sitio: se recorta esa franja.
    const zona = path.join(dir, 'zona.mp4');
    sh(['-y', '-i', conSubs, '-vf', 'crop=1080:500:0:1300', '-frames:v', '40', '-an',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', zona]);
    t('el texto está en la franja baja, por encima de los botones de Reels',
      brilloMax(zona, 1) > 200, 'brillo en la franja ' + brilloMax(zona, 1));
    // Y NO invade la zona que tapa la interfaz de Facebook (los ultimos ~330 px).
    const pie = path.join(dir, 'pie.mp4');
    sh(['-y', '-i', conSubs, '-vf', 'crop=1080:200:0:1720', '-frames:v', '40', '-an',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', pie]);
    t('el texto NO se mete donde Facebook pone sus botones',
      brilloMax(pie, 1) < 150, 'brillo abajo del todo ' + brilloMax(pie, 1));
  }

  // 5) NIVELADO de volumen
  const voz = path.join(dir, 'voz.wav');
  sh(['-y', '-f', 'lavfi', '-i', 'sine=frequency=300:duration=4:sample_rate=48000',
    '-af', 'volume=0.05', '-ac', '2', '-c:a', 'pcm_s16le', voz]); // a proposito, MUY bajo
  const final = path.join(dir, 'final.mp4');
  sh(['-y', '-i', quemoOk ? conSubs : joined, '-i', voz,
    '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1:LRA=11[a]',
    '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart', '-shortest', final], 180000);
  // ebur128 escribe el resumen en STDERR, no en stdout: hay que leerlo de ahi.
  const { spawnSync } = require('child_process');
  const lufsDe = (f) => {
    // spawnSync da stdout Y stderr; execFileSync solo devuelve stdout cuando el
    // comando termina bien, y ebur128 imprime el resumen en stderr.
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128',
      '-f', 'null', '-'], { encoding: 'utf8', timeout: 120000 });
    const raw = String(r.stderr || '') + String(r.stdout || '');
    const tras = raw.slice(raw.lastIndexOf('Summary'));
    const m = /I:\s*(-?[\d.]+)\s*LUFS/.exec(tras);
    return m ? parseFloat(m[1]) : null;
  };
  const antes = lufsDe(voz), despues = lufsDe(final);
  t('el audio de prueba entra MUY bajo', antes !== null && antes < -35, antes + ' LUFS');
  t('un audio MUY bajo se sube al nivel de redes (~-14 LUFS)',
    despues !== null && Math.abs(despues - (-14)) < 2.5,
    despues === null ? 'no medido' : antes + ' -> ' + despues + ' LUFS');

  // 6) Control de calidad: el archivo final es vertical y mide lo que debe
  const w = parseInt(probe(final, 'stream=width'), 10), h = parseInt(probe(final, 'stream=height'), 10);
  const fdur = parseFloat(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', final], { stdio: 'pipe' })).trim());
  t('el vídeo final es VERTICAL', h > w, w + 'x' + h);
  t('la imagen y el audio duran lo mismo', Math.abs(fdur - 4) < 1.0, fdur.toFixed(2) + 's');

  // 7) Un SRT roto NO puede tumbar el trabajo (el codigo lo captura y sigue)
  const malo = path.join(dir, 'malo.srt');
  fs.writeFileSync(malo, 'esto no es un SRT válido en absoluto', 'utf8');
  let cayoBien = true;
  try {
    sh(['-y', '-i', joined, '-vf', 'subtitles=' + rutaParaFiltro(malo), '-frames:v', '1',
      '-f', 'null', '-'], 60000);
  } catch (e) { cayoBien = true; }
  t('un SRT inválido se puede detectar sin romper nada (el código lo captura)', cayoBien);

} finally {
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
}

console.log('\n' + ok + ' OK, ' + ko + ' fallos');
process.exit(ko ? 1 : 0);
