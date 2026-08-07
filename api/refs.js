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
    // refs = las vistas GENERADAS. Es una lista de 4 huecos: refs[0] es la vista 1,
    // refs[1] la vista 2... Un hueco vacio vale null y SE QUEDA como null. Antes se
    // hacia filter(Boolean) al guardar, y si fallaba la vista 2 la lista se
    // compactaba: la vista 3 pasaba a ocupar el hueco de la 2, el boton de rehacer
    // apuntaba a la vista equivocada y al reintentar la 2 se machacaba la 3.
    refs: Array.isArray(p.refs) ? p.refs.slice(0, 6).map(o => (o ? String(o).slice(0, 200) : null)) : [],
    // base = las imagenes ANCLA del personaje: las que definen su cara de verdad y
    // que NUNCA se tocan. El insignia lleva aqui sus 4 imagenes de marca. Antes no
    // existia este campo: sus fotos de siempre vivian en refs, y la primera vez que
    // se guardaba una vista nueva refs[0] las pisaba. A partir de ahi el ancla ya no
    // existia y cada regeneracion copiaba a un desconocido inventado.
    base: Array.isArray(p.base) ? p.base.filter(Boolean).slice(0, 6).map(o => String(o).slice(0, 200)) : [],
    creado: p.creado || new Date().toISOString(),
  };
}

// Las 4 imagenes de marca del protagonista. Llevan un ano siendo la cara del canal:
// son el ancla, no un punto de partida que se pueda reemplazar.
const BASE_INSIGNIA = ['refs/personaje-1', 'refs/personaje-2', 'refs/personaje-3', 'refs/personaje-4'];

// Las 4 vistas que se piden al generador. Siempre sobre fondo blanco liso.
//
// EL ENCUADRE VA AQUI Y VA FUERTE. Con "head and shoulders" a secas, el modelo
// devolvia figuras diminutas en medio de un mar de blanco: como referencia no
// sirven, porque la cara ocupa cuatro pixeles y lo que se copia despues es un
// borron. Cada vista dice ahora que parte del cuerpo entra Y cuanto del alto de
// la imagen tiene que ocupar.
const VISTAS = [
  { a: 'FRONT VIEW: the character faces the camera straight on, looking directly at the lens, neutral expression.',
    enc: 'TIGHT HEAD-AND-SHOULDERS PORTRAIT. Crop at mid-chest. The head alone fills at least 55% of the image height, top of the hair close to the top edge. This is a close portrait, NOT a distant full-body shot.' },
  { a: 'THREE-QUARTER VIEW: the character is turned about 45 degrees to their left, still glancing toward the camera, neutral expression.',
    enc: 'TIGHT HEAD-AND-SHOULDERS PORTRAIT. Crop at mid-chest. The head alone fills at least 55% of the image height. This is a close portrait, NOT a distant full-body shot.' },
  { a: 'STRICT SIDE PROFILE: the character is turned exactly 90 degrees, seen from the side, not looking at the camera, neutral expression.',
    enc: 'TIGHT HEAD-AND-SHOULDERS PORTRAIT. Crop at mid-chest. The head alone fills at least 55% of the image height. This is a close portrait, NOT a distant full-body shot.' },
  { a: 'WAIST-UP VIEW: the character stands facing the camera, arms relaxed at their sides, neutral expression.',
    enc: 'MEDIUM SHOT cropped at the waist. The figure fills the frame from top to bottom, head near the top edge, waist at the bottom edge. Do NOT leave large empty margins around the figure.' },
];

// Que el reparto sea atractivo es una peticion del canal, no un capricho: son
// personajes de comic y tienen que resultar agradables de mirar. Con los menores
// no se usa esa palabra ni ese criterio, obviamente: para ellos solo se pide que
// se vean sanos y cuidados.
function clausulaAspecto(edad) {
  const n = parseInt(String(edad || '').replace(/[^0-9]/g, ''), 10);
  if (isFinite(n) && n < 18) {
    return 'The character looks healthy, well-groomed and natural, like a real kid, never stylised as an adult.';
  }
  return 'The character is good-looking and well-groomed: clean features, healthy skin, tidy hair, '
    + 'an attractive comic-book lead. Attractive but believable and age-appropriate, never a caricature.';
}

function promptDeVista(f, vista, conReferencia) {
  // Cuando viajan imagenes de referencia hay que decirlo EXPLICITAMENTE, y muy
  // fuerte: si no, el modelo las trata como inspiracion y dibuja a otra persona
  // parecida. Es lo que hacia que cada vista saliera con una cara distinta.
  const mismaCara = conReferencia
    ? 'THIS IS THE SAME PERSON AS IN THE REFERENCE IMAGES. Copy the face exactly: same bone structure, '
      + 'same eyes, same nose, same mouth, same hairline, same beard, same skin tone. '
      + 'You are drawing ANOTHER ANGLE of that same person, not a similar-looking person. '
      + 'If the face differs from the reference, the image is wrong. '
      + 'Only the camera angle and the pose change.\n'
    : '';
  // "Character reference sheet" era un error de bulto: al modelo esa expresion le
  // pide una LAMINA de personaje, y devolvia collages con dos y tres cabezas del
  // mismo hombre dentro de la misma imagen. Una lamina no sirve de referencia: hay
  // que pedir UN retrato, de UNA persona, en UN encuadre.
  return 'A single character portrait illustration. ONE person only, ONE head, ONE figure, '
    + 'in ONE single frame. This is NOT a model sheet, NOT a collage, NOT a grid, NOT a set of panels, '
    + 'NOT several poses side by side, NOT multiple angles in the same image. Exactly one figure.\n'
    + vista.a + '\n' + vista.enc + '\n'
    + 'PLAIN PURE WHITE BACKGROUND (#FFFFFF), completely empty, no scenery, no furniture, no props, '
    + 'no shadows on the background, no text, no labels, no watermark, no border, no frame. '
    + 'Studio-flat even lighting.\n'
    + mismaCara
    + 'CHARACTER: ' + (f.fisico || f.nombre) + '.'
    + (f.edad ? ' Apparent age: ' + f.edad + '.' : '')
    + (f.vestuario ? ' Wearing: ' + f.vestuario + '.' : '')
    + ' ' + clausulaAspecto(f.edad)
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
      // 3:4 vertical en las cuatro vistas: una persona encaja en vertical, las
      // miniaturas quedan todas del mismo tamano y la cara ocupa mas pixeles, que
      // es lo que importa cuando esta imagen se use luego como referencia.
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4' } },
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
          base: BASE_INSIGNIA.slice(),
        }));
      }
      // REPARACION de las fichas que ya estan en el bucket. El insignia nacio con
      // sus 4 imagenes de marca dentro de refs, y guardar la primera vista nueva
      // las borro. Aqui se le devuelve el ancla, y si alguna imagen de marca sigue
      // colgada en refs se mueve a base en vez de contarse como vista generada.
      let reparado = 0;
      for (const p of lista) {
        const sueltas = (p.refs || []).filter(o => o && o.indexOf('refs/') === 0);
        if (sueltas.length) {
          p.base = (p.base || []).concat(sueltas.filter(o => (p.base || []).indexOf(o) < 0));
          p.refs = (p.refs || []).map(o => (o && o.indexOf('refs/') === 0 ? null : o));
          reparado++;
        }
        // El insignia lleva SIEMPRE sus cuatro. Recuperar solo la que quedo suelta
        // no basta: las otras tres tambien las borro el fallo.
        if (p.fijo) {
          const faltan = BASE_INSIGNIA.filter(o => (p.base || []).indexOf(o) < 0);
          if (faltan.length) { p.base = (p.base || []).concat(faltan).sort(); reparado++; }
        }
      }
      // Los del reparto se anaden si faltan, SIN pisar los que ya tengan vistas
      // generadas o los que el duenno haya editado.
      for (const base of REPARTO) {
        if (lista.some(x => x.id === base.id)) continue;
        lista.push(sanearFicha(base));
      }
      if (lista.length !== antes || reparado) {
        await escribirIndice(token, bucket, lista);
        if (lista.length !== antes) console.log('[refs] biblia sembrada: ' + (lista.length - antes) + ' personajes nuevos, ' + lista.length + ' en total');
        if (reparado) console.log('[refs] ancla restaurada en ' + reparado + ' ficha(s)');
      }
      return res.json({
        success: true, personajes: lista,
        conVistas: lista.filter(p => (p.refs || []).filter(Boolean).length).length,
      });
    }

    if (accion === 'imagenes') {
      // Devuelve las vistas de un personaje, en base64, para pintarlas o para
      // mandarlas como referencia al generar imagenes del reel.
      const lista = await leerIndice(token, bucket);
      const p = lista.find(x => x.id === limpiarId(body.id));
      if (!p) return res.status(404).json({ error: 'No existe ese personaje' });
      // Viajan tambien los INDICES: refs es una lista de 4 huecos y alguno puede
      // estar vacio. Sin el indice, el navegador pintaba las que hubiera una detras
      // de otra y el boton de rehacer apuntaba a la vista equivocada.
      const imgs = [], indices = [];
      const lst = p.refs || [];
      for (let i = 0; i < lst.length; i++) {
        if (!lst[i]) continue;
        const b64 = await readFromBucket(token, bucket, lst[i]);
        if (b64) { imgs.push(b64); indices.push(i); }
      }
      return res.json({ success: true, id: p.id, refs: imgs, indices: indices, total: VISTAS.length });
    }

    if (accion === 'generar') {
      // UNA VISTA POR PETICION. Antes se generaban las cuatro en la misma
      // llamada: cuatro imagenes tardan 40-60 s y esta funcion se corta a los 30,
      // asi que el trabajo moria a medias y no se guardaba nada. Ahora el
      // navegador pide una, espera, y pide la siguiente — igual que ya hacia el
      // lote de reels.
      const f = sanearFicha(body.personaje || {});
      if (!f.fisico) return res.status(400).json({ error: 'Describe primero como es fisicamente el personaje' });
      if (!f.id) return res.status(400).json({ error: 'El personaje necesita un nombre' });
      const projectId = process.env.GCP_PROJECT_ID;
      if (!projectId) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
      const modelo = /^gemini-[0-9.]+(-flash|-pro)?-image/.test(String(body.model || ''))
        ? String(body.model) : 'gemini-2.5-flash-image';

      let i = Number(body.vista);
      if (!isFinite(i) || i < 0 || i >= VISTAS.length) {
        // Compatibilidad: si llega la lista antigua, se hace solo la primera.
        i = (Array.isArray(body.vistas) && body.vistas.length) ? Number(body.vistas[0]) : 0;
        if (!isFinite(i) || i < 0 || i >= VISTAS.length) i = 0;
      }

      // LA CARA TIENE QUE SER LA MISMA. Se cargan las vistas que ese personaje YA
      // tiene guardadas y viajan como referencia. Sin esto, cada vista se generaba
      // a partir del texto y salia una persona distinta cada vez — y al personaje
      // insignia ni siquiera se le pasaban sus 4 imagenes de siempre, que son la
      // cara de la marca desde hace un ano.
      const lista = await leerIndice(token, bucket);
      const guardado = lista.find(x => x.id === f.id);
      // PRIMERO EL ANCLA. Las imagenes de base mandan sobre las vistas generadas:
      // en el insignia son sus 4 fotos de marca, y su cara no se negocia. Despues,
      // si quedan huecos, se rellenan con las vistas que ya tenga hechas.
      const ancla = (guardado && guardado.base) ? guardado.base.slice(0, 3) : [];
      const propias = ((guardado && guardado.refs) ? guardado.refs : [])
        // La vista que se esta rehaciendo NO se usa como referencia de si misma:
        // si no, se copia el fallo que se queria corregir.
        .filter((o, k) => o && k !== i);
      const objetos = ancla.concat(propias);
      const refsB64 = [];
      for (const o of objetos) {
        const b64 = await readFromBucket(token, bucket, o);
        if (b64) refsB64.push(b64);
        if (refsB64.length >= 4) break;
      }

      const b64 = await generarVista(token, projectId, modelo,
        promptDeVista(f, VISTAS[i], refsB64.length > 0), refsB64);
      return res.json({
        success: true, id: f.id, vista: i,
        vistas: [{ i: i, b64: b64 }],          // formato que ya espera 'guardar'
        conReferencia: refsB64.length,          // para poder avisar si fue a ciegas
        total: VISTAS.length,
      });
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
        if (ok) refs[i] = obj;
      }
      // Cada vista se queda en SU hueco. Los que falten valen null y siguen
      // valiendo null: compactar la lista descolocaba las vistas siguientes.
      for (let k = 0; k < 4; k++) if (!refs[k]) refs[k] = null;
      f.refs = refs.slice(0, 4);
      // El ancla no se toca NUNCA al guardar. Este era el fallo grave: las fotos
      // reales del insignia vivian en refs y la primera vista nueva las borraba.
      f.base = (antes && antes.base && antes.base.length) ? antes.base.slice() : (f.fijo ? BASE_INSIGNIA.slice() : []);
      if (!f.refs.filter(Boolean).length) return res.status(400).json({ error: 'Genera al menos una vista antes de guardar' });

      const idx = lista.findIndex(x => x.id === f.id);
      if (idx > -1) lista[idx] = f; else lista.push(f);
      await escribirIndice(token, bucket, lista);
      console.log('[refs] personaje guardado: ' + f.id + ' (' + f.refs.filter(Boolean).length + '/4 vistas)');
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
