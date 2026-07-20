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

async function processJob(jobId, videos, audioParts) {
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

    // 2. Unir las partes de audio en una sola pista AAC
    const audioFull = path.join(dir, 'narracion.m4a');
    if (partFiles.length === 1) {
      await run('ffmpeg', ['-y', '-i', partFiles[0], '-c:a', 'aac', '-b:a', '192k', audioFull]);
    } else {
      const inputs = [];
      partFiles.forEach(f => inputs.push('-i', f));
      const n = partFiles.length;
      const filterIn = partFiles.map((_, i) => '[' + i + ':a]').join('');
      await run('ffmpeg', ['-y'].concat(inputs, [
        '-filter_complex', filterIn + 'concat=n=' + n + ':v=0:a=1[a]',
        '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', audioFull,
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

    // 5. Reescalar cada clip (video sin audio propio: los generadores no producen audio)
    const scaled = [];
    for (let i = 0; i < clipFiles.length; i++) {
      const target = i === lastIdx ? lastTarget : targets[i];
      const f = clipDurs[i] / target; // setpts=PTS/f
      const out = path.join(dir, 'scaled' + i + '.mp4');
      await run('ffmpeg', ['-y', '-i', clipFiles[i],
        '-vf', 'setpts=PTS/' + f.toFixed(6),
        '-r', '30', '-an',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-pix_fmt', 'yuv420p', out,
      ]);
      scaled.push(out);
    }

    // 6. Concatenar en orden
    const listFile = path.join(dir, 'list.txt');
    fs.writeFileSync(listFile, scaled.map(f => "file '" + f + "'").join('\n'));
    const joined = path.join(dir, 'joined.mp4');
    await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', joined]);

    // 7. Pegar la narracion encima
    const finalFile = path.join(dir, 'final.mp4');
    await run('ffmpeg', ['-y', '-i', joined, '-i', audioFull,
      '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-c:a', 'copy',
      '-movflags', '+faststart', '-shortest', finalFile,
    ]);

    // 8. Subir el resultado y marcar el trabajo como terminado
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
    const jobId = 'job-' + crypto.randomBytes(10).toString('hex');
    // Responder YA y trabajar en segundo plano (requiere --no-cpu-throttling).
    res.end(JSON.stringify({ jobId: jobId }));
    processJob(jobId, videos, audioParts);
  });
});

server.listen(PORT, () => console.log('legado-unify escuchando en ' + PORT + ' (bucket: ' + BUCKET + ')'));
