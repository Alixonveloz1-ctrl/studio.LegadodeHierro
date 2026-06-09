// api/assemble.js
// Solo dispara el Cloud Run Job y devuelve el operationName inmediatamente.
const { GoogleAuth } = require('google-auth-library');

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

    const { folder, imageCount, lang, slug } = body;
    if (!folder || !imageCount || !lang) {
      return res.status(400).json({ error: 'Faltan parámetros: folder, imageCount, lang' });
    }

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';
    const CLOUD_RUN_JOB_NAME = 'legado-assembler';
    const CLOUD_RUN_REGION = 'us-central1';

    if (!GCP_SERVICE_ACCOUNT) return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const tokenData = await client.getAccessToken();
    const accessToken = tokenData.token;

    const jobData = JSON.stringify({
      folder, imageCount, lang, slug: slug || 'reel',
    });

    const jobUrl = `https://${CLOUD_RUN_REGION}-run.googleapis.com/v2/projects/${GCP_PROJECT_ID}/locations/${CLOUD_RUN_REGION}/jobs/${CLOUD_RUN_JOB_NAME}:run`;

    const jobResponse = await fetch(jobUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        overrides: {
          containerOverrides: [{
            env: [{ name: 'JOB_DATA', value: jobData }],
          }],
        },
      }),
    });

    const jobText = await jobResponse.text();
    if (!jobResponse.ok) {
      return res.status(500).json({ error: 'Error disparando Cloud Run Job: ' + jobText });
    }

    const jobResult = JSON.parse(jobText);
    // Devuelve el operationName para que el cliente haga polling
    return res.status(200).json({ operationName: jobResult.name });

  } catch(err) {
    console.error('Error en /api/assemble:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
