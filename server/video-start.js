// api/video-start.js
// Inicia la generacion de UN clip de video con Veo (imagen-a-video) via Vertex AI.
// Responde en segundos con un "operationName" -- NO espera a que el video termine.
// El frontend usa ese operationName con /api/video-status para hacer polling.
//
// Acepta en el body:
//   imageBase64 (obligatorio)
//   prompt      (obligatorio)
//   model       (opcional) veo-3.1-lite-generate-001 (DEFECTO) |
//                          veo-3.1-fast-generate-001 |
//                          veo-2.0-generate-001 |
//                          gemini-omni-1.2-flash-360p | gemini-omni-1.2-flash-720p
//                          (Gemini Omni 1.2 Flash en dos calidades; rama Omni abajo)
//   aspectRatio (opcional) 9:16 (DEFECTO) | 16:9   (Veo solo admite estos dos)

const ALLOWED_VIDEO_MODELS = {
  'veo-3.1-lite-generate-001': true,
  'veo-3.1-fast-generate-001': true,
  'veo-2.0-generate-001': true,
};

// Gemini Omni 1.2 Flash: en el selector son DOS entradas (calidad 360p o 720p)
// sobre el MISMO modelo. No es Veo: no usa predictLongRunning sino la
// Interactions API de Vertex (rama Omni mas abajo).
const OMNI_VIDEO_MODELS = {
  'gemini-omni-1.2-flash-360p': '360p',
  'gemini-omni-1.2-flash-720p': '720p',
};
const OMNI_MODEL_ID = 'gemini-omni-1.2-flash';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  // Puerta de seguridad en linea. Mismo
  // criterio que api/_auth.js: sin APP_KEY se abre SOLO fuera de produccion.
  // Este es el endpoint mas caro de todos (Veo cuesta por clip), asi que un
  // fallo de configuracion aqui no puede dejarlo publico.
  const APP_KEY = process.env.APP_KEY || '';
  if (!APP_KEY) {
    if ((process.env.VERCEL_ENV || 'development') === 'production') {
      return res.status(401).json({
        error: 'Falta configurar APP_KEY en Vercel. La API esta cerrada por seguridad hasta que la configures.',
        code: 'APP_AUTH', sinClave: true,
      });
    }
  } else if ((req.headers['x-app-key'] || '') !== APP_KEY) {
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
    if (!ALLOWED_VIDEO_MODELS[model] && !OMNI_VIDEO_MODELS[model]) model = 'veo-3.1-lite-generate-001';
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

    // CARPETA PROPIA. Antes los clips caian en la RAIZ del bucket y se mezclaban
    // con los de otros proyectos que comparten el mismo bucket, y en el banco no
    // habia forma de distinguirlos. Desde aqui, todo lo de este canal vive bajo
    // legado-videos/ y el banco puede filtrar por esa carpeta.
    let baseBucket = GCS_OUTPUT_BUCKET.replace(/\/+$/, '');
    if (!/^gs:\/\//i.test(baseBucket)) baseBucket = 'gs://' + baseBucket;
    const destino = baseBucket + '/legado-videos/';

    // ── GEMINI OMNI 1.2 FLASH ─────────────────────────────────────────────
    // Omni NO tiene operacion larga como Veo: vive en la Interactions API de
    // Vertex (endpoint global, v1beta1, mismo token de la cuenta de servicio)
    // y la llamada responde SINCRONA con el MP4 en base64 dentro de los
    // "steps". El clip se guarda en la misma carpeta legado-videos/ que los
    // de Veo y se devuelve su gs:// como operationName: /api/video-status lo
    // reconoce y firma la URL igual que un clip de Veo terminado, asi el
    // resto de la app no distingue el origen.
    // Omni genera su propio audio y NO admite prompt negativo separado: el
    // silencio (el montaje solo usa narracion y musica; el unificador ya
    // descarta el audio de cada clip) y las prohibiciones del canal van
    // dentro del propio texto, como recomienda la documentacion del modelo.
    if (OMNI_VIDEO_MODELS[model]) {
      const resolution = OMNI_VIDEO_MODELS[model];
      const omniMime = imageBase64.startsWith('/9j/') ? 'image/jpeg'
        : imageBase64.startsWith('UklGR') ? 'image/webp' : 'image/png';
      const omniPrompt = prompt +
        '\nImportant: no dialogue, no speech, no voices — nobody talks or moves their mouth as if speaking. No music, no sound effects: a completely silent clip. No rain or weather effects. No text, captions or watermarks on screen.';
      const omniRes = await fetch('https://aiplatform.googleapis.com/v1beta1/projects/' + GCP_PROJECT_ID + '/locations/global/interactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
          'X-Goog-User-Project': GCP_PROJECT_ID,
        },
        body: JSON.stringify({
          model: OMNI_MODEL_ID,
          input: [
            { type: 'image', data: imageBase64, mime_type: omniMime },
            { type: 'text', text: omniPrompt },
          ],
          response_format: {
            type: 'video',
            resolution: resolution,
            aspect_ratio: aspectRatio,
            duration: '8s',
          },
          generation_config: { video_config: { task: 'image_to_video' } },
        }),
        signal: AbortSignal.timeout(270000),
      });
      if (!omniRes.ok) {
        const errText = await omniRes.text();
        let errMsg = 'Error ' + omniRes.status;
        try {
          const errJson = JSON.parse(errText);
          if (errJson && errJson.error && errJson.error.message) errMsg = errJson.error.message;
        } catch (e) {}
        return res.status(omniRes.status).json({ error: errMsg });
      }
      const omniData = await omniRes.json();
      let videoPart = null;
      const steps = (omniData && omniData.steps) || [];
      for (const step of steps) {
        if (!step || step.type !== 'model_output' || !Array.isArray(step.content)) continue;
        for (const part of step.content) {
          if (part && part.type === 'video') { videoPart = part; break; }
        }
        if (videoPart) break;
      }
      let bytes = null;
      if (videoPart && videoPart.data) {
        bytes = Buffer.from(videoPart.data, 'base64');
      } else if (videoPart && videoPart.uri) {
        // Entrega por URI (clips grandes): se descargan los bytes aqui para
        // guardar el clip en NUESTRO bucket, como cualquier clip de Veo.
        const uri = String(videoPart.uri);
        let dl;
        if (uri.indexOf('gs://') === 0) {
          const resto = uri.slice(5), slash = resto.indexOf('/');
          dl = await fetch('https://storage.googleapis.com/storage/v1/b/' + encodeURIComponent(resto.slice(0, slash)) + '/o/' + encodeURIComponent(resto.slice(slash + 1)) + '?alt=media', {
            headers: { 'Authorization': `Bearer ${accessToken.token}` },
            signal: AbortSignal.timeout(120000),
          });
        } else {
          dl = await fetch(uri, { signal: AbortSignal.timeout(120000) });
        }
        if (!dl.ok) return res.status(502).json({ error: 'Omni genero el video pero no se pudo descargar de su direccion de entrega.' });
        bytes = Buffer.from(await dl.arrayBuffer());
      }
      if (!bytes || !bytes.length) {
        const st = omniData && omniData.status ? String(omniData.status) : '';
        return res.status(500).json({ error: 'Omni termino sin entregar video' + (st ? ' (estado: ' + st + ')' : '') + '. Puede ser un bloqueo de los filtros de seguridad de Google: reformula el prompt de esta escena e intenta de nuevo.' });
      }
      const hash = require('crypto').createHash('sha256').update(bytes).digest('hex');
      const object = 'legado-videos/omni-' + hash + '.mp4';
      const store = require('./_store').makeStore(AbortSignal.timeout(120000));
      try { await store.bytes(object, bytes, 'video/mp4'); } catch (e) { if (e.status !== 412) throw e; }
      return res.status(200).json({ operationName: destino + 'omni-' + hash + '.mp4', model: model });
    }

    const parameters = {
      aspectRatio: aspectRatio,
      storageUri: destino,
      sampleCount: 1,
      personGeneration: 'allow_adult',
      negativePrompt: 'deformed hands, extra fingers, missing fingers, merged fingers, bad anatomy, blurry, watermark, text overlay, hopping, skipping, bouncing, little jumps, stutter-stepping, moonwalking, floating, childish scribbles, scribbling, random squiggles, meaningless zigzag lines, crayon marks, rain, raining, rainfall, raindrops, drizzle, downpour, snow, storm, thunderstorm, mist, fog, wet floor, wet surfaces, water on surfaces, water droplets, puddles, splashing water, dripping water, indoor rain, rain inside a room, rain inside a car, water falling indoors, weather effects indoors, damp, soaked, morphing objects, transforming objects, object turning into another object, two pens, writing with both hands, trembling hands, shaking hands, jittering, papers flying, papers jumping',
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
