// MODOS LARGOS para YouTube: Profesor (una clase) y Relato (historia larga).
// Lo clave del modo profesor: 5 tomas del MISMO set que se REPITEN a lo largo
// del video, mas 3 ejemplos. Asi un video de 5 minutos sale de 8 imagenes.
const { chromium } = require('playwright-core');

// Respuesta de ejemplo con el formato que se le pide al modelo en modo profesor.
const RESP = `BLOQUE A
Tienes el dinero justo para llegar a fin de mes y no sabes a donde se fue.
Hoy te enseño el metodo de los tres sobres. Primero, separas antes de gastar.
Segundo, cada sobre tiene un trabajo. Tercero, lo que sobra no se toca.
Te pongo un ejemplo con mil pesos. El error tipico es empezar por el ahorro.
Legado de Hierro.

BLOQUE C
SET: su oficina pequena de noche, escritorio de madera, una pizarra blanca a la derecha con lineas escritas, lampara calida, ventana con la ciudad al fondo
TOMA 1: el protagonista sentado al escritorio hablando de frente a camara, plano medio
TOMA 2: el mismo momento visto desde la derecha, escorzo, la pizarra al fondo
TOMA 3: plano cerrado de su rostro mientras explica, la lampara marcando el contraste
TOMA 4: de pie junto a la pizarra senalando una de las lineas escritas
TOMA 5: plano general del despacho, el pequeno en el espacio, la ciudad detras
EJEMPLO 1: una mesa de cocina con tres sobres de papel y billetes contados encima
EJEMPLO 2: una mujer en el mercado eligiendo entre dos productos con la lista en la mano
EJEMPLO 3: un hombre mirando el saldo del cajero con gesto de alivio

BLOQUE M
0s: TOMA 1
14s: EJEMPLO 1
24s: TOMA 3
38s: TOMA 4
52s: EJEMPLO 2
66s: TOMA 2
80s: EJEMPLO 3
94s: TOMA 5
108s: TOMA 1

BLOQUE F
You have just enough to reach the end of the month and no idea where it went.
Iron Legacy.`;

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

  // ---- los modos existen ----
  const modos = await page.evaluate(() => [...document.querySelectorAll('#modeSelector .oc')].map(x => x.dataset.id));
  t('hay cinco modos', modos.length === 5, modos.join(', '));
  t('están Profesor y Relato', modos.indexOf('profesor') > -1 && modos.indexOf('relato') > -1);

  // ---- duraciones por familia de modo ----
  const cortas = await page.evaluate(() => [...document.querySelectorAll('#durGrid .oc')].map(x => x.dataset.id));
  t('en modo reel se ven 30 y 60 segundos', cortas.join(',') === '30,60', cortas.join(', '));
  await page.evaluate(() => document.querySelector('#modeSelector .oc[data-id="profesor"]').click());
  await page.waitForTimeout(200);
  const largas = await page.evaluate(() => [...document.querySelectorAll('#durGrid .oc')].map(x => x.dataset.id));
  t('en modo profesor se ven minutos, no segundos', largas.join(',') === '180,300,480', largas.join(', '));
  t('la duración elegida salta a una válida del modo',
    largas.indexOf(await page.evaluate(() => sD)) > -1, await page.evaluate(() => sD));
  t('el formato pasa solo a 16:9 (YouTube es horizontal)',
    (await page.evaluate(() => imgFmt)) === '16:9');
  await page.evaluate(() => document.querySelector('#modeSelector .oc[data-id="reel"]').click());
  await page.waitForTimeout(200);
  t('al volver a Reel, el formato vuelve a 9:16', (await page.evaluate(() => imgFmt)) === '9:16');

  // ---- el prompt del modo profesor ----
  const pp = await page.evaluate(() => buildEpisodeMsg('el metodo de los tres sobres', 'libertad', 'pasos', 'profesor', '300').msg);
  t('el profesor recibe la orden de enseñar UN método', /UN método concreto y aplicable/.test(pp));
  t('se le exige que sirva para HACER algo', /REGLA DE UTILIDAD/.test(pp));
  t('se le prohíbe prometer cifras de ganancia', /no prometas cifras concretas de ganancia/.test(pp));
  t('se le piden SET, TOMAS y EJEMPLOS', /SET:/.test(pp) && /TOMA 1:/.test(pp) && /EJEMPLO 1:/.test(pp));
  t('se le pide el BLOQUE M del montaje', /BLOQUE M/.test(pp));
  t('se le dice que las tomas SE REPITEN', /Repite las tomas/.test(pp));
  t('las palabras se ajustan a la duración', /entre 750 y 760 palabras/.test(pp), '300s x 2,5 = 750');
  t('el reparto también llega al modo largo', /EL REPARTO DEL CANAL/.test(pp));

  const pr = await page.evaluate(() => buildEpisodeMsg('salir de una deuda', 'mentalidad', 'historia', 'relato', '180').msg);
  t('el relato pide las escenas en orden cronológico', /orden cronologico de la historia/.test(pr));
  t('el relato pide 10 escenas', /PROMPT 1 a PROMPT 10/.test(pr));

  // ---- el parser del modo profesor ----
  const par = await page.evaluate((txt) => parseBlocks(txt), RESP);
  t('separa el SET de las tomas', !!par.set && /pizarra/.test(par.set), (par.set || '').slice(0, 45));
  t('encuentra las 5 tomas', par.nTomas === 5, String(par.nTomas));
  t('encuentra los 3 ejemplos', par.nEjemplos === 3, String(par.nEjemplos));
  t('genera 8 imágenes en total (5 tomas + 3 ejemplos)', par.c.length === 8, String(par.c.length));
  t('cada toma lleva el SET dentro, para que sea el mismo sitio',
    par.c.slice(0, 5).every(p => /pizarra/.test(p)));
  t('los ejemplos NO llevan el set (ocurren fuera)', !/pizarra/.test(par.c[5]));
  t('lee el montaje entero', par.montaje.length === 9, String(par.montaje.length) + ' cortes');
  t('el montaje va en orden de tiempo',
    par.montaje.every((x, i, a) => i === 0 || x.seg >= a[i - 1].seg));
  t('el guion y el inglés siguen saliendo bien',
    /tres sobres/.test(par.a) && /Iron Legacy/.test(par.f) && !/BLOQUE/.test(par.a));

  // ---- el montaje se convierte en el orden de los planos ----
  const orden = await page.evaluate((txt) => {
    const p = parseBlocks(txt);
    lastRes = Object.assign({}, p, { modo: 'profesor', uid: 1, topic: 'x' });
    imgs = []; vids = [];
    for (let i = 0; i < 8; i++) {
      imgs[i] = { src: 'data:image/png;base64,AAAA', idx: i + 1 };
      vids[i] = { remoteUrl: 'https://storage.googleapis.com/t' + i + '.mp4' };
    }
    return ordenDelMontaje();
  }, RESP);
  t('el montaje produce más planos que imágenes (las tomas se repiten)',
    orden.length === 9 && orden.length > 8, orden.length + ' planos de 8 imágenes');
  t('"TOMA 1" apunta a la imagen 1 y "EJEMPLO 1" a la 6',
    orden[0] === 0 && orden[1] === 5, 'orden: ' + orden.join(','));
  t('la toma 1 se reutiliza al final', orden[orden.length - 1] === 0);
  t('nunca se repite el mismo plano dos veces seguidas',
    orden.every((x, i, a) => i === 0 || x !== a[i - 1]));

  // En un modo normal el orden es lineal
  const lineal = await page.evaluate(() => {
    lastRes = { modo: 'reel', uid: 2, topic: 'x', montaje: null };
    imgs = []; vids = [];
    for (let i = 0; i < 5; i++) { imgs[i] = { src: 'd' }; vids[i] = { remoteUrl: 'u' + i }; }
    return ordenDelMontaje();
  });
  t('en los modos normales el orden sigue siendo 1,2,3...', lineal.join(',') === '0,1,2,3,4');

  // ---- el tope de planos y la descarga sin repetir ----
  const fs2 = require('fs');
  const U = fs2.readFileSync('/home/user/studio.LegadodeHierro/server/unify.js', 'utf8');
  const CR = fs2.readFileSync('/home/user/studio.LegadodeHierro/cloudrun/unify/index.js', 'utf8');
  t('el tope de planos sube a 60 (los reels seguían en 10)', /videos\.length > 60/.test(U) && /videos\.length > 60/.test(CR));
  t('Cloud Run no descarga la misma toma dos veces', /yaBajado/.test(CR));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
