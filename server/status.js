// Estado de configuración, sin exponer valores ni llamar a proveedores de pago.
// Solo indica si cada variable necesaria está configurada en Vercel.
// Facebook no tiene integración por API en esta herramienta: la publicación
// es manual, así que siempre se informa como tal, nunca como "conectado".
const {jsonHandler} = require('./_store');
module.exports = jsonHandler(async (b, res) => {
  const google = !!(process.env.GCP_PROJECT_ID && process.env.GCS_OUTPUT_BUCKET && process.env.GCP_SERVICE_ACCOUNT);
  return res.json({
    success: true,
    googleCloud: google,
    imageVideo: google,
    elevenLabs: !!process.env.ELEVENLABS_API_KEY,
    montage: !!(process.env.CLOUD_RUN_UNIFY_URL && process.env.UNIFY_KEY),
    facebookApi: false,
  });
});
