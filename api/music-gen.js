// api/music-gen.js
// GENERADOR DE MUSICA CON IA — Lyria (Google) via Vertex AI, en el mismo
// proyecto y con el mismo credito que todo lo demas.
// Compone ~30 segundos instrumentales segun el estilo pedido, y la pista se
// guarda DIRECTO en la biblioteca del bucket (musica/), lista para elegirse
// en la unificacion (alli se repite en bucle si el video es mas largo).

const MODEL = 'lyria-002';

const { createSign } = require('crypto');

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header  = encode({ alg: 'RS256', typ: 'JWT' });
  const payload = encode({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  });
  const sigInput = header + '.' + payload;
  const sign = createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(sa.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = sigInput + '.' + sig;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token error: ' + JSON.stringify(data));
  return data.access_token;
}

// Estilo por defecto, en linea con la marca: epico, oscuro, motivacional.
const DEFAULT_STYLE = 'Epic dark cinematic motivational instrumental, powerful hybrid orchestral with real strings, brass and modern driving percussion, deep and intense, building energy, high quality studio recording, inspiring';

// ESTILOS AFINADOS (botones en la herramienta): descripciones profesionales ya
// probadas, en ingles, con instrumentos REALES — sin depender de la traduccion.
const PRESETS = {
  piano:    'Emotional nostalgic solo piano with soft warm string pads, slow tempo around 70 BPM, intimate and reflective, cinematic motivational background music, gentle dynamics, warm and heartfelt, high quality studio recording of a real grand piano',
  cuerdas:  'Inspiring cinematic strings and expressive solo violin over soft piano chords, emotional gradual build, hopeful and uplifting orchestral background music, slow to moderate tempo, warm concert hall reverb, real orchestra recording',
  ambiente: 'Soft ambient atmospheric pads with sparse gentle piano notes, calm nostalgic dreamy mood, minimalist and warm, very smooth quiet background music, slow evolving textures, emotional and reflective',
  epica:    DEFAULT_STYLE,
};

// Lo que NUNCA debe sonar: voces ni sonido de videojuego retro (chiptune/8-bit).
const NEGATIVE = 'vocals, singing, voice, spoken word, 8-bit, chiptune, video game music, arcade sounds, retro console, bleeps and bloops, cheap MIDI, lo-fi bitcrushed, low quality';

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

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  if (!PROJECT_ID) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
  const bucketEnv = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  if (!bucketEnv) return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  const bucket = bucketEnv.replace('gs://', '').replace(/\/.*$/, '');

  const style = (req.body.style || '').trim().slice(0, 300);

  const url = 'https://us-central1-aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
    '/locations/us-central1/publishers/google/models/' + MODEL + ':predict';

  try {
    const token = await getGCPToken();

    // Prioridad 1: un estilo afinado elegido con boton (ya viene perfecto).
    // Prioridad 2: descripcion libre en español -> Gemini la convierte en una
    //   ficha musical PROFESIONAL en ingles (instrumentos reales, tempo, animo),
    //   con prohibicion explicita de sonido de videojuego (el problema del
    //   "sonido Atari" venia de descripciones cortas mal interpretadas).
    // Prioridad 3: sin nada -> estilo epico del canal.
    const preset = req.body.preset && PRESETS[req.body.preset] ? PRESETS[req.body.preset] : null;
    let prompt = preset || DEFAULT_STYLE;
    if (!preset && style) {
      try {
        const tr = await fetch('https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
          '/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Goog-User-Project': PROJECT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text:
              'You are a music prompt engineer for an AI music generator (Lyria). Convert this Spanish (or any language) music idea into ONE detailed English prompt of 30-50 words. ' +
              'Rules: name SPECIFIC REAL instruments (piano, violin, strings, cello, soft percussion...), the mood, an approximate tempo, and dynamics. It is BACKGROUND music for motivational videos: smooth, emotional, professional. ' +
              'NEVER describe chiptune, 8-bit, video game, arcade or synth-retro sounds unless the idea explicitly asks for them. Always end with: instrumental only, high quality studio recording, no vocals. ' +
              'Reply with ONLY the prompt, no quotes, no extra text.\n\nIdea: ' + style
            }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.4, thinkingConfig: { thinkingLevel: 'LOW' } },
          }),
        });
        const td = await tr.json();
        const parts = td && td.candidates && td.candidates[0] && td.candidates[0].content && td.candidates[0].content.parts;
        let engineered = '';
        if (parts) for (const p of parts) if (p && typeof p.text === 'string') engineered += p.text;
        engineered = engineered.trim().replace(/^["']|["']$/g, '');
        if (tr.ok && engineered && engineered.length > 10) {
          prompt = engineered.slice(0, 400);
          console.log('[music-gen] estilo convertido: "' + style + '" -> "' + prompt.slice(0, 150) + '"');
        } else {
          console.warn('[music-gen] conversion fallo, se usa el estilo por defecto');
        }
      } catch (e) {
        console.warn('[music-gen] conversion fallo (' + e.message + '), se usa el estilo por defecto');
      }
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-Goog-User-Project': PROJECT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt,
          negative_prompt: NEGATIVE,
        }],
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      const msg = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
      console.error('[music-gen] Lyria fallo: ' + msg);
      return res.status(502).json({ error: 'Lyria no respondio: ' + msg });
    }

    const pred = d.predictions && d.predictions[0] ? d.predictions[0] : null;
    const b64 = pred ? (pred.bytesBase64Encoded || pred.audioContent || null) : null;
    if (!b64) {
      console.error('[music-gen] sin audio. Respuesta: ' + JSON.stringify(d).slice(0, 300));
      return res.status(502).json({ error: 'Lyria no devolvio audio.' });
    }

    // Guardar la pista directo en la biblioteca del bucket (WAV).
    const buf = Buffer.from(b64, 'base64');
    let slug = (style || 'epica').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'epica';
    const stamp = new Date().toISOString().slice(5, 16).replace(/[-:T]/g, '');
    const name = 'ia-' + slug + '-' + stamp + '.wav';
    const object = 'musica/' + name;
    const up = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket +
      '/o?uploadType=media&name=' + encodeURIComponent(object), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'audio/wav' },
      body: buf,
    });
    const ud = await up.json();
    if (!up.ok) throw new Error('No se pudo guardar la pista: ' + ((ud.error && ud.error.message) || up.status));

    console.log('[music-gen] pista generada y guardada: ' + object + ' (' + buf.length + ' bytes)');
    return res.json({ success: true, object: object, name: name, model: MODEL });
  } catch (e) {
    console.error('[music-gen] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
