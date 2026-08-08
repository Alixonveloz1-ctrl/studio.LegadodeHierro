// CUATRO FALLOS QUE APARECIERON EN UN VIDEO REAL DE MODO PROFESOR.
//
// 1. "Error 413" en cinco imagenes seguidas. Lo cause yo: al anadir las dos
//    anclas del episodio, cada peticion llevaba SEIS imagenes en base64 y se
//    pasaba del limite de 4,5 MB que acepta Vercel.
// 2. No se esperaba: en cuanto una imagen fallaba, se pasaba a la siguiente, que
//    encontraba el mismo limite. Ocho en rojo de golpe.
// 3. No se podia descargar nada desde el iPhone. Todo iba con <a download>, que
//    en iOS Safari se ignora para blob: y data:. El ZIP hasta decia "descargado".
// 4. Los subtitulos se iban en un video de tres minutos: el texto se repartia
//    sobre el tramo entero, silencios incluidos, y el desfase se acumulaba.
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

  // ---- 1. EL TAMAÑO DE LA PETICIÓN ----
  const peso = await page.evaluate(async () => {
    // Una referencia "pesada": 1400x1400 con ruido, que en PNG no comprime.
    const c = document.createElement('canvas'); c.width = 1400; c.height = 1400;
    const ctx = c.getContext('2d');
    const im = ctx.createImageData(1400, 1400);
    for (let i = 0; i < im.data.length; i += 4) {
      im.data[i] = (i * 7) % 255; im.data[i + 1] = (i * 13) % 255;
      im.data[i + 2] = (i * 29) % 255; im.data[i + 3] = 255;
    }
    ctx.putImageData(im, 0, 0);
    const grande = c.toDataURL('image/png').split(',')[1];
    const encogida = await encogerRef(grande);
    return { antes: grande.length, despues: encogida.length };
  });
  t('las referencias se encogen antes de viajar',
    peso.despues < peso.antes / 4,
    Math.round(peso.antes / 1024) + ' KB → ' + Math.round(peso.despues / 1024) + ' KB');
  // Y si aun asi se pasan, se sueltan las menos decisivas antes de enviar.
  const tope = await page.evaluate(async () => {
    const gordo = 'A'.repeat(1200000);
    const r = await encogerRefs([gordo, gordo, gordo, gordo, gordo, gordo]);
    let n = 0; r.forEach(x => { n += x.length; });
    return { quedan: r.length, peso: n, tope: REF_TOPE };
  });
  t('si el conjunto se pasa del límite, se sueltan referencias antes de enviar',
    tope.peso <= tope.tope, Math.round(tope.peso / 1024) + ' KB, quedan ' + tope.quedan + ' de 6');
  t('pero nunca se queda sin ninguna', tope.quedan >= 1);

  // El ancla SUSTITUYE a las 4 de marca en vez de sumarse.
  const cuenta = await page.evaluate(() => {
    const ancla = { personaje: 'data:image/png;base64,AAAA', lugares: { set: 'data:image/png;base64,BBBB' } };
    const cuatro = ['a', 'b', 'c', 'd'];
    const toma = conAnclasDeEpisodio('TOMA 1', 'TOMA 1', cuatro, ancla, true, 'profesor');
    const ejem = conAnclasDeEpisodio('EJEMPLO 1', 'EJEMPLO 1', cuatro, ancla, false, 'profesor');
    return { toma: (toma.refs || []).length, ejem: (ejem.refs || []).length, ejemPrompt: ejem.prompt };
  });
  t('una toma viaja con 2 referencias, no con 6', cuenta.toma === 2, cuenta.toma + ' referencias');

  // ---- 2. LOS EJEMPLOS: ni el profesor ni su ropa ----
  t('en los ejemplos NO viaja la cara del protagonista', cuenta.ejem === 0, cuenta.ejem + ' referencias');
  t('y se dice explícitamente que ahí sale otra persona',
    /the recurring signature character does NOT appear/.test(cuenta.ejemPrompt)
    && /Draw a different person/.test(cuenta.ejemPrompt));
  const spProf = await page.evaluate(() => buildSP('profesor'));
  t('el guion también pide que los ejemplos sean de otra gente',
    /LOS EJEMPLOS SON DE OTRA GENTE, NO DEL PROFESOR/.test(spProf));
  t('con el motivo: si sale en el error, deja de ser el profesor',
    /deja de ser el profesor/.test(spProf) && /verse a SÍ MISMO/.test(spProf));

  // ---- 3. SE ESPERA Y SE REINTENTA ----
  const A = fs.readFileSync(RAIZ + '/public/app.js', 'utf8');
  t('el bucle de imágenes reintenta con esperas, como la biblia',
    /for\(var intento=0;intento<=ESPERAS_REINTENTO\.length;intento\+\+\)\{[\s\S]{0,400}st\.textContent='Generando imagen/.test(A));
  t('si es el límite por minuto, espera el doble',
    /if\(esLimite\(ultimo\)\)esp\*=2/.test(A));
  t('y un 413 se explica en vez de salir como "Error 413" a secas',
    /la petición pesaba demasiado/.test(A));

  const reintentos = await page.evaluate(async () => {
    PAUSA_IMAGENES = 10; ESPERAS_REINTENTO = [10, 15, 20];
    let n = 0;
    const real = window.fetch;
    window.fetch = function (u, o) {
      if (String(u) === '/api/image') {
        n++;
        if (n <= 2) return Promise.resolve(new Response('x', { status: 413 }));
      }
      return real.apply(window, arguments);
    };
    lastRes = { modo: 'reel', uid: 7, topic: 'x', dO: { id: '30', secs: 30 }, a: 'g', f: 'e',
      c: ['una escena'] };
    imgFmt = '9:16';
    const oc = window.confirm; window.confirm = () => true;
    await genImages();
    window.confirm = oc; window.fetch = real;
    return { llamadas: n, generadas: imgs.filter(Boolean).length };
  });
  t('una imagen que falla se reintenta en vez de saltarse',
    reintentos.llamadas >= 3, reintentos.llamadas + ' llamadas');
  t('y acaba saliendo', reintentos.generadas >= 1, reintentos.generadas + ' generadas');

  // ---- 4. LAS DESCARGAS ----
  t('hay una única función de descarga para todo', /async function descargarArchivo\(/.test(A));
  t('usa la hoja de compartir del iPhone cuando está disponible',
    /navigator\.share\(\{files:\[new File/.test(A) && /puedeCompartirArchivos/.test(A));
  t('con plan B de <a download> para el ordenador', /a\.download=nombre/.test(A));
  t('ya no queda ningún <a download> suelto por ahí',
    (A.match(/\.download='legado/g) || []).length === 0
    && (A.match(/dl\.download=/g) || []).length === 0);
  t('el ZIP deja de decir "descargado" cuando no se descargó',
    !/btn\.innerHTML='✓ ZIP Descargado'/.test(A) && /res==='cancelado'\?'⬇ Descargar ZIP'/.test(A));

  const dl = await page.evaluate(async () => {
    let compartido = null;
    navigator.canShare = () => true;
    navigator.share = (d) => { compartido = d.files[0].name; return Promise.resolve(); };
    const r = await descargarArchivo(new Blob(['hola'], { type: 'text/plain' }), 'prueba.txt', 'text/plain');
    return { r, compartido };
  });
  t('descargar un archivo abre la hoja de compartir', dl.r === 'compartido' && dl.compartido === 'prueba.txt',
    dl.compartido);

  // ---- 5. LOS SUBTÍTULOS EN UN AUDIO LARGO CON PAUSAS ----
  // Se fabrica un audio de 60 s: habla 20 s, calla 15, habla 20. Repartir el
  // texto sobre los 60 s mete la mitad dentro del silencio.
  const subs = await page.evaluate(() => {
    const sr = 8000, dur = 60;
    const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, sr * dur, sr);
    const buf = ctx.createBuffer(1, sr * dur, sr);
    const d = buf.getChannelData(0);
    const hablar = (a, b) => { for (let i = a * sr; i < b * sr; i++) d[i] = Math.sin(i / 8) * 0.5; };
    hablar(2, 22); hablar(37, 57);
    const v = tramoDeVoz(buf);
    const aud = { dur: dur, vozIni: v.ini, vozFin: v.fin, vozTramos: v.tramos };
    // 20 bloques de texto de peso parecido.
    const texto = Array.from({ length: 40 }, (_, i) => 'frase numero ' + i + '.').join(' ');
    const srt = makeSRT(texto, aud);
    const tiempos = [...srt.matchAll(/(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)/g)]
      .map(m => ({
        ini: +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000,
        fin: +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000,
      }));
    // Cuantos subtitulos caen DENTRO del silencio de 22 a 37
    const enSilencio = tiempos.filter(x => x.ini > 23 && x.fin < 36).length;
    const malFormados = (srt.match(/,\d{4,}/g) || []).length;
    return { n: tiempos.length, tramos: v.tramos ? v.tramos.length : 0, enSilencio, malFormados,
      primero: tiempos[0], ultimo: tiempos[tiempos.length - 1] };
  });
  t('detecta los dos tramos hablados y el silencio de en medio', subs.tramos === 2, subs.tramos + ' tramos');
  t('ningún subtítulo se queda dentro del silencio', subs.enSilencio === 0,
    subs.enSilencio + ' de ' + subs.n + ' caían en el hueco');
  t('el primero entra con la voz', Math.abs(subs.primero.ini - 2) < 0.4, subs.primero.ini.toFixed(2) + 's (voz en 2s)');
  t('y el último acaba con ella', Math.abs(subs.ultimo.fin - 57) < 0.5, subs.ultimo.fin.toFixed(2) + 's (voz hasta 57s)');
  t('ningún tiempo del SRT es inválido (los "56,1000" de milésimas desbordadas)',
    subs.malFormados === 0, subs.malFormados + ' timestamps rotos');

  // ---- 6. LA MÚSICA, SIN PICOS ----
  const CR = fs.readFileSync(RAIZ + '/cloudrun/unify/index.js', 'utf8');
  t('la música se aplana antes de mezclarla', /dynaudnorm=f=250/.test(CR));
  t('y lo que sobresalga se recorta', /acompressor=threshold=0\.1/.test(CR));
  t('con un nivel conocido antes de aplicar el volumen elegido',
    /loudnorm=I=-24:TP=-6:LRA=3/.test(CR));
  t('la voz sigue entrando al 100%', /volume=1\.0\[nar\]/.test(CR));
  const V = JSON.parse(fs.readFileSync(RAIZ + '/package.json', 'utf8')) && true;
  t('y la versión del servicio subió, para que avise de actualizar',
    /const VERSION = '2026-08-08/.test(CR) && V);

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
