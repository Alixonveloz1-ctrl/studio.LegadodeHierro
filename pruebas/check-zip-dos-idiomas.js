// El ZIP tiene que llevarse los DOS videos finales (es y en), y las imagenes y
// los clips UNA sola vez. Antes finalVid era una variable unica y el reel en
// ingles pisaba al de espanol.
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // El selector de idioma existe y arranca en espanol
  t('hay selector de idioma en la unificación', await page.evaluate(() => document.querySelectorAll('.unifyLang').length === 2));
  t('arranca en español', await page.evaluate(() => unifyLang() === 'es'));

  await page.fill('#conc', 'probar los dos idiomas');
  await page.click('#gbtn');
  await page.waitForFunction(() => typeof loading !== 'undefined' && loading === false && lastRes, null, { timeout: 15000 });

  // Montar a mano el estado de un reel ya producido: imagenes, clips y los dos audios.
  await page.evaluate(async () => {
    const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    for (let i = 0; i < 3; i++) {
      imgs[i] = { src: 'data:image/png;base64,' + PNG, idx: i + 1 };
      vids[i] = { url: 'blob:x', remoteUrl: 'https://storage.googleapis.com/c' + i + '.mp4',
                  blob: new Blob([new Uint8Array(2048)], { type: 'video/mp4' }) };
      vidState[i] = 'done';
    }
    const wav = new Blob([new Uint8Array(1024)], { type: 'audio/wav' });
    audES = { blob: wav, url: 'blob:es', alignment: null, partsB64: ['AAAA'] };
    audEN = { blob: wav, url: 'blob:en', alignment: null, partsB64: ['BBBB'] };
  });

  // --- Unificar en ESPANOL ---
  await page.evaluate(() => unifyVideo());
  await page.waitForFunction(() => FINALES.es !== null, null, { timeout: 30000 });
  t('el reel en español queda guardado', await page.evaluate(() => !!FINALES.es));
  t('el de inglés todavía no existe', await page.evaluate(() => FINALES.en === null));

  // Se manda el audio ES y el SRT
  const env1 = await page.evaluate(() => fetch('/__unifybody').then(r => r.json()).catch(() => null));

  // --- Cambiar a INGLES y unificar otra vez ---
  await page.evaluate(() => document.querySelector('.unifyLang[data-l="en"]').click());
  t('el selector cambia a inglés', await page.evaluate(() => unifyLang() === 'en'));
  await page.evaluate(() => unifyVideo());
  await page.waitForFunction(() => FINALES.en !== null, null, { timeout: 30000 });

  t('AHORA existen los DOS vídeos finales',
    await page.evaluate(() => !!(FINALES.es && FINALES.en)));
  t('el de español NO fue pisado por el de inglés',
    await page.evaluate(() => FINALES.es !== FINALES.en));

  // Hay un boton de descarga por idioma
  const botones = await page.evaluate(() =>
    [...document.querySelectorAll('#unifyRes a')].map(a => ({ txt: a.textContent.trim(), dl: a.getAttribute('download') })));
  t('hay un botón de descarga por cada idioma', botones.length === 2, botones.map(x => x.dl).join(', '));
  t('los nombres llevan el idioma',
    botones.some(x => /-final-es\.mp4$/.test(x.dl)) && botones.some(x => /-final-en\.mp4$/.test(x.dl)));
  t('avisa de que el ZIP se lleva los dos',
    await page.evaluate(() => document.getElementById('unifyRes').textContent.indexOf('los dos vídeos finales') > -1));

  // --- EL ZIP ---
  // Se llama a la funcion REAL exportAll() con un JSZip simulado que apunta que
  // ficheros se anaden. Asi se prueba el codigo de produccion, no una copia mia.
  // (JSZip real viene de un CDN al que este entorno no llega.)
  const dentro = await page.evaluate(async () => {
    const anotados = [];
    window.JSZip = function () {
      return {
        file: function (nombre) { anotados.push(nombre); },
        generateAsync: function () { return Promise.resolve(new Blob(['x'])); },
      };
    };
    const clickOrig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {}; // no disparar la descarga
    try { await exportAll(); } finally { HTMLAnchorElement.prototype.click = clickOrig; }
    return anotados;
  });

  const finales = dentro.filter(f => /-final-(es|en)\.mp4$/.test(f));
  t('el ZIP lleva los DOS vídeos finales', finales.length === 2, finales.join(', '));
  t('y NO queda el nombre viejo sin idioma', !dentro.some(f => /-final\.mp4$/.test(f)));
  t('el ZIP lleva los dos guiones', dentro.filter(f => /-guion-(es|en)\.txt$/.test(f)).length === 2);
  t('el ZIP lleva los dos audios', dentro.filter(f => /-audio-(es|en)\.wav$/.test(f)).length === 2);
  t('el ZIP lleva los dos subtítulos', dentro.filter(f => /-subtitulos-(es|en)\.srt$/.test(f)).length === 2);
  const nImg = dentro.filter(f => f.indexOf('imagenes/') === 0).length;
  const nVid = dentro.filter(f => f.indexOf('videos/') === 0).length;
  t('las imágenes van UNA sola vez (no duplicadas por idioma)', nImg === 3, nImg + ' para 3 escenas');
  t('los clips van UNA sola vez', nVid === 3, nVid + ' para 3 escenas');

  // ===== NO SE PUEDE COLAR EL VIDEO DE OTRO REEL =====
  // La pregunta real: si un dia solo hago el de espanol, ¿el ZIP me mete el
  // ingles del reel ANTERIOR? Tiene que ser que no.
  const zip2 = await page.evaluate(async () => {
    // Un reel NUEVO desde cero, como cuando pulsas Generar.
    resetReelAssets();
    const quedaba = { es: FINALES.es, en: FINALES.en };
    const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    for (let i = 0; i < 2; i++) {
      imgs[i] = { src: 'data:image/png;base64,' + PNG, idx: i + 1 };
      vids[i] = { url: 'blob:y', remoteUrl: 'https://storage.googleapis.com/n' + i + '.mp4',
                  blob: new Blob([new Uint8Array(2048)], { type: 'video/mp4' }) };
      vidState[i] = 'done';
    }
    audES = { blob: new Blob([new Uint8Array(1024)]), url: 'blob:es2', alignment: null, partsB64: ['CCCC'] };
    audEN = null; // ESTA VEZ NO se hace el de ingles
    document.querySelector('.unifyLang[data-l="es"]').click();
    await unifyVideo();
    const anotados = [];
    window.JSZip = function () {
      return { file: (n) => anotados.push(n), generateAsync: () => Promise.resolve(new Blob(['x'])) };
    };
    const co = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {};
    try { await exportAll(); } finally { HTMLAnchorElement.prototype.click = co; }
    return { quedaba, anotados, en: FINALES.en };
  });

  t('empezar otro reel limpia los dos idiomas',
    zip2.quedaba.es === null && zip2.quedaba.en === null);
  t('haciendo SOLO el español, el ZIP trae SOLO el español',
    zip2.anotados.filter(f => /-final-es\.mp4$/.test(f)).length === 1
    && zip2.anotados.filter(f => /-final-en\.mp4$/.test(f)).length === 0,
    zip2.anotados.filter(f => /-final-/.test(f)).join(', ') || 'ninguno');
  t('NO se cuela el inglés del reel anterior', zip2.en === null);

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
