// EL GUION DE LOS MODOS LARGOS.
//
// Nacio de un fallo real: en modo Profesor de 3 minutos salia siempre
// "No se pudo leer el guion ES. Intenta de nuevo", por muchas veces que se
// reintentara. Dos causas, y las dos estaban en el servidor:
//
//   1. El tope de salida era 8192 tokens. Un video largo son 450 palabras en
//      espanol MAS 450 en ingles, mas el set, las tomas, los ejemplos y el
//      montaje — y encima el modelo gasta tokens de salida en pensar. Se pasaba
//      del tope y la respuesta llegaba cortada.
//   2. El reintento solo cubria errores HTTP. Una respuesta 200 con el texto
//      inservible se daba por buena y se mandaba al navegador tal cual.
//
// Esta prueba llama al endpoint real con Vertex simulado.

const crypto = require('crypto');
const path = require('path');

let ok = 0, ko = 0;
const t = (n, c, extra) => { console.log((c ? 'PASS  ' : 'FAIL  ') + n + (extra ? '  (' + extra + ')' : '')); c ? ok++ : ko++; };

const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GCP_PROJECT_ID = 'proyecto-de-prueba';
process.env.GCP_SERVICE_ACCOUNT = JSON.stringify({
  client_email: 'prueba@ejemplo.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
});
delete process.env.APP_KEY;
delete process.env.VERCEL_ENV;

const GUION_BUENO = 'BLOQUE A\nTienes el dinero justo y no sabes a donde se fue.\nLegado de Hierro.\n\n'
  + 'BLOQUE C\nSET: su oficina de noche\nTOMA 1: hablando a camara\n\nBLOQUE F\nYou have just enough.';

let RESPUESTAS = [];   // lo que va a contestar Vertex, en orden
const PETICIONES = [];

global.fetch = async (url, opts) => {
  const u = String(url);
  const R = (obj, okk) => ({ ok: okk !== false, status: okk === false ? 500 : 200,
    json: async () => obj, text: async () => JSON.stringify(obj) });
  if (u.indexOf('oauth2.googleapis.com') > -1) return R({ access_token: 'token-falso' });
  if (u.indexOf(':generateContent') > -1) {
    const body = JSON.parse(opts.body);
    PETICIONES.push({
      modelo: (u.match(/models\/([^:]+):/) || [])[1],
      maxOut: body.generationConfig.maxOutputTokens,
      pensar: body.generationConfig.thinkingConfig && body.generationConfig.thinkingConfig.thinkingLevel,
    });
    const sig = RESPUESTAS.shift() || { texto: GUION_BUENO, fin: 'STOP' };
    if (sig.http === false) return R({ error: { message: 'boom' } }, false);
    return R({ candidates: [{ finishReason: sig.fin,
      content: { parts: sig.texto === null ? [] : [{ text: sig.texto }] } }] });
  }
  throw new Error('peticion no simulada: ' + u);
};

const handler = require(path.join(__dirname, '..', 'api', 'generate.js'));

async function generar(prompt) {
  let salida = null, code = 200;
  const res = { setHeader() {}, end() {},
    status(c) { code = c; return res; }, json(o) { salida = o; return res; } };
  await handler({ method: 'POST', url: '/api/generate', headers: {}, body: { prompt: prompt || 'x' } }, res);
  return { code, body: salida };
}

(async () => {
  // ---- 1. el modelo y el tope ----
  PETICIONES.length = 0; RESPUESTAS = [];
  let r = await generar();
  t('usa el modelo de texto más potente', PETICIONES[0].modelo === 'gemini-3.1-pro-preview', PETICIONES[0].modelo);
  t('el tope de salida da para un vídeo largo (ES + EN + bloques)',
    PETICIONES[0].maxOut >= 32768, PETICIONES[0].maxOut + ' tokens');
  t('y no gasta el tope pensando de más', PETICIONES[0].pensar === 'LOW', PETICIONES[0].pensar);
  t('con una respuesta buena, responde a la primera', PETICIONES.length === 1);
  t('y devuelve el texto', r.code === 200 && /BLOQUE A/.test(r.body.text));
  t('con el motivo de corte, para poder diagnosticar', r.body.finishReason === 'STOP', r.body.finishReason);
  t('y cuántos caracteres llegaron', r.body.chars === GUION_BUENO.length, String(r.body.chars));

  // ---- 2. una respuesta 200 pero INSERVIBLE se reintenta ----
  // Este era el agujero: llegaba un 200 con el guion cortado, se daba por bueno,
  // y era el navegador el que acababa diciendo "no se pudo leer el guion".
  PETICIONES.length = 0;
  RESPUESTAS = [
    { texto: 'Claro, aqui tienes el gui', fin: 'MAX_TOKENS' },
    { texto: GUION_BUENO, fin: 'STOP' },
  ];
  r = await generar();
  t('un guion cortado NO se da por bueno: se reintenta', PETICIONES.length === 2, PETICIONES.length + ' llamadas');
  t('y a la segunda sale bien', r.code === 200 && /BLOQUE A/.test(r.body.text));

  // ---- 3. si nunca sale, se dice POR QUE ----
  PETICIONES.length = 0;
  RESPUESTAS = [
    { texto: 'texto sin bloques', fin: 'MAX_TOKENS' },
    { texto: 'texto sin bloques', fin: 'MAX_TOKENS' },
    { texto: 'texto sin bloques', fin: 'MAX_TOKENS' },
  ];
  r = await generar();
  t('lo intenta 3 veces antes de rendirse', PETICIONES.length === 3, PETICIONES.length + ' llamadas');
  t('el texto igual llega, para que el navegador pueda explicarlo',
    r.code === 200 && r.body.finishReason === 'MAX_TOKENS', JSON.stringify(r.body && r.body.finishReason));

  // ---- 3b. el reloj: no se empieza un intento que no cabe en los 60 s ----
  // Reintentar a ciegas puede acabar peor: tres intentos lentos se pasan del
  // limite de Vercel y el navegador recibe un 504 con HTML, no un error legible.
  const R = require('fs').readFileSync(path.join(__dirname, '..', 'api', 'generate.js'), 'utf8');
  t('hay un reloj que impide empezar un intento sin margen',
    /const MARGEN_MS = 42000/.test(R) && /Date\.now\(\) - t0ms > MARGEN_MS/.test(R));
  t('y el margen cabe de sobra en los 60 s del plan gratuito',
    Number((R.match(/const MARGEN_MS = (\d+)/) || [])[1]) < 60000);

  // ---- 4. sin texto ninguno ----
  PETICIONES.length = 0;
  RESPUESTAS = [{ texto: null, fin: 'SAFETY' }, { texto: null, fin: 'SAFETY' }, { texto: null, fin: 'SAFETY' }];
  r = await generar();
  t('si no devuelve texto, el error dice el motivo',
    r.code === 502 && /SAFETY/.test(r.body.error), r.body && r.body.error);

  // ---- 5. el navegador explica el fallo en vez de decir "intenta de nuevo" ----
  const A = require('fs').readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
  t('el aviso del navegador ya no es un "intenta de nuevo" a secas',
    !/No se pudo leer el guion ES\. Intenta de nuevo\./.test(A));
  t('dice si se cortó por longitud', /el guion se cortó por longitud/.test(A));
  t('cuántos caracteres llegaron y con qué empezaban',
    /caracteres/.test(A) && /Empezaba por/.test(A));

  // ---- 6. DOS LLAMADAS: el espanol por un lado y el ingles por otro ----
  // Pedirlo todo de una vez eran casi 1000 palabras entre los dos idiomas en la
  // misma respuesta. Y el limite de 60 s de Vercel es POR LLAMADA, asi que
  // partirlo no solo reparte los tokens: da el doble de tiempo.
  t('las plantillas ya NO piden el guion en inglés',
    !/BLOQUE F\n\[El mismo guion en inglés/.test(A) && !/BLOQUE F\n\[Traducción natural/.test(A));
  t('y se le dice al modelo que el inglés no va en esa respuesta',
    /El ingles NO va aqui: se pide aparte/.test(A));
  t('hay una llamada dedicada al inglés', /function buildInglesMsg\(/.test(A) && /async function fetchIngles\(/.test(A));
  t('esa llamada avisa al servidor de que no lleva bloques', /sinBloques:true/.test(A));
  t('y el servidor lo respeta', /const sinBloques = !!\(req\.body && req\.body\.sinBloques\)/.test(R));

  // ---- 7. el inglés es una ADAPTACION, no una traduccion ----
  t('se le prohíbe traducir frase por frase',
    /THIS IS NOT A TRANSLATION/.test(A) && /Do not translate sentence by sentence/.test(A));
  t('tiene que sonar a estadounidense nativo hablando',
    /the way a NATIVE/.test(A) && /US speaker would say it out loud/.test(A));
  t('con referencias de allí cuando la española no encaje',
    /401k/.test(A) && /Never leave a Spanish idiom translated word for word/.test(A));
  t('sin dejar palabras en español ni la firma española',
    /No Spanish words left in/.test(A) && /the English brand is IRON LEGACY/.test(A));
  t('y con la misma duración que el español', /It has to fit the same/.test(A));
  t('el caption en inglés ya iba así de antes',
    /NOT a translation: rewrite it the way it would be said in English/.test(A));

  // ---- 8. si el ingles falla, el español NO se pierde ----
  t('un fallo del inglés no tira el reel entero', /El guion en ingles no salio/.test(A));
  t('la pestaña EN sigue estando, con su aviso', /if\(!has&&tab\.id!=='f'\)return;/.test(A));
  t('y ofrece escribirlo sin volver a generar el español',
    /Escribir el guion en inglés/.test(A) && /El de español está entero/.test(A));

  console.log('\n' + ok + ' OK, ' + ko + ' fallos');
  process.exit(ko ? 1 : 0);
})().catch((e) => { console.error('EXCEPCION: ' + e.stack); process.exit(1); });
