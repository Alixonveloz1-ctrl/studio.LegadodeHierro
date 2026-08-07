// api/refs.js — Referencias de imagen del personaje, servidas por el SERVIDOR.
//
// INDEPENDENCIA DE TERCEROS: las referencias viven en TU bucket de Google
// (carpeta refs/). La primera vez que falten alli, el servidor las descarga de
// ibb.co UNA ultima vez y les saca COPIA PERMANENTE al bucket; desde entonces
// siempre se leen del bucket y ibb.co deja de importar.
//
// ?set=personaje -> las 4 referencias FIJAS del personaje (reels/miniatura)
// (sin set)      -> las 3 referencias del generador de posts

const { createSign } = require('crypto');

const SETS = {
  post: [
    'https://i.ibb.co/m5Cqfs5n/IMG-8206.jpg',
    'https://i.ibb.co/3m42CzNf/IMG-8162.jpg',
    'https://i.ibb.co/GvfhKnJ3/IMG-8117.jpg',
  ],
  personaje: [
    'https://i.ibb.co/RGgryDhy/Cu-nto-tiempo-m-s-vas-a-imagen-5.png',
    'https://i.ibb.co/fzZF6dsK/Prefiero-intentarlo-mil-v-imagen-7.png',
    'https://i.ibb.co/chTyj7RC/La-diferencia-entre-traba-imagen-2.png',
    'https://i.ibb.co/mFtmDw1N/Recorr-este-camino-solo-imagen-4.png',
  ],
};

// Cache en memoria de la instancia (mientras siga "caliente", ni bucket ni ibb).
const CACHE = {};

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

function bucketName() {
  const b = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  return b ? b.replace('gs://', '').replace(/\/.*$/, '') : null;
}

async function readFromBucket(token, bucket, object) {
  const r = await fetch('https://storage.googleapis.com/storage/v1/b/' + bucket +
    '/o/' + encodeURIComponent(object) + '?alt=media', {
    headers: { 'Authorization': 'Bearer ' + token },
  });
  if (!r.ok) return null;
  const buf = await r.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  return b64.length > 100 ? b64 : null;
}

async function writeToBucket(token, bucket, object, b64, contentType) {
  const r = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket +
    '/o?uploadType=media&name=' + encodeURIComponent(object), {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': contentType || 'image/png' },
    body: Buffer.from(b64, 'base64'),
  });
  return r.ok;
}

async function fetchFromIbb(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const ct = r.headers.get('content-type') || '';
      if (ct.indexOf('image/') === -1) throw new Error('no es imagen');
      const buf = await r.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      if (b64.length > 100) return { b64: b64, ct: ct };
      throw new Error('respuesta vacia');
    } catch (e) {
      if (attempt === 0) await new Promise(rs => setTimeout(rs, 600));
    }
  }
  return null;
}

// ===================== BIBLIA DE PERSONAJES =====================
// Los personajes del canal viven en el bucket:
//   personajes/index.json        -> la lista con la ficha de cada uno
//   personajes/<id>/vista-N.png  -> sus vistas de referencia, sobre FONDO BLANCO
//
// El fondo blanco importa: si una referencia trae escenario, ese escenario se
// cuela en todas las imagenes que se generen con ella.
//
// Va dentro de este archivo y no en uno nuevo a proposito: Vercel limita el
// numero de funciones en el plan gratuito y ya hay 13.

const { REPARTO } = require('./_personajes');

const INDICE = 'personajes/index.json';

async function leerIndice(token, bucket) {
  const b64 = await readFromBucket(token, bucket, INDICE);
  if (!b64) return [];
  try {
    const d = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return Array.isArray(d) ? d : [];
  } catch (e) { return []; }
}

async function escribirIndice(token, bucket, lista) {
  const b64 = Buffer.from(JSON.stringify(lista, null, 1), 'utf8').toString('base64');
  return writeToBucket(token, bucket, INDICE, b64, 'application/json');
}

function limpiarId(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

// Ficha saneada: solo los campos que se esperan, y con tope de longitud. Lo que
// escribe el usuario acaba dentro de un prompt, asi que no puede ser ilimitado.
function sanearFicha(p) {
  const txt = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  return {
    id: limpiarId(p.id || p.nombre),
    nombre: txt(p.nombre, 40),
    rol: txt(p.rol, 60),
    edad: txt(p.edad, 30),
    fisico: txt(p.fisico, 400),
    vestuario: txt(p.vestuario, 300),
    habla: txt(p.habla, 200),
    encaja: txt(p.encaja, 200),
    fijo: p.fijo === true,
    refs: Array.isArray(p.refs) ? p.refs.slice(0, 6).map(o => String(o).slice(0, 200)) : [],
    creado: p.creado || new Date().toISOString(),
  };
}

// Las 4 vistas que se piden al generador. Siempre sobre fondo blanco liso.
const VISTAS = [
  'front view, looking straight at the camera, neutral expression, head and shoulders',
  'three-quarter view turned slightly to his left, neutral expression, head and shoulders',
  'strict side profile view, neutral expression, head and shoulders',
  'waist-up view, standing, arms relaxed at his sides, neutral expression',
];

function promptDeVista(f, vista) {
  return 'Character reference sheet image. ' + vista + '. '
    + 'PLAIN PURE WHITE BACKGROUND (#FFFFFF), completely empty, no scenery, no furniture, no props, '
    + 'no shadows on the background, no text, no watermark, no border. Studio-flat even lighting. '
    + 'The SAME character in every image of this set.\n'
    + 'CHARACTER: ' + (f.fisico || f.nombre) + '.'
    + (f.edad ? ' Apparent age: ' + f.edad + '.' : '')
    + (f.vestuario ? ' Wearing: ' + f.vestuario + '.' : '')
    + '\nSTYLE (must match the channel exactly): 2D American comic book illustration, cinematic, '
    + 'clean bold ink lines, dramatic cel-shading, graphic-novel aesthetic. '
    + 'NEVER photorealistic, never a photograph, never 3D or CGI.';
}

// Genera UNA vista con el mismo modelo de imagen que usa el resto de la app.
async function generarVista(token, projectId, modelo, prompt, refsB64) {
  const region = /^gemini-2\.5-flash-image/.test(modelo) ? 'us-central1' : 'global';
  const host = region === 'global' ? 'aiplatform.googleapis.com' : region + '-aiplatform.googleapis.com';
  const url = 'https://' + host + '/v1/projects/' + projectId + '/locations/' + region +
    '/publishers/google/models/' + modelo + ':generateContent';
  const parts = [];
  // Si ya hay vistas de este personaje, viajan como referencia para que la cara
  // no cambie entre una vista y otra.
  (refsB64 || []).forEach(b => parts.push({ inlineData: { mimeType: 'image/png', data: b } }));
  parts.push({ text: prompt });
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-Goog-User-Project': projectId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: parts }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d.error && d.error.message) || ('HTTP ' + r.status));
  const cand = d.candidates && d.candidates[0];
  const ps = cand && cand.content && cand.content.parts;
  if (ps) {
    for (const p of ps) {
      const inl = p.inlineData || p.inline_data;
      if (inl && inl.data) return inl.data;
    }
  }
  throw new Error('el modelo no devolvio imagen' +
    (cand && cand.finishReason ? ' (' + cand.finishReason + ')' : ''));
}

const { checkAuth } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;

  // ---- POST: la biblia de personajes ----
  if (req.method === 'POST') return biblia(req, res);

  let set = 'post';
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.searchParams.get('set') && SETS[u.searchParams.get('set')]) set = u.searchParams.get('set');
  } catch (e) {}
  const URLS = SETS[set];

  if (CACHE[set] && CACHE[set].length === URLS.length) {
    return res.json({ refs: CACHE[set], set: set, source: 'memoria' });
  }

  try {
    const bucket = bucketName();
    let token = null;
    if (bucket && process.env.GCP_SERVICE_ACCOUNT) {
      try { token = await getGCPToken(); } catch (e) { console.warn('[refs] sin token GCP: ' + e.message); }
    }

    const results = [];
    let fromBucket = 0, migrated = 0;
    for (let i = 0; i < URLS.length; i++) {
      const object = 'refs/' + set + '-' + (i + 1);
      let b64 = null;
      // 1) TU bucket: la fuente permanente, sin terceros.
      if (token && bucket) {
        b64 = await readFromBucket(token, bucket, object);
        if (b64) fromBucket++;
      }
      // 2) Si falta en el bucket: ibb.co una ultima vez + copia permanente al bucket.
      if (!b64) {
        const got = await fetchFromIbb(URLS[i]);
        if (got) {
          b64 = got.b64;
          if (token && bucket) {
            const okUp = await writeToBucket(token, bucket, object, got.b64, got.ct);
            if (okUp) { migrated++; console.log('[refs] copia permanente guardada: ' + object); }
          }
        } else {
          console.warn('[refs] ' + set + ' #' + (i + 1) + ' no se pudo obtener (ni bucket ni ibb)');
        }
      }
      if (b64) results.push(b64);
    }

    if (results.length === URLS.length) CACHE[set] = results;
    if (migrated) console.log('[refs] migradas ' + migrated + ' referencias del set ' + set + ' al bucket');
    return res.json({
      refs: results,
      set: set,
      total: URLS.length,
      source: fromBucket === URLS.length ? 'bucket' : (fromBucket > 0 ? 'mixto' : 'ibb'),
    });
  } catch (e) {
    console.error('[refs] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message, refs: [] });
  }
};

// ---- Las acciones de la biblia ----
async function biblia(req, res) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body) {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch (e) { body = {}; }
  }
  const accion = body.action || 'list';

  const bucket = bucketName();
  if (!bucket) return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  if (!process.env.GCP_SERVICE_ACCOUNT) return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });

  try {
    const token = await getGCPToken();

    if (accion === 'list') {
      let lista = await leerIndice(token, bucket);
      // SIEMBRA. La biblia no nace vacia: trae el insignia mas los 31 del
      // reparto. Un formulario en blanco no sirve de nada — lo que da variedad
      // es que el director tenga gente a la que llamar.
      // El insignia entra con sus 4 imagenes DE SIEMPRE, sin regenerar: su cara
      // lleva un ano siendo la marca del canal.
      const antes = lista.length;
      if (!lista.some(x => x.id === 'insignia')) {
        lista.unshift(sanearFicha({
          id: 'insignia', nombre: 'El hombre de Legado de Hierro', rol: 'Protagonista del canal',
          edad: '35 anos',
          fisico: 'hombre de 35 anos, cabello negro corto peinado hacia atras, barba corta oscura bien cuidada, mandibula marcada, ojos oscuros intensos, mirada seria',
          vestuario: 'traje oscuro de tres piezas en escenas de poder; camiseta simple en escenas humildes',
          habla: 'directo, crudo, sin adornos',
          encaja: 'es el protagonista por defecto y aparece en practicamente todos los reels',
          fijo: true,
          refs: ['refs/personaje-1', 'refs/personaje-2', 'refs/personaje-3', 'refs/personaje-4'],
        }));
      }
      // Los del reparto se anaden si faltan, SIN pisar los que ya tengan vistas
      // generadas o los que el duenno haya editado.
      for (const base of REPARTO) {
        if (lista.some(x => x.id === base.id)) continue;
        lista.push(sanearFicha(base));
      }
      if (lista.length !== antes) {
        await escribirIndice(token, bucket, lista);
        console.log('[refs] biblia sembrada: ' + (lista.length - antes) + ' personajes nuevos, ' + lista.length + ' en total');
      }
      return res.json({
        success: true, personajes: lista,
        conVistas: lista.filter(p => (p.refs || []).length).length,
      });
    }

    if (accion === 'imagenes') {
      // Devuelve las vistas de un personaje, en base64, para pintarlas o para
      // mandarlas como referencia al generar imagenes del reel.
      const lista = await leerIndice(token, bucket);
      const p = lista.find(x => x.id === limpiarId(body.id));
      if (!p) return res.status(404).json({ error: 'No existe ese personaje' });
      const imgs = [];
      for (const o of (p.refs || [])) {
        const b64 = await readFromBucket(token, bucket, o);
        if (b64) imgs.push(b64);
      }
      return res.json({ success: true, id: p.id, refs: imgs });
    }

    if (accion === 'generar') {
      const f = sanearFicha(body.personaje || {});
      if (!f.fisico) return res.status(400).json({ error: 'Describe primero como es fisicamente el personaje' });
      if (!f.id) return res.status(400).json({ error: 'El personaje necesita un nombre' });
      const projectId = process.env.GCP_PROJECT_ID;
      if (!projectId) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
      const modelo = /^gemini-[0-9.]+(-flash|-pro)?-image/.test(String(body.model || ''))
        ? String(body.model) : 'gemini-2.5-flash-image';

      // Cuantas vistas se piden. Por defecto las 4; se puede pedir una sola para
      // rehacer la que no gusto sin pagar las otras tres.
      const cuales = Array.isArray(body.vistas) && body.vistas.length
        ? body.vistas.filter(i => i >= 0 && i < VISTAS.length)
        : [0, 1, 2, 3];

      const generadas = [], previas = [];
      for (const i of cuales) {
        // Las vistas ya hechas en ESTA tanda viajan como referencia: asi la 2, la
        // 3 y la 4 son el mismo hombre que la 1 y no cuatro personas distintas.
        const b64 = await generarVista(token, projectId, modelo, promptDeVista(f, VISTAS[i]), previas.slice(0, 2));
        previas.push(b64);
        generadas.push({ i: i, b64: b64 });
      }
      return res.json({ success: true, id: f.id, vistas: generadas });
    }

    if (accion === 'guardar') {
      const f = sanearFicha(body.personaje || {});
      if (!f.id) return res.status(400).json({ error: 'El personaje necesita un nombre' });
      const lista = await leerIndice(token, bucket);
      const antes = lista.find(x => x.id === f.id);
      if (antes && antes.fijo && !f.fijo) f.fijo = true; // el insignia no deja de serlo

      // Las vistas nuevas llegan en base64 y se guardan como objetos del bucket.
      const nuevas = Array.isArray(body.vistas) ? body.vistas : [];
      const refs = (antes && antes.refs) ? antes.refs.slice() : [];
      for (const v of nuevas) {
        const i = Number(v.i);
        if (!isFinite(i) || i < 0 || i > 5 || !v.b64) continue;
        const obj = 'personajes/' + f.id + '/vista-' + (i + 1) + '.png';
        const ok = await writeToBucket(token, bucket, obj, v.b64, 'image/png');
        if (ok && refs.indexOf(obj) < 0) refs[i] = obj;
      }
      f.refs = refs.filter(Boolean);
      if (!f.refs.length) return res.status(400).json({ error: 'Genera al menos una vista antes de guardar' });

      const idx = lista.findIndex(x => x.id === f.id);
      if (idx > -1) lista[idx] = f; else lista.push(f);
      await escribirIndice(token, bucket, lista);
      console.log('[refs] personaje guardado: ' + f.id + ' (' + f.refs.length + ' vistas)');
      return res.json({ success: true, personaje: f });
    }

    if (accion === 'borrar') {
      const id = limpiarId(body.id);
      const lista = await leerIndice(token, bucket);
      const p = lista.find(x => x.id === id);
      if (!p) return res.status(404).json({ error: 'No existe ese personaje' });
      if (p.fijo) return res.status(400).json({ error: 'El personaje insignia del canal no se puede borrar' });
      await escribirIndice(token, bucket, lista.filter(x => x.id !== id));
      console.log('[refs] personaje borrado: ' + id);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Accion no valida' });
  } catch (e) {
    console.error('[refs/biblia] ' + e.message);
    return res.status(500).json({ error: e.message });
  }
}
