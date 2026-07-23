// api/generate.js
// Generador de TEXTO (guiones) -- SOLO Gemini 3.1 Pro Preview via Vertex AI.
// SIN fallback a ningun otro modelo (ni 3-pro-preview, ni 2.5-flash, ni Anthropic).
// Si esta llamada falla, el error se devuelve tal cual -- nunca se degrada
// en silencio a un modelo distinto.
//
// IMPORTANTE: los modelos Gemini 3.x SOLO responden en el endpoint GLOBAL
// (https://aiplatform.googleapis.com/.../locations/global/...). En us-central1
// devuelven 404.

const MODEL = 'gemini-3.1-pro-preview';

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const { createSign } = require('crypto');
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

const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (typeof req.body === 'string') {
    try { req.body = JSON.parse(req.body); } catch(e) {}
  }
  if (!req.body) {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      req.body = JSON.parse(Buffer.concat(chunks).toString());
    } catch(e) { req.body = {}; }
  }

  const prompt = req.body && req.body.prompt ? req.body.prompt : null;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }

  // Sin nombres de respaldo: el proyecto SIEMPRE viene de la configuracion de Vercel.
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  if (!PROJECT_ID) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
  const url = 'https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
    '/locations/global/publishers/google/models/' + MODEL + ':generateContent';

  const SYSTEM_TEXT = 'Eres un asistente de guiones. Responde SIEMPRE en texto plano sin markdown, sin **, sin ##, sin encabezados, sin listas con guiones. Usa exactamente el formato de bloques que se te indica en el prompt.';

  try {
    const token = await getGCPToken();
    let r, d, lastErr = 'Error desconocido';

    // Reintentos sobre EL MISMO modelo (nunca se cambia de modelo).
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        r = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Goog-User-Project': PROJECT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_TEXT }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 1.0,
              // LOW en vez de HIGH (default): esta tarea es escritura directa con
              // formato estricto, no razonamiento profundo. HIGH puede consumir
              // tantos tokens "pensando" que corta el guion antes de BLOQUE A/C/F.
              thinkingConfig: { thinkingLevel: 'LOW' },
            },
          }),
        });
        d = await r.json();
        if (r.ok) break;
        lastErr = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
        console.warn('Intento ' + (attempt + 1) + ' fallo: ' + lastErr);
        if (attempt < 2) await new Promise(rs => setTimeout(rs, 1500));
      } catch (e) {
        lastErr = e.message;
        console.warn('Intento ' + (attempt + 1) + ' excepcion: ' + lastErr);
        if (attempt < 2) await new Promise(rs => setTimeout(rs, 1500));
      }
    }

    if (!r || !r.ok) {
      return res.status(502).json({ error: 'Gemini 3.1 Pro no respondio. ' + lastErr });
    }

    let text = null;
    if (d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
      const parts = d.candidates[0].content.parts;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] && typeof parts[i].text === 'string' && parts[i].text.trim()) {
          text = (text ? text + '\n' : '') + parts[i].text;
        }
      }
    }

    if (!text || !text.trim()) {
      const fr = d && d.candidates && d.candidates[0] ? d.candidates[0].finishReason : '';
      console.error('Sin texto' + (fr ? ' (' + fr + ')' : '') + '. Respuesta: ' + JSON.stringify(d).slice(0, 500));
      return res.status(502).json({ error: 'Gemini 3.1 Pro no devolvio texto' + (fr ? ' (' + fr + ')' : '') + '.' });
    }

    console.log('Texto generado con ' + MODEL + ': ' + text.slice(0, 200));
    return res.json({ success: true, text: text, model: MODEL });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
