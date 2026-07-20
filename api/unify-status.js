// api/unify-status.js
// Consulta el estado de un trabajo de unificacion. El servicio de Cloud Run
// escribe al terminar un archivo de estado en el bucket:
//   unify/<jobId>.json  -> { status: 'done'|'error', object?, message? }
// Este endpoint lo lee con la cuenta de servicio (la misma de Vercel) y, si el
// video final ya existe, genera una URL firmada de descarga (V4, 1 hora).
// Los errores del servicio llegan aqui y se registran en los logs de Vercel.

const { createSign, createHash } = require('crypto');

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

// URL firmada V4 de LECTURA (misma tecnica que api/video-status.js, en Node).
function signedReadUrl(sa, bucketName, objectPath) {
  const host = 'storage.googleapis.com';
  const now = new Date();
  const datestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
  const credentialScope = `${datestamp}/auto/storage/goog4_request`;
  const credential = `${sa.client_email}/${credentialScope}`;
  const canonicalUri = `/${bucketName}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
  const queryParams = {
    'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
    'X-Goog-Credential': credential,
    'X-Goog-Date': timestamp,
    'X-Goog-Expires': '3600',
    'X-Goog-SignedHeaders': 'host',
  };
  const canonicalQueryString = Object.keys(queryParams).sort()
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(queryParams[k]))
    .join('&');
  const canonicalRequest = [
    'GET', canonicalUri, canonicalQueryString,
    `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD',
  ].join('\n');
  const canonicalRequestHash = createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = ['GOOG4-RSA-SHA256', timestamp, credentialScope, canonicalRequestHash].join('\n');
  const sign = createSign('RSA-SHA256');
  sign.update(stringToSign);
  const signatureHex = sign.sign(sa.private_key).toString('hex');
  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signatureHex}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
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

  const jobId = req.body && req.body.jobId ? String(req.body.jobId) : '';
  if (!/^[a-z0-9-]{8,64}$/.test(jobId)) return res.status(400).json({ error: 'jobId invalido' });
  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }

  // Sin nombres de respaldo: el bucket SIEMPRE viene de la configuracion de Vercel.
  const bucketEnv = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  if (!bucketEnv) {
    return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  }
  const bucket = bucketEnv.replace('gs://', '').replace(/\/.*$/, '');

  try {
    const token = await getGCPToken();
    const statusObj = 'unify/' + jobId + '.json';
    const metaUrl = 'https://storage.googleapis.com/storage/v1/b/' + bucket +
      '/o/' + encodeURIComponent(statusObj) + '?alt=media';
    const r = await fetch(metaUrl, { headers: { 'Authorization': 'Bearer ' + token } });

    if (r.status === 404) {
      // El servicio sigue trabajando: aun no escribio el archivo de estado.
      return res.json({ done: false });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error('[unify-status] error leyendo estado: ' + r.status + ' ' + t.slice(0, 200));
      return res.status(502).json({ error: 'No se pudo leer el estado del trabajo (' + r.status + ')' });
    }

    const st = await r.json();
    if (st.status === 'error') {
      // El error del servicio queda registrado en Vercel, legible sin tocar Cloud Run.
      console.error('[unify-status] el servicio reporto error en ' + jobId + ': ' + (st.message || 'sin mensaje'));
      return res.json({ done: true, error: st.message || 'El servicio de unificacion fallo.' });
    }
    if (st.status === 'done' && st.object) {
      const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
      const videoUrl = signedReadUrl(sa, bucket, st.object);
      console.log('[unify-status] trabajo ' + jobId + ' completado: ' + st.object);
      return res.json({ done: true, videoUrl: videoUrl });
    }
    return res.json({ done: false, stage: st.stage || undefined });
  } catch (e) {
    console.error('[unify-status] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
