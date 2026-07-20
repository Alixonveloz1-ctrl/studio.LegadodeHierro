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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

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
