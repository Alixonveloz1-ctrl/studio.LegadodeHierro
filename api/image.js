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

  const userPrompt = req.body && req.body.prompt ? req.body.prompt : null;
  const refImages = req.body && req.body.refImages ? req.body.refImages : [];
  if (!userPrompt) return res.status(400).json({ error: 'Prompt requerido' });

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }

  try {
    const PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';
    const token = await getGCPToken();
    const url = 'https://us-central1-aiplatform.googleapis.com/v1/projects/' + PROJECT_ID + '/locations/us-central1/publishers/google/models/gemini-2.5-flash-image:generateContent';

    const parts = [{ text: userPrompt }];

    // Detectar mimeType real del base64 y validar que sea imagen
    function detectMime(b64) {
      if (!b64 || typeof b64 !== 'string' || b64.length < 100) return null;
      if (b64.startsWith('/9j/')) return 'image/jpeg';
      if (b64.startsWith('iVBOR')) return 'image/png';
      if (b64.startsWith('R0lGOD')) return 'image/gif';
      if (b64.startsWith('UklGR')) return 'image/webp';
      if (b64.startsWith('AAAB')) return 'image/png';
      return null; // No es imagen válida — skip
    }

    // Agregar imágenes de referencia si existen y son válidas
    if (Array.isArray(refImages) && refImages.length > 0) {
      for (let i = 0; i < refImages.length; i++) {
        const mime = detectMime(refImages[i]);
        if (!mime) continue; // Skip si no es imagen válida
        parts.push({ inlineData: { mimeType: mime, data: refImages[i] } });
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(function() { controller.abort(); }, 55000);

    let r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'X-Goog-User-Project': PROJECT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: parts }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 1.0
          },
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const d = await r.json();
    if (!r.ok) {
      const errMsg = (d && d.error && d.error.message) ? d.error.message : ('Vertex Error ' + r.status);
      return res.status(r.status).json({ error: errMsg });
    }

    let imageB64 = null;
    if (d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) {
      const partsRes = d.candidates[0].content.parts;
      for (let i = 0; i < partsRes.length; i++) {
        if (partsRes[i].inlineData && partsRes[i].inlineData.data) {
          imageB64 = partsRes[i].inlineData.data;
          break;
        }
      }
    }
    if (!imageB64) {
      let reason = '';
      if (d && d.candidates && d.candidates[0]) {
        if (d.candidates[0].finishReason) reason = ' (' + d.candidates[0].finishReason + ')';
        if (d.candidates[0].content && d.candidates[0].content.parts) {
          const tp = d.candidates[0].content.parts.find(function(p){ return p.text; });
          if (tp) reason += ' ' + tp.text.slice(0, 80);
        }
      }
      return res.status(500).json({ error: 'Sin imagen generada' + reason });
    }
    return res.json({ success: true, image: imageB64 });
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Generacion tardó demasiado. Usa Regenerar.' : e.message;
    return res.status(500).json({ error: msg });
  }
};
