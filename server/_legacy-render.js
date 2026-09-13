// Temporary adapter for the already-deployed renderer. Its limitations stay
// explicit: no mixed timeline or durable retry until Cloud Run is updated.
const {failure, signedUrl} = require('./_store');
const MAX_BODY = 35 * 1024 * 1024; // Old service rejects 40 MiB.

async function legacyPayload(body, store) {
  const kinds = new Set(body.shots.map(s => s.kind));
  if (kinds.size !== 1) throw failure('El montaje que combina imágenes y clips necesita actualizar Google Cloud. Tus materiales y tu guion están guardados.',409);
  const images = kinds.has('image');
  const seconds = body.shots.reduce((total, s) => total + Number(s.duration), 0);
  if (body.shots.length > (images ? 12 : 60)) throw failure('Este montaje tiene más tomas de las que admite el servidor anterior. Actualiza Google Cloud para montarlo completo.',409);
  if (images && (seconds > body.shots.length * 10 || seconds < body.shots.length * 4 / 3.5)) {
    throw failure('La duración de estas imágenes necesita el montaje nuevo de Google Cloud. El guion y la narración se conservan.',409);
  }
  // The old image renderer divides narration equally; never silently discard
  // custom timing that this service cannot reproduce.
  if (images && body.shots.some(s => Math.abs(s.duration - seconds / body.shots.length) > 0.1)) {
    throw failure('Las tomas con duraciones distintas necesitan actualizar el montaje de Google Cloud.',409);
  }
  const payload = {videos: [], imagenes: [], audioParts: [], music: body.music,
    srt: body.srt, targetSeconds: body.targetSeconds};
  let budget = MAX_BODY - Buffer.byteLength(JSON.stringify(payload), 'utf8');
  const cache = new Map();
  async function base64(object) {
    let encoded = cache.get(object);
    if (!encoded) {
      const remainingBytes = Math.floor((budget - 16) / 4) * 3;
      if (remainingBytes <= 0) throw failure('Este montaje necesita actualizar Google Cloud por su tamaño.',409);
      encoded = (await store.readBytes(object, remainingBytes)).toString('base64');
      cache.set(object, encoded);
    }
    budget -= encoded.length + 4;
    if (budget < 0) throw failure('Este montaje necesita actualizar Google Cloud por su tamaño.',409);
    return encoded;
  }
  for (const object of body.audioObjects) payload.audioParts.push(await base64(object));
  for (const shot of body.shots) {
    if (images) payload.imagenes.push(await base64(shot.object));
    else payload.videos.push(signedUrl(shot.object));
  }
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > MAX_BODY) throw failure('Este montaje necesita actualizar Google Cloud por su tamaño.',409);
  return payload;
}

module.exports = {legacyPayload};
