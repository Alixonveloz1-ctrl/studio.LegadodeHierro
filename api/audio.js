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

  // Velocidad de habla estimada en espanol (ritmo natural locucion): ~150 palabras/minuto = 2.5 palabras/segundo
  const WORDS_PER_SECOND = 2.5;
  const TARGET_SECONDS_PER_BLOCK = 40;
  const TARGET_WORDS_PER_BLOCK = TARGET_SECONDS_PER_BLOCK * WORDS_PER_SECOND; // ~100 palabras

  // Divide el texto en bloques de ~40 segundos de habla estimada, cortando siempre
  // en el punto (.) mas cercano al objetivo para no partir una oracion a la mitad.
  function splitByDuration(t) {
    const clean = t.trim();
    const totalWords = clean.split(/\s+/).filter(Boolean).length;
    if (totalWords <= TARGET_WORDS_PER_BLOCK) return [clean]; // corto: una sola llamada

    const sentenceEnds = [];
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '.') sentenceEnds.push(i);
    }
    if (sentenceEnds.length === 0) return [clean];

    const blocks = [];
    let wordsAccum = 0;
    let lastCut = 0;
    const words = clean.split(/\s+/);
    let charPos = 0;
    let target = TARGET_WORDS_PER_BLOCK;

    for (let wi = 0; wi < words.length; wi++) {
      charPos += words[wi].length + 1;
      wordsAccum++;
      if (wordsAccum >= target) {
        let best = -1, bestDist = Infinity;
        for (const sePos of sentenceEnds) {
          if (sePos <= lastCut) continue;
          const dist = Math.abs(sePos - charPos);
          if (dist < bestDist) { bestDist = dist; best = sePos; }
        }
        if (best !== -1 && best > lastCut) {
          const block = clean.slice(lastCut, best + 1).trim();
          if (block) blocks.push(block);
          lastCut = best + 1;
          wordsAccum = 0;
          target = TARGET_WORDS_PER_BLOCK;
        }
      }
    }
    const remainder = clean.slice(lastCut).trim();
    if (remainder) blocks.push(remainder);

    return blocks.length > 0 ? blocks : [clean];
  }

  async function generatePart(partText, prevText, nextText) {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID + '/with-timestamps';
    const body = {
      text: partText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };
    if (prevText) body.previous_text = prevText;
    if (nextText) body.next_text = nextText;

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': EL_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = await r.text();
      let errMsg = 'Error ' + r.status;
      try {
        const errJson = JSON.parse(errText);
        if (errJson && errJson.detail && errJson.detail.message) errMsg = errJson.detail.message;
        else if (errJson && errJson.message) errMsg = errJson.message;
      } catch(e) {}
      const err = new Error(errMsg);
      err.status = r.status;
      throw err;
    }

    return await r.json();
  }

  try {
    const parts = splitByDuration(text);

    if (parts.length === 1) {
      const data = await generatePart(parts[0], '', '');
      return res.json({
        success: true,
        parts: [ data.audio_base64 ],
        alignments: [ data.alignment || null ]
      });
    }

    const audioParts = [];
    const alignParts = [];
    for (let i = 0; i < parts.length; i++) {
      const prevText = i > 0 ? parts[i - 1] : '';
      const nextText = i < parts.length - 1 ? parts[i + 1] : '';
      const data = await generatePart(parts[i], prevText, nextText);
      audioParts.push(data.audio_base64);
      alignParts.push(data.alignment || null);
    }

    return res.json({
      success: true,
      parts: audioParts,
      alignments: alignParts
    });

  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
