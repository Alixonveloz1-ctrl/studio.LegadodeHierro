// api/audio.js
// NARRACION con DOS MOTORES a elegir desde la herramienta:
//   engine 'eleven' -> ElevenLabs, la voz original del canal (ver _eleven.js).
//   engine 'chirp'  -> Chirp 3 HD (Cloud TTS): locucion neutra, la que menos
//                      suena a anuncio. Credito de Google (ver _chirp.js).
//   engine 'gemini' -> Gemini-TTS en Vertex AI: actua segun instrucciones.
// El usuario decide cual usar segun los creditos que tenga en cada sitio.
//
// COMO SE PIDE A GEMINI-TTS (lo que no es obvio):
//   - Se llama a :generateContent, como cualquier modelo Gemini, con
//     responseModalities ['AUDIO'] y speechConfig.voiceConfig.prebuiltVoiceConfig.
//   - Region SIEMPRE "global".
//   - La salida es PCM 16 bits, 24 kHz, MONO, y NO trae cabecera WAV: hay que
//     ponersela aqui o el navegador no puede reproducirlo.
//   - NO hay parametros numericos de tono/velocidad: el estilo se dirige con una
//     INSTRUCCION EN LENGUAJE NATURAL delante del texto ("Di lo siguiente con voz
//     grave y pausada: ..."). De ahi que la UI mande tono/velocidad/intensidad y
//     aqui se conviertan en esa frase.
//
// Devuelve el MISMO formato que antes ({success, parts:[b64], alignments:[]}),
// para que la unificacion en Cloud Run y el reproductor sigan funcionando igual.

const { checkAuth } = require('./_auth');
const { generarEleven } = require('./_eleven');
const { generarChirp } = require('./_chirp');

const ALLOWED_MODELS = {
  'gemini-2.5-flash-tts': true,
  'gemini-2.5-pro-tts': true,
  'gemini-2.5-flash-lite-preview-tts': true,
};
const DEFAULT_MODEL = 'gemini-2.5-flash-tts';

// Las 30 voces de Gemini. Se validan aqui para no mandar nombres inventados.
const VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe',
  'Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda',
  'Orus','Puck','Pulcherrima','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel',
  'Vindemiatrix','Zephyr','Zubenelgenubi'];
const VOICE_SET = VOICES.reduce((a, v) => (a[v.toLowerCase()] = v, a), {});
// Algenib es la mas rasposa y de pecho del catalogo: es la que menos suena a
// locutor de anuncio y la que mas se acerca a la voz grave del canal.
const DEFAULT_VOICE = 'Algenib';

// Piezas de la instruccion de estilo. Son frases, no numeros, porque asi es como
// Gemini-TTS acepta la direccion de actuacion.
const TONOS = {
  canal:     'con voz grave, madura y algo desgastada, en volumen bajo y contenido, como un hombre que le cuenta a otro una verdad que le costo aprender',
  autoridad: 'con voz grave, firme y de autoridad, como alguien que sabe de lo que habla',
  cercano:   'en tono cercano y directo, como si le hablaras a un amigo a los ojos',
  energico:  'con energia y empuje, transmitiendo urgencia y ganas, pero sin gritar',
  calmado:   'con calma y peso, sin prisa, dejando que cada frase asiente',
  duro:      'con dureza y contundencia, sin adornos, como quien dice una verdad incomoda',
  narrador:  'con voz de narrador de documental serio, grave y envolvente',
};

// ANTI-LOCUTOR (va SIEMPRE). Sin esto Gemini-TTS entrega una lectura de anuncio:
// entusiasta, con sonrisa en la voz y entonacion ascendente. Este canal necesita
// lo contrario — alguien hablandole a UNA persona, no vendiendole algo a muchas.
const NO_COMERCIAL = 'MUY IMPORTANTE: no suenes a locutor de comercial, ni a anuncio publicitario, ni a promocion de radio, ni a presentador de television. '
  + 'Nada de entusiasmo fingido, ni sonrisa en la voz, ni entonacion que sube al final de las frases, ni energia de vendedor. '
  + 'Habla como una persona real hablandole a OTRA persona, en corto, con voz de pecho, seria y natural, '
  + 'con pausas de verdad entre las frases y bajando el tono al final de cada una.';
const VELOCIDADES = {
  '0.80': 'muy despacio, marcando mucho cada palabra',
  '0.90': 'algo mas despacio de lo normal',
  '1.00': 'a un ritmo natural',
  '1.10': 'a buen ritmo, agil pero sin atropellarse',
  '1.20': 'rapido y sin pausas largas',
};
const INTENSIDADES = {
  baja:   'con emocion contenida, sobrio',
  media:  '',
  alta:   'con mucha carga emocional, que se note la conviccion',
};

function construirInstruccion(v) {
  const partes = [];
  const tono = TONOS[v.tono] || TONOS.canal;
  if (tono) partes.push(tono);
  const vel = VELOCIDADES[v.velocidad] || '';
  if (vel) partes.push(vel);
  const inten = INTENSIDADES[v.intensidad];
  if (inten) partes.push(inten);
  if (v.extra) partes.push(String(v.extra).slice(0, 200));
  return 'Lee el siguiente texto ' + partes.join(', ') + '.\n'
    + NO_COMERCIAL + '\n'
    + 'No leas estas instrucciones en voz alta, solo el texto que viene despues:\n\n';
}

// PCM crudo -> WAV. Gemini-TTS entrega PCM 16 bits mono a 24 kHz sin cabecera.
function pcmAWav(pcm, rate, canales) {
  const bits = 16, ch = canales || 1, sr = rate || 24000;
  const blockAlign = ch * bits / 8, byteRate = sr * blockAlign;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(byteRate, 28);
  h.writeUInt16LE(blockAlign, 32);
  h.writeUInt16LE(bits, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const { createSign } = require('crypto');
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT' });
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
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + sigInput + '.' + sig,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token error: ' + JSON.stringify(data));
  return data.access_token;
}

// Corta el guion en bloques por numero de palabras, respetando las frases. Los
// guiones del canal (75-160 palabras) caben de sobra en UN bloque; esto solo
// actua si algun dia se pide un texto mucho mas largo.
function partirTexto(texto, maxPalabras) {
  const limpio = String(texto).replace(/\s+/g, ' ').trim();
  if (limpio.split(' ').length <= maxPalabras) return [limpio];
  const frases = limpio.match(/[^.!?]+[.!?]*/g) || [limpio];
  const bloques = [];
  let actual = '';
  for (const f of frases) {
    const cand = actual ? actual + ' ' + f.trim() : f.trim();
    if (cand.split(' ').length > maxPalabras && actual) {
      bloques.push(actual.trim());
      actual = f.trim();
    } else {
      actual = cand;
    }
  }
  if (actual.trim()) bloques.push(actual.trim());
  return bloques;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;
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

  const text = req.body && req.body.text ? req.body.text : null;
  if (!text) return res.status(400).json({ error: 'Texto requerido' });

  // MOTOR ELEGIDO POR EL USUARIO. 'eleven' = la voz original del canal (Adam);
  // 'gemini' = las voces de Google, que gastan el credito de Google Cloud.
  if (req.body.engine === 'eleven') {
    try {
      const out = await generarEleven(text, (req.body && req.body.voice) || {});
      return res.json({ success: true, engine: 'eleven', ...out });
    } catch (e) {
      let msg = e.message;
      if (e.status === 401 || e.status === 403) {
        msg = 'ElevenLabs rechazo la peticion (' + e.status + '): ' + e.message +
              '. Revisa la clave ELEVENLABS_API_KEY y el saldo de tu cuenta.';
      } else if (e.status === 429) {
        msg = 'ElevenLabs: limite de uso alcanzado (429). ' + e.message;
      }
      console.error('[audio] ElevenLabs fallo: ' + msg);
      return res.status(e.status || 500).json({ error: msg, upstream: 'elevenlabs' });
    }
  }

  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  if (!PROJECT_ID) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }

  // CHIRP 3 HD: locucion neutra, no actuada. Es el motor que menos suena a
  // anuncio; usa otra API (texttospeech) pero el mismo credito de Google.
  if (req.body.engine === 'chirp') {
    try {
      const token = await getGCPToken();
      const out = await generarChirp(text, (req.body && req.body.voice) || {}, req.body.lang, token);
      return res.json({ success: true, engine: 'chirp', ...out });
    } catch (e) {
      let msg = e.message;
      if (e.status === 403 && /texttospeech|disabled|not enabled|SERVICE_DISABLED/i.test(msg)) {
        msg = 'Falta habilitar la API "Cloud Text-to-Speech" en tu proyecto de Google Cloud. ' + msg;
      }
      console.error('[audio] Chirp 3 HD fallo: ' + msg);
      return res.status(e.status || 500).json({ error: 'Chirp 3 HD: ' + msg, upstream: 'chirp' });
    }
  }

  const vIn = (req.body && req.body.voice) || {};
  const voz = VOICE_SET[String(vIn.voz || '').toLowerCase()] || DEFAULT_VOICE;
  let model = String(vIn.model || '');
  if (!ALLOWED_MODELS[model]) model = DEFAULT_MODEL;
  const idioma = req.body.lang === 'en' ? 'en-US' : 'es-US';
  const instruccion = construirInstruccion({
    tono: vIn.tono, velocidad: vIn.velocidad, intensidad: vIn.intensidad, extra: vIn.extra,
  });

  const url = 'https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
    '/locations/global/publishers/google/models/' + model + ':generateContent';

  try {
    const token = await getGCPToken();
    const bloques = partirTexto(text, 200);
    const parts = [];

    for (const bloque of bloques) {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'X-Goog-User-Project': PROJECT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: instruccion + bloque }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              languageCode: idioma,
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } },
            },
          },
        }),
      });

      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
        console.error('[audio] Gemini-TTS rechazo (' + r.status + '): ' + msg);
        return res.status(502).json({ error: 'Gemini-TTS no respondio: ' + msg, upstream: 'gemini-tts' });
      }

      // El audio llega como inlineData (PCM sin cabecera) en las partes.
      const cand = d.candidates && d.candidates[0];
      const ps = cand && cand.content && cand.content.parts ? cand.content.parts : [];
      let pcm = null, mime = '';
      for (const p of ps) {
        const inl = p.inlineData || p.inline_data;
        if (!inl || !inl.data) continue;
        const mt = inl.mimeType || inl.mime_type || '';
        if (mt.indexOf('audio') !== 0) continue;
        mime = mt;
        const buf = Buffer.from(inl.data, 'base64');
        pcm = pcm ? Buffer.concat([pcm, buf]) : buf;
      }
      if (!pcm) {
        const razon = (cand && cand.finishReason) ? cand.finishReason : 'sin audio';
        console.error('[audio] sin audio (' + razon + '): ' + JSON.stringify(d).slice(0, 300));
        return res.status(502).json({ error: 'Gemini-TTS no devolvio audio (' + razon + ')', upstream: 'gemini-tts' });
      }

      // Si ya viniera con cabecera RIFF se respeta; si no, se le pone.
      const esWav = pcm.length > 4 && pcm.slice(0, 4).toString('latin1') === 'RIFF';
      const rate = parseInt((/rate=(\d+)/.exec(mime) || [])[1], 10) || 24000;
      const canales = parseInt((/channels=(\d+)/.exec(mime) || [])[1], 10) || 1;
      parts.push((esWav ? pcm : pcmAWav(pcm, rate, canales)).toString('base64'));
    }

    // alignments va vacio: Gemini-TTS no entrega tiempos por caracter. Los
    // subtitulos caen solos al calculo estimado, que ya existia como respaldo.
    return res.json({
      success: true,
      engine: 'gemini',
      parts: parts,
      alignments: parts.map(() => null),
      format: 'wav',
      voice: voz,
      model: model,
    });
  } catch (e) {
    console.error('[audio] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
