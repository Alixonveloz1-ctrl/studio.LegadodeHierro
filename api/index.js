// Keep the public URLs while sharing one Node function on the personal plan.
// Explicit imports let Vercel package each handler without exposing helpers.
const handlers = {
  audio: () => require('../server/audio'),
  generate: () => require('../server/generate'),
  image: () => require('../server/image'),
  login: () => require('../server/login'),
  music: () => require('../server/music'),
  'music-gen': () => require('../server/music-gen'),
  refs: () => require('../server/refs'),
  studio: () => require('../server/studio'),
  'studio-job': () => require('../server/studio-job'),
  trends: () => require('../server/trends'),
  unify: () => require('../server/unify'),
  'unify-status': () => require('../server/unify-status'),
  'video-start': () => require('../server/video-start'),
  videos: () => require('../server/videos'),
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const endpoint = req.query && req.query.endpoint;
  if (typeof endpoint !== 'string' || !Object.hasOwn(handlers, endpoint)) {
    return res.status(404).json({error: 'Ruta no encontrada.'});
  }
  return handlers[endpoint]()(req, res);
};
