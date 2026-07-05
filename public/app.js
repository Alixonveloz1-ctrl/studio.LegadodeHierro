var THEMES=[
  {id:'libertad',   label:'Libertad Financiera',     icon:'🔓',desc:'Independencia, salida del sistema',c:'#b8975a',p:'#f0e8d8'},
  {id:'mentalidad', label:'Mentalidad & Disciplina',  icon:'🧠',desc:'Psicología del éxito, hábitos',    c:'#9a8ac4',p:'#f0eef8'},
  {id:'sistema',    label:'Sistemas & Automatización',icon:'⚙️',desc:'Procesos que generan sin ti',      c:'#7a9b8a',p:'#eaf2ee'},
  {id:'herramientas',label:'Herramientas del Camino',icon:'🛠️',desc:'Acelera tu camino con lo que ya construí',c:'#c4897a',p:'#f8ede8'},
  {id:'marca',      label:'Marca Personal & Autoridad',icon:'🎯',desc:'Tu nombre, tu presencia, tu dinero',c:'#b87a8a',p:'#f8e8ee'},
  {id:'inversion',  label:'Inversión & Capital',      icon:'📈',desc:'Activos, portafolio, dinero',      c:'#7a9ec4',p:'#e8f0f8'},
  {id:'negocio',    label:'Negocio & Ventas',         icon:'🏗️',desc:'Estructura comercial, escala',     c:'#9ab47a',p:'#eef4e8'},
  {id:'poco',       label:'Negocios con Poco Capital',icon:'💡',desc:'Empieza desde cero, escala rápido', c:'#c4a85a',p:'#f8f0d8'},
  {id:'millonario', label:'Negocios Millonarios',     icon:'🏆',desc:'Construcción de riqueza a largo plazo',c:'#8a7ac4',p:'#eceaf8'},
];
var DURS=[
  {id:'30',label:'30 segundos',sub:'Reel express — máximo impacto'},
  {id:'60',label:'60 segundos',sub:'Reel estándar — óptimo algoritmo'},
  {id:'90',label:'90 segundos',sub:'Reel extendido — enseñanza profunda'},
];
var HOOKS=[
  {id:'dato',      label:'📊 Dato Crudo',         desc:'Cifra que destruye una creencia'},
  {id:'pregunta',  label:'❓ Pregunta Disruptiva', desc:'Pregunta que no pueden ignorar'},
  {id:'afirmacion',label:'🔥 Afirmación Polémica', desc:'Verdad incómoda que divide'},
  {id:'historia',  label:'🎯 Historia Personal',   desc:'Experiencia real que conecta'},
  {id:'pasos',     label:'⚡ Lista de Pasos',      desc:'Instrucciones directas y ejecutables'},
];
var TABS=[
  {id:'a',label:'⚔ Guion ES',c:'#b8975a',p:'#f0e8d8'},
  {id:'f',label:'🇺🇸 Guion EN',c:'#c4897a',p:'#f8ede8'},
];
var SCHED_POOL=[
  {t:'libertad',  concept:'Por qué el empleo nunca te hará libre financieramente',h:'dato'},
  {t:'libertad',  concept:'Lo que nadie te dice sobre renunciar al empleo',h:'afirmacion'},
  {t:'libertad',  concept:'El día que entendí que el tiempo es el único activo real',h:'historia'},
  {t:'libertad',  concept:'Cuánto dinero necesitas exactamente para no depender de nadie',h:'dato'},
  {t:'libertad',  concept:'La trampa del salario fijo que nadie quiere ver',h:'pregunta'},
  {t:'libertad',  concept:'Vivir con lo básico no es pobreza, es estrategia',h:'afirmacion'},
  {t:'libertad',  concept:'El mapa real hacia la independencia financiera en 3 años',h:'pasos'},
  {t:'libertad',  concept:'Por qué tener trabajo estable te mantiene pobre',h:'dato'},
  {t:'mentalidad',concept:'La diferencia entre el que planea y el que ejecuta',h:'pasos'},
  {t:'mentalidad',concept:'Por qué la disciplina vale más que la motivación',h:'dato'},
  {t:'mentalidad',concept:'Lo que separa al que llega del que se queda a mitad',h:'afirmacion'},
  {t:'mentalidad',concept:'El día que dejé de quejarme y empecé a construir',h:'historia'},
  {t:'mentalidad',concept:'Cuántas horas al día le dedicas a crecer versus a distraerte',h:'pregunta'},
  {t:'mentalidad',concept:'El hábito más barato que cambia todo',h:'pasos'},
  {t:'mentalidad',concept:'Por qué el ambiente donde vives decide tu techo económico',h:'afirmacion'},
  {t:'mentalidad',concept:'Lo que pasa en tu cabeza cuando dejas de ser empleado',h:'historia'},
  {t:'sistema',   concept:'Cómo hacer que tu dinero trabaje mientras duermes',h:'pregunta'},
  {t:'sistema',   concept:'El error que comete el 90% al intentar automatizar',h:'dato'},
  {t:'sistema',   concept:'3 pasos para salir del ciclo quincena a quincena',h:'pasos'},
  {t:'sistema',   concept:'Automatiza esto primero si quieres escalar sin quemarte',h:'afirmacion'},
  {t:'sistema',   concept:'Cómo construir un sistema que genere sin que estés presente',h:'pasos'},
  {t:'sistema',   concept:'La diferencia entre trabajar en tu negocio y trabajar para tu negocio',h:'pregunta'},
  {t:'herramientas',concept:'Por qué intentarlo solo te cuesta el doble de años, y cómo acortar ese camino',h:'dato'},
  {t:'herramientas',concept:'¿Cuánto tiempo más vas a tropezar solo cuando el mapa ya existe?',h:'pregunta'},
  {t:'herramientas',concept:'Solo sí se puede, pero el camino sin guía te va a cobrar años de tu vida',h:'afirmacion'},
  {t:'herramientas',concept:'Recorrí este camino sin ayuda y me costó años. Por eso construí lo que a mí me faltó',h:'historia'},
  {t:'herramientas',concept:'Los 3 errores que cometes por avanzar sin un sistema probado',h:'pasos'},
  {t:'herramientas',concept:'Lo que separa al que avanza con herramientas del que sigue dando vueltas solo',h:'dato'},
  {t:'herramientas',concept:'¿Por qué sigues buscando respuestas sueltas si yo ya junté todo el camino para ti?',h:'pregunta'},
  {t:'herramientas',concept:'Si llegaste hasta aquí es porque necesitas el empujón, y yo lo tengo listo para ti',h:'afirmacion'},
  {t:'marca',     concept:'Por qué tu nombre en internet vale más que tu currículum',h:'dato'},
  {t:'marca',     concept:'¿De qué te sirve ser bueno si nadie sabe que existes?',h:'pregunta'},
  {t:'marca',     concept:'Documentar tu proceso vale más que esperar a ser perfecto',h:'afirmacion'},
  {t:'marca',     concept:'Empecé grabando sin publicar nada, y eso construyó la confianza que hoy me genera dinero',h:'historia'},
  {t:'marca',     concept:'Cómo construir autoridad en redes desde cero sin ser famoso',h:'pasos'},
  {t:'marca',     concept:'Tu presencia en línea es un activo que trabaja mientras duermes',h:'afirmacion'},
  {t:'marca',     concept:'Graba todo tu proceso desde el día uno aunque no publiques nada todavía',h:'pasos'},
  {t:'marca',     concept:'El experto no es el que más sabe, es el que más se muestra',h:'dato'},
  {t:'inversion', concept:'El primer activo que debes construir antes de los 35',h:'dato'},
  {t:'inversion', concept:'Reinversión agresiva, la estrategia más incómoda',h:'afirmacion'},
  {t:'inversion', concept:'Cómo empezar a invertir con poco dinero este mes',h:'pasos'},
  {t:'inversion', concept:'Por qué tu dinero parado en el banco te está costando caro',h:'dato'},
  {t:'inversion', concept:'La diferencia entre ahorrar e invertir que nadie explica',h:'pregunta'},
  {t:'negocio',   concept:'Cómo vender sin sentirte vendedor',h:'pregunta'},
  {t:'negocio',   concept:'Tu primer cliente sin gastar un peso en publicidad',h:'pasos'},
  {t:'negocio',   concept:'Por qué tu negocio no crece y no es falta de dinero',h:'dato'},
  {t:'negocio',   concept:'El modelo de negocio más simple que existe y que nadie usa',h:'afirmacion'},
  {t:'negocio',   concept:'Cómo construir una marca personal desde cero en 90 días',h:'pasos'},
  {t:'poco',      concept:'5 negocios que puedes arrancar hoy con menos de 100 dólares',h:'pasos'},
  {t:'poco',      concept:'Por qué no necesitas capital para empezar, necesitas moverte',h:'afirmacion'},
  {t:'poco',      concept:'El negocio que empecé con mi teléfono y sin invertir nada',h:'historia'},
  {t:'poco',      concept:'Cómo validar si tu idea de negocio vende antes de gastar un centavo',h:'pasos'},
  {t:'poco',      concept:'Los negocios de servicios son los más fáciles de arrancar con poco',h:'dato'},
  {t:'poco',      concept:'Lo que le falta a la mayoría no es dinero, es la primera acción',h:'afirmacion'},
  {t:'poco',      concept:'Cómo convertir una habilidad que ya tienes en dinero esta semana',h:'pregunta'},
  {t:'poco',      concept:'El negocio de reventa que genera flujo de caja desde el primer mes',h:'dato'},
  {t:'millonario',concept:'La mentalidad que separa a los que construyen millones de los que no',h:'afirmacion'},
  {t:'millonario',concept:'Cómo piensan los que construyen negocios de 8 cifras',h:'pregunta'},
  {t:'millonario',concept:'El activo que más millonarios han construido en los últimos 10 años',h:'dato'},
  {t:'millonario',concept:'Por qué pensar en grande es la única estrategia real a largo plazo',h:'afirmacion'},
  {t:'millonario',concept:'Los 3 pilares que tienen en común todos los negocios millonarios',h:'pasos'},
  {t:'millonario',concept:'Lo que hace diferente a un negocio de 6 cifras de uno de 7',h:'dato'},
  {t:'millonario',concept:'Cómo escalar un negocio sin destruirte en el intento',h:'pasos'},
  {t:'millonario',concept:'El momento exacto en que un negocio deja de depender de su dueño',h:'historia'},
];

function getRandomSuggestions(){
  var pool=SCHED_POOL.slice();
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;}
  return pool.slice(0,7);
}
var SCHED_CURRENT=getRandomSuggestions();



function buildSP(){
  if(sMode==='impacto')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona. Sin motivación vacía. Sin frases de coach. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés — escribe español natural de hispanohablante nativo.

NÚCLEO (obligatorio): este canal ENSEÑA a lograr libertad financiera de verdad. Incluso en 30 segundos, el reel debe entregar sustancia REAL y concreta: un dato verificable, una cifra, un activo, una táctica puntual que el espectador pueda aplicar — no solo una frase que golpea y se queda en el aire. Crudeza + enseñanza específica, nunca filosofía motivacional vacía.

ESPAÑOL: gramática impecable. Concordancia correcta de número (singular/plural) y de género en cada sustantivo, verbo y adjetivo. Revisa cada frase; una palabra en plural donde va singular arruina el audio.

MODO IMPACTO — 30 segundos, máximo 75 palabras:
Una sola verdad que golpea. El gancho destruye una creencia, nombra la situación exacta del espectador, o divide opiniones. Primera frase es una bala — sin calentamiento.

PROHIBIDO en el gancho: porcentajes genéricos, "sigues esperando", "la mayoría de la gente", frases de coach, calcos del inglés.

EJEMPLOS de nivel de crudeza (no copiar, solo referencia):
- "Tu trabajo te va a reemplazar. Tu jefe ya lo sabe."
- "No tienes un negocio. Tienes un pasatiempo que te cobra."
- "Llevas años construyendo el sueño de otro."

CIERRE estoico. Sin esperanza falsa. Termina con: Legado de Hierro.
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Máximo 75 palabras. Termina con: Legado de Hierro.]

BLOQUE C
[3 prompts. Cada uno describe UNA acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje — solo qué hace y dónde. Entorno diferente en cada prompt.]
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]

BLOQUE F
[Traducción natural al inglés. Sin calcos. Termina con: Iron Legacy.]`;

  if(sMode==='historia')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona. Sin motivación vacía. Sin frases de coach. Sin porcentajes genéricos. Sin calcos del inglés — español natural de hispanohablante nativo.

NÚCLEO (obligatorio): la historia ENSEÑA cómo se logra la libertad financiera con hechos reales. No basta con narrar la lucha y el triunfo: cada historia muestra QUÉ hizo concretamente el personaje para avanzar — la decisión exacta, el primer negocio o activo, el número, el método. El espectador debe terminar sabiendo qué haría él en su lugar. Crudeza + enseñanza específica, nunca solo emoción o motivación vacía.

ESPAÑOL: gramática impecable. Concordancia correcta de número (singular/plural) y de género en cada sustantivo, verbo y adjetivo. Revisa cada frase; una palabra en plural donde va singular arruina el audio.

MODO HISTORIA — arco narrativo de emprendimiento:
(1) Situación difícil inicial sin romantizarla
(2) Punto de quiebre — una decisión, no suerte
(3-4) Primeros pasos reales, acciones concretas
(5) Primera señal de que algo funciona — no el éxito final

GANCHO obligatorio: primera frase destruye una creencia o nombra la situación exacta del espectador. Sin porcentajes. Sin coach. Sin calentamiento.

PROHIBIDO: "el secreto mejor guardado" o "el mejor secreto guardado" — ninguna variante de esa frase. Porcentajes genéricos. Calcos del inglés.

CIERRE sin esperanza falsa. Termina con: Legado de Hierro.
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]

BLOQUE C
[Prompts siguiendo el arco: inicio opresivo → quiebre → acción → avance → resultado. Cada prompt: acción concreta + entorno específico + ángulo + luz. Sin describir al personaje. Entorno diferente en cada prompt.]
PROMPT 1: [punto más bajo — acción + entorno + ángulo + luz]
PROMPT 2: [momento de quiebre — acción + entorno diferente + ángulo + luz]
PROMPT 3: [primer paso — acción + entorno diferente + ángulo + luz]
PROMPT 4: [avanzando — acción + entorno diferente + ángulo + luz]
PROMPT 5: [primer resultado — acción + entorno diferente + ángulo + luz]
PROMPT 6: [acción + entorno diferente + ángulo + luz]
PROMPT 7: [acción + entorno diferente + ángulo + luz]
PROMPT 8: [llegada — acción + entorno de poder + ángulo + luz]

BLOQUE F
[Traducción natural al inglés. Sin calcos. Termina con: Iron Legacy.]`;
  return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona. Sin motivación vacía. Sin frases de coach. Sin porcentajes genéricos ("el 90%", "la mayoría"). Sin calcos del inglés — español natural de hispanohablante nativo.

NÚCLEO (obligatorio): este canal ENSEÑA a lograr libertad financiera de verdad, con datos y proyectos reales, al estilo crudo de Legado de Hierro. Cada reel debe ENSEÑAR algo concreto y accionable, no solo motivar ni nombrar el problema: una estrategia real, una cifra o dato verificable, un activo, un método paso a paso, o un ejemplo de negocio real. El espectador debe terminar el video sabiendo QUÉ HACER, no solo sintiéndose inspirado. Prohibido quedarse en filosofía general, frases motivacionales sin sustancia o generalidades vacías.

ESPAÑOL: gramática impecable. Concordancia correcta de número (singular/plural) y de género en cada sustantivo, verbo y adjetivo. Revisa cada frase; una palabra en plural donde va singular arruina el audio.

GANCHO obligatorio: primera frase destruye una creencia, nombra la situación exacta del espectador, o divide opiniones. Sin porcentajes. Sin coach. Sin calentamiento. Máximo 2 frases.

PROHIBIDO siempre: porcentajes genéricos, "sigues esperando", "la gente piensa", "el mejor secreto guardado" o cualquier variante, calcos del inglés, motivación vacía, frases de coach de Instagram.

INSTRUCCIONES POR PILAR (enseña siempre algo APLICABLE, con un ejemplo, un número o un paso real — nunca solo el concepto):
- LIBERTAD FINANCIERA: un mecanismo concreto para separar tiempo de ingreso (un activo, una fuente de ingreso, un cálculo real), no solo la idea.
- MENTALIDAD Y DISCIPLINA: un hábito o sistema específico y cómo ejecutarlo paso a paso, no motivación.
- SISTEMAS Y AUTOMATIZACIÓN: un proceso concreto que el espectador pueda montar, con el paso clave explicado.
- HERRAMIENTAS DEL CAMINO: primera persona — YO construí lo que me faltó. Enseña el principio detrás. Cierra empujando al enlace del video. Sin precios ni nombres de productos.
- MARCA PERSONAL: una acción concreta de visibilidad y cómo empezarla hoy.
- INVERSIÓN Y CAPITAL: un activo o estrategia concreta con números reales, nunca generalidades.
- NEGOCIO Y VENTAS: una táctica de ventas o una estructura comercial específica que se pueda copiar.
- NEGOCIOS CON POCO CAPITAL: una idea ejecutable hoy y su primer paso real.
- NEGOCIOS MILLONARIOS: un principio de escala o de sistemas con un ejemplo real.

RITMO: comas para conectar, puntos para pausas. Nunca el mismo cierre dos veces. Termina con: Legado de Hierro.
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]

BLOQUE C
[Cada prompt: acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje. Entorno completamente diferente en cada prompt — variar entre interiores, exteriores, objetos, espacios de poder, espacios humildes.]
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]
PROMPT 4: [acción + entorno diferente + ángulo + luz]
PROMPT 5: [acción + entorno diferente + ángulo + luz]
PROMPT 6: [acción + entorno diferente + ángulo + luz]
PROMPT 7: [acción + entorno diferente + ángulo + luz]
PROMPT 8: [acción + entorno diferente + ángulo + luz]

BLOQUE F
[Traducción natural al inglés. Sin calcos. Termina con: Iron Legacy.]`;
}
var SP=buildSP();


// AUTH
function hashPass(p){
  var h=0;for(var i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}
  return 'lh'+Math.abs(h).toString(36);
}
function getUsers(){return JSON.parse(localStorage.getItem('lh_users')||'{}');}
function saveUsers(u){localStorage.setItem('lh_users',JSON.stringify(u));}

function switchTab(t){
  document.getElementById('fl').style.display=t==='login'?'block':'none';
  document.getElementById('fr').style.display=t==='reg'?'block':'none';
  document.getElementById('tl').classList.toggle('on',t==='login');
  document.getElementById('tr').classList.toggle('on',t==='reg');
}

function doLogin(){
  var u=document.getElementById('lu').value.trim();
  var p=document.getElementById('lp').value;
  var e=document.getElementById('le');
  e.style.display='none';
  if(!u||!p){e.textContent='Completa todos los campos';e.style.display='block';return;}
  var users=getUsers();
  if(!users[u]){e.textContent='Usuario no encontrado';e.style.display='block';return;}
  if(users[u].hash!==hashPass(p)){e.textContent='Contrasena incorrecta';e.style.display='block';return;}
  ANT=HARDCODED_ANT;EL=HARDCODED_EL;VOICE=HARDCODED_VOICE;NB=HARDCODED_NB;
  localStorage.setItem('lh_sess',u);
  showApp();
}

function doRegister(){
  var ac=document.getElementById('rac').value.trim();
  var u=document.getElementById('ru').value.trim();
  var p=document.getElementById('rp').value;
  var p2=document.getElementById('rp2').value;
  var e=document.getElementById('re'),ok=document.getElementById('ro');
  e.style.display='none';ok.style.display='none';
  if(!ac||!u||!p||!p2){e.textContent='Completa todos los campos';e.style.display='block';return;}
  if(ac!==ACCESS_CODE){e.textContent='Codigo de acceso incorrecto';e.style.display='block';return;}
  if(u.length<3){e.textContent='Usuario minimo 3 caracteres';e.style.display='block';return;}
  if(p.length<6){e.textContent='Contrasena minimo 6 caracteres';e.style.display='block';return;}
  if(p!==p2){e.textContent='Las contrasenas no coinciden';e.style.display='block';return;}
  var users=getUsers();
  if(users[u]){e.textContent='Ese usuario ya existe';e.style.display='block';return;}
  users[u]={hash:hashPass(p)};
  saveUsers(users);
  ok.textContent='Cuenta creada. Ahora puedes iniciar sesion.';ok.style.display='block';
  setTimeout(function(){switchTab('login');},1500);
}

function logout(){
  localStorage.removeItem('lh_sess');
  ANT='';EL='';NB='';
  document.getElementById('pg-app').classList.remove('on');
  document.getElementById('pg-login').classList.add('on');
}

function showApp(){
  document.getElementById('pg-login').classList.remove('on');
  document.getElementById('pg-app').classList.add('on');
  sessionStorage.setItem('lh_sess',localStorage.getItem('lh_sess')||'');
  showPills();
}

// STATE
var HARDCODED_ANT='';
var HARDCODED_EL='';
var HARDCODED_VOICE='IRHApOXLvnW57QJPQH2P';
var HARDCODED_NB='';
var ACCESS_CODE=(window.__ENV__&&window.__ENV__.ACCESS_CODE)?window.__ENV__.ACCESS_CODE:'LEGADO2025';
var ANT=HARDCODED_ANT,EL=HARDCODED_EL,VOICE=HARDCODED_VOICE,NB=HARDCODED_NB;
var sT='',sD='60',sH='dato',sMode='reel'; // sMode: 'reel' | 'historia'
var loading=false,lastRes=null,activeTab='a';
var genCount=0,cost=0;
var audES=null,audEN=null,imgs=[];
// Modelo y formato elegibles (Gemini / Veo via Vertex AI)
var imgModel='gemini-2.5-flash-image',imgFmt='9:16';
var vidModel='veo-3.1-lite-generate-001',vidFmt='9:16';
// Costo estimado por imagen segun modelo (solo para el contador $ estimado)
var IMG_COST={'gemini-2.5-flash-image':0.039,'gemini-3.1-flash-image':0.067,'gemini-3-pro-image':0.134};
// Costo estimado por clip de 8s segun modelo de video
var VID_COST={'veo-3.1-lite-generate-001':0.30,'veo-3.1-fast-generate-001':0.40,'veo-3.1-generate-001':0.60,'veo-2.0-generate-001':0.40};
function imgCost(){return IMG_COST[imgModel]||0.05;}
function vidCost(){return VID_COST[vidModel]||0.40;}
// Pista de orientacion en el prompt (refuerza el aspectRatio real de imageConfig).
function aspectHint(fmt){
  var m={
    '9:16':'Vertical 9:16 portrait composition, tall image not square. ',
    '4:5':'Vertical 4:5 portrait composition. ',
    '3:4':'Vertical 3:4 portrait composition. ',
    '2:3':'Vertical 2:3 portrait composition. ',
    '1:1':'Square 1:1 composition. ',
    '16:9':'Horizontal 16:9 landscape composition, wide image. ',
    '21:9':'Ultra-wide 21:9 cinematic composition. '
  };
  return m[fmt]||m['9:16'];
}
// Ancla de PERSONAJE + ESTILO por TEXTO: se antepone a TODO prompt de imagen.
// Bloquea el ROSTRO del personaje (para que no se pierda la identidad de la pagina
// aunque una referencia de ibb.co no cargue o el modelo no la pese lo suficiente)
// y el estilo comic 2D cinematografico. El VESTUARIO y el ENTORNO quedan libres
// para que los defina la escena del guion (traje en escenas de poder, camiseta en
// escenas humildes) -- asi el personaje es SIEMPRE el mismo pero las escenas varian.
var CHAR_STYLE_ANCHOR='Recurring signature character: the SAME man in every image, his face IDENTICAL to the reference images -- a 35-year-old man, short black hair slicked back, short well-groomed dark beard, strong jawline, intense dark eyes, serious expression. Keep his face, hair and beard consistent across all images. Wardrobe and setting follow the scene described below (do not force a suit if the scene is humble). Cinematic American 2D comic-book illustration: bold clean ink outlines, dramatic cel-shading, rich cinematic lighting with depth, graphic-novel aesthetic. STRICTLY NOT photorealistic, not a photograph, not a 3D render, not CGI. No text, no letters, no captions, no watermark anywhere in the image. ';
function imgPromptPrefix(fmt){return CHAR_STYLE_ANCHOR+aspectHint(fmt);}
// Conecta los <select> de modelo/formato con el estado global.
function wireGenSettings(){
  var im=document.getElementById('selImgModel');
  var iff=document.getElementById('selImgFmt');
  var vm=document.getElementById('selVidModel');
  var vf=document.getElementById('selVidFmt');
  var pim=document.getElementById('selPostImgModel');
  if(im&&!im.dataset.wired){im.dataset.wired='1';im.value=imgModel;im.addEventListener('change',function(){imgModel=im.value;});}
  if(iff&&!iff.dataset.wired){iff.dataset.wired='1';iff.value=imgFmt;iff.addEventListener('change',function(){imgFmt=iff.value;});}
  if(vm&&!vm.dataset.wired){vm.dataset.wired='1';vm.value=vidModel;vm.addEventListener('change',function(){vidModel=vm.value;});}
  if(vf&&!vf.dataset.wired){vf.dataset.wired='1';vf.value=vidFmt;vf.addEventListener('change',function(){vidFmt=vf.value;});}
  if(pim&&!pim.dataset.wired){pim.dataset.wired='1';pim.value=postImgModel;pim.addEventListener('change',function(){postImgModel=pim.value;});}
}

function showPills(){
  var el=document.getElementById('apipills');
  if(!el)return;
  function mk(lbl){return '<span class="api-pill" style="color:#7a9b8a;background:#eaf2ee">● '+lbl+'</span>';}
  // El stack corre con las llaves en el servidor (variables de entorno de Vercel).
  el.innerHTML=mk('Gemini · texto·imagen·video')+mk('ElevenLabs · audio');
}

function refreshSched(){
  SCHED_CURRENT=getRandomSuggestions();
  document.getElementById('schedGrid').innerHTML='';
  buildSched();
}

function buildSched(){
  var sg=document.getElementById('schedGrid');
  var lbl=document.getElementById('schedLbl');
  if(lbl)lbl.textContent='Sugerencias de Reels · '+SCHED_CURRENT.length+' ideas';
  SCHED_CURRENT.forEach(function(item){
    var th=THEMES.find(function(t){return t.id===item.t;});
    var hk=HOOKS.find(function(h){return h.id===item.h;});
    var el=document.createElement('div');el.className='sitem';
    el.style.cssText='background:#fff;border:1.5px solid var(--border);border-radius:10px;padding:11px 13px;cursor:pointer;transition:border-color .15s';
    el.innerHTML='<div class="sitop" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">'
      +'<span style="font-size:13px">'+(th?th.icon:'')+'</span>'
      +'<span style="font-size:9px;font-weight:700;letter-spacing:.08em;color:'+(th?th.c:'#b8975a')+';text-transform:uppercase">'+(hk?hk.label.replace(/^[^ ]+ /,''):'')+' · '+(th?th.label:'')+'</span>'
      +'</div>'
      +'<div style="font-size:12px;font-weight:600;color:var(--tx1);line-height:1.4;margin-bottom:6px">'+item.concept+'</div>'
      +'<div style="font-size:10px;color:'+(th?th.c:'#b8975a')+';font-weight:600">→ Usar este tema</div>';
    el.addEventListener('mouseenter',function(){el.style.borderColor=(th?th.c+'88':'#b8975a88');});
    el.addEventListener('mouseleave',function(){el.style.borderColor='var(--border)';});
    el.addEventListener('click',function(){
      sT=item.t;sH=item.h;
      document.getElementById('conc').value=item.concept;
      updCC();rfAll();
      document.getElementById('schedPanel').classList.remove('on');
      document.getElementById('sa').textContent='▼';
      window.scrollTo({top:0,behavior:'smooth'});
    });
    sg.appendChild(el);
  });
}

function buildAll(){
  buildSched();
  setTimeout(updImgLabel,100);
  // Selector de modo: Reel o Historia
  var modeWrap=document.getElementById('modeSelector');
  if(modeWrap){
    modeWrap.innerHTML='';
    [{id:'reel',label:'🎬 Modo Reel',sub:'Consejo directo'},{id:'historia',label:'📖 Modo Historia',sub:'Narrativa de emprendimiento'},{id:'impacto',label:'⚡ Modo Impacto',sub:'Golpe de 30 segundos'}].forEach(function(m){
      var b=document.createElement('button');b.className='oc'+(sMode===m.id?' sel':'');b.dataset.id=m.id;
      b.innerHTML='<span class="om">'+m.label+'</span><span class="os">'+m.sub+'</span>';
      b.style.borderColor=sMode===m.id?'#b8975a':'';
      b.style.background=sMode===m.id?'#f0e8d8':'';
      b.querySelector('.om').style.color=sMode===m.id?'#b8975a':'';
      b.addEventListener('click',function(){
        sMode=m.id;SP=buildSP();updImgLabel();
        modeWrap.querySelectorAll('.oc').forEach(function(x){
          var s=x.dataset.id===sMode;
          x.classList.toggle('sel',s);x.style.borderColor=s?'#b8975a':'';
          x.style.background=s?'#f0e8d8':'';x.querySelector('.om').style.color=s?'#b8975a':'';
        });
      });
      modeWrap.appendChild(b);
    });
  }

  var tg=document.getElementById('themeGrid');
  THEMES.forEach(function(t){
    var b=document.createElement('button');b.className='tc';b.dataset.id=t.id;
    b.innerHTML='<div class="ticon">'+t.icon+'</div><div class="tname">'+t.label+'</div><div class="tdesc">'+t.desc+'</div>';
    b.addEventListener('click',function(){sT=t.id;rfAll();});
    tg.appendChild(b);
  });
  var dg=document.getElementById('durGrid');
  DURS.forEach(function(d){
    var b=document.createElement('button');b.className='oc';b.dataset.id=d.id;
    b.innerHTML='<span class="om">'+d.label+'</span><span class="os">'+d.sub+'</span>';
    b.addEventListener('click',function(){sD=d.id;rfAll();updImgLabel();});
    dg.appendChild(b);
  });
  var hg=document.getElementById('hookGrid');
  HOOKS.forEach(function(h){
    var b=document.createElement('button');b.className='oc';b.dataset.id=h.id;
    b.innerHTML='<span class="om">'+h.label+'</span><span class="os">'+h.desc+'</span>';
    b.addEventListener('click',function(){sH=h.id;rfAll();});
    hg.appendChild(b);
  });
}

function rfAll(){
  var th=THEMES.find(function(t){return t.id===sT;})||{c:'#b8975a',p:'#f0e8d8'};
  document.querySelectorAll('.tc').forEach(function(b){
    var t=THEMES.find(function(t){return t.id===b.dataset.id;}),s=sT===t.id;
    b.classList.toggle('sel',s);b.style.borderColor=s?t.c:'';b.style.background=s?t.p:'';b.querySelector('.tname').style.color=s?t.c:'';
  });
  document.querySelectorAll('#durGrid .oc').forEach(function(b){
    var s=sD===b.dataset.id;b.classList.toggle('sel',s);b.style.borderColor=s?th.c:'';b.style.background=s?th.p:'';b.querySelector('.om').style.color=s?th.c:'';
  });
  document.querySelectorAll('#hookGrid .oc').forEach(function(b){
    var s=sH===b.dataset.id;b.classList.toggle('sel',s);b.style.borderColor=s?th.c:'';b.style.background=s?th.p:'';b.querySelector('.om').style.color=s?th.c:'';
  });
  document.getElementById('conc').style.borderColor=th.c;
  updGBtn();
}

function updCC(){document.getElementById('cc').textContent=document.getElementById('conc').value.length;}
function updImgLabel(){
  var el=document.getElementById('imgCountLabel');if(!el)return;
  var n=sMode==='impacto'?3:sD==='90'?8:sD==='30'?3:5;
  el.textContent=n+' imágenes · Personaje en acción acorde al guion';
}

function updGBtn(){
  var b=document.getElementById('gbtn'),has=document.getElementById('conc').value.trim().length>0;
  b.disabled=loading||!has;b.classList.toggle('on',!loading&&has);
}
function updCost(){document.getElementById('gcost').textContent='$'+cost.toFixed(3)+' estimado · '+genCount+' generaciones';}

// GENERATE
async function generate(){
  var topic=document.getElementById('conc').value.trim();
  if(!topic||loading)return;
  loading=true;updGBtn();hideErr();
  document.getElementById('ow').style.display='none';
  document.getElementById('gbtn').innerHTML='<span class="spin"></span> Forjando...';
  document.getElementById('gnote').style.display='inline';
  document.getElementById('gnote').textContent=sMode==='impacto'?'Generando golpe de impacto 30s...':sMode==='historia'?'Generando narrativa Trabajador→Alpha...':'Generando guiones ES + EN y prompts...';
  var tO=THEMES.find(function(t){return t.id===sT;});
  var hO=HOOKS.find(function(h){return h.id===sH;});
  var dO=DURS.find(function(d){return d.id===sD;});
  var hi={dato:'Empieza con dato/cifra impactante.',pregunta:'Empieza con pregunta disruptiva.',afirmacion:'Empieza con verdad incomoda directa.',historia:'Empieza en primera persona con experiencia cruda.',pasos:'Desarrolla con Primero, Segundo, Tercero.'};
  var identidadBase='PERSONAJE FIJO — el MISMO hombre en TODAS las imagenes, rostro identico a las imagenes de referencia: hombre de 35 anos, cabello negro corto peinado hacia atras, barba corta oscura bien cuidada, mandibula marcada, ojos oscuros intensos, mirada seria. Su ROSTRO, cabello y barba son identicos en cada imagen; es el personaje principal de la marca y no puede cambiar. El vestuario y el entorno SI cambian segun la escena (traje oscuro de tres piezas en escenas de poder; camiseta simple en escenas humildes). ESTILO OBLIGATORIO: ilustracion estilo comic americano 2D cinematografico, lineas de tinta limpias y marcadas, cel-shading dramatico, iluminacion cinematografica con profundidad, estetica de novela grafica, sin texto en la imagen. NUNCA fotorrealista, NUNCA una foto, NUNCA render 3D ni CGI. PROHIBIDO EN TODA IMAGEN: lluvia, cualquier clima (nieve, tormenta, gotas de agua), cielos lluviosos, superficies mojadas, charcos -- NUNCA, ni dentro ni fuera del edificio; el clima es fuente de errores graves al animar. Tampoco robots, futurismo, sci-fi, cadenas rotas, magia ni fantasia. Solo el mundo real de negocios y finanzas; para dramatismo usa luces de ciudad, contraste y sombras, jamas clima. ESCENAS LIMPIAS: incluye solo los objetos que la accion necesita; evita objetos sueltos irrelevantes (tazas de cafe, vasos, adornos) que no formen parte de la accion, porque al animar se deforman o se transforman en otra cosa. MIRADA (obligatorio): el personaje mira lo que exige la accion (el documento, la pantalla, la ciudad, el trato), NO a la camara y sin pose de modelo, salvo que el prompt diga explicitamente que habla directo a camara. ';
  var sceneDir;
  if(sMode==='historia'){
    sceneDir='DIRECCION VISUAL — MODO HISTORIA: los prompts forman UNA sola historia continua que avanza escena por escena, como paneles de comic de la MISMA narrativa. Cada prompt es el siguiente momento del arco de ESTE guion: realidad dificil inicial donde el espectador se reconoce, luego el punto de quiebre por una decision, luego primeros pasos concretos, luego traccion, luego el primer resultado. El entorno y el vestuario EVOLUCIONAN con la historia, de humilde a poder. Deriva cada escena del CONTENIDO del guion; NO uses una lista fija de escenas. Escenas distintas pero coherentes entre si, cada una se siente continuacion de la anterior. ';
  }else if(sMode==='impacto'){
    sceneDir='DIRECCION VISUAL — MODO IMPACTO: 3 imagenes de alto impacto, cada una ilustra un golpe distinto del mensaje de ESTE guion. Entornos completamente diferentes entre si, potentes y cinematograficos. Deriva las escenas del guion; NO uses una lista fija de escenas. ';
  }else{
    sceneDir='DIRECCION VISUAL — MODO REEL: el personaje YA LLEGO a la cima; muestralo desde la grandeza, no desde la lucha. Su dia a dia de hombre exitoso en entornos VARIADOS (nunca repitas siempre la misma oficina): bajando de un auto de lujo, revisando planes en su casa moderna, cerrando un trato en una reunion, caminando la ciudad de noche, en una azotea al atardecer, viajando, en un restaurante exclusivo, firmando documentos, en el gimnasio con disciplina. Enfoque en el PERSONAJE en su elemento, poder tranquilo, cine. Cada prompt en un entorno DISTINTO. Deriva las escenas del tema del guion; NO uses una lista fija de escenas. ';
  }
  var identidad=identidadBase+sceneDir;
  var numPrompts=(sMode==='impacto'||sD==='30')?3:sD==='90'?8:5;
  var maxPalabras=(sMode==='impacto'||sD==='30')?75:sD==='90'?225:150;
  var msg=SP+'\n\n---\n\nGenera un episodio COMPLETO:\nPILAR: '+(tO?tO.label+' - '+tO.desc:'Independencia Financiera')+'\nDURACION: '+(dO?dO.label:'60 segundos')+'\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' - '+(hi[sH]||hi.dato)+'\nCONCEPTO: '+topic+'\n\n'+identidad+'\n\nREGLA DE LONGITUD OBLIGATORIA: el BLOQUE A debe tener EXACTAMENTE entre '+maxPalabras+' y '+(maxPalabras+10)+' palabras. Ni una más, ni una menos. Cuenta las palabras antes de terminar.\n\nINSTRUCCION CRITICA DE FORMATO — OBLIGATORIO:\nDebes generar los 3 bloques completos en este orden exacto:\n1. BLOQUE A — texto hablado en español ('+maxPalabras+' a '+(maxPalabras+10)+' palabras)\n2. BLOQUE C — exactamente '+numPrompts+' prompts de imagen, numerados PROMPT 1 hasta PROMPT '+numPrompts+'\n3. BLOQUE F — texto hablado en inglés\nSi no generas el BLOQUE C con los '+numPrompts+' prompts, la respuesta es incompleta y falla el sistema. NO omitas el BLOQUE C bajo ninguna circunstancia.\n\nRecuerda: BLOQUE A es solo texto hablado sin prompts. BLOQUE C son exactamente los '+numPrompts+' prompts de imagen. BLOQUE F es el guion en ingles sin prompts.';
  try{
    var r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:msg}),
    });
    var d=await r.json();
    if(!r.ok){
      var m=d&&d.error?d.error:'Error '+r.status;
      throw new Error(m);
    }
    var txt=d.text;
    if(!txt)throw new Error('Sin respuesta de texto.');
    var p=parseBlocks(txt);
    if(!p.a||p.a.length<20)throw new Error('No se pudo leer el guion ES. Intenta de nuevo.');
    lastRes=Object.assign({},p,{raw:txt,topic:topic,tO:tO,dO:dO,hO:hO,modo:sMode});
    genCount++;cost+=0.015;updCost();
    audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];
    renderOut(lastRes);
  }catch(e){
    showErr(e.message||'Error de conexion.');
  }finally{
    loading=false;
    document.getElementById('gbtn').innerHTML='⚔ Forjar Reel';
    document.getElementById('gnote').style.display='none';
    updGBtn();
  }
}

// PARSE
function cleanG(t){
  if(!t)return'';
  var lines=t.split('\n');
  var result=[];
  var blankCount=0;
  for(var i=0;i<lines.length;i++){
    var line=lines[i];
    line=line.replace(/\[\d\d:\d\d[^\]]*\]/g,'');
    line=line.replace(/^#{1,6}\s+/,'');
    line=line.replace(/\*\*/g,'');
    line=line.replace(/\*/g,'');
    var trimmed=line.trim();
    if(trimmed.length>0&&trimmed.charAt(0)==='['&&trimmed.charAt(trimmed.length-1)===']'){continue;}
    var upper=trimmed.toUpperCase();
    if(upper.indexOf('GANCHO')===0||upper.indexOf('DESARROLLO')===0||upper.indexOf('CUERPO')===0||upper.indexOf('CIERRE')===0||upper.indexOf('INTRO')===0){
      var colonIdx=trimmed.indexOf(':');
      if(colonIdx>-1&&colonIdx<20){continue;}
    }
    if(upper.indexOf('BLOQUE ')===0){continue;}
    if(/^PROMPT\s*\d+/i.test(trimmed)){continue;}
    if(trimmed.charAt(0)==='#'){continue;}
    if(trimmed===''){
      blankCount++;
      if(blankCount<=1)result.push('');
    }else{
      blankCount=0;
      result.push(line.replace(/^#{1,6}\s+/,'').replace(/\*\*/g,'').replace(/\*/g,''));
    }
  }
  while(result.length>0&&result[0]==='')result.shift();
  while(result.length>0&&result[result.length-1]==='')result.pop();
  return result.join('\n');
}

function parseBlocks(raw){
  var lines=raw.split('\n');
  var cleanLines=[];
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    l=l.replace(/\*\*/g,'');
    l=l.replace(/^#{1,6}\s+/,'');
    cleanLines.push(l);
  }
  var posA=-1,posC=-1,posF=-1;
  for(var i=0;i<cleanLines.length;i++){
    var upper=cleanLines[i].trim().toUpperCase().replace(/[*#_`:]/g,'').trim();
    if(posA===-1&&upper.indexOf('BLOQUE A')===0){posA=i;}
    else if(posC===-1&&upper.indexOf('BLOQUE C')===0){posC=i;}
    else if(posF===-1&&upper.indexOf('BLOQUE F')===0){posF=i;}
  }
  function extract(start,others){
    if(start===-1)return'';
    var end=cleanLines.length;
    for(var oi=0;oi<others.length;oi++){
      if(others[oi]>start&&others[oi]<end)end=others[oi];
    }
    return cleanLines.slice(start+1,end).join('\n').trim();
  }
  var aRaw=extract(posA,[posC,posF]);
  var cRaw=extract(posC,[posA,posF]);
  var fRaw=extract(posF,[posA,posC]);
  if(!aRaw&&!fRaw){
    var firstPromptLine=-1;
    for(var i=0;i<cleanLines.length;i++){
      if(/^PROMPT\s*\d+/i.test(cleanLines[i].trim())){firstPromptLine=i;break;}
    }
    if(firstPromptLine>0){aRaw=cleanLines.slice(0,firstPromptLine).join('\n').trim();}
    var lastPromptLine=-1;
    for(var i=cleanLines.length-1;i>=0;i--){
      if(/^PROMPT\s*\d+/i.test(cleanLines[i].trim())){lastPromptLine=i;break;}
    }
    if(lastPromptLine>-1&&lastPromptLine<cleanLines.length-5){
      fRaw=cleanLines.slice(lastPromptLine+1).join('\n').trim();
    }
    if(firstPromptLine>-1&&lastPromptLine>-1){
      cRaw=cleanLines.slice(firstPromptLine,lastPromptLine+1).join('\n').trim();
    }
  }
  var prompts=[];
  if(cRaw){
    var cLines=cRaw.split('\n');
    var currentPrompt='';
    for(var ci=0;ci<cLines.length;ci++){
      var lt=cLines[ci].trim().replace(/\*+/g,'');
      if(/^PROMPT\s*\d+\s*[:\-.]/i.test(lt)){
        if(currentPrompt.length>20)prompts.push(currentPrompt);
        currentPrompt=lt.replace(/^PROMPT\s*\d+\s*[:\-.]\s*/i,'').trim();
      }else if(lt&&currentPrompt){
        currentPrompt=currentPrompt+' '+lt;
      }
    }
    if(currentPrompt.length>20)prompts.push(currentPrompt);
  }
  return{a:cleanG(aRaw),f:cleanG(fRaw),c:prompts,cRaw:cRaw};
}

// RENDER
function renderOut(r){
  var col=(r.tO&&r.tO.c)?r.tO.c:'#b8975a';
  document.getElementById('otag').style.color=col;
  document.getElementById('otag').textContent='✓ '+(r.dO?r.dO.label:'')+' · '+(r.tO?r.tO.label:'')+' · '+(r.hO?r.hO.label:'');
  document.getElementById('oconcept').textContent='"'+(r.topic.length>70?r.topic.slice(0,70)+'...':r.topic)+'"';
  var tr=document.getElementById('tabrow');tr.innerHTML='';activeTab='a';
  TABS.forEach(function(tab){
    var has={a:r.a,f:r.f}[tab.id];if(!has)return;
    var btn=document.createElement('button');btn.className='tabbtn'+(tab.id==='a'?' on':'');
    btn.textContent=tab.label;
    if(tab.id==='a'){btn.style.borderColor=tab.c;btn.style.color=tab.c;btn.style.background=tab.p;}
    btn.addEventListener('click',function(){activeTab=tab.id;rfTabs(r);});
    tr.appendChild(btn);
  });
  rfTabs(r);
  document.getElementById('capCard').style.display='block';
  document.getElementById('audioCard').style.display='block';
  document.getElementById('imgCard').style.display='block';
  wireGenSettings();
  genCaption();
  // Botón generar todos los videos
  var ballvids=document.getElementById('ballvids');
  if(!ballvids){
    ballvids=document.createElement('button');
    ballvids.id='ballvids';
    ballvids.textContent='🎬 Generar todos los videos';
    ballvids.style.cssText='width:100%;margin-top:10px;padding:13px;background:#fff;border:2px solid #7a9ec4;border-radius:10px;font-size:13px;font-weight:700;color:#7a9ec4;cursor:pointer;font-family:inherit;display:none';
    ballvids.addEventListener('click',genAllVideos);
    document.getElementById('imgCard').appendChild(ballvids);
  }
  ballvids.style.display='none';
  document.getElementById('rES').style.display='none';
  document.getElementById('rEN').style.display='none';
  document.getElementById('ast').style.display='none';
  document.getElementById('ae').style.display='none';
  document.getElementById('igrid').innerHTML='';
  document.getElementById('ist').style.display='none';
  document.getElementById('ie').style.display='none';
  document.getElementById('expbtn').style.display='none';
  document.getElementById('ow').style.display='block';
  setTimeout(function(){document.getElementById('ow').scrollIntoView({behavior:'smooth',block:'start'});},150);
}

function rfTabs(r){
  document.querySelectorAll('.tabbtn').forEach(function(btn){
    var tab=TABS.find(function(t){return t.label===btn.textContent;});if(!tab)return;
    var s=tab.id===activeTab;btn.classList.toggle('on',s);
    btn.style.borderColor=s?tab.c:'';btn.style.color=s?tab.c:'';btn.style.background=s?tab.p:'';
  });
  var ct=document.getElementById('tabcontent');ct.innerHTML='';
  var tm=TABS.find(function(t){return t.id===activeTab;});
  var text={a:r.a,f:r.f}[activeTab]||'';
  if(!text)return;
  var lbls={a:'⚔ Guion en Español',f:'🇺🇸 Script in English'};
  var blk=document.createElement('div');blk.className='blk';blk.style.borderColor=(tm?tm.c+'44':'');
  var hdr=document.createElement('div');hdr.className='bhdr';hdr.style.background=tm?tm.p:'';
  hdr.innerHTML='<span class="bttl" style="color:'+(tm?tm.c:'')+'">'+lbls[activeTab]+'</span>';
  hdr.appendChild(mkCp(text));blk.appendChild(hdr);
  var body=document.createElement('div');body.className='bbody';
  text.split('\n').forEach(function(line){
    var t=line.trim(),div=document.createElement('div');
    if(!t){div.style.marginBottom='10px';div.innerHTML='&nbsp;';}
    else if(t==='Legado de Hierro.'||t==='Iron Legacy.'){div.className='bsig';div.style.color=tm?tm.c:'';div.textContent=t;}
    else if(/^(Primero|Segundo|Tercero|First|Second|Third)\./i.test(t)){div.className='bprim';div.textContent=line;}
    else{div.textContent=line;}
    body.appendChild(div);
  });
  blk.appendChild(body);ct.appendChild(blk);
}

// CAPTION + HASHTAGS (Facebook) — llamada SEPARADA a Gemini, no toca el guion.
var lastCaption='',lastTags='';

async function genCaption(){
  if(!lastRes||!lastRes.a){return;}
  var st=document.getElementById('capSt');
  var er=document.getElementById('capErr');
  var box=document.getElementById('capBox');
  var rb=document.getElementById('bcap');
  if(!st)return;
  st.style.display='block';st.textContent='Generando caption y hashtags...';
  er.style.display='none';box.style.display='none';
  if(rb){rb.disabled=true;rb.style.opacity='.6';}
  var tema=lastRes.topic||(lastRes.tO?lastRes.tO.label:'');
  var pilar=lastRes.tO?lastRes.tO.label:'';
  var prompt='Eres el community manager de LEGADO DE HIERRO, un canal en espanol para hombres hispanos sobre libertad financiera, disciplina, mentalidad y emprendimiento. Voz cruda, directa, sin motivacion vacia, sin frases de coach, sin calcos del ingles.\n\n'
    +'A partir de este reel, escribe el texto para publicarlo en Facebook.\n\n'
    +'PILAR: '+pilar+'\nTEMA: '+tema+'\nGUION:\n'+lastRes.a+'\n\n'
    +'Devuelve EXACTAMENTE este formato en texto plano, sin markdown, sin ** ni ##:\n\n'
    +'CAPTION:\n[1 a 3 frases cortas y potentes que enganchen, en la voz de la marca, en espanol neutro. Puedes cerrar invitando a seguir el canal o a comentar. NO pongas hashtags aqui. Maximo 1 emoji, o ninguno.]\n\n'
    +'HASHTAGS:\n[Entre 14 y 20 hashtags en UNA sola linea separados por espacios. El PRIMERO debe ser SIEMPRE #LegadoDeHierro. Los demas relevantes al tema del reel y al nicho (finanzas, disciplina, mentalidad, dinero, libertad financiera, emprendimiento, exito, negocios, inversion). Mezcla espanol y algunos universales. Sin repetir, sin numerar. Solo los hashtags, nada mas.]';
  try{
    var r=await fetch('/api/generate',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt}),
    });
    var d=await r.json();
    if(!r.ok||!d.text)throw new Error(d.error||'No se pudo generar');
    var parsed=parseCaption(d.text);
    lastCaption=parsed.caption;lastTags=parsed.tags;
    document.getElementById('capText').textContent=lastCaption;
    document.getElementById('capTags').textContent=lastTags;
    box.style.display='block';st.style.display='none';
  }catch(e){
    er.textContent='Error: '+e.message;er.style.display='block';st.style.display='none';
  }finally{
    if(rb){rb.disabled=false;rb.style.opacity='1';}
  }
}

// Separa CAPTION / HASHTAGS y garantiza #LegadoDeHierro como primer hashtag.
function parseCaption(txt){
  var caption='',tags='';
  var t=(txt||'').replace(/\r/g,'').replace(/\*/g,'').replace(/#{2,}/g,'');
  var mC=t.match(/CAPTION\s*:\s*([\s\S]*?)(?:HASHTAGS\s*:|$)/i);
  var mH=t.match(/HASHTAGS\s*:\s*([\s\S]*)$/i);
  if(mC)caption=mC[1].trim();
  if(mH)tags=mH[1].trim();
  if(!caption&&!tags)caption=t.trim();
  tags=tags.replace(/\n+/g,' ').replace(/\s{2,}/g,' ').trim();
  if(tags){
    var lower=tags.toLowerCase();
    if(lower.indexOf('#legadodehierro')===-1){
      tags='#LegadoDeHierro '+tags;
    }else if(lower.indexOf('#legadodehierro')>0){
      tags=tags.replace(/#legadodehierro/ig,'').replace(/\s{2,}/g,' ').trim();
      tags='#LegadoDeHierro '+tags;
    }
  }else{
    tags='#LegadoDeHierro';
  }
  return {caption:caption,tags:tags};
}

// AUDIO
async function genAudio(lang){
  var isEN=lang==='en';
  var text=isEN?(lastRes&&lastRes.f):(lastRes&&lastRes.a);
  if(!text||text.length<10){
    alert(isEN?'Guion EN no disponible. Genera el episodio primero.':'Genera un episodio primero.');
    return;
  }
  var btn=document.getElementById(isEN?'baen':'baes');
  var st=document.getElementById('ast');
  var er=document.getElementById('ae');
  var orig=btn.textContent;
  btn.textContent='...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';st.textContent=isEN?'Generando audio en ingles...':'Generando audio en espanol...';
  er.style.display='none';
  try{
    var r=await fetch('/api/audio',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({text:text}),
    });
    if(!r.ok){var e=await r.json().catch(function(){return{};});throw new Error(e.error||'Error '+r.status);}
    var data=await r.json();
    var partsB64=data.parts||[];
    var alignments=data.alignments||[];
    if(!partsB64.length)throw new Error('Sin audio recibido.');
    // Decodifica cada parte b64 a bytes
    function b64ToBytes(b64){
      var chars=atob(b64);var bytes=new Uint8Array(chars.length);
      for(var i=0;i<chars.length;i++)bytes[i]=chars.charCodeAt(i);
      return bytes;
    }
    var blob,url,combinedAlignment;
    if(partsB64.length===1){
      // Una sola parte: MP3 directo, sin union
      var bytes=b64ToBytes(partsB64[0]);
      blob=new Blob([bytes],{type:'audio/mpeg'});
      url=URL.createObjectURL(blob);
      combinedAlignment=alignments[0]||null;
    }else{
      // Dos partes: decodificar como audio real y unir en un WAV valido
      var AC=window.AudioContext||window.webkitAudioContext;
      var ctx=new AC();
      var bufs=[];
      for(var pi=0;pi<partsB64.length;pi++){
        var ab=b64ToBytes(partsB64[pi]).buffer;
        var decoded=await ctx.decodeAudioData(ab);
        bufs.push(decoded);
      }
      // Concatena los AudioBuffers
      var totalLen=0,nCh=bufs[0].numberOfChannels,sr=bufs[0].sampleRate;
      for(var bi=0;bi<bufs.length;bi++)totalLen+=bufs[bi].length;
      var out=ctx.createBuffer(nCh,totalLen,sr);
      for(var c=0;c<nCh;c++){
        var od=out.getChannelData(c);var off=0;
        for(var bi=0;bi<bufs.length;bi++){
          od.set(bufs[bi].getChannelData(c%bufs[bi].numberOfChannels),off);
          off+=bufs[bi].length;
        }
      }
      blob=audioBufferToWav(out);
      url=URL.createObjectURL(blob);
      // Combina alignments: cada parte suma el offset acumulado de las duraciones reales anteriores
      var durations=bufs.map(function(b){return b.duration;});
      combinedAlignment=combineAlignments(alignments,durations);
    }
    if(isEN){audEN={blob:blob,url:url,alignment:combinedAlignment};}
    else{audES={blob:blob,url:url,alignment:combinedAlignment};}
    document.getElementById(isEN?'pEN':'pES').src=url;
    document.getElementById(isEN?'dEN':'dES').href=url;
    document.getElementById(isEN?'rEN':'rES').style.display='block';
    st.textContent=isEN?'Audio EN listo.':'Audio ES listo.';
    cost+=0.05;updCost();chkExport();
  }catch(e){
    er.textContent='Error: '+e.message;er.style.display='block';st.style.display='none';
  }finally{
    btn.textContent=orig;btn.style.opacity='1';btn.disabled=false;
  }
}

// Convierte un AudioBuffer a un Blob WAV valido
function audioBufferToWav(buffer){
  var nCh=buffer.numberOfChannels,len=buffer.length*nCh*2,sr=buffer.sampleRate;
  var ab=new ArrayBuffer(44+len);var view=new DataView(ab);
  function ws(o,s){for(var i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));}
  ws(0,'RIFF');view.setUint32(4,36+len,true);ws(8,'WAVE');ws(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,nCh,true);
  view.setUint32(24,sr,true);view.setUint32(28,sr*nCh*2,true);
  view.setUint16(32,nCh*2,true);view.setUint16(34,16,true);ws(36,'data');
  view.setUint32(40,len,true);
  var off=44;
  for(var i=0;i<buffer.length;i++){
    for(var c=0;c<nCh;c++){
      var s=Math.max(-1,Math.min(1,buffer.getChannelData(c)[i]));
      view.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;
    }
  }
  return new Blob([view],{type:'audio/wav'});
}

// Combina dos alignments de ElevenLabs sumando el offset real a la segunda parte
// Combina N alignments de ElevenLabs, sumando a cada parte el offset acumulado
// de duracion real de todas las partes anteriores (durations[] = duracion en seg de cada AudioBuffer)
function combineAlignments(alignments,durations){
  var allChars=[],allStarts=[],allEnds=[];
  var offset=0;
  for(var i=0;i<alignments.length;i++){
    var a=alignments[i];
    if(a&&a.characters){
      if(allChars.length)allChars.push(' '); // separador entre bloques, solo si ya hay contenido previo
      var starts=a.character_start_times_seconds||[];
      var ends=a.character_end_times_seconds||[];
      for(var ci=0;ci<a.characters.length;ci++){
        allChars.push(a.characters[ci]);
        allStarts.push((starts[ci]||0)+offset);
        allEnds.push((ends[ci]||0)+offset);
      }
    }
    offset+=durations[i]||0;
  }
  if(!allChars.length)return null;
  return {characters:allChars,character_start_times_seconds:allStarts,character_end_times_seconds:allEnds};
}

// IMAGES
var imgRefs=[];

var loadedRefsCount=0; // cuantas de las 4 referencias del personaje cargaron en el ultimo intento

async function fetchRefOnce(url){
  var rr=await fetch(url);
  if(!rr.ok)throw new Error('HTTP '+rr.status);
  var rb=await rr.blob();
  return await new Promise(function(res,rej){
    var rd=new FileReader();
    rd.onloadend=function(){res(rd.result.split(',')[1]);};
    rd.onerror=function(){rej(new Error('FileReader error'));};
    rd.readAsDataURL(rb);
  });
}

async function loadRefs(){
  // 4 referencias FIJAS del personaje -- siempre las mismas, para maxima consistencia de rostro/cuerpo.
  // Se reintenta 1 vez cada una: una referencia que falla en silencio deja a esa imagen
  // sin ancla visual y el modelo cae a fotorrealismo por defecto (en vez de 2D comic).
  var REFS=[
    'https://i.ibb.co/RGgryDhy/Cu-nto-tiempo-m-s-vas-a-imagen-5.png',
    'https://i.ibb.co/fzZF6dsK/Prefiero-intentarlo-mil-v-imagen-7.png',
    'https://i.ibb.co/chTyj7RC/La-diferencia-entre-traba-imagen-2.png',
    'https://i.ibb.co/mFtmDw1N/Recorr-este-camino-solo-imagen-4.png'
  ];
  var refs=[];
  for(var ri=0;ri<REFS.length;ri++){
    var ok=false;
    for(var attempt=0;attempt<2&&!ok;attempt++){
      try{
        var rb64=await fetchRefOnce(REFS[ri]);
        refs.push(rb64);ok=true;
      }catch(e){
        console.warn('Ref '+ri+' intento '+(attempt+1)+' fallo:',e.message);
        if(attempt===0)await new Promise(function(r){setTimeout(r,700);});
      }
    }
  }
  loadedRefsCount=refs.length;
  return refs;
}

async function genOneImage(prompt,refs){
  var ir;
  try{
    ir=await fetch('/api/image',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt,refImages:refs,model:imgModel,aspectRatio:imgFmt}),
    });
  }catch(e){
    throw new Error('Error de conexion. Usa Regenerar.');
  }
  if(ir.status===504){
    throw new Error('Tiempo agotado. Usa Regenerar en unos segundos.');
  }
  var id;
  try{
    id=await ir.json();
  }catch(e){
    throw new Error('Error '+ir.status+'. Usa Regenerar en unos segundos.');
  }
  if(!ir.ok)throw new Error(id.error||'Error '+ir.status);
  if(!id.image)throw new Error('Sin imagen generada');
  return 'data:image/png;base64,'+id.image;
}

function setSlotLoading(slot,idx){
  slot.style.cssText='border-radius:10px;background:var(--warm);border:1px dashed var(--border);min-height:130px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px';
  slot.innerHTML='<span class="spin" style="width:16px;height:16px;border-color:rgba(184,151,90,.3);border-top-color:#b8975a"></span><span style="font-size:10px;color:var(--tx3)">Imagen '+(idx+1)+'...</span>';
}

function setSlotOk(slot,src,idx){
  slot.style.cssText='position:relative;border-radius:10px;overflow:visible;box-shadow:0 3px 12px rgba(74,74,90,0.15)';
  slot.innerHTML='';
  var imWrap=document.createElement('div');imWrap.style.cssText='position:relative;border-radius:10px;overflow:hidden';
  var im=document.createElement('img');im.src=src;im.style.cssText='width:100%;display:block;border-radius:10px';imWrap.appendChild(im);
  var dd=document.createElement('div');dd.style.cssText='position:absolute;bottom:6px;right:6px';
  var da=document.createElement('a');da.href=src;da.download='legado-img-'+(idx+1)+'.png';da.textContent='⬇';da.style.cssText='background:rgba(255,255,255,.93);border-radius:6px;padding:4px 9px;font-size:10px;font-weight:600;color:#2a2a3a;text-decoration:none;display:block';
  dd.appendChild(da);imWrap.appendChild(dd);
  var rd=document.createElement('div');rd.style.cssText='position:absolute;top:6px;right:6px';
  var rb=document.createElement('button');rb.textContent='↺';rb.title='Regenerar';
  rb.style.cssText='background:rgba(255,255,255,.85);border:none;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;line-height:1';
  var iidx=idx;
  rb.addEventListener('click',function(){
    setSlotLoading(slot,iidx);
    var p=lastRes&&lastRes.c&&lastRes.c[iidx]?lastRes.c[iidx]:'';
    genOneImage(imgPromptPrefix(imgFmt)+p,imgRefs).then(function(s){
      imgs[iidx]={src:s,idx:iidx+1};setSlotOk(slot,s,iidx);cost+=imgCost();updCost();chkExport();
    }).catch(function(e){setSlotError(slot,iidx,e.message);});
  });
  rd.appendChild(rb);imWrap.appendChild(rd);
  slot.appendChild(imWrap);
  var videoBox=document.createElement('div');videoBox.className='vbox';videoBox.style.cssText='margin-top:6px';
  slot.appendChild(videoBox);
  renderVideoControls(videoBox,iidx);
}

function setSlotError(slot,idx,msg){
  slot.style.cssText='border-radius:10px;overflow:hidden';
  slot.innerHTML='';
  var ecard=document.createElement('div');
  ecard.style.cssText='background:#f8ede8;border:1px solid #c4897a;border-radius:8px 8px 0 0;padding:8px 9px;font-size:10px;color:#8a4a3a';
  var short=msg.length>70?msg.slice(0,70)+'...':msg;
  ecard.textContent='Img '+(idx+1)+': '+short;
  var rbtn=document.createElement('button');
  rbtn.textContent='↺ Regenerar imagen '+(idx+1);
  rbtn.style.cssText='width:100%;background:#fff;border:1.5px solid #b8975a;border-top:none;border-radius:0 0 8px 8px;padding:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;color:#b8975a';
  var iidx=idx;
  rbtn.addEventListener('click',function(){
    setSlotLoading(slot,iidx);
    var prompt=lastRes&&lastRes.c&&lastRes.c[iidx]?lastRes.c[iidx]:'';
    genOneImage(imgPromptPrefix(imgFmt)+prompt,imgRefs).then(function(src){
      imgs[iidx]={src:src,idx:iidx+1};
      setSlotOk(slot,src,iidx);
      cost+=imgCost();updCost();chkExport();
    }).catch(function(e){
      setSlotError(slot,iidx,e.message);
    });
  });
  slot.appendChild(ecard);
  slot.appendChild(rbtn);
}

// Extrae el base64 puro (sin el prefijo data:image/...;base64,) de un data URL
function dataUrlToB64(dataUrl){
  if(!dataUrl)return null;
  var idx=dataUrl.indexOf(',');
  return idx>-1?dataUrl.slice(idx+1):dataUrl;
}

async function genImages(){
  if(!lastRes||!lastRes.c||!lastRes.c.length){alert('No hay prompts. Regenera el episodio.');return;}
  // Determinar cuántas imágenes según modo y duración
  var totalImgsTarget=lastRes.modo==='impacto'?3:lastRes.dO&&lastRes.dO.id==='90'?8:lastRes.dO&&lastRes.dO.id==='30'?3:5;
  while(lastRes.c.length<totalImgsTarget){lastRes.c.push(lastRes.c[lastRes.c.length-1]);}
  if(lastRes.c.length>totalImgsTarget){lastRes.c=lastRes.c.slice(0,totalImgsTarget);}
  var btn=document.getElementById('bimg');
  var st=document.getElementById('ist');
  var grid=document.getElementById('igrid');
  var er=document.getElementById('ie');
  btn.textContent='...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';grid.innerHTML='';er.style.display='none';
  vids=[];vidState=[];vidErrMsg=[];
  st.textContent='Cargando referencias del personaje...';
  imgRefs=await loadRefs();
  if(loadedRefsCount<4){
    st.textContent='Atención: solo '+loadedRefsCount+'/4 referencias del personaje cargaron. Continuando con ancla de estilo por texto...';
    await new Promise(function(r){setTimeout(r,1400);});
  }
  imgs=[];
  var totalImgs=Math.min(lastRes.c.length,totalImgsTarget);
  var slots=[];
  for(var i=0;i<totalImgs;i++){
    var slot=document.createElement('div');
    setSlotLoading(slot,i);
    grid.appendChild(slot);
    slots.push(slot);
  }
  var gen=0;
  for(var i=0;i<totalImgs;i++){
    st.textContent='Generando imagen '+(i+1)+' de '+totalImgs+'...';
    try{
      var src=await genOneImage(imgPromptPrefix(imgFmt)+lastRes.c[i],imgRefs);
      imgs[i]={src:src,idx:i+1};
      setSlotOk(slots[i],src,i);
      gen++;cost+=imgCost();updCost();chkExport();
    }catch(e){
      setSlotError(slots[i],i,e.message);
    }
    if(i<totalImgs-1)await new Promise(function(resolve){setTimeout(resolve,10000);});
  }
  st.textContent=gen+'/'+totalImgs+' imagenes generadas.';
  if(gen>0){var bv=document.getElementById('ballvids');if(bv)bv.style.display='block';}
  btn.textContent='🖼 Generar';btn.style.opacity='1';btn.disabled=false;
  chkExport();
}

// EXPORT
// VIDEO (Veo) -- un clip de 8s por imagen, generado manualmente uno por uno
var vids=[]; // vids[idx] = {url: blob url para <video>, downloadUrl: url firmada de GCS}
var vidState=[]; // vidState[idx] = 'idle' | 'loading' | 'done' | 'error'
var vidErrMsg=[];

function dataUrlMimeAndB64(dataUrl){
  var m=/^data:([^;]+);base64,(.*)$/.exec(dataUrl||'');
  if(!m)return{mime:'image/png',b64:dataUrlToB64(dataUrl)};
  return{mime:m[1],b64:m[2]};
}

function renderVideoControls(box,idx){
  box.innerHTML='';
  var state=vidState[idx]||'idle';
  if(state==='loading'){
    box.style.cssText='margin-top:6px;display:flex;align-items:center;gap:6px;justify-content:center;padding:7px;background:var(--warm);border-radius:8px;border:1px dashed var(--border)';
    box.innerHTML='<span class="spin" style="width:12px;height:12px;border-color:rgba(184,151,90,.3);border-top-color:#b8975a"></span><span style="font-size:10px;color:var(--tx3)">Generando video...</span>';
    return;
  }
  if(state==='done'&&vids[idx]){
    box.style.cssText='margin-top:6px';
    var vid=document.createElement('video');
    vid.src=vids[idx].url;vid.controls=true;vid.style.cssText='width:100%;border-radius:8px;display:block;background:#000';
    box.appendChild(vid);
    var row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin-top:5px';
    var dl=document.createElement('a');dl.href=vids[idx].url;dl.download='legado-video-'+(idx+1)+'.mp4';dl.textContent='⬇ Descargar';
    dl.style.cssText='flex:1;text-align:center;background:#fff;border:1.5px solid #9ab47a;border-radius:6px;padding:6px;font-size:10px;font-weight:600;color:#9ab47a;text-decoration:none';
    var rg=document.createElement('button');rg.textContent='↺ Regenerar';
    rg.style.cssText='flex:1;background:#fff;border:1.5px solid #b8975a;border-radius:6px;padding:6px;font-size:10px;font-weight:600;color:#b8975a;cursor:pointer;font-family:inherit';
    rg.addEventListener('click',function(){genVideoForSlot(idx,box);});
    row.appendChild(dl);row.appendChild(rg);
    box.appendChild(row);
    return;
  }
  if(state==='error'){
    box.style.cssText='margin-top:6px';
    var ec=document.createElement('div');
    ec.style.cssText='background:#f8ede8;border:1px solid #c4897a;border-radius:8px;padding:7px 9px;font-size:9.5px;color:#8a4a3a;margin-bottom:5px';
    var short=(vidErrMsg[idx]||'Error').slice(0,90);
    ec.textContent=short;
    box.appendChild(ec);
    var rb=document.createElement('button');rb.textContent='🎬 Reintentar Video';
    rb.style.cssText='width:100%;background:#fff;border:1.5px solid #b8975a;border-radius:6px;padding:7px;font-size:10.5px;font-weight:600;color:#b8975a;cursor:pointer;font-family:inherit';
    rb.addEventListener('click',function(){genVideoForSlot(idx,box);});
    box.appendChild(rb);
    return;
  }
  // idle: boton inicial para generar el video de esta imagen
  box.style.cssText='margin-top:6px';
  var gb=document.createElement('button');gb.textContent='🎬 Generar Video';
  gb.style.cssText='width:100%;background:#fff;border:1.5px solid #7a9ec4;border-radius:6px;padding:7px;font-size:10.5px;font-weight:600;color:#7a9ec4;cursor:pointer;font-family:inherit';
  gb.addEventListener('click',function(){genVideoForSlot(idx,box);});
  box.appendChild(gb);
}

async function genVideoForSlot(idx,box){
  if(!imgs[idx]||!imgs[idx].src){alert('Primero genera la imagen '+(idx+1)+'.');return;}
  vidState[idx]='loading';vidErrMsg[idx]='';
  renderVideoControls(box,idx);
  try{
    var movePrompt=buildVideoMotionPrompt(idx);
    var imgInfo=dataUrlMimeAndB64(imgs[idx].src);
    var startRes=await fetch('/api/video-start',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({imageBase64:imgInfo.b64,prompt:movePrompt,model:vidModel,aspectRatio:vidFmt}),
    });
    var startData=await startRes.json();
    if(!startRes.ok)throw new Error(startData.error||'Error '+startRes.status);
    if(!startData.operationName)throw new Error('No se recibio operationName.');

    var videoUrl=null,attempts=0,maxAttempts=60; // ~10 minutos a 10s cada uno
    while(attempts<maxAttempts){
      await new Promise(function(r){setTimeout(r,10000);});
      attempts++;
      var statusRes=await fetch('/api/video-status',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({operationName:startData.operationName,model:vidModel}),
      });
      var statusData=await statusRes.json();
      if(!statusRes.ok)throw new Error(statusData.error||'Error '+statusRes.status);
      if(statusData.done){
        if(statusData.error)throw new Error(statusData.error);
        videoUrl=statusData.videoUrl;
        break;
      }
    }
    if(!videoUrl)throw new Error('Tiempo de espera agotado generando el video. Intenta de nuevo.');

    // Descargar el MP4 desde la URL firmada y convertirlo en blob local (para descarga directa y ZIP)
    var vidResp=await fetch(videoUrl);
    if(!vidResp.ok)throw new Error('No se pudo descargar el video generado.');
    var vidBlob=await vidResp.blob();
    var localUrl=URL.createObjectURL(vidBlob);

    vids[idx]={url:localUrl,blob:vidBlob};
    vidState[idx]='done';
    cost+=vidCost();updCost();chkExport(); // costo estimado por clip de 8s segun modelo Veo
    renderVideoControls(box,idx);
  }catch(e){
    vidState[idx]='error';vidErrMsg[idx]=e.message||'Error generando el video.';
    renderVideoControls(box,idx);
  }
}

// Construye el prompt de movimiento de camara/escena para Veo, basado en el mismo
// momento narrativo que ya tiene la imagen (el prompt original del BLOQUE C), no inventado de nuevo.
// Movimiento natural y variado segun la escena, pero con control estricto de expresion facial
// (autoridad financiera, nunca tristeza ni distorsion) y de que cualquier accion tenga sentido real.
function buildVideoMotionPrompt(idx){
  var base=lastRes&&lastRes.c&&lastRes.c[idx]?lastRes.c[idx]:'';
  return 'ANIMATION STYLE (strict, must match the input image exactly): American 2D comic book illustration style, clean ink outlines, flat cel-shading with hard color blocks and visible shading edges -- NOT 3D, NOT 3D render, NOT CGI, NOT photorealistic, NOT realistic rendering, NOT Pixar style, NOT smooth 3D shading. The animation must preserve the flat 2D comic look of the source image throughout the entire clip.\n\n'
    +'NO WEATHER AT ALL (strict): there is NO rain, NO snow, NO storm, NO raindrops, NO water on any surface, NO wet floors, anywhere in the clip -- not outside the window, not in the background, and absolutely never indoors. Skies stay clear or neutral. Never add any weather effect that was not clearly in the source image, and never let anything look wet.\n\n'
    +'OBJECT AND HAND REALISM (strict): every object stays the SAME object for the whole clip -- it never morphs, transforms, changes type, multiplies, or turns into a different thing (a cup stays a cup, a paper stays a paper, a pen stays a pen). The character ONLY touches and interacts with the object the action requires; he does NOT reach for or pick up unrelated objects (coffee cups, glasses, decorations). Hands are steady and calm -- NO trembling, NO shaking, NO jitter. When signing or writing, ONE hand holds ONE pen; the other hand rests naturally -- never two pens, never writing with both hands at once. Papers and objects on the desk stay in place -- they do NOT jump, fly, flip, or scatter on their own. Correct human anatomy: exactly five fingers per hand, no extra or missing fingers, no merging.\n\n'
    +'MANDATORY ACTION FOR THIS CLIP (this single action drives the body, hands, and gaze direction for the ENTIRE clip): '+base+'\n\n'
    +'EYE LINE AND BODY DIRECTION (strict, this is not optional): the character looks at and engages with WHATEVER THE ACTION DESCRIBES -- the document being signed, the paper being written on, the whiteboard being drawn on. The character does NOT look at the camera, does NOT pose for the camera, does NOT turn the head toward the viewer, UNLESS the action explicitly says the character is speaking directly to camera. There is no head tilting, no modeling pose, no fashion-style head turn, no posing of any kind -- only the working posture that the action requires.\n\n'
    +'This is not a static pose and not a frozen stance with arms crossed -- the character is actively, physically DOING the described action with continuous natural motion for the full duration of the clip. A slow zoom toward a motionless or posing character is NOT acceptable.\n\n'
    +'Match the action type to natural physical motion: '
    +'if signing or writing on paper -- head and eyes are down toward the page, hand and pen move continuously across the page with deliberate natural strokes; '
    +'if writing or pointing on a whiteboard -- body is angled toward the whiteboard, arm and hand move actively, tracing simple clean shapes only (a single arrow, one underline, a rising line or bar chart), never static, never paused; '
    +'if speaking to camera -- this is the ONLY case where the character faces the viewer; natural confident hand gestures accompany the speech, mouth and expression are animated as if talking; '
    +'if walking -- the character walks with a steady, even, natural human gait at a calm unhurried pace, both feet contacting the ground normally, eyes and attention on the path ahead; if reviewing documents -- eyes and attention stay on the documents, continuous realistic body and hand movement throughout. '
    +'The motion must feel grounded, purposeful, and continuous from the first frame to the last -- never random, never exaggerated, never reduced to just camera movement or a held pose.\n\n'
    +'NATURAL LOCOMOTION (strict): if the character is walking, he walks like a normal adult -- a smooth, steady, even stride at a constant calm pace, weight shifting naturally from one foot to the other, arms swinging subtly and naturally. ABSOLUTELY NO hopping, NO skipping, NO bouncing, NO little jumps, NO sudden bursts of speed, NO breaking into a jog or run, NO gliding or floating, NO moonwalking, NO stutter-steps. The walking speed stays constant and unhurried the whole clip. He only runs or jogs if the described action explicitly says he is running or jogging; otherwise it is always a calm natural walk.\n\n'
    +'FACIAL EXPRESSION ONLY (this controls the face, never the body posture or head direction, which are governed entirely by the action above): serious, focused, professional, concentrated on the task at hand. '
    +'NEVER sad, NEVER frowning, NEVER a long or droopy face, NEVER distorted or asymmetrical eyes, NEVER a flirtatious or seductive look, NEVER a modeling or beauty-pageant expression. '
    +'Expression stays consistent and composed throughout the clip. Natural subtle blinking only.\n\n'
    +'IF WRITING OR SIGNING ON PAPER IS VISIBLE: the hand holds the pen and moves in ONE smooth, confident, continuous gesture -- a flowing cursive signature or a short line of natural adult cursive handwriting. It must look like a grown professional fluidly signing a document, NOT an attempt to spell out block letters. Do NOT try to render legible printed words or specific letters. Any writing or text ALREADY visible on the page in the source image stays EXACTLY as it is -- it must NOT morph, wobble, redraw itself, or turn into scribbles. ABSOLUTELY NO childish scribbles, NO random loops, NO meaningless zigzag or squiggle lines, NO crayon-like marks, nothing that looks like a small child drawing. If a natural signature is not achievable, the pen simply glides smoothly just above the page without adding new messy marks. '
    +'IF WRITING OR POINTING ON A WHITEBOARD IS VISIBLE: keep it to simple, clean, deliberate shapes only -- a single arrow, one straight underline, or a simple rising line or bar chart. Slow and directional, never random scribbles, never fake letters. '
    +'The hand always moves with calm, adult intention. Simplicity beats detail -- a clean signature gesture or one clear arrow is always better than messy or childish marks.\n\n'
    +'HEAD AND NECK MOVEMENT (strict): head movements must be minimal and slow -- slight forward nod or minor downward tilt toward the work only. '
    +'NO neck rotation, NO side-to-side head turning, NO looking up then down dramatically, NO head tilting. '
    +'Keeping the head relatively stable prevents anatomy distortion in the 2D comic style.\n\n'
    +'Realistic human anatomy proportions at all times (within the 2D comic style): natural hand and finger movement, no warping, no melting features, no extra or missing fingers, no distortion of the face or body.\n\n'
    +'CINEMATIC CAMERA MOVEMENT (mandatory): choose ONE of the following based on the scene action and apply it dynamically and intentionally throughout the entire clip -- '
    +'LOW ANGLE PUSH-IN: camera starts low looking up at the character with authority and slowly pushes forward -- use for power, decision-making, or speaking to camera; '
    +'TRACKING FOLLOW: camera follows the character hands or body movement fluidly -- use for signing, writing, or pointing at whiteboard; '
    +'DRAMATIC PUSH-IN: camera starts at medium distance and pushes in decisively toward the face or hands -- use for moments of confrontation or revelation; '
    +'SLOW ORBIT: camera moves laterally around the character in a slow deliberate arc -- use for reviewing documents, thinking, or surveying the scene; '
    +'HIGH-TO-LOW: camera starts slightly above eye level and slowly descends to a commanding low angle -- use for establishing authority. '
    +'NO static camera. NO simple mechanical zoom. NO forward drift with no direction. The camera must feel like a human cinematographer chose this shot intentionally for this specific scene.\n\n'
    +'CLIP START AND END (strict): the clip must start and end cleanly on a fully opaque, fully visible frame. '
    +'NO fade in, NO fade out, NO dissolve, NO cross-fade, NO transition effect of any kind at the beginning or end of the clip. '
    +'NO double image, NO ghosting, NO transparency effect, NO overlapping frames. '
    +'The last frame must be as solid and clear as the first frame -- cut clean, no blending.';
}

async function genAllVideos(){
  if(!imgs||!imgs.length){alert('Genera las imágenes primero.');return;}
  var btn=document.getElementById('ballvids');
  btn.disabled=true;btn.textContent='Generando videos...';
  // Buscar todos los vboxes en orden
  var slots=document.getElementById('igrid').querySelectorAll('.vbox');
  for(var i=0;i<slots.length;i++){
    if(!imgs[i]||!imgs[i].src){continue;}
    if(vidState[i]==='done'){continue;} // ya tiene video, saltar
    await genVideoForSlot(i,slots[i]);
  }
  btn.disabled=false;btn.textContent='🎬 Generar todos los videos';
}

function chkExport(){if(audES||audEN||imgs.length)document.getElementById('expbtn').style.display='flex';}

function fmtSRTTime(s){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=Math.floor(s%60),ms=Math.round((s%1)*1000);return(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(sc<10?'0':'')+sc+','+(ms<100?(ms<10?'00':'0'):'')+ms;}

function makeSRTFromAlignment(alignment){
  if(!alignment||!alignment.characters)return '';
  var chars=alignment.characters;
  var starts=alignment.character_start_times_seconds;
  var ends=alignment.character_end_times_seconds;
  var words=[],curWord='',curStart=0,curEnd=0;
  for(var i=0;i<chars.length;i++){
    var c=chars[i];
    if(c===' '||c==='\n'||c==='\r'){
      if(curWord.length>0){words.push({text:curWord,start:curStart,end:curEnd});curWord='';}
    } else {
      if(curWord.length===0)curStart=starts[i];
      curWord+=c;curEnd=ends[i];
    }
  }
  if(curWord.length>0)words.push({text:curWord,start:curStart,end:curEnd});
  var segs=[],gi=0;
  while(gi<words.length){
    var group=[],gStart=words[gi].start,gEnd=0;
    while(gi<words.length&&group.length<4){
      group.push(words[gi].text);gEnd=words[gi].end;gi++;
      if(/[.!?,;]$/.test(group[group.length-1])&&group.length>=1)break;
    }
    if(group.length)segs.push({text:group.join(' '),start:gStart,end:gEnd});
  }
  return segs.map(function(s,i){return(i+1)+'\n'+fmtSRTTime(s.start)+' --> '+fmtSRTTime(s.end)+'\n'+s.text.toUpperCase()+'\n';}).join('\n');
}

function makeSRT(text){
  var words=text.replace(/\n+/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(function(w){return w.length>0;});
  var WPM=130,secPerWord=60/WPM,segs=[],t=0,i=0;
  while(i<words.length){
    var group=[];
    while(i<words.length&&group.length<4){
      group.push(words[i]);i++;
      if(/[.!?,;]$/.test(group[group.length-1])&&group.length>=1)break;
    }
    if(!group.length)break;
    var dur=group.length*secPerWord;
    segs.push({text:group.join(' '),start:t,end:t+dur});
    t+=dur;
  }
  return segs.map(function(s,i){return(i+1)+'\n'+fmtSRTTime(s.start)+' --> '+fmtSRTTime(s.end)+'\n'+s.text.toUpperCase()+'\n';}).join('\n');
}

async function exportAll(){
  var btn=document.getElementById('expbtn');
  btn.innerHTML='<span class="spin"></span> Creando ZIP...';btn.disabled=true;
  var slug=(lastRes&&lastRes.topic?lastRes.topic:'reel').slice(0,25).replace(/[^a-zA-Z0-9]/g,'-');
  try{
    var zip=new JSZip();
    if(lastRes&&lastRes.a) zip.file(slug+'-guion-es.txt',lastRes.a);
    if(lastRes&&lastRes.f) zip.file(slug+'-guion-en.txt',lastRes.f);
    var srtES=audES&&audES.alignment?makeSRTFromAlignment(audES.alignment):makeSRT(lastRes&&lastRes.a?lastRes.a:'');
    var srtEN=audEN&&audEN.alignment?makeSRTFromAlignment(audEN.alignment):makeSRT(lastRes&&lastRes.f?lastRes.f:'');
    if(srtES) zip.file(slug+'-subtitulos-es.srt',srtES);
    if(srtEN) zip.file(slug+'-subtitulos-en.srt',srtEN);
    if(audES&&audES.blob){
      var ab1=await audES.blob.arrayBuffer();
      zip.file(slug+'-audio-es.wav',ab1);
    }
    if(audEN&&audEN.blob){
      var ab2=await audEN.blob.arrayBuffer();
      zip.file(slug+'-audio-en.wav',ab2);
    }
    for(var i=0;i<imgs.length;i++){
      if(imgs[i]&&imgs[i].src){
        var b64=imgs[i].src.split(',')[1];
        if(b64) zip.file('imagenes/'+slug+'-imagen-'+(i+1)+'.png',b64,{base64:true});
      }
    }
    for(var vi=0;vi<vids.length;vi++){
      if(vids[vi]&&vids[vi].blob){
        var vb=await vids[vi].blob.arrayBuffer();
        zip.file('videos/'+slug+'-video-'+(vi+1)+'.mp4',vb);
      }
    }
    var content=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}});
    var url=URL.createObjectURL(content);
    var a=document.createElement('a');
    a.href=url;a.download=slug+'-legado.zip';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},5000);
    btn.innerHTML='✓ ZIP Descargado';
    setTimeout(function(){btn.innerHTML='📦 Exportar todo (Guiones + Audio + Imágenes + Videos)';btn.disabled=false;},3000);
  }catch(e){
    btn.innerHTML='📦 Exportar todo (Guiones + Audio + Imágenes + Videos)';btn.disabled=false;
    alert('Error ZIP: '+e.message);
  }
}

// HELPERS
function mkCp(t){
  var b=document.createElement('button');b.className='cbtn';b.textContent='Copiar';
  b.addEventListener('click',function(){
    navigator.clipboard.writeText(t).then(function(){
      b.textContent='Copiado';b.classList.add('done');
      setTimeout(function(){b.textContent='Copiar';b.classList.remove('done');},2000);
    });
  });
  return b;
}
function showErr(m){document.getElementById('etitle').textContent='Error: '+m;document.getElementById('ebox').style.display='block';}
function hideErr(){document.getElementById('ebox').style.display='none';}
function reset(){
  document.getElementById('ow').style.display='none';
  document.getElementById('conc').value='';updCC();updGBtn();lastRes=null;
  audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];sT='';rfAll();
  window.scrollTo({top:0,behavior:'smooth'});
}

// POST FACEBOOK
var postFmt='cuadrado';
var postImgModel='gemini-2.5-flash-image';

function selPostFmt(fmt){
  postFmt=fmt;
  ['cuadrado','vertical'].forEach(function(f,i){
    var b=document.getElementById('pfmt'+(i+1));
    if(b){b.classList.toggle('sel',f===fmt);b.style.borderColor=f===fmt?'#9ab47a':'';b.style.background=f===fmt?'#eef4e8':'';}
  });
}

var POST_FRASES=[
  {titulo:'El empleo te paga.\nLos activos te liberan.',subtitulo:'Te pagan por tu tiempo, no por tu valor. Cada hora que trabajas para otro es una hora que no invertiste en construirte a ti. El empleado intercambia libertad por seguridad falsa. El que entiende esto empieza a construir algo propio aunque sea pequeño, aunque sea lento. Porque un dia ese algo trabaja sin ti.'},
  {titulo:'Nadie se hace rico\ntrabajando para otro.',subtitulo:'Lo que te dieron fue un contrato, no un futuro. El salario cubre gastos. Los activos construyen riqueza. Mientras tu dinero duerme en una cuenta, el tiempo pasa y la inflacion come lo poco que guardaste. La diferencia no es suerte. Es que unos entienden como funciona el dinero y otros no.'},
  {titulo:'Sin disciplina\nno hay salida.',subtitulo:'La motivacion llega y se va. El que espera ganas para ejecutar, nunca ejecuta. Los habitos no se sienten, se construyen. Diez minutos al dia aprendiendo como funciona el dinero valen mas que un fin de semana de cursos que nunca aplicas. Consistencia sin resultados visibles es lo que separa al que llega del que se queda.'},
  {titulo:'Tu dinero parado\nes dinero perdido.',subtitulo:'La inflacion no descansa. Cada año que no mueves tu capital, pierdes poder adquisitivo en silencio. No necesitas mucho para empezar. Necesitas entender que el dinero es una herramienta, y las herramientas que no se usan se oxidan. Empieza con lo que tienes, donde estas, con lo que sabes hoy.'},
  {titulo:'El ambiente\ndecide el resultado.',subtitulo:'No puedes pensar como libre si todos a tu alrededor piensan como empleados. Las personas que tienes cerca definen el techo de lo que crees posible. Busca a los que ya construyeron lo que tu quieres construir. Observa como piensan. Como deciden. Como actuan cuando nadie los ve. Eso vale mas que cualquier libro.'},
];

var POST_ESTILOS_IMG=[
  'dramatic portrait, man in dark office at night, single lamp lighting, city lights through tall window behind',
  'cinematic scene, man standing at rooftop edge overlooking city at dusk, golden hour light',
  'powerful composition, man at executive desk reviewing financial documents, dramatic side lighting',
  'atmospheric portrait, man walking through empty corporate hallway, confident stride, dramatic shadows',
  'editorial scene, man in front of large window with rain, contemplative powerful pose, dark moody lighting',
];

function downloadPost(){
  var canvas=document.getElementById('postCanvas');
  if(!canvas)return;
  var a=document.createElement('a');
  a.download='legado-post-'+postFmt+'.png';
  a.href=canvas.toDataURL('image/png',1.0);
  a.click();
}

async function genPost(){
  var btn=document.getElementById('bpost');
  var st=document.getElementById('postSt');
  var err=document.getElementById('postErr');
  var result=document.getElementById('postResult');
  var orig=btn.textContent;
  btn.textContent='Generando...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';st.textContent='Generando personaje con IA...';
  err.style.display='none';result.style.display='none';
  try{
    var tema=document.getElementById('postTema').value.trim();
    var fraseObj;
    if(tema){
      var rf=await fetch('/api/generate',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({prompt:'Eres el guionista del canal Legado de Hierro. Genera el texto de un post de Facebook sobre: "'+tema+'". Usa el mismo vocabulario y tono de los guiones del canal: directo, sin palabras complejas, sin motivacion vacia, verdad cruda sobre dinero y libertad. Oraciones cortas. Sin firma al final. Devuelve SOLO un JSON sin markdown: {"titulo":"MAXIMO 6 PALABRAS\\nSEGUNDA LINEA OPCIONAL","subtitulo":"4 a 6 oraciones cortas con la ensenanza. Sin firma."}'}),
      });
      var rd=await rf.json();
      try{fraseObj=JSON.parse(rd.text.replace(/```json|```/g,'').trim());}
      catch(e){fraseObj=POST_FRASES[Math.floor(Math.random()*POST_FRASES.length)];}
    }else{
      fraseObj=POST_FRASES[Math.floor(Math.random()*POST_FRASES.length)];
    }
    var estilo=POST_ESTILOS_IMG[Math.floor(Math.random()*POST_ESTILOS_IMG.length)];
    var isVertical=postFmt==='vertical';
    var prompt=estilo+'. Subject: handsome confident man, 35 years old, short black hair slicked back, well-groomed short dark beard, sharp jawline, intense dark brown eyes, serious determined expression never smiling. Wearing impeccably tailored black three-piece suit, dark tie, white pocket square, luxury watch on left wrist. American 2D comic book illustration style, bold ink lines, dramatic cel-shading, rich dark palette, golden accent lighting. Character positioned on RIGHT side of image, LEFT side darker/empty for text overlay. '+(isVertical?'4:5 vertical format':'1:1 square format')+'. No text in image. NO robots, NO futurism, NO sci-fi, NO broken chains, NO magic effects. Real business and finance world only.';
    st.textContent='Cargando referencias del personaje...';
    var refsResp=await fetch('/api/refs').catch(function(){return null;});
    var refs=[];
    if(refsResp&&refsResp.ok){var rd2=await refsResp.json().catch(function(){return{};});refs=(rd2&&rd2.refs)?rd2.refs:[];}
    var ri2=await fetch('/api/image',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt,refImages:refs,model:postImgModel}),
    });
    var di=await ri2.json();
    if(!ri2.ok||!di.image)throw new Error(di.error||'Error generando imagen');
    st.textContent='Componiendo diseno editorial...';
    await composePost(di.image,fraseObj,isVertical);
    result.style.display='block';
    st.textContent='Post listo para publicar.';
    cost+=(IMG_COST[postImgModel]||0.039);updCost();
  }catch(e){
    err.textContent='Error: '+e.message;err.style.display='block';st.style.display='none';
  }finally{
    btn.textContent=orig;btn.style.opacity='1';btn.disabled=false;
  }
}

async function composePost(imgBase64,fraseObj,isVertical){
  var canvas=document.getElementById('postCanvas');
  var W=1080,H=isVertical?1350:1080;
  canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext('2d');
  var img=new Image();
  await new Promise(function(res,rej){img.onload=res;img.onerror=rej;img.src='data:image/png;base64,'+imgBase64;});
  ctx.fillStyle='#0a0a0f';ctx.fillRect(0,0,W,H);
  ctx.drawImage(img,W-W*0.62,0,W*0.62,H);
  var grad=ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,'rgba(8,8,15,1)');grad.addColorStop(0.45,'rgba(8,8,15,0.97)');
  grad.addColorStop(0.65,'rgba(8,8,15,0.6)');grad.addColorStop(1,'rgba(8,8,15,0)');
  ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  var gradB=ctx.createLinearGradient(0,H*0.7,0,H);
  gradB.addColorStop(0,'rgba(8,8,15,0)');gradB.addColorStop(1,'rgba(8,8,15,0.85)');
  ctx.fillStyle=gradB;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#b8975a';ctx.fillRect(52,80,4,H*0.6);
  var PAD=72,textW=W*0.56;
  var titLines=fraseObj.titulo.split('\n');
  var titleSize=isVertical?82:88;
  ctx.font='900 '+titleSize+'px Arial Black, Arial';
  while(titLines.some(function(l){return ctx.measureText(l).width>textW-20;})&&titleSize>48){
    titleSize-=3;ctx.font='900 '+titleSize+'px Arial Black, Arial';
  }
  ctx.textBaseline='top';
  var ty=isVertical?110:100;
  titLines.forEach(function(line,i){
    ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=12;
    ctx.fillStyle=(i===titLines.length-1)?'#b8975a':'#ffffff';
    ctx.font='900 '+titleSize+'px Arial Black, Arial';
    ctx.fillText(line,PAD,ty);ty+=titleSize*1.15;
  });
  ctx.shadowBlur=0;ty+=20;
  ctx.fillStyle='#b8975a';ctx.fillRect(PAD,ty,120,3);ty+=24;
  ctx.font='400 '+(isVertical?34:36)+'px Arial';
  ctx.fillStyle='rgba(255,255,255,0.82)';
  ctx.shadowColor='rgba(0,0,0,0.6)';ctx.shadowBlur=8;
  var subLines=wrapText(ctx,fraseObj.subtitulo,textW-PAD);
  subLines.forEach(function(line){ctx.fillText(line,PAD,ty);ty+=isVertical?46:48;});
  ctx.shadowBlur=0;
  ctx.fillStyle='#b8975a';ctx.font='700 28px Arial Black';ctx.textBaseline='middle';
  ctx.fillText('LEGADO DE HIERRO',PAD,H-80);
  ctx.strokeStyle='rgba(184,151,90,0.3)';ctx.lineWidth=3;ctx.strokeRect(2,2,W-4,H-4);
}

function wrapText(ctx,text,maxW){
  var words=text.split(' '),lines=[],cur='';
  words.forEach(function(w){
    var test=cur?cur+' '+w:w;
    if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=w;}else cur=test;
  });
  if(cur)lines.push(cur);
  return lines;
}

// INIT
document.addEventListener('DOMContentLoaded',function(){
  buildAll();
  wireGenSettings();
  document.getElementById('schedBtn').addEventListener('click',function(){
    var o=document.getElementById('schedPanel').classList.toggle('on');
    document.getElementById('sa').textContent=o?'▲':'▼';
  });
  document.getElementById('conc').addEventListener('input',function(){updCC();updGBtn();});
  document.getElementById('gbtn').addEventListener('click',generate);
  document.getElementById('cpall').addEventListener('click',function(){
    if(lastRes){
      var todo=(lastRes.a||'')+'\n\n---\n\n'+(lastRes.f||'');
      navigator.clipboard.writeText(todo);
    }
  });
  document.getElementById('baes').addEventListener('click',function(){genAudio('es');});
  document.getElementById('baen').addEventListener('click',function(){genAudio('en');});
  document.getElementById('bimg').addEventListener('click',genImages);
  document.getElementById('bcap').addEventListener('click',genCaption);
  document.getElementById('bcapcopy').addEventListener('click',function(){
    if(lastCaption||lastTags){
      var todo=(lastCaption?lastCaption+'\n\n':'')+(lastTags||'');
      navigator.clipboard.writeText(todo);
      var b=document.getElementById('bcapcopy');var o=b.textContent;b.textContent='Copiado ✓';setTimeout(function(){b.textContent=o;},1500);
    }
  });
  document.getElementById('expbtn').addEventListener('click',exportAll);
  document.getElementById('lp').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
  document.getElementById('rp2').addEventListener('keydown',function(e){if(e.key==='Enter')doRegister();});
  var sess=localStorage.getItem('lh_sess');
  var users=getUsers();
  if(sess&&users[sess]){
    ANT=HARDCODED_ANT;EL=HARDCODED_EL;VOICE=HARDCODED_VOICE;NB=HARDCODED_NB;
    showApp();
  }else{
    document.getElementById('pg-login').classList.add('on');
  }
});
