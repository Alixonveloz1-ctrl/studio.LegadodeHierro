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

  // Ajustes de voz enviados desde la UI. Se validan y se acotan a los rangos
  // reales de ElevenLabs: fuera de rango la API rechaza o degrada el audio.
  function clamp(v, lo, hi, def) {
    const n = Number(v);
    if (!isFinite(n)) return def;
    return Math.min(hi, Math.max(lo, n));
  }
  const vIn = (req.body && req.body.voice) || {};
  const VOICE_SETTINGS = {
    stability:        clamp(vIn.stability,        0,   1,   0.5),
    similarity_boost: clamp(vIn.similarity_boost, 0,   1,   0.75),
    style:            clamp(vIn.style,            0,   1,   0),
    speed:            clamp(vIn.speed,            0.7, 1.2, 1),
    use_speaker_boost: vIn.use_speaker_boost === false ? false : true,
  };

  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'IRHApOXLvnW57QJPQH2P';
  if (!EL_KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY no configurada' });

  // Velocidad de habla estimada en espanol (locucion natural): ~2.5 palabras/segundo.
  const WORDS_PER_SECOND = 2.5;
  const TARGET_SECONDS_PER_BLOCK = 40;
  // Objetivo ~38s y TOPE DURO ~42s: ningun bloque puede pasar de ~40s reales,
  // porque ElevenLabs pierde calidad (volumen/velocidad) en generaciones largas.
  const TARGET_WORDS = Math.round((TARGET_SECONDS_PER_BLOCK - 2) * WORDS_PER_SECOND); // ~95
  const MAX_WORDS = Math.round((TARGET_SECONDS_PER_BLOCK + 2) * WORDS_PER_SECOND);    // ~105

  // Divide el texto en bloques de <= ~40s. Corta preferentemente al final de una
  // oracion cerca del objetivo; si una oracion es demasiado larga, corta en la
  // ultima coma; si no hay coma, corta por palabra en el tope. La ultima llamada
  // se queda con la diferencia. REGLA FIJA: nunca una sola llamada larga.
  function splitByDuration(t) {
    const clean = t.replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').filter(Boolean);
    if (words.length <= MAX_WORDS) return [clean]; // suficientemente corto: una sola llamada

    const blocks = [];
    let cur = [];
    for (let i = 0; i < words.length; i++) {
      cur.push(words[i]);
      const endsSentence = /[.!?…]["')]?$/.test(words[i]);
      if (cur.length >= TARGET_WORDS && endsSentence) {
        blocks.push(cur.join(' ')); cur = [];
        continue;
      }
      if (cur.length >= MAX_WORDS) {
        // Oracion demasiado larga: forzar corte en la ultima coma/;/: dentro del bloque
        let cut = -1;
        for (let j = cur.length - 1; j >= Math.floor(TARGET_WORDS * 0.5); j--) {
          if (/[,;:]$/.test(cur[j])) { cut = j; break; }
        }
        if (cut > 0) {
          blocks.push(cur.slice(0, cut + 1).join(' '));
          cur = cur.slice(cut + 1);
        } else {
          blocks.push(cur.join(' '));
          cur = [];
        }
      }
    }
    if (cur.length) blocks.push(cur.join(' '));
    return blocks.length ? blocks : [clean];
  }

  async function generatePart(partText, prevText, nextText) {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID + '/with-timestamps';
    const body = {
      text: partText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: VOICE_SETTINGS
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
