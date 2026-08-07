// Las vistas se generan UNA POR UNA y en cola, no las cuatro de golpe.
// Cuatro imagenes en una peticion tardan mas de los 30 s que aguanta la funcion
// de Vercel, y lanzadas a la vez rebasan el limite por minuto de Vertex.
// Y la cara tiene que MANTENERSE: cada vista usa como referencia las ya guardadas.
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
  await page.waitForFunction(() => typeof BIBLIA !== 'undefined' && BIBLIA.length > 5, null, { timeout: 10000 });
  // Pausa corta para que la prueba no tarde minutos, pero >0 para poder medirla.
  await page.evaluate(() => { PAUSA_VISTAS = 250; });

  // ---- generar las 4 vistas de un personaje ----
  const res = await page.evaluate(async () => {
    const p = personajePorId('madre');
    return await generarVistasDe(p, null);
  });
  t('genera las 3 vistas', res.hechas === 3, res.hechas + ' hechas, ' + res.fallos.length + ' fallos');

  const log = await page.evaluate(() => fetch('/__biblialog').then(r => r.json()));
  const g = log.gen.filter(x => x.id === 'madre');
  t('hace UNA petición por vista, no una con las tres', g.length === 3, g.length + ' peticiones');
  t('pide las tres vistas distintas', new Set(g.map(x => x.vista)).size === 3,
    'vistas ' + g.map(x => x.vista).join(','));
  t('empieza por la vista 1 (es la que fija la cara)', g[0].vista === 0);

  // VAN EN COLA: cada peticion empieza despues de que acabe la anterior.
  let enCola = true, minGap = Infinity;
  for (let i = 1; i < g.length; i++) {
    const gap = g[i].t - g[i - 1].t;
    if (gap < minGap) minGap = gap;
    if (gap < 200) enCola = false;   // con PAUSA_VISTAS=250 tienen que ir separadas
  }
  t('van EN COLA, no todas a la vez', enCola, 'la separación más corta fue ' + minGap + ' ms');

  // LA CARA SE MANTIENE: de la 2 en adelante se generan CON referencia.
  const conRef = g.filter(x => x.conRefs).length;
  t('la vista 1 va sin referencia (define la cara)', !g[0].conRefs);
  t('las siguientes SÍ usan las ya guardadas como referencia', conRef === 2,
    conRef + ' de 2 con referencia');

  // ---- rehacer una sola vista de un personaje que YA tiene cara ----
  await page.evaluate(() => fetch('/__biblialog'));
  const antes = (await page.evaluate(() => fetch('/__biblialog').then(r => r.json()))).gen.length;
  await page.evaluate(async () => {
    const p = personajePorId('madre');
    return await generarVistasDe(p, [2]);
  });
  const log2 = await page.evaluate(() => fetch('/__biblialog').then(r => r.json()));
  const nuevas = log2.gen.slice(antes);
  t('rehacer una vista pide SOLO esa', nuevas.length === 1 && nuevas[0].vista === 2,
    nuevas.length + ' petición(es), vista ' + (nuevas[0] && nuevas[0].vista));
  t('y la rehace CON la cara ya guardada como referencia', !!nuevas[0].conRefs);

  // LAS VIEJAS DE LA TANDA NO VALEN DE REFERENCIA. Al rehacer las tres, la vista 2
  // se generaba mirando la vista 2 vieja y la 3 vieja, y salia igual que antes.
  t('al rehacer todas, cada vista dice qué viejas hay que ignorar',
    JSON.stringify(g.map(x => (x.ignorar || []).join(''))) === '["012","12","2"]',
    JSON.stringify(g.map(x => x.ignorar)));
  t('rehacer una sola solo ignora esa', JSON.stringify(nuevas[0].ignorar) === '[2]',
    JSON.stringify(nuevas[0].ignorar));

  // ---- el servidor manda al modelo copiar la cara ----
  const fs = require('fs');
  const R = fs.readFileSync('/home/user/studio.LegadodeHierro/api/refs.js', 'utf8');
  t('el prompt exige copiar la cara de la referencia, no inspirarse',
    /THIS IS THE SAME PERSON AS IN THE REFERENCE IMAGES/.test(R) && /Copy the face exactly/.test(R));
  // El comportamiento de verdad lo comprueba pruebas/check-biblia-ancla.js, que
  // llama al endpoint y mira que imagenes viajan. Aqui solo se vigila que la regla
  // siga escrita: la vista N se descarta por su INDICE, no por su nombre.
  t('la vista que se rehace no se usa como referencia de sí misma',
    /k !== i && ignorar\.indexOf\(k\) < 0/.test(R));
  t('y el ancla del personaje va SIEMPRE primero',
    /const ancla = \(guardado && guardado\.base\)/.test(R));
  t('el encuadre NO se copia de la referencia',
    /Do NOT copy their framing, crop, zoom, camera distance or pose/.test(R));
  t('el servidor genera UNA vista por petición', /UNA VISTA POR PETICION/.test(R));

  // ---- el botón permite parar a mitad ----
  t('se puede parar la generación de todos', await page.evaluate(() => typeof BIBLIA_PARAR !== 'undefined'));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
