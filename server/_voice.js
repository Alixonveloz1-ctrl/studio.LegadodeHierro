// api/audio.js
// NARRACION con DOS MOTORES a elegir desde la herramienta:
//   engine 'eleven' -> ElevenLabs, la voz original del canal (ver _eleven.js).
//   engine 'chirp'  -> Chirp 3 HD (Cloud TTS): locucion neutra, la que menos
//                      suena a anuncio. Credito de Google (ver _chirp.js).
//   engine 'gemini' -> Gemini 3.8 Flash TTS en Vertex AI: el modelo nuevo,
//                      el que mantiene el mismo tono de principio a fin.
// El usuario decide cual usar segun los creditos que tenga en cada sitio.
//
// COMO SE PIDE A GEMINI 3.8 TTS (lo que no es obvio):
//   - Se llama a :generateContent, como cualquier modelo Gemini, con
//     responseModalities ['AUDIO'] y speechConfig.voiceConfig.prebuiltVoiceConfig.
//   - Region SIEMPRE "global".
//   - La salida es PCM 16 bits, 24 kHz, MONO, y NO trae cabecera WAV: hay que
//     ponersela aqui o el navegador no puede reproducirlo.
//   - NO hay parametros numericos de tono/velocidad: el estilo viaja en el
//     campo estructurado speech_metadata.style de la parte de texto, NUNCA
//     dentro del texto que se lee en voz alta. Los estilos son LOS MISMOS de
//     su herramienta de audios (generador-audios/lib/styles.js), palabra por
//     palabra, para que la voz suene igual en las dos herramientas.
//
// Devuelve el MISMO formato que antes ({success, parts:[b64], alignments:[]}),
// para que la unificacion en Cloud Run y el reproductor sigan funcionando igual.

const {token, failure} = require('./_store');
const { generarEleven } = require('./_eleven');
const { generarChirp } = require('./_chirp');

const ALLOWED_MODELS = {
  'gemini-3.8-flash-tts': true,
};
const DEFAULT_MODEL = 'gemini-3.8-flash-tts';

// Las 30 voces de Gemini. Se validan aqui para no mandar nombres inventados.
const VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe',
  'Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda',
  'Orus','Puck','Pulcherrima','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel',
  'Vindemiatrix','Zephyr','Zubenelgenubi'];
const VOICE_SET = VOICES.reduce((a, v) => (a[v.toLowerCase()] = v, a), {});
// Voz predeterminada del motor Gemini, elegida por el usuario el 2026-11-11
// tras probar las voces en su herramienta de audios: Sadachbia, con estilo
// 'plano' (sin estilo, lectura tal cual).
const DEFAULT_VOICE = 'Sadachbia';

// ESTILOS de narracion: los MISMOS de su herramienta de audios
// (generador-audios/lib/styles.js), con la instruccion interna en ingles
// palabra por palabra, identica en cada tramo de una generacion. La UI manda
// el id del estilo en v.tono. 'plano' = sin instruccion (lectura tal cual).
const ESTILOS = {
  canal: 'Narrate in neutral Latin American Spanish exactly like a real person telling something to a friend: relaxed, warm, conversational and completely natural, at a calm everyday speaking pace. Follow the punctuation the way a person naturally does when speaking: flow smoothly through commas with barely a breath, rest only briefly at periods, and keep the sentences connected as one continuous, natural conversation. No exaggerated pauses, no theatrical silences, no choppy or robotic rhythm, and never pause where the punctuation does not ask for it. Give questions and important moments the natural emphasis a person gives them when telling something that matters, without overacting. Clean studio voice with no audible breathing sounds: no inhalation noise, no gasps between phrases. Keep exactly the same tone, timbre and volume from the beginning to the end.',
  serio: 'Narrate in a serious, deep documentary tone, in neutral Latin American Spanish. Slow, weighty and solemn delivery, with clear pauses and restrained emotion. Keep exactly the same steady pace, tone, timbre and volume from the beginning to the end.',
  emocionado: 'Narrate with joy and energy, in neutral Latin American Spanish. Bright, enthusiastic and lively delivery, with a smiling voice and dynamic emphasis, without shouting. Keep exactly the same steady pace, tone, timbre and volume from the beginning to the end.',
  misterioso: 'Narrate in a mysterious tone, in neutral Latin American Spanish. Slower pace, slightly lower volume, intriguing delivery with longer pauses that build suspense. Keep exactly the same tone, timbre, volume and pace from the beginning to the end.',
  calmado: 'Narrate in a calm, soft and soothing tone, in neutral Latin American Spanish. Gentle, relaxed delivery at a slow, even pace, ideal for falling asleep or for learning quietly. Keep exactly the same tone, timbre, volume and pace from the beginning to the end.',
  plano: '',
};

// Instruccion de estilo para Gemini 3.8: viaja en speech_metadata.style.
// v.extra (texto libre de la UI) se anade al final de la instruccion elegida.
function construirInstruccion(v) {
  const base = ESTILOS[v.tono] !== undefined ? ESTILOS[v.tono] : ESTILOS.canal;
  const extra = v.extra ? String(v.extra).slice(0, 200).trim() : '';
  if (base && extra) return base + ' ' + extra;
  return base || extra;
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


async function generateAudioChunk(text, engine, voice, lang, options) {
  options = options || {};
  const signal = options.signal || AbortSignal.timeout(40000);
  if (!text || text.trim().split(/\s+/).length > 80 || Buffer.byteLength(text,'utf8') > 3200) throw failure('La narración debe enviarse por tramos de hasta 80 palabras.',400);
  if (engine === 'eleven') return {...await generarEleven(text,voice,{...options,signal,lang}),engine};
  const access = await token(signal);
  if (engine === 'chirp') return {...await generarChirp(text,voice,lang,access,signal),engine};
  if (engine !== 'gemini') throw failure('Motor de voz desconocido.',400);
  const v = voice || {}, voz = VOICE_SET[String(v.voz || '').toLowerCase()] || DEFAULT_VOICE;
  const model = ALLOWED_MODELS[v.model] ? v.model : DEFAULT_MODEL;
  if (!process.env.GCP_PROJECT_ID) throw failure('GCP_PROJECT_ID no configurado.');
  const url = 'https://aiplatform.googleapis.com/v1/projects/'+process.env.GCP_PROJECT_ID+'/locations/global/publishers/google/models/'+model+':generateContent';
  const parteTexto = {text};
  const instruccion = construirInstruccion(v);
  if (instruccion) parteTexto.speech_metadata = {style: instruccion};
  const r = await fetch(url,{method:'POST',signal,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({
    contents:[{role:'user',parts:[parteTexto]}],
    generationConfig:{responseModalities:['AUDIO'],speechConfig:{languageCode:lang === 'en' ? 'en-US':'es-419',voiceConfig:{prebuiltVoiceConfig:{voiceName:voz}}}}
  })});
  const d = await r.json();
  if (!r.ok) throw failure((d.error && d.error.message) || 'No se pudo generar la voz.',r.status);
  const c = d.candidates && d.candidates[0];
  if (c && c.finishReason && c.finishReason !== 'STOP') throw failure('El audio llegó incompleto.',502);
  const ps = ((c && c.content && c.content.parts)||[]).map(p=>p.inlineData || p.inline_data).filter(p=>p && /^audio/.test(p.mimeType || p.mime_type || ''));
  if (!ps.length) throw failure('El proveedor no devolvió audio.',502);
  const pcm = Buffer.concat(ps.map(p=>Buffer.from(p.data,'base64')));
  const mime = ps[0].mimeType || ps[0].mime_type || '';
  const sr = Number((/rate=(\d+)/.exec(mime)||[])[1]) || 24000;
  const ch = Number((/channels=(\d+)/.exec(mime)||[])[1]) || 1;
  const wav = pcm.subarray(0,4).toString() === 'RIFF' ? pcm : pcmAWav(pcm,sr,ch);
  return {parts:[wav.toString('base64')],alignments:[null],format:'wav',engine,voice:voz,model};
}
module.exports = {generateAudioChunk,pcmAWav};
