'use strict';
// ============================================================================
// Servidor de producción de Legado De Hierro Studio en Google Cloud Run.
//
// Sirve los archivos estáticos de public/ y despacha cada ruta /api/... a los
// MISMOS controladores que hoy corren en Vercel:
//   - /api/<nombre>      -> api/index.js con ?endpoint=<nombre>
//                           (los mismos destinos que los "rewrites" de
//                           vercel.json; los controladores viven en server/)
//   - /api/video-status  -> api/video-status.js (controlador estilo Edge;
//                           se carga como módulo ES desde video-status.mjs,
//                           copia que hace el Dockerfile al construir)
//
// No cambia ninguna ruta pública ni el comportamiento de los controladores:
// solo reproduce, con la biblioteca estándar de Node, lo que Vercel hacía
// (parseo del cuerpo JSON, req.query, res.status().json()).
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const PORT = process.env.PORT || 8080;
const BODY_LIMIT = 64 * 1024 * 1024; // los trabajos llevan textos largos, no archivos

// Los mismos endpoints que vercel.json reescribe hacia api/index.js.
const ENDPOINTS = new Set([
  'audio', 'generate', 'image', 'login', 'music', 'music-gen', 'refs',
  'studio', 'studio-job', 'status', 'trends', 'unify', 'unify-status',
  'video-start', 'videos',
]);

const apiIndex = require('./api/index.js');

let videoStatusHandler = null;
async function loadVideoStatus() {
  if (!videoStatusHandler) {
    const mod = await import(pathToFileURL(path.join(ROOT, 'video-status.mjs')).href);
    videoStatusHandler = mod.default;
  }
  return videoStatusHandler;
}

// Añade a la respuesta de Node las dos ayudas que Vercel ofrece y que los
// controladores usan en todo el código: res.status(n) encadenable y res.json().
function shimRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    if (!res.hasHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(obj));
    return res;
  };
  return res;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        const e = new Error('Cuerpo de la petición demasiado grande.');
        e.status = 413;
        reject(e);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handleVideoStatus(req, res) {
  const handler = await loadVideoStatus();
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = Array.isArray(v) ? v.join(', ') : v;
  }
  const init = { method: req.method, headers };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req; // el flujo crudo de Node: el controlador hace req.json()
    init.duplex = 'half';
  }
  const request = new Request('http://localhost' + req.url, init);
  const response = await handler(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    try { res.setHeader(key, value); } catch (e) { /* cabecera no reenviable */ }
  });
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function handleApi(req, res, url, name) {
  shimRes(res);
  if (name === 'video-status') return handleVideoStatus(req, res);
  if (!ENDPOINTS.has(name)) {
    return res.status(404).json({ error: 'Ruta no encontrada.' });
  }
  // Vercel parsea el cuerpo JSON antes de llamar al controlador; los
  // controladores que leen el flujo crudo solo lo hacen si falta req.body.
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('application/json')) {
    const text = (await readBody(req)).toString('utf8');
    try { req.body = JSON.parse(text); } catch (e) { req.body = text; }
  }
  req.query = Object.fromEntries(url.searchParams);
  req.query.endpoint = name; // la ruta manda sobre cualquier parámetro
  return apiIndex(req, res);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.sh': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
// Las mismas cabeceras que vercel.json pone a la portada y los archivos
// principales de la app: que el navegador nunca sirva una copia vieja.
const REVALIDATE = new Set(['/', '/index.html', '/app.js', '/studio.js', '/studio-core.js', '/studio.css']);

function serveStatic(req, res, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch (e) { pathname = url.pathname; }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(PUBLIC_DIR, pathname);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Prohibido.');
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No encontrado.');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
      'Cache-Control': REVALIDATE.has(url.pathname) || REVALIDATE.has(pathname)
        ? 'public, max-age=0, must-revalidate'
        : 'public, max-age=3600',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url, url.pathname.slice('/api/'.length));
    } else {
      serveStatic(req, res, url);
    }
  } catch (e) {
    console.error('Error no controlado:', e);
    if (!res.headersSent) {
      try {
        shimRes(res);
        res.status(e.status && e.status < 600 ? e.status : 500)
          .json({ error: 'Error interno del servidor.' });
      } catch (ignored) { /* la respuesta ya salió */ }
    } else {
      try { res.end(); } catch (ignored) { /* nada que cerrar */ }
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Legado De Hierro Studio escuchando en el puerto ' + PORT);
});
