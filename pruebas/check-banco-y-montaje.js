// REUTILIZAR CLIPS DEL BANCO EN UN REEL CON MONTAJE.
//
// En modo profesor el director no entrega una lista de clips: entrega 5 tomas del
// set, 3 ejemplos, y un MONTAJE que dice en que orden se ven y cuales se repiten.
// Ese montaje se guarda en el historial.
//
// La duda era: al traer clips ya generados del banco, ¿se respeta el montaje o se
// unen en el orden en que se tocan? Se respeta — pero se apoya en la POSICION, asi
// que si los clips se eligen en otro orden, el montaje apunta a los equivocados.
// Aqui se comprueba lo uno y se vigila lo otro.
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

  // Un reel de modo profesor tal y como sale del historial: 5 tomas, 3 ejemplos
  // y un montaje de 9 planos en el que la TOMA 1 sale dos veces.
  const montaje = [
    { seg: 0, tipo: 'toma', n: 1 }, { seg: 14, tipo: 'ejemplo', n: 1 },
    { seg: 24, tipo: 'toma', n: 3 }, { seg: 38, tipo: 'toma', n: 4 },
    { seg: 52, tipo: 'ejemplo', n: 2 }, { seg: 66, tipo: 'toma', n: 2 },
    { seg: 80, tipo: 'ejemplo', n: 3 }, { seg: 94, tipo: 'toma', n: 5 },
    { seg: 108, tipo: 'toma', n: 1 },
  ];

  // ---- el historial guarda lo que hace falta para reconstruirlo ----
  const guardado = await page.evaluate((m) => {
    localStorage.removeItem('lh_hist');
    saveHistory({ a: 'Guion de la clase.', f: 'Class script.', uid: 555, topic: 'los tres sobres',
      c: ['t1', 't2', 't3', 't4', 't5', 'e1', 'e2', 'e3'],
      montaje: m, nTomas: 5, nEjemplos: 3, set: 'su oficina de noche',
      modo: 'profesor', tO: { id: 'libertad' }, dO: { id: '180' }, hO: { id: 'pasos' } });
    const h = getHistory()[0];
    return { montaje: (h.montaje || []).length, nTomas: h.nTomas, nEjemplos: h.nEjemplos, set: h.set, modo: h.modo };
  }, montaje);
  t('el historial guarda el montaje entero', guardado.montaje === 9, guardado.montaje + ' planos');
  t('y cuántas tomas y ejemplos hay', guardado.nTomas === 5 && guardado.nEjemplos === 3);
  t('y el set, para poder rehacer las imágenes igual', /oficina de noche/.test(guardado.set));

  // ---- con los clips en su sitio, el montaje manda ----
  const orden = await page.evaluate((m) => {
    lastRes = { modo: 'profesor', uid: 555, montaje: m, nTomas: 5, nEjemplos: 3, c: new Array(8) };
    imgs = []; vids = [];
    for (let i = 0; i < 8; i++) { imgs[i] = { src: 'd' }; vids[i] = { remoteUrl: 'clip-' + (i + 1) }; }
    return ordenDelMontaje();
  }, montaje);
  t('el montaje manda, no el orden en que se tocaron', orden.join(',') === '0,5,2,3,6,1,7,4,0',
    'planos: ' + orden.join(','));
  t('sale MÁS planos que clips: las tomas se repiten', orden.length === 9 && orden.length > 8,
    orden.length + ' planos de 8 clips');
  t('la toma 1 se usa dos veces (al principio y al final)',
    orden[0] === 0 && orden[orden.length - 1] === 0);

  // ---- el panel del banco dice QUÉ hueco toca ----
  const huecos = await page.evaluate(() => huecosDelReel());
  t('el reel sabe qué huecos espera', huecos && huecos.length === 8, (huecos || []).join(' → '));
  t('en el orden del BLOQUE C: primero las tomas, luego los ejemplos',
    huecos[0] === 'TOMA 1' && huecos[4] === 'TOMA 5' && huecos[5] === 'EJEMPLO 1');

  const badge = await page.evaluate(() => {
    BANCO = [1, 2, 3].map(i => ({ object: 'c' + i, name: 'c' + i }));
    BANCO_SEL = ['c1', 'c2'];
    document.getElementById('unifyCard').style.display = 'block';
    const p = document.createElement('div'); p.id = 'bancoPanel';
    p.innerHTML = '<div id="bancoAviso" style="display:none"></div>'
      + BANCO.map((c, i) => '<div class="bancoIt" data-i="' + i + '"><span class="bancoNum"></span></div>').join('')
      + '<button id="bBancoUsar"></button>';
    document.body.appendChild(p);
    actualizarBadges();
    const nums = [...p.querySelectorAll('.bancoNum')].map(x => x.textContent);
    const r = { nums, boton: p.querySelector('#bBancoUsar').textContent,
      aviso: p.querySelector('#bancoAviso').textContent };
    p.remove();
    return r;
  });
  t('cada clip elegido muestra QUÉ hueco ocupa, no un número suelto',
    badge.nums[0] === 'TOMA 1' && badge.nums[1] === 'TOMA 2', badge.nums.join(' | '));
  t('y el botón dice cuál toca ahora', /Faltan 6: el siguiente es TOMA 3/.test(badge.boton), badge.boton);
  t('con el aviso de que este reel tiene montaje guardado',
    /modo Profesor/.test(badge.aviso) && /TOMA 1 → TOMA 2/.test(badge.aviso));
  t('y de que las tomas se repetirán hasta cubrir el vídeo',
    /9 planos/.test(badge.aviso), badge.aviso.slice(-60));

  // ---- si no cuadra el número, se para antes de unificar nada ----
  const guarda = await page.evaluate(async () => {
    BANCO_SEL = ['c1', 'c2', 'c3'];   // 3 de los 8 que espera
    let dicho = '';
    const oa = window.alert; window.alert = (m) => { dicho = m; };
    let pedido = false;
    const real = window.fetch;
    window.fetch = function (u) { if (String(u) === '/api/videos') pedido = true; return real.apply(window, arguments); };
    await usarBanco();
    window.alert = oa; window.fetch = real;
    return { dicho, pedido };
  });
  t('con los clips que no cuadran, NO se usan', guarda.pedido === false);
  t('y se dice cuántos hacen falta y en qué orden',
    /espera EXACTAMENTE 8 clips/.test(guarda.dicho) && /TOMA 1 → TOMA 2/.test(guarda.dicho),
    guarda.dicho.split('\n')[0]);

  // ---- la tarjeta de unificar cuenta los PLANOS, no los clips ----
  const sub = await page.evaluate(() => {
    vids = []; imgs = [];
    for (let i = 0; i < 8; i++) { imgs[i] = { src: 'd' }; vids[i] = { remoteUrl: 'u' + i }; }
    audES = { partsB64: ['x'] };
    updUnifyCard();
    return document.getElementById('unifySub').textContent;
  });
  t('la tarjeta avisa de que 8 clips se convierten en 9 planos',
    /8 clips en 9 planos/.test(sub), sub);

  // ---- en un reel normal, nada de esto se entromete ----
  const normal = await page.evaluate(() => {
    lastRes = { modo: 'reel', uid: 1, montaje: null, c: new Array(5) };
    imgs = []; vids = [];
    for (let i = 0; i < 5; i++) { imgs[i] = { src: 'd' }; vids[i] = { remoteUrl: 'u' + i }; }
    return { orden: ordenDelMontaje(), huecos: huecosDelReel() };
  });
  t('en un reel normal el orden sigue siendo 1,2,3...', normal.orden.join(',') === '0,1,2,3,4');
  t('y no se pide ningún hueco concreto', normal.huecos === null);

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
