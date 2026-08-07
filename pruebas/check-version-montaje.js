// LA HERRAMIENTA SABE SOLA SI EL CLOUD RUN ESTA AL DIA.
// Nacio de un problema de trato, no de codigo: cada vez que se tocaba el montaje
// habia que PREGUNTAR "¿corriste el actualizador?", porque el servicio solo
// respondia {ok:true} y no habia forma de saberlo desde fuera. Preguntar por algo
// que la maquina puede comprobar sola es hacerle perder el tiempo a quien la usa.
// Ahora el servicio devuelve su version y la herramienta la compara y lo dice.
//
// Esta prueba levanta SUS PROPIOS servidores (puertos 8331 y 8332), uno que finge
// un Cloud Run al dia y otro desactualizado, asi que no necesita el servidor de
// prueba de siempre ni se pelea con el.
const { chromium } = require('playwright-core');
const { spawn } = require('child_process');
const fs = require('fs');

const RAIZ = '/home/user/studio.LegadodeHierro';

function levantar(puerto, estado) {
  const p = spawn('node', [RAIZ + '/pruebas/servidor-de-prueba.js'], {
    env: Object.assign({}, process.env, { PUERTO: String(puerto), CR_ESTADO: estado }),
    stdio: 'ignore',
  });
  return p;
}

async function mirarPanel(browser, puerto) {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, (r) => r.abort());
  await page.goto('http://localhost:' + puerto + '/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123');
  await page.click('text=⚔ Entrar');
  await page.waitForSelector('#pg-app.on');
  await page.waitForFunction(() => {
    const el = document.getElementById('crVer');
    return el && el.style.display === 'block';
  }, { timeout: 8000 });
  const r = await page.evaluate(() => {
    const el = document.getElementById('crVer');
    return { texto: el.textContent, fondo: el.style.background };
  });
  await page.close();
  return r;
}

(async () => {
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  // ---- el servicio publica su version y la herramienta la consulta ----
  const CR = fs.readFileSync(RAIZ + '/cloudrun/unify/index.js', 'utf8');
  const API = fs.readFileSync(RAIZ + '/api/unify.js', 'utf8');
  const vS = (CR.match(/^const VERSION = '([^']+)'/m) || [])[1];
  const vE = (API.match(/^const VERSION_ESPERADA = '([^']+)'/m) || [])[1];
  t('el servicio tiene una versión', !!vS, vS);
  t('la herramienta espera esa misma versión', !!vS && vS === vE, vE);
  t('el servicio la devuelve en su respuesta de salud', /service: 'legado-unify', version: VERSION/.test(CR));
  t('el endpoint responde a GET para consultarla', /req\.method === 'GET'/.test(API));
  t('y no se cuelga si el servicio no contesta', /AbortController/.test(API));
  t('un servicio viejo (sin versión) cuenta como desactualizado', /const actual = d\.version \|\| null/.test(API));

  const s1 = levantar(8331, 'al-dia');
  const s2 = levantar(8332, 'desactualizado');
  await new Promise((r) => setTimeout(r, 1500));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  try {
    // ---- al dia: lo dice, y no manda a correr nada ----
    const al = await mirarPanel(b, 8331);
    t('con el montaje al día lo dice claramente', /al día/.test(al.texto), al.texto.trim());
    t('y muestra qué versión hay corriendo', al.texto.indexOf(vS) > -1);
    t('sin pedir que se corra ningún comando', al.texto.indexOf('curl') === -1);

    // ---- desactualizado: avisa y da el comando exacto ----
    const des = await mirarPanel(b, 8332);
    t('si le falta la actualización, lo avisa', /falta la última actualización/.test(des.texto), des.texto.slice(0, 55));
    t('dice qué versión necesita', des.texto.indexOf(vE) > -1);
    t('y da el comando exacto, listo para copiar',
      /curl -sL https:\/\/studio\.legadodehierro\.com\/u\.sh \| bash/.test(des.texto));
    t('el aviso se ve distinto del "al día"', des.fondo !== al.fondo);
  } finally {
    await b.close();
    s1.kill(); s2.kill();
  }

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  process.exit(ko ? 1 : 0);
})();
