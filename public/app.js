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



var SP='Eres el Guionista Principal del canal LEGADO DE HIERRO en Facebook Reels. Voz: directa, cruda, sin motivación vacía. Vocabulario simple. Oraciones cortas. Verdad incómoda sobre dinero y libertad.\n\nESTILO CRUDO OBLIGATORIO: confronta directamente al espectador. Sacúdelo. Incomódalo con la verdad. Sin motivación vacía. Sin suavizar. Segunda persona agresiva con propósito: despertar, no insultar. El estándar de crudeza del canal son frases como: "comienza de una maldita vez", "levántate de ese sofá", "deja de soñar con ser millonario y empieza a construir tu legado", "¿quieres llegar a los 50 y darte cuenta de que no construiste nada?". Cada guión debe alcanzar ese nivel de crudeza de principio a fin.\n\nREGLA DE VARIEDAD: NUNCA uses frases genéricas de apertura como "el noventa por ciento", "la mayoría de las personas", "muchos no saben". El gancho debe ser único, específico al tema, y diferente cada vez.\n\nGANCHOS POR TIPO:\n- DATO: cifra exacta e impactante relacionada al tema. Ej: "En Estados Unidos, 78 de cada 100 trabajadores viven de quincena en quincena."\n- PREGUNTA: pregunta que incomoda y obliga a reflexionar. Ej: "¿Cuántos años llevas trabajando sin acercarte un solo día a la libertad?"\n- AFIRMACIÓN: verdad incómoda y directa. Ej: "El empleo es el único negocio donde el dueño eres tú y el que se queda con la ganancia es otro."\n- HISTORIA: primera persona, momento específico real. Ej: "Tuve trabajo fijo por seis años. El día que me despidieron, entendí que nunca fue seguridad."\n- PASOS: comenzar directo con el primer paso. Ej: "Primero, deja de gastar en lo que no produce."\n\nINSTRUCCIONES POR PILAR:\n- LIBERTAD FINANCIERA: enfoque en salir del sistema, tiempo vs dinero, independencia real.\n- MENTALIDAD Y DISCIPLINA: hábitos concretos, decisiones difíciles, diferencias de mentalidad.\n- SISTEMAS Y AUTOMATIZACIÓN: procesos específicos que generan sin presencia, ejemplos reales.\n- HERRAMIENTAS DEL CAMINO: el camino a la libertad financiera sí es posible solo, pero será mucho más difícil y lento. Si está viendo esto es porque necesita ese empujón. Yo ya recorrí ese camino y construí las herramientas exactas que él necesita para acelerarlo. Habla en primera persona: las herramientas son MÍAS, las ofrezco yo, están a un paso de él. NUNCA menciones precios ni nombres de productos. Despierta el hambre y la urgencia. Cierra empujando a mirar lo que tengo para él.\n- MARCA PERSONAL Y AUTORIDAD: construir autoridad en redes, posicionarse como experto, cómo la presencia en línea se convierte en dinero. Mensaje central: documenta todo tu proceso desde el día uno, no importa si al principio no publicas nada, grábalo igual, eso construye confianza poco a poco hasta volverte imparable.\n- INVERSIÓN Y CAPITAL: activos reales, números concretos, estrategias simples ejecutables.\n- NEGOCIO Y VENTAS: estructura comercial real, cómo vender, cómo escalar.\n- NEGOCIOS CON POCO CAPITAL: ideas específicas ejecutables hoy, sin capital inicial, modelos de servicio o reventa, pasos concretos desde cero.\n- NEGOCIOS MILLONARIOS: mentalidad de escala, diferencia entre negocio pequeño y grande, sistemas, delegación, visión a largo plazo.\n\nRITMO PARA AUDIO: comas para conectar, puntos para pausas dramáticas. Nunca omitas puntuación.\nVOZ: 70% segunda persona, 30% primera persona.\nCIERRES: nunca repitas el mismo cierre. Siempre termina con: Legado de Hierro.\nREGLA ABSOLUTA BLOQUE A: SOLO texto hablado. SIN corchetes, etiquetas, hashtags, prompts.\nESCRITURA: acentos y tildes correctos siempre. Nunca palabras incompletas.\nFORMATO: sin markdown, sin **, sin ##. Solo texto plano.\n\nGENERA EXACTAMENTE ESTOS 3 BLOQUES:\n\nBLOQUE A\n[Solo texto hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]\n\nBLOQUE C\nREGLA CRÍTICA: cada prompt ilustra el momento exacto del guión. El personaje hace algo relacionado a la narración. Escenas reales: firmando contratos, revisando gráficas, en reuniones, calculando inversiones, hablando frente a pizarra, caminando por Wall Street, mirando pantallas con datos.\nPROMPT 1: [escena del gancho]\nPROMPT 2: [escena del segundo momento]\nPROMPT 3: [escena del tercer momento]\nPROMPT 4: [escena del cuarto momento]\nPROMPT 5: [escena del quinto momento]\nPROMPT 6: [escena del sexto momento]\nPROMPT 7: [escena del séptimo momento]\nPROMPT 8: [escena del cierre]\n\nBLOQUE F\n[Traducción como angloparlante nativo. Solo texto hablado en inglés. Párrafos separados por línea en blanco. Termina con: Iron Legacy.]';

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
var sT='',sD='60',sH='dato';
var loading=false,lastRes=null,activeTab='a';
var genCount=0,cost=0;
var audES=null,audEN=null,imgs=[];

function showPills(){
  var el=document.getElementById('apipills');
  function mk(lbl,ok){return '<span class="api-pill" style="color:'+(ok?'#7a9b8a':'#c4897a')+';background:'+(ok?'#eaf2ee':'#f8ede8')+'">'+(ok?'●':'○')+' '+lbl+'</span>';}
  el.innerHTML=mk('Anthropic',!!ANT)+mk('ElevenLabs',!!EL)+mk('Google AI',!!NB);
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
    b.addEventListener('click',function(){sD=d.id;rfAll();});
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
  var tO=THEMES.find(function(t){return t.id===sT;});
  var hO=HOOKS.find(function(h){return h.id===sH;});
  var dO=DURS.find(function(d){return d.id===sD;});
  var hi={dato:'Empieza con dato/cifra impactante.',pregunta:'Empieza con pregunta disruptiva.',afirmacion:'Empieza con verdad incomoda directa.',historia:'Empieza en primera persona con experiencia cruda.',pasos:'Desarrolla con Primero, Segundo, Tercero.'};
  var identidad='IDENTIDAD FIJA DEL PERSONAJE EN PROMPTS: A handsome 35-year-old man, short black hair slicked back, short dark beard, strong jawline, intense dark brown eyes, serious expression never smiling, black three-piece suit, dark tie, white pocket square, luxury watch on left wrist. American 2D comic book illustration, clean ink lines, cel-shading, NOT photorealistic. 9:16 vertical portrait. No text in image. ESCENAS: executive offices, boardrooms, city skyline views, financial documents on desks, skyscraper balconies, corporate hallways, nighttime city views. NO robots, NO futurism, NO sci-fi, NO broken chains, NO magic effects, NO fantasy. Real business and finance world only.';
  var msg=SP+'\n\n---\n\nGenera un episodio COMPLETO:\nPILAR: '+(tO?tO.label+' - '+tO.desc:'Independencia Financiera')+'\nDURACION: '+(dO?dO.label:'60 segundos')+'\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' - '+(hi[sH]||hi.dato)+'\nCONCEPTO: '+topic+'\n\n'+identidad+'\n\nRecuerda: BLOQUE A es solo texto hablado sin prompts. BLOQUE C son los 8 prompts de imagen. BLOQUE F es el guion en ingles sin prompts.';
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
    lastRes=Object.assign({},p,{raw:txt,topic:topic,tO:tO,dO:dO,hO:hO});
    genCount++;cost+=0.015;updCost();
    audES=null;audEN=null;imgs=[];
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
  document.getElementById('audioCard').style.display='block';
  document.getElementById('imgCard').style.display='block';
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
    var audioB64=data.audio;
    var chars=atob(audioB64);
    var bytes=new Uint8Array(chars.length);
    for(var i=0;i<chars.length;i++)bytes[i]=chars.charCodeAt(i);
    var blob=new Blob([bytes],{type:'audio/mpeg'});
    var url=URL.createObjectURL(blob);
    // *** CAMBIO: guardar b64 original para el ensamblador ***
    if(isEN){audEN={blob:blob,url:url,b64:audioB64,alignment:data.alignment||null};}
    else{audES={blob:blob,url:url,b64:audioB64,alignment:data.alignment||null};}
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

// IMAGES
var imgRefs=[];

async function loadRefs(){
  var REFS=['https://i.ibb.co/m5Cqfs5n/IMG-8206.jpg','https://i.ibb.co/3m42CzNf/IMG-8162.jpg','https://i.ibb.co/GvfhKnJ3/IMG-8117.jpg'];
  var refs=[];
  for(var ri=0;ri<REFS.length;ri++){
    try{
      var rr=await fetch(REFS[ri]);if(!rr.ok)continue;
      var rb=await rr.blob();
      var rb64=await new Promise(function(res){var rd=new FileReader();rd.onloadend=function(){res(rd.result.split(',')[1]);};rd.readAsDataURL(rb);});
      refs.push(rb64);
    }catch(e){console.warn('Ref '+ri+' failed:',e);}
  }
  return refs;
}

async function genOneImage(prompt,refs){
  var ir;
  try{
    ir=await fetch('/api/image',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt,refImages:refs}),
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
  slot.style.cssText='position:relative;border-radius:10px;overflow:hidden;box-shadow:0 3px 12px rgba(74,74,90,0.15)';
  slot.innerHTML='';
  var im=document.createElement('img');im.src=src;im.style.cssText='width:100%;display:block;border-radius:10px';slot.appendChild(im);
  var dd=document.createElement('div');dd.style.cssText='position:absolute;bottom:6px;right:6px';
  var da=document.createElement('a');da.href=src;da.download='legado-img-'+(idx+1)+'.png';da.textContent='⬇';da.style.cssText='background:rgba(255,255,255,.93);border-radius:6px;padding:4px 9px;font-size:10px;font-weight:600;color:#2a2a3a;text-decoration:none;display:block';
  dd.appendChild(da);slot.appendChild(dd);
  var rd=document.createElement('div');rd.style.cssText='position:absolute;top:6px;right:6px';
  var rb=document.createElement('button');rb.textContent='↺';rb.title='Regenerar';
  rb.style.cssText='background:rgba(255,255,255,.85);border:none;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;line-height:1';
  var iidx=idx;
  rb.addEventListener('click',function(){
    setSlotLoading(slot,iidx);
    var p=lastRes&&lastRes.c&&lastRes.c[iidx]?lastRes.c[iidx]:'';
    genOneImage('9:16 vertical portrait format, tall image not square. '+p,imgRefs).then(function(s){
      imgs[iidx]={src:s,idx:iidx+1};setSlotOk(slot,s,iidx);cost+=0.068;updCost();chkExport();
    }).catch(function(e){setSlotError(slot,iidx,e.message);});
  });
  rd.appendChild(rb);slot.appendChild(rd);
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
    genOneImage(prompt,imgRefs).then(function(src){
      imgs[iidx]={src:src,idx:iidx+1};
      setSlotOk(slot,src,iidx);
      cost+=0.068;updCost();chkExport();
    }).catch(function(e){
      setSlotError(slot,iidx,e.message);
    });
  });
  slot.appendChild(ecard);
  slot.appendChild(rbtn);
}

async function genImages(){
  if(!lastRes||!lastRes.c||!lastRes.c.length){alert('No hay prompts. Regenera el episodio.');return;}
  while(lastRes.c.length<8){lastRes.c.push(lastRes.c[lastRes.c.length-1]);}
  var btn=document.getElementById('bimg');
  var st=document.getElementById('ist');
  var grid=document.getElementById('igrid');
  var er=document.getElementById('ie');
  btn.textContent='...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';grid.innerHTML='';er.style.display='none';
  st.textContent='Cargando referencias del personaje...';
  imgRefs=await loadRefs();
  imgs=[];
  var totalImgs=Math.min(lastRes.c.length,8);
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
      var src=await genOneImage('9:16 vertical portrait format, tall image not square. '+lastRes.c[i],imgRefs);
      imgs[i]={src:src,idx:i+1};
      setSlotOk(slots[i],src,i);
      gen++;cost+=0.068;updCost();chkExport();
    }catch(e){
      setSlotError(slots[i],i,e.message);
    }
    if(i<totalImgs-1)await new Promise(function(resolve){setTimeout(resolve,10000);});
  }
  st.textContent=gen+'/'+totalImgs+' imagenes generadas.';
  btn.textContent='🖼 Generar';btn.style.opacity='1';btn.disabled=false;
  chkExport();
}

// EXPORT
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
      zip.file(slug+'-audio-es.mp3',ab1);
    }
    if(audEN&&audEN.blob){
      var ab2=await audEN.blob.arrayBuffer();
      zip.file(slug+'-audio-en.mp3',ab2);
    }
    for(var i=0;i<imgs.length;i++){
      if(imgs[i]&&imgs[i].src){
        var b64=imgs[i].src.split(',')[1];
        if(b64) zip.file(slug+'-imagen-'+(i+1)+'.png',b64,{base64:true});
      }
    }
    var content=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}});
    var url=URL.createObjectURL(content);
    var a=document.createElement('a');
    a.href=url;a.download=slug+'-legado.zip';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},5000);
    btn.innerHTML='✓ ZIP Descargado';
    setTimeout(function(){btn.innerHTML='📦 Exportar todo (Guiones + Audio + Imágenes)';btn.disabled=false;},3000);
  }catch(e){
    btn.innerHTML='📦 Exportar todo (Guiones + Audio + Imágenes)';btn.disabled=false;
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
  audES=null;audEN=null;imgs=[];sT='';rfAll();
  window.scrollTo({top:0,behavior:'smooth'});
}

// POST FACEBOOK
var postFmt='cuadrado';

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
      body:JSON.stringify({prompt:prompt,refImages:refs}),
    });
    var di=await ri2.json();
    if(!ri2.ok||!di.image)throw new Error(di.error||'Error generando imagen');
    st.textContent='Componiendo diseno editorial...';
    await composePost(di.image,fraseObj,isVertical);
    result.style.display='block';
    st.textContent='Post listo para publicar.';
    cost+=0.068;updCost();
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
