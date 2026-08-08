// EL RITMO DE LA BIBLIA TIENE QUE SER EL MISMO QUE EL DE LOS REELS.
//
// Nacio de un fallo real: la biblia se saltaba imagenes y personajes enteros. La
// causa no era el bucle — ese ya iba en cola — sino la CADENCIA. La generacion de
// reels va con 60 s de margen en el servidor y 10 s de pausa entre imagenes; la
// biblia iba con 30 s de margen y 1,5 s de pausa. Con una imagen tardando 20-45 s,
// el servidor mataba la peticion a medias, el navegador lo daba por fallo y saltaba
// a la siguiente. De ahi los personajes con una sola vista.
//
// Aqui se comprueba que las dos rutas van igual, que se reintenta esperando en vez
// de saltar, y que la tanda PARA en vez de dejar huecos por toda la biblia.
const { chromium } = require('playwright-core');
const fs = require('fs');
const RAIZ = '/home/user/studio.LegadodeHierro';

(async () => {
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  // ---- la misma cadencia que los reels ----
  const V = JSON.parse(fs.readFileSync(RAIZ + '/vercel.json', 'utf8'));
  t('el servidor da a la biblia el mismo margen que a los reels',
    V.functions['api/refs.js'].maxDuration === V.functions['api/image.js'].maxDuration,
    'refs ' + V.functions['api/refs.js'].maxDuration + ' s vs image ' + V.functions['api/image.js'].maxDuration + ' s');
  t('y ese margen es el maximo del plan gratuito (60 s)',
    V.functions['api/refs.js'].maxDuration === 60);
  t('ninguna funcion se pasa de 60 s',
    Object.keys(V.functions).every(k => V.functions[k].maxDuration <= 60));

  const A = fs.readFileSync(RAIZ + '/public/app.js', 'utf8');
  const pausaReels = (A.match(/var PAUSA_IMAGENES=(\d+);/) || [])[1];
  const pausaBiblia = (A.match(/var PAUSA_VISTAS=(\d+);/) || [])[1];
  t('la pausa entre imagenes es la misma en las dos rutas',
    pausaReels === pausaBiblia, 'reels ' + pausaReels + ' ms vs biblia ' + pausaBiblia + ' ms');

  // ---- se reintenta esperando, no se salta ----
  t('hay varios reintentos por vista, con esperas crecientes',
    /var ESPERAS_REINTENTO=\[15000,30000,60000\]/.test(A));
  t('si el fallo es el limite por minuto, se espera el doble',
    /if\(esLimite\(ultimoError\)\)espera\*=2/.test(A));
  t('un 504 se traduce a lo que de verdad paso, no a un error de JSON',
    /el servidor tardó más de 60 s/.test(A));
  t('la tanda PARA si una vista agota sus reintentos', /if\(res\.rendido\)/.test(A));
  t('y lo dice, en vez de seguir dejando huecos', /No se sigue con los demás para no dejar personajes a medias/.test(A));

  // ---- en el navegador: que de verdad espere y reintente ----
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  await page.goto('http://localhost:8321/__bibliareset');
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');
  await page.waitForFunction(() => typeof BIBLIA !== 'undefined' && BIBLIA.length > 5, null, { timeout: 10000 });

  // La vista 2 falla las dos primeras veces y a la tercera sale.
  const res = await page.evaluate(async () => {
    PAUSA_VISTAS = 30; ESPERAS_REINTENTO = [40, 60, 80];   // en milisegundos, para no tardar
    const real = window.fetch;
    let intentosVista2 = 0;
    const avisos = [];
    window.fetch = function (u, o) {
      if (String(u) === '/api/refs' && o && o.body) {
        const d = JSON.parse(o.body);
        if (d.action === 'generar' && d.vista === 1) {
          intentosVista2++;
          if (intentosVista2 <= 2) {
            return Promise.resolve(new Response(
              JSON.stringify({ error: '429 RESOURCE_EXHAUSTED: quota exceeded' }),
              { status: 429, headers: { 'Content-Type': 'application/json' } }));
          }
        }
      }
      return real.apply(window, arguments);
    };
    const r = await generarVistasDe(personajePorId('madre'), null,
      (n, tot, i, aviso) => { if (aviso) avisos.push('v' + (i + 1) + ': ' + aviso); });
    window.fetch = real;
    return { r, intentosVista2, avisos };
  });
  t('una vista que falla se REINTENTA, no se salta', res.intentosVista2 === 3,
    res.intentosVista2 + ' intentos de la vista 2');
  t('y acaba saliendo: las 3 vistas se generan', res.r.hechas === 3, res.r.hechas + ' hechas');
  t('no queda marcada como fallida', res.r.fallos.length === 0, res.r.fallos.join(' · '));
  t('mientras espera, lo dice en pantalla', res.avisos.length === 2, res.avisos.join(' | '));
  t('y avisa de cuanto va a esperar', /en \d+ s/.test(res.avisos[0] || ''), res.avisos[0]);

  // Si falla SIEMPRE, se rinde con esa vista y avisa de que hay que parar.
  const res2 = await page.evaluate(async () => {
    PAUSA_VISTAS = 30; ESPERAS_REINTENTO = [40, 60, 80];
    const real = window.fetch;
    let intentos = 0;
    window.fetch = function (u, o) {
      if (String(u) === '/api/refs' && o && o.body) {
        const d = JSON.parse(o.body);
        if (d.action === 'generar' && d.vista === 0) {
          intentos++;
          return Promise.resolve(new Response('<html>timeout</html>', { status: 504 }));
        }
      }
      return real.apply(window, arguments);
    };
    const r = await generarVistasDe(personajePorId('padre-mayor'), [0]);
    window.fetch = real;
    return { r, intentos };
  });
  t('si falla siempre, lo intenta 4 veces antes de rendirse', res2.intentos === 4, res2.intentos + ' intentos');
  t('y marca la tanda como "hay que parar"', res2.r.rendido === true);
  t('el motivo que se ve es el de verdad, no un error de JSON',
    /tardó más de 60 s/.test(res2.r.fallos[0] || ''), res2.r.fallos[0]);

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
