// FASE 0: las cinco fugas tapadas.
const { chromium } = require('playwright-core');
const path = require('path');
const REPO = '/home/user/studio.LegadodeHierro';

(async () => {
  let ok=0,ko=0; const t=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);c?ok++:ko++;};

  // ===== 0.1 la puerta no se abre sola en produccion (prueba del modulo real) =====
  const authPath = path.join(REPO,'api/_auth.js');
  const cargar = (env) => {
    delete require.cache[require.resolve(authPath)];
    const guardado = { APP_KEY: process.env.APP_KEY, VERCEL_ENV: process.env.VERCEL_ENV };
    delete process.env.APP_KEY; delete process.env.VERCEL_ENV;
    if (env.APP_KEY !== undefined) process.env.APP_KEY = env.APP_KEY;
    if (env.VERCEL_ENV !== undefined) process.env.VERCEL_ENV = env.VERCEL_ENV;
    const m = require(authPath);
    const restore = () => {
      delete process.env.APP_KEY; delete process.env.VERCEL_ENV;
      if (guardado.APP_KEY !== undefined) process.env.APP_KEY = guardado.APP_KEY;
      if (guardado.VERCEL_ENV !== undefined) process.env.VERCEL_ENV = guardado.VERCEL_ENV;
    };
    return { m, restore };
  };
  const req = (k) => ({ headers: k ? { 'x-app-key': k } : {} });

  let a = cargar({ VERCEL_ENV: 'production' }); // produccion SIN APP_KEY
  t('sin APP_KEY en PRODUCCIÓN la API queda CERRADA', a.m.keyMatches(req()) === false);
  a.restore();

  a = cargar({ VERCEL_ENV: 'preview' }); // vista previa SIN APP_KEY
  t('sin APP_KEY en vista previa sigue abierta (no te bloquea probando)', a.m.keyMatches(req()) === true);
  a.restore();

  a = cargar({}); // local, sin VERCEL_ENV
  t('sin APP_KEY en local sigue abierta', a.m.keyMatches(req()) === true);
  a.restore();

  a = cargar({ APP_KEY: 'clave-buena', VERCEL_ENV: 'production' });
  t('con APP_KEY, la clave correcta pasa', a.m.keyMatches(req('clave-buena')) === true);
  t('con APP_KEY, una clave falsa NO pasa', a.m.keyMatches(req('otra')) === false);
  t('con APP_KEY, sin cabecera NO pasa', a.m.keyMatches(req()) === false);
  a.restore();

  // el 401 de produccion sin clave tiene que EXPLICAR que falta configurarla
  a = cargar({ VERCEL_ENV: 'production' });
  let cuerpo=null;
  const res = { status(){return this;}, json(o){cuerpo=o;return this;} };
  a.m.checkAuth(req(), res);
  t('el 401 sin APP_KEY dice que falta configurarla (no "contraseña incorrecta")',
    !!(cuerpo && cuerpo.sinClave === true && /APP_KEY/.test(cuerpo.error)));
  a.restore();

  // los dos ESM llevan el mismo criterio
  const fs = require('fs');
  const vs = fs.readFileSync(path.join(REPO,'api/video-start.js'),'utf8');
  const vst = fs.readFileSync(path.join(REPO,'api/video-status.js'),'utf8');
  t('video-start.js (el endpoint más caro) también cierra en producción',
    /VERCEL_ENV[^\n]*production/.test(vs));
  t('video-status.js también cierra en producción',
    /VERCEL_ENV[^\n]*production/.test(vst));

  // ===== resto: en navegador =====
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
  const page = await b.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  await page.route(/https:\/\/(fonts|i\.ibb|cdnjs)/, r => r.abort());
  await page.goto('http://localhost:8321/', { waitUntil: 'domcontentloaded' });
  await page.fill('#lp','test123'); await page.click('text=⚔ Entrar'); await page.waitForSelector('#pg-app.on');

  // el mock responde {open:true} => tiene que salir la barra roja
  await page.waitForTimeout(300);
  const barra = await page.evaluate(()=>{
    const d=document.getElementById('avisoCandado');
    return d?{txt:d.textContent,primero:d.parentNode.firstChild===d}:null;
  });
  t('con el candado abierto sale la barra roja de aviso', !!barra);
  t('la barra avisa de que pueden gastar tus créditos',
    !!(barra && /créditos/i.test(barra.txt) && /APP_KEY/.test(barra.txt)));
  t('la barra va arriba del todo', !!(barra && barra.primero));

  // ===== 0.3 los modelos se recuerdan =====
  // El selector vive dentro de un panel plegable: se cambia por codigo, igual que
  // haria el usuario al desplegarlo.
  await page.evaluate(()=>{
    const s=document.getElementById('selVidModel');
    s.value='veo-3.1-fast-generate-001';
    s.dispatchEvent(new Event('change'));
  });
  await page.waitForTimeout(100);
  t('cambiar el modelo lo guarda',
    await page.evaluate(()=>localStorage.getItem('lh_gen_vidModel')==='veo-3.1-fast-generate-001'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#pg-app.on');
  await page.waitForTimeout(200);
  t('tras recargar sigue el modelo elegido, no el de por defecto',
    await page.evaluate(()=>vidModel==='veo-3.1-fast-generate-001'
      && document.getElementById('selVidModel').value==='veo-3.1-fast-generate-001'));
  // un valor guardado que ya no existe no puede dejar el select en blanco
  await page.evaluate(()=>localStorage.setItem('lh_gen_vidModel','veo-inventado-999'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#pg-app.on'); await page.waitForTimeout(200);
  t('un modelo guardado que ya no existe se ignora (no deja el selector vacío)',
    await page.evaluate(()=>{
      const s=document.getElementById('selVidModel');
      return s.value===vidModel && s.value.length>0;
    }));

  // ===== 0.4 el panel fantasma ya no está =====
  t('el panel fantasma de agenda desapareció del código',
    await page.evaluate(()=>typeof buildSched==='undefined'
      && typeof refreshSched==='undefined'
      && typeof buildSuggestPrompt==='undefined'));

  // ===== 0.2 regenerar imagen suelta el clip viejo =====
  await page.evaluate(()=>localStorage.setItem('lh_hist','[]'));
  await page.fill('#conc','probar el clip viejo');
  await page.click('#gbtn');
  await page.waitForFunction(()=>typeof loading!=='undefined'&&loading===false&&lastRes,null,{timeout:15000});
  const clip = await page.evaluate(async () => {
    // simular que la imagen 0 ya tiene su clip animado
    imgs[0]={src:'data:image/png;base64,AAAA',idx:1};
    vids[0]={url:'blob:viejo',downloadUrl:'https://storage.googleapis.com/viejo.mp4'};
    vidState[0]='done';
    const antes={estado:vidState[0],url:vids[0].downloadUrl};
    const cambio=invalidarClip(0);
    return {antes, cambio, despues:{estado:vidState[0], vid:vids[0]}};
  });
  t('el clip de una imagen regenerada se suelta', clip.cambio===true && clip.despues.estado==='idle');
  t('y el clip viejo ya no puede colarse en la unificación', clip.despues.vid===null);
  const sinClip = await page.evaluate(()=>{ vidState[1]='idle'; return invalidarClip(1); });
  t('si no había clip, no hace nada (ni avisa de más)', sinClip===false);

  console.log('\n'+ok+' OK, '+ko+' fallos');
  await b.close(); process.exit(ko?1:0);
})();
