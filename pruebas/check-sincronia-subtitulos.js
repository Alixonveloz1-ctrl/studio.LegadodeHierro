// Los subtitulos del audio SUBIDO A MANO tienen que ir al ritmo de la voz.
// Antes se repartia el tiempo a 130 palabras por minuto FIJAS, sin mirar el
// audio: el desfase se acumulaba y al final del reel el texto iba por su cuenta.
const { chromium } = require('playwright-core');

// Guion en ingles de longitud realista para un reel de ~38 s.
const GUION = `Three steps to sell yourself before anyone buys from you.
First, stop asking for permission. Nobody hands you a seat at the table.
Second, build something small that works. One client. One result. One proof.
Third, charge what it costs you to keep going, not what you think they will accept.
You can build digital services while you keep your day job.
The clock does not wait for you to feel ready.
Iron Legacy.`;

// Medidas reales del video que mando el dueno.
const DUR = 38.14, VOZ_INI = 1.0, VOZ_FIN = 37.6;

const seg = (s) => { const m = /(\d+):(\d+):(\d+),(\d+)/.exec(s); return +m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000; };
const bloques = (srt) => srt.trim().split(/\n\s*\n/).map(b => {
  const l = b.split('\n');
  const [a, z] = l[1].split(' --> ');
  return { ini: seg(a), fin: seg(z), txt: l.slice(2).join(' ') };
});

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok = 0, ko = 0;
  const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp', 'test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // --- COMO ERA ANTES: 130 palabras por minuto fijas, sin mirar el audio ---
  const viejo = await page.evaluate((txt) => {
    const words = txt.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w.length);
    const secPerWord = 60 / 130; let t = 0, i = 0; const segs = [];
    while (i < words.length) {
      const g = [];
      while (i < words.length && g.length < 4) { g.push(words[i]); i++; if (/[.!?,;]$/.test(g[g.length - 1])) break; }
      if (!g.length) break;
      const d = g.length * secPerWord;
      segs.push({ ini: t, fin: t + d }); t += d;
    }
    return { fin: segs.length ? segs[segs.length - 1].fin : 0, ini: segs.length ? segs[0].ini : 0, n: segs.length };
  }, GUION);

  const desfaseInicio = VOZ_INI - viejo.ini;
  const desfaseFinal = Math.abs(viejo.fin - VOZ_FIN);
  console.log('   ANTES → el texto empezaba en ' + viejo.ini.toFixed(2) + 's y acababa en ' + viejo.fin.toFixed(2) + 's');
  console.log('           la voz va de ' + VOZ_INI.toFixed(2) + 's a ' + VOZ_FIN.toFixed(2) + 's');
  t('ANTES: arrancaba adelantado respecto a la voz', desfaseInicio > 0.5, 'adelantado ' + desfaseInicio.toFixed(2) + 's desde el primer subtítulo');
  t('ANTES: y al final el desfase era grande', desfaseFinal > 3, desfaseFinal.toFixed(1) + 's de desviación al final');

  // --- COMO ES AHORA: ajustado al tramo de voz medido ---
  const nuevoSRT = await page.evaluate((d) =>
    makeSRT(d.txt, { dur: d.DUR, vozIni: d.VOZ_INI, vozFin: d.VOZ_FIN }),
    { txt: GUION, DUR, VOZ_INI, VOZ_FIN });
  const bs = bloques(nuevoSRT);
  console.log('   AHORA → el texto va de ' + bs[0].ini.toFixed(2) + 's a ' + bs[bs.length - 1].fin.toFixed(2) + 's');

  t('AHORA: el primer subtítulo entra cuando entra la voz',
    Math.abs(bs[0].ini - VOZ_INI) < 0.05, 'arranca en ' + bs[0].ini.toFixed(2) + 's, la voz en ' + VOZ_INI + 's');
  t('AHORA: el último termina cuando termina la voz',
    Math.abs(bs[bs.length - 1].fin - VOZ_FIN) < 0.05, 'acaba en ' + bs[bs.length - 1].fin.toFixed(2) + 's, la voz en ' + VOZ_FIN + 's');
  t('AHORA: el desfase acumulado desaparece',
    Math.abs(bs[bs.length - 1].fin - VOZ_FIN) < desfaseFinal / 10,
    'de ' + desfaseFinal.toFixed(1) + 's a ' + Math.abs(bs[bs.length - 1].fin - VOZ_FIN).toFixed(2) + 's');

  // Los bloques van en orden, sin huecos ni solapes
  let ordenados = true, continuo = true;
  for (let i = 1; i < bs.length; i++) {
    if (bs[i].ini < bs[i - 1].ini) ordenados = false;
    if (Math.abs(bs[i].ini - bs[i - 1].fin) > 0.01) continuo = false;
  }
  t('los bloques van en orden y encadenados', ordenados && continuo);

  // Las frases largas duran mas que las cortas (peso por caracteres, no por palabras)
  const conMas = bs.reduce((a, x) => (x.txt.length > a.txt.length ? x : a), bs[0]);
  const conMenos = bs.reduce((a, x) => (x.txt.length < a.txt.length ? x : a), bs[0]);
  t('un bloque largo dura más que uno corto',
    (conMas.fin - conMas.ini) > (conMenos.fin - conMenos.ini),
    '"' + conMas.txt.slice(0, 22) + '" ' + (conMas.fin - conMas.ini).toFixed(2) + 's vs "'
    + conMenos.txt.slice(0, 22) + '" ' + (conMenos.fin - conMenos.ini).toFixed(2) + 's');

  // Sin medida del audio (por ejemplo un navegador que no lo sabe decodificar),
  // no puede romperse: usa la duracion total, y si tampoco, la estimacion vieja.
  const soloDur = bloques(await page.evaluate((txt) => makeSRT(txt, { dur: 38.14 }), GUION));
  t('si solo se conoce la duración, se ajusta a ella',
    Math.abs(soloDur[soloDur.length - 1].fin - 38.14) < 0.05, 'acaba en ' + soloDur[soloDur.length - 1].fin.toFixed(2) + 's');
  const sinNada = await page.evaluate((txt) => makeSRT(txt), GUION);
  t('sin ningún dato del audio sigue generando subtítulos', bloques(sinNada).length > 5);
  t('con texto vacío no revienta', (await page.evaluate(() => makeSRT('', null))) === '');

  // Y el tramo de voz se mide de verdad sobre una onda con silencio al principio
  const medido = await page.evaluate(async () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const sr = 16000, total = 5;
    const buf = ctx.createBuffer(1, sr * total, sr);
    const d = buf.getChannelData(0);
    // silencio 0-1s, tono 1-4s, silencio 4-5s
    for (let i = sr * 1; i < sr * 4; i++) d[i] = Math.sin(i * 0.05) * 0.5;
    const r = tramoDeVoz(buf);
    if (ctx.close) ctx.close();
    return r;
  });
  t('detecta dónde empieza la voz saltándose el silencio inicial',
    Math.abs(medido.ini - 1.0) < 0.15, 'empieza en ' + medido.ini.toFixed(2) + 's (real 1.00s)');
  t('y dónde termina, saltándose el silencio final',
    Math.abs(medido.fin - 4.0) < 0.15, 'acaba en ' + medido.fin.toFixed(2) + 's (real 4.00s)');

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  await b.close(); process.exit(ko ? 1 : 0);
})();
