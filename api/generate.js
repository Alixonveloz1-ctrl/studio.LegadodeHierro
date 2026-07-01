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

  const prompt = req.body && req.body.prompt ? req.body.prompt : null;
  if (!prompt) return res.status(400).json({ error: 'Prompt requerido' });

  const ANT_KEY = process.env.ANTHROPIC_API_KEY;
  if (ANT_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANT_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }]
        }),
      });
      const d = await r.json();
      if (r.ok) {
        let text = null;
        if (d && d.content && Array.isArray(d.content)) {
          for (let i = 0; i < d.content.length; i++) {
            if (d.content[i].type === 'text') { text = d.content[i].text; break; }
          }
        }
        if (text) return res.json({ success: true, text: text });
      }
      console.warn('Anthropic error, trying Vertex:', r.status, d);
    } catch (e) {
      console.warn('Anthropic failed, trying Vertex:', e.message);
    }
  }

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'No hay API configurada' });
  }

  try {
    const PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';
    const token = await getGCPToken();
    const url = 'https://us-central1-aiplatform.googleapis.com/v1/projects/' + PROJECT_ID + '/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent';
    let r, d;
    for (let attempt = 0; attempt < 3; attempt++) {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'X-Goog-User-Project': PROJECT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: 'Eres un asistente de guiones. Responde SIEMPRE en texto plano sin markdown, sin **, sin ##, sin encabezados, sin listas con guiones. Usa exactamente el formato de bloques que se te indica en el prompt.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 3500, temperature: 0.9 },
        }),
      });
      d = await r.json();
      if (r.ok) break;
      console.warn('Vertex attempt ' + (attempt+1) + ' failed:', JSON.stringify(d).slice(0,150));
      if (attempt < 2) await new Promise(res => setTimeout(res, 2000));
    }
    if (!r.ok) {
      const errMsg = (d && d.error && d.error.message) ? d.error.message : ('Vertex Error ' + r.status);
      return res.status(r.status).json({ error: errMsg });
    }
    let text = null;
    if (d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0]) {
      text = d.candidates[0].content.parts[0].text;
    }
    if (!text) {
      console.error('Vertex empty text. Full response:', JSON.stringify(d).slice(0, 500));
      return res.status(500).json({ error: 'Sin respuesta de texto' });
    }
    // Log first 300 chars to verify format
    console.log('Vertex text preview:', text.slice(0, 300));
    return res.json({ success: true, text: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
