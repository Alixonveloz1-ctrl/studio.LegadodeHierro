// api/assemble.js
// Endpoint que recibe imágenes + audio + SRT y dispara el Cloud Run Job en Google Cloud
// Devuelve URL firmada del MP4 generado

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { images, audio, srt, lang, slug } = req.body;

    if (!images || !audio || !srt || !lang) {
      return res.status(400).json({ error: 'Faltan parámetros: images, audio, srt, lang' });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'images debe ser un array con al menos una imagen' });
    }

    // Obtener token de autenticación para Google Cloud
    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';
    const CLOUD_RUN_JOB_NAME = 'legado-assembler';
    const CLOUD_RUN_REGION = 'us-central1';

    if (!GCP_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
    }

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);

    // Generar JWT para autenticación con Google Cloud
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Preparar datos del job
    const jobData = JSON.stringify({ images, audio, srt, lang, slug: slug || 'reel' });

    // Disparar Cloud Run Job con los datos como variable de entorno
    const jobUrl = `https://${CLOUD_RUN_REGION}-run.googleapis.com/v2/projects/${GCP_PROJECT_ID}/locations/${CLOUD_RUN_REGION}/jobs/${CLOUD_RUN_JOB_NAME}:run`;

    const jobResponse = await fetch(jobUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
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

    // Polling: esperar hasta que el job termine (máx 10 minutos)
    const operationUrl = `https://${CLOUD_RUN_REGION}-run.googleapis.com/v2/${operationName}`;
    let signedUrl = null;
    const maxWait = 600000; // 10 minutos
    const pollInterval = 5000; // cada 5 segundos
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, pollInterval));

      const pollResponse = await fetch(operationUrl, {
        headers: { 'Authorization': `Bearer ${accessToken.token}` },
      });
      const pollData = await pollResponse.json();

      if (pollData.done) {
        if (pollData.error) {
          return res.status(500).json({ error: 'Job falló: ' + JSON.stringify(pollData.error) });
        }
        // Job completado — obtener URL del log
        // La URL firmada la escribe el job en los logs con prefijo SIGNED_URL:
        const logsUrl = `https://logging.googleapis.com/v2/entries:list`;
        const logsResponse = await fetch(logsUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
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

  } catch (err) {
    console.error('Error en /api/assemble:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
