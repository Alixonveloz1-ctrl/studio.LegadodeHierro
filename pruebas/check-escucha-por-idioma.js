// La escucha previa (narracion + musica) tiene que sonar en el IDIOMA elegido.
// Antes usaba siempre audES: al poner el reel en ingles seguias oyendo el
// espanol, asi que no habia forma de comprobar la mezcla del reel EN.
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'] });
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
  await page.fill('#conc', 'probar la escucha en ingles');
  await page.click('#gbtn');
  await page.waitForFunction(() => typeof loading !== 'undefined' && loading === false && lastRes, null, { timeout: 15000 });

  // Dos narraciones DISTINGUIBLES: se marca cual se decodifico mirando su tamano.
  await page.evaluate(() => {
    audES = { blob: new Blob([new Uint8Array(1000)]), url: 'blob:es', alignment: null, partsB64: ['ES'] };
    audEN = { blob: new Blob([new Uint8Array(2000)]), url: 'blob:en', alignment: null, partsB64: ['EN'] };
    // Se intercepta la decodificacion para saber QUE audio pidio la mezcla.
    window.__decodificados = [];
    const orig = (window.AudioContext || window.webkitAudioContext).prototype.decodeAudioData;
    (window.AudioContext || window.webkitAudioContext).prototype.decodeAudioData = function (ab) {
      window.__decodificados.push(ab.byteLength);
      // Devuelve un buffer de silencio valido, sin depender del contenido real.
      const buf = this.createBuffer(1, this.sampleRate * 0.2, this.sampleRate);
      return Promise.resolve(buf);
    };
  });

  // loadMusicList no es async: hay que esperar a que el selector se llene.
  await page.evaluate(() => loadMusicList());
  await page.waitForFunction(() => document.getElementById('musicSel').options.length > 1, null, { timeout: 10000 });
  const pistaSel = await page.evaluate(() => {
    const s = document.getElementById('musicSel');
    s.value = s.options[1].value;
    return s.value;
  });
  t('hay una pista de música para la prueba', !!pistaSel, pistaSel);

  // --- ESPAÑOL ---
  await page.evaluate(() => { window.__decodificados = []; setUnifyLang('es'); });
  await page.evaluate(() => toggleMixPreview());
  // Se espera a que la mezcla haya decodificado, no un tiempo fijo: con la maquina
  // cargada 600 ms no llegaban y la prueba fallaba sin que nada estuviera roto.
  await page.waitForFunction(() => window.__decodificados.length > 0, null, { timeout: 10000 }).catch(() => {});
  const es = await page.evaluate(() => ({ dec: window.__decodificados.slice(), claves: Object.keys(MIX.bufs) }));
  t('en español se decodifica la narración ES (1000 bytes)', es.dec.indexOf(1000) > -1, es.dec.join(', '));
  t('la guarda con clave de idioma es', es.claves.some(k => /^voz-es-/.test(k)), es.claves.join(', '));
  await page.evaluate(() => stopMix());

  // --- INGLES ---
  await page.evaluate(() => { window.__decodificados = []; document.querySelector('.unifyLang[data-l="en"]').click(); });
  t('cambiar de idioma corta la escucha que estaba sonando', await page.evaluate(() => MIX.playing === false));
  await page.evaluate(() => toggleMixPreview());
  await page.waitForFunction(() => window.__decodificados.length > 0, null, { timeout: 10000 }).catch(() => {});
  const en = await page.evaluate(() => ({ dec: window.__decodificados.slice(), claves: Object.keys(MIX.bufs) }));
  t('en inglés se decodifica la narración EN (2000 bytes)', en.dec.indexOf(2000) > -1, en.dec.join(', '));
  t('NO vuelve a sonar la española', en.dec.indexOf(1000) < 0);
  t('cada idioma tiene su propia entrada en la caché',
    en.claves.some(k => /^voz-es-/.test(k)) && en.claves.some(k => /^voz-en-/.test(k)), en.claves.join(', '));
  await page.evaluate(() => stopMix());

  // El boton dice en que idioma vas a oirlo
  const txtEN = await page.evaluate(() => document.getElementById('bMusicPlay').textContent);
  t('el botón avisa de que sonará en inglés', /EN/.test(txtEN), txtEN.trim());
  await page.evaluate(() => document.querySelector('.unifyLang[data-l="es"]').click());
  const txtES = await page.evaluate(() => document.getElementById('bMusicPlay').textContent);
  t('y al volver, de que sonará en español', /ES/.test(txtES), txtES.trim());

  // Regenerar el audio EN tiene que soltar su caché
  await page.evaluate(() => { audEN = { blob: new Blob([new Uint8Array(3000)]), url: 'blob:en2', alignment: null, partsB64: ['EN2'] }; invalidateVoiceMix(); });
  const tras = await page.evaluate(() => Object.keys(MIX.bufs).filter(k => /^voz-/.test(k)));
  t('regenerar la narración suelta la caché de los dos idiomas', tras.length === 0, tras.join(', ') || 'vacía');

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
