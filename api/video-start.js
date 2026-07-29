// api/video-start.js
// Inicia la generacion de UN clip de video con Veo (imagen-a-video) via Vertex AI.
// Responde en segundos con un "operationName" -- NO espera a que el video termine.
// El frontend usa ese operationName con /api/video-status para hacer polling.
//
// Acepta en el body:
//   imageBase64 (obligatorio)
//   prompt      (obligatorio)
//   model       (opcional) veo-3.1-lite-generate-001 (DEFECTO) |
//                          veo-3.1-fast-generate-001 | veo-3.1-generate-001 |
//                          veo-2.0-generate-001
//   aspectRatio (opcional) 9:16 (DEFECTO) | 16:9   (Veo solo admite estos dos)

const ALLOWED_VIDEO_MODELS = {
  'veo-3.1-lite-generate-001': true,
  'veo-3.1-fast-generate-001': true,
  'veo-3.1-generate-001': true,
  'veo-2.0-generate-001': true,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  // Puerta de seguridad en linea (este archivo es ESM: no usa require). Si APP_KEY
  // esta configurada, exige la cabecera x-app-key; sin APP_KEY queda abierto.
  const APP_KEY = process.env.APP_KEY || '';
  if (APP_KEY && (req.headers['x-app-key'] || '') !== APP_KEY) {
    return res.status(401).json({ error: 'No autorizado. Vuelve a entrar con tu contrasena.', code: 'APP_AUTH' });
  }
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

    let model = body.model ? String(body.model) : 'veo-3.1-lite-generate-001';
    if (!ALLOWED_VIDEO_MODELS[model]) model = 'veo-3.1-lite-generate-001';
    let aspectRatio = body.aspectRatio === '16:9' ? '16:9' : '9:16';

    const GCP_SERVICE_ACCOUNT = process.env.GCP_SERVICE_ACCOUNT;
    // Sin nombres de respaldo: proyecto y bucket SIEMPRE vienen de la configuracion de Vercel.
    const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
    const GCS_OUTPUT_BUCKET = (process.env.GCS_OUTPUT_BUCKET || '').trim();
    if (!GCP_PROJECT_ID) {
      return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
    }
    if (!GCS_OUTPUT_BUCKET) {
      return res.status(500).json({ error: 'GCS_OUTPUT_BUCKET no configurado en Vercel' });
    }
    const REGION = 'us-central1';

    if (!GCP_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
    }

    const serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT);

    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${REGION}/publishers/google/models/${model}:predictLongRunning`;

    const instance = {
      prompt: prompt,
      image: {
        bytesBase64Encoded: imageBase64,
        mimeType: 'image/png',
      },
    };

    const parameters = {
      aspectRatio: aspectRatio,
      storageUri: GCS_OUTPUT_BUCKET,
      sampleCount: 1,
      personGeneration: 'allow_adult',
      negativePrompt: 'deformed hands, extra fingers, missing fingers, merged fingers, bad anatomy, blurry, watermark, text overlay, hopping, skipping, bouncing, little jumps, stutter-stepping, moonwalking, floating, childish scribbles, scribbling, random squiggles, meaningless zigzag lines, crayon marks, rain, raindrops, snow, storm, wet floor, water on surfaces, indoor rain, weather indoors, morphing objects, transforming objects, object turning into another object, two pens, writing with both hands, trembling hands, shaking hands, jittering, papers flying, papers jumping',
    };
    // generateAudio solo existe en Veo 3.x; en Veo 2 el parametro no aplica.
    if (/^veo-3/.test(model)) parameters.generateAudio = false;

    const veoResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': GCP_PROJECT_ID,
      },
      body: JSON.stringify({
        instances: [instance],
        parameters: parameters,
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

    // Devolvemos tambien el modelo para que el polling lo use como respaldo.
    return res.status(200).json({ operationName: veoData.name, model: model });

  } catch (err) {
    console.error('Error en /api/video-start:', err);
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
