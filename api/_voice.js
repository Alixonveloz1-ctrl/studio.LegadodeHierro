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

const {token, failure} = require('./_store');
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


async function generateAudioChunk(text, engine, voice, lang, options) {
  options = options || {};
  const signal = options.signal || AbortSignal.timeout(40000);
  if (!text || text.trim().split(/\s+/).length > 80 || Buffer.byteLength(text,'utf8') > 3200) throw failure('La narración debe enviarse por tramos de hasta 80 palabras.',400);
  if (engine === 'eleven') return {...await generarEleven(text,voice,{...options,signal}),engine};
  const access = await token(signal);
  if (engine === 'chirp') return {...await generarChirp(text,voice,lang,access,signal),engine};
  if (engine !== 'gemini') throw failure('Motor de voz desconocido.',400);
  const v = voice || {}, voz = VOICE_SET[String(v.voz || '').toLowerCase()] || DEFAULT_VOICE;
  const model = ALLOWED_MODELS[v.model] ? v.model : DEFAULT_MODEL;
  if (!process.env.GCP_PROJECT_ID) throw failure('GCP_PROJECT_ID no configurado.');
  const url = 'https://aiplatform.googleapis.com/v1/projects/'+process.env.GCP_PROJECT_ID+'/locations/global/publishers/google/models/'+model+':generateContent';
  const r = await fetch(url,{method:'POST',signal,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({
    contents:[{role:'user',parts:[{text:construirInstruccion(v)+text}]}],
    generationConfig:{responseModalities:['AUDIO'],speechConfig:{languageCode:lang === 'en' ? 'en-US':'es-US',voiceConfig:{prebuiltVoiceConfig:{voiceName:voz}}}}
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
