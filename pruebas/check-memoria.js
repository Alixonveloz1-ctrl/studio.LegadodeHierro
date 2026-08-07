// FASE 1: la memoria se usa DE VERDAD al escribir el guion.
// Antes el prompt ordenaba "jamas repitas el mismo detalle de un guion a otro"
// a un modelo que no recibia ni un guion anterior.
const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  let ok=0,ko=0; const t=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);c?ok++:ko++;};

  // Las pruebas comparten el mismo servidor: se limpia el estado de la biblia para
  // que el orden en que se ejecuten no cambie el resultado.
  await page.goto('http://localhost:8321/__bibliareset');
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp','test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // ---- El historial ya no muere a los 10 ----
  t('el historial guarda 300, no 10', await page.evaluate(()=>HIST_MAX===300));

  // Sembrar historial con 6 guiones de prueba
  await page.evaluate(() => {
    const mk = (i, enf, topic) => ({
      a: 'Gancho numero '+i+' que abre distinto.\n\nCuerpo del guion '+i+'.\n\nCierre propio del '+i+'.\n\nLegado de Hierro.',
      f:'', c:[], cRaw:'', topic: topic, t:'libertad', d:'60', h:'dato', modo:'reel',
      fecha:new Date(Date.now()-i*3600000).toISOString(), id:'seed'+i,
      sem:{enf:enf, ang:null, regs:['mundoA','mundoB']}, estado:'borrador', publicado:'',
    });
    const ENF = ENFOQUES.slice(0,5);
    const h = ENF.map((e,i)=>mk(i+1,e,'concepto de prueba '+(i+1)));
    localStorage.setItem('lh_hist', JSON.stringify(h));
  });

  // ---- El bloque YA DICHO llega al prompt ----
  const prompt = await page.evaluate(() => buildEpisodeMsg('probar la memoria','libertad','dato','reel','60').msg);
  t('el prompt incluye el bloque "YA DICHO"', prompt.indexOf('LO QUE ESTE CANAL YA DIJO') > -1);
  t('le pasa los ganchos ya usados', prompt.indexOf('Gancho numero 1') > -1);
  t('le pasa los cierres ya usados', prompt.indexOf('Cierre propio del 1') > -1);
  t('NO cuenta "Legado de Hierro" como cierre (es la firma)',
    prompt.indexOf('- Legado de Hierro') < 0);
  t('le pasa los conceptos ya tratados', prompt.indexOf('concepto de prueba 3') > -1);

  // ---- La puerta de entrada NO repite las ya usadas ----
  const usadas = await page.evaluate(() => JSON.parse(localStorage.getItem('lh_hist')).map(x=>x.sem.enf));
  const nuevas = await page.evaluate(() => {
    const out=[];
    for(let i=0;i<12;i++) out.push(buildEpisodeMsg('x','libertad','dato','reel','60').sem.enf);
    return out;
  });
  t('la puerta elegida nunca es una de las 5 ya usadas',
    nuevas.every(e => usadas.indexOf(e) < 0) || (console.log('   repetidas: '+nuevas.filter(e=>usadas.indexOf(e)>-1).length),false));
  t('y sigue variando entre sí', new Set(nuevas).size >= 5);

  // ---- Los mundos visuales tampoco ----
  const regs = await page.evaluate(() => buildEpisodeMsg('x','libertad','dato','reel','60').sem.regs);
  t('los registros visuales evitan los recién usados',
    regs.indexOf('mundoA') < 0 && regs.length === 3);

  // ---- Al agotar la lista se reabre (nunca se queda sin opciones) ----
  const conTodoUsado = await page.evaluate(() => {
    const h = ENFOQUES.map((e,i)=>({a:'x',topic:'t'+i,t:'libertad',d:'60',h:'dato',modo:'reel',
      fecha:new Date().toISOString(),id:'f'+i,sem:{enf:e,ang:null,regs:[]},estado:'borrador'}));
    localStorage.setItem('lh_hist', JSON.stringify(h));
    return buildEpisodeMsg('x','libertad','dato','reel','60').sem.enf;
  });
  t('con TODAS las puertas gastadas, sigue eligiendo una (no se cuelga)',
    typeof conTodoUsado === 'string' && conTodoUsado.length > 0);

  // ---- Las semillas se guardan en el historial al generar ----
  await page.evaluate(()=>localStorage.setItem('lh_hist','[]'));
  await page.fill('#conc','memoria de prueba');
  await page.click('#gbtn');
  await page.waitForFunction(()=>typeof loading!=='undefined'&&loading===false&&lastRes,null,{timeout:15000});
  const g = await page.evaluate(()=>JSON.parse(localStorage.getItem('lh_hist'))[0]);
  t('el reel guardado lleva su semilla creativa', !!(g.sem && g.sem.enf));
  t('el reel guardado lleva id estable', typeof g.id==='string' && g.id.length>1);
  t('el reel guardado nace como borrador', g.estado==='borrador');

  // ---- Marcar publicado ----
  await page.evaluate(()=>{ document.getElementById('histBtn').click(); });
  await page.waitForTimeout(200);
  const antes = await page.evaluate(()=>document.querySelector('.histPub').textContent.trim());
  await page.evaluate(()=>document.querySelector('.histPub').click());
  await page.waitForTimeout(200);
  const despues = await page.evaluate(()=>({
    txt: document.querySelector('.histPub').textContent.trim(),
    estado: JSON.parse(localStorage.getItem('lh_hist'))[0].estado,
    fecha: JSON.parse(localStorage.getItem('lh_hist'))[0].publicado,
  }));
  t('el botón arranca en "Marcar publicado"', antes.indexOf('Marcar')>-1);
  t('al pulsarlo el reel queda publicado', despues.estado==='publicado' && despues.txt.indexOf('Publicado')>-1);
  t('y guarda la fecha de publicación', !!despues.fecha);
  t('marcar publicado NO restauró el reel (no cerró el panel)',
    await page.evaluate(()=>document.getElementById('histPanel').classList.contains('on')));

  console.log('\n'+ok+' OK, '+ko+' fallos');
  await b.close(); process.exit(ko?1:0);
})();
