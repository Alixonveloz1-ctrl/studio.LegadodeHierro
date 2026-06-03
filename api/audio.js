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

  const text = req.body && req.body.text ? req.body.text : null;
  if (!text) return res.status(400).json({ error: 'Texto requerido' });

  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'IRHApOXLvnW57QJPQH2P';
  if (!EL_KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY no configurada' });

  try {
    // Use with-timestamps endpoint to get word-level timing for SRT
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID + '/with-timestamps';
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': EL_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      let errMsg = 'Error ' + r.status;
      try {
        const errJson = JSON.parse(errText);
        if (errJson && errJson.detail && errJson.detail.message) errMsg = errJson.detail.message;
        else if (errJson && errJson.message) errMsg = errJson.message;
      } catch(e) {}
      return res.status(r.status).json({ error: errMsg });
    }

    // Response is JSON with audio_base64 and alignment (character-level timestamps)
    const data = await r.json();

    return res.json({
      success: true,
      audio: data.audio_base64,
      alignment: data.alignment || null
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
