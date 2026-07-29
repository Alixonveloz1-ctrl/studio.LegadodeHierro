// api/_auth.js — Puerta de seguridad simple para uso personal.
//
// IDEA: proteger los creditos. Cada endpoint del API exige una cabecera
// "x-app-key" igual a la variable APP_KEY que configures en Vercel. Sin ella,
// responde 401 y no gasta ni un credito.
//
// A PRUEBA DE BLOQUEO: si APP_KEY NO esta configurada en Vercel, TODO queda
// ABIERTO (funciona igual que antes). Asi nunca te quedas afuera por accidente.
// En cuanto pones APP_KEY, el candado se activa solo en todos los endpoints.
//
// La clave vive SOLO en las variables de Vercel y en tu navegador; jamas en el
// codigo ni en GitHub.

const crypto = require('crypto');

// true si la peticion trae la clave correcta (o si el candado esta abierto).
function keyMatches(req) {
  const key = process.env.APP_KEY || '';
  if (!key) return true; // sin APP_KEY => modo abierto
  const got = ((req.headers && (req.headers['x-app-key'] || req.headers['X-App-Key'])) || '').toString();
  const a = Buffer.from(got);
  const b = Buffer.from(key);
  // Comparacion en tiempo constante; primero descarta por longitud (evita que
  // timingSafeEqual lance por tamanos distintos).
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Devuelve true si la peticion puede continuar. Si no, responde 401 y devuelve
// false (el endpoint debe hacer `if (!checkAuth(req, res)) return;`).
function checkAuth(req, res) {
  if (keyMatches(req)) return true;
  // El marcador code:'APP_AUTH' distingue ESTE 401 (la contrasena de la app) de
  // un 401 que venga de un proveedor externo (ElevenLabs, Google...). Sin el, el
  // navegador confundia "ElevenLabs rechazo la clave" con "tu sesion expiro" y
  // echaba al login tapando el error de verdad.
  res.status(401).json({ error: 'No autorizado. Vuelve a entrar con tu contrasena.', code: 'APP_AUTH' });
  return false;
}

module.exports = { checkAuth, keyMatches };
