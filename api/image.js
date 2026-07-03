// api/generate.js
// Generador de TEXTO (guiones) — Gemini como generador UNICO via Vertex AI.
// Modelo principal: gemini-3.1-pro-preview (el mas potente disponible).
// IMPORTANTE: los modelos Gemini 3.x SOLO responden en el endpoint GLOBAL
// (https://aiplatform.googleapis.com/.../locations/global/...). En us-central1
// devuelven 404. Los modelos 2.5 si funcionan en global, por eso el fallback
// tambien usa global salvo el ultimo recurso 2.5-flash.

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

// Devuelve el endpoint correcto segun el modelo:
//  - Gemini 3.x  -> endpoint GLOBAL (obligatorio, si no da 404)
//  - Gemini 2.5  -> region us-central1
function endpointFor(model, projectId) {
  if (/^gemini-3/.test(model)) {
    return 'https://aiplatform.googleapis.com/v1/projects/' + projectId +
      '/locations/global/publishers/google/models/' + model + ':generateContent';
  }
  return 'https://us-central1-aiplatform.googleapis.com/v1/projects/' + projectId +
    '/locations/us-central1/publishers/google/models/' + model + ':generateContent';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
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

  const PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';

  // Cadena de modelos Gemini: principal + respaldos (todos Gemini).
  // Se puede sobreescribir el principal enviando { model } en el body.
  const requested = req.body && req.body.model ? String(req.body.model) : null;
  const MODELS = requested
    ? [requested, 'gemini-3.1-pro-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash']
    : ['gemini-3.1-pro-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
  // Quitar duplicados conservando orden
  const CHAIN = MODELS.filter((m, i) => MODELS.indexOf(m) === i);

  const SYSTEM_TEXT = 'Eres un asistente de guiones. Responde SIEMPRE en texto plano sin markdown, sin **, sin ##, sin encabezados, sin listas con guiones. Usa exactamente el formato de bloques que se te indica en el prompt.';

  try {
    const token = await getGCPToken();
    let lastErr = 'Error desconocido';

    for (let mi = 0; mi < CHAIN.length; mi++) {
      const model = CHAIN[mi];
      const url = endpointFor(model, PROJECT_ID);
      let r, d, ok = false;

      for (let attempt = 0; attempt < 2; attempt++) {
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
              // maxOutputTokens alto: los modelos Gemini 3 usan "thinking"
              // dinamico y ese razonamiento consume presupuesto de salida.
              generationConfig: { maxOutputTokens: 8192, temperature: 1.0 },
            }),
          });
          d = await r.json();
          if (r.ok) { ok = true; break; }
          lastErr = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
          // 404 = modelo no disponible en ese endpoint/proyecto -> pasar al siguiente modelo sin reintentar
          if (r.status === 404) break;
          if (attempt < 1) await new Promise(rs => setTimeout(rs, 1500));
        } catch (e) {
          lastErr = e.message;
          if (attempt < 1) await new Promise(rs => setTimeout(rs, 1500));
        }
      }

      if (!ok) {
        console.warn('Modelo ' + model + ' fallo: ' + String(lastErr).slice(0, 160));
        continue; // probar siguiente modelo de la cadena
      }

      // Extraer texto de la respuesta (puede haber varias parts)
      let text = null;
      if (d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
        const parts = d.candidates[0].content.parts;
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] && typeof parts[i].text === 'string' && parts[i].text.trim()) {
            text = (text ? text + '\n' : '') + parts[i].text;
          }
        }
      }
      if (text && text.trim()) {
        console.log('Texto generado con ' + model + ' (preview): ' + text.slice(0, 200));
        return res.json({ success: true, text: text, model: model });
      }

      // Respondio 200 pero sin texto (p.ej. MAX_TOKENS consumido por thinking) -> siguiente modelo
      const fr = d && d.candidates && d.candidates[0] ? d.candidates[0].finishReason : '';
      lastErr = 'Sin texto' + (fr ? ' (' + fr + ')' : '') + ' con ' + model;
      console.warn(lastErr + '. Respuesta: ' + JSON.stringify(d).slice(0, 300));
    }

    return res.status(502).json({ error: 'Gemini no devolvio texto. ' + lastErr });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
