// La biblia tiene que dejar ELEGIR el modelo y VER lo que salio: sin vista previa
// no hay forma de saber si un personaje se genero con la cara mal.
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  // Se limpia el estado del mock: otras pruebas dejan vistas ya generadas y aqui
  // hace falta un personaje SIN ellas para comprobar el botón de generar.
  await page.goto('http://localhost:8321/__bibliareset');
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');
  await page.waitForFunction(() => typeof BIBLIA !== 'undefined' && BIBLIA.length > 5, null, { timeout: 10000 });
  await page.evaluate(() => document.getElementById('bibliaBtn').click());
  await page.waitForTimeout(200);

  // ---- selector de modelo ----
  const sel = await page.evaluate(() => {
    const s = document.getElementById('selBibliaModel');
    return s ? { valor: s.value, n: s.options.length } : null;
  });
  t('hay selector de modelo dentro de la biblia', !!sel, sel ? sel.n + ' modelos' : 'no existe');
  t('por defecto el de máxima calidad', sel && sel.valor === 'gemini-3-pro-image', sel && sel.valor);
  t('la generación usa ESE modelo, no el de los reels',
    await page.evaluate(() => { imgModel = 'gemini-2.5-flash-image'; return modeloBiblia() === 'gemini-3-pro-image'; }));
  t('el coste se calcula con el modelo de la biblia',
    await page.evaluate(() => Math.abs(costoBiblia() - 0.134) < 0.001 && Math.abs(imgCost() - 0.039) < 0.001),
    'biblia $0.134 vs reels $0.039 por imagen');

  // ---- vista previa ----
  const conBoton = await page.evaluate(() => document.querySelectorAll('#bibliaGrid .bibliaVer').length);
  t('cada personaje tiene botón para ver o generar', conBoton === 32, conBoton + ' botones');
  const txtInsignia = await page.evaluate(() =>
    document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVer').textContent);
  t('el que ya tiene vistas dice "Ver"', /Ver las vistas/.test(txtInsignia), txtInsignia);
  const txtSin = await page.evaluate(() =>
    document.querySelector('#bibliaGrid [data-id="madre"] .bibliaVer').textContent);
  t('el que no las tiene ofrece generarlas', /Generar sus 4 vistas/.test(txtSin), txtSin);

  // abrir las del insignia
  await page.evaluate(() => document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVer').click());
  await page.waitForFunction(() =>
    document.querySelectorAll('#bibliaGrid [data-id="insignia"] .bibliaVistas img').length > 0, null, { timeout: 10000 });
  const vistas = await page.evaluate(() => {
    const c = document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVistas');
    return {
      imgs: c.querySelectorAll('img').length,
      conFuente: [...c.querySelectorAll('img')].every(i => /^data:image\/png;base64,/.test(i.src)),
      reHacer: c.querySelectorAll('.bibliaRe').length,
      todas: !!c.querySelector('.bibliaReTodas'),
      visible: c.style.display === 'block',
    };
  });
  t('SE VEN las vistas del personaje', vistas.visible && vistas.imgs > 0, vistas.imgs + ' imágenes');
  t('las imágenes tienen contenido real', vistas.conFuente);
  t('hay un botón ↺ por cada vista, para rehacer solo la mala', vistas.reHacer === vistas.imgs);
  t('y uno para rehacer las cuatro', vistas.todas);
  t('avisa de qué mirar (misma cara, fondo blanco)',
    /fondo blanco/.test(await page.evaluate(() =>
      document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVistas').textContent)));

  // volver a pulsar oculta
  await page.evaluate(() => document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVer').click());
  t('volver a pulsar las oculta',
    await page.evaluate(() => document.querySelector('#bibliaGrid [data-id="insignia"] .bibliaVistas').style.display === 'none'));

  // ---- rehacer una sola vista pide SOLO esa ----
  const pedido = await page.evaluate(async () => {
    let capt = null; const of = window.fetch;
    window.fetch = function (u, i) {
      if (typeof u === 'string' && u.indexOf('/api/refs') === 0 && i && i.body) {
        const d = JSON.parse(i.body);
        if (d.action === 'generar') capt = d;
      }
      return of(u, i);
    };
    await rehacerVista('insignia', [2]);
    window.fetch = of;
    return capt;
  });
  // El servidor genera UNA vista por peticion: el campo es `vista`, no `vistas`.
  t('rehacer una vista pide SOLO esa (no paga las otras tres)',
    pedido && pedido.vista === 2,
    pedido ? 'vista ' + pedido.vista : 'no se capturó');
  t('y la pide con el modelo de la biblia', pedido && pedido.model === 'gemini-3-pro-image', pedido && pedido.model);

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
