// api/assemble-status.js
// Verifica el estado del Cloud Run Job y devuelve la URL firmada cuando termina.
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

    const { operationName } = body;
    if (!operationName) return res.status(400).json({ error: 'Falta operationName' });

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

    // Verificar estado de la operación
    const operationUrl = `https://${CLOUD_RUN_REGION}-run.googleapis.com/v2/${operationName}`;
    const pollResponse = await fetch(operationUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const pollData = await pollResponse.json();

    if (!pollData.done) {
      return res.status(200).json({ status: 'running' });
    }

    if (pollData.error) {
      return res.status(500).json({ error: 'Job falló: ' + JSON.stringify(pollData.error) });
    }

    // Job terminó — buscar URL firmada en los logs
    const logsResponse = await fetch('https://logging.googleapis.com/v2/entries:list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resourceNames: [`projects/${GCP_PROJECT_ID}`],
        filter: `resource.type="cloud_run_job" AND resource.labels.job_name="${CLOUD_RUN_JOB_NAME}" AND textPayload:"SIGNED_URL:"`,
        orderBy: 'timestamp desc',
        pageSize: 5,
      }),
    });

    const logsData = await logsResponse.json();
    let signedUrl = null;

    if (logsData.entries && logsData.entries.length > 0) {
      for (const entry of logsData.entries) {
        const text = entry.textPayload || '';
        if (text.includes('SIGNED_URL:')) {
          signedUrl = text.split('SIGNED_URL:')[1].trim();
          break;
        }
      }
    }

    if (!signedUrl) {
      return res.status(500).json({ error: 'Job completado pero no se encontró la URL del video' });
    }

    return res.status(200).json({ status: 'done', url: signedUrl });

  } catch(err) {
    console.error('Error en /api/assemble-status:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
