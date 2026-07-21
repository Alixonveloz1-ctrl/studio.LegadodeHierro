// api/trends.js
// Punto 5 del plan: investigacion de tendencias virales EN VIVO.
// Usa Gemini con la herramienta googleSearch (grounding): el modelo busca en
// Google como parte de su respuesta, asi los hallazgos vienen de datos actuales
// de internet, no de su entrenamiento. Mismo proyecto y cuenta que /api/generate.

const MODEL = 'gemini-3.1-pro-preview';

async function getGCPToken() {
  const sa = JSON.parse(process.env.GCP_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const { createSign } = require('crypto');
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

// Piscina de ANGULOS de investigacion. Cada llamada toma unos pocos al azar y le
// pide a Gemini que explore ESOS rincones del nicho, para que la busqueda de Google
// y los conceptos cambien de verdad entre una investigacion y otra (no siempre lo mismo).
const ANGULOS = [
  'errores de dinero que comete la gente que quiere ser libre financieramente y ni lo nota',
  'hábitos y rutinas de dinero de quien ya lo logró contra quien sigue estancado',
  'mitos sobre hacerse rico que se están desmontando ahora mismo',
  'historias reales de transformación de empleado a dueño de su propio negocio',
  'el sacrificio y el costo emocional que nadie te cuenta del emprendimiento',
  'sistemas concretos de disciplina, ahorro e inversión paso a paso',
  'cómo arrancar un negocio desde cero con muy poco dinero',
  'señales de mentalidad de pobre contra mentalidad de rico',
  'manejo de deudas y primeros pasos para invertir siendo principiante',
  'frases y lecciones de multimillonarios que se están volviendo virales',
  'comparación brutal: trabajar por dinero contra que el dinero trabaje por ti',
  'lo que nadie te dice antes de renunciar a tu empleo',
  'ingresos pasivos y activos de moda, explicados así de simple',
  'la psicología de por qué la mayoría nunca será libre financieramente',
  'rutinas de la mañana y disciplina de los que construyeron su propio imperio',
  'decisiones pequeñas de hoy que separan al que progresa del que se queda igual',
];
const PLATAFORMAS = ['Facebook Reels', 'Instagram Reels', 'TikTok', 'YouTube Shorts'];

function pickN(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i]; copy[i] = copy[j]; copy[j] = t;
  }
  return copy.slice(0, n);
}

function buildPrompt(avoid) {
  const hoy = new Date();
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const fecha = hoy.getUTCDate() + ' de ' + meses[hoy.getUTCMonth()] + ' de ' + hoy.getUTCFullYear();
  const angulos = pickN(ANGULOS, 3);
  const plataforma = pickN(PLATAFORMAS, 1)[0];

  let evita = '';
  if (Array.isArray(avoid) && avoid.length) {
    const lista = avoid.filter(function (x) { return typeof x === 'string' && x.trim(); })
      .map(function (x) { return String(x).trim().slice(0, 120); }).slice(0, 20);
    if (lista.length) {
      evita = '\nCONCEPTOS YA USADOS RECIENTEMENTE (NO los repitas ni los parafrasees, dame temas y enfoques NUEVOS y distintos a estos):\n- '
        + lista.join('\n- ') + '\n';
    }
  }

  return 'Eres el estratega de contenido de LEGADO DE HIERRO, canal de Facebook Reels en español sobre libertad financiera, disciplina, mentalidad y emprendimiento, dirigido a hombres hispanos que trabajan para otro y quieren construir lo suyo.\n\n'
    + 'Hoy es ' + fecha + '. Cada vez que investigas debes traer temas FRESCOS y diferentes a los de investigaciones pasadas: no te quedes en los conceptos genéricos de siempre (ahorrar, invertir, mentalidad a secas).\n\n'
    + 'BUSCA EN GOOGLE AHORA (no respondas de memoria) qué está funcionando en este momento en reels/shorts del nicho de finanzas personales, libertad financiera, motivación y emprendimiento EN ESPAÑOL, con atención especial a ' + plataforma + '. Investiga:\n'
    + '1. Qué tipos de GANCHOS de apertura se están repitiendo en los videos que explotan (las primeras frases).\n'
    + '2. Qué FORMATOS retienen más ahora mismo (duración, narración con imágenes, hablar a cámara, historias, listas).\n'
    + '3. Qué TEMAS específicos del nicho están teniendo un pico de interés estas semanas.\n'
    + '4. Patrones REPLICABLES: qué de todo eso puede aplicar este canal, siendo concreto.\n\n'
    + 'ENFOCA especialmente esta investigación (aunque no solo) en estos ángulos que hoy quiero explorar:\n- '
    + angulos.join('\n- ') + '\n'
    + evita + '\n'
    + 'Devuelve el resultado en TEXTO PLANO (sin markdown, sin **, sin ##), en español, con estas secciones exactas:\n\n'
    + 'GANCHOS QUE ESTÁN FUNCIONANDO\n(5 a 8 patrones de gancho, cada uno con un ejemplo adaptado al nicho)\n\n'
    + 'FORMATOS QUE RETIENEN\n(qué formato y duración están rindiendo mejor y por qué)\n\n'
    + 'TEMAS EN SUBIDA\n(temas del nicho con tracción ahora mismo)\n\n'
    + 'PARA REPLICAR ESTA SEMANA\n(3 a 5 acciones concretas para los próximos reels del canal, listas para ejecutar)\n\n'
    + 'CONCEPTOS PARA GENERAR\n'
    + 'Al final, EXACTAMENTE 5 líneas, una por concepto de reel basado en lo que encontraste viral y en los ángulos de arriba, con este formato exacto (sin numerar, sin texto extra):\n'
    + 'pilar|gancho|concepto\n\n'
    + 'PILARES válidos: libertad, mentalidad, sistema, herramientas, marca, inversion, negocio, millonario\n'
    + 'GANCHOS válidos: dato, pregunta, afirmacion, historia, pasos\n'
    + 'Los 5 conceptos deben ser DIFERENTES entre sí, de pilares variados (máximo 2 del mismo pilar), específicos y frescos (nada de clichés repetidos), máximo 15 palabras cada uno, en español impecable con tildes.';
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GCP_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'GCP_SERVICE_ACCOUNT no configurado' });
  }

  // Sin nombres de respaldo: el proyecto SIEMPRE viene de la configuracion de Vercel.
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  if (!PROJECT_ID) return res.status(500).json({ error: 'GCP_PROJECT_ID no configurado en Vercel' });
  const url = 'https://aiplatform.googleapis.com/v1/projects/' + PROJECT_ID +
    '/locations/global/publishers/google/models/' + MODEL + ':generateContent';

  // Conceptos que el frontend pide EVITAR (historial + investigacion anterior),
  // para que cada investigacion traiga temas nuevos y no siempre los mismos 5.
  let avoid = [];
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (body && Array.isArray(body.avoid)) avoid = body.avoid;
  } catch (_) { /* body opcional */ }

  try {
    const token = await getGCPToken();
    let r, d, lastErr = 'Error desconocido';

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // Se arma en CADA intento: angulos y plataforma al azar cambian la busqueda.
        const promptTxt = buildPrompt(avoid);
        r = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'X-Goog-User-Project': PROJECT_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptTxt }] }],
            // La herramienta de busqueda: Gemini consulta Google en vivo.
            tools: [{ googleSearch: {} }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.95,
              thinkingConfig: { thinkingLevel: 'LOW' },
            },
          }),
        });
        d = await r.json();
        if (r.ok) break;
        lastErr = (d && d.error && d.error.message) ? d.error.message : ('Error ' + r.status);
        console.warn('[trends] intento ' + (attempt + 1) + ' fallo: ' + lastErr);
        if (attempt < 1) await new Promise(rs => setTimeout(rs, 1500));
      } catch (e) {
        lastErr = e.message;
        if (attempt < 1) await new Promise(rs => setTimeout(rs, 1500));
      }
    }

    if (!r || !r.ok) {
      console.error('[trends] Gemini no respondio: ' + lastErr);
      return res.status(502).json({ error: 'La investigacion no respondio. ' + lastErr });
    }

    let text = null;
    const cand = d && d.candidates && d.candidates[0] ? d.candidates[0] : null;
    if (cand && cand.content && cand.content.parts) {
      for (const p of cand.content.parts) {
        if (p && typeof p.text === 'string' && p.text.trim()) {
          text = (text ? text + '\n' : '') + p.text;
        }
      }
    }
    if (!text || !text.trim()) {
      console.error('[trends] sin texto. Respuesta: ' + JSON.stringify(d).slice(0, 400));
      return res.status(502).json({ error: 'La investigacion no devolvio texto.' });
    }

    // Fuentes reales que Gemini consulto (grounding metadata), para mostrarlas en la UI.
    const sources = [];
    const gm = cand.groundingMetadata;
    if (gm && Array.isArray(gm.groundingChunks)) {
      for (const ch of gm.groundingChunks) {
        if (ch && ch.web && ch.web.uri) {
          sources.push({ title: ch.web.title || '', uri: ch.web.uri });
        }
      }
    }

    return res.json({ success: true, text: text, sources: sources, model: MODEL });
  } catch (e) {
    console.error('[trends] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message });
  }
};
