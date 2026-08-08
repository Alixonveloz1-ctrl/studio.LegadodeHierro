// ES EL MISMO VIDEO: uno en español y otro en inglés.
//
// Nacio de un fallo mio. Al separar el ingles en su propia llamada le escribi que
// lo "reescribiera desde cero como lo diria un estadounidense", y con esa orden el
// modelo RESUME: un guion espanol de 2600 caracteres salia en ingles con 900. Eso
// ya no es el mismo video, es otro mas corto.
//
// Lo que se pide es una traduccion COMPLETA — mismas frases, mismo orden, mismos
// numeros — pero dicha con palabras que se usan en Estados Unidos, no palabra por
// palabra. Y no se fia de la instruccion: se cuenta y se reclama.
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

  // Un guion español de tamaño realista para un vídeo de 3 minutos.
  const ES = await page.evaluate(() => {
    const frases = [];
    for (let i = 0; i < 90; i++) frases.push('Esta es la frase numero ' + i + ' del guion.');
    return frases.join(' ') + '\nLegado de Hierro.';
  });

  // ---- el objetivo de longitud sale del guion REAL ----
  const pr = await page.evaluate((es) => buildInglesMsg(es, 'profesor', { secs: 180 }), ES);
  const nES = await page.evaluate((es) => contarPalabras(es), ES);
  t('el prompt dice cuántas palabras tiene el español',
    pr.indexOf('The Spanish script has ' + nES + ' words') > -1, nES + ' palabras');
  t('y exige que el inglés tenga esa misma medida',
    new RegExp('between ' + Math.round(nES * 0.92) + ' and ' + Math.round(nES * 1.12) + ' words').test(pr));
  t('pide una traducción COMPLETA', /THIS IS A COMPLETE TRANSLATION/.test(pr));
  t('en el mismo orden y con los mismos párrafos', /in the SAME ORDER and with the same paragraph/.test(pr));
  t('prohíbe resumir y condensar', /Do NOT summarise/.test(pr) && /Do NOT condense/.test(pr));
  t('pero prohíbe también el calco palabra por palabra', /BUT NOT WORD FOR WORD/.test(pr));
  t('con las expresiones que se usan en Estados Unidos',
    /US expression that does the same job/.test(pr) && /401k/.test(pr));
  t('conservando todas las cifras', /Keep every figure and every number exactly as it is/.test(pr));
  t('y el guion español entero viaja dentro', pr.indexOf('Esta es la frase numero 89') > -1);

  // ---- si el modelo cumple, sale a la primera ----
  await page.goto('http://localhost:8321/__inglescorto=0');
  await page.goBack();
  const bien = await page.evaluate(async (es) => {
    const antes = performance.now();
    const t = await fetchIngles(es, 'profesor', { secs: 180 });
    return { palabras: contarPalabras(t), ms: performance.now() - antes };
  }, ES);
  t('con una traducción completa, la acepta',
    bien.palabras >= Math.round(nES * 0.85), bien.palabras + ' de ' + nES + ' palabras');

  // ---- si viene corta, la RECLAMA ----
  await page.goto('http://localhost:8321/__inglescorto=1');
  await page.goBack();
  const corto = await page.evaluate(async (es) => {
    let llamadas = 0, quejas = 0;
    const real = window.fetch;
    window.fetch = function (u, o) {
      if (String(u) === '/api/generate' && o && o.body) {
        const d = JSON.parse(o.body);
        if (d.sinBloques) {
          llamadas++;
          if (/YOUR PREVIOUS ATTEMPT WAS REJECTED/.test(d.prompt)) quejas++;
        }
      }
      return real.apply(window, arguments);
    };
    let err = '';
    try { await fetchIngles(es, 'profesor', { secs: 180 }); } catch (e) { err = e.message; }
    window.fetch = real;
    return { llamadas, quejas, err };
  }, ES);
  t('una traducción corta NO se da por buena', !!corto.err, corto.err);
  t('se le pide otra vez, diciéndole que se dejó cosas', corto.quejas === 1, corto.llamadas + ' llamadas');
  t('y el aviso dice cuánto le falta', /salió incompleto \(\d+ palabras frente a \d+/.test(corto.err), corto.err);
  await page.goto('http://localhost:8321/__inglescorto=0');

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
