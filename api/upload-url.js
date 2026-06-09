const { Storage } = require('@google-cloud/storage');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch(e) { body = {}; } }
    if (!body) {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch(e) { body = {}; }
    }

    const { folder, name, contentType, data } = body;
    if (!folder || !name || !data) {
      return res.status(400).json({ error: 'Faltan parámetros: folder, name, data' });
    }

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    if (!GCP_SERVICE_ACCOUNT) return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);
    const storage = new Storage({ credentials: serviceAccount, projectId: serviceAccount.project_id });

    const BUCKET = 'legado-videos';
    const objectPath = `uploads/${folder}/${name}`;
    const fileBuffer = Buffer.from(data, 'base64');

    await storage.bucket(BUCKET).file(objectPath).save(fileBuffer, {
      metadata: { contentType: contentType || 'application/octet-stream' },
    });

    return res.status(200).json({ ok: true, path: objectPath });

  } catch(err) {
    console.error('Error en /api/upload-url:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
