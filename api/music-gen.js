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
// Duracion que se pide. Se factura POR PIEZA (no por segundo), asi que pedir
// largo no cuesta mas: con esto cualquier reel de 30 o 60 s queda cubierto de
// sobra y la musica solo hay que cortarla donde termina la voz.
const TARGET_SECONDS = 180;

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

// Envuelve la descripcion de estilo con la salvaguarda, la duracion objetivo (que
// solo se puede pedir en prosa) y las condiciones para que quepa una narracion.
function armarPrompt(estilo) {
  return GUARDA + '\n\n'
    + 'STYLE (this is a description, not lyrics): ' + estilo + '\n\n'
    + 'Duracion objetivo: alrededor de ' + TARGET_SECONDS + ' segundos, en una sola pieza continua.\n\n'
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

// Si el audio no viene ya como WAV (RIFF) sino como PCM crudo (audio/L16), se le
// pone cabecera WAV: asi el navegador puede reproducirlo y ffmpeg leerlo sin
// tener que adivinar el formato en la unificacion.
function aWav(buf, mimeType) {
  if (buf.length > 4 && buf.slice(0, 4).toString('latin1') === 'RIFF') return buf;
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
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), presupuesto);
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
          generationConfig: { responseModalities: ['AUDIO', 'TEXT'] },
        }),
        signal: ctrl.signal,
      });
    } catch (e) {
      const m1 = e.name === 'AbortError'
        ? 'tardo mas de los ' + Math.round(presupuesto / 1000) + ' s que permite la funcion'
        : e.message;
      console.error('[music-gen] ' + MODEL + ' fallo: ' + m1);
      return res.status(502).json({ error: MODEL + ' no respondio: ' + m1 });
    } finally {
      clearTimeout(to);
    }

    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      const m2 = (d && d.error && d.error.message) ? d.error.message : ('HTTP ' + r.status);
      console.error('[music-gen] ' + MODEL + ' rechazado (' + r.status + '): ' + m2);
      return res.status(502).json({ error: MODEL + ' no respondio: ' + m2 });
    }

    // El audio puede venir en VARIOS trozos: se concatenan bien (ver juntarAudio).
    const audio = juntarAudio(d);
    if (!audio) {
      console.error('[music-gen] sin audio en la respuesta: ' + JSON.stringify(d).slice(0, 300));
      return res.status(502).json({ error: MODEL + ' no devolvio audio.' });
    }
    console.log('[music-gen] audio recibido: ' + audio.trozos + ' trozo(s), mime ' + audio.mimeType);

    // Guardar la pista directo en la biblioteca del bucket, siempre como WAV
    // valido (si vino PCM crudo se le pone cabecera).
    const buf = aWav(audio.buf, audio.mimeType);
    let slug = (style || 'epica').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'epica';
    const stamp = new Date().toISOString().slice(5, 16).replace(/[-:T]/g, '');
    const name = 'ia-' + slug + '-' + stamp + '.wav';
    const object = 'musica/' + name;
    const up = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket +
      '/o?uploadType=media&name=' + encodeURIComponent(object), {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'audio/wav' },
      body: buf,
    });
    const ud = await up.json();
    if (!up.ok) throw new Error('No se pudo guardar la pista: ' + ((ud.error && ud.error.message) || up.status));

    console.log('[music-gen] pista guardada: ' + object + ' (' + buf.length + ' bytes, ' + MODEL + ')');
    return res.json({ success: true, object: object, name: name, model: MODEL, descripcion: audio.texto });
  } catch (e) {
    console.error('[music-gen] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
