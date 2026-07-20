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
const DEFAULT_STYLE = 'Epic dark cinematic motivational instrumental, powerful hybrid orchestral with modern driving percussion, deep braams and strings, building intensity, inspiring and intense';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
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

    // Lyria SOLO acepta ingles. La descripcion se escribe en español en la
    // herramienta y aqui se traduce sola con Gemini antes de componer.
    let prompt = DEFAULT_STYLE;
    if (style) {
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
              'Translate this music style description into a short English prompt for a music generation AI. ' +
              'If it is already in English, return it unchanged. Reply with ONLY the English description, no quotes, no extra text:\n\n' + style
            }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.2, thinkingConfig: { thinkingLevel: 'LOW' } },
          }),
        });
        const td = await tr.json();
        const parts = td && td.candidates && td.candidates[0] && td.candidates[0].content && td.candidates[0].content.parts;
        let translated = '';
        if (parts) for (const p of parts) if (p && typeof p.text === 'string') translated += p.text;
        translated = translated.trim().replace(/^["']|["']$/g, '');
        if (tr.ok && translated && translated.length > 2) {
          prompt = translated.slice(0, 300) + ', instrumental background music, no vocals';
          console.log('[music-gen] estilo traducido: "' + style + '" -> "' + translated.slice(0, 120) + '"');
        } else {
          console.warn('[music-gen] traduccion fallo, se usa el estilo por defecto');
        }
      } catch (e) {
        console.warn('[music-gen] traduccion fallo (' + e.message + '), se usa el estilo por defecto');
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
          negative_prompt: 'vocals, singing, spoken word, voice, choir with lyrics',
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
