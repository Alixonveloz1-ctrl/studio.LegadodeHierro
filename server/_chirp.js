// api/_chirp.js — Narracion con CHIRP 3: HD (Cloud Text-to-Speech de Google).
//
// POR QUE EXISTE, ademas de Gemini-TTS: son DOS modelos distintos.
//   - Gemini-TTS "actua": se le dan instrucciones y interpreta, y por defecto
//     tira a lectura de anuncio.
//   - Chirp 3 HD es locucion pura: lee natural y neutro, sin dramatizar. En la
//     practica suena mucho menos a comercial, que es justo lo que pedia el canal.
//
// API distinta a la de Vertex: aqui se usa texttospeech.googleapis.com/v1.
// Requiere tener habilitada la API "Cloud Text-to-Speech" en el proyecto.
//
// Nombre de voz = <locale>-Chirp3-HD-<Voz>, p. ej. es-US-Chirp3-HD-Algenib.
// Chirp 3 HD admite speakingRate; NO admite pitch.

const VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe',
  'Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda',
  'Orus','Puck','Pulcherrima','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel',
  'Vindemiatrix','Zephyr','Zubenelgenubi'];
const VOICE_SET = VOICES.reduce((a, v) => (a[v.toLowerCase()] = v, a), {});
const DEFAULT_VOICE = 'Algenib';

function clamp(v, lo, hi, def) {
  const n = Number(v);
  if (!isFinite(n)) return def;
  return Math.min(hi, Math.max(lo, n));
}

// Cloud TTS con LINEAR16 devuelve WAV ya con cabecera; por si acaso se comprueba
// y se anade si faltara, para que el navegador y ffmpeg lo lean sin adivinar.
function asegurarWav(buf, rate) {
  if (buf.length > 4 && buf.slice(0, 4).toString('latin1') === 'RIFF') return buf;
  const bits = 16, ch = 1, sr = rate || 24000;
  const blockAlign = ch * bits / 8, byteRate = sr * blockAlign;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + buf.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20);
  h.writeUInt16LE(ch, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(byteRate, 28);
  h.writeUInt16LE(blockAlign, 32); h.writeUInt16LE(bits, 34);
  h.write('data', 36); h.writeUInt32LE(buf.length, 40);
  return Buffer.concat([h, buf]);
}

// Genera la narracion. Lanza Error con .status si Google falla.
async function generarChirp(text, vIn, lang, token, signal) {
  const v = vIn || {};
  const voz = VOICE_SET[String(v.voz || '').toLowerCase()] || DEFAULT_VOICE;
  const locale = lang === 'en' ? 'en-US' : 'es-US';
  const rate = clamp(v.velocidad, 0.7, 1.3, 0.95);

  const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST', signal: signal || AbortSignal.timeout(40000),
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: String(text) },
      voice: { languageCode: locale, name: locale + '-Chirp3-HD-' + voz },
      audioConfig: { audioEncoding: 'LINEAR16', speakingRate: rate, sampleRateHertz: 24000 },
    }),
  });

  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
    const e = new Error(msg);
    e.status = r.status;
    throw e;
  }
  if (!d.audioContent) {
    const e = new Error('Chirp 3 HD no devolvio audio');
    e.status = 502;
    throw e;
  }

  const buf = asegurarWav(Buffer.from(d.audioContent, 'base64'), 24000);
  return {
    parts: [buf.toString('base64')],
    alignments: [null],
    format: 'wav',
    voice: voz,
  };
}

module.exports = { generarChirp, VOICES };
