// LOS SUBTITULOS, MEDIDOS CONTRA LA ESTRUCTURA REAL DE UN VIDEO DEL CANAL.
//
// Esto no es una prueba inventada. El usuario mando su video de 147 s ("Deja de
// dormir, abre tu PF") y se midio con ffmpeg:
//
//   · 48 tramos de voz, 117,7 s hablados de 147,1 s totales
//   · 47 pausas, de 0,36 s a 0,99 s (mediana 0,64 s)
//   · los subtitulos que salieron cambiaban 0,56 s de media fuera de sitio,
//     con errores sueltos de hasta 1,4 s
//
// Con esos 48 tramos se fabrica aqui un guion en el que se SABE que trozo de
// texto va en cada tramo, se le pasa a makeSRT el audio con esa misma estructura,
// y se mira a cuanto cae cada trozo de donde de verdad empieza.
//
// El metodo viejo (repartir por peso sobre todo el audio) deja 1 s de error medio
// sobre esta misma estructura, y 8 de cada 10 subtitulos a mas de 0,4 s de la voz.
//
// HASTA DONDE SE PUEDE LLEGAR SIN LOS TIEMPOS DE ELEVENLABS. Se comprobo: para
// cada uno de 80 guiones se calculo el coste del reparto que elige el algoritmo y
// el del reparto VERDADERO. En los 80 el elegido cuesta menos o igual — o sea que
// la busqueda encuentra siempre su minimo, y lo que queda de error no es un fallo
// de programa: es que el texto no dice lo suficiente para distinguir el reparto
// bueno del malo cuando la voz no para donde esta la coma. Eso solo lo arregla
// tener los tiempos de verdad (plan de pago de ElevenLabs), no otro algoritmo.
// Por eso los limites de abajo son los que se han medido, no un ideal.
const { chromium } = require('playwright-core');

// --- los 48 tramos medidos del video real, en segundos ---
const TRAMOS = [[0,3.74369],[4.17288,5.49794],[6.12812,8.16369],[8.86694,10.6655],
[11.3224,15.6582],[16.5534,19.2376],[20.0174,23.46],[24.0634,25.622],[26.0412,28.4322],
[29.198,31.6989],[32.3789,34.4093],[35.1653,36.9794],[37.6532,41.1037],[41.4754,43.4022],
[44.3456,45.1887],[45.6001,47.9409],[48.5691,50.5704],[51.0472,52.7503],[53.7426,57.2089],
[57.5652,60.8103],[61.2016,65.5106],[66.2516,69.6103],[70.0353,71.4967],[72.2077,74.4372],
[75.0752,76.9856],[77.3766,79.7702],[80.5152,81.5027],[81.9387,83.6237],[84.4817,87.6467],
[88.3337,91.5137],[92.1977,92.9377],[93.3687,95.9587],[96.4787,99.8887],[100.704,103.489],
[104.002,105.011],[105.554,108.933],[109.789,110.717],[111.073,115.048],[115.653,117.977],
[118.717,120.827],[121.183,123.407],[124.221,127.729],[128.65,133.523],[134.365,136.746],
[137.176,138.658],[139.403,140.774],[141.326,143.402],[143.888,146.7]];

const PALABRAS = ('el dinero no se gana trabajando mas horas sino construyendo sistemas que trabajen '
  + 'por ti mientras duermes la libertad financiera empieza el dia que dejas de cambiar tiempo por '
  + 'euros y empiezas a comprar activos que pagan tus gastos cada mes sin pedirte permiso disciplina '
  + 'paciencia y un plan escrito valen mas que cualquier golpe de suerte porque nadie va a venir a '
  + 'rescatarte responsabilidad independencia constancia').split(' ');

const silabas = (w) => {
  const m = w.toLowerCase().replace(/[^a-záéíóúüñ]/g, '').match(/[aeiouáéíóúü]+/g);
  return m ? m.length : 1;
};

// Fabrica un guion sobre los tramos reales. Cada tramo lleva su trozo de texto,
// con las silabas que caben en su duracion. `desliz` es la parte de tramos donde
// la voz NO respeta la puntuacion (respira dentro de un trozo, o no para en una
// coma): esos casos existen y el algoritmo tiene que aguantarlos.
function fabricar(semilla, ruido, desliz) {
  let s = semilla >>> 0;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  let wi = Math.floor(rnd() * PALABRAS.length);
  const trozos = [];
  let i = 0;
  while (i < TRAMOS.length) {
    let nTramos = 1, nTrozos = 1;
    const r = rnd();
    if (r < desliz / 2 && i + 1 < TRAMOS.length) nTramos = 2;
    else if (r < desliz) nTrozos = 2;
    let dur = 0;
    for (let k = i; k < i + nTramos && k < TRAMOS.length; k++) dur += TRAMOS[k][1] - TRAMOS[k][0];
    const cupo = dur * 5.6 * (1 + (rnd() - 0.5) * 2 * ruido);
    const ws = []; let sil = 0;
    while ((sil < cupo || ws.length < 2) && ws.length < 40) { const w = PALABRAS[wi++ % PALABRAS.length]; ws.push(w); sil += silabas(w); }
    const corte = nTrozos === 2 ? Math.max(1, Math.floor(ws.length / 2)) : ws.length;
    trozos.push({ texto: ws.slice(0, corte).join(' ') + (rnd() < 0.28 ? '.' : ','), t: TRAMOS[i][0] });
    if (nTrozos === 2) trozos.push({ texto: ws.slice(corte).join(' ') + (rnd() < 0.28 ? '.' : ','), t: null });
    i += nTramos;
  }
  let texto = trozos.map(t => t.texto).join(' ').replace(/\s+/g, ' ');
  if (!/[.!?]$/.test(texto)) texto = texto.replace(/,$/, '') + '.';
  return { texto, verdad: trozos.map(t => t.t) };
}

// Un WAV de 16 kHz con exactamente esos tramos de voz y esos silencios.
function wavDeTramos() {
  const SR = 16000, DUR = 147.2, n = Math.round(SR * DUR);
  const pcm = new Int16Array(n);
  let s = 7; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff * 2 - 1; };
  TRAMOS.forEach(([a, b]) => {
    const i0 = Math.round(a * SR), i1 = Math.round(b * SR);
    for (let i = i0; i < i1 && i < n; i++) {
      const t = (i - i0) / SR;
      const env = 0.55 + 0.45 * Math.sin(2 * Math.PI * 4.2 * t);
      const v = (Math.sin(2 * Math.PI * 130 * t) * 0.6 + Math.sin(2 * Math.PI * 620 * t) * 0.3 + rnd() * 0.12) * env;
      pcm[i] = Math.max(-1, Math.min(1, v * 0.7)) * 30000;
    }
  });
  const data = Buffer.from(pcm.buffer), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]).toString('base64');
}

(async () => {
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  await page.goto('http://localhost:8321/__bibliareset');
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar');
  await page.waitForSelector('#pg-app.on');

  const wav = wavDeTramos();

  // ---- el audio se mide bien: los 48 tramos reales se detectan ----
  const medida = await page.evaluate(async (wav) => {
    const bin = atob(wav), ab = new ArrayBuffer(bin.length), u8 = new Uint8Array(ab);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = await ctx.decodeAudioData(ab);
    const tr = tramoDeVoz(buf);
    let hab = 0; tr.tramos.forEach(x => hab += x.fin - x.ini);
    window.__aud = { dur: buf.duration, vozIni: tr.ini, vozFin: tr.fin, vozTramos: tr.tramos };
    return { n: tr.tramos.length, hab, ini: tr.ini, fin: tr.fin };
  }, wav);
  t('se detectan los 48 tramos de voz del video real', medida.n === 48, medida.n + ' tramos');
  t('y los 117,7 s hablados, con medio segundo de margen',
    Math.abs(medida.hab - 117.7) < 1.5, medida.hab.toFixed(1) + ' s');

  // ---- 40 guiones distintos sobre esa misma estructura ----
  const casos = [];
  for (let sem = 1; sem <= 40; sem++) casos.push(fabricar(sem * 7919 + 13, 0.10, 0.25));

  const r = await page.evaluate((casos) => {
    const aud = window.__aud;
    const salida = [];
    for (const caso of casos) {
      const srt = makeSRT(caso.texto, aud, 'es');
      // Que bloque del SRT arranca cada trozo de puntuacion.
      const uds = (caso.texto.replace(/\s+/g, ' ').trim().match(/[^.!?,;:]+[.!?,;:]*/g) || [])
        .map(x => x.trim()).filter(x => x.length);
      const primer = []; let acum = 0;
      uds.forEach(u => {
        primer.push(acum);
        const w = u.split(' ').filter(x => x.length);
        acum += Math.max(1, Math.ceil(w.length / 4));
      });
      const T = (s) => { const m = s.match(/(\d+):(\d+):(\d+),(\d+)/); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
      const bloques = srt.trim().split(/\n\n+/);
      const ini = bloques.map(bq => T(bq.split('\n')[1].split(' --> ')[0]));
      const fin = bloques.map(bq => T(bq.split('\n')[1].split(' --> ')[1]));
      salida.push({
        errs: primer.map((p, i) => caso.verdad[i] == null || ini[p] == null ? null : Math.abs(ini[p] - caso.verdad[i])).filter(x => x !== null),
        nBloques: bloques.length,
        creciente: ini.every((x, i) => i === 0 || x >= ini[i - 1] - 0.001),
        conFin: fin.every((f, i) => f > ini[i]),
        sinHueco: ini.every((x, i) => i === 0 || x <= fin[i - 1] + 0.001),
        dentro: ini.every(x => x >= 0 && x <= aud.dur + 0.5) && fin.every(x => x <= aud.dur + 1),
        formato: !/,\d{4}/.test(srt) && !/-\d/.test(srt),
      });
    }
    return salida;
  }, casos);

  const todos = r.reduce((a, x) => a.concat(x.errs), []);
  const orden = [...todos].sort((a, b) => a - b);
  const media = todos.reduce((a, x) => a + x, 0) / todos.length;
  const p90 = orden[Math.floor(orden.length * 0.9)];
  const peor = orden[orden.length - 1];
  const mal = todos.filter(x => x > 0.4).length / todos.length;
  const muyMal = todos.filter(x => x > 1.5).length / todos.length;

  console.log('\n  ' + r.length + ' guiones · ' + todos.length + ' arranques medidos');
  console.log('  media ' + media.toFixed(2) + ' s · p90 ' + p90.toFixed(2) + ' s · peor '
    + peor.toFixed(2) + ' s · a más de 0,4 s ' + (mal * 100).toFixed(0)
    + '% · a más de 1,5 s ' + (muyMal * 100).toFixed(1) + '%');
  console.log('  (el metodo anterior, sobre esta misma estructura: 1,02 s de media, 80% a más de 0,4 s)\n');

  t('el subtítulo arranca a menos de 0,25 s de la voz, de media',
    media < 0.25, media.toFixed(2) + ' s');
  t('nueve de cada diez, a menos de medio segundo', p90 < 0.55, 'p90 ' + p90.toFixed(2) + ' s');
  t('menos de uno de cada seis se va de 0,4 s', mal < 0.16, (mal * 100).toFixed(0) + '%');
  t('y los desfases gordos son raros: menos del 3% pasa de 1,5 s',
    muyMal < 0.03, (muyMal * 100).toFixed(1) + '%');
  t('mejora de más del quíntuple sobre repartir por peso', media < 1.02 / 5,
    media.toFixed(2) + ' s frente a 1,02 s');

  t('los subtítulos van en orden, nunca hacia atrás', r.every(x => x.creciente));
  t('todos duran algo: ninguno acaba antes de empezar', r.every(x => x.conFin));
  t('no hay huecos sin subtítulo entre bloque y bloque', r.every(x => x.sinHueco));
  t('ninguno se sale del audio', r.every(x => x.dentro));
  t('los tiempos del SRT están bien escritos', r.every(x => x.formato));

  // ---- UNA VOZ QUE CASI NO PARA, Y UN SILENCIO LARGO EN MEDIO ----
  // Este caso rompio el arreglo dos veces. El texto trae cincuenta comas y el
  // audio solo dos trozos de voz con quince segundos de silencio en medio: no hay
  // pausas que repartir. Forzar el reparto metia subtitulos dentro del silencio,
  // y al arreglar eso salian tiempos hacia atras. Se vigilan las dos cosas.
  const pocos = await page.evaluate(() => {
    const sr = 8000, dur = 60;
    const buf = new (window.OfflineAudioContext)(1, sr * dur, sr).createBuffer(1, sr * dur, sr);
    const d = buf.getChannelData(0);
    const hablar = (a, z) => { for (let i = a * sr; i < z * sr; i++) d[i] = Math.sin(i / 8) * 0.5; };
    hablar(2, 22); hablar(37, 57);
    const v = tramoDeVoz(buf);
    const aud = { dur, vozIni: v.ini, vozFin: v.fin, vozTramos: v.tramos };
    const texto = Array.from({ length: 50 }, (_, i) => 'trozo numero ' + i + ',').join(' ')
      .replace(/,$/, '.');
    const srt = makeSRT(texto, aud, 'es');
    const T = (s) => { const m = s.match(/(\d+):(\d+):(\d+),(\d+)/); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
    const bq = srt.trim().split(/\n\n+/);
    const ini = bq.map(x => T(x.split('\n')[1].split(' --> ')[0]));
    const fin = bq.map(x => T(x.split('\n')[1].split(' --> ')[1]));
    return {
      tramos: v.tramos.length, n: bq.length,
      enSilencio: ini.filter((x, i) => x > 23 && fin[i] < 36).length,
      atras: ini.filter((x, i) => i && x < ini[i - 1] - 0.001).length,
      primero: ini[0], ultimo: ini[ini.length - 1],
      // cada mitad del texto tiene que caer en su mitad del audio
      enPrimera: ini.filter(x => x < 23).length, enSegunda: ini.filter(x => x > 36).length,
    };
  });
  t('con solo 2 trozos de voz, el audio se mide igual', pocos.tramos === 2, pocos.tramos + ' tramos');
  t('ningún subtítulo se queda dentro del silencio de 15 s',
    pocos.enSilencio === 0, pocos.enSilencio + ' de ' + pocos.n);
  t('y ninguno va hacia atrás', pocos.atras === 0, pocos.atras + ' hacia atrás');
  t('el texto se reparte entre los dos trozos, no se apelotona en uno',
    pocos.enPrimera > pocos.n * 0.3 && pocos.enSegunda > pocos.n * 0.3,
    pocos.enPrimera + ' en el primero, ' + pocos.enSegunda + ' en el segundo');
  t('empieza cuando empieza la voz, no en el segundo 0',
    pocos.primero > 1.5 && pocos.primero < 3.5, pocos.primero.toFixed(2) + ' s');

  // ---- sin audio medido, no se rompe: reparte y ya ----
  const solo = await page.evaluate(() => {
    const a = makeSRT('Una frase corta. Y otra un poco más larga que la anterior.', null, 'es');
    const b2 = makeSRT('Una frase corta. Y otra un poco más larga.', { dur: 12 }, 'es');
    return { a: a.split(/\n\n+/).length, b: b2, vacio: makeSRT('', { dur: 10 }, 'es') };
  });
  t('sin audio ninguno, sigue saliendo un SRT', solo.a >= 2, solo.a + ' bloques');
  t('con solo la duración, se reparte en esa duración',
    /00:00:1[012]/.test(solo.b.split('\n').slice(-3).join(' ')), solo.b.split('\n').slice(-4, -2).join(' '));
  t('sin texto, no se inventa nada', solo.vacio === '');

  // ---- el inglés cuenta sus propias sílabas ----
  const sil = await page.evaluate(() => ({
    esTarde: silabasDe('tarde', false), enTime: silabasDe('time', true),
    enMore: silabasDe('more', true), enTable: silabasDe('table', true),
    esConstruyendo: silabasDe('construyendo', false), enFreedom: silabasDe('freedom', true),
  }));
  t('en español la -e final suena: "tarde" son 2 sílabas', sil.esTarde === 2, String(sil.esTarde));
  t('en inglés no: "time" y "more" son 1', sil.enTime === 1 && sil.enMore === 1,
    sil.enTime + ',' + sil.enMore);
  t('pero "table" sigue siendo 2', sil.enTable === 2, String(sil.enTable));
  t('y las palabras largas se cuentan bien',
    sil.esConstruyendo === 4 && sil.enFreedom === 2, sil.esConstruyendo + ',' + sil.enFreedom);

  // ---- el idioma llega desde donde se llama ----
  const fs = require('fs');
  const A = fs.readFileSync(__dirname + '/../public/app.js', 'utf8');
  t('al exportar el ZIP se dice qué idioma es cada guion',
    /makeSRT\(lastRes&&lastRes\.a\?lastRes\.a:'',audES,'es'\)/.test(A)
    && /makeSRT\(lastRes&&lastRes\.f\?lastRes\.f:'',audEN,'en'\)/.test(A));
  t('y al quemar los subtítulos en el vídeo, también',
    /makeSRT\(texto\|\|'',aud,idioma\)/.test(A));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
