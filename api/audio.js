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

  // Divide el texto en dos mitades por un punto cercano al centro (sin cortar frases)
  function splitInHalf(t) {
    const clean = t.trim();
    if (clean.length < 400) return [clean]; // corto: una sola llamada
    const mid = Math.floor(clean.length / 2);
    // Busca el punto mas cercano al centro
    let best = -1, bestDist = Infinity;
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '.') {
        const dist = Math.abs(i - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
    }
    if (best === -1) return [clean]; // sin puntos: una sola llamada
    const first = clean.slice(0, best + 1).trim();
    const second = clean.slice(best + 1).trim();
    if (!first || !second) return [clean];
    return [first, second];
  }

  // Llama a ElevenLabs para un fragmento, con contexto opcional para continuidad de voz
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
    const parts = splitInHalf(text);

    // Caso simple: una sola llamada (texto corto)
    if (parts.length === 1) {
      const data = await generatePart(parts[0], '', '');
      return res.json({
        success: true,
        audio: data.audio_base64,
        alignment: data.alignment || null
      });
    }

    // Dos llamadas con contexto cruzado para que la voz suene continua
    const first = await generatePart(parts[0], '', parts[1]);
    const second = await generatePart(parts[1], parts[0], '');

    // Concatena los dos MP3
    const buf1 = Buffer.from(first.audio_base64, 'base64');
    const buf2 = Buffer.from(second.audio_base64, 'base64');
    const combinedAudio = Buffer.concat([buf1, buf2]).toString('base64');

    // Combina los timestamps: a la segunda mitad se le suma la duracion de la primera
    let alignment = null;
    const a1 = first.alignment;
    const a2 = second.alignment;
    if (a1 && a1.characters && a2 && a2.characters) {
      // Duracion de la primera mitad = ultimo tiempo de fin de su alignment
      const ends1 = a1.character_end_times_seconds || [];
      const offset = ends1.length ? ends1[ends1.length - 1] : 0;

      const characters = a1.characters.concat([' '], a2.characters);
      const starts = (a1.character_start_times_seconds || [])
        .concat([offset], (a2.character_start_times_seconds || []).map(function(t){ return t + offset; }));
      const ends = (a1.character_end_times_seconds || [])
        .concat([offset], (a2.character_end_times_seconds || []).map(function(t){ return t + offset; }));

      alignment = {
        characters: characters,
        character_start_times_seconds: starts,
        character_end_times_seconds: ends
      };
    } else {
      alignment = a1 || a2 || null;
    }

    return res.json({
      success: true,
      audio: combinedAudio,
      alignment: alignment
    });

  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message });
  }
};
