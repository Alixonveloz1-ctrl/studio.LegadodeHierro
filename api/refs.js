// Referencias de imagen servidas por el SERVIDOR (mas confiable que descargarlas
// en el navegador del celular, donde ibb.co a veces falla y el personaje sale mal).
// ?set=personaje -> las 4 referencias FIJAS del personaje de la marca (reels/miniatura)
// (sin set)      -> las 3 referencias del generador de posts
const SETS = {
  post: [
    'https://i.ibb.co/m5Cqfs5n/IMG-8206.jpg',
    'https://i.ibb.co/3m42CzNf/IMG-8162.jpg',
    'https://i.ibb.co/GvfhKnJ3/IMG-8117.jpg',
  ],
  personaje: [
    'https://i.ibb.co/RGgryDhy/Cu-nto-tiempo-m-s-vas-a-imagen-5.png',
    'https://i.ibb.co/fzZF6dsK/Prefiero-intentarlo-mil-v-imagen-7.png',
    'https://i.ibb.co/chTyj7RC/La-diferencia-entre-traba-imagen-2.png',
    'https://i.ibb.co/mFtmDw1N/Recorr-este-camino-solo-imagen-4.png',
  ],
};

// Cache en memoria de la instancia: mientras la funcion siga "caliente",
// las referencias no se vuelven a descargar de ibb.co.
const CACHE = {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let set = 'post';
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.searchParams.get('set') && SETS[u.searchParams.get('set')]) set = u.searchParams.get('set');
  } catch (e) {}
  const REFS = SETS[set];

  if (CACHE[set] && CACHE[set].length === REFS.length) {
    return res.json({ refs: CACHE[set], set: set, cached: true });
  }

  try {
    const results = [];
    for (let i = 0; i < REFS.length; i++) {
      // Hasta 2 intentos por referencia: una que falte degrada el rostro del personaje.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await fetch(REFS[i], { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const ct = r.headers.get('content-type') || '';
          if (ct.indexOf('image/') === -1) throw new Error('no es imagen');
          const buf = await r.arrayBuffer();
          const b64 = Buffer.from(buf).toString('base64');
          if (b64.length > 100) { results.push(b64); break; }
        } catch (e) {
          console.warn('[refs] ' + set + ' #' + i + ' intento ' + (attempt + 1) + ': ' + e.message);
          if (attempt === 0) await new Promise(rs => setTimeout(rs, 600));
        }
      }
    }
    if (results.length === REFS.length) CACHE[set] = results;
    if (results.length < REFS.length) {
      console.warn('[refs] set ' + set + ': solo ' + results.length + '/' + REFS.length + ' referencias cargaron');
    }
    return res.json({ refs: results, set: set, total: REFS.length });
  } catch (e) {
    console.error('[refs] excepcion: ' + e.message);
    return res.status(500).json({ error: e.message, refs: [] });
  }
};
