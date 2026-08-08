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

  // El texto y el motivo de corte, en un solo sitio: hacen falta en el bucle de
  // reintentos y otra vez al construir la respuesta.
  const textoDe = (d) => {
    const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content
      && d.candidates[0].content.parts;
    if (!parts) return null;
    let t = null;
    for (const p of parts) if (p && typeof p.text === 'string' && p.text.trim()) t = (t ? t + '\n' : '') + p.text;
    return t;
  };
  const finishDe = (d) => (d && d.candidates && d.candidates[0] ? d.candidates[0].finishReason : '') || '';

  const SYSTEM_TEXT = 'Eres un asistente de guiones. Responde SIEMPRE en texto plano sin markdown, sin **, sin ##, sin encabezados, sin listas con guiones. Usa exactamente el formato de bloques que se te indica en el prompt.';

  try {
    const token = await getGCPToken();
    let r, d, lastErr = 'Error desconocido';

    // Reintentos sobre EL MISMO modelo (nunca se cambia de modelo).
    //
    // CON RELOJ. La funcion de Vercel se corta a los 60 s, asi que reintentar a
    // ciegas puede acabar peor que no reintentar: tres intentos de 25 s se pasan
    // del limite y el navegador recibe un 504 con HTML en vez de un error legible.
    // No se empieza un intento nuevo si no queda margen para terminarlo.
    const t0ms = Date.now();
    const MARGEN_MS = 42000;   // hasta aqui se puede empezar otro intento
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0 && Date.now() - t0ms > MARGEN_MS) {
        console.warn('Sin margen para el intento ' + (attempt + 1) + ': se devuelve lo que haya.');
        break;
      }
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
              // 8192 se quedaba corto en los modos largos. Un video de Profesor de
              // 3 minutos son 450 palabras en espanol MAS 450 en ingles, mas el
              // set, las 5 tomas, los 3 ejemplos y el montaje; y encima el modelo
              // gasta tokens de salida en pensar antes de escribir. Cuando se pasa
              // del tope, la respuesta llega cortada y sin BLOQUE A, que es el
              // "No se pudo leer el guion ES" que se veia en pantalla.
              maxOutputTokens: 32768,
              temperature: 1.0,
              // LOW en vez de HIGH (default): esta tarea es escritura directa con
              // formato estricto, no razonamiento profundo. HIGH puede consumir
              // tantos tokens "pensando" que corta el guion antes de BLOQUE A/C/F.
              thinkingConfig: { thinkingLevel: 'LOW' },
            },
          }),
        });
        d = await r.json();
        if (r.ok) {
          // NO BASTA CON QUE RESPONDA 200. Si el texto llega cortado o sin los
          // bloques, es igual de inservible que un error — y hasta ahora se daba
          // por bueno y se mandaba al navegador, que era quien acababa diciendo
          // "no se pudo leer el guion". Se comprueba aqui y se reintenta.
          const t0 = textoDe(d);
          const fr0 = finishDe(d);
          if (t0 && /^[\s*#]*BLOQUE\s+A/mi.test(t0)) break;
          lastErr = !t0
            ? ('el modelo no devolvio texto' + (fr0 ? ' (' + fr0 + ')' : ''))
            : (fr0 === 'MAX_TOKENS'
              ? 'la respuesta se corto por longitud (MAX_TOKENS)'
              : 'la respuesta no trae BLOQUE A' + (fr0 ? ' (' + fr0 + ')' : ''));
          console.warn('Intento ' + (attempt + 1) + ' inservible: ' + lastErr
            + ' — empieza por: ' + String(t0 || '').slice(0, 120));
          if (attempt < 2) { await new Promise(rs => setTimeout(rs, 1500)); continue; }
          break;
        }
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

    const text = textoDe(d);
    const fr = finishDe(d);

    if (!text || !text.trim()) {
      console.error('Sin texto' + (fr ? ' (' + fr + ')' : '') + '. Respuesta: ' + JSON.stringify(d).slice(0, 500));
      return res.status(502).json({ error: 'Gemini 3.1 Pro no devolvio texto' + (fr ? ' (' + fr + ')' : '') + '.' });
    }

    console.log('Texto generado con ' + MODEL + ' (' + text.length + ' caracteres, ' + (fr || 'STOP') + ')');
    // finishReason y tamano viajan al navegador: si luego no se puede leer el
    // guion, el aviso puede decir POR QUE en vez de "intenta de nuevo".
    return res.json({ success: true, text: text, model: MODEL, finishReason: fr, chars: text.length });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
