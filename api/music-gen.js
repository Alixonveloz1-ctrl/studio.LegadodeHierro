// api/music-gen.js
// GENERADOR DE MUSICA CON IA — Lyria (Google) via Vertex AI, en el mismo
// proyecto y con el mismo credito que todo lo demas.
// La pista se guarda DIRECTO en la biblioteca del bucket (musica/), lista para
// elegirse en la unificacion.
//
// MODELO UNICO: lyria-3-pro-preview compone hasta 184 segundos (~3 min), asi la
// pista CUBRE el reel entero y en la unificacion solo hay que CORTARLA donde
// termina la voz — sin bucles ni costuras que se oigan. Sin respaldo a modelos
// de 30 s: si algo falla, se muestra el error real en vez de degradar en silencio.
//
// COMO SE LLAMA (lo que no es obvio): Lyria NO tiene endpoint propio ni usa
// :predict. Se pide igual que un modelo de imagen de Gemini — :generateContent
// con responseModalities ['AUDIO','TEXT'] — y SIEMPRE en la region "global".
// La duracion NO es un parametro: se pide en prosa dentro del propio prompt.
const MODEL = 'lyria-3-pro-preview';
const LOCATION = 'global';
// Duracion que se pide. El reel mas largo del canal es de 60 s, asi que con 80
// sobra margen: la musica cubre toda la narracion y la unificacion solo tiene
// que cortarla donde termina la voz. Pedir 3 minutos era desperdicio y ademas
// hacia que el modelo se quedara sin espacio de salida a mitad de la pieza.
const TARGET_SECONDS = 80;

const { createSign } = require('crypto');

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
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

// Estilo por defecto, en linea con la marca: epico, oscuro, motivacional.
const DEFAULT_STYLE = 'Epic dark cinematic motivational instrumental, powerful hybrid orchestral with real strings, brass and modern driving percussion, deep and intense, building energy, high quality studio recording, inspiring';

// ESTILOS AFINADOS (botones en la herramienta): descripciones profesionales ya
// probadas, en ingles, con instrumentos REALES — sin depender de la traduccion.
const PRESETS = {
  piano:    'Emotional nostalgic solo piano with soft warm string pads, slow tempo around 70 BPM, intimate and reflective, cinematic motivational background music, gentle dynamics, warm and heartfelt, high quality studio recording of a real grand piano',
  cuerdas:  'Inspiring cinematic strings and expressive solo violin over soft piano chords, emotional gradual build, hopeful and uplifting orchestral background music, slow to moderate tempo, warm concert hall reverb, real orchestra recording',
  ambiente: 'Soft ambient atmospheric pads with sparse gentle piano notes, calm nostalgic dreamy mood, minimalist and warm, very smooth quiet background music, slow evolving textures, emotional and reflective',
  epica:    DEFAULT_STYLE,
};

// SALVAGUARDA INSTRUMENTAL: Lyria es un modelo de CANCIONES y, si le das una
// descripcion en prosa sin mas, puede tomarla como letra y cantarla. La orden va
// en INGLES y se repite DELANTE y AL FINAL (el modelo pesa mas lo primero y lo
// ultimo que lee). Aqui no existe campo negative_prompt: todo va en el prompt.
const GUARDA = 'INSTRUMENTAL ONLY. No vocals. No singing. No choir. No lyrics. No spoken word. No human voice of any kind. This is a background score for a narrated film.';

// LA DURACION SE PIDE CON MARCAS DE TIEMPO. No existe ningun parametro de API
// para la duracion (ni maxOutputTokens, que Lyria rechaza): la forma documentada
// de controlar el largo y la estructura es escribir una linea de tiempo [MM:SS]
// dentro del prompt. Sin ella el modelo entrega ~30 segundos y se acabo.
function mmss(seg) {
  const m = Math.floor(seg / 60), s = Math.round(seg % 60);
  return '[' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ']';
}
function lineaDeTiempo(total) {
  return mmss(0) + ' Begin softly with the described instrumentation, establishing the mood. Low and mid register, gentle.\n'
    + mmss(total * 0.25) + ' The arrangement fills out and the main theme settles in, warm and steady.\n'
    + mmss(total * 0.55) + ' Main body: the theme develops with subtle variation, cinematic and confident, still leaving room for a narrator.\n'
    + mmss(total * 0.80) + ' The energy eases without stopping, moving toward resolution.\n'
    + mmss(total) + ' Final sustained chord, clean ending. The piece lasts the full ' + Math.round(total) + ' seconds.';
}

// Envuelve la descripcion de estilo con la salvaguarda, la linea de tiempo (que es
// como se pide la duracion) y las condiciones para que quepa una narracion.
function armarPrompt(estilo) {
  return GUARDA + '\n\n'
    + 'STYLE (this is a description, not lyrics): ' + estilo + '\n\n'
    + 'LENGTH AND STRUCTURE — follow this timeline exactly. Do NOT stop early and do NOT deliver a 30-second clip:\n'
    + lineaDeTiempo(TARGET_SECONDS) + '\n\n'
    + 'ESTRICTAMENTE INSTRUMENTAL: ni voces, ni coro, ni letra, ni palabras cantadas o habladas. '
    + 'El texto de arriba es una descripcion del ESTILO, nunca una letra para cantar. '
    + 'Encima de esta musica va la voz de un narrador, asi que deja sitio: registro medio y grave, '
    + 'sin agudos punzantes, dinamica contenida y sin silencios bruscos. '
    + 'Produccion limpia, estereo amplio, sin distorsion. '
    + 'Nada de sonido de videojuego retro (8-bit, chiptune, arcade) ni MIDI barato.\n\n'
    + GUARDA;
}

// El audio puede volver PARTIDO en varias partes inlineData dentro de la MISMA
// respuesta. Hay que concatenarlas; y si son WAV, cada trozo trae su cabecera
// RIFF de 44 bytes: se conserva la del primero y se quita en los demas, o el
// archivo sale corrupto (falla solo en piezas largas, que son las troceadas).
function juntarAudio(json) {
  const parts = json && json.candidates && json.candidates[0] &&
    json.candidates[0].content && json.candidates[0].content.parts;
  if (!parts) return null;
  const trozos = [];
  let mimeType = null, texto = '';
  for (const p of parts) {
    if (p && typeof p.text === 'string') texto += p.text;
    const inl = p.inlineData || p.inline_data;
    if (!inl || !inl.data) continue;
    const mt = inl.mimeType || inl.mime_type || '';
    if (mt.indexOf('image') === 0) continue; // descarta partes que no son audio
    if (!mimeType) mimeType = mt;
    let buf = Buffer.from(inl.data, 'base64');
    if (trozos.length && buf.length > 44 && buf.slice(0, 4).toString('latin1') === 'RIFF') {
      buf = buf.slice(44);
    }
    trozos.push(buf);
  }
  if (!trozos.length) return null;
  return {
    buf: trozos.length === 1 ? trozos[0] : Buffer.concat(trozos),
    mimeType: mimeType || 'audio/L16;codec=pcm;rate=24000',
    texto: texto.trim(),
    trozos: trozos.length,
  };
}

// Cabecera WAV para PCM CRUDO. Solo se usa cuando el audio es de verdad PCM.
function cabeceraWav(buf, mimeType) {
  const rate = parseInt((/rate=(\d+)/.exec(mimeType) || [])[1], 10) || 24000;
  const ch = parseInt((/channels=(\d+)/.exec(mimeType) || [])[1], 10) || 1;
  const bits = 16, blockAlign = ch * bits / 8, byteRate = rate * blockAlign;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + buf.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);          // PCM
  h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(byteRate, 28);
  h.writeUInt16LE(blockAlign, 32);
  h.writeUInt16LE(bits, 34);
  h.write('data', 36);
  h.writeUInt32LE(buf.length, 40);
  return Buffer.concat([h, buf]);
}

// Tras concatenar varios trozos WAV, la cabecera del primero sigue declarando el
// tamano de SU trozo. Se corrige al tamano real o los lectores estrictos (ffmpeg)
// solo leen el primer pedazo y la pista sale corta.
function corregirTamanoWav(buf) {
  if (buf.length < 44 || buf.slice(0, 4).toString('latin1') !== 'RIFF') return buf;
  const out = Buffer.from(buf);
  out.writeUInt32LE(out.length - 8, 4);
  if (out.slice(36, 40).toString('latin1') === 'data') out.writeUInt32LE(out.length - 44, 40);
  return out;
}

// Detecta el formato REAL por los bytes de cabecera (magic numbers) y NUNCA
// reinterpreta el contenido. Envolver audio comprimido (MP3/Opus) en una
// cabecera WAV que dice "PCM" es exactamente lo que produce ruido blanco, asi
// que solo se anade cabecera cuando el audio es PCM de verdad.
function prepararAudio(buf, mimeType) {
  const h4 = buf.slice(0, 4).toString('latin1');
  if (h4 === 'RIFF') return { buf: corregirTamanoWav(buf), ext: '.wav', tipo: 'audio/wav' };
  if (h4 === 'OggS') return { buf: buf, ext: '.ogg', tipo: 'audio/ogg' };
  if (h4 === 'fLaC') return { buf: buf, ext: '.flac', tipo: 'audio/flac' };
  if (buf.slice(4, 8).toString('latin1') === 'ftyp') return { buf: buf, ext: '.m4a', tipo: 'audio/mp4' };
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return { buf: buf, ext: '.webm', tipo: 'audio/webm' };
  }
  if (h4.slice(0, 3) === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) {
    return { buf: buf, ext: '.mp3', tipo: 'audio/mpeg' };
  }
  // Sin firma reconocible: solo se envuelve si el mimeType dice que es PCM.
  if (/l16|pcm|linear/i.test(mimeType || '')) {
    return { buf: cabeceraWav(buf, mimeType), ext: '.wav', tipo: 'audio/wav' };
  }
  // Formato desconocido: se guarda TAL CUAL (sin tocar un byte) con la extension
  // que sugiera el mimeType. Mejor un archivo intacto que uno reinterpretado mal.
  const sub = (/audio\/([a-z0-9.+-]+)/i.exec(mimeType || '') || [])[1] || 'bin';
  return { buf: buf, ext: '.' + sub.replace(/[^a-z0-9]/gi, ''), tipo: mimeType || 'application/octet-stream' };
}

const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const T_INICIO = Date.now(); // reloj para no pasarnos del limite de la funcion

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

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  if (!PROJECT_ID) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
  const bucketEnv = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  if (!bucketEnv) return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  const bucket = bucketEnv.replace('gs://', '').replace(/\/.*$/, '');

  const style = (req.body.style || '').trim().slice(0, 300);

  // Region "global": el host NO lleva prefijo de region. Metodo generateContent.
  const url = 'https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
    '/locations/' + LOCATION + '/publishers/google/models/' + MODEL + ':generateContent';

  try {
    const token = await getGCPToken();

    // Prioridad 1: un estilo afinado elegido con boton (ya viene perfecto).
    // Prioridad 2: descripcion libre en español -> Gemini la convierte en una
    //   ficha musical PROFESIONAL en ingles (instrumentos reales, tempo, animo),
    //   con prohibicion explicita de sonido de videojuego (el problema del
    //   "sonido Atari" venia de descripciones cortas mal interpretadas).
    // Prioridad 3: sin nada -> estilo epico del canal.
    const preset = req.body.preset && PRESETS[req.body.preset] ? PRESETS[req.body.preset] : null;
    let prompt = preset || DEFAULT_STYLE;
    if (!preset && style) {
      try {
        const tr = await fetch('https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
          '/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Goog-User-Project': PROJECT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text:
              'You are a music prompt engineer for an AI music generator (Lyria). Convert this Spanish (or any language) music idea into ONE detailed English prompt of 30-50 words. ' +
              'Rules: name SPECIFIC REAL instruments (piano, violin, strings, cello, soft percussion...), the mood, an approximate tempo, and dynamics. It is BACKGROUND music for motivational videos: smooth, emotional, professional. ' +
              'NEVER describe chiptune, 8-bit, video game, arcade or synth-retro sounds unless the idea explicitly asks for them. Always end with: instrumental only, high quality studio recording, no vocals. ' +
              'Reply with ONLY the prompt, no quotes, no extra text.\n\nIdea: ' + style
            }] }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.4, thinkingConfig: { thinkingLevel: 'LOW' } },
          }),
        });
        const td = await tr.json();
        const parts = td && td.candidates && td.candidates[0] && td.candidates[0].content && td.candidates[0].content.parts;
        let engineered = '';
        if (parts) for (const p of parts) if (p && typeof p.text === 'string') engineered += p.text;
        engineered = engineered.trim().replace(/^["']|["']$/g, '');
        if (tr.ok && engineered && engineered.length > 10) {
          prompt = engineered.slice(0, 400);
          console.log('[music-gen] estilo convertido: "' + style + '" -> "' + prompt.slice(0, 150) + '"');
        } else {
          console.warn('[music-gen] conversion fallo, se usa el estilo por defecto');
        }
      } catch (e) {
        console.warn('[music-gen] conversion fallo (' + e.message + '), se usa el estilo por defecto');
      }
    }
    // Presupuesto de tiempo desde el INICIO de la peticion (incluye la traduccion
    // del estilo): la funcion de Vercel se corta a los 60 s y no queremos que muera
    // sin dejar un mensaje claro.
    const presupuesto = Math.max(5000, 55000 - (Date.now() - T_INICIO));
    // UN intento contra Lyria. Devuelve el audio o el motivo exacto del fallo.
    // OJO: el unico campo valido aqui es responseModalities. Anadir maxOutputTokens
    // hace que Vertex responda "Request contains an invalid argument"; la duracion
    // NO se controla por configuracion sino con la linea de tiempo del prompt.
    async function intentar(ms) {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), ms);
      const genCfg = { responseModalities: ['AUDIO', 'TEXT'] };
      let r;
      try {
        r = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Goog-User-Project': PROJECT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: armarPrompt(prompt) }] }],
            generationConfig: genCfg,
          }),
          signal: ctrl.signal,
        });
      } catch (e) {
        return { err: e.name === 'AbortError'
          ? 'tardo mas de los ' + Math.round(ms / 1000) + ' s que permite la funcion'
          : e.message, aborto: e.name === 'AbortError' };
      } finally {
        clearTimeout(to);
      }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        return { err: (d && d.error && d.error.message) ? d.error.message : ('HTTP ' + r.status), http: r.status };
      }
      const audio = juntarAudio(d);
      if (audio) return { audio: audio };
      // Sin audio: se rescata el motivo (finishReason) y el texto, que explican
      // si lo corto el limite de tokens, un filtro de seguridad u otra cosa.
      const cand = d && d.candidates && d.candidates[0];
      const razon = (cand && cand.finishReason) ? cand.finishReason : 'sin finishReason';
      let txt = '';
      if (cand && cand.content && cand.content.parts) {
        for (const p of cand.content.parts) if (p && typeof p.text === 'string') txt += p.text;
      }
      console.warn('[music-gen] sin audio (' + razon + '): ' + JSON.stringify(d).slice(0, 300));
      return { err: 'no devolvio audio (' + razon + ')' + (txt ? ': ' + txt.slice(0, 120) : ''), sinAudio: true };
    }

    const gastado = () => Date.now() - T_INICIO;
    let out = await intentar(presupuesto);

    // Fallo intermitente sin audio: un reintento identico si queda tiempo.
    if (out.sinAudio && 55000 - gastado() > 12000) {
      console.warn('[music-gen] reintento tras respuesta sin audio');
      out = await intentar(55000 - gastado());
    }

    if (!out.audio) {
      console.error('[music-gen] ' + MODEL + ' fallo definitivo: ' + out.err);
      return res.status(502).json({ error: MODEL + ': ' + out.err });
    }
    const audio = out.audio;
    console.log('[music-gen] audio recibido: ' + audio.trozos + ' trozo(s), mime ' + audio.mimeType);

    // Guardar la pista con su formato REAL (extension y Content-Type detectados
    // de los propios bytes). Nunca se reinterpreta el contenido.
    const fmt = prepararAudio(audio.buf, audio.mimeType);
    const buf = fmt.buf;
    console.log('[music-gen] formato detectado: ' + fmt.tipo + ' (' + fmt.ext + '), ' +
      'primeros bytes: ' + audio.buf.slice(0, 4).toString('hex'));
    let slug = (style || 'epica').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'epica';
    const stamp = new Date().toISOString().slice(5, 16).replace(/[-:T]/g, '');
    const name = 'ia-' + slug + '-' + stamp + fmt.ext;
    const object = 'musica/' + name;
    const up = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket +
      '/o?uploadType=media&name=' + encodeURIComponent(object), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': fmt.tipo },
      body: buf,
    });
    const ud = await up.json();
    if (!up.ok) throw new Error('No se pudo guardar la pista: ' + ((ud.error && ud.error.message) || up.status));

    console.log('[music-gen] pista guardada: ' + object + ' (' + buf.length + ' bytes, ' + MODEL + ')');
    // Se devuelve el formato real: si algo suena mal, se ve al instante que era.
    return res.json({
      success: true, object: object, name: name, model: MODEL,
      descripcion: audio.texto, formato: fmt.tipo, mimeOriginal: audio.mimeType, trozos: audio.trozos,
    });
  } catch (e) {
    console.error('[music-gen] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
