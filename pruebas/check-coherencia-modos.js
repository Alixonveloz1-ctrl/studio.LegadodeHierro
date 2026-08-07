// COHERENCIA: al anadir los modos largos hay reglas que se calculaban en varios
// sitios a la vez. Esta prueba comprueba que TODAS conocen los modos nuevos, no
// solo la que se toco al implementarlos.
const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // ---- UNA sola fuente de verdad para el numero de imagenes ----
  const cuentas = await page.evaluate(() => ({
    impacto: imagenesDe('impacto', '30'),
    reel30: imagenesDe('reel', '30'),
    reel60: imagenesDe('reel', '60'),
    historia: imagenesDe('historia', '60'),
    profesor: imagenesDe('profesor', '300'),
    relato: imagenesDe('relato', '300'),
  }));
  t('impacto: 3 imágenes', cuentas.impacto === 3);
  t('reel de 30s: 3', cuentas.reel30 === 3);
  t('reel de 60s: 5', cuentas.reel60 === 5);
  t('profesor: 8 (5 tomas + 3 ejemplos)', cuentas.profesor === 8, String(cuentas.profesor));
  t('relato: 10', cuentas.relato === 10, String(cuentas.relato));

  // El PROMPT y el GENERADOR tienen que pedir lo MISMO. Antes el prompt pedia 8 y
  // el generador recortaba a 5, dejando el montaje apuntando a imagenes perdidas.
  const pp = await page.evaluate(() => buildEpisodeMsg('x', 'libertad', 'pasos', 'profesor', '300').msg);
  t('el prompt del profesor pide 8, igual que el generador',
    /5 TOMAS \+ 3 EJEMPLOS/.test(pp) || /cinco lineas TOMA/.test(pp));
  const pr = await page.evaluate(() => buildEpisodeMsg('x', 'libertad', 'historia', 'relato', '300').msg);
  t('el prompt del relato pide 10, igual que el generador', /PROMPT 1 a PROMPT 10/.test(pr));

  const SRC = fs.readFileSync('/home/user/studio.LegadodeHierro/public/app.js', 'utf8');
  t('la fórmula del número de imágenes ya no está duplicada',
    (SRC.match(/imagenesDe\(/g) || []).length >= 4 && !/dO\.id==='90'\?8/.test(SRC));
  t('el generador de imágenes usa la función común', /totalImgsTarget=imagenesDe\(/.test(SRC));

  // ---- la etiqueta cuenta bien en cada modo ----
  await page.evaluate(() => { sMode = 'profesor'; sD = '300'; updImgLabel(); });
  const lbl = await page.evaluate(() => document.getElementById('imgCountLabel').textContent);
  t('la etiqueta dice 8 imágenes en modo profesor', /^8 imágenes/.test(lbl), lbl);
  t('y explica que las tomas se repiten', /se repiten/.test(lbl));

  // ---- el lote de 5 NO se lanza en modo largo ----
  const aviso = await page.evaluate(async () => {
    sMode = 'profesor'; sD = '300';
    let msg = null; const oa = window.alert;
    window.alert = (m) => { msg = m; };
    await generateBatch();
    window.alert = oa;
    return { msg, arranco: typeof batchLoading !== 'undefined' && batchLoading === true };
  });
  t('el lote de 5 NO arranca en modo largo', !aviso.arranco);
  t('y explica por qué', !!aviso.msg && /lote de 5 es para reels/.test(aviso.msg));

  // ---- si escribes un concepto en modo largo, el lote lo pasa a Reel ----
  const j = await page.evaluate(() => {
    sMode = 'profesor'; sD = '300';
    document.getElementById('conc').value = 'un concepto cualquiera';
    const jobs = batchJobs();
    return { modo: jobs[0].mode, dur: jobs[0].d, n: jobs.length };
  });
  t('el primer trabajo del lote no arrastra el modo largo', j.modo !== 'profesor' && j.modo !== 'relato', j.modo);
  t('ni su duración de minutos', ['30', '60'].indexOf(j.dur) > -1, j.dur + 's');
  t('el lote sigue siendo de 5', j.n === 5);

  // ---- los bucles siguen yendo EN COLA (lo que ya hacia bien el proyecto) ----
  t('las imágenes se generan una tras otra, con pausa',
    /if\(i<totalImgs-1\)await new Promise/.test(SRC));
  t('los vídeos también van uno a uno', /for\(var i=0;i<slots\.length;i\+\+\)[\s\S]{0,200}await genVideoForSlot/.test(SRC));
  t('las vistas de la biblia igual', /if\(k<lista\.length-1\)await new Promise/.test(SRC));

  // ---- aviso de coste en los modos largos ----
  t('avisa del coste antes de generar un vídeo largo',
    /Vídeo largo \('\+\(MODE_LABELS/.test(SRC) || /Vídeo largo/.test(SRC));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
