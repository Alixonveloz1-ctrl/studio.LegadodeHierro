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
      folder: folder,
      imageCount: imageCount,
      lang: lang,
      slug: slug || 'reel',
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

    if (!jobResponse.ok) {
      const errText = await jobResponse.text();
      return res.status(500).json({ error: 'Error disparando Cloud Run Job: ' + errText });
    }

    const jobResult = await jobResponse.json();
    const operationName = jobResult.name;
    const operationUrl = `https://${CLOUD_RUN_REGION}-run.googleapis.com/v2/${operationName}`;

    let signedUrl = null;
    const maxWait = 600000;
    const pollInterval = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));

      const pollResponse = await fetch(operationUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const pollData = await pollResponse.json();

      if (pollData.done) {
        if (pollData.error) {
          return res.status(500).json({ error: 'Job falló: ' + JSON.stringify(pollData.error) });
        }

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
        if (logsData.entries && logsData.entries.length > 0) {
          for (const entry of logsData.entries) {
            const text = entry.textPayload || '';
            if (text.includes('SIGNED_URL:')) {
              signedUrl = text.split('SIGNED_URL:')[1].trim();
              break;
            }
          }
        }
        break;
      }
    }

    if (!signedUrl) {
      return res.status(500).json({ error: 'No se pudo obtener la URL del video generado' });
    }

    return res.status(200).json({ url: signedUrl });

  } catch(err) {
    console.error('Error en /api/assemble:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
};
