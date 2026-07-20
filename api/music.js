// api/music.js
// Biblioteca de MUSICA DE FONDO para la unificacion. Las pistas se suben UNA
// sola vez a la carpeta musica/ del bucket y quedan disponibles para siempre.
// Acciones (POST): {action:'list'} | {action:'upload', name, b64} | {action:'delete', object}
// Limite de subida ~4MB (limite del cuerpo en Vercel): un MP3 de 3-4 minutos cabe bien.

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

const EXT_MIME = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.aac': 'audio/aac' };

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

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }
  const bucketEnv = (process.env.GCS_OUTPUT_BUCKET || '').trim();
  if (!bucketEnv) {
    return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
  }
  const bucket = bucketEnv.replace('gs://', '').replace(/\/.*$/, '');
  const action = req.body.action || 'list';

  try {
    const token = await getGCPToken();

    if (action === 'list') {
      const r = await fetch('https://storage.googleapis.com/storage/v1/b/' + bucket +
        '/o?prefix=' + encodeURIComponent('musica/') + '&fields=items(name,size)', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      const d = await r.json();
      if (!r.ok) throw new Error((d.error && d.error.message) || 'Error ' + r.status);
      const tracks = (d.items || [])
        .filter(it => it.name !== 'musica/')
        .map(it => ({ object: it.name, name: it.name.replace('musica/', ''), size: Number(it.size) || 0 }));
      return res.json({ success: true, tracks: tracks });
    }

    if (action === 'upload') {
      const rawName = String(req.body.name || 'musica.mp3');
      const b64 = String(req.body.b64 || '');
      if (!b64 || b64.length < 1000) return res.status(400).json({ error: 'Archivo vacio' });
      if (b64.length > 5500000) {
        return res.status(400).json({ error: 'Archivo muy grande (maximo ~4MB). Usa un MP3; si pesa mas, recortalo o comprimelo.' });
      }
      // Nombre seguro: minusculas, sin espacios ni caracteres raros, extension permitida.
      let name = rawName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const ext = (name.match(/\.[a-z0-9]+$/) || ['.mp3'])[0];
      if (!EXT_MIME[ext]) return res.status(400).json({ error: 'Formato no soportado. Usa MP3, M4A, AAC o WAV.' });
      if (name.length > 80) name = name.slice(-80);
      const object = 'musica/' + name;
      const buf = Buffer.from(b64, 'base64');
      const r = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket +
        '/o?uploadType=media&name=' + encodeURIComponent(object), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': EXT_MIME[ext] },
        body: buf,
      });
      const d = await r.json();
      if (!r.ok) throw new Error((d.error && d.error.message) || 'Error ' + r.status);
      console.log('[music] subida: ' + object + ' (' + buf.length + ' bytes)');
      return res.json({ success: true, object: object, name: name });
    }

    if (action === 'delete') {
      const object = String(req.body.object || '');
      if (object.indexOf('musica/') !== 0 || object.indexOf('..') > -1) {
        return res.status(400).json({ error: 'Pista invalida' });
      }
      const r = await fetch('https://storage.googleapis.com/storage/v1/b/' + bucket +
        '/o/' + encodeURIComponent(object), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (!r.ok && r.status !== 404) throw new Error('Error ' + r.status);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Accion invalida' });
  } catch (e) {
    console.error('[music] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
