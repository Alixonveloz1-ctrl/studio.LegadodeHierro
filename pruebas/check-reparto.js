// EL REPARTO. Hasta ahora el canal tenia UN personaje y el prompt prohibia
// inventar otros: todos los reels eran el mismo hombre solo. Ahora hay 31
// secundarios y el director tiene que poder llamarlos.
const { chromium } = require('playwright-core');
const { REPARTO } = require('/home/user/studio.LegadodeHierro/api/_personajes.js');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  // ---- el reparto como dato ----
  t('hay 31 personajes en el reparto', REPARTO.length === 31, String(REPARTO.length));
  t('ninguno repite identificador', new Set(REPARTO.map(p => p.id)).size === REPARTO.length);
  t('todos tienen físico concreto para el generador', REPARTO.every(p => p.fisico && p.fisico.length > 60));
  t('todos dicen al director cuándo encajan', REPARTO.every(p => p.encaja && p.encaja.length > 30));
  const mujeres = REPARTO.filter(p => /^(mujer|adolescente latina|joven latina)/.test(p.fisico)).length;
  t('el reparto no es solo de hombres', mujeres >= 8, mujeres + ' mujeres de ' + REPARTO.length);
  const edades = REPARTO.map(p => parseInt(p.edad, 10)).filter(isFinite);
  t('cubre todas las edades', Math.min(...edades) < 12 && Math.max(...edades) > 60,
    'de ' + Math.min(...edades) + ' a ' + Math.max(...edades) + ' años');
  t('el jefe NO está escrito como villano', /NUNCA como villano/.test(REPARTO.find(p => p.id === 'jefe').encaja));

  // ---- en la herramienta ----
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');
  await page.waitForFunction(() => typeof BIBLIA !== 'undefined' && BIBLIA.length > 5, null, { timeout: 10000 });

  const biblia = await page.evaluate(() => BIBLIA.map(p => ({ id: p.id, fijo: !!p.fijo })));
  t('la biblia carga sola al entrar', biblia.length === 32, biblia.length + ' (31 + insignia)');
  t('el insignia está y está marcado como fijo', biblia.some(p => p.id === 'insignia' && p.fijo));
  t('el insignia es el único fijo', biblia.filter(p => p.fijo).length === 1);

  // ---- el director recibe el reparto ----
  const prompt = await page.evaluate(() => buildEpisodeMsg('un socio que te falla', 'mentalidad', 'historia', 'historia', '60').msg);
  t('el reparto llega al prompt del guion', prompt.indexOf('EL REPARTO DEL CANAL') > -1);
  t('con sus identificadores', prompt.indexOf('companera') > -1 && prompt.indexOf('mentor') > -1);
  t('se le explica la marca [CON: id]', /\[CON:\s*id\]/.test(prompt));
  t('se le limita a dos secundarios', /maximo DOS secundarios/i.test(prompt));
  t('se le prohíbe inventar gente nueva', /NO inventes personas nuevas/i.test(prompt));
  t('ya NO dice "jamás inventando un personaje"', prompt.indexOf('jamás inventando un personaje') < 0);

  // ---- los menos usados van primero ----
  await page.evaluate(() => {
    const h = [];
    for (let i = 0; i < 6; i++) h.push({ a: 'x', topic: 't' + i, t: 'libertad', d: '60', h: 'dato', modo: 'reel',
      fecha: new Date().toISOString(), id: 'p' + i, sem: { personajes: ['mentor', 'companera'] }, estado: 'borrador' });
    localStorage.setItem('lh_hist', JSON.stringify(h));
  });
  const orden = await page.evaluate(() => repartoDisponible().map(p => p.id));
  t('los que acaban de salir caen al final del reparto',
    orden.indexOf('mentor') > 20 && orden.indexOf('companera') > 20,
    'mentor en la posición ' + orden.indexOf('mentor') + ', compañera en la ' + orden.indexOf('companera'));

  // ---- la marca [CON:] se traduce a referencias ----
  const esc = await page.evaluate(async () => {
    const r = await refsDeEscena('[CON: companera] cocina de noche, ella sentada a la mesa con las cuentas');
    return { prompt: r.prompt, nRefs: r.refs ? r.refs.length : 0, ids: r.ids };
  });
  t('detecta a quién llamó el director', esc.ids.length === 1 && esc.ids[0] === 'companera');
  t('la marca NO queda en el prompt que ve el generador', esc.prompt.indexOf('[CON:') < 0);
  t('trae las vistas de ese personaje', esc.nRefs > 0, esc.nRefs + ' vistas');
  t('y añade su descripción para que no cambie de cara',
    /OTRAS PERSONAS EN ESTA ESCENA/.test(esc.prompt) && /compa/i.test(esc.prompt));

  const sinMarca = await page.evaluate(async () => await refsDeEscena('oficina vacia al amanecer'));
  t('sin marca no toca nada', sinMarca.ids.length === 0 && sinMarca.refs === null
    && sinMarca.prompt === 'oficina vacia al amanecer');

  // ---- la marca no puede llegar al generador de VIDEO ni al resumen de escena ----
  const limpio = await page.evaluate(() => {
    lastRes = { c: ['[CON: mentor] terraza al atardecer, los dos de pie'], topic: 'x', uid: 99 };
    return { video: buildVideoMotionPrompt(0), resumen: resumirEscena(lastRes.c[0]) };
  });
  t('el prompt de vídeo no lleva la marca', limpio.video.indexOf('[CON:') < 0);
  t('el resumen de escena tampoco', limpio.resumen.indexOf('[CON:') < 0);

  // ---- la pantalla de la biblia ----
  await page.evaluate(() => document.getElementById('bibliaBtn').click());
  await page.waitForTimeout(200);
  const tarjetas = await page.evaluate(() => document.querySelectorAll('#bibliaGrid > div').length);
  t('la pantalla muestra el reparto entero', tarjetas === 32, tarjetas + ' tarjetas');
  t('el título dice cuántos tienen vistas',
    /con vistas/.test(await page.evaluate(() => document.getElementById('bibliaLbl').textContent)));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
