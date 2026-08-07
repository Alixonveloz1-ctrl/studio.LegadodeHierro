// api/_auth.js — Puerta de seguridad simple para uso personal.
//
// IDEA: proteger los creditos. Cada endpoint del API exige una cabecera
// "x-app-key" igual a la variable APP_KEY que configures en Vercel. Sin ella,
// responde 401 y no gasta ni un credito.
//
// A PRUEBA DE BLOQUEO, PERO NO EN PRODUCCION. Si APP_KEY no esta configurada:
//   - en desarrollo o en una vista previa: TODO queda ABIERTO, para no quedarte
//     afuera mientras pruebas.
//   - en PRODUCCION: se cierra. Antes se abria tambien aqui, y eso significaba
//     que si la variable se borraba, se renombraba o no se propagaba a un
//     entorno, la API entera quedaba publica y cualquiera podia quemar Veo a
//     0,30-0,60 USD el clip sin que nada avisara. Un fallo de configuracion no
//     puede costar dinero.
//
// La clave vive SOLO en las variables de Vercel y en tu navegador; jamas en el
// codigo ni en GitHub.

const crypto = require('crypto');

// true si el candado esta abierto de forma LEGITIMA (sin APP_KEY y fuera de
// produccion). En produccion sin APP_KEY nunca se abre.
function modoAbierto() {
  if (process.env.APP_KEY) return false;
  return (process.env.VERCEL_ENV || 'development') !== 'production';
}

// true si la peticion trae la clave correcta (o si el candado esta abierto).
function keyMatches(req) {
  const key = process.env.APP_KEY || '';
  if (!key) return modoAbierto(); // sin APP_KEY: abierto solo fuera de produccion
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
  // Sin APP_KEY en produccion el mensaje tiene que decir la verdad: no es que la
  // contrasena este mal, es que falta configurar la variable. Si no, verias
  // "contrasena incorrecta" y estarias horas probando contrasenas.
  if (!process.env.APP_KEY) {
    res.status(401).json({
      error: 'Falta configurar APP_KEY en Vercel. La API esta cerrada por seguridad hasta que la configures.',
      code: 'APP_AUTH', sinClave: true,
    });
    return false;
  }
  // El marcador code:'APP_AUTH' distingue ESTE 401 (la contrasena de la app) de
  // un 401 que venga de un proveedor externo (ElevenLabs, Google...). Sin el, el
  // navegador confundia "ElevenLabs rechazo la clave" con "tu sesion expiro" y
  // echaba al login tapando el error de verdad.
  res.status(401).json({ error: 'No autorizado. Vuelve a entrar con tu contrasena.', code: 'APP_AUTH' });
  return false;
}

module.exports = { checkAuth, keyMatches, modoAbierto };
