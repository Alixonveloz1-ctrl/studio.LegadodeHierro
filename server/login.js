// api/login.js — Valida la contrasena contra el servidor al iniciar sesion.
// El frontend manda la contrasena en la cabecera x-app-key. Aqui se compara
// con APP_KEY (variable de Vercel). Devuelve 200 si coincide (o si no hay
// APP_KEY: candado abierto), o 401 si no. No gasta creditos: solo verifica.

const { keyMatches } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const open = !process.env.APP_KEY; // true si aun no configuras la clave en Vercel
  if (keyMatches(req)) return res.status(200).json({ ok: true, open: open });
  return res.status(401).json({ ok: false });
};
