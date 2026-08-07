// api/unify.js
// Punto 4 del plan: arranca la unificacion de video + audio en el servicio de
// Cloud Run (legado-unify). Este endpoint NO procesa nada: reenvia el trabajo y
// devuelve un jobId de inmediato; el frontend consulta /api/unify-status.
//
// Todo error del servicio pasa por aqui y se registra con console.error, para
// que quede visible en los registros de Vercel (el punto ciego de Cloud Run
// deja de importar: el error siempre se puede leer desde Vercel).
//
// Variables de entorno necesarias en Vercel:
//   CLOUD_RUN_UNIFY_URL  p.ej. https://legado-unify-xxxxx-uc.a.run.app
//   UNIFY_KEY            la misma clave secreta configurada en el servicio

const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch (e) {}
  }
  if (!req.body) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      req.body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) { req.body = {}; }
  }

  const videos = Array.isArray(req.body.videos) ? req.body.videos : [];
  const audioParts = Array.isArray(req.body.audioParts) ? req.body.audioParts : [];
  // Musica de fondo opcional: pista de la biblioteca (musica/...) + volumen (0-1).
  let music = null;
  if (req.body.music && typeof req.body.music.object === 'string') {
    const obj = req.body.music.object;
    if (obj.indexOf('musica/') === 0 && obj.indexOf('..') === -1 && obj.length < 200) {
      let vol = Number(req.body.music.volume);
      if (!isFinite(vol) || vol < 0 || vol > 1) vol = 0.18;
      music = { object: obj, volume: vol };
    }
  }

  // SUBTITULOS ya cronometrados (SRT). Se queman en el video en Cloud Run: en
  // Facebook la mayoria mira sin sonido, asi que sin texto en pantalla el reel se
  // pierde en los primeros segundos. Opcional: si no llega, el video sale igual.
  let srt = null;
  if (typeof req.body.srt === 'string' && req.body.srt.trim() && req.body.srt.length < 200000) {
    srt = req.body.srt;
  }
  // Duracion que se pretendia (30 o 60 s), para que el control de calidad avise
  // si el resultado se desvia.
  const targetSeconds = Number(req.body.targetSeconds) || 0;

  if (!videos.length) return res.status(400).json({ error: 'Faltan las URLs de los videos (videos[])' });
  if (videos.length > 10) return res.status(400).json({ error: 'Maximo 10 clips' });
  if (!audioParts.length) return res.status(400).json({ error: 'Falta el audio de la narracion (audioParts[])' });
  for (let i = 0; i < videos.length; i++) {
    if (typeof videos[i] !== 'string' || videos[i].indexOf('https://storage.googleapis.com/') !== 0) {
      return res.status(400).json({ error: 'URL de video invalida en la posicion ' + (i + 1) });
    }
  }

  const SERVICE_URL = process.env.CLOUD_RUN_UNIFY_URL;
  const UNIFY_KEY = process.env.UNIFY_KEY;
  if (!SERVICE_URL) {
    console.error('[unify] CLOUD_RUN_UNIFY_URL no configurado en Vercel');
    return res.status(500).json({ error: 'El servicio de unificacion aun no esta configurado (falta CLOUD_RUN_UNIFY_URL en Vercel).' });
  }
  if (!UNIFY_KEY) {
    console.error('[unify] UNIFY_KEY no configurado en Vercel');
    return res.status(500).json({ error: 'El servicio de unificacion aun no esta configurado (falta UNIFY_KEY en Vercel).' });
  }

  try {
    const r = await fetch(SERVICE_URL.replace(/\/+$/, '') + '/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Unify-Key': UNIFY_KEY,
      },
      body: JSON.stringify({
        videos: videos, audioParts: audioParts, music: music,
        srt: srt, targetSeconds: targetSeconds,
      }),
    });
    const text = await r.text();
    let d = {};
    try { d = JSON.parse(text); } catch (e) {}
    if (!r.ok || !d.jobId) {
      const msg = d.error || ('El servicio respondio ' + r.status + ': ' + text.slice(0, 300));
      console.error('[unify] fallo al iniciar: ' + msg);
      return res.status(502).json({ error: msg });
    }
    console.log('[unify] trabajo iniciado: ' + d.jobId + ' (' + videos.length + ' clips, ' + audioParts.length + ' partes de audio' + (music ? ', musica: ' + music.object + ' al ' + Math.round(music.volume * 100) + '%' : ', sin musica') + (srt ? ', con subtitulos' : ', sin subtitulos') + ')');
    return res.json({ success: true, jobId: d.jobId });
  } catch (e) {
    console.error('[unify] excepcion: ' + e.message);
    return res.status(500).json({ error: 'No se pudo contactar el servicio de unificacion: ' + e.message });
  }
};
