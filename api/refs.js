module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const REFS = [
    'https://i.ibb.co/m5Cqfs5n/IMG-8206.jpg',
    'https://i.ibb.co/3m42CzNf/IMG-8162.jpg',
    'https://i.ibb.co/GvfhKnJ3/IMG-8117.jpg',
  ];

  try {
    const results = [];
    for (let i = 0; i < REFS.length; i++) {
      try {
        const r = await fetch(REFS[i], {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!r.ok) continue;
        const ct = r.headers.get('content-type') || '';
        if (ct.indexOf('image/') === -1) continue;
        const buf = await r.arrayBuffer();
        const b64 = Buffer.from(buf).toString('base64');
        if (b64.length > 100) results.push(b64);
      } catch (e) {
        console.warn('Ref ' + i + ' failed: ' + e.message);
      }
    }
    return res.json({ refs: results });
  } catch (e) {
    return res.status(500).json({ error: e.message, refs: [] });
  }
};
