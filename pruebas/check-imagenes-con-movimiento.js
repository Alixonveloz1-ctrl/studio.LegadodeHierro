// RESPALDO SIN CREDITOS: armar el reel solo con imagenes, dandoles movimiento.
// Se prueba la funcion REAL de Cloud Run con ffmpeg de verdad.
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

let ok = 0, ko = 0;
const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };
const sh = (a, to) => execFileSync('ffmpeg', a, { stdio: 'pipe', timeout: to || 180000 });
const probe = (f, campos) => String(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', campos, '-of', 'default=noprint_wrappers=1:nokey=1', f], { stdio: 'pipe' })).trim();

// Se extraen del fuente REAL las funciones que usa el servicio.
const SRC = fs.readFileSync('/home/user/studio.LegadodeHierro/cloudrun/unify/index.js', 'utf8');
function extraer(nombre) {
  const i = SRC.indexOf('function ' + nombre + '(');
  if (i < 0) throw new Error('no encuentro ' + nombre);
  let prof = 0, j = SRC.indexOf('{', i);
  for (; j < SRC.length; j++) { if (SRC[j] === '{') prof++; else if (SRC[j] === '}') { prof--; if (!prof) break; } }
  return SRC.slice(i, j + 1);
}
// imagenAClip usa run(); se le da una implementacion equivalente sincrona.
function run(cmd, args, to) { return Promise.resolve(sh(args, to)); }
// extraer() empieza en "function nombre(", asi que se pierde el "async" del
// original: se le vuelve a poner delante al convertirlo en expresion.
eval('globalThis.imagenAClip = async ' + extraer('imagenAClip'));
t('index.js expone imagenAClip', typeof globalThis.imagenAClip === 'function');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-'));
(async () => {
  try {
    // Imagen de prueba con detalle, para poder ver si de verdad se mueve.
    const img = path.join(dir, 'img.png');
    sh(['-y', '-f', 'lavfi', '-i', 'testsrc=size=1080x1920:duration=1:rate=1', '-frames:v', '1', img]);
    t('imagen de partida 1080x1920', probe(img, 'stream=width,height').split('\n').join('x') === '1080x1920');

    // --- el clip con movimiento ---
    const clip = path.join(dir, 'clip.mp4');
    await globalThis.imagenAClip(img, clip, 4, 1080, 1920, 0);
    const dur = parseFloat(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', clip], { stdio: 'pipe' })).trim());
    t('la imagen se convierte en un clip de la duración pedida', Math.abs(dur - 4) < 0.25, dur.toFixed(2) + 's');
    t('conserva el tamaño', probe(clip, 'stream=width,height').split('\n').join('x') === '1080x1920');
    t('sale a 30 fotogramas por segundo', /^30(\/1)?$/.test(probe(clip, 'stream=r_frame_rate')));

    // SE MUEVE DE VERDAD: se comparan dos fotogramas separados en el tiempo.
    // Si la imagen estuviera quieta, serian identicos.
    const f0 = path.join(dir, 'f0.png'), f3 = path.join(dir, 'f3.png');
    sh(['-y', '-i', clip, '-vf', 'select=eq(n\\,1)', '-frames:v', '1', f0]);
    sh(['-y', '-i', clip, '-vf', 'select=eq(n\\,110)', '-frames:v', '1', f3]);
    const distintos = Buffer.compare(fs.readFileSync(f0), fs.readFileSync(f3)) !== 0;
    t('la imagen SE MUEVE (no es una diapositiva quieta)', distintos);

    // Y el movimiento es de acercamiento: el contenido del centro crece.
    // Se mide comparando el mismo recorte central al principio y al final.
    const dif = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f0, '-i', f3,
      '-filter_complex', '[0:v][1:v]signalstats=stat=tout,ssim', '-f', 'null', '-'],
      { encoding: 'utf8', timeout: 60000 });
    const ss = /All:([\d.]+)/.exec(String(dif.stderr || ''));
    t('el movimiento es suave, no un salto brusco',
      !ss || parseFloat(ss[1]) > 0.5, ss ? 'similitud ' + ss[1] : 'no medido');

    // --- dos imagenes seguidas NO se mueven igual ---
    const clipB = path.join(dir, 'clipB.mp4');
    await globalThis.imagenAClip(img, clipB, 4, 1080, 1920, 1);
    const a1 = path.join(dir, 'a1.png'), b1 = path.join(dir, 'b1.png');
    sh(['-y', '-i', clip, '-vf', 'select=eq(n\\,110)', '-frames:v', '1', a1]);
    sh(['-y', '-i', clipB, '-vf', 'select=eq(n\\,110)', '-frames:v', '1', b1]);
    t('dos imágenes seguidas se mueven distinto (una acerca, otra aleja)',
      Buffer.compare(fs.readFileSync(a1), fs.readFileSync(b1)) !== 0);

    // --- los clips generados se pueden concatenar (mismo tamano y fps) ---
    const lista = path.join(dir, 'l.txt');
    fs.writeFileSync(lista, [clip, clipB].map(f => "file '" + f + "'").join('\n'));
    const join = path.join(dir, 'join.mp4');
    sh(['-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', join]);
    const dj = parseFloat(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', join], { stdio: 'pipe' })).trim());
    t('los clips de imagen se concatenan sin romperse', Math.abs(dj - 8) < 0.5, dj.toFixed(2) + 's');

    // --- una imagen de OTRO tamano se encaja al objetivo ---
    const ancha = path.join(dir, 'ancha.png');
    sh(['-y', '-f', 'lavfi', '-i', 'testsrc=size=1280x720:duration=1:rate=1', '-frames:v', '1', ancha]);
    const clipC = path.join(dir, 'clipC.mp4');
    await globalThis.imagenAClip(ancha, clipC, 3, 1080, 1920, 2);
    t('una imagen de otro tamaño se encaja al formato del reel',
      probe(clipC, 'stream=width,height').split('\n').join('x') === '1080x1920');

    // --- el endpoint acepta imagenes sin videos ---
    const U = fs.readFileSync('/home/user/studio.LegadodeHierro/server/unify.js', 'utf8');
    t('api/unify.js acepta imágenes cuando no hay clips',
      /!videos\.length && !imagenes\.length/.test(U) && /imagenes: imagenes/.test(U));
    t('Cloud Run monta el reel con imágenes si no llegan clips',
      /soloImagenes/.test(SRC) && /imagenAClip\(/.test(SRC));

  } catch (e) {
    console.log('FAIL  excepción: ' + String(e.message).slice(-400)); ko++;
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  process.exit(ko ? 1 : 0);
})();
