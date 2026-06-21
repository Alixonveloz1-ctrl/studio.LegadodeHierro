// api/video-start.js
// Inicia la generacion de UN clip de video con Veo 3.1 Lite (imagen-a-video).
// Responde en segundos con un "operationName" -- NO espera a que el video termine.
// El frontend usa ese operationName con /api/video-status para hacer polling.

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

    const { imageBase64, prompt } = body;
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Faltan parametros: imageBase64, prompt' });
    }

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'anime-ai-studio-497502';
    const GCS_OUTPUT_BUCKET = (process.env.GCS_OUTPUT_BUCKET || 'gs://legado-videos').trim();
    const REGION = 'us-central1';
    const MODEL = 'veo-3.1-lite-generate-001';

    if (!GCP_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
    }

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);

    // Autenticacion -- misma libreria que ya usa el proyecto (google-auth-library)
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predictLongRunning`;

    const instance = {
      prompt: prompt,
      image: {
        bytesBase64Encoded: imageBase64,
        mimeType: 'image/png',
      },
    };

    const veoResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': GCP_PROJECT_ID,
      },
      body: JSON.stringify({
        instances: [instance],
        parameters: {
          aspectRatio: '9:16',
          storageUri: GCS_OUTPUT_BUCKET,
          sampleCount: 1,
          personGeneration: 'allow_adult',
          generateAudio: false,
          negativePrompt: 'deformed hands, extra fingers, missing fingers, merged fingers, bad anatomy, blurry, watermark, text overlay',
        },
      }),
    });

    if (!veoResponse.ok) {
      const errText = await veoResponse.text();
      let errMsg = 'Error ' + veoResponse.status;
      try {
        const errJson = JSON.parse(errText);
        if (errJson && errJson.error && errJson.error.message) errMsg = errJson.error.message;
      } catch (e) {}
      return res.status(veoResponse.status).json({ error: errMsg });
    }

    const veoData = await veoResponse.json();
    if (!veoData.name) {
      return res.status(500).json({ error: 'Veo no devolvio un operationName valido' });
    }

    return res.status(200).json({ operationName: veoData.name });

  } catch (err) {
    console.error('Error en /api/video-start:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
