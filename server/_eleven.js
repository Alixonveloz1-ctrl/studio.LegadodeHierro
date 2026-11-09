// api/_eleven.js — Narracion con ELEVENLABS (la voz original del canal, Adam).
// Se mantiene como MOTOR SELECCIONABLE junto a Gemini-TTS: el usuario elige cual
// usar segun los creditos que tenga. El archivo empieza por "_" para que Vercel
// no lo publique como ruta propia.
//
// Devuelve { parts: [mp3 en base64], alignments: [...] }. Los alignments traen
// tiempos por caracter, que dan subtitulos exactos (Gemini-TTS no los da).

function clamp(v, lo, hi, def) {
  const n = Number(v);
  if (!isFinite(n)) return def;
  return Math.min(hi, Math.max(lo, n));
}

// Velocidad de habla estimada en espanol (locucion natural): ~2.5 palabras/segundo.
const WORDS_PER_SECOND = 2.5;
const TARGET_SECONDS_PER_BLOCK = 40;
// Objetivo ~38s y TOPE DURO ~42s: ningun bloque puede pasar de ~40s reales,
// porque ElevenLabs pierde calidad (volumen/velocidad) en generaciones largas.
const TARGET_WORDS = Math.round((TARGET_SECONDS_PER_BLOCK - 2) * WORDS_PER_SECOND); // ~95
const MAX_WORDS = Math.round((TARGET_SECONDS_PER_BLOCK + 2) * WORDS_PER_SECOND);    // ~105

// Divide el texto en bloques de <= ~40s, cortando al final de una oracion cerca
// del objetivo; si una oracion es demasiado larga, corta en la ultima coma.
function splitByDuration(t) {
  const clean = t.replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(Boolean);
  if (words.length <= MAX_WORDS) return [clean];

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

// Genera la narracion completa. Lanza Error con .status si ElevenLabs falla.
async function generarEleven(text, vIn, options) {
  options = options || {};
  const EL_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'IRHApOXLvnW57QJPQH2P';
  if (!EL_KEY) {
    const e = new Error('ELEVENLABS_API_KEY no configurada');
    e.status = 500; throw e;
  }

  const v = vIn || {};
  // Modelo elegido en el panel de voz (VOX.eleven.model, viaja en la config
  // del trabajo de audio). Se valida contra la lista permitida; cualquier
  // valor desconocido cae al modelo de siempre.
  const MODEL_ID = ELEVEN_MODELS.includes(v.model) ? v.model : 'eleven_multilingual_v2';
  // Eleven v4 SOLO acepta stability y similarity_boost en voice_settings:
  // enviarle style o speed hace que la API rechace la peticion.
  const VOICE_SETTINGS = MODEL_ID === 'eleven_v4'
    ? {
        stability:        clamp(v.stability,        0, 1, 0.5),
        similarity_boost: clamp(v.similarity_boost, 0, 1, 0.75),
      }
    : {
        stability:        clamp(v.stability,        0,   1,   0.5),
        similarity_boost: clamp(v.similarity_boost, 0,   1,   0.75),
        style:            clamp(v.style,            0,   1,   0),
        speed:            clamp(v.speed,            0.7, 1.2, 1),
        use_speaker_boost: v.use_speaker_boost === false ? false : true,
      };

  async function generatePart(partText, prevText, nextText) {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID + '/with-timestamps';
    const body = {
      text: partText,
      model_id: MODEL_ID,
      voice_settings: VOICE_SETTINGS,
    };
    if (prevText) body.previous_text = prevText;
    if (nextText) body.next_text = nextText;

    const r = await fetch(url, {
      method: 'POST', signal: options.signal || AbortSignal.timeout(40000),
      headers: {
        'xi-api-key': EL_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      } catch (e) {}
      const err = new Error(errMsg);
      err.status = r.status;
      throw err;
    }
    return await r.json();
  }

  const parts = splitByDuration(text);
  const audioParts = [];
  const alignParts = [];
  for (let i = 0; i < parts.length; i++) {
    const prevText = i > 0 ? parts[i - 1] : (options.previousText || '');
    const nextText = i < parts.length - 1 ? parts[i + 1] : (options.nextText || '');
    const data = await generatePart(parts[i], prevText, nextText);
    audioParts.push(data.audio_base64);
    alignParts.push(data.alignment || null);
  }
  return { parts: audioParts, alignments: alignParts, format: 'mp3' };
}

// Modelos de ElevenLabs que el panel de voz puede elegir. v4 existe desde
// 2026-09-28 (eleven_v4). NO se incluye eleven_v4_turbo: alcance cerrado.
const ELEVEN_MODELS = ['eleven_v4', 'eleven_v3', 'eleven_multilingual_v2', 'eleven_flash_v2_5'];

module.exports = { generarEleven, splitByDuration, ELEVEN_MODELS };
