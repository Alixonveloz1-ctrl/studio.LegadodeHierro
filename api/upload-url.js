// api/upload-url.js
// Genera URLs firmadas (V4) para subir archivos directamente a GCS desde el cliente.
// Esto evita enviar imágenes/audio gigantes en el body de un fetch (que rompe Chrome iOS).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    if (!body) {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch (e) { body = {}; }
    }

    const { folder, files } = body;
    if (!folder || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Faltan parámetros: folder, files[]' });
    }

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    if (!GCP_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
    }
    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);

    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage({ credentials: serviceAccount, projectId: serviceAccount.project_id });
    const BUCKET = 'legado-videos';

    // Generar una URL firmada de subida para cada archivo
    const uploads = [];
    for (const f of files) {
      const objectPath = `uploads/${folder}/${f.name}`;
      const [url] = await storage
        .bucket(BUCKET)
        .file(objectPath)
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 30 * 60 * 1000, // 30 minutos
          contentType: f.contentType || 'application/octet-stream',
        });
      uploads.push({ name: f.name, url: url, path: objectPath });
    }

    return res.status(200).json({ uploads: uploads });

  } catch (err) {
    console.error('Error en /api/upload-url:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
