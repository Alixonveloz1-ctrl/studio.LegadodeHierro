// LO QUE SE ANUNCIA SE ENSEÑA, Y EL GUION TIENE QUE MOVER.
//
// Dos cosas que salieron de leer un guion real de modo Profesor de 3 minutos.
//
// 1. EL PASO UNO PROMETÍA Y NO ENTREGABA. El guion decía "te voy a dar el método
//    para registrar una LLC" y luego el paso uno era "el primer paso es abrir una
//    LLC, es tu escudo y tu motor", soltaba Wyoming y el número fiscal, y saltaba
//    al paso dos. Nunca enseñó a registrar nada.
//
//    Y el arreglo NO es que enseñe el papeleo: es que el papeleo no es lo que
//    enseña este canal. Aquí se enseñan modelos de negocio y cómo llegar a la
//    libertad financiera. Un trámite es un requisito del camino — se nombra, se
//    dice para qué sirve y se manda a un tutorial aparte. Lo que no puede ser es
//    anunciarlo como enseñanza y no darla.
//
// 2. LOS GUIONES SALÍAN FRÍOS. El bloque de fuerza emocional estaba copiado
//    palabra por palabra en los tres modos cortos y NO estaba en los largos — y
//    los largos son donde más falta hace, porque hay seis minutos que perder. El
//    modo Profesor encima decía "no es motivación: es una clase", que es lo que
//    producía guiones correctos y muertos.
const { chromium } = require('playwright-core');
const fs = require('fs');
const RAIZ = '/home/user/studio.LegadodeHierro';

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

  const MODOS = ['reel', 'impacto', 'historia', 'profesor', 'relato'];
  const LARGOS = ['profesor', 'relato'];
  const sp = await page.evaluate((ms) => {
    const o = {}; ms.forEach(m => { o[m] = buildSP(m); }); return o;
  }, MODOS);

  // ---- 1. LO QUE ANUNCIAS, LO ENSEÑAS ----
  MODOS.forEach(m => {
    t('modo ' + m + ': no se anuncia lo que no se va a enseñar',
      /LO QUE ANUNCIAS, LO ENSEÑAS/.test(sp[m]));
  });
  t('se le dan las frases concretas que hay que revisar',
    /"te voy a enseñar", "te voy a dar el método", "vas a aprender a", "hoy vas a saber"/.test(sp.profesor));
  t('y la regla de oro: la promesa es la suma de lo que viene después',
    /tiene que ser exactamente la suma de lo que viene después, ni más ni menos/.test(sp.reel));

  // ---- 2. EL PAPELEO NO ES LO QUE ENSEÑA ESTE CANAL ----
  LARGOS.forEach(m => {
    t('modo ' + m + ': se dice que aquí no se enseña papeleo',
      /ESTE CANAL NO ENSEÑA PAPELEO/.test(sp[m]));
    t('modo ' + m + ': con el caso real de la LLC, para que no se repita',
      /te voy a dar el método para registrar una LLC/.test(sp[m])
      && /No enseñó a registrar nada/.test(sp[m]));
    t('modo ' + m + ': se separa QUÉ enseña el canal de QUÉ no',
      /QUÉ ENSEÑA ESTE CANAL: modelos de negocio/.test(sp[m])
      && /QUÉ NO ENSEÑA: el trámite/.test(sp[m]));
    t('modo ' + m + ': el trámite se nombra y se manda a un tutorial',
      /lo buscas en un tutorial que te lleve de la mano/.test(sp[m]));
    t('modo ' + m + ': con el ejemplo de cómo se dice bien y cómo mal',
      /BIEN: "Vas a necesitar una empresa registrada/.test(sp[m])
      && /MAL: "Te voy a dar el método para registrar una LLC/.test(sp[m]));
    t('modo ' + m + ': y un trámite nunca es el paso número uno',
      /UN TRÁMITE NO ES EL PASO NÚMERO UNO/.test(sp[m]));
    t('modo ' + m + ': con el motivo, que es lo que el canal ya predica',
      /primero se consigue a quien paga, después se monta la estructura/.test(sp[m]));
  });
  t('a los reels NO se les mete la parrafada del papeleo: ahí no se enseñan métodos',
    ['reel', 'impacto', 'historia'].every(m => !/ESTE CANAL NO ENSEÑA PAPELEO/.test(sp[m])));

  // ---- 3. LA ESTRUCTURA DEL PROFESOR EXIGE EL CÓMO ----
  t('la promesa del profesor es exactamente lo que el vídeo entrega',
    /EXACTAMENTE lo que el video entrega después/.test(sp.profesor));
  t('y ahí no se promete ningún trámite',
    /Aquí no se promete ningún trámite ni ningún papeleo/.test(sp.profesor));
  t('cada paso tiene que traer su CÓMO, no solo el qué y el porqué',
    /EL CÓMO ES EL QUE NO PUEDE FALTAR/.test(sp.profesor));
  t('un paso sin cómo es un titular, no una clase',
    /es un titular, no una clase/.test(sp.profesor));
  t('y si no hay cómo, deja de ser paso y pasa a ser requisito previo',
    /no es un paso: es un requisito previo/.test(sp.profesor)
    && /no numerado dentro de él/.test(sp.profesor));

  // ---- 4. LA EMOCIÓN, EN LOS CINCO MODOS ----
  MODOS.forEach(m => {
    t('modo ' + m + ': lleva la fuerza emocional', /FUERZA EMOCIONAL/.test(sp[m]));
    t('modo ' + m + ': con las cuatro palancas',
      /RECONOCIMIENTO:/.test(sp[m]) && /LA HERIDA:/.test(sp[m])
      && /LO QUE CUESTA NO CAMBIAR:/.test(sp[m]) && /EL FUEGO:/.test(sp[m]));
    t('modo ' + m + ': y no vale abrir fuerte y luego enfriarse',
      /NO SOLO AL PRINCIPIO/.test(sp[m]));
  });
  t('la emoción sale de la precisión, no de frases de coach',
    MODOS.every(m => /sale de la PRECISIÓN/.test(sp[m])));

  // ---- 5. EN LOS LARGOS, LA RETENCIÓN ES DE MINUTOS ----
  LARGOS.forEach(m => {
    t('modo ' + m + ': se le explica que en un vídeo largo se pierde por goteo',
      /QUE SE QUEDE HASTA EL FINAL/.test(sp[m]) && /se va por goteo/.test(sp[m]));
    t('modo ' + m + ': cada tramo se vuelve a ganar al espectador',
      /CADA TRAMO SE GANA AL ESPECTADOR OTRA VEZ/.test(sp[m]));
    t('modo ' + m + ': dejando abierto lo que viene',
      /DEJA ABIERTO LO QUE VIENE/.test(sp[m])
      && /Nadie se va en mitad de una promesa/.test(sp[m]));
    t('modo ' + m + ': y el ejemplo tiene persona, no solo números',
      /EL EJEMPLO ES EMOCIÓN, NO SOLO ARITMÉTICA/.test(sp[m]));
  });
  t('esa parte NO se le manda a un reel de 30 s, que no tiene minutos que perder',
    ['reel', 'impacto', 'historia'].every(m => !/QUE SE QUEDE HASTA EL FINAL/.test(sp[m])));

  // ---- 6. EL PROFESOR YA NO SE PROHÍBE EMOCIONARSE ----
  t('el modo profesor ya no dice "no es motivación: es una clase"',
    !/No es motivación: es una clase/.test(sp.profesor));
  t('ni "el protagonista enseña, no arenga"',
    !/El protagonista enseña, no arenga/.test(sp.profesor));
  t('ahora la clase la da alguien a quien le importa',
    /una CLASE, pero dada por alguien a quien le importa/.test(sp.profesor));
  t('lo prohibido es la arenga hueca, no la emoción',
    /Lo prohibido es la arenga hueca/.test(sp.profesor)
    && /La emoción no solo está permitida, hace falta/.test(sp.profesor));
  t('pero sigue teniendo que enseñar algo aplicable',
    /REGLA DE UTILIDAD/.test(sp.profesor) && /UN método concreto y aplicable/.test(sp.profesor));

  // ---- 7. UNA SOLA FUENTE, SIN COPIAS ----
  const A = fs.readFileSync(RAIZ + '/public/app.js', 'utf8');
  t('el bloque emocional está escrito UNA vez, no copiado en cada modo',
    (A.match(/FUERZA EMOCIONAL: el guion tiene que MOVER/g) || []).length === 1,
    (A.match(/FUERZA EMOCIONAL: el guion tiene que MOVER/g) || []).length + ' copias');
  t('y lo usan los cinco modos', (A.match(/fuerzaEmocional\(/g) || []).length === 5,
    (A.match(/fuerzaEmocional\(/g) || []).length + ' usos');
  t('lo mismo la regla de la promesa', (A.match(/reglaPromesa\(/g) || []).length === 5);
  MODOS.forEach(m => {
    t('modo ' + m + ': no se repite dentro del mismo prompt',
      (sp[m].match(/FUERZA EMOCIONAL:/g) || []).length === 1
      && (sp[m].match(/LO QUE ANUNCIAS/g) || []).length === 1);
  });

  // ---- 8. NO SE ROMPIÓ NADA DE LO DE ANTES ----
  MODOS.forEach(m => {
    t('modo ' + m + ': sigue llevando la regla del tiempo verbal',
      /EN QUÉ TIEMPO SE LE HABLA/.test(sp[m]));
    t('modo ' + m + ': y la de no atacar a nadie', /SIN RESENTIMIENTO/.test(sp[m]));
  });

  // ---- 9. TODO ESTO VIAJA EN EL MENSAJE QUE SE ENVÍA DE VERDAD ----
  const msg = await page.evaluate(() =>
    buildEpisodeMsg('montar un servicio digital', 'negocio', 'pasos', 'profesor', '180').msg);
  t('el mensaje real del profesor lleva las dos reglas nuevas',
    /LO QUE ANUNCIAS, LO ENSEÑAS/.test(msg) && /ESTE CANAL NO ENSEÑA PAPELEO/.test(msg)
    && /QUE SE QUEDE HASTA EL FINAL/.test(msg));
  t('y sigue llevando lo de siempre (pilar, reparto, duración)',
    /PILAR:/.test(msg) && /EL REPARTO DEL CANAL/.test(msg) && /palabras/.test(msg));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
