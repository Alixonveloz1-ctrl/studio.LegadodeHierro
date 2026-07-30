// api/videos.js — BANCO DE VIDEOS YA GENERADOS.
// Lista los clips de Veo que ya viven en el bucket y devuelve URLs firmadas para
// reutilizarlos en un reel nuevo SIN volver a generarlos (ni pagarlos).
//
// Veo escribe los clips en la raiz del bucket (storageUri), en carpetas propias
// por operacion. Aqui se listan todos los .mp4 excepto las carpetas de la
// herramienta (unify/ son reels ya terminados, musica/ y refs/ no son clips).

const { createSign, createHash } = require('crypto');
const { checkAuth } = require('./_auth');

// Carpetas que NO son clips sueltos de Veo.
const EXCLUIR = ['unify/', 'musica/', 'refs/'];
const MAX_ITEMS = 300;

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT' });
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
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + sigInput + '.' + sig,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token error: ' + JSON.stringify(data));
  return data.access_token;
}

// URL firmada V4 de lectura (6 horas): la unificacion en Cloud Run descarga el
// clip desde aqui, asi que tiene que aguantar todo el proceso.
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
    'X-Goog-Expires': '21600',
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (typeof req.body === 'string') { try { req.body = JSON.parse(req.body); } catch (e) { req.body = {}; } }
  if (!req.body) req.body = {};

  if (!process.env.GCP_SERVICE_ACCOUNT) return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  const bucketEnv = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  if (!bucketEnv) return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  const bucket = bucketEnv.replace('gs://', '').replace(/\/.*$/, '');
  const action = req.body.action || 'list';

  try {
    const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);

    if (action === 'list') {
      const token = await getGCPToken();
      // Se pagina hasta juntar los mas recientes; el bucket puede tener muchos.
      let items = [], pageToken = '', vueltas = 0;
      do {
        const url = 'https://storage.googleapis.com/storage/v1/b/' + bucket +
          '/o?maxResults=1000&fields=items(name,size,timeCreated),nextPageToken' +
          (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
        const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
        const d = await r.json();
        if (!r.ok) throw new Error((d.error && d.error.message) || 'Error ' + r.status);
        items = items.concat(d.items || []);
        pageToken = d.nextPageToken || '';
        vueltas++;
      } while (pageToken && vueltas < 10);

      const clips = items
        .filter(it => /\.mp4$/i.test(it.name) && !EXCLUIR.some(p => it.name.indexOf(p) === 0))
        .map(it => ({
          object: it.name,
          name: it.name.split('/').pop(),
          carpeta: it.name.indexOf('/') > -1 ? it.name.slice(0, it.name.lastIndexOf('/')) : '',
          size: Number(it.size) || 0,
          fecha: it.timeCreated || '',
        }))
        // Mas recientes primero; dentro de la misma carpeta, por nombre, que es
        // el orden en que se generaron los clips de un mismo reel.
        .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || a.name.localeCompare(b.name))
        .slice(0, MAX_ITEMS);

      return res.json({ success: true, clips: clips, total: clips.length });
    }

    if (action === 'link') {
      const objs = Array.isArray(req.body.objects) ? req.body.objects : [];
      if (!objs.length) return res.status(400).json({ error: 'Sin clips que enlazar' });
      if (objs.length > 12) return res.status(400).json({ error: 'Demasiados clips de una vez' });
      const urls = [];
      for (const o of objs) {
        const obj = String(o);
        if (!/\.mp4$/i.test(obj) || obj.indexOf('..') > -1) {
          return res.status(400).json({ error: 'Clip invalido: ' + obj });
        }
        urls.push(signedReadUrl(sa, bucket, obj));
      }
      return res.json({ success: true, urls: urls });
    }

    return res.status(400).json({ error: 'Accion no valida' });
  } catch (e) {
    console.error('[videos] ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
