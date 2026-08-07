// EL ANCLA DEL PERSONAJE INSIGNIA.
//
// Nacio de un fallo real y grave: al regenerar las vistas del protagonista salia
// OTRO hombre. La causa era que sus 4 imagenes de marca vivian en el mismo campo
// (refs) que las vistas generadas, asi que la PRIMERA vista nueva que se guardaba
// pisaba refs[0] y borraba el ancla. A partir de ahi cada regeneracion copiaba a
// un desconocido inventado, y la cara del canal se perdia sin un solo aviso.
//
// Esta prueba no abre navegador: llama al endpoint real (api/refs.js) con el
// bucket y Vertex simulados, y mira QUE IMAGENES viajan de referencia en cada
// llamada al generador.

const crypto = require('crypto');
const path = require('path');

let ok = 0, ko = 0;
const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

// ---- entorno simulado ----
const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GCS_OUTPUT_BUCKET = 'creancion-de-contenido';
process.env.GCP_PROJECT_ID = 'proyecto-de-prueba';
process.env.GCP_SERVICE_ACCOUNT = JSON.stringify({
  client_email: 'prueba@ejemplo.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
});
delete process.env.APP_KEY;
delete process.env.VERCEL_ENV;

// El bucket es un objeto en memoria. Las 4 imagenes de marca ya estan puestas,
// como lo estan de verdad en el bucket del canal.
const BUCKET = {};
const marca = (n) => Buffer.from('IMAGEN-DE-MARCA-' + n + '-'.repeat(200)).toString('base64');
for (let i = 1; i <= 4; i++) BUCKET['refs/personaje-' + i] = marca(i);
const GENERADA = Buffer.from('IMAGEN-GENERADA-' + '-'.repeat(200)).toString('base64');

const LLAMADAS = []; // cada peticion al generador de imagenes
const IBB = [];      // descargas del origen externo

global.fetch = async (url, opts) => {
  const u = String(url);
  const resp = (obj, okk) => ({
    ok: okk !== false, status: okk === false ? 500 : 200,
    json: async () => obj,
    arrayBuffer: async () => Buffer.from(obj.__raw || '', 'base64'),
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(obj),
  });
  if (u.indexOf('oauth2.googleapis.com') > -1) return resp({ access_token: 'token-falso' });
  // Origen externo de las imagenes de marca (i.ibb.co), por si hay que recuperarlas
  if (u.indexOf('i.ibb.co') > -1) {
    IBB.push(u);
    return {
      ok: true, status: 200,
      headers: { get: () => 'image/png' },
      arrayBuffer: async () => Buffer.from(marca('RECUPERADA'), 'base64'),
      json: async () => ({}), text: async () => '',
    };
  }
  // Lectura del bucket
  let m = u.match(/storage\.googleapis\.com\/storage\/v1\/b\/[^/]+\/o\/([^?]+)\?alt=media/);
  if (m) {
    const obj = decodeURIComponent(m[1]);
    if (!BUCKET[obj]) return resp({}, false);
    return resp({ __raw: BUCKET[obj] });
  }
  // Escritura en el bucket
  m = u.match(/upload\/storage\/v1\/b\/[^/]+\/o\?uploadType=media&name=(.+)$/);
  if (m) {
    BUCKET[decodeURIComponent(m[1])] = Buffer.from(opts.body).toString('base64');
    return resp({ ok: true });
  }
  // Vertex: el generador de imagenes
  if (u.indexOf(':generateContent') > -1) {
    const body = JSON.parse(opts.body);
    const parts = body.contents[0].parts;
    LLAMADAS.push({
      refs: parts.filter(p => p.inlineData).map(p => Buffer.from(p.inlineData.data, 'base64').toString()),
      prompt: (parts.find(p => p.text) || {}).text || '',
      aspect: body.generationConfig && body.generationConfig.imageConfig
        && body.generationConfig.imageConfig.aspectRatio,
    });
    return resp({ candidates: [{ content: { parts: [{ inlineData: { data: GENERADA } }] } }] });
  }
  throw new Error('peticion no simulada: ' + u);
};

const handler = require(path.join(__dirname, '..', 'api', 'refs.js'));

// req/res minimos, como los que da Vercel
async function llamar(body) {
  let salida = null, code = 200;
  const res = {
    setHeader() {}, end() {},
    status(c) { code = c; return res; },
    json(o) { salida = o; return res; },
  };
  await handler({ method: 'POST', url: '/api/refs', headers: {}, body }, res);
  return { code, body: salida };
}

const ficha = (lista, id) => lista.find(x => x.id === id);

(async () => {
  // ---- 1. la biblia se siembra y el insignia nace con su ancla ----
  let r = await llamar({ action: 'list' });
  t('la biblia se siembra', r.code === 200 && r.body.personajes.length > 30, r.body.personajes.length + ' personajes');
  let ins = ficha(r.body.personajes, 'insignia');
  t('el insignia trae sus 4 imágenes de marca como ancla',
    ins && (ins.base || []).length === 4, ins && (ins.base || []).join(', '));
  t('la biblia son 3 vistas por personaje, no 4', r.body.personajes.every(p => (p.refs || []).length <= 3));
  t('y todavía no tiene ninguna vista generada', ins && (ins.refs || []).filter(Boolean).length === 0);

  // ---- 2. la vista 1 se genera CON las fotos reales de referencia ----
  r = await llamar({ action: 'generar', personaje: ins, vista: 0, model: 'gemini-3-pro-image' });
  t('la vista 1 se genera', r.code === 200 && r.body.vistas && r.body.vistas.length === 1);
  let l = LLAMADAS[LLAMADAS.length - 1];
  t('y viaja con las fotos REALES del personaje, no a ciegas',
    l.refs.length === 3 && l.refs.every(x => /IMAGEN-DE-MARCA/.test(x)), l.refs.length + ' referencias');
  t('el endpoint informa de que fue con referencia', r.body.conReferencia === 3);

  // ---- 3. el prompt: un retrato, no una lámina de personaje ----
  t('el prompt NO pide una lámina de personaje (era lo que sacaba 2 y 3 cabezas)',
    !/reference sheet/i.test(l.prompt));
  t('pide UNA sola figura, explícitamente',
    /ONE single illustration of ONE single person/.test(l.prompt) && /Exactly ONE person/.test(l.prompt));
  t('la vista 1 es un primer plano de la CARA',
    /EXTREME CLOSE-UP OF THE HEAD/.test(l.prompt) && /at least 70% of the picture/.test(l.prompt));
  t('y prohíbe dejar la figura pequeña en medio del blanco',
    /Do NOT leave empty white space around the head/.test(l.prompt));
  t('las reglas de "una sola persona" van al FINAL del prompt',
    l.prompt.indexOf('STRICT OUTPUT RULES') > l.prompt.indexOf('CHARACTER:'));
  t('prohíbe la lámina, el collage y la rejilla',
    /NOT a character model sheet/.test(l.prompt) && /NOT a collage, grid, diptych or contact sheet/.test(l.prompt));
  t('y prohíbe repetir el personaje al lado', /NO repeated versions of the character side by side/.test(l.prompt));
  t('pide formato vertical', l.aspect === '3:4', String(l.aspect));
  t('sigue exigiendo fondo blanco', /PLAIN PURE WHITE BACKGROUND/.test(l.prompt));
  t('y el estilo cómic del canal', /2D American comic book illustration/.test(l.prompt));
  t('el reparto adulto se pide atractivo', /good-looking and well-groomed/.test(l.prompt));

  // ---- 4. GUARDAR NO PUEDE BORRAR EL ANCLA (el fallo grave) ----
  r = await llamar({ action: 'guardar', personaje: ins, vistas: [{ i: 0, b64: GENERADA }] });
  t('la vista 1 se guarda', r.code === 200, r.code === 200 ? '' : JSON.stringify(r.body));
  ins = r.body.personaje;
  t('EL ANCLA SIGUE AHÍ después de guardar', (ins.base || []).length === 4, (ins.base || []).join(', '));
  t('y la vista 1 ocupa su hueco', ins.refs[0] === 'personajes/insignia/vista-1.png', ins.refs[0]);

  // ---- 5. la vista 2 se genera contra las fotos reales, no contra la generada ----
  r = await llamar({ action: 'generar', personaje: ins, vista: 1 });
  l = LLAMADAS[LLAMADAS.length - 1];
  t('la vista 2 recibe primero las fotos REALES del personaje',
    l.refs.slice(0, 3).every(x => /IMAGEN-DE-MARCA/.test(x)), l.refs.length + ' referencias');
  t('y además la vista 1 que ya se hizo',
    l.refs.some(x => /IMAGEN-GENERADA/.test(x)));
  t('se le dice al modelo que es LA MISMA persona', /THIS IS THE SAME PERSON/.test(l.prompt));
  await llamar({ action: 'guardar', personaje: ins, vistas: [{ i: 1, b64: GENERADA }] });

  // ---- 6. si falla una vista del medio, las demás NO se descolocan ----
  // Se guarda la vista 3 sin haber hecho la 2: el hueco 2 tiene que quedar vacío.
  BUCKET['personajes/index.json'] = Buffer.from(JSON.stringify([
    Object.assign({}, ins, { refs: ['personajes/insignia/vista-1.png', null, null] }),
  ]), 'utf8').toString('base64');
  r = await llamar({ action: 'guardar', personaje: ins, vistas: [{ i: 2, b64: GENERADA }] });
  ins = r.body.personaje;
  t('el hueco de la vista que falta se queda vacío', ins.refs[1] === null, JSON.stringify(ins.refs));
  t('la vista 3 se queda en SU sitio, no se corre al hueco libre',
    ins.refs[2] === 'personajes/insignia/vista-3.png', ins.refs[2]);
  t('la ficha tiene exactamente 3 huecos', ins.refs.length === 3);

  r = await llamar({ action: 'imagenes', id: 'insignia' });
  t('al pintarlas, se dice qué vista es cada una',
    JSON.stringify(r.body.indices) === '[0,2]', JSON.stringify(r.body.indices));
  t('y solo vienen las que existen', r.body.refs.length === 2);

  // ---- 7. rehacer una vista no la usa como referencia de sí misma ----
  await llamar({ action: 'generar', personaje: ins, vista: 0 });
  l = LLAMADAS[LLAMADAS.length - 1];
  t('rehacer la vista 1 no se copia a sí misma',
    l.refs.filter(x => /IMAGEN-GENERADA/.test(x)).length <= 1, l.refs.length + ' referencias');

  // ---- 8. reparación de una biblia YA dañada ----
  // Se simula el estado real del bucket del canal: el ancla borrada por el fallo.
  const danada = [{
    id: 'insignia', nombre: 'El hombre de Legado de Hierro', rol: 'Protagonista', fijo: true,
    fisico: 'hombre de 35 anos', edad: '35 anos',
    refs: ['personajes/insignia/vista-1.png', 'refs/personaje-2',
      'personajes/insignia/vista-3.png'],
  }];
  BUCKET['personajes/index.json'] = Buffer.from(JSON.stringify(danada), 'utf8').toString('base64');
  r = await llamar({ action: 'list' });
  ins = ficha(r.body.personajes, 'insignia');
  t('una biblia ya dañada se repara sola al abrirla',
    (ins.base || []).length === 4, (ins.base || []).join(', '));
  t('y la foto de marca que quedó suelta deja de contar como vista generada',
    ins.refs.indexOf('refs/personaje-2') === -1 && ins.refs[1] === null, JSON.stringify(ins.refs));
  t('las vistas buenas que ya había no se pierden',
    ins.refs[0] === 'personajes/insignia/vista-1.png' && ins.refs[2] === 'personajes/insignia/vista-3.png');

  // ---- 9. un personaje normal no inventa ancla ----
  const comp = ficha(r.body.personajes, 'companera');
  t('la compañera existe en el reparto', !!comp);
  t('y no tiene ancla: su cara la fija su primera vista', comp && (comp.base || []).length === 0);
  t('la compañera es rubia y guapa, como se pidió',
    comp && /rubi/.test(comp.fisico) && /guapa|bonito/.test(comp.fisico), comp && comp.fisico.slice(0, 60));

  // El niño NO recibe la cláusula de "atractivo": eso solo aplica a adultos.
  const nino = ficha(r.body.personajes, 'hijo-pequeno');
  await llamar({ action: 'generar', personaje: nino, vista: 0 });
  l = LLAMADAS[LLAMADAS.length - 1];
  t('a un menor no se le pide que sea "atractivo"',
    !/good-looking/.test(l.prompt) && /like a real kid/.test(l.prompt));

  // ---- 10. EL ANCLA SE RECUPERA SI NO ESTA EN EL BUCKET ----
  // Al cambiar de bucket, refs/personaje-N puede no existir alli todavia. Antes
  // readFromBucket devolvia null en silencio y el generador se quedaba SIN ninguna
  // referencia: dibujaba a un desconocido y nadie se enteraba de por que.
  for (let i = 1; i <= 4; i++) delete BUCKET['refs/personaje-' + i];
  IBB.length = 0;
  const insSinBucket = ficha((await llamar({ action: 'list' })).body.personajes, 'insignia');
  r = await llamar({ action: 'generar', personaje: insSinBucket, vista: 0 });
  l = LLAMADAS[LLAMADAS.length - 1];
  t('si el ancla no está en el bucket, se recupera de su origen',
    IBB.length > 0, IBB.length + ' descargas');
  t('y la vista se genera CON referencia igualmente',
    r.body.conAncla === 3, 'conAncla=' + r.body.conAncla);
  t('las imágenes recuperadas quedan copiadas en el bucket',
    !!BUCKET['refs/personaje-1'] && !!BUCKET['refs/personaje-2']);
  IBB.length = 0;
  await llamar({ action: 'generar', personaje: insSinBucket, vista: 1 });
  t('y la segunda vez ya se leen del bucket, sin volver a descargarlas',
    IBB.length === 0, IBB.length + ' descargas');

  // ---- 11. la descripcion del codigo MANDA sobre la ficha guardada ----
  // Cambiar el fisico en _personajes.js no servia de nada: la ficha vieja seguia
  // en el bucket y era esa la que llegaba al generador. La companera se puso rubia
  // y siguio saliendo morena por esto.
  const vieja = [{ id: 'companera', nombre: 'La compañera', rol: 'Su pareja', edad: '33 anos',
    fisico: 'mujer latina de 33 anos, cabello castano oscuro ondulado', refs: [] }];
  BUCKET['personajes/index.json'] = Buffer.from(JSON.stringify(vieja), 'utf8').toString('base64');
  const resinc = ficha((await llamar({ action: 'list' })).body.personajes, 'companera');
  t('una ficha vieja guardada se resincroniza con la del código',
    /rubi/.test(resinc.fisico), resinc.fisico.slice(0, 55));
  await llamar({ action: 'generar', personaje: resinc, vista: 0 });
  l = LLAMADAS[LLAMADAS.length - 1];
  t('y es la descripción NUEVA la que llega al generador', /rubio/.test(l.prompt));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.error('EXCEPCION: ' + e.stack); process.exit(1); });
