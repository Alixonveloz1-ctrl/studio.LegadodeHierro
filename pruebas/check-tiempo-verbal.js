// AL ESPECTADOR NO SE LE INVENTA UN PASADO.
//
// Nacio de un guion real. Salio esto:
//
//   "Hace años creías tener todo bajo control... La fractura llegó un martes,
//    cuando viste a un colega mayor ser despedido... Registraste tu propia LLC
//    desde el comedor de tu casa... Estuviste a punto de rendirte mil veces."
//
// Le esta contando al espectador una vida que no ha vivido. En cuanto no le
// cuadra, deja de creerte. Y ademas no sirve: el canal esta para decirle lo que
// TIENE QUE HACER, no para felicitarle por algo que no hizo.
//
// La causa estaba escrita en las plantillas: el modo Historia pedia "cuentalo en
// segunda persona (tu)... el que cambia es el espectador", y el modo Relato pedia
// una estructura entera de pasado en segunda persona.
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

  // ---- la regla llega a LOS CINCO modos ----
  const MODOS = ['reel', 'historia', 'impacto', 'profesor', 'relato'];
  const sp = await page.evaluate((ms) => {
    const out = {};
    ms.forEach((m) => { out[m] = buildSP(m); });
    return out;
  }, MODOS);

  MODOS.forEach((m) => {
    t('modo ' + m + ': lleva la regla del tiempo verbal',
      /EN QUÉ TIEMPO SE LE HABLA/.test(sp[m]));
  });
  MODOS.forEach((m) => {
    t('modo ' + m + ': prohíbe el pasado inventado en segunda persona',
      /PROHIBIDO en segunda persona y en pasado/.test(sp[m])
      && /tomaste la decisión/.test(sp[m]) && /registraste tu empresa/.test(sp[m]));
  });
  MODOS.forEach((m) => {
    t('modo ' + m + ': le dice cómo SÍ — presente e imperativo',
      /lo que tienes que hacer es/.test(sp[m]) && /el primer paso es/.test(sp[m]));
  });
  MODOS.forEach((m) => {
    t('modo ' + m + ': si hay pasado, es de OTRO y en tercera persona',
      /es de OTRO y en TERCERA persona/.test(sp[m]) && /no la protagoniza/.test(sp[m]));
  });

  // ---- lo que se pedía antes ya NO se pide ----
  t('el modo Historia ya no pide contarlo en segunda persona',
    !/Cuéntalo en segunda persona \(tú\) o desde la lección/.test(sp.historia));
  t('y dice que el que cambia es OTRO, no el espectador',
    /Cuéntalo de OTRO, en tercera persona/.test(sp.historia));
  t('el modo Relato ya no pide la historia en segunda persona',
    !/CÓMO SE CUENTA: en segunda persona/.test(sp.relato));
  t('su historia es de un tercero', /la historia es de OTRO, en TERCERA persona/.test(sp.relato));

  // ---- la estructura del Relato: el espectador entra al principio y al final ----
  t('el relato engancha hablándole al espectador en presente',
    /GANCHO \(0-15s\): AL ESPECTADOR, en presente/.test(sp.relato));
  t('la historia del medio va en tercera persona y en pasado',
    /DE DÓNDE VIENE ÉL/.test(sp.relato) && /en tercera persona y en pasado/.test(sp.relato));
  t('y el cierre vuelve a él con lo que tiene que hacer',
    /Y AHORA TÚ/.test(sp.relato) && /es la orden de marcha/.test(sp.relato));
  t('el cierre no es un resumen de la historia',
    /Esta parte NO es un resumen de la historia/.test(sp.relato));

  // ---- la regla viaja dentro del mensaje que se manda de verdad ----
  const msg = await page.evaluate(() =>
    buildEpisodeMsg('la libertad financiera de verdad', 'libertad', 'pregunta', 'relato', '180').msg);
  t('el mensaje real que se envía la lleva', /EN QUÉ TIEMPO SE LE HABLA/.test(msg));
  t('y sigue llevando todo lo demás (pilar, reparto, memoria)',
    /PILAR:/.test(msg) && /EL REPARTO DEL CANAL/.test(msg));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
