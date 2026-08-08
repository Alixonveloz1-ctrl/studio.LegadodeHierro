// EL SET DEL MODO PROFESOR, Y LA MINIATURA.
//
// Dos fallos que se vieron en un video real de modo profesor:
//
// 1. Las tomas son del MISMO set y salian en sitios distintos: cambiaba la pared,
//    la lampara y hasta la ropa entre la toma 1 y la 2. Normal: cada imagen se
//    generaba por su cuenta a partir del SET descrito en palabras, y las palabras
//    no fijan un decorado. Ahora, antes de la primera toma, se generan dos
//    imagenes de referencia — el presentador con la ropa del video y el set vacio
//    en plano general — y las dos viajan en cada toma.
//
// 2. La miniatura era el personaje centrado sobre un fondo negro vacio. Para un
//    reel pasa; en la parrilla de YouTube, compitiendo con veinte miniaturas, una
//    silueta sobre negro no la abre nadie.
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  await page.goto('http://localhost:8321/__bibliareset');
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // ---- las dos anclas se piden ANTES de las tomas ----
  const res = await page.evaluate(async () => {
    const pedidos = [];
    const real = window.fetch;
    window.fetch = function (u, o) {
      if (String(u) === '/api/image' && o && o.body) {
        const d = JSON.parse(o.body);
        pedidos.push({ prompt: d.prompt, refs: (d.refImages || []).length });
      }
      return real.apply(window, arguments);
    };
    lastRes = {
      modo: 'profesor', uid: 99, topic: 'el metodo de los tres sobres',
      dO: { id: '180', secs: 180 },
      set: 'un despacho pequeno de noche, escritorio de madera, pizarra blanca a la derecha, lampara calida',
      nTomas: 5, nEjemplos: 3,
      a: 'Guion de prueba.', f: 'Test script.',
      c: ['TOMA 1 hablando a camara', 'TOMA 2 escorzo', 'TOMA 3 primer plano',
        'TOMA 4 junto a la pizarra', 'TOMA 5 plano general',
        'EJEMPLO 1 una mesa con sobres', 'EJEMPLO 2 el mercado', 'EJEMPLO 3 el cajero'],
    };
    imgFmt = '16:9';
    const oc = window.confirm; window.confirm = () => true;
    await genImages();
    window.confirm = oc; window.fetch = real;
    return { pedidos };
  });

  const p = res.pedidos;
  t('se generan las dos anclas ANTES que las tomas', p.length === 10, p.length + ' imágenes pedidas');
  t('la primera es el VESTUARIO del presentador',
    /WARDROBE REFERENCE for this episode/.test(p[0].prompt));
  t('de cuerpo entero y con una sola ropa fijada',
    /full length/.test(p[0].prompt) && /this exact outfit/.test(p[0].prompt));
  t('y va con las referencias de la cara del personaje', p[0].refs > 0, p[0].refs + ' referencias');
  t('la segunda es EL SET, en plano general', /SET REFERENCE/.test(p[1].prompt)
    && /WIDE ESTABLISHING SHOT/.test(p[1].prompt));
  t('se ve la habitación entera, para poder mirarla desde otros ángulos',
    /three walls, the floor and the whole depth of the room/.test(p[1].prompt));
  t('el set va VACÍO', /NO PEOPLE in the image/.test(p[1].prompt));
  t('y sin la cara del personaje, para que no se cuele dentro del decorado',
    p[1].refs === 0, p[1].refs + ' referencias');
  t('el set del guion viaja dentro', /pizarra blanca a la derecha/.test(p[1].prompt));

  // ---- las TOMAS llevan las dos anclas; los EJEMPLOS no ----
  const tomas = p.slice(2, 7), ejemplos = p.slice(7);
  t('las 5 tomas llevan las dos anclas',
    tomas.every(x => /THE SET IS ALREADY DECIDED/.test(x.prompt) && /THE WARDROBE IS ALREADY DECIDED/.test(x.prompt)),
    tomas.length + ' tomas');
  t('se les dice que solo mueven la cámara dentro de esa habitación',
    /You are only moving the camera inside it/.test(tomas[0].prompt));
  t('y que no cambien la ropa', /Do NOT change his clothes/.test(tomas[0].prompt));
  t('cada toma lleva 2 referencias más que un reel normal',
    tomas.every(x => x.refs >= 2), tomas.map(x => x.refs).join(','));
  t('los 3 ejemplos NO llevan el set: ocurren fuera',
    ejemplos.every(x => !/THE SET IS ALREADY DECIDED/.test(x.prompt)), ejemplos.length + ' ejemplos');

  // ---- LA MINIATURA ----
  const th16 = await page.evaluate(() => { imgFmt = '16:9'; return buildThumbPrompt(); });
  const th916 = await page.evaluate(() => { imgFmt = '9:16'; return buildThumbPrompt(); });

  t('la miniatura ya NO es el personaje centrado sobre un fondo negro vacío',
    !/clean dark uncluttered background/.test(th16) && !/character CENTERED and dominant/.test(th16));
  t('en YouTube la cara va a UN LADO, no en el centro',
    /occupies ONE SIDE of the frame — left or right, not the/.test(th16));
  t('y al otro lado, algo que diga de qué va el vídeo',
    /a single strong visual element that says what the video is about/.test(th16));
  t('con el entorno real detrás, oscurecido, para dar profundidad',
    /the real environment of the video, darkened and out of focus/.test(th16));
  t('la cara tiene que leerse en pequeño', /It must read at 320 pixels wide/.test(th16));
  t('con una emoción clara, no una pose neutra', /ONE clear, strong emotion — not a neutral pose/.test(th16));
  t('y hueco para el título, sin dibujar texto',
    /a big title will be laid over it later/.test(th16) && /NO TEXT: do not draw letters/.test(th16));
  t('el reel vertical tiene su propio encaje, no el de YouTube',
    /LAYOUT \(Reels, 9:16\)/.test(th916) && !/LAYOUT \(YouTube, 16:9\)/.test(th916));
  t('pero comparte lo que importa: cara grande, contraste y sin texto',
    /THE FACE IS THE PRODUCT/.test(th916) && /NO TEXT: do not draw letters/.test(th916));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
