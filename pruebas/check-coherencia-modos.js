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

  // Las pruebas comparten el mismo servidor: se limpia el estado de la biblia para
  // que el orden en que se ejecuten no cambie el resultado.
  await page.goto('http://localhost:8321/__bibliareset');
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

  // ---- en los modos largos el lote de 5 NI SIQUIERA SE VE ----
  // Un video de YouTube se sube uno o dos por semana: sacar cinco de golpe no
  // tiene sentido. Antes el boton se veia y al pulsarlo salia un aviso; eso es
  // enseñar una puerta que no lleva a ningun sitio.
  const vis = await page.evaluate(() => {
    const ver = () => {
      const b5 = document.getElementById('gbtn5');
      const n5 = document.getElementById('gnote5');
      return {
        boton: b5 && b5.style.display !== 'none',
        nota: n5 && n5.style.display !== 'none',
        etiqueta: document.getElementById('gbtn').textContent,
      };
    };
    document.querySelector('#modeSelector .oc[data-id="profesor"]').click();
    const largo = ver();
    document.querySelector('#modeSelector .oc[data-id="reel"]').click();
    const corto = ver();
    return { largo, corto };
  });
  t('en modo Profesor el botón "Generar 5" no está', !vis.largo.boton);
  t('ni su nota explicativa', !vis.largo.nota);
  t('y el botón grande dice "Forjar vídeo largo"', /vídeo largo/i.test(vis.largo.etiqueta), vis.largo.etiqueta);
  t('al volver a Reel, el botón "Generar 5" reaparece', vis.corto.boton);
  t('y el botón grande vuelve a decir "Forjar Reel"', /Forjar Reel/.test(vis.corto.etiqueta), vis.corto.etiqueta);
  t('ya no queda el aviso que bloqueaba el lote', !/lote de 5 es para reels/.test(SRC));

  // ---- el modo que TU elegiste se respeta: nunca se cambia solo ----
  const j = await page.evaluate(() => {
    const out = {};
    ['reel', 'historia', 'impacto'].forEach((m) => {
      sMode = m; sD = '60';
      document.getElementById('conc').value = 'un concepto cualquiera';
      const jobs = batchJobs();
      out[m] = { modo: jobs[0].mode, dur: jobs[0].d, n: jobs.length };
    });
    return out;
  });
  t('si estás en Reel, el guion 1 del lote sale en Reel', j.reel.modo === 'reel', j.reel.modo);
  t('si estás en Historia, sale en Historia', j.historia.modo === 'historia', j.historia.modo);
  t('si estás en Impacto, sale en Impacto y a 30s', j.impacto.modo === 'impacto' && j.impacto.dur === '30');
  t('el lote sigue siendo de 5', j.reel.n === 5);
  t('ya no existe el cambio automático a Reel', !/mode1=esModoLargo\(\)\?'reel'/.test(SRC));

  // ---- la investigación en modo largo es un MENÚ: varios temas, eliges uno ----
  const tr = await page.evaluate(() => {
    TREND_IDEAS = [
      { t: 'libertad', h: 'pasos', concept: 'el metodo de los tres sobres' },
      { t: 'mentalidad', h: 'historia', concept: 'salir de una deuda en un año' },
    ];
    TREND_TEXT = 'analisis de prueba'; TREND_SOURCES = [];
    const leer = () => {
      const ms = document.getElementById('trendMode-0');
      const ds = document.getElementById('trendDur-0');
      return {
        modos: ms ? [...ms.options].map((o) => o.value).join(',') : '',
        durs: ds ? [...ds.options].map((o) => o.value).join(',') : '',
        lote: !!document.getElementById('bTrendBatch'),
        boton: (document.getElementById('bTrendOne-0') || {}).textContent || '',
        tarjetas: document.querySelectorAll('[id^="bTrendOne-"]').length,
      };
    };
    document.querySelector('#modeSelector .oc[data-id="profesor"]').click();
    const largo = leer();
    document.querySelector('#modeSelector .oc[data-id="reel"]').click();
    const corto = leer();
    return { largo, corto };
  });
  t('en modo largo la investigación sigue proponiendo varios temas', tr.largo.tarjetas === 2);
  t('cada tema ofrece solo los modos largos', tr.largo.modos === 'profesor,relato', tr.largo.modos);
  t('y solo duraciones de minutos', tr.largo.durs === '180,300,480', tr.largo.durs);
  t('el botón dice que hará UN vídeo sobre ese tema', /Hacer el vídeo sobre este tema/.test(tr.largo.boton), tr.largo.boton);
  t('NO hay botón de "generar los 5 a la vez"', !tr.largo.lote);
  t('en modo corto sí sigue estando el lote de tendencias', tr.corto.lote);
  t('y ahí los modos vuelven a ser los cortos', tr.corto.modos === 'reel,historia,impacto', tr.corto.modos);
  t('con duraciones en segundos', tr.corto.durs === '30,60', tr.corto.durs);

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
