// ============================================================================
//  SEGURIDAD: llave de la app. Se guarda en el navegador (lh_key) al iniciar
//  sesion y se adjunta en la cabecera x-app-key a TODA llamada a /api/. El
//  servidor la compara con APP_KEY (variable de Vercel). Asi nadie que no tenga
//  la contrasena puede gastar tus creditos. Un solo lugar cubre las 20+ llamadas.
// ============================================================================
function forceRelogin(msg){
  try{localStorage.removeItem('lh_key');localStorage.removeItem('lh_sess');}catch(e){}
  var app=document.getElementById('pg-app');if(app)app.classList.remove('on');
  var lg=document.getElementById('pg-login');if(lg)lg.classList.add('on');
  var e=document.getElementById('le');
  if(e){e.textContent=msg||'Tu sesion expiro. Entra de nuevo con tu contrasena.';e.style.display='block';}
}
(function(){
  var _f=window.fetch.bind(window);
  window.fetch=function(input,init){
    if(typeof input==='string'&&input.indexOf('/api/')===0){
      init=init||{};
      var h=new Headers(init.headers||{});
      var k='';try{k=localStorage.getItem('lh_key')||'';}catch(e){}
      // No pisar la cabecera si la llamada ya la trae (p. ej. el propio login).
      if(k&&!h.has('x-app-key'))h.set('x-app-key',k);
      init.headers=h;
      var p=_f(input,init);
      // Un 401 NO siempre significa "tu sesion expiro": tambien puede venir de un
      // proveedor externo (ElevenLabs, Google) y llegar reenviado tal cual. Solo se
      // manda al login cuando el cuerpo trae code:'APP_AUTH', que es el que pone
      // nuestra puerta de seguridad; el resto se deja pasar para que el error real
      // se vea en pantalla en vez de quedar tapado por la pantalla de acceso.
      if(input.indexOf('/api/login')!==0){
        p=p.then(function(res){
          if(!res||res.status!==401)return res;
          return res.clone().json().catch(function(){return null;}).then(function(d){
            if(d&&d.code==='APP_AUTH')forceRelogin();
            return res;
          });
        });
      }
      return p;
    }
    return _f(input,init);
  };
})();

var THEMES=[
  {id:'libertad',   label:'Libertad Financiera',     icon:'🔓',desc:'Independencia, salida del sistema',c:'#b8975a',p:'#f0e8d8'},
  {id:'mentalidad', label:'Mentalidad & Disciplina',  icon:'🧠',desc:'Psicología del éxito, hábitos',    c:'#9a8ac4',p:'#f0eef8'},
  {id:'sistema',    label:'Sistemas & Automatización',icon:'⚙️',desc:'Procesos que generan sin ti',      c:'#7a9b8a',p:'#eaf2ee'},
  {id:'herramientas',label:'Herramientas del Camino',icon:'🛠️',desc:'Acelera tu camino con lo que ya construí',c:'#c4897a',p:'#f8ede8'},
  {id:'marca',      label:'Marca Personal & Autoridad',icon:'🎯',desc:'Tu nombre, tu presencia, tu dinero',c:'#b87a8a',p:'#f8e8ee'},
  {id:'inversion',  label:'Inversión & Capital',      icon:'📈',desc:'Activos, portafolio, dinero',      c:'#7a9ec4',p:'#e8f0f8'},
  {id:'negocio',    label:'Negocio & Ventas',         icon:'🏗️',desc:'Estructura comercial, escala',     c:'#9ab47a',p:'#eef4e8'},
  {id:'millonario', label:'Negocios Millonarios',     icon:'🏆',desc:'Construcción de riqueza a largo plazo',c:'#8a7ac4',p:'#eceaf8'},
];
// Solo 30 y 60 segundos: 90s consumia demasiadas imagenes y videos por reel.
// (El modo Impacto siempre es de 30 segundos.)
var DURS=[
  {id:'30',label:'30 segundos',sub:'Reel express — máximo impacto'},
  {id:'60',label:'60 segundos',sub:'Reel estándar — óptimo algoritmo'},
];
// Duraciones de los modos LARGOS (Profesor y Relato). No se mezclan con las de
// arriba: un reel de 5 minutos no existe, y un video de YouTube de 30 segundos
// tampoco. Cada familia de modos ve solo las suyas.
var DURS_LARGAS=[
  {id:'180',label:'3 minutos',sub:'Clase corta — un método concreto'},
  {id:'300',label:'5 minutos',sub:'Estándar de YouTube — el punto dulce'},
  {id:'480',label:'8 minutos',sub:'Profundo — permite anuncios a mitad'},
];
function esModoLargo(m){ m=m||sMode; return m==='profesor'||m==='relato'; }
function dursDe(m){ return esModoLargo(m)?DURS_LARGAS:DURS; }
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
// Angulos rotativos para el pilar HERRAMIENTAS DEL CAMINO -- el codigo asigna uno al azar
// para que cada guion ensene algo distinto y solo el cierre apunte al enlace (fin de la repeticion).
var HERRAM_ANGLES=[
  'Enseña UN error concreto y costoso que se comete al empezar sin guía (elige uno distinto: precio mal puesto, nicho mal elegido, meses construyendo algo que nadie pidió, seguir consejos contradictorios de internet, empezar sin sistema de ventas), desarrolla por qué frena todo y cómo se evita.',
  'Enseña UNA lección real del camino a la libertad financiera (el orden correcto de los pasos, por qué la mayoría del tiempo se pierde en lo que no genera, cómo saber si un negocio vale la pena antes de meterle meses) con sustancia aplicable.',
  'Compara los dos caminos: el que avanza con un sistema probado contra el que improvisa a golpes — qué hace distinto cada uno en sus primeros meses y a dónde llega cada uno en un año.',
  'Responde la objeción de que se puede solo: dale la razón — sí se puede — y muestra el precio real en años y errores de hacerlo sin mapa, con un ejemplo concreto del tipo de error que cuesta meses.',
  'Cuenta en primera persona UNA situación específica del camino (un estancamiento, una decisión equivocada, el día que entendiste el orden correcto de las cosas) y la lección exacta que dejó.',
  'Enseña a identificar en qué etapa está el espectador (empezando sin rumbo, atascado repitiendo errores, avanzando sin sistema) y qué necesita cada etapa para pasar a la siguiente.',
  'Destruye UN mito que retrasa a los que empiezan (que se necesita capital, que hay que esperar la idea perfecta, que consumir más información es avanzar) con argumentos concretos.',
  'Enseña el costo real de la información suelta: por qué acumular videos y consejos gratis sin un orden lleva años de vueltas, y qué cambia cuando el camino tiene estructura.',
];

// PUERTAS DE ENTRADA al tema. El codigo asigna una al azar en cada guion para que
// el modelo no entre siempre por el mismo sermon ("el sueldo es una trampa, se tu
// propio jefe"). No cambian el PILAR: cambian POR DONDE se abre.
var ENFOQUES=[
  'el dinero que ya pasa por sus manos cada mes y a dónde se le va sin que lo note.',
  'el tiempo como la moneda real que está gastando, y lo que ya no vuelve.',
  'una decisión concreta que lleva meses aplazando y el precio que paga por esperar.',
  'un hábito pequeño y diario que sostiene todo o lo hunde todo.',
  'la diferencia entre estar ocupado y estar avanzando de verdad.',
  'el miedo real que no admite en voz alta, y lo que le cuesta.',
  'lo que les está enseñando a los suyos sin darse cuenta, con el ejemplo y no con las palabras.',
  'la comodidad como el enemigo más silencioso: lo que no duele lo suficiente para cambiarlo.',
  'lo que hace cuando nadie lo está mirando, y por qué eso decide todo.',
  'la información que consume contra lo que de verdad ejecuta.',
  'compararse con otros y el pozo en el que eso lo mete.',
  'la deuda o el compromiso que lo mantiene atado y cómo se ve de verdad.',
  'la gente a su alrededor: quién lo empuja, quién lo frena y qué hace con eso.',
  'el largo plazo y la paciencia: lo que se construye lento contra lo que se busca rápido.',
  'el precio real de la seguridad que cree tener.',
  'empezar tarde: si vale la pena, y qué cambia cuando se arranca con años encima.',
  'una habilidad concreta que multiplica lo que vale y que no está desarrollando.',
  'lo que hace con lo que le sobra (o lo que cree que no le sobra) cada mes.',
];

// REGISTROS VISUALES: mundos de imagen muy distintos entre si. El CODIGO elige
// unos pocos al azar en cada generacion y se los pasa al modelo como territorio
// de partida. Es lo que impide que dos guiones seguidos caigan siempre en el
// mismo mundo (la bodega, la obra, la fabrica) por mucha libertad que se le de.
var VIS_REGISTROS=[
  'lo intimo y domestico: la casa de noche, la cocina, la mesa donde se hacen las cuentas, la familia dormida, el cuarto antes de que amanezca',
  'la calle y la ciudad real: el transporte publico, la acera, el trafico a la hora pico, la gente caminando, la parada donde se espera',
  'el mundo del empleo por dentro: el cubiculo, la oficina de otro, la sala de juntas, el reloj marcando, el pasillo, la fila para entrar',
  'el detalle cerrado: las manos, un objeto que lo cuenta todo, el dinero contado, el telefono, la libreta, la puerta, las llaves — sin mostrar el rostro',
  'la soledad y la reflexion: una sola figura pequena en un espacio muy amplio, la espalda, el silencio, la distancia',
  'las personas alrededor: un cliente, un socio, un hijo, un padre, alguien a quien se le ensena, una conversacion cara a cara',
  'lo logrado con sobriedad: un espacio propio en calma, ordenado y digno, sin lujo ostentoso, luz suave',
  'el mismo lugar en dos tiempos: el contraste entre lo que era y lo que es, el antes y el despues dentro de un mismo encuadre',
  'el aire libre: un amanecer, una carretera, una azotea, el horizonte de la ciudad a lo lejos, un descampado',
  'la composicion conceptual con objetos reales: una mesa, una silla vacia, una ventana, una sombra larga — fuerza simbolica sin salirse del mundo real',
  'la rutina que se repite: el mismo trayecto, el mismo gesto, la misma hora, mostrado como un ciclo que aprieta',
  'el momento de la decision: el umbral, la salida, el sobre sobre la mesa, el instante justo antes de cambiar algo',
  // Con 12 mundos y 3 por guion, dos guiones seguidos compartian mundo casi
  // siempre. Estos 12 mas abren territorio nuevo sin salirse de la marca.
  'el oficio y las manos que trabajan: la herramienta gastada, el mostrador, el taller pequeno, el delantal, el gesto repetido mil veces con orgullo',
  'el aprendizaje a solas: los libros de segunda mano, la pantalla de madrugada, los apuntes, el cuaderno lleno de numeros, aprender lo que nadie enseno',
  'la espera y el tramite: la sala de espera, el numero en la mano, la ventanilla, la fila del banco, el tiempo que se va sentado',
  'el cuerpo que aguanta: el cansancio real, la espalda, los ojos, las manos sucias, el sudor, dormir poco y levantarse igual',
  'la mesa compartida: comer con los suyos, la conversacion dificil, la silla vacia, la cena en silencio, quien depende de el',
  'el dinero como objeto fisico: los billetes contados, el sobre, la alcancia, el recibo, la calculadora, la deuda escrita en un papel',
  'la ciudad de arriba: el edificio de cristal visto desde abajo, las oficinas encendidas de noche, el ascensor, la vista desde un piso alto',
  'los margenes de la ciudad: el barrio, el taller de la esquina, el mercado, la bodega del vecino, donde de verdad empieza todo',
  'el movimiento y la salida: el carro cargado, la maleta, la carretera de noche, la estacion, irse de un sitio para llegar a otro',
  'el trato entre dos: el apreton de manos, la negociacion, el que pide y el que da, la mirada que decide, el contrato sobre la mesa',
  'el paso del tiempo: el calendario, la foto vieja, la ropa que ya no queda, el mismo lugar diez anos despues, las canas',
  'lo que se construye con las manos: los cimientos, la pared a medias, el plano extendido, la llave nueva, algo que antes no existia',
];

var SCHED_POOL=[
  {t:'libertad',concept:'Tu finca te da de comer, pero te tiene preso; así se cambia eso',h:'afirmacion'},
  {t:'libertad',concept:'El día que tu negocio facturó sin que tú abrieras la puerta',h:'historia'},
  {t:'libertad',concept:'¿Tu local sobrevive una semana si tú no apareces?',h:'pregunta'},
  {t:'mentalidad',concept:'Trabajar con las manos no es el problema; no soltar nunca sí lo es',h:'afirmacion'},
  {t:'mentalidad',concept:'El dueño que no se deja reemplazar nunca deja de ser empleado',h:'afirmacion'},
  {t:'sistema',concept:'Escribe cómo haces tu trabajo y acabas de crear tu primer activo',h:'pasos'},
  {t:'sistema',concept:'Cómo entrenar a alguien para que haga tu oficio igual que tú',h:'pasos'},
  {t:'sistema',concept:'El manual de operaciones: el papel que convierte tu local en empresa',h:'dato'},
  {t:'sistema',concept:'Deja de ser el mejor empleado de tu propio taller',h:'afirmacion'},
  {t:'marca',concept:'Vendes el grano barato; tostado y con tu marca vale cinco veces más',h:'dato'},
  {t:'marca',concept:'Por qué el intermediario gana más que tú con tu propio trabajo',h:'pregunta'},
  {t:'inversion',concept:'La tierra que trabajas puede pagarte sin que la trabajes',h:'afirmacion'},
  {t:'negocio',concept:'Vender directo al cliente final: el margen que el intermediario te roba',h:'pasos'},
  {t:'negocio',concept:'Cómo pasar de vender tu cosecha a vender tu producto',h:'pasos'},
  {t:'negocio',concept:'El primer empleado no es un gasto, es tu salida',h:'afirmacion'},
  {t:'millonario',concept:'Un local que funciona solo se convierte en diez; tú solo eres el dueño',h:'afirmacion'},
  {t:'millonario',concept:'Cómo se replica un negocio físico con gerentes en vez de tus horas',h:'pasos'},
  {t:'millonario',concept:'Las cadenas no crecieron con más horas del dueño, sino con procesos',h:'dato'},
  {t:'libertad',concept:'Por qué tu salario tiene un techo y tu tiempo jamás va a escalar',h:'dato'},
  {t:'libertad',concept:'La cuenta exacta: cuánto ingreso pasivo necesitas para renunciar sin miedo',h:'pasos'},
  {t:'libertad',concept:'El empleo te paga una vez por un trabajo; un activo te paga para siempre',h:'afirmacion'},
  {t:'libertad',concept:'¿Cuántos años más vas a cambiar tu vida por una quincena?',h:'pregunta'},
  {t:'libertad',concept:'El día que mi dinero empezó a trabajar más horas que yo',h:'historia'},
  {t:'libertad',concept:'La seguridad del empleo es la trampa más cara que vas a pagar',h:'afirmacion'},
  {t:'libertad',concept:'Tres fuentes de ingreso que siguen pagando mientras duermes',h:'pasos'},
  {t:'libertad',concept:'Ser libre es que tu ausencia no le cueste dinero a tu negocio',h:'afirmacion'},
  {t:'libertad',concept:'¿Tu negocio te dio libertad o te compraste un empleo peor?',h:'pregunta'},
  {t:'libertad',concept:'El número real: cuánto capital necesitas para que los intereses te mantengan',h:'dato'},
  {t:'libertad',concept:'Renunciar sin un sistema de ingresos es un suicidio financiero',h:'afirmacion'},
  {t:'libertad',concept:'Cómo reemplazar tu sueldo con ingresos que no dependen de tu presencia',h:'pasos'},
  {t:'libertad',concept:'La diferencia brutal entre estar ocupado y ser libre',h:'afirmacion'},
  {t:'libertad',concept:'Empecé vendiendo mi tiempo; hoy vendo sistemas que trabajan sin mí',h:'historia'},
  {t:'libertad',concept:'¿Por qué sigues financiando la libertad de tu jefe con la tuya?',h:'pregunta'},
  {t:'libertad',concept:'El activo más rentable no es una acción, es un sistema que opera solo',h:'dato'},
  {t:'libertad',concept:'Cómo diseñar tu salida del empleo en 24 meses, paso a paso',h:'pasos'},
  {t:'libertad',concept:'La libertad no se compra con más horas, se compra con mejores sistemas',h:'afirmacion'},
  {t:'mentalidad',concept:'La disciplina te da lo que la motivación te promete y nunca cumple',h:'afirmacion'},
  {t:'mentalidad',concept:'¿Cuántas horas al día construyes algo tuyo y cuántas algo de otro?',h:'pregunta'},
  {t:'mentalidad',concept:'El hábito de una hora al día que separa al dueño del empleado',h:'pasos'},
  {t:'mentalidad',concept:'Por qué piensas en pequeño y cómo romper ese techo mental',h:'dato'},
  {t:'mentalidad',concept:'El día que dejé de buscar motivación y empecé a construir sistemas',h:'historia'},
  {t:'mentalidad',concept:'La incomodidad de hoy es el precio exacto de la libertad de mañana',h:'afirmacion'},
  {t:'mentalidad',concept:'Cómo tomar decisiones como alguien que ya es libre',h:'pasos'},
  {t:'mentalidad',concept:'¿Estás construyendo un activo o solo estás ocupado?',h:'pregunta'},
  {t:'mentalidad',concept:'Tu mente sigue pensando como empleado y por eso sigues atrapado',h:'afirmacion'},
  {t:'mentalidad',concept:'El error mental que te hace confundir esfuerzo con progreso',h:'dato'},
  {t:'mentalidad',concept:'Cómo blindar tu enfoque cuando nadie te está vigilando',h:'pasos'},
  {t:'mentalidad',concept:'La paciencia del que construye vence a la prisa del que persigue',h:'afirmacion'},
  {t:'mentalidad',concept:'¿Por qué abandonas justo antes de que el sistema empiece a rendir?',h:'pregunta'},
  {t:'mentalidad',concept:'Dejé de celebrar estar ocupado y empecé a medir lo que se automatiza',h:'historia'},
  {t:'mentalidad',concept:'El pensamiento de dueño: cómo delegar antes de sentirte listo',h:'pasos'},
  {t:'mentalidad',concept:'El disciplinado aburrido termina más rico que el brillante caótico',h:'afirmacion'},
  {t:'mentalidad',concept:'Cómo entrenar tu cabeza para pensar en sistemas, no en tareas',h:'pasos'},
  {t:'mentalidad',concept:'Lo barato que pagas por comodidad hoy te cuesta la libertad mañana',h:'dato'},
  {t:'sistema',concept:'Cómo convertir tu trabajo repetitivo en un proceso que corre solo',h:'pasos'},
  {t:'sistema',concept:'Si el negocio se cae cuando te enfermas, no tienes un negocio',h:'afirmacion'},
  {t:'sistema',concept:'El primer proceso que debes documentar para poder delegar',h:'pasos'},
  {t:'sistema',concept:'¿Tu negocio funciona sin ti un mes entero? Esa es la única prueba',h:'pregunta'},
  {t:'sistema',concept:'Por qué automatizar el cobro es lo primero que te compra libertad',h:'dato'},
  {t:'sistema',concept:'La diferencia entre trabajar EN el negocio y trabajar SOBRE el negocio',h:'afirmacion'},
  {t:'sistema',concept:'Cómo pasar de hacerlo todo a que un sistema lo haga por ti',h:'pasos'},
  {t:'sistema',concept:'El día que mi negocio facturó sin que yo tocara un teclado',h:'historia'},
  {t:'sistema',concept:'Tres tareas que puedes automatizar esta semana casi sin gastar',h:'pasos'},
  {t:'sistema',concept:'Se estancan porque confunden estar presentes con ser necesarios',h:'dato'},
  {t:'sistema',concept:'Documenta, delega, automatiza: el orden que casi nadie respeta',h:'pasos'},
  {t:'sistema',concept:'¿Eres el dueño o el empleado mejor pagado de tu propio negocio?',h:'pregunta'},
  {t:'sistema',concept:'Un sistema mediocre que corre solo vence a un genio que hace todo',h:'afirmacion'},
  {t:'sistema',concept:'Cómo lograr que un empleado promedio dé resultados de experto',h:'pasos'},
  {t:'sistema',concept:'Empecé haciéndolo todo; el negocio creció cuando dejé de ser indispensable',h:'historia'},
  {t:'sistema',concept:'La automatización separa al que escala del que muere agotado',h:'afirmacion'},
  {t:'sistema',concept:'El activo oculto de tu negocio son sus procesos, no tú',h:'dato'},
  {t:'sistema',concept:'Cómo diseñar un negocio para poder venderlo o dejarlo desde el día uno',h:'pasos'},
  {t:'herramientas',concept:'Recorrí este camino solo y me costó años; por eso armé la guía que me faltó',h:'historia'},
  {t:'herramientas',concept:'¿Cuánto tiempo más vas a tropezar solo si el mapa ya existe?',h:'pregunta'},
  {t:'herramientas',concept:'Los errores que cometí por avanzar sin sistema, y cómo evitártelos',h:'pasos'},
  {t:'herramientas',concept:'Solo sí se puede, pero sin guía el camino te va a cobrar años de tu vida',h:'afirmacion'},
  {t:'herramientas',concept:'Lo que separa al que avanza con herramientas del que da vueltas solo',h:'dato'},
  {t:'herramientas',concept:'¿Por qué sigues juntando respuestas sueltas si ya reuní todo el camino?',h:'pregunta'},
  {t:'herramientas',concept:'Reuní en un solo lugar lo que a mí me tomó años entender',h:'historia'},
  {t:'herramientas',concept:'Si llegaste hasta aquí, necesitas el empujón; lo dejé listo en el enlace',h:'afirmacion'},
  {t:'herramientas',concept:'El atajo honesto no es hacerlo rápido, es no repetir mis errores',h:'afirmacion'},
  {t:'herramientas',concept:'Lo que te falta no es esfuerzo, es el orden correcto de los pasos',h:'dato'},
  {t:'herramientas',concept:'Deja de improvisar tu libertad; el plan ya está en el enlace',h:'afirmacion'},
  {t:'herramientas',concept:'¿Vas a seguir pagando con años lo que resuelves con una guía?',h:'pregunta'},
  {t:'herramientas',concept:'Construí la herramienta que yo habría pagado por tener cuando empecé',h:'historia'},
  {t:'herramientas',concept:'El camino sin mapa no es más valiente, solo es más lento',h:'afirmacion'},
  {t:'herramientas',concept:'Todo lo que aprendí a los golpes, ordenado para que a ti no te pase',h:'pasos'},
  {t:'marca',concept:'Por qué tu nombre en internet vale más que tu currículum',h:'dato'},
  {t:'marca',concept:'¿De qué sirve ser el mejor si nadie sabe que existes?',h:'pregunta'},
  {t:'marca',concept:'Tu contenido es un activo que sigue vendiendo años después de publicarlo',h:'afirmacion'},
  {t:'marca',concept:'Cómo construir autoridad desde cero sin ser famoso',h:'pasos'},
  {t:'marca',concept:'Empecé grabando sin que nadie mirara; eso hoy me genera ingresos',h:'historia'},
  {t:'marca',concept:'El experto no es el que más sabe, es el que más se muestra',h:'afirmacion'},
  {t:'marca',concept:'Cómo convertir seguidores en un sistema de ingresos, no en aplausos',h:'pasos'},
  {t:'marca',concept:'Un video que grabas en una hora puede venderte durante años',h:'dato'},
  {t:'marca',concept:'¿Estás construyendo audiencia o solo persiguiendo likes?',h:'pregunta'},
  {t:'marca',concept:'Documenta tu proceso hoy aunque nadie mire; mañana es tu activo',h:'pasos'},
  {t:'marca',concept:'Tu marca personal trabaja mientras duermes si la construyes bien',h:'afirmacion'},
  {t:'marca',concept:'Cómo monetizar tu conocimiento sin cambiarlo por horas',h:'pasos'},
  {t:'marca',concept:'La atención es la nueva moneda; aprende a convertirla en dinero',h:'dato'},
  {t:'marca',concept:'Dejé de vender mi tiempo y empecé a vender lo que ya había grabado',h:'historia'},
  {t:'marca',concept:'Una audiencia pequeña y fiel paga más que una masa que no te conoce',h:'dato'},
  {t:'marca',concept:'Construye una vez, vende mil veces: la lógica de la marca personal',h:'afirmacion'},
  {t:'inversion',concept:'El primer activo que deberías construir antes de los 35',h:'dato'},
  {t:'inversion',concept:'Tu dinero parado en el banco pierde valor mientras duermes',h:'dato'},
  {t:'inversion',concept:'La diferencia entre ahorrar e invertir que nadie te explica bien',h:'pregunta'},
  {t:'inversion',concept:'Cómo empezar a invertir con poco y dejar que el tiempo haga el trabajo',h:'pasos'},
  {t:'inversion',concept:'El interés compuesto es el único empleado que nunca se cansa',h:'afirmacion'},
  {t:'inversion',concept:'Reinvertir es incómodo hoy y liberador dentro de diez años',h:'afirmacion'},
  {t:'inversion',concept:'¿Construyes activos o solo acumulas gastos con nombre bonito?',h:'pregunta'},
  {t:'inversion',concept:'Cómo hacer que tu dinero genere más dinero sin que tú trabajes más',h:'pasos'},
  {t:'inversion',concept:'Empecé invirtiendo lo que gastaba en tonterías; hoy eso me paga',h:'historia'},
  {t:'inversion',concept:'La regla del capital: primero compra activos, después compra lujos',h:'afirmacion'},
  {t:'inversion',concept:'El que invierte temprano vence al que gana más y empieza tarde',h:'dato'},
  {t:'inversion',concept:'Diversificar no es tener de todo, es no depender de una sola fuente',h:'afirmacion'},
  {t:'inversion',concept:'Cómo construir un portafolio que te pague sin vender tu tiempo',h:'pasos'},
  {t:'inversion',concept:'El activo más ignorado: un negocio con sistemas que puedes vender',h:'dato'},
  {t:'inversion',concept:'¿Tu dinero trabaja para ti o tú sigues trabajando para gastarlo?',h:'pregunta'},
  {t:'negocio',concept:'Cómo vender sin sentirte vendedor ni perseguir a nadie',h:'pregunta'},
  {t:'negocio',concept:'Por qué tu negocio no crece, y no es por falta de dinero',h:'dato'},
  {t:'negocio',concept:'El modelo de negocio más simple que escala y que casi nadie usa',h:'afirmacion'},
  {t:'negocio',concept:'Tu primer cliente sin gastar un peso en publicidad',h:'pasos'},
  {t:'negocio',concept:'Cómo cobrar por resultado en lugar de por hora',h:'pasos'},
  {t:'negocio',concept:'La suscripción: vende una vez, cobra para siempre',h:'dato'},
  {t:'negocio',concept:'¿Vendes productos o cambiaste tu tiempo por un ingreso con más pasos?',h:'pregunta'},
  {t:'negocio',concept:'Empecé vendiendo servicios; escalé cuando los convertí en producto',h:'historia'},
  {t:'negocio',concept:'Un margen alto te da libertad; un volumen bajo te esclaviza',h:'afirmacion'},
  {t:'negocio',concept:'Cómo construir un sistema de ventas que no dependa de ti cerrando',h:'pasos'},
  {t:'negocio',concept:'El precio no es lo que cobras, es lo que comunica tu autoridad',h:'dato'},
  {t:'negocio',concept:'Productiza tu servicio: cóbralo una vez, entrégalo mil veces',h:'pasos'},
  {t:'negocio',concept:'¿Tu negocio escala o solo escala tu cansancio?',h:'pregunta'},
  {t:'negocio',concept:'La estructura comercial que convierte un servicio en una máquina',h:'afirmacion'},
  {t:'negocio',concept:'Cómo pasar de vender horas a vender un sistema que resuelve',h:'pasos'},
  {t:'millonario',concept:'La mentalidad que separa al que construye millones del que solo trabaja',h:'afirmacion'},
  {t:'millonario',concept:'Cómo piensan los que construyen negocios que no dependen de ellos',h:'pregunta'},
  {t:'millonario',concept:'Los tres pilares que comparten todos los negocios que escalan',h:'pasos'},
  {t:'millonario',concept:'El momento exacto en que un negocio deja de depender de su dueño',h:'historia'},
  {t:'millonario',concept:'Pensar en grande es la única estrategia sensata a largo plazo',h:'afirmacion'},
  {t:'millonario',concept:'Lo que separa un negocio de seis cifras de uno de siete: los sistemas',h:'dato'},
  {t:'millonario',concept:'Cómo escalar sin destruirte en el intento',h:'pasos'},
  {t:'millonario',concept:'La riqueza no se construye con más horas, se construye con apalancamiento',h:'afirmacion'},
  {t:'millonario',concept:'¿Estás construyendo un negocio o un empleo que se ve grande?',h:'pregunta'},
  {t:'millonario',concept:'El apalancamiento: dinero, sistemas y gente trabajando por ti',h:'dato'},
  {t:'millonario',concept:'Cómo construir algo que puedas vender, no algo de lo que no puedas salir',h:'pasos'},
  {t:'millonario',concept:'Los ricos compran tiempo; los pobres lo venden barato',h:'afirmacion'},
  {t:'millonario',concept:'Empecé pensando en sobrevivir; escalé cuando pensé en sistemas',h:'historia'},
  {t:'millonario',concept:'Por qué la riqueza real es aburrida, lenta y sistemática',h:'dato'},
  {t:'millonario',concept:'Cómo pensar en décadas cuando todos piensan en la próxima quincena',h:'afirmacion'},
];




// Los dos modos LARGOS comparten la misma cabecera de marca que los cortos, pero
// cambian por completo la estructura: aqui no se trata de golpear en 30 segundos
// sino de sostener a alguien varios minutos.
function reglaTiempo(){
  return `EN QUÉ TIEMPO SE LE HABLA (regla firme, por encima de todo lo demás):

LO ÚNICO PROHIBIDO es darle al espectador un pasado por hecho. Él no ha vivido lo que tú te inventes.
MAL: "hace años creías tener todo bajo control", "ese martes viste cómo despedían a tu compañero", "tomaste la decisión", "registraste tu empresa", "estuviste a punto de rendirte mil veces", "decidiste sistematizar".
Eso le cuenta al que mira una vida que no es la suya, y en cuanto no le cuadra deja de creerte.

LA MISMA ESCENA, BIEN DICHA — esto es exactamente lo que se espera:
MAL: "Estuviste a punto de rendirte mil veces. El cansancio te pedía volver a la comodidad de lo predecible. Decidiste sistematizar."
BIEN: "Vas a estar a punto de rendirte mil veces. El cansancio te va a pedir volver a la comodidad de lo predecible, y abandonar se va a sentir como descansar. Ahí es donde tienes que sistematizar en vez de seguir haciéndolo todo a mano."
Fíjate en lo que cambia: el mismo contenido, los mismos detalles, la misma emoción — pero por delante de él, no por detrás.

HABLÁNDOLE A ÉL (segunda persona) tienes TRES tiempos, y los tres valen:
- PRESENTE: lo que le está pasando hoy. "Cada mes se te va el sueldo y no sabes en qué."
- FUTURO Y ANTICIPACIÓN: lo que le va a pasar cuando lo intente. "Vas a...", "cuando estés...", "llegará el día en que...", "te va a pedir...". Aquí es donde va la carne del camino: el cansancio, la duda, quién no lo va a entender.
- IMPERATIVO: lo que tiene que hacer. "Lo que tienes que hacer es...", "el primer paso es...", "empieza por...", "deja de...".

EL PASADO SÍ SE USA, en dos casos, y ahí es libre:
- PRIMERA PERSONA (yo): el que habla cuenta algo suyo. El gancho de Historia Personal va así.
- TERCERA PERSONA: se cuenta lo de otro — "un hombre de 40 años", "el que llevaba veinte años en el mismo turno", sin nombre propio.
En los dos casos el espectador ESCUCHA la historia; no es él quien la vivió. Y cuando la historia termina, se vuelve a él.

Y UNA HISTORIA NO TIENE QUE IR EN PASADO POR SER UNA HISTORIA: se puede contar en presente, como si estuviera ocurriendo ahora ("son las dos de la mañana y sigue delante de la pantalla"), o en futuro, como algo que todavía no pasa. Elige el tiempo que más golpee — la única condición es la de arriba.

`;
}

function cabeceraLarga(){
  return `CANAL: LEGADO DE HIERRO — video largo para YouTube. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach, pero nunca fría ni tiesa. Sin porcentajes inventados. Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que quiere más de lo que tiene hoy y sabe que depende de él. NO des por hecho su situación: puede estar empleado, puede tener ya algo propio, puede estar arrancando. No lo trates como una víctima ni le supongas un jefe al que culpar.

SIN RESENTIMIENTO (regla firme): este canal NO ataca a nadie. Nada de pintar al jefe, al empresario o al que ganó más como el villano. PROHIBIDO el encuadre de "trabajas para hacer rico a otro" y cualquier variante. Al que ya lo logró se le respeta. El único adversario del espectador es él mismo.

` + reglaTiempo();
}

function buildSP(mode){
  mode=mode||sMode;

  // ---------------- MODO PROFESOR (video largo) ----------------
  // La idea: ENSEÑAR un método concreto para ganar, cuidar o hacer crecer el
  // dinero. No es motivación: es una clase. Si el espectador no puede aplicar
  // algo el lunes por la mañana, el video no sirve.
  if(mode==='profesor')return cabeceraLarga()+`ESTE ES EL MODO PROFESOR: una CLASE. El protagonista enseña, no arenga.

QUÉ SE ENSEÑA (obligatorio): UN método concreto y aplicable sobre dinero — cómo ahorrar de verdad, cómo ordenar las cuentas, cómo poner precio, cómo empezar a invertir con poco, cómo montar un servicio que ya funciona, cómo salir de una deuda, cómo cobrar por valor y no por horas, cómo elegir en qué negocio meterse. UN solo método por video, desarrollado hasta el final.

REGLA DE UTILIDAD: al terminar, el espectador tiene que poder HACER algo concreto. Nada de "sé disciplinado" o "cambia tu mentalidad": eso es de los reels. Aquí se dan pasos, números, ejemplos y errores a evitar. Si lo que dices se puede resumir en una frase de cartel, no es una clase.

HONESTIDAD: no prometas cifras concretas de ganancia ni plazos ("gana 1000 al mes en 30 días"). Habla de lo que el método hace y de lo que exige. Di también cuándo NO funciona y a quién no le sirve. Eso es lo que separa a un profesor de un vendedor de humo.

ESTRUCTURA DEL GUION:
1. GANCHO (0-15s): el problema concreto que este método resuelve, en la piel del espectador.
2. PROMESA: qué va a saber hacer al terminar. Clara y sin exagerar.
3. EL MÉTODO: los pasos, en orden, numerados al hablar ("el primero", "el segundo"). Cada paso con QUÉ es, POR QUÉ importa y CÓMO se hace.
4. EJEMPLO REAL: el método aplicado a un caso concreto y creíble, con números redondos.
5. LOS ERRORES: dos o tres fallos típicos al aplicarlo.
6. CIERRE: el primer paso que puede dar hoy mismo, y la invitación a seguir el canal.

BLOQUE A
[El guion hablado en español, completo, de la duración pedida. Numera los pasos al hablar. Termina con: Legado de Hierro.]

BLOQUE C
[Aquí NO se piden escenas sueltas. Se pide un SET y unas TOMAS, como en una clase filmada de verdad.]
SET: [UN solo lugar donde el protagonista da la clase — su oficina, un estudio sobrio, una sala con pizarra. Descríbelo una vez, con detalle: muebles, luz, qué hay al fondo. TODAS las tomas ocurren aquí y tienen que verse como el mismo sitio.]
TOMA 1: [el protagonista hablando a cámara, plano medio, de frente]
TOMA 2: [el mismo momento desde otro ángulo — de perfil, escorzo o más abierto]
TOMA 3: [plano cerrado del rostro o de las manos explicando]
TOMA 4: [plano del protagonista junto a la pizarra o señalando algo del set]
TOMA 5: [plano general del set, el protagonista pequeño en el espacio]
LOS EJEMPLOS SON DE OTRA GENTE, NO DEL PROFESOR (regla firme): el que da la clase NO aparece en los ejemplos. En un ejemplo se ve a OTRA persona haciéndolo bien o metiendo la pata — alguien del reparto, o una persona cualquiera sin nombre. Si el profesor sale en la escena del error, deja de ser el profesor y pasa a ser uno más que también está perdido; y el espectador tiene que verse a SÍ MISMO en esa escena, no al que le está enseñando. Escribe cada EJEMPLO indicando quién sale y que NO es el protagonista.
EJEMPLO 1: [una escena FUERA del set, con OTRA persona, que ilustre el primer paso hecho bien]
EJEMPLO 2: [otra escena, con otra persona distinta, que ilustre otro paso]
EJEMPLO 3: [otra escena, con otra persona, que ilustre el error típico o el resultado]

BLOQUE M
[EL MONTAJE: en qué orden se ven las tomas y los ejemplos a lo largo del video. Las TOMAS SE REPITEN — así es como se filma una clase: se vuelve a la cara del que habla entre ejemplo y ejemplo. Escribe una línea por corte, en orden, con el número de segundo en que entra. Alterna: nunca dos veces seguidas la misma toma. Cubre TODA la duración del guion.]
0s: TOMA 1
12s: EJEMPLO 1
20s: TOMA 3
[...sigue hasta cubrir el guion entero]`;

  // ---------------- MODO RELATO (video largo) ----------------
  if(mode==='relato')return cabeceraLarga()+`ESTE ES EL MODO RELATO: una historia larga, contada con calma.

QUÉ ES: el recorrido completo de alguien que cambió algo de su vida — no un consejo, una HISTORIA con principio, nudo y final. El espectador se queda porque quiere saber cómo termina.

DE QUÉ TRATA: lo dicta el PILAR y el CONCEPTO. Puede ser levantar algo propio, salir de una deuda, ganarse una disciplina, sostener una decisión difícil, o aprender algo por las malas. No lo conviertas en una historia de negocios si el pilar no va de eso.

CÓMO SE CUENTA: elige una de estas tres formas, la que mejor le venga a ESTE relato. No siempre la misma.
- DE OTRO, en tercera persona: "un hombre de 40 años", "el que llevaba veinte años en el mismo turno". Sin nombre propio. En pasado, o en presente como si estuviera ocurriendo ahora.
- EN PRIMERA PERSONA: el que habla cuenta algo suyo, con lo que le costó.
- HACIA DELANTE, hablándole a él en futuro: el camino que va a recorrer si se decide. "Vas a...", "cuando llegues a...", "el día que...".
LO QUE NO PUEDE SER: contárselo a él en pasado, como si ya lo hubiera vivido. Eso está prohibido en todo el canal.
Sea cual sea la forma, el CIERRE vuelve a él y le dice qué hacer.
SÍ pueden aparecer otras personas de su vida — el reparto del canal está más abajo — y de hecho una historia larga sin nadie más se hace plana.

ESTRUCTURA (los pasos son estos; el tiempo verbal de cada uno depende de la forma que elegiste arriba):
1. GANCHO (0-15s): AL ESPECTADOR, en presente. Lo que le está pasando a él hoy, en una frase que no pueda ignorar.
2. EL PUNTO DE PARTIDA: la situación concreta de la que se sale, con detalles de una vida real.
3. LO QUE SE ROMPE: el momento en que ya no se puede seguir igual.
4. LA DECISIÓN Y EL PRECIO: qué hay que hacer y qué cuesta. Aquí va la carne: lo que se pierde, quién duda, las veces que se está por dejarlo. Si le hablas a él, esto va en futuro y anticipación — "vas a", "cuando estés", "te va a pedir" — nunca en pasado.
5. EN QUÉ SE CONVIERTE: qué es distinto después. Sin fanfarria: mostrado en detalles pequeños.
6. Y AHORA TÚ: se vuelve al espectador, en presente y en imperativo. Qué tiene que hacer ÉL, empezando por el primer paso concreto. Esta parte NO es un resumen de la historia: es la orden de marcha.

RITMO: es largo, así que respira. Alterna frases cortas con otras más largas. Deja silencios donde la imagen habla sola.

BLOQUE A
[El guion hablado en español, completo, de la duración pedida. Termina con: Legado de Hierro.]

BLOQUE C
[Las escenas de la historia, EN ORDEN CRONOLÓGICO. Cada una es un momento del relato, no una ilustración suelta. La historia tiene que poder seguirse mirando solo las imágenes.]
LUGARES QUE SE REPITEN (obligatorio): si una escena ocurre en un sitio que YA sale en otra escena de este mismo guion — su cocina, su despacho, el portal, el taller — empieza ese prompt con [LUGAR: id-corto] usando SIEMPRE el mismo id para el mismo sitio (ej. [LUGAR: cocina]). El primer prompt que use un id describe ese sitio COMPLETO: paredes, muebles, objetos, luz. Los siguientes ya no lo describen entero, solo dicen qué pasa y desde dónde se ve. Los sitios que salen una sola vez NO llevan marca. Así el mismo sitio se ve igual en todas sus escenas en vez de cambiar de una a otra.
PROMPT 1: [la escena del gancho]
PROMPT 2: [de dónde viene]
[...una por cada momento importante, hasta el final]`;

  if(mode==='impacto')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que quiere más de lo que tiene hoy y sabe que depende de él. NO des por hecho su situación: puede estar empleado, puede tener ya algo propio, puede estar arrancando. No lo trates como una víctima ni le supongas un jefe al que culpar. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es sostenerlo.

SIN RESENTIMIENTO (regla firme): este canal NO ataca a nadie. Nada de pintar al jefe, al empresario, al que gana más o al que llegó primero como el villano. PROHIBIDO el encuadre de "trabajas para hacer rico a otro", "construyes el sueño de otro", "pagas con tus años la tranquilidad de otro" y cualquier variante. Al que ya lo logró se le respeta: hizo lo que había que hacer, y el objetivo es LLEGAR AHÍ, no despreciarlo. El único adversario del espectador es él mismo: su postergación, su miedo, su comodidad. Se habla de lo que él puede construir, jamás de lo que otro hace mal.

NORTE: el canal forja gente que toma el control de su dinero, su tiempo y su vida, y que construye algo propio. Ese norte es AMPLIO, no una sola consigna: cabe la disciplina y los hábitos, el dinero que ya gana y a dónde se le va, las deudas, el ahorro y la inversión, el valor del tiempo, la paciencia y el largo plazo, el miedo y el riesgo, las decisiones que se posponen, el entorno y la gente alrededor, las habilidades, la reputación, los sistemas, y lo que les deja a los que vienen detrás. Tu trabajo es encender la decisión, no dar recetas.

NO REPITAS SIEMPRE EL MISMO SERMÓN (crítico): el encuadre de "el sueldo es una trampa, renuncia y monta tu negocio para ser tu propio jefe" ya se usó demasiadas veces en este canal y está gastado. Puede aparecer, pero NO puede ser el marco por defecto de todos los guiones. La mayoría de las veces entra por otro lado: por el dinero que ya tiene en la mano, por el tiempo que no vuelve, por una decisión concreta que lleva meses aplazando, por un hábito, por el miedo real, por lo que le está enseñando a su hijo sin darse cuenta, por la diferencia entre estar ocupado y estar avanzando. Antes de dar el guion por bueno, léelo: si se resume en "deja de trabajar para otro y sé tu propio jefe", REESCRÍBELO entrando por otro ángulo.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA NO CAMBIAR: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

Y OJO, ESTO NO SIGNIFICA QUE TODO GUION VAYA DE EMPRENDER: solo se habla de montar algo propio cuando el PILAR o el CONCEPTO lo piden. Si el pilar va de carácter, de hábitos o de manejar el dinero, NO metas la idea de crear un negocio ni el final de "empieza lo tuyo": ahí no pinta nada y desvía el guion.

EL PILAR Y EL CONCEPTO MANDAN, POR ENCIMA DE TODO LO DEMÁS: el PILAR define EL TERRENO del guion y el CONCEPTO define exactamente de qué va. Respeta los dos al pie de la letra. NO arrastres el tema de un pilar a otro: si el pilar es MENTALIDAD, el guion NO es de libertad financiera —quien lo pidió habría elegido ese pilar si lo quisiera—. Y si el concepto que te dan es de ánimo y superación personal, el guion va de eso, no de dinero. Antes de darlo por bueno, léelo: si podría haber salido con cualquier otro pilar, está mal.
- LIBERTAD FINANCIERA: el tiempo contra el dinero, lo que cuesta seguir esperando, la independencia real y lo que exige construirla.
- MENTALIDAD Y DISCIPLINA: la cabeza y el carácter del que construye. Decisiones duras, hábitos, ejecución cuando nadie mira, la disciplina que queda cuando la motivación se va, creer en uno mismo y sostenerlo. AQUÍ NO SE HABLA de sueldos, jefes, empleos ni negocios: se habla de carácter. Es el pilar donde cabe el ánimo y el empuje — que termine creyendo que sí puede y con ganas de exigirse más.
- SISTEMAS Y AUTOMATIZACIÓN: que lo tuyo funcione sin ti. Dejar de ser la pieza que sostiene todo, delegar, salir de la operación.
- HERRAMIENTAS DEL CAMINO: primera persona. Enseña de verdad el ÁNGULO ASIGNADO que viene en el mensaje. Solo el cierre dirige al enlace del video, con palabras distintas cada vez. Prohibida la fórmula "ya construí todo, revisa el enlace" como único contenido. Sin precios ni nombre de producto.
- MARCA PERSONAL: tu nombre, tu presencia, tu autoridad. Que te conozcan es dinero.
- INVERSIÓN Y CAPITAL: que tu dinero trabaje por ti. Activos, reinversión, lo que cuesta tenerlo parado.
- NEGOCIO Y VENTAS: arrancar lo tuyo, vender sin miedo, la estructura que lo sostiene.
- NEGOCIOS MILLONARIOS: pensar en grande. Escalar con gente y sistemas, construir algo que valga y que te sobreviva. Una sola unidad no te hace millonario; multiplicarla sí. Visión de largo plazo, sin prometer millones.

EL GANCHO MANDA: el GANCHO que te dan define CÓMO entras. Respétalo, no lo cambies por otro. Máximo 12 palabras en la primera frase.
- Dato Crudo: entra con una cifra o un hecho concreto que destruya una creencia. Los datos que más retienen son los que muestran lo que él está PERDIENDO, no lo que podría ganar.
- Pregunta Disruptiva: entra con una pregunta que no pueda ignorar ni responder cómodamente. Que lo obligue a revisarse a sí mismo.
- Afirmación Polémica: entra con una verdad incómoda que divida opiniones y contradiga de frente lo que él cree. Es la fórmula más viral que existe.
- Historia Personal: entra en primera persona con una confesión concreta. Nadie se salta un secreto que alguien está a punto de contar.
- Lista de Pasos: promete el número exacto y cúmplelo. Adelanta el paso más fuerte en el gancho para que se quede a verlos todos.

MODO IMPACTO — 30 segundos, máximo 75 palabras:
Una sola verdad que golpea, sin desarrollo ni rodeos. Este formato es el que mejor rinde en el algoritmo: úsalo como una bofetada.

NIVEL DE CRUDEZA: frases cortas, de golpe seco, que le dicen a la cara algo que él sospecha y no se ha atrevido a decir en voz alta. Sin adornos, sin consuelo, sin metáforas bonitas. Dos frases máximo, sujeto y verbo, y que duela. Escríbelas tú: no repitas frases hechas.

VARIEDAD (obligatoria): cada guion debe sentirse distinto al anterior — otra entrada, otras imágenes, otra forma de armar las frases. Tienes libertad total dentro de estas reglas: úsala. Si lo que escribes suena a algo que ya se ha visto mil veces, cámbialo.

PROHIBIDO: "el secreto mejor guardado" en cualquier variante. Porcentajes genéricos. Calcos del inglés. Repetir la misma frase de cierre de otro guion.
CIERRE: duro y con fuego, cerrando el círculo con la primera frase. Sin promesas falsas ni consuelo barato, pero la última línea debe ENCENDER, no enfriar. Termina con: Legado de Hierro.
` + reglaTiempo() + `FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Máximo 75 palabras. Termina con: Legado de Hierro.]

BLOQUE C
[3 prompts. Cada uno: UNA acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje — solo qué hace y dónde. Entorno diferente en cada prompt.]
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]`;

  if(mode==='historia')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que quiere más de lo que tiene hoy y sabe que depende de él. NO des por hecho su situación: puede estar empleado, puede tener ya algo propio, puede estar arrancando. No lo trates como una víctima ni le supongas un jefe al que culpar. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es sostenerlo.

SIN RESENTIMIENTO (regla firme): este canal NO ataca a nadie. Nada de pintar al jefe, al empresario, al que gana más o al que llegó primero como el villano. PROHIBIDO el encuadre de "trabajas para hacer rico a otro", "construyes el sueño de otro", "pagas con tus años la tranquilidad de otro" y cualquier variante. Al que ya lo logró se le respeta: hizo lo que había que hacer, y el objetivo es LLEGAR AHÍ, no despreciarlo. El único adversario del espectador es él mismo: su postergación, su miedo, su comodidad. Se habla de lo que él puede construir, jamás de lo que otro hace mal.

NORTE: el canal forja gente que toma el control de su dinero, su tiempo y su vida, y que construye algo propio. Ese norte es AMPLIO, no una sola consigna: cabe la disciplina y los hábitos, el dinero que ya gana y a dónde se le va, las deudas, el ahorro y la inversión, el valor del tiempo, la paciencia y el largo plazo, el miedo y el riesgo, las decisiones que se posponen, el entorno y la gente alrededor, las habilidades, la reputación, los sistemas, y lo que les deja a los que vienen detrás. Tu trabajo es encender la decisión, no dar recetas.

NO REPITAS SIEMPRE EL MISMO SERMÓN (crítico): el encuadre de "el sueldo es una trampa, renuncia y monta tu negocio para ser tu propio jefe" ya se usó demasiadas veces en este canal y está gastado. Puede aparecer, pero NO puede ser el marco por defecto de todos los guiones. La mayoría de las veces entra por otro lado: por el dinero que ya tiene en la mano, por el tiempo que no vuelve, por una decisión concreta que lleva meses aplazando, por un hábito, por el miedo real, por lo que le está enseñando a su hijo sin darse cuenta, por la diferencia entre estar ocupado y estar avanzando. Antes de dar el guion por bueno, léelo: si se resume en "deja de trabajar para otro y sé tu propio jefe", REESCRÍBELO entrando por otro ángulo.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA NO CAMBIAR: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

Y OJO, ESTO NO SIGNIFICA QUE TODO GUION VAYA DE EMPRENDER: solo se habla de montar algo propio cuando el PILAR o el CONCEPTO lo piden. Si el pilar va de carácter, de hábitos o de manejar el dinero, NO metas la idea de crear un negocio ni el final de "empieza lo tuyo": ahí no pinta nada y desvía el guion.

EL PILAR Y EL CONCEPTO MANDAN, POR ENCIMA DE TODO LO DEMÁS: el PILAR define EL TERRENO del guion y el CONCEPTO define exactamente de qué va. Respeta los dos al pie de la letra. NO arrastres el tema de un pilar a otro: si el pilar es MENTALIDAD, el guion NO es de libertad financiera —quien lo pidió habría elegido ese pilar si lo quisiera—. Y si el concepto que te dan es de ánimo y superación personal, el guion va de eso, no de dinero. Antes de darlo por bueno, léelo: si podría haber salido con cualquier otro pilar, está mal.
- LIBERTAD FINANCIERA: el tiempo contra el dinero, lo que cuesta seguir esperando, la independencia real y lo que exige construirla.
- MENTALIDAD Y DISCIPLINA: la cabeza y el carácter del que construye. Decisiones duras, hábitos, ejecución cuando nadie mira, la disciplina que queda cuando la motivación se va, creer en uno mismo y sostenerlo. AQUÍ NO SE HABLA de sueldos, jefes, empleos ni negocios: se habla de carácter. Es el pilar donde cabe el ánimo y el empuje — que termine creyendo que sí puede y con ganas de exigirse más.
- SISTEMAS Y AUTOMATIZACIÓN: que lo tuyo funcione sin ti. Dejar de ser la pieza que sostiene todo, delegar, salir de la operación.
- HERRAMIENTAS DEL CAMINO: primera persona. Enseña de verdad el ÁNGULO ASIGNADO que viene en el mensaje. Solo el cierre dirige al enlace del video, con palabras distintas cada vez. Prohibida la fórmula "ya construí todo, revisa el enlace" como único contenido. Sin precios ni nombre de producto.
- MARCA PERSONAL: tu nombre, tu presencia, tu autoridad. Que te conozcan es dinero.
- INVERSIÓN Y CAPITAL: que tu dinero trabaje por ti. Activos, reinversión, lo que cuesta tenerlo parado.
- NEGOCIO Y VENTAS: arrancar lo tuyo, vender sin miedo, la estructura que lo sostiene.
- NEGOCIOS MILLONARIOS: pensar en grande. Escalar con gente y sistemas, construir algo que valga y que te sobreviva. Una sola unidad no te hace millonario; multiplicarla sí. Visión de largo plazo, sin prometer millones.

EL GANCHO MANDA: el GANCHO que te dan define CÓMO entras. Respétalo, no lo cambies por otro. Máximo 12 palabras en la primera frase.
- Dato Crudo: entra con una cifra o un hecho concreto que destruya una creencia. Los datos que más retienen son los que muestran lo que él está PERDIENDO, no lo que podría ganar.
- Pregunta Disruptiva: entra con una pregunta que no pueda ignorar ni responder cómodamente. Que lo obligue a revisarse a sí mismo.
- Afirmación Polémica: entra con una verdad incómoda que divida opiniones y contradiga de frente lo que él cree. Es la fórmula más viral que existe.
- Historia Personal: entra en primera persona con una confesión concreta. Nadie se salta un secreto que alguien está a punto de contar.
- Lista de Pasos: promete el número exacto y cúmplelo. Adelanta el paso más fuerte en el gancho para que se quede a verlos todos.

MODO HISTORIA — el arco del que cambia:
Un recorrido con principio y final: el punto en que se hartó, la decisión, lo que costó sostenerla, y en qué se convirtió. QUÉ cambia lo dicta el PILAR y el CONCEPTO — puede ser levantar algo propio, pero también puede ser ganarse una disciplina, romper un hábito, dejar de postergar o aprender a confiar en sí mismo. No lo conviertas en una historia de negocios si el pilar no va de eso. Cuéntalo como mejor le venga a ESTE guion: de otro en tercera persona y sin nombre propio ("un hombre de 40 años"), en primera persona, o hacia delante hablándole a él en futuro ("vas a llegar a un punto en que..."). Lo único prohibido es contárselo a él en pasado, como si ya lo hubiera vivido. El cierre siempre vuelve a él diciéndole qué hacer. Sí pueden aparecer OTRAS personas de su vida (quien lo espera en casa, quien le dio el primer sí, quien no cambió) — el reparto del canal está más abajo.
Esto es el esqueleto, NO una plantilla: entra por donde quieras, dale la vuelta al orden, sorprende.

NUNCA UN PERSONAJE INVENTADO: nada de "Marcos", "Carlos", "Pedro" ni la fórmula "[Nombre] vivía en un barrio... un día entendió...". Nada de biografías ficticias.

VARIEDAD (obligatoria): cada guion debe sentirse distinto al anterior — otra entrada, otras imágenes, otra forma de armar las frases. Tienes libertad total dentro de estas reglas: úsala. Si lo que escribes suena a algo que ya se ha visto mil veces, cámbialo.

PROHIBIDO: "el secreto mejor guardado" en cualquier variante. Porcentajes genéricos. Calcos del inglés. Repetir la misma frase de cierre de otro guion.
CIERRE: duro y con fuego, cerrando el círculo con la primera frase. Sin promesas falsas ni consuelo barato, pero la última línea debe ENCENDER, no enfriar. Termina con: Legado de Hierro.
` + reglaTiempo() + `FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]

BLOQUE C
[Prompts que ILUSTRAN en orden las partes del guion. Cada prompt: acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje. Entorno diferente en cada prompt.]
LUGARES QUE SE REPITEN (obligatorio): si una escena ocurre en un sitio que YA sale en otra escena de este mismo guion — su cocina, su despacho, el portal, el taller — empieza ese prompt con [LUGAR: id-corto] usando SIEMPRE el mismo id para el mismo sitio (ej. [LUGAR: cocina]). El primer prompt que use un id describe ese sitio COMPLETO: paredes, muebles, objetos, luz. Los siguientes ya no lo describen entero, solo dicen qué pasa y desde dónde se ve. Los sitios que salen una sola vez NO llevan marca. Así el mismo sitio se ve igual en todas sus escenas en vez de cambiar de una a otra.
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]
PROMPT 4: [acción + entorno diferente + ángulo + luz]
PROMPT 5: [acción + entorno diferente + ángulo + luz]
PROMPT 6: [acción + entorno diferente + ángulo + luz]
PROMPT 7: [acción + entorno diferente + ángulo + luz]
PROMPT 8: [acción + entorno diferente + ángulo + luz]`;

  return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que quiere más de lo que tiene hoy y sabe que depende de él. NO des por hecho su situación: puede estar empleado, puede tener ya algo propio, puede estar arrancando. No lo trates como una víctima ni le supongas un jefe al que culpar. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es sostenerlo.

SIN RESENTIMIENTO (regla firme): este canal NO ataca a nadie. Nada de pintar al jefe, al empresario, al que gana más o al que llegó primero como el villano. PROHIBIDO el encuadre de "trabajas para hacer rico a otro", "construyes el sueño de otro", "pagas con tus años la tranquilidad de otro" y cualquier variante. Al que ya lo logró se le respeta: hizo lo que había que hacer, y el objetivo es LLEGAR AHÍ, no despreciarlo. El único adversario del espectador es él mismo: su postergación, su miedo, su comodidad. Se habla de lo que él puede construir, jamás de lo que otro hace mal.

NORTE: el canal forja gente que toma el control de su dinero, su tiempo y su vida, y que construye algo propio. Ese norte es AMPLIO, no una sola consigna: cabe la disciplina y los hábitos, el dinero que ya gana y a dónde se le va, las deudas, el ahorro y la inversión, el valor del tiempo, la paciencia y el largo plazo, el miedo y el riesgo, las decisiones que se posponen, el entorno y la gente alrededor, las habilidades, la reputación, los sistemas, y lo que les deja a los que vienen detrás. Tu trabajo es encender la decisión, no dar recetas.

NO REPITAS SIEMPRE EL MISMO SERMÓN (crítico): el encuadre de "el sueldo es una trampa, renuncia y monta tu negocio para ser tu propio jefe" ya se usó demasiadas veces en este canal y está gastado. Puede aparecer, pero NO puede ser el marco por defecto de todos los guiones. La mayoría de las veces entra por otro lado: por el dinero que ya tiene en la mano, por el tiempo que no vuelve, por una decisión concreta que lleva meses aplazando, por un hábito, por el miedo real, por lo que le está enseñando a su hijo sin darse cuenta, por la diferencia entre estar ocupado y estar avanzando. Antes de dar el guion por bueno, léelo: si se resume en "deja de trabajar para otro y sé tu propio jefe", REESCRÍBELO entrando por otro ángulo.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA NO CAMBIAR: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

Y OJO, ESTO NO SIGNIFICA QUE TODO GUION VAYA DE EMPRENDER: solo se habla de montar algo propio cuando el PILAR o el CONCEPTO lo piden. Si el pilar va de carácter, de hábitos o de manejar el dinero, NO metas la idea de crear un negocio ni el final de "empieza lo tuyo": ahí no pinta nada y desvía el guion.

EL PILAR Y EL CONCEPTO MANDAN, POR ENCIMA DE TODO LO DEMÁS: el PILAR define EL TERRENO del guion y el CONCEPTO define exactamente de qué va. Respeta los dos al pie de la letra. NO arrastres el tema de un pilar a otro: si el pilar es MENTALIDAD, el guion NO es de libertad financiera —quien lo pidió habría elegido ese pilar si lo quisiera—. Y si el concepto que te dan es de ánimo y superación personal, el guion va de eso, no de dinero. Antes de darlo por bueno, léelo: si podría haber salido con cualquier otro pilar, está mal.
- LIBERTAD FINANCIERA: el tiempo contra el dinero, lo que cuesta seguir esperando, la independencia real y lo que exige construirla.
- MENTALIDAD Y DISCIPLINA: la cabeza y el carácter del que construye. Decisiones duras, hábitos, ejecución cuando nadie mira, la disciplina que queda cuando la motivación se va, creer en uno mismo y sostenerlo. AQUÍ NO SE HABLA de sueldos, jefes, empleos ni negocios: se habla de carácter. Es el pilar donde cabe el ánimo y el empuje — que termine creyendo que sí puede y con ganas de exigirse más.
- SISTEMAS Y AUTOMATIZACIÓN: que lo tuyo funcione sin ti. Dejar de ser la pieza que sostiene todo, delegar, salir de la operación.
- HERRAMIENTAS DEL CAMINO: primera persona. Enseña de verdad el ÁNGULO ASIGNADO que viene en el mensaje. Solo el cierre dirige al enlace del video, con palabras distintas cada vez. Prohibida la fórmula "ya construí todo, revisa el enlace" como único contenido. Sin precios ni nombre de producto.
- MARCA PERSONAL: tu nombre, tu presencia, tu autoridad. Que te conozcan es dinero.
- INVERSIÓN Y CAPITAL: que tu dinero trabaje por ti. Activos, reinversión, lo que cuesta tenerlo parado.
- NEGOCIO Y VENTAS: arrancar lo tuyo, vender sin miedo, la estructura que lo sostiene.
- NEGOCIOS MILLONARIOS: pensar en grande. Escalar con gente y sistemas, construir algo que valga y que te sobreviva. Una sola unidad no te hace millonario; multiplicarla sí. Visión de largo plazo, sin prometer millones.

EL GANCHO MANDA: el GANCHO que te dan define CÓMO entras. Respétalo, no lo cambies por otro. Máximo 12 palabras en la primera frase.
- Dato Crudo: entra con una cifra o un hecho concreto que destruya una creencia. Los datos que más retienen son los que muestran lo que él está PERDIENDO, no lo que podría ganar.
- Pregunta Disruptiva: entra con una pregunta que no pueda ignorar ni responder cómodamente. Que lo obligue a revisarse a sí mismo.
- Afirmación Polémica: entra con una verdad incómoda que divida opiniones y contradiga de frente lo que él cree. Es la fórmula más viral que existe.
- Historia Personal: entra en primera persona con una confesión concreta. Nadie se salta un secreto que alguien está a punto de contar.
- Lista de Pasos: promete el número exacto y cúmplelo. Adelanta el paso más fuerte en el gancho para que se quede a verlos todos.

MODO REEL — consejo directo:
UNA idea, desarrollada de verdad y llevada hasta el final. Sin rodeos, sin relleno, sin repetir la misma idea con otras palabras. Que el espectador termine con algo que se le queda clavado: una verdad, un empujón, una decisión.

VARIEDAD (obligatoria): cada guion debe sentirse distinto al anterior — otra entrada, otras imágenes, otra forma de armar las frases. Tienes libertad total dentro de estas reglas: úsala. Si lo que escribes suena a algo que ya se ha visto mil veces, cámbialo.

PROHIBIDO: "el secreto mejor guardado" en cualquier variante. Porcentajes genéricos. Calcos del inglés. Repetir la misma frase de cierre de otro guion.
CIERRE: duro y con fuego, cerrando el círculo con la primera frase. Sin promesas falsas ni consuelo barato, pero la última línea debe ENCENDER, no enfriar. Termina con: Legado de Hierro.
` + reglaTiempo() + `FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]

BLOQUE C
[Prompts que ILUSTRAN en orden las partes del guion. Cada prompt: acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje. Entorno diferente en cada prompt.]
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]
PROMPT 4: [acción + entorno diferente + ángulo + luz]
PROMPT 5: [acción + entorno diferente + ángulo + luz]
PROMPT 6: [acción + entorno diferente + ángulo + luz]
PROMPT 7: [acción + entorno diferente + ángulo + luz]
PROMPT 8: [acción + entorno diferente + ángulo + luz]`;
}
var SP=buildSP();



// AUTH
// Ya NO hay registro ni usuarios guardados en el navegador: la unica puerta es la
// contrasena, y se comprueba CONTRA EL SERVIDOR (api/login -> APP_KEY). Lo que
// habia aqui antes (hashPass, lh_users, el codigo de acceso, las pestanas de
// login/registro) se elimino: apuntaba a una pantalla que ya no existe y dejaba
// rastro de la seguridad vieja en el codigo del cliente.

function doLogin(){
  var p=document.getElementById('lp').value;
  var e=document.getElementById('le');
  e.style.display='none';
  if(!p){e.textContent='Escribe tu contrasena de acceso';e.style.display='block';return;}
  var btn=document.getElementById('lbtn');
  var oTxt=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='Verificando...';}
  // La contrasena se valida CONTRA EL SERVIDOR (protege tus creditos). Si coincide
  // con APP_KEY (o si aun no configuraste APP_KEY: candado abierto), se guarda como
  // llave y se enviara en cada llamada al API.
  fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json','x-app-key':p}})
    .then(function(r){return r.json().catch(function(){return{};}).then(function(d){return{status:r.status,d:d};});})
    .then(function(res){
      if(btn){btn.disabled=false;btn.textContent=oTxt;}
      if(res.status===200){
        try{localStorage.setItem('lh_key',p);}catch(_){}
        ANT=HARDCODED_ANT;EL=HARDCODED_EL;VOICE=HARDCODED_VOICE;NB=HARDCODED_NB;
        localStorage.setItem('lh_sess','1');
        // El servidor avisa con {open:true} de que NO hay APP_KEY configurada:
        // el candado esta abierto y cualquiera con la direccion puede gastar tus
        // creditos. Antes esto se ignoraba y pasaba en silencio.
        CANDADO_ABIERTO=res.d&&res.d.open===true;
        showApp();
      }else if(res.d&&res.d.sinClave){
        e.textContent='Falta configurar APP_KEY en Vercel. Configúrala y vuelve a entrar.';e.style.display='block';
      }else{
        e.textContent='Contrasena incorrecta';e.style.display='block';
      }
    })
    .catch(function(){
      if(btn){btn.disabled=false;btn.textContent=oTxt;}
      e.textContent='No se pudo verificar. Revisa tu conexion.';e.style.display='block';
    });
}

function logout(){
  localStorage.removeItem('lh_sess');
  localStorage.removeItem('lh_key');
  ANT='';EL='';NB='';
  document.getElementById('pg-app').classList.remove('on');
  document.getElementById('pg-login').classList.add('on');
}

// true cuando el servidor dice que NO hay APP_KEY configurada.
var CANDADO_ABIERTO=false;

function showApp(){
  document.getElementById('pg-login').classList.remove('on');
  document.getElementById('pg-app').classList.add('on');
  sessionStorage.setItem('lh_sess',localStorage.getItem('lh_sess')||'');
  showPills();
  avisoCandado();
}

// Barra roja permanente cuando la API esta abierta al mundo. No se puede cerrar:
// mientras siga abierta, cualquiera que conozca la direccion puede gastar tus
// creditos de Veo y de Gemini.
function avisoCandado(){
  var id='avisoCandado',prev=document.getElementById(id);
  if(!CANDADO_ABIERTO){ if(prev)prev.parentNode.removeChild(prev); return; }
  if(prev)return;
  var d=document.createElement('div');
  d.id=id;
  d.style.cssText='position:sticky;top:0;z-index:9999;background:#b03a3a;color:#fff;'
    +'padding:10px 14px;font-size:12px;font-weight:700;line-height:1.4;text-align:center';
  d.textContent='⚠ SIN CONTRASEÑA: la API está abierta y cualquiera puede gastar tus créditos. '
    +'Configura APP_KEY en las variables de Vercel y vuelve a entrar.';
  var app=document.getElementById('pg-app');
  app.insertBefore(d,app.firstChild);
}

// STATE
var HARDCODED_ANT='';
var HARDCODED_EL='';
var HARDCODED_VOICE='IRHApOXLvnW57QJPQH2P';
var HARDCODED_NB='';
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
// El coste de la biblia se calcula con SU modelo, que puede ser otro (por defecto
// el bueno). Con imgCost() se estimaba con el de los reels y el aviso mentia.
function costoBiblia(){return IMG_COST[modeloBiblia()]||0.05;}
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
var CHAR_STYLE_ANCHOR='Recurring signature character: the SAME man in every image, his face IDENTICAL to the reference images -- a 35-year-old man, short black hair slicked back, short well-groomed dark beard, strong jawline, intense dark eyes, serious expression. Keep his face, hair and beard consistent across all images. Wardrobe and setting follow the scene described below (do not force a suit if the scene is humble). Cinematic American 2D comic-book / graphic-novel illustration, digitally inked and coloured: semi-realistic proportions and anatomy (realistic adult faces, never cartoonish, no manga eyes, no caricature), clean bold ink outlines of varying weight (heavier on the silhouette, finer inside the face), cel-shading with hard-edged shadows plus soft gradients on skin and fabric, subtle cross-hatching in the deepest shadows, warm muted palette, cinematic contrast with one clear light direction, hair drawn in defined strands, detailed irises. Never watercolour, never sketch, never flat vector, never halftone dots. IMPORTANT: this describes the DRAWING STYLE only. Each image is ONE single scene that fills the entire frame as one continuous illustration. NEVER a multi-panel comic page, NEVER split into panels, boxes, vignettes, a grid or a collage, NO dividing lines or internal borders. STRICTLY NOT photorealistic, not a photograph, not a 3D render, not CGI. No text, no letters, no captions, no watermark anywhere in the image. ';
function imgPromptPrefix(fmt){return CHAR_STYLE_ANCHOR+aspectHint(fmt);}
// Conecta los <select> de modelo/formato con el estado global.
// Los modelos elegidos SE RECUERDAN. Antes cada recarga los devolvia al valor por
// defecto: si trabajabas con veo-3.1-fast y recargabas, volvias al lite sin
// enterarte — o al reves, seguias pagando el caro creyendo que estabas en el
// barato. Se guarda solo el valor elegido, y al leerlo se comprueba que la opcion
// siga existiendo en el desplegable (si algun dia se retira un modelo, no se
// queda un valor fantasma seleccionado).
function guardarAjuste(k,v){ try{localStorage.setItem('lh_gen_'+k,v);}catch(e){} }
function leerAjuste(k,sel,porDefecto){
  var v=null;
  try{ v=localStorage.getItem('lh_gen_'+k); }catch(e){}
  if(!v||!sel)return porDefecto;
  for(var i=0;i<sel.options.length;i++) if(sel.options[i].value===v) return v;
  return porDefecto;
}

function wireGenSettings(){
  var campos=[
    {k:'imgModel', sel:document.getElementById('selImgModel'),     get:function(){return imgModel;},     set:function(v){imgModel=v;}},
    {k:'imgFmt',   sel:document.getElementById('selImgFmt'),       get:function(){return imgFmt;},       set:function(v){imgFmt=v;}},
    {k:'vidModel', sel:document.getElementById('selVidModel'),     get:function(){return vidModel;},     set:function(v){vidModel=v;}},
    {k:'vidFmt',   sel:document.getElementById('selVidFmt'),       get:function(){return vidFmt;},       set:function(v){vidFmt=v;}},
    {k:'postImg',  sel:document.getElementById('selPostImgModel'), get:function(){return postImgModel;}, set:function(v){postImgModel=v;}},
  ];
  campos.forEach(function(c){
    var sel=c.sel;
    if(!sel||sel.dataset.wired)return;
    sel.dataset.wired='1';
    c.set(leerAjuste(c.k,sel,c.get()));
    sel.value=c.get();
    sel.addEventListener('change',function(){ c.set(sel.value); guardarAjuste(c.k,sel.value); });
  });
}

function showPills(){
  var el=document.getElementById('apipills');
  if(!el)return;
  function mk(lbl){return '<span class="api-pill" style="color:#7a9b8a;background:#eaf2ee">● '+lbl+'</span>';}
  // El stack corre con las llaves en el servidor (variables de entorno de Vercel).
  el.innerHTML=mk('Gemini · texto·imagen·video')+mk('ElevenLabs · audio');
}

// Convierte las lineas "pilar|gancho|concepto" que devuelve la investigacion de
// tendencias en objetos usables. LA USA genTrends: no es codigo muerto.
function parseSuggestions(txt){
  var validT={},validH={dato:1,pregunta:1,afirmacion:1,historia:1,pasos:1};
  THEMES.forEach(function(t){validT[t.id]=1;});
  var out=[];
  (txt||'').replace(/\r/g,'').split('\n').forEach(function(ln){
    var p=ln.split('|');
    if(p.length<3)return;
    var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');};
    var t=norm(p[0]),h=norm(p[1]),c=p.slice(2).join('|').trim();
    c=c.replace(/^[-\u2013\u2014\d.\s"']+/,'').replace(/["']+$/,'').trim();
    if(validT[t]&&validH[h]&&c.length>8&&c.length<200)out.push({t:t,concept:c,h:h});
  });
  return out;
}

// El panel de "Sugerencias de Reels" se retiro hace tiempo (lo reemplazo la
// investigacion de tendencias). Aqui vivian buildSuggestPrompt, refreshSched y
// buildSched: ~80 lineas que parecian un sistema de sugerencias con IA en
// marcha y que en realidad no se ejecutaban nunca, porque #schedGrid ya no
// existe en el HTML. Se eliminan para no construir encima de un fantasma.

// Las duraciones que se ven dependen del modo: los cortos ven 30/60 y los largos
// ven 3/5/8 minutos. Se repinta al cambiar de modo.
// 16:9 para los modos largos (YouTube), 9:16 para los reels. Se puede cambiar a
// mano despues: esto solo pone el valor sensato al cambiar de modo.
function aplicarFormatoDelModo(){
  var quiere=esModoLargo()?'16:9':'9:16';
  [['selImgFmt',function(v){imgFmt=v;},'imgFmt'],['selVidFmt',function(v){vidFmt=v;},'vidFmt']].forEach(function(c){
    var sel=document.getElementById(c[0]);
    if(!sel)return;
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].value===quiere){
        sel.value=quiere;c[1](quiere);
        if(typeof guardarAjuste==='function')guardarAjuste(c[2],quiere);
        break;
      }
    }
  });
}

function pintarDuraciones(){
  var dg=document.getElementById('durGrid');
  if(!dg)return;
  var lista=dursDe(sMode);
  // Si la duracion elegida no existe en este modo, se pasa a la primera del modo.
  if(!lista.some(function(d){return d.id===sD;}))sD=lista[esModoLargo()?1:1]?lista[1].id:lista[0].id;
  dg.innerHTML='';
  lista.forEach(function(d){
    var b=document.createElement('button');b.className='oc';b.dataset.id=d.id;
    b.innerHTML='<span class="om">'+d.label+'</span><span class="os">'+d.sub+'</span>';
    b.addEventListener('click',function(){sD=d.id;rfAll();updImgLabel();});
    dg.appendChild(b);
  });
}

function buildAll(){
  setTimeout(updImgLabel,100);
  // Selector de modo: Reel o Historia
  var modeWrap=document.getElementById('modeSelector');
  if(modeWrap){
    modeWrap.innerHTML='';
    [{id:'reel',label:'🎬 Modo Reel',sub:'Consejo directo'},
     {id:'historia',label:'📖 Modo Historia',sub:'Narrativa con continuidad'},
     {id:'impacto',label:'⚡ Modo Impacto',sub:'Golpe de 30 segundos'},
     {id:'profesor',label:'🎓 Modo Profesor',sub:'YouTube — enseña un método'},
     {id:'relato',label:'🎞 Modo Relato',sub:'YouTube — historia larga'}].forEach(function(m){
      var b=document.createElement('button');b.className='oc'+(sMode===m.id?' sel':'');b.dataset.id=m.id;
      b.innerHTML='<span class="om">'+m.label+'</span><span class="os">'+m.sub+'</span>';
      b.style.borderColor=sMode===m.id?'#b8975a':'';
      b.style.background=sMode===m.id?'#f0e8d8':'';
      b.querySelector('.om').style.color=sMode===m.id?'#b8975a':'';
      b.addEventListener('click',function(){
        sMode=m.id;SP=buildSP();pintarDuraciones();rfAll();
        // YouTube es horizontal y los Reels verticales: al cambiar de familia de
        // modos se ajusta el formato solo, que si no se olvida y sale al reves.
        aplicarFormatoDelModo();
        updImgLabel();
        verBotonLote();
        pintarTrends(); // las tarjetas de tendencias cambian con la familia de modo
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
  pintarDuraciones();
  verBotonLote();
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
// CUANTAS IMAGENES LLEVA UN REEL. Esto estaba calculado con la MISMA formula
// copiada en tres sitios (la etiqueta, el prompt y el generador), y al anadir los
// modos largos actualice solo uno: los otros dos seguian creyendo que un video de
// profesor eran 5 imagenes y RECORTABAN las 8, con lo que el montaje apuntaba a
// imagenes que ya no existian. Ahora se calcula en un unico sitio.
function imagenesDe(mode,dId){
  mode=mode||sMode; dId=dId||sD;
  if(mode==='profesor')return 8;   // 5 tomas del set + 3 ejemplos
  if(mode==='relato')return 10;    // la historia, en orden
  if(mode==='impacto'||dId==='30')return 3;
  return 5;
}

function updImgLabel(){
  var el=document.getElementById('imgCountLabel');if(!el)return;
  var n=imagenesDe();
  var det=sMode==='profesor'?' · 5 tomas del set (se repiten en el montaje) + 3 ejemplos'
    :sMode==='relato'?' · la historia en orden, con continuidad'
    :' · Personaje en acción acorde al guion';
  el.textContent=n+' imágenes'+det;
}

// EL LOTE DE 5 SOLO EXISTE EN LOS MODOS CORTOS. Un video de YouTube se sube uno
// o dos por semana: sacar cinco de golpe no tiene ningun sentido, y ademas cuesta
// lo que cuestan cinco videos largos. Antes el boton se veia y al pulsarlo salia
// un aviso; eso es enseñar una puerta que no lleva a ningun sitio. Ahora en modo
// Profesor y Relato el boton y su nota simplemente no estan.
function verBotonLote(){
  var largo=esModoLargo();
  var b5=document.getElementById('gbtn5');
  if(b5)b5.style.display=largo?'none':'flex';
  var n5=document.getElementById('gnote5');
  if(n5)n5.style.display=largo?'none':'block';
  var b=document.getElementById('gbtn');
  if(b&&!loading)b.textContent=largo?'⚔ Forjar vídeo largo':'⚔ Forjar Reel';
}

function updGBtn(){
  var b=document.getElementById('gbtn'),has=document.getElementById('conc').value.trim().length>0;
  b.disabled=loading||!has;b.classList.toggle('on',!loading&&has);
  var b5=document.getElementById('gbtn5');
  if(b5){b5.disabled=loading;b5.style.opacity=loading?'.55':'1';b5.style.cursor=loading?'not-allowed':'pointer';}
}
function updCost(){document.getElementById('gcost').textContent='$'+cost.toFixed(3)+' estimado · '+genCount+' generaciones';}

// GENERATE
// Construye el mensaje completo de un episodio para /api/generate.
// Parametrizado por concepto/pilar/gancho/modo/duracion para que el lote de 5
// pueda variar TODO entre guiones (la generacion individual usa lo seleccionado).
// ============ MEMORIA QUE SE USA AL ESCRIBIR ============
// El problema que resuelve esto: el system prompt le ordena al modelo, en tres
// sitios, "JAMAS repitas el mismo detalle de un guion a otro" y "cada guion debe
// sentirse distinto al anterior" — pero al modelo NUNCA se le daba ni un guion
// anterior. Eran ordenes imposibles de cumplir. Y toda la variedad era
// Math.random() sin memoria: con 18 puertas de entrada, dos guiones seguidos
// tenian 1 entre 18 de entrar por la misma, y en una tanda de 20 la colision era
// segura. Estas funciones convierten el azar ciego en rotacion con memoria.

// Las N entradas mas recientes del historial (ya viene del mas nuevo al mas viejo).
function histRecientes(n){ return getHistory().slice(0,n); }

// Elige de `lista` evitando lo ya usado en los ultimos `mirar` guiones. Si ya se
// gastaron todas, vuelve a abrir la lista entera (nunca se queda sin opciones).
function elegirConMemoria(lista,campo,mirar){
  if(!lista||!lista.length)return null;
  var usados={};
  histRecientes(mirar||lista.length).forEach(function(it){
    var v=it&&it.sem&&it.sem[campo];
    if(typeof v==='string')usados[v]=true;
  });
  var libres=lista.filter(function(x){return !usados[x];});
  var pool=libres.length?libres:lista;
  return pool[Math.floor(Math.random()*pool.length)];
}

// Igual, pero devolviendo `cuantos` elementos distintos (para los registros visuales).
function elegirVariosConMemoria(lista,campo,cuantos,mirar){
  var usados={};
  histRecientes(mirar||12).forEach(function(it){
    var v=it&&it.sem&&it.sem[campo];
    if(Array.isArray(v))v.forEach(function(x){usados[x]=true;});
  });
  var libres=shuffleArr(lista.filter(function(x){return !usados[x];}));
  var resto=shuffleArr(lista.filter(function(x){return usados[x];}));
  return libres.concat(resto).slice(0,cuantos);
}

// Primera frase de un guion (el gancho) y su cierre real. La ultima linea siempre
// es "Legado de Hierro" — firma de marca, no cuenta como cierre.
function ganchoDe(txt){
  var s=String(txt||'').replace(/\s+/g,' ').trim();
  var m=s.match(/^[^.!?¿¡]*[.!?]?/);
  return (m?m[0]:s).trim().slice(0,110);
}
function cierreDe(txt){
  var ls=String(txt||'').split('\n').map(function(x){return x.trim();}).filter(Boolean);
  // Descarta la firma de marca del final si esta.
  while(ls.length&&/^legado de hierro\.?$/i.test(ls[ls.length-1]))ls.pop();
  if(!ls.length)return '';
  var ult=ls[ls.length-1];
  // Ultima frase de esa linea. Sin lookbehind: Safari de iOS no lo soporta en
  // versiones antiguas y este archivo es ES5 a proposito.
  var fr=ult.match(/[^.!?]+[.!?]*/g)||[ult];
  var last=fr[fr.length-1];
  return String(last||ult).trim().slice(0,110);
}

// ============ EL REPARTO ============
// La biblia de personajes vive en el bucket y se carga una vez al entrar.
// Hasta ahora el canal tenia UN personaje y el prompt prohibia expresamente
// inventar otros, asi que todos los reels eran el mismo hombre solo. Sin nadie
// mas en el cuadro no hay conflicto ni dialogo: solo un senor pensando. Esa es
// una de las razones de que todo pareciera igual.
var BIBLIA=[];

function cargarBiblia(){
  return fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'list'})})
    .then(function(r){return r.json();})
    .then(function(d){
      if(d&&Array.isArray(d.personajes))BIBLIA=d.personajes;
      if(typeof pintarBiblia==='function')pintarBiblia();
      return BIBLIA;
    })
    .catch(function(){return BIBLIA;});
}

// El modelo con el que se generan las vistas. Se elige DENTRO de la biblia: antes
// se tomaba en silencio del selector de otro panel y no habia forma de saber cual
// se estaba usando. Por defecto el mejor: estas imagenes se generan una sola vez
// y luego mandan la cara del personaje en todos los videos.
function modeloBiblia(){
  var s=document.getElementById('selBibliaModel');
  return (s&&s.value)?s.value:'gemini-3-pro-image';
}

// Cache de las vistas ya descargadas para verlas, por id de personaje.
var VISTAS_VISTAS={};

// TRES vistas por personaje: una de la cara y dos del cuerpo. Eran cuatro; con
// tres el generador tiene referencia de sobra y cada ficha cuesta una imagen menos.
var N_VISTAS=3;
var NOMBRE_VISTA=['la cara','el cuerpo de frente','el cuerpo de tres cuartos'];
function TODAS_LAS_VISTAS(){var a=[];for(var i=0;i<N_VISTAS;i++)a.push(i);return a;}

// Cuantas vistas tiene HECHAS un personaje. refs es una lista de 4 huecos y los
// que faltan valen null, asi que .length mentiria: diria 4 aunque no haya ninguna.
function nVistas(p){
  return ((p&&p.refs)||[]).filter(function(o){return !!o;}).length;
}

function pintarBiblia(){
  var g=document.getElementById('bibliaGrid');if(!g)return;
  var lbl=document.getElementById('bibliaLbl');
  var conVistas=BIBLIA.filter(function(p){return nVistas(p);}).length;
  if(lbl)lbl.textContent='Biblia de personajes · '+BIBLIA.length+' en el reparto, '+conVistas+' con vistas';
  g.innerHTML='';
  BIBLIA.forEach(function(p){
    var listo=nVistas(p)>0;
    var el=document.createElement('div');
    el.setAttribute('data-id',p.id);
    el.style.cssText='background:#fff;border:1.5px solid '+(p.fijo?'#b8975a':'var(--border)')
      +';border-radius:10px;padding:9px 10px';
    el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:3px">'
      +'<span style="font-size:11px;font-weight:700;color:var(--tx1);line-height:1.3">'+escHtml(p.nombre)+'</span>'
      +'<span style="font-size:10px;color:'+(listo?'#7a9b8a':'var(--tx3)')+'">'+(listo?'✓':'—')+'</span></div>'
      +'<div style="font-size:9.5px;color:var(--tx3);line-height:1.4;margin-bottom:5px">'+escHtml(p.rol||'')
      +(p.fijo?' · <b style="color:#b8975a">insignia</b>':'')+'</div>'
      +'<div style="font-size:9.5px;color:var(--tx3);line-height:1.4;margin-bottom:7px">'+escHtml((p.encaja||'').slice(0,90))+'</div>'
      +'<button type="button" class="bibliaVer" data-id="'+escHtml(p.id)+'" '
      +'style="width:100%;border:1px solid var(--border);background:var(--warm);border-radius:7px;'
      +'padding:5px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--tx3)">'
      +(listo?'👁 Ver las vistas':'⚡ Generar sus '+N_VISTAS+' vistas')+'</button>'
      // FOTOS TUYAS COMO ANCLA. Es lo que el insignia siempre tuvo: describir a
      // alguien por texto da "una mujer rubia", no ESA mujer. Con las fotos
      // delante el generador copia en vez de inventar.
      +'<button type="button" class="bibliaSubir" data-id="'+escHtml(p.id)+'" '
      +'style="width:100%;margin-top:4px;border:1px dashed var(--border);background:#fff;border-radius:7px;'
      +'padding:5px;font-size:9.5px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--tx3)">'
      +(nAncla(p)?'📎 '+nAncla(p)+' foto(s) de referencia'+(anclaPropia(p)?' tuyas':'')
                 :'📎 Usar mis propias fotos')+'</button>'
      +'<div class="bibliaVistas" style="display:none;margin-top:8px"></div>';
    g.appendChild(el);
  });
  Array.prototype.forEach.call(g.querySelectorAll('.bibliaVer'),function(b){
    b.addEventListener('click',function(){ abrirVistas(b.getAttribute('data-id')); });
  });
  Array.prototype.forEach.call(g.querySelectorAll('.bibliaSubir'),function(b){
    b.addEventListener('click',function(){ subirAncla(b.getAttribute('data-id')); });
  });
}

function nAncla(p){ return ((p&&p.base)||[]).length; }
function anclaPropia(p){
  return ((p&&p.base)||[]).some(function(o){return String(o).indexOf('personajes/')===0;});
}

// Sube hasta 3 fotos tuyas como ANCLA de un personaje: las que definen su cara.
// Se reducen EN EL NAVEGADOR antes de mandarlas — una foto del movil son varios
// megas y la peticion no cabe; ademas, como referencia no aporta nada ese tamano.
var ANCLA_LADO=1024;
function encogerImagen(file){
  return new Promise(function(res,rej){
    var fr=new FileReader();
    fr.onerror=function(){rej(new Error('no se pudo leer el archivo'));};
    fr.onload=function(){
      var im=new Image();
      im.onerror=function(){rej(new Error('el archivo no es una imagen'));};
      im.onload=function(){
        var e=Math.min(1,ANCLA_LADO/Math.max(im.width,im.height));
        var c=document.createElement('canvas');
        c.width=Math.round(im.width*e);c.height=Math.round(im.height*e);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        res(c.toDataURL('image/png').split(',')[1]);
      };
      im.src=fr.result;
    };
    fr.readAsDataURL(file);
  });
}

async function subirAncla(id){
  var p=personajePorId(id);if(!p)return;
  if(nAncla(p)&&!confirm('"'+p.nombre+'" ya tiene '+nAncla(p)+' foto(s) de referencia.\n\n'
    +'Si subes otras, esas mandan y las vistas ya generadas se borran (se hicieron con otra cara).\n\n¿Sigo?'))return;
  var inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';inp.multiple=true;
  inp.addEventListener('change',async function(){
    var files=Array.prototype.slice.call(inp.files||[]).slice(0,3);
    if(!files.length)return;
    var card=document.querySelector('#bibliaGrid [data-id="'+id+'"]');
    var btn=card?card.querySelector('.bibliaSubir'):null;
    var orig=btn?btn.textContent:'';
    if(btn){btn.disabled=true;btn.textContent='Subiendo '+files.length+' foto(s)...';}
    try{
      var b64s=[];
      for(var i=0;i<files.length;i++)b64s.push(await encogerImagen(files[i]));
      var r=await fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'ancla',id:id,imagenes:b64s})});
      var d=await r.json();
      if(!r.ok||!d.success)throw new Error(d.error||'Error '+r.status);
      delete VISTAS_VISTAS[id];delete REFS_PERSONAJE[id];
      await cargarBiblia();
      alert('Listo: '+b64s.length+' foto(s) de referencia para "'+p.nombre+'".\n\n'
        +'Ahora dale a "Generar sus '+N_VISTAS+' vistas": saldrán con ESA cara.');
    }catch(e){
      alert('No se pudieron subir: '+(e.message||'error'));
      if(btn){btn.disabled=false;btn.textContent=orig;}
    }
  });
  inp.click();
}

// Abre (o cierra) las vistas de un personaje. Es lo que faltaba: sin poder VERLAS
// no habia forma de saber si una salio mal y habia que rehacerla.
async function abrirVistas(id){
  var card=document.querySelector('#bibliaGrid [data-id="'+id+'"]');
  if(!card)return;
  var caja=card.querySelector('.bibliaVistas');
  var btn=card.querySelector('.bibliaVer');
  if(caja.style.display==='block'){ caja.style.display='none'; return; }
  var p=personajePorId(id);
  if(!p)return;
  caja.style.display='block';

  if(!nVistas(p)){
    caja.innerHTML='<div style="font-size:10px;color:var(--tx3)">Generando la vista 1 de 4...</div>';
    var res=await generarVistasDe(p,null,function(n,tot,vi,aviso){
      caja.innerHTML='<div style="font-size:10px;color:'+(aviso?'#8a6a2a':'var(--tx3)')+'">'
        +(aviso?'Vista '+n+' de '+tot+': '+escHtml(aviso)
               :'Generando la vista '+n+' de '+tot+'... (una por una, para no rebasar el límite de Google)')
        +'</div>';
    });
    if(!res.ok){
      caja.innerHTML='<div style="font-size:10px;color:#8a4a3a">No se pudo generar ninguna vista.<br>'
        +escHtml(res.fallos.slice(0,2).join(' · '))+'</div>';
      return;
    }
    p=personajePorId(id)||p;
  }

  if(!VISTAS_VISTAS[id]){
    caja.innerHTML='<div style="font-size:10px;color:var(--tx3)">Cargando...</div>';
    try{
      var r=await fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'imagenes',id:id})});
      var d=await r.json();
      // Los indices dicen QUE vista es cada imagen. Sin ellos, si faltaba la 2 se
      // pintaban tres seguidas y el boton ↺ de la tercera rehacia la vista 3
      // creyendo que era la 4: cada reintento descolocaba mas la ficha.
      VISTAS_VISTAS[id]=(d&&Array.isArray(d.refs))?d.refs.map(function(b64,k){
        return {b64:b64,i:(d.indices&&d.indices.length===d.refs.length)?d.indices[k]:k};
      }):[];
    }catch(e){ VISTAS_VISTAS[id]=[]; }
  }
  var vs=VISTAS_VISTAS[id];
  if(!vs.length){caja.innerHTML='<div style="font-size:10px;color:#8a4a3a">No se pudieron cargar las vistas.</div>';return;}

  var hay={};vs.forEach(function(v){hay[v.i]=1;});
  var faltan=TODAS_LAS_VISTAS().filter(function(i){return !hay[i];});

  var html='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px">';
  vs.forEach(function(v){
    html+='<div style="position:relative">'
      +'<img src="data:image/png;base64,'+v.b64+'" style="width:100%;display:block;border-radius:6px;background:#fff;border:1px solid var(--border)">'
      +'<span style="position:absolute;bottom:3px;left:3px;background:rgba(255,255,255,.9);border-radius:4px;'
      +'padding:1px 5px;font-size:8.5px;font-weight:700;color:var(--tx3)">'+(v.i+1)+' · '+NOMBRE_VISTA[v.i]+'</span>'
      +'<button type="button" class="bibliaRe" data-id="'+escHtml(id)+'" data-i="'+v.i+'" title="Rehacer la vista '+(v.i+1)+'" '
      +'style="position:absolute;top:3px;right:3px;background:rgba(255,255,255,.9);border:none;border-radius:5px;'
      +'padding:2px 6px;font-size:11px;cursor:pointer;line-height:1">↺</button></div>';
  });
  html+='</div>';
  // Si alguna vista no salio, se DICE. Antes la ficha se quedaba con tres imagenes
  // sin una sola palabra: parecia que estaba completa.
  if(faltan.length){
    html+='<div style="margin-top:6px;background:#fdf6ee;border:1px solid #e0c89a;border-radius:7px;padding:6px 8px">'
      +'<div style="font-size:10px;color:#8a6a2a;font-weight:600;line-height:1.4">Falta'+(faltan.length>1?'n':'')+' '
      +faltan.map(function(i){return 'la vista '+(i+1)+' ('+NOMBRE_VISTA[i]+')';}).join(' y ')+'.</div>'
      +'<button type="button" class="bibliaFaltan" data-id="'+escHtml(id)+'" data-f="'+faltan.join(',')+'" '
      +'style="width:100%;margin-top:5px;border:1px solid var(--gold);background:#fff;color:var(--gold);border-radius:6px;'
      +'padding:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit">⚡ Generar la'+(faltan.length>1?'s':'')+' que falta'+(faltan.length>1?'n':'')+'</button></div>';
  }
  html+='<div style="font-size:9.5px;color:var(--tx3);line-height:1.4;margin-top:6px">'
    +'Deben ser el MISMO personaje sobre fondo blanco. Si alguna sale con otra cara, con fondo o deformada, dale a ↺ en esa.</div>'
    +'<button type="button" class="bibliaReTodas" data-id="'+escHtml(id)+'" '
    +'style="width:100%;margin-top:6px;border:1px solid var(--border);background:#fff;border-radius:7px;'
    +'padding:5px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--tx3)">↺ Rehacer las '+(N_VISTAS===3?'tres':'cuatro')+'</button>';
  caja.innerHTML=html;
  if(btn)btn.textContent='👁 Ocultar las vistas';

  Array.prototype.forEach.call(caja.querySelectorAll('.bibliaRe'),function(b){
    b.addEventListener('click',function(){ rehacerVista(id,[parseInt(b.getAttribute('data-i'),10)]); });
  });
  var rt=caja.querySelector('.bibliaReTodas');
  if(rt)rt.addEventListener('click',function(){ rehacerVista(id,null); });
  var bf=caja.querySelector('.bibliaFaltan');
  if(bf)bf.addEventListener('click',function(){
    rehacerVista(id,bf.getAttribute('data-f').split(',').map(function(x){return parseInt(x,10);}));
  });
}

// Rehace una vista concreta (o todas). `cuales` null = todas.
async function rehacerVista(id,cuales){
  var p=personajePorId(id);if(!p)return;
  var card=document.querySelector('#bibliaGrid [data-id="'+id+'"]');
  var caja=card?card.querySelector('.bibliaVistas'):null;
  if(caja)caja.innerHTML='<div style="font-size:10px;color:var(--tx3)">Rehaciendo...</div>';
  var res=await generarVistasDe(p,cuales,function(n,tot,i,aviso){
    if(caja)caja.innerHTML='<div style="font-size:10px;color:'+(aviso?'#8a6a2a':'var(--tx3)')+'">'
      +'Vista '+(i+1)+(tot>1?' ('+n+' de '+tot+')':'')
      +(aviso?': '+escHtml(aviso):'...')+'</div>';
  });
  delete VISTAS_VISTAS[id];
  if(caja)caja.style.display='none';
  if(res.ok){
    await abrirVistas(id);
    // SI ALGUNA FALLO, SE DICE Y SE VE. Antes con que saliera una sola ya se daba
    // por buena la tanda: la vista mala se quedaba con su imagen VIEJA en pantalla
    // y parecia que rehacerla "no habia hecho nada".
    if(res.fallos.length&&caja){
      var av=document.createElement('div');
      av.style.cssText='margin-top:8px;background:#fdeeea;border:1px solid #d9a08f;border-radius:7px;padding:7px 9px';
      var txt=document.createElement('div');
      txt.style.cssText='font-size:10px;color:#8a4a3a;font-weight:600;line-height:1.45';
      txt.textContent='No se pudo rehacer '+res.fallos.map(function(f){return f.split(':')[0];}).join(' ni ')
        +'. Lo que ves de esa'+(res.malas.length>1?'s':'')+' es la imagen ANTERIOR.\nMotivo: '
        +res.fallos.map(function(f){return f.split(': ').slice(1).join(': ');}).join(' · ');
      txt.style.whiteSpace='pre-line';
      av.appendChild(txt);
      if(res.malas.length){
        var rb=document.createElement('button');
        rb.type='button';
        rb.style.cssText='width:100%;margin-top:5px;border:1px solid #b8975a;background:#fff;color:#b8975a;'
          +'border-radius:6px;padding:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit';
        rb.textContent='↺ Reintentar esa'+(res.malas.length>1?'s':'');
        rb.addEventListener('click',function(){ rehacerVista(id,res.malas); });
        av.appendChild(rb);
      }
      caja.appendChild(av);
    }
  }
  else if(caja){caja.style.display='block';caja.innerHTML='<div style="font-size:10px;color:#8a4a3a">No salió: '
    +escHtml(res.fallos.slice(0,2).join(' · '))+'</div>';}
}

// Genera y guarda las vistas de UN personaje, UNA POR UNA y en cola.
//
// Antes se pedian las cuatro en una sola llamada: cuatro imagenes tardan 40-60 s
// y la funcion de Vercel se corta a los 30, asi que el trabajo moria a medias y
// no se guardaba nada. Ademas, sin pausa entre ellas se rebasaba el limite por
// minuto de Vertex. El lote de reels ya lo hacia bien (una llamada tras otra con
// 1,5 s de pausa); esto no lo hacia, y era el mismo problema.
//
// El ORDEN importa: la vista 1 se genera primero y queda guardada, y las otras
// tres se generan DESPUES usandola como referencia. Asi las cuatro son la misma
// persona. Si se hicieran a la vez, cada una saldria con otra cara.
// LA MISMA CADENCIA QUE LOS REELS, que es la que funciona.
//
// La biblia iba con 1,5 s entre imagenes y con la funcion del servidor cortada a
// los 30 s, mientras que la generacion de reels va con 10 s de pausa y 60 s de
// margen. Con una imagen de calidad tardando 20-45 s, la biblia se quedaba a
// medias: el servidor mataba la peticion, el navegador lo daba por fallo y saltaba
// a la siguiente. De ahi las vistas sueltas y los personajes con huecos.
var PAUSA_VISTAS=10000;

// Y SI FALLA, SE ESPERA Y SE REINTENTA. No se salta. La mayoria de los fallos son
// el limite por minuto de Google, que se arregla solo esperando; saltar a la
// siguiente solo garantiza que esa tambien lo encuentre.
var ESPERAS_REINTENTO=[15000,30000,60000];
function esLimite(msg){
  return /429|RESOURCE_EXHAUSTED|quota|rate limit|too many/i.test(msg||'');
}

async function generarVistasDe(p,cuales,alProgreso){
  var lista=cuales&&cuales.length?cuales.slice():TODAS_LAS_VISTAS();
  // La vista 1 primero SIEMPRE que este en la tanda: es la que fija la cara.
  lista.sort(function(a,b){return a-b;});
  var hechas=0,fallos=[],sinRef=0,malas=[];
  for(var k=0;k<lista.length;k++){
    var i=lista[k];
    if(alProgreso)alProgreso(k+1,lista.length,i);
    // LAS VIEJAS DE ESTA MISMA TANDA NO VALEN DE REFERENCIA. Son justo las que se
    // quieren tirar: al rehacer las tres, la vista 2 se generaba mirando la vista
    // 2 vieja... y la 3 vieja, y salia igual que antes. Se le dice al servidor que
    // ignore las que aun no se han rehecho en esta tanda.
    var pendientes=lista.slice(k);
    var ultimoError='';
    // Hasta 4 intentos por vista, esperando cada vez mas. No se pasa a la
    // siguiente vista mientras esta se pueda recuperar.
    for(var intento=0;intento<=ESPERAS_REINTENTO.length;intento++){
      if(BIBLIA_PARAR){ ultimoError='parado a mano'; break; }
      try{
        var r=await fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'generar',personaje:p,model:modeloBiblia(),vista:i,ignorar:pendientes})});
        // Si la funcion se pasa de tiempo, Vercel devuelve un 504 con HTML: al
        // intentar leerlo como JSON saltaba un "Unexpected token" que no decia
        // nada. Ahora se traduce a lo que de verdad paso.
        if(r.status===504)throw new Error('el servidor tardó más de 60 s');
        var d=await r.json().catch(function(){return {};});
        if(!r.ok||!d.vistas||!d.vistas.length)throw new Error(d.error||'Error '+r.status);
        if(!d.conReferencia)sinRef++;
        // Se guarda ENSEGUIDA: asi la siguiente vista ya la puede usar de
        // referencia, y si algo falla a media tanda no se pierde lo hecho.
        var g=await fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'guardar',personaje:p,vistas:d.vistas})});
        var gd=await g.json().catch(function(){return {};});
        if(!g.ok)throw new Error(gd.error||'no se pudo guardar');
        // Si la escritura fallo, la imagen VIEJA sigue ahi: en pantalla parece que
        // "no cambio nada". Eso cuenta como fallo, no como exito.
        if(gd.noGuardadas&&gd.noGuardadas.indexOf(i)>-1)throw new Error('se generó pero no se pudo guardar');
        if(gd.personaje)p=gd.personaje; // la ficha vuelve con la ref nueva incluida
        hechas++;
        cost+=costoBiblia();updCost();
        ultimoError='';
        break;
      }catch(e){
        ultimoError=e.message||'error';
        if(intento<ESPERAS_REINTENTO.length){
          var espera=ESPERAS_REINTENTO[intento];
          // Si es el limite por minuto, se espera el doble: no sirve de nada
          // volver a llamar antes de que el contador se reinicie.
          if(esLimite(ultimoError))espera*=2;
          if(alProgreso)alProgreso(k+1,lista.length,i,
            'falló ('+ultimoError.slice(0,50)+'). Reintento '+(intento+1)
            +' de '+ESPERAS_REINTENTO.length+' en '+Math.round(espera/1000)+' s');
          await new Promise(function(rs){setTimeout(rs,espera);});
        }
      }
    }
    if(ultimoError){ fallos.push('vista '+(i+1)+': '+ultimoError); malas.push(i); }
    // Pausa entre llamadas, como en el lote de reels.
    if(k<lista.length-1)await new Promise(function(rs){setTimeout(rs,PAUSA_VISTAS);});
  }
  delete REFS_PERSONAJE[p.id];
  delete VISTAS_VISTAS[p.id];
  await cargarBiblia();
  // `rendido` = alguna vista agoto sus reintentos. Quien llame decide, pero la
  // generacion en tanda PARA: seguir con el siguiente personaje cuando el limite
  // esta saturado solo deja mas huecos.
  return {ok:hechas>0,hechas:hechas,fallos:fallos,sinRef:sinRef,malas:malas,
          rendido:malas.length>0&&!BIBLIA_PARAR};
}

// Genera las vistas que falten: personaje por personaje, y dentro de cada uno
// vista por vista, todo en COLA. Cuatro imagenes por 31 personajes son 124
// llamadas: lanzarlas de golpe rebasa el limite por minuto de Vertex y no se
// genera nada. Se puede parar a mitad y lo hecho queda guardado.
var BIBLIA_PARAR=false;

async function generarVistasFaltantes(){
  var btn=document.getElementById('bBibliaTodas');
  var st=document.getElementById('bibliaSt');
  // Los que van INCOMPLETOS tambien entran, y de cada uno solo se pide lo que le
  // falta. Antes solo entraban los que no tenian NINGUNA, asi que un personaje al
  // que se le hubiera caido una vista se quedaba cojo para siempre y el boton
  // contestaba que ya estaba todo hecho.
  var faltan=[],pendientes=[],totalImgs=0;
  BIBLIA.forEach(function(p){
    var hay={};((p.refs||[])).forEach(function(o,k){if(o)hay[k]=1;});
    var suyas=TODAS_LAS_VISTAS().filter(function(i){return !hay[i];});
    if(suyas.length){ faltan.push(p); pendientes.push(suyas); totalImgs+=suyas.length; }
  });
  if(!faltan.length){ if(st){st.style.display='block';st.textContent='Todos los personajes ya tienen sus vistas.';} return; }
  var nImgs=totalImgs;
  var mins=Math.ceil(nImgs*(8+PAUSA_VISTAS/1000)/60);
  if(!confirm('Faltan '+nImgs+' vista(s) repartidas en '+faltan.length+' personaje(s).\n\n'
    +'Coste aproximado: $'+(nImgs*costoBiblia()).toFixed(2)+'\n'
    +'Tiempo: unos '+mins+' minutos. Van UNA POR UNA para no rebasar el límite de Google.\n\n'
    +'Puedes parar cuando quieras: lo ya generado queda guardado.\n\n¿Seguimos?'))return;

  BIBLIA_PARAR=false;
  var orig=btn?btn.textContent:'';
  if(btn){
    btn.textContent='⏹ Parar';
    btn.dataset.parando='1';
  }
  if(st)st.style.display='block';

  var hechos=0,fallos=[];
  for(var i=0;i<faltan.length;i++){
    if(BIBLIA_PARAR)break;
    var p=faltan[i];
    var idx=i,nombre=p.nombre;
    var res=await generarVistasDe(p,pendientes[idx],function(n,tot,vi,aviso){
      if(st)st.textContent='Personaje '+(idx+1)+' de '+faltan.length+' — '+nombre
        +' · vista '+n+' de '+tot
        +(aviso?'   ⚠ '+aviso:'   (puedes parar cuando quieras)');
    });
    if(res.ok)hechos++;
    if(res.fallos.length)fallos.push(nombre+' ('+res.fallos.length+' vista/s)');
    // NO SE SALTA AL SIGUIENTE PERSONAJE con una vista sin terminar. Si una vista
    // agoto sus cuatro intentos es que el limite esta saturado de verdad: seguir
    // con el siguiente solo reparte huecos por toda la biblia.
    if(res.rendido){
      if(st)st.textContent='PARADO en "'+nombre+'": '+res.fallos[0]
        +'.\n\nNo se sigue con los demás para no dejar personajes a medias. '
        +'Espera un par de minutos y vuelve a darle al botón: retoma justo donde se quedó.';
      break;
    }
  }

  if(btn){btn.textContent=orig;btn.dataset.parando='';}
  if(st)st.textContent=(BIBLIA_PARAR?'Parado. ':'')+hechos+' personaje(s) listos.'
    +(fallos.length?' Con fallos: '+fallos.slice(0,3).join(' · ')+'. Vuelve a darle al botón: solo reintenta los que falten.':'');
  BIBLIA_PARAR=false;
}

function personajePorId(id){
  for(var i=0;i<BIBLIA.length;i++) if(BIBLIA[i].id===id) return BIBLIA[i];
  return null;
}

// Los secundarios que MENOS han salido ultimamente van primero: asi el director
// ve caras frescas arriba en vez de proponer siempre a los mismos.
function repartoDisponible(){
  var usos={};
  histRecientes(20).forEach(function(it){
    var ps=(it.sem&&it.sem.personajes)?it.sem.personajes:[];
    ps.forEach(function(id){usos[id]=(usos[id]||0)+1;});
  });
  return BIBLIA.filter(function(p){return !p.fijo;})
    .slice()
    .sort(function(a,b){return (usos[a.id]||0)-(usos[b.id]||0);});
}

// EL REPARTO, tal como lo lee el director al escribir el guion.
function bloqueReparto(){
  var libres=repartoDisponible();
  if(!libres.length)return '';
  var filas=libres.slice(0,31).map(function(p){
    return '- ' + p.id + ' | ' + p.nombre + (p.rol?' ('+p.rol+')':'') + ' — ' + (p.encaja||'');
  });
  return 'EL REPARTO DEL CANAL. Ademas del protagonista existen estas personas, y son SUYAS: '
    +'la misma compañera, el mismo mentor y el mismo cliente en todos los reels donde aparecen. '
    +'Estan ordenadas de la que menos ha salido ultimamente a la que mas.\n'
    +filas.join('\n')+'\n\n'
    +'COMO USARLOS (importante):\n'
    +'- Si el guion pide otra persona — alguien que espera en casa, alguien a quien se le rinde cuentas, '
    +'alguien que ya lo logro, alguien que no cambio — ELIGE a alguien de esa lista en vez de dejar al protagonista solo.\n'
    +'- Como maximo DOS secundarios por reel, y solo si aportan. Un guion de reflexion personal puede no llevar ninguno: '
    +'meter gente porque si es peor que no meterla.\n'
    +'- NO inventes personas nuevas ni les pongas nombre propio: usa a los del reparto.\n'
    +'- En los prompts de imagen, cuando en la escena aparezca uno de ellos, empieza ESE prompt con la marca '
    +'[CON: id] usando su identificador exacto de la lista (por ejemplo [CON: companera]). '
    +'Esa marca es la que hace que salga con su cara de siempre; sin ella saldra una persona cualquiera distinta cada vez. '
    +'Si en una imagen no hay nadie mas, no pongas marca.\n\n';
}

// MEMORIA DE ESCENAS. Hasta ahora la unica defensa contra las imagenes repetidas
// era una lista de escenas prohibidas escrita A MANO ("cargando cajas", "obra en
// construccion"...) que yo anadia cada vez que el dueno notaba que una se habia
// gastado. Eso no escala: la escena numero 13 que se gaste seguira saliendo
// hasta que alguien la vea y la apunte.
// Esto lo automatiza: de cada prompt de imagen ya generado se guarda un resumen
// corto, y los de los ultimos reels se le pasan al director como "esto ya lo
// usaste". Asi la lista se mantiene sola.
function resumirEscena(prompt){
  var p=String(prompt||'').replace(/\[CON:\s*[a-z0-9-]+\s*\]/gi,'').replace(/\s+/g,' ').trim();
  if(!p)return '';
  // Fuera la parte tecnica del prompt (planos, luz, estilo): lo que importa para
  // no repetirse es QUE se ve, no como esta fotografiado.
  p=p.replace(/\b(plano|angulo|ángulo|encuadre|contrapicado|picado|primer plano|primerisimo|primerísimo|close-?up|luz|iluminacion|iluminación|camara|cámara|lente|profundidad de campo|cel-?shading|comic|cómic|ilustracion|ilustración|2d|cinematograf\w*)\b[^,.]*/gi,'');
  p=p.replace(/\s*,\s*,+/g,', ').replace(/^[\s,;.-]+/,'').replace(/\s+/g,' ').trim();
  return p.slice(0,90);
}

function bloqueEscenasUsadas(mirar){
  var vistas=[],h=histRecientes(mirar||8);
  h.forEach(function(it){
    var lista=(it.sem&&it.sem.escenas)?it.sem.escenas:null;
    if(!lista&&Array.isArray(it.c))lista=it.c.map(resumirEscena); // reels viejos: se saca del prompt guardado
    if(!lista)return;
    lista.forEach(function(e){ if(e&&vistas.indexOf(e)<0)vistas.push(e); });
  });
  if(vistas.length<4)return '';
  return 'ESCENAS QUE ESTE CANAL YA USO (las de los ultimos '+h.length+' reels). '
    +'NINGUNA de tus imagenes puede repetir ninguna de estas, ni con otro encuadre ni con otra luz: '
    +'si tu idea se parece a una de abajo, DESCARTALA y busca otra cosa que contar de este guion:\n- '
    +vistas.slice(0,40).join('\n- ')+'\n\n';
}

// EL BLOQUE "YA DICHO". Le da al modelo lo que le faltaba para poder obedecer:
// con que ganchos ya abrio, con que frases ya cerro y de que conceptos ya hablo.
// No cuesta ni una llamada extra de API. Es el cambio que mas cambia los guiones.
function bloqueYaDicho(mirar){
  var h=histRecientes(mirar||25);
  if(h.length<2)return '';
  var ganchos=[],cierres=[],conceptos=[];
  h.forEach(function(it){
    var g=ganchoDe(it.a); if(g&&ganchos.indexOf(g)<0)ganchos.push(g);
    var c=cierreDe(it.a);  if(c&&cierres.indexOf(c)<0)cierres.push(c);
    var t=(it.topic||'').trim(); if(t&&conceptos.indexOf(t)<0)conceptos.push(t);
  });
  var s='LO QUE ESTE CANAL YA DIJO (memoria real de los ultimos '+h.length+' guiones — OBLIGATORIO leerlo antes de escribir):\n';
  if(ganchos.length) s+='\nYA ABRI CON ESTAS FRASES. Tu primera frase no puede parecerse a ninguna, ni en idea ni en estructura:\n- '+ganchos.slice(0,25).join('\n- ')+'\n';
  if(cierres.length) s+='\nYA CERRE CON ESTAS. Tu cierre tiene que ser otro:\n- '+cierres.slice(0,20).join('\n- ')+'\n';
  if(conceptos.length)s+='\nYA HABLE DE ESTO. Si tu concepto se parece, atacalo por un lado que no se haya tocado:\n- '+conceptos.slice(0,25).join('\n- ')+'\n';
  s+='\nREGLA: si al terminar tu guion pudiera confundirse con cualquiera de los de arriba, esta MAL y hay que reescribirlo. '
    +'Esto no es un adorno: es la memoria del canal, y repetirse es exactamente lo que hunde el alcance.\n\n';
  return s;
}

function buildEpisodeMsg(topic,tId,hId,mode,dId){
  mode=mode||sMode;dId=dId||sD;
  var tO=THEMES.find(function(t){return t.id===tId;});
  var hO=HOOKS.find(function(h){return h.id===hId;});
  var dO=DURS.concat(DURS_LARGAS).find(function(d){return d.id===dId;});
  var hi={dato:'Empieza con dato/cifra impactante.',pregunta:'Empieza con pregunta disruptiva.',afirmacion:'Empieza con verdad incomoda directa.',historia:'Empieza en primera persona con experiencia cruda.',pasos:'Desarrolla con Primero, Segundo, Tercero.'};
  var identidadBase='PERSONAJE FIJO — NO todas las imagenes tienen que mostrarlo (hay planos de detalle, de entorno o de otras personas), pero SIEMPRE que aparezca el protagonista es el MISMO hombre, rostro identico a las imagenes de referencia: hombre de 35 anos, cabello negro corto peinado hacia atras, barba corta oscura bien cuidada, mandibula marcada, ojos oscuros intensos, mirada seria. Su ROSTRO, cabello y barba son identicos en cada imagen; es el personaje principal de la marca y no puede cambiar. El vestuario y el entorno SI cambian segun la escena (traje oscuro de tres piezas en escenas de poder; camiseta simple en escenas humildes). ESTILO OBLIGATORIO: ilustracion estilo comic americano 2D cinematografico, lineas de tinta limpias y marcadas, cel-shading dramatico, iluminacion cinematografica con profundidad, estetica de novela grafica, sin texto en la imagen. NUNCA fotorrealista, NUNCA una foto, NUNCA render 3D ni CGI. PROHIBIDO EN TODA IMAGEN: lluvia, cualquier clima (nieve, tormenta, gotas de agua), cielos lluviosos, superficies mojadas, charcos -- NUNCA, ni dentro ni fuera del edificio; el clima es fuente de errores graves al animar. Tampoco robots, futurismo, sci-fi, cadenas rotas, magia ni fantasia. Solo el mundo real de negocios y finanzas; para dramatismo usa luces de ciudad, contraste y sombras, jamas clima. ESCENAS LIMPIAS: incluye solo los objetos que la accion necesita; evita objetos sueltos irrelevantes (tazas de cafe, vasos, adornos) que no formen parte de la accion, porque al animar se deforman o se transforman en otra cosa. MIRADA (obligatorio): el personaje mira lo que exige la accion (lo que hace con las manos, la persona con quien trata, el lugar que supervisa, el horizonte de la ciudad), NO a la camara y sin pose de modelo, salvo que el prompt diga explicitamente que habla directo a camara. ';
  // DIRECCION VISUAL: se le da al modelo el papel de DIRECTOR, no una lista de
  // escenas. Antes aqui habia arcos y menus de acciones fijos ("cargando cajas",
  // "dirigiendo al equipo"...) y el modelo simplemente los obedecia: por eso salian
  // siempre las mismas imagenes. Ahora decide el como a partir de ESTE guion.
  var sceneDir='DIRECCION VISUAL — ERES EL DIRECTOR: actua como director de cine y fotografia especialista en contenido de libertad financiera, no como un generador de escenas sueltas. ANTES de escribir nada, LEE el guion completo que acabas de escribir y planifica la secuencia entera como una pieza: decide que momento merece cada imagen, que se muestra y que se sugiere, y como avanza visualmente de la primera a la ultima. Cada prompt es UNA sola imagen, un unico plano que llena el cuadro — NUNCA vinetas, cuadros ni collage. ';
  if(mode==='historia'){
    // MODO HISTORIA = CONTINUIDAD. Antes este modo recibia practicamente la misma
    // orden que los otros dos ("cada imagen un fotograma distinto"), y por eso
    // salia una sucesion de escenas sueltas sin relacion: exactamente lo contrario
    // de contar una historia. Aqui se le exige que las imagenes sean la MISMA
    // escena avanzando, no cinco escenas diferentes.
    sceneDir+='ESTE MODO ES UNA HISTORIA CONTINUA, y esa es la diferencia con los otros modos. '
      +'NO son imagenes sueltas: son fotogramas SEGUIDOS de una misma escena que avanza, como si filmaras a la misma persona '
      +'durante un rato sin cortar a otro sitio. Piensa en una secuencia de pelicula, no en cinco portadas.\n'
      +'REGLAS DE CONTINUIDAD (obligatorias en este modo):\n'
      +'1. UN SOLO HILO: decide UN momento concreto de la vida del protagonista (una noche, una manana, una jornada, una conversacion) y quedate ahi. '
      +'Todas las imagenes ocurren dentro de ese mismo momento y en orden cronologico.\n'
      +'2. ESPACIO CONTINUO: como maximo DOS localizaciones, y si hay dos, la segunda tiene que ser un sitio al que se llega desde la primera (sale de casa y llega al taller; sale de la oficina y baja a la calle). Nada de saltar a un lugar sin relacion.\n'
      +'3. EL MISMO DIA: la misma ropa, la misma hora aproximada, la misma luz. Si el guion pide un salto de tiempo grande (anos despues), se permite UN solo salto y se hace evidente en la imagen; el resto sigue siendo continuo.\n'
      +'4. CADA IMAGEN CONTINUA LA ANTERIOR: la imagen k+1 tiene que poder explicarse mirando la k. Cambia el encuadre, la distancia o el angulo, y avanza la accion — pero no cambies de escena. Si el espectador no puede decir "esto pasa justo despues de lo otro", esta MAL.\n'
      +'5. VARIA LA CAMARA, NO EL MUNDO: la variedad de este modo viene de los PLANOS (general, medio, detalle de las manos, escorzo, desde atras), no de saltar de escenario. Esa es la diferencia entre una historia y un muestrario.\n'
      +'6. QUE PASE ALGO: entre la primera y la ultima imagen tiene que haber cambiado ALGO visible — lo que hace, su postura, quien esta con el, lo que hay sobre la mesa. Que el final no pueda confundirse con el principio.\n'
      +'ESCRIBE CADA PROMPT COMO PARTE DE LA SECUENCIA: menciona en el el lugar exacto y la hora, iguales en todos, para que el generador no invente otro sitio. ';
  }else if(mode==='impacto'){
    sceneDir+='ESTE MODO son 3 golpes visuales para detener el scroll: composicion audaz, alto contraste, mucha fuerza emocional, cada imagen un impacto distinto ligado a un momento del mensaje. Puedes usar contraste simbolico, un detalle brutal o una escena potente — lo que MEJOR sirva a lo que dice este guion. ';
  }else{
    sceneDir+='ESTE MODO acompana un consejo directo: cada imagen ILUSTRA lo que la narracion dice en ese momento, siguiendo su ritmo de principio a fin, con estetica de cine y poder tranquilo. ';
  }
  // El CODIGO (no el modelo) asigna los registros visuales. Ya no al azar ciego:
  // se prefieren los que NO se han usado en los ultimos guiones. Con 12 registros
  // y 3 por guion, el azar puro repetia mundo visual demasiado seguido.
  // En HISTORIA se pide UN mundo (la escena es continua); en los otros modos, tres.
  var esHistoria=(mode==='historia');
  var regs=elegirVariosConMemoria(VIS_REGISTROS,'regs',esHistoria?1:3,10);
  sceneDir+='LIBERTAD Y CRITERIO (lo mas importante): tienes libertad TOTAL para elegir escenas, encuadres y entornos. NO existe ninguna lista de escenas que debas seguir. Deriva cada imagen del CONTENIDO CONCRETO de su parte de ESTE guion: si el guion habla de tiempo, de una decision, de una perdida, de una relacion o de una rutina, la imagen debe ser de ESO, no una escena generica de trabajo. '
    +(esHistoria
      ? 'MUNDO DE ESTA HISTORIA (aqui transcurre TODA la secuencia, no saltes a otro): '+regs.join(' / ')+'. '
      : 'MUNDOS VISUALES DE ESTE GUION (usalos como territorio de partida, mezclalos y sal de ellos si el guion pide otra cosa): '+regs.join(' / ')+'. ')
    +(esHistoria
      // En una secuencia continua la variedad viene de la CAMARA. La regla de
      // "ningun entorno repetido" del resto de modos aqui destruiria la historia.
      ? 'VARIEDAD DE PLANOS (obligatorio, y aqui es lo UNICO que varia): la escena es la misma, asi que cambia la CAMARA en cada imagen — plano general del lugar, plano medio, primer plano del rostro, detalle cerrado de las manos o de un objeto, plano desde atras, escorzo. Al menos una imagen NO debe mostrar su rostro. Repetir el mismo encuadre dos veces seguidas esta PROHIBIDO; repetir el mismo LUGAR es obligatorio. '
      : 'VARIEDAD DE PLANOS (obligatorio): NO todas las imagenes son un plano entero del protagonista trabajando. Alterna la escala — un primer plano de manos u objetos, un detalle cerrado sin rostro, un plano general amplio donde la persona es pequena en el espacio, un plano medio, un punto de vista subjetivo. NO todas las imagenes tienen que mostrar al protagonista: algunas pueden ser un entorno vacio, un objeto que cuenta la historia, otra persona, o un detalle. Al menos una imagen del conjunto NO debe mostrar su rostro. ')
    +'IMAGENES QUEMADAS — PROHIBIDAS salvo que el guion lo pida literalmente: el protagonista cargando cajas o bultos, apilando o moviendo mercancia, en una bodega o almacen con cajas de carton, cargando materiales en una obra en construccion, senalando o dirigiendo obreros con casco y chaleco en una fabrica o planta industrial, revisando o firmando papeles en un escritorio. Esas escenas ya se usaron demasiadas veces en este canal y estan gastadas; si tu primera idea es una de esas, DESCARTALA y busca otra. '
    +(esHistoria
      ? 'ANTIRREPETICION EN ESTE MODO: lo que no se puede repetir es el ENCUADRE y la ACCION, no el lugar. Dos imagenes seguidas con la misma camara y al personaje haciendo lo mismo estan MAL; dos imagenes en el mismo sitio, vistas distinto y con la accion avanzando, estan BIEN — es justo lo que se pide. '
      : 'ANTIRREPETICION: PROHIBIDO que dos imagenes de este conjunto compartan la misma accion, el mismo tipo de entorno o el mismo encuadre. Si dos prompts se parecen, reescribe uno. Piensa cada imagen como un fotograma distinto de una pelicula, no como un retrato del personaje posando. ')
    +bloqueEscenasUsadas(8);
  // Regla clave: el guion habla en METAFORAS. Sin esto, el modelo dibuja las
  // palabras al pie de la letra (fuego real por "apagar incendios", engranajes de
  // reloj por "engranajes") en vez del significado. No es una lista negra: es una
  // instruccion de RAZONAMIENTO que se aplica a cualquier figura del guion.
  sceneDir+='INTERPRETACION DEL SENTIDO, NUNCA LITERAL (obligatorio, hazlo ANTES de escribir cada prompt): el guion esta lleno de lenguaje FIGURADO, metaforas y frases hechas. Tu trabajo NO es dibujar las palabras, es dibujar lo que esas palabras SIGNIFICAN en el mundo real de los negocios. Ante cualquier expresion figurada, primero razona "que quiere decir esto de verdad para un empresario" y describe UNA escena concreta y creible de ese significado; jamas el objeto literal de la metafora. Ejemplos del TIPO de razonamiento que debes aplicar (NO es una lista cerrada, es la logica para TODA metafora que aparezca): "apagar incendios" NO es fuego ni bomberos, es resolver crisis y urgencias del negocio con calma -> el empresario resolviendo un problema con su equipo o gestionando una urgencia. "engranajes", "maquinaria", "que la maquina funcione sola" NO son piezas mecanicas ni relojeria, son los SISTEMAS, procesos y automatizacion que hacen que el negocio opere sin depender de el -> una operacion organizada fluyendo, el equipo trabajando coordinado, el empresario supervisando el flujo sin tener que hacerlo todo. "sembrar y cosechar" -> invertir esfuerzo o dinero hoy y recoger resultados despues, con acciones reales de negocio. "el timon", "el motor", "construir puentes", "escalar la montana", "la batalla", "romper cadenas", "no morir en la orilla" -> traduce SIEMPRE el significado a una escena real de empresa, trabajo o finanzas, nunca el objeto de la metafora. REGLA FIRME: si un elemento de la escena solo tendria sentido como la metafora tomada literal (fuego, engranajes de reloj, cadenas, semillas en la tierra, un barco, una montana, espadas o armas, una guerra), esta MAL: reemplazalo por la accion de negocios que representa. Cada imagen debe poder entenderse como un momento real y cotidiano del mundo empresarial, no como el dibujo de un refran. ';
  var identidad=identidadBase+sceneDir;
  // CUANTAS IMAGENES Y CUANTAS PALABRAS.
  // En los modos LARGOS no se genera una imagen por cada momento: seria carisimo
  // y ademas innecesario. Profesor usa 5 tomas del mismo set (que se REPITEN a lo
  // largo del video, como en una clase filmada) mas 3 ejemplos = 8 imagenes para
  // 3, 5 u 8 minutos. Relato usa 10, encadenadas cronologicamente.
  // Las palabras salen de ~2,5 por segundo, que es el ritmo real de la narracion.
  var segs=parseInt(dId,10)||60;
  var numPrompts=imagenesDe(mode,dId);
  var maxPalabras=esModoLargo(mode)?Math.round(segs*2.5)
    :((mode==='impacto'||dId==='30')?75:150);
  // Sincronizacion guion-imagen: en historia y reel, cada imagen ilustra su parte del guion.
  // En impacto no aplica (son 3 golpes visuales independientes).
  var syncRule=(mode!=='impacto'&&mode!=='profesor')
    ? 'SINCRONIZACION GUION-IMAGEN (obligatorio en este modo): divide el BLOQUE A en EXACTAMENTE '+numPrompts+' partes consecutivas de peso similar, en el mismo orden en que se narra. El PROMPT k del BLOQUE C debe ILUSTRAR lo que se dice en la parte k del guion: el PROMPT 1 corresponde al inicio del guion, el PROMPT '+numPrompts+' al cierre, y los del medio en orden. Las imagenes van al ritmo de la narracion, como los fotogramas de lo que se esta diciendo; ninguna imagen puede ser una escena suelta ajena a su parte del guion.\n\n'
    : '';
  // Variedad mecánica: el código asigna el tipo de modelo al azar (el modelo de IA no elige).
  // Se omite en impacto (muy corto), herramientas (el modelo es la guía del enlace) e inversión (el pilar ya define: activos).
  var seedRule='',semEnf=null,semAng=null;
  if(mode!=='impacto'&&tId==='herramientas'){
    // Ya no al azar: se prefiere el angulo que lleve mas guiones sin salir.
    semAng=elegirConMemoria(HERRAM_ANGLES,'ang',HERRAM_ANGLES.length);
    seedRule='ÁNGULO ASIGNADO PARA ESTE GUION (variedad obligatoria): '+semAng+' Desarrolla ESE contenido con sustancia real; SOLO el cierre dirige al enlace del video, con una invitación distinta cada vez. PROHIBIDO repetir la fórmula de siempre.\n\n';
  }else{
    // El codigo asigna la PUERTA DE ENTRADA (el modelo no la elige): es lo que
    // evita que todos los guiones entren por "el sueldo es una trampa". Con
    // memoria: no se repite una puerta hasta agotar las 18.
    semEnf=elegirConMemoria(ENFOQUES,'enf',ENFOQUES.length);
    seedRule='PUERTA DE ENTRADA ASIGNADA PARA ESTE GUION (variedad obligatoria, no la anuncies ni la nombres): entra al tema por '+semEnf+' Sigue tratando el PILAR y el CONCEPTO que te dieron, pero ábrelos por ESA puerta en vez de por el encuadre de siempre. Si esa puerta NO encaja con el pilar o con el concepto, MANDA EL PILAR: descártala y entra por donde el tema lo pida. Si al terminar el guion podría haber entrado por cualquier otra puerta sin cambiar nada, no lo hiciste bien.\n\n';
  }
  // El formato exigido cambia con el modo: profesor entrega SET+TOMAS+EJEMPLOS y
  // un MONTAJE, no una lista de PROMPT 1..N.
  var formato;
  if(mode==='profesor'){
    formato='INSTRUCCION CRITICA DE FORMATO — OBLIGATORIO:\n'
      +'Genera los TRES bloques en este orden: BLOQUE A (guion hablado), BLOQUE C (SET + 5 TOMAS + 3 EJEMPLOS) y BLOQUE M (el montaje). El ingles NO va aqui: se pide aparte.\n'
      +'En el BLOQUE C tiene que haber EXACTAMENTE una linea SET:, cinco lineas TOMA 1: a TOMA 5: y tres lineas EJEMPLO 1: a EJEMPLO 3:. Ni una mas ni una menos.\n'
      +'En las TOMAS sale el protagonista dando la clase. En los EJEMPLOS sale OTRA persona: el profesor no aparece en ellos.\n'
      +'El BLOQUE M tiene que cubrir los '+segs+' segundos completos del guion, con una linea por corte en formato "<segundo>s: TOMA <n>" o "<segundo>s: EJEMPLO <n>". '
      +'Repite las tomas cuantas veces haga falta — para eso estan — pero nunca dos iguales seguidas. Un corte cada 8 a 15 segundos.\n'
      +'Si falta cualquiera de los cuatro bloques, la respuesta es incompleta y falla el sistema.\n\n';
  }else if(mode==='relato'){
    formato='INSTRUCCION CRITICA DE FORMATO — OBLIGATORIO:\n'
      +'Genera los DOS bloques en este orden: BLOQUE A (guion hablado en espanol) y BLOQUE C (exactamente '+numPrompts+' prompts numerados PROMPT 1 a PROMPT '+numPrompts+', en orden cronologico de la historia). El ingles NO va aqui: se pide aparte.\n'
      +'Si no generas el BLOQUE C con los '+numPrompts+' prompts, la respuesta es incompleta y falla el sistema.\n\n';
  }else{
    formato='INSTRUCCION CRITICA DE FORMATO — OBLIGATORIO:\nDebes generar los 2 bloques completos en este orden exacto:\n1. BLOQUE A — texto hablado en español ('+maxPalabras+' a '+(maxPalabras+10)+' palabras)\n2. BLOQUE C — exactamente '+numPrompts+' prompts de imagen, numerados PROMPT 1 hasta PROMPT '+numPrompts+'\nEl guion en inglés NO va en esta respuesta: se pide en una llamada aparte. No lo incluyas.\nSi no generas el BLOQUE C con los '+numPrompts+' prompts, la respuesta es incompleta y falla el sistema. NO omitas el BLOQUE C bajo ninguna circunstancia.\n\n';
  }
  var recuerda=(mode==='profesor')
    ? 'Recuerda: BLOQUE A es solo el texto hablado. BLOQUE C es el SET, las 5 TOMAS y los 3 EJEMPLOS. BLOQUE M es el montaje. NO escribas nada en ingles.'
    : 'Recuerda: BLOQUE A es solo texto hablado sin prompts. BLOQUE C son exactamente los '+numPrompts+' prompts de imagen. NO escribas nada en ingles.';

  var msg=buildSP(mode)+'\n\n---\n\nGenera un episodio COMPLETO:\nPILAR: '+(tO?tO.label+' - '+tO.desc:'Independencia Financiera')+'\nDURACION: '+(dO?dO.label:'60 segundos')+'\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' - '+(hi[hId]||hi.dato)+'\nCONCEPTO: '+topic+'\n\n'+identidad+'\n\nREGLA DE LONGITUD OBLIGATORIA: el BLOQUE A debe tener EXACTAMENTE entre '+maxPalabras+' y '+(maxPalabras+10)+' palabras. Ni una más, ni una menos. Cuenta las palabras antes de terminar.\n\n'+formato+syncRule+seedRule+bloqueReparto()+bloqueYaDicho(25)+recuerda;
  // Las semillas creativas viajan de vuelta para guardarlas en el historial. Sin
  // esto no hay forma de rotar sin repetir: el siguiente guion no sabria por que
  // puerta entro el anterior ni en que mundo visual estuvo.
  return {msg:msg,tO:tO,dO:dO,hO:hO,sem:{enf:semEnf,ang:semAng,regs:regs,personajes:[]}};
}

// EL INGLES VA EN SU PROPIA LLAMADA.
//
// Antes se pedia todo de una: guion espanol + prompts + montaje + guion ingles.
// En un video largo eso son casi 1000 palabras entre los dos idiomas y la
// respuesta llegaba cortada. Y el limite de 60 s de Vercel es POR LLAMADA, asi
// que partirlo en dos no solo reparte los tokens: da el doble de tiempo.
//
// Y no es una traduccion. Un calco del espanol suena a doblaje: hay frases que en
// espanol pegan y en ingles no significan nada. Lo que se pide es el MISMO reel
// dicho por alguien de Estados Unidos, con sus giros y su forma de rematar.
function contarPalabras(t){
  return String(t||'').trim().split(/\s+/).filter(function(x){return x.length>0;}).length;
}

function buildInglesMsg(guionES,mode,dO,queja){
  // El objetivo de longitud sale del guion espanol REAL, no de la formula de la
  // duracion: si el espanol salio de 480 palabras, el ingles tiene que tener 480,
  // no las 450 que decia la tabla.
  var n=contarPalabras(guionES);
  var min=Math.round(n*0.92),max=Math.round(n*1.12);
  var segs=dO&&dO.secs?dO.secs:60;
  return 'You are the English-language voice of IRON LEGACY, a channel about financial freedom, '
    +'discipline, mindset and building your own thing. Blunt, direct, no empty motivation, no coach cliches.\n\n'
    +'Translate the Spanish script below into English.\n\n'
    +'THIS IS A COMPLETE TRANSLATION. Every idea, every sentence, every number, every example and every '
    +'step in the Spanish script must appear in the English one, in the SAME ORDER and with the same paragraph '
    +'breaks. Do NOT summarise. Do NOT condense. Do NOT merge two sentences into one. Do NOT drop a part '
    +'because it feels repetitive — the repetition is deliberate, it is a spoken script. '
    +'If the Spanish says it, the English says it.\n\n'
    +'BUT NOT WORD FOR WORD. Translate meaning to meaning. Say each sentence the way a native US speaker '
    +'would say that same thing out loud:\n'
    +'- Contractions (you\'re, that\'s, won\'t). Spoken rhythm, not written prose.\n'
    +'- Where a Spanish expression has no English equivalent, use the US expression that does the same job. '
    +'Never leave a Spanish idiom translated literally.\n'
    +'- Use US money references when the Spanish one would not land (401k, credit card minimum, rent, '
    +'paycheck to paycheck). Keep every figure and every number exactly as it is.\n'
    +'- No Spanish words left in. The brand signature is IRON LEGACY, not a translation of the Spanish one.\n\n'
    +'LENGTH — HARD REQUIREMENT. The Spanish script has '+n+' words. Your English version must have between '
    +min+' and '+max+' words, because it has to fill the same '+segs+' seconds of voice-over. '
    +'If your draft is shorter than '+min+' words it means you left something out: go back over the Spanish, '
    +'find what you skipped, and translate it too. COUNT YOUR WORDS BEFORE YOU ANSWER.\n\n'
    +(queja?'YOUR PREVIOUS ATTEMPT WAS REJECTED: '+queja+' You skipped content. This time translate the '
      +'WHOLE script, from the first sentence to the last, without leaving anything out.\n\n':'')
    +'Finish with exactly: Iron Legacy.\n\n'
    +'Answer with the English script and NOTHING else — no preamble, no title, no word count, no explanation.\n\n'
    +'--- SPANISH SCRIPT ('+n+' words) ---\n'+guionES;
}

// Pide SOLO la version en ingles. Devuelve el texto o lanza el error.
//
// Y LA MIDE. Es el MISMO video: si el ingles sale mas corto que el espanol es que
// se dejo cosas fuera, y entonces ya no es el mismo video — es un resumen. Se le
// devuelve con la cuenta hecha y se le pide que traduzca lo que se salto.
async function fetchIngles(guionES,mode,dO){
  var esperadas=contarPalabras(guionES);
  var minimo=Math.round(esperadas*0.85);
  var queja='',ultimo='';
  for(var intento=0;intento<2;intento++){
    var r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:buildInglesMsg(guionES,mode,dO,queja),sinBloques:true})});
    if(r.status===504)throw new Error('el servidor tardó más de 60 s');
    var d=await r.json().catch(function(){return {};});
    if(!r.ok)throw new Error(d.error||'Error '+r.status);
    if(!d.text||!d.text.trim())throw new Error('sin respuesta');
    // Por si cuela una etiqueta o un preambulo, se limpia lo evidente.
    var t=d.text.replace(/^\s*(BLOQUE\s*F|ENGLISH( SCRIPT)?|EN)\s*:?\s*\n/i,'').trim();
    if(t.length<20)throw new Error('la respuesta vino vacía');
    var tiene=contarPalabras(t);
    if(tiene>=minimo)return t;
    ultimo=t;
    queja='your version had only '+tiene+' words for a '+esperadas+'-word Spanish script.';
    console.warn('El ingles vino corto ('+tiene+' de '+esperadas+' palabras). Se pide completo.');
  }
  // Si a la segunda sigue corto, se devuelve igual — mejor un ingles corto que
  // ninguno — pero se avisa arriba para que se vea en pantalla.
  throw new Error('salió incompleto ('+contarPalabras(ultimo)+' palabras frente a '
    +esperadas+' del español). Vuelve a pedirlo.');
}

// Llama a /api/generate y devuelve el episodio ya parseado (a, f, c, cRaw, raw).
async function fetchEpisode(msg,mode,dO){
  var r=await fetch('/api/generate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:msg}),
  });
  if(r.status===504)throw new Error('El servidor tardó más de 60 s escribiendo el guion. Vuelve a darle.');
  var d=await r.json().catch(function(){return {};});
  if(!r.ok){throw new Error(d&&d.error?d.error:'Error '+r.status);}
  if(!d.text)throw new Error('Sin respuesta de texto.');
  var p=parseBlocks(d.text);
  if(!p.a||p.a.length<20){
    // "Intenta de nuevo" no decia nada y no dejaba arreglar nada. Ahora el aviso
    // trae el motivo real que manda el servidor: si el modelo se quedo sin tope de
    // longitud, si devolvio otra cosa, y con que empezaba lo que si llego.
    var pista=d.finishReason==='MAX_TOKENS'
      ? 'el guion se cortó por longitud. Prueba una duración menor o vuelve a darle.'
      : 'la respuesta no traía el BLOQUE A.';
    var muestra=String(d.text||'').replace(/\s+/g,' ').slice(0,90);
    throw new Error('No se pudo leer el guion ES: '+pista
      +' ('+(d.chars||0)+' caracteres'+(d.finishReason?', '+d.finishReason:'')+')'
      +(muestra?'\nEmpezaba por: "'+muestra+'..."':''));
  }
  // SEGUNDA LLAMADA: el ingles. Va aparte para que ninguna de las dos se quede
  // sin espacio ni sin tiempo, y para que sea una adaptacion de verdad y no un
  // calco. Si falla, NO se pierde el guion espanol: queda el reel con su parte
  // en espanol y el boton de la pestana EN para pedirlo otra vez.
  p.f=''; p.errorEN='';
  try{
    p.f=await fetchIngles(p.a,mode||sMode,dO);
  }catch(e){
    p.errorEN=e.message||'error';
    console.warn('El guion en ingles no salio: '+p.errorEN);
  }
  return Object.assign({},p,{raw:d.text});
}

async function generate(){
  var topic=document.getElementById('conc').value.trim();
  if(!topic||loading)return;
  loading=true;updGBtn();hideErr();
  document.getElementById('ow').style.display='none';
  document.getElementById('gbtn').innerHTML='<span class="spin"></span> Forjando...';
  document.getElementById('gnote').style.display='inline';
  document.getElementById('gnote').textContent=sMode==='impacto'?'Generando golpe de impacto 30s...':sMode==='historia'?'Generando narrativa Trabajador→Alpha...':sMode==='profesor'?'Escribiendo la clase, el set y el montaje... (puede tardar)':sMode==='relato'?'Escribiendo el relato largo y sus escenas en orden... (puede tardar)':'Generando guiones ES + EN y prompts...';
  try{
    var built=buildEpisodeMsg(topic,sT,sH,sMode,sD);
    var p=await fetchEpisode(built.msg,sMode,built.dO);
    lastRes=Object.assign({},p,{topic:topic,tO:built.tO,dO:built.dO,hO:built.hO,sem:built.sem,modo:sMode,uid:nextUid()});
    genCount++;cost+=0.015;updCost();
    resetReelAssets();
    saveHistory(lastRes);
    renderOut(lastRes);
  }catch(e){
    showErr(e.message||'Error de conexion.');
  }finally{
    loading=false;
    verBotonLote(); // devuelve la etiqueta correcta segun el modo
    document.getElementById('gnote').style.display='none';
    updGBtn();
  }
}

// HELPERS de texto compartidos por lote e historial
function escHtml(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function firstLine(txt){
  var ls=(txt||'').split('\n');
  for(var i=0;i<ls.length;i++){if(ls[i].trim())return ls[i].trim();}
  return '';
}
function shuffleArr(a){
  var arr=a.slice();
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
  return arr;
}
// Identificador unico por reel en esta sesion (para asignar su propia miniatura).
var uidSeq=0;
function nextUid(){return ++uidSeq;}
// Limpia todos los materiales del reel en pantalla (audio, imagenes, videos,
// miniatura y video final) al pasar a otro guion.
function resetReelAssets(){
  lastCaption='';lastTags='';lastTikTok='';lastYouTube='';
  lastCaptionEN='';lastTagsEN='';lastTikTokEN='';lastYouTubeEN='';
  audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];
  thumbImg=(lastRes&&THUMBS[lastRes.uid])?THUMBS[lastRes.uid]:null;
  finalVid=null;FINALES={es:null,en:null};
  if(typeof stopMix==='function')stopMix(); // que no siga sonando la mezcla del reel anterior
}

// LOTE — 5 guiones de una vez, TODOS DIFERENTES: concepto, pilar, gancho,
// duracion y modo distintos entre si. Las llamadas van una tras otra (no en
// paralelo) para no chocar con los limites de Gemini. Solo se generan los
// GUIONES: imagenes/audio/ZIP se hacen despues, uno por uno, sobre el elegido.
var batchLoading=false;
var batchResults=[]; // [{status:'wait'|'loading'|'done'|'error', job, res, err}]

// Convierte 5 ideas (concepto+pilar+gancho) en 5 trabajos de lote con modos y
// duraciones variados: los tres modos siempre presentes, duraciones mezcladas.
// firstJob (opcional) ocupa la posicion 1 tal cual (el concepto escrito a mano).
function jobsFromIdeas(ideas,firstJob){
  var modes=shuffleArr(['reel','historia','impacto']).concat(shuffleArr(['reel','historia','impacto']).slice(0,2));
  // Solo 30 y 60 segundos (90s quedo eliminado por costo de imagenes/videos).
  var durPool=shuffleArr(['30','60','60','30','60']);
  var jobs=[];
  for(var j=0;j<5;j++){
    if(j===0&&firstJob){jobs.push(firstJob);continue;}
    var idea=ideas[(firstJob?j-1:j)%ideas.length];
    var mode=modes[j];
    jobs.push({topic:idea.concept,t:idea.t,h:idea.h,mode:mode,d:mode==='impacto'?'30':durPool[j]});
  }
  return jobs;
}

function batchJobs(){
  var topic=document.getElementById('conc').value.trim();
  // 5 conceptos distintos con pilares lo mas variados posible:
  // primero las sugerencias en pantalla, completando del pool local si hace falta.
  // Antes esto era SCHED_CURRENT.concat(SCHED_POOL), y como SCHED_CURRENT eran 7
  // elementos sacados al azar del PROPIO pool, esos 7 aparecian dos veces y el
  // lote tiraba hacia ellos. Ahora el pool entero compite en igualdad.
  var src=shuffleArr(SCHED_POOL.slice());
  var picked=[],usedT={},usedC={};
  // MEMORIA ENTRE LOTES. Antes cada lote arrancaba de cero: evitaba repetir pilar
  // DENTRO del lote, pero podias sacar tres lotes seguidos cargados de "libertad".
  // Ahora los conceptos y pilares de los ultimos guiones entran ya marcados, asi
  // que el lote nuevo tira hacia lo que lleva tiempo sin salir.
  var recientes=histRecientes(15);
  recientes.forEach(function(it){ if(it.topic)usedC[it.topic]=1; });
  // Los pilares de los ultimos 6 pesan como "ya usados" en la primera pasada.
  recientes.slice(0,6).forEach(function(it){ if(it.t)usedT[it.t]=1; });
  var usadosPrevios=Object.keys(usedT).length;

  for(var pass=0;pass<3&&picked.length<5;pass++){
    // Pasada 2: se olvidan los pilares del historial y solo cuentan los de ESTE
    // lote (si no, con 8 pilares y 6 marcados quedarian muy pocos donde elegir).
    if(pass===1&&usadosPrevios){
      usedT={};
      picked.forEach(function(x){usedT[x.t]=1;});
    }
    for(var i=0;i<src.length&&picked.length<5;i++){
      var it=src[i];
      if(usedC[it.concept])continue;
      if(pass<2&&usedT[it.t])continue; // pasadas 0 y 1: pilares sin repetir
      picked.push(it);usedT[it.t]=1;usedC[it.concept]=1;
    }
    // Ultima pasada: si el historial dejo fuera casi todo, se reabren los conceptos.
    if(pass===1&&picked.length<5)usedC={};
  }
  // CUOTA DE MONETIZACION: al menos 1 de los 5 del pilar "herramientas", que es el
  // unico que lleva al enlace del video. Antes entraba solo si el azar queria.
  if(picked.length>=5&&!picked.some(function(x){return x.t==='herramientas';})){
    var herr=src.filter(function(x){return x.t==='herramientas';});
    if(herr.length){
      var nuevo=herr.filter(function(x){return !usedC[x.concept];})[0]||herr[0];
      picked[picked.length-1]=nuevo; // sustituye el ultimo, no anade un sexto
    }
  }
  // Si escribiste un concepto, el guion 1 es ese concepto con TU seleccion actual:
  // tu modo y tu duracion, sin tocarlos. El lote solo existe en los modos cortos
  // (en los largos el boton ni siquiera aparece), asi que aqui sMode ya es corto.
  var firstJob=topic?{topic:topic,t:sT||picked[0].t,h:sH,mode:sMode,d:sMode==='impacto'?'30':sD}:null;
  return jobsFromIdeas(picked,firstJob);
}

async function generateBatch(customJobs){
  if(loading||batchLoading)return;
  // El lote de 5 es una herramienta de REELS. En los modos largos el boton esta
  // oculto (verBotonLote), asi que aqui no se llega; el guarda es por si acaso.
  if(!customJobs&&esModoLargo())return;
  batchLoading=true;loading=true;updGBtn();hideErr();
  var b5=document.getElementById('gbtn5');
  if(b5){b5.disabled=true;b5.innerHTML='<span class="spin" style="border-color:rgba(184,151,90,.3);border-top-color:#b8975a"></span> Forjando lote...';}
  document.getElementById('ow').style.display='none';
  // customJobs: 5 trabajos ya armados (p.ej. los conceptos de la investigacion
  // de tendencias). Sin ellos, el lote se arma con las sugerencias/pool local.
  var jobs=(customJobs&&customJobs.length)?customJobs:batchJobs();
  batchResults=jobs.map(function(j){return {status:'wait',job:j};});
  var sec=document.getElementById('batchSec');
  if(sec)sec.style.display='block';
  renderBatch();
  if(sec)sec.scrollIntoView({behavior:'smooth',block:'start'});
  for(var i=0;i<jobs.length;i++){
    batchResults[i].status='loading';renderBatch();
    try{
      var built=buildEpisodeMsg(jobs[i].topic,jobs[i].t,jobs[i].h,jobs[i].mode,jobs[i].d);
      var p=await fetchEpisode(built.msg,jobs[i].mode,built.dO);
      var res=Object.assign({},p,{topic:jobs[i].topic,tO:built.tO,dO:built.dO,hO:built.hO,sem:built.sem,modo:jobs[i].mode,uid:nextUid()});
      batchResults[i]={status:'done',job:jobs[i],res:res};
      genCount++;cost+=0.015;updCost();
      saveHistory(res);
    }catch(e){
      batchResults[i]={status:'error',job:jobs[i],err:e.message||'Error'};
    }
    renderBatch();
    // Pausa corta entre llamadas para respetar los limites de Gemini.
    if(i<jobs.length-1)await new Promise(function(r){setTimeout(r,1500);});
  }
  batchLoading=false;loading=false;updGBtn();
  if(b5){b5.disabled=false;b5.innerHTML='⚔ Generar 5';}
}

async function retryBatchItem(i){
  if(loading||batchLoading)return;
  var br=batchResults[i];if(!br)return;
  batchLoading=true;loading=true;updGBtn();
  br.status='loading';renderBatch();
  try{
    var built=buildEpisodeMsg(br.job.topic,br.job.t,br.job.h,br.job.mode,br.job.d);
    var p=await fetchEpisode(built.msg,br.job.mode,built.dO);
    var res=Object.assign({},p,{topic:br.job.topic,tO:built.tO,dO:built.dO,hO:built.hO,sem:built.sem,modo:br.job.mode,uid:nextUid()});
    batchResults[i]={status:'done',job:br.job,res:res};
    genCount++;cost+=0.015;updCost();
    saveHistory(res);
  }catch(e){
    batchResults[i]={status:'error',job:br.job,err:e.message||'Error'};
  }
  batchLoading=false;loading=false;updGBtn();renderBatch();
}

function renderBatch(){
  var grid=document.getElementById('batchGrid');if(!grid)return;
  grid.innerHTML='';
  batchResults.forEach(function(br,i){
    var th=THEMES.find(function(t){return t.id===br.job.t;});
    var hk=HOOKS.find(function(h){return h.id===br.job.h;});
    var col=th?th.c:'#b8975a';
    var el=document.createElement('div');
    el.style.cssText='background:#fff;border:1.5px solid var(--border);border-radius:12px;padding:12px 14px;box-shadow:0 1px 4px var(--sh)';
    var head='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<span style="font-size:9px;font-weight:700;letter-spacing:.08em;color:'+col+';text-transform:uppercase">Guion '+(i+1)+' · '+(MODE_LABELS[br.job.mode]||br.job.mode)+' · '+(br.job.d||'')+'s · '+(th?th.label:'')+(hk?' · '+hk.label.replace(/^[^ ]+ /,''):'')+'</span>'
      +'<span style="font-size:12px">'+(th?th.icon:'')+'</span></div>';
    if(br.status==='wait'){
      el.innerHTML=head+'<div style="font-size:11px;color:var(--tx3)">En cola...</div>';
    }else if(br.status==='loading'){
      el.innerHTML=head+'<div style="font-size:11px;color:var(--tx3);display:flex;align-items:center;gap:6px"><span class="spin" style="width:11px;height:11px;border-color:rgba(184,151,90,.3);border-top-color:#b8975a"></span> Forjando guion...</div>';
    }else if(br.status==='error'){
      el.innerHTML=head+'<div style="font-size:11px;color:#8a4a3a;background:#f8ede8;border:1px solid #c4897a;border-radius:8px;padding:7px 9px;margin-bottom:7px">'+escHtml(br.err||'Error')+'</div>';
      var rb=document.createElement('button');rb.textContent='↺ Reintentar';
      rb.style.cssText='width:100%;background:#fff;border:1.5px solid #b8975a;border-radius:8px;padding:7px;font-size:11px;font-weight:600;color:#b8975a;cursor:pointer;font-family:inherit';
      (function(ii){rb.addEventListener('click',function(){retryBatchItem(ii);});})(i);
      el.appendChild(rb);
    }else{
      var hook=firstLine(br.res.a);
      var rest=(br.res.a||'').split('\n').filter(function(l){return l.trim();}).slice(1).join(' ');
      el.style.cursor='pointer';
      el.innerHTML=head
        +'<div style="font-size:13px;font-weight:700;color:var(--tx);line-height:1.4;margin-bottom:5px">'+escHtml(hook)+'</div>'
        +'<div style="font-size:11px;color:var(--tx3);line-height:1.45;margin-bottom:7px">'+escHtml(rest.slice(0,110))+(rest.length>110?'...':'')+'</div>'
        +'<div style="font-size:10px;color:'+col+';font-weight:600">→ Abrir guion completo</div>';
      el.addEventListener('mouseenter',function(){el.style.borderColor=col+'88';});
      el.addEventListener('mouseleave',function(){el.style.borderColor='var(--border)';});
      (function(ii){el.addEventListener('click',function(){openBatchResult(ii);});})(i);
    }
    grid.appendChild(el);
  });
}

// Aplica en pantalla una seleccion completa (modo, pilar, duracion y gancho),
// repintando el selector de modo y el resto de controles.
function applySelection(mode,t,d,h){
  sMode=mode||'reel';sT=t||'';sD=d||'60';sH=h||'dato';
  SP=buildSP();updImgLabel();
  var modeWrap=document.getElementById('modeSelector');
  if(modeWrap){
    modeWrap.querySelectorAll('.oc').forEach(function(x){
      var s=x.dataset.id===sMode;
      x.classList.toggle('sel',s);x.style.borderColor=s?'#b8975a':'';
      x.style.background=s?'#f0e8d8':'';x.querySelector('.om').style.color=s?'#b8975a':'';
    });
  }
  rfAll();
}

// Abre una tarjeta del lote como si se acabara de generar: flujo normal
// (imagenes, audio, ZIP) desde ahi, uno por uno. Cada reel conserva su
// propia miniatura (THUMBS por uid).
function openBatchResult(i){
  var br=batchResults[i];
  if(!br||br.status!=='done')return;
  applySelection(br.job.mode,br.job.t,br.job.d,br.job.h);
  document.getElementById('conc').value=br.res.topic;updCC();updGBtn();
  lastRes=br.res;
  resetReelAssets();
  renderOut(lastRes);
}

// HISTORIAL — ultimos 10 reels generados, guardados en el navegador para no
// perder un guion si se cierra la pestana antes de descargar el ZIP.
var HIST_KEY='lh_hist';
// La memoria del canal. Estaba en 10: el reel 11 borraba el 1, asi que a las dos
// semanas el sistema no recordaba NADA y volvia a repetirse. Una entrada pesa
// 5-6 KB, asi que 300 caben de sobra en los ~5 MB de localStorage; y si algun dia
// no cupieran, guardarHist() recorta en vez de reventar.
var HIST_MAX=300;
var MODE_LABELS={reel:'🎬 Reel',historia:'📖 Historia',impacto:'⚡ Impacto',profesor:'🎓 Profesor',relato:'🎞 Relato'};

function getHistory(){
  try{var h=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');return Array.isArray(h)?h:[];}
  catch(e){return [];}
}

function saveHistory(res){
  if(!res||!res.a)return;
  try{
    var h=getHistory();
    h.unshift({
      a:res.a,f:res.f||'',c:res.c||[],cRaw:res.cRaw||'',topic:res.topic||'',
      // Modo profesor: el montaje y cuantas tomas hay. Sin esto, al restaurar el
      // reel se perderia el orden de los planos y el video saldria lineal.
      montaje:res.montaje||null,nTomas:res.nTomas||0,nEjemplos:res.nEjemplos||0,set:res.set||'',
      t:res.tO?res.tO.id:'',d:res.dO?res.dO.id:'60',h:res.hO?res.hO.id:'dato',
      modo:res.modo||'reel',fecha:new Date().toISOString(),
      // ID estable: sin el no hay forma de colgar de un reel ni sus materiales ni
      // sus metricas. Antes solo se podia referenciar por POSICION en el array, y
      // la posicion cambia cada vez que se genera otro guion (unshift).
      id:res.uid?('r'+res.uid):('r'+Date.now().toString(36)),
      // Semillas creativas: por que puerta entro, que angulo uso y en que mundos
      // visuales estuvo. Es lo que permite NO repetirlas en el siguiente.
      sem:res.sem||null,
      // Estado editorial: sin esto la anti-repeticion penaliza guiones que nunca
      // publicaste, y las metricas no tienen donde engancharse.
      estado:'borrador',publicado:''
    });
    if(h.length>HIST_MAX)h=h.slice(0,HIST_MAX);
    guardarHist(h);
  }catch(e){/* almacenamiento lleno o bloqueado: el historial nunca rompe la generacion */}
  buildHistory();
}

// Actualiza campos del reel que esta en pantalla dentro del historial, buscandolo
// por su id. Se usa para pegarle cosas que llegan DESPUES de generarlo (el caption,
// el estado de publicado, y mas adelante las metricas).
function guardarEnReel(campos){
  if(!lastRes||!lastRes.uid)return false;
  var id='r'+lastRes.uid;
  try{
    var h=getHistory(),tocado=false;
    for(var i=0;i<h.length;i++){
      if(h[i].id!==id)continue;
      for(var k in campos) if(Object.prototype.hasOwnProperty.call(campos,k)) h[i][k]=campos[k];
      tocado=true;break;
    }
    if(!tocado)return false;
    guardarHist(h);
    return true;
  }catch(e){ return false; }
}

// Escribe el historial aguantando la cuota de localStorage (~5 MB). Si se llena,
// va recortando los mas viejos en vez de perderlo TODO con una excepcion.
function guardarHist(h){
  for(var intento=0;intento<8;intento++){
    try{ localStorage.setItem(HIST_KEY,JSON.stringify(h)); return h.length; }
    catch(e){
      if(h.length<=10)throw e;
      h=h.slice(0,Math.floor(h.length*0.7)); // suelta el 30% mas antiguo y reintenta
    }
  }
  return h.length;
}

// Marca (o desmarca) un reel como publicado. Es la casilla que faltaba: sin ella
// la memoria trata igual un guion que subiste y uno que descartaste, y mas
// adelante las metricas de Facebook no tendrian a que engancharse.
function marcarPublicado(id){
  if(!id)return;
  try{
    var h=getHistory();
    for(var i=0;i<h.length;i++){
      if(h[i].id!==id)continue;
      var ya=h[i].estado==='publicado';
      h[i].estado=ya?'borrador':'publicado';
      h[i].publicado=ya?'':new Date().toISOString();
      break;
    }
    guardarHist(h);
  }catch(e){}
  buildHistory();
}

function buildHistory(){
  var grid=document.getElementById('histGrid');if(!grid)return;
  var lbl=document.getElementById('histLbl');
  var h=getHistory();
  if(lbl)lbl.textContent='Historial · '+h.length+(h.length===1?' reel guardado':' reels guardados');
  grid.innerHTML='';
  if(!h.length){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:16px;color:var(--tx3);font-size:11px">Aun no hay guiones en el historial. Se guardan solos al generar.</div>';
    return;
  }
  h.forEach(function(item,i){
    var th=THEMES.find(function(t){return t.id===item.t;});
    var col=th?th.c:'#b8975a';
    var fecha='';
    try{
      var dt=new Date(item.fecha);
      fecha=dt.toLocaleDateString('es',{day:'2-digit',month:'short'})+' · '+dt.toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
    }catch(e){}
    var el=document.createElement('div');
    el.style.cssText='background:#fff;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer;transition:border-color .15s';
    el.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">'
      +'<span style="font-size:9px;font-weight:700;letter-spacing:.08em;color:'+col+';text-transform:uppercase">'+(MODE_LABELS[item.modo]||item.modo)+' · '+(th?th.label:'')+'</span>'
      +'<span style="font-size:9px;color:var(--tx3)">'+fecha+'</span></div>'
      +'<div style="font-size:11.5px;font-weight:600;color:var(--tx1);line-height:1.4;margin-bottom:5px">'+escHtml(firstLine(item.a).slice(0,90))+'</div>'
      +'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">'
      +'<span style="font-size:10px;color:'+col+';font-weight:600">→ Restaurar este reel</span>'
      +'<button type="button" class="histPub" data-id="'+escHtml(item.id||'')+'" style="border:1px solid '
      +(item.estado==='publicado'?'#7a9b8a;background:#eaf2ee;color:#456':'var(--border);background:#fff;color:var(--tx3)')
      +';border-radius:6px;padding:3px 8px;font-size:9px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">'
      +(item.estado==='publicado'?'✓ Publicado':'Marcar publicado')+'</button>'
      +'</div>';
    el.addEventListener('mouseenter',function(){el.style.borderColor=col+'88';});
    el.addEventListener('mouseleave',function(){el.style.borderColor='var(--border)';});
    (function(id,ii){el.addEventListener('click',function(ev){
      // El boton de publicado vive DENTRO de la tarjeta: si no se para aqui,
      // marcarlo restauraria el reel de paso.
      var b=ev.target&&ev.target.closest?ev.target.closest('.histPub'):null;
      if(b){ ev.stopPropagation(); marcarPublicado(b.getAttribute('data-id')); return; }
      restoreHistory(id,ii);
    });})(item.id||'',i);
    grid.appendChild(el);
  });
}

// Restaura un guion del historial en pantalla, como recien generado:
// desde ahi se pueden retomar imagenes, audio y ZIP.
// Se busca por ID, no por posicion. La posicion cambia cada vez que se guarda un
// guion nuevo (saveHistory hace unshift), asi que si generabas algo con el panel
// del historial abierto, pulsar una tarjeta restauraba OTRO reel. El indice queda
// solo como respaldo para las entradas viejas que aun no tienen id.
function restoreHistory(id,i){
  var h=getHistory();
  var item=null;
  if(id){ for(var k=0;k<h.length;k++){ if(h[k].id===id){item=h[k];break;} } }
  if(!item)item=h[i];
  if(!item)return;
  applySelection(item.modo,item.t,item.d,item.h);
  var tO=THEMES.find(function(t){return t.id===item.t;});
  var dO=DURS.concat(DURS_LARGAS).find(function(d){return d.id===item.d;});
  var hO=HOOKS.find(function(x){return x.id===item.h;});
  lastRes={a:item.a,f:item.f,c:item.c||[],cRaw:item.cRaw||'',raw:'',topic:item.topic||'',tO:tO,dO:dO,hO:hO,sem:item.sem||null,modo:item.modo||'reel',uid:nextUid(),
    montaje:item.montaje||null,nTomas:item.nTomas||0,nEjemplos:item.nEjemplos||0,set:item.set||''};
  resetReelAssets();
  // El caption vuelve del historial en vez de volver a pedirselo (y pagarselo) a
  // Gemini. Se reescribe el id de la entrada al nuevo uid para que lo que se
  // guarde a partir de ahora siga cayendo en ESTE reel.
  lastCaption=item.caption||'';lastTags=item.tags||'';
  lastTikTok=item.tiktok||'';lastYouTube=item.youtube||'';
  lastCaptionEN=item.captionEN||'';lastTagsEN=item.tagsEN||'';
  lastTikTokEN=item.tiktokEN||'';lastYouTubeEN=item.youtubeEN||'';
  try{
    var hh=getHistory();
    for(var q=0;q<hh.length;q++){ if(hh[q].id===item.id){ hh[q].id='r'+lastRes.uid; break; } }
    guardarHist(hh);
    buildHistory(); // repinta las tarjetas con el id nuevo
  }catch(e){}
  document.getElementById('conc').value=item.topic||'';updCC();updGBtn();
  // Si ese reel ya tenia caption guardado, se muestra tal cual.
  if(lastCaption||lastTags){
    var cb=document.getElementById('capBox'),ct=document.getElementById('capText'),cg=document.getElementById('capTags');
    if(ct)ct.textContent=lastCaption;
    if(cg)cg.textContent=lastTags;
    if(cb)cb.style.display='block';
    pintarCaptionEN();
  }
  var hp=document.getElementById('histPanel');
  if(hp)hp.classList.remove('on');
  var ha=document.getElementById('ha');
  if(ha)ha.textContent='▼';
  renderOut(lastRes);
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
  var posA=-1,posC=-1,posF=-1,posM=-1; // posM: el MONTAJE del modo profesor
  for(var i=0;i<cleanLines.length;i++){
    var upper=cleanLines[i].trim().toUpperCase().replace(/[*#_`:]/g,'').trim();
    if(posA===-1&&upper.indexOf('BLOQUE A')===0){posA=i;}
    else if(posC===-1&&upper.indexOf('BLOQUE C')===0){posC=i;}
    else if(posM===-1&&upper.indexOf('BLOQUE M')===0){posM=i;}
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
  var aRaw=extract(posA,[posC,posM,posF]);
  var cRaw=extract(posC,[posA,posM,posF]);
  var mRaw=extract(posM,[posA,posC,posF]);
  var fRaw=extract(posF,[posA,posC,posM]);
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
  // MODO PROFESOR: el BLOQUE C no trae PROMPT 1..N sino un SET, unas TOMAS y unos
  // EJEMPLOS. Las tomas son del MISMO sitio y se REUTILIZAN a lo largo del video
  // (asi se filma una clase: se vuelve a la cara del que habla entre ejemplo y
  // ejemplo), y el BLOQUE M dice en que orden. Eso es lo que permite hacer un
  // video de minutos sin generar una imagen por segundo.
  var set='',tomas=[],ejemplos=[];
  if(cRaw&&!prompts.length){
    var ls=cRaw.split('\n'),actual=null,buf='';
    var cerrar=function(){
      if(!actual||buf.trim().length<15)return;
      if(actual==='set')set=buf.trim();
      else if(actual==='toma')tomas.push(buf.trim());
      else ejemplos.push(buf.trim());
    };
    for(var mi=0;mi<ls.length;mi++){
      var lm=ls[mi].trim().replace(/\*+/g,'');
      if(/^SET\s*[:\-.]/i.test(lm)){cerrar();actual='set';buf=lm.replace(/^SET\s*[:\-.]\s*/i,'');}
      else if(/^TOMA\s*\d*\s*[:\-.]/i.test(lm)){cerrar();actual='toma';buf=lm.replace(/^TOMA\s*\d*\s*[:\-.]\s*/i,'');}
      else if(/^EJEMPLO\s*\d*\s*[:\-.]/i.test(lm)){cerrar();actual='ejemplo';buf=lm.replace(/^EJEMPLO\s*\d*\s*[:\-.]\s*/i,'');}
      else if(lm&&actual){buf+=' '+lm;}
    }
    cerrar();
    // Las tomas van primero y los ejemplos despues: ese es el orden en que se
    // generan las imagenes, y el montaje se refiere a ellas por ese numero.
    if(tomas.length||ejemplos.length){
      prompts=tomas.map(function(t){return (set?set+'. ':'')+t;}).concat(ejemplos);
    }
  }

  // EL MONTAJE: "12s: TOMA 3" -> {seg:12, tipo:'toma', n:3}
  var montaje=[];
  if(mRaw){
    mRaw.split('\n').forEach(function(l){
      var m=/^\s*(\d+)\s*s?\s*[:\-.]\s*(TOMA|EJEMPLO)\s*(\d+)/i.exec(l.replace(/\*+/g,''));
      if(m)montaje.push({seg:parseInt(m[1],10),tipo:m[2].toLowerCase(),n:parseInt(m[3],10)});
    });
    montaje.sort(function(x,y){return x.seg-y.seg;});
  }

  return{a:cleanG(aRaw),f:cleanG(fRaw),c:prompts,cRaw:cRaw,
         set:set,nTomas:tomas.length,nEjemplos:ejemplos.length,montaje:montaje};
}

// RENDER
function renderOut(r){
  var col=(r.tO&&r.tO.c)?r.tO.c:'#b8975a';
  document.getElementById('otag').style.color=col;
  document.getElementById('otag').textContent='✓ '+(r.dO?r.dO.label:'')+' · '+(r.tO?r.tO.label:'')+' · '+(r.hO?r.hO.label:'');
  document.getElementById('oconcept').textContent='"'+(r.topic.length>70?r.topic.slice(0,70)+'...':r.topic)+'"';
  var tr=document.getElementById('tabrow');tr.innerHTML='';activeTab='a';
  TABS.forEach(function(tab){
    // La pestana EN se ve SIEMPRE, aunque el ingles no haya salido: si no, no
    // habia forma de volver a pedirlo y se perdia el reel entero por eso.
    var has={a:r.a,f:r.f}[tab.id];
    if(!has&&tab.id!=='f')return;
    if(!has&&!r.a)return;
    var btn=document.createElement('button');btn.className='tabbtn'+(tab.id==='a'?' on':'');
    btn.dataset.tab=tab.id;   // se busca por id, no por el texto: el texto cambia
    btn.textContent=tab.label+(!has&&tab.id==='f'?' ⚠':'');
    if(tab.id==='a'){btn.style.borderColor=tab.c;btn.style.color=tab.c;btn.style.background=tab.p;}
    btn.addEventListener('click',function(){activeTab=tab.id;rfTabs(r);});
    tr.appendChild(btn);
  });
  rfTabs(r);
  document.getElementById('capCard').style.display='block';
  document.getElementById('audioCard').style.display='block';
  document.getElementById('imgCard').style.display='block';
  var uc=document.getElementById('unifyCard');
  if(uc){
    uc.style.display='block';
    document.getElementById('unifyRes').style.display='none';
    document.getElementById('unifyRes').innerHTML='';
    document.getElementById('unifySt').style.display='none';
    document.getElementById('unifyErr').style.display='none';
    if(finalVid)renderFinalVid();
    updUnifyCard();
  }
  wireGenSettings();
  wireVox();
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
  // Boton del BANCO: reutilizar clips que ya viven en el bucket, sin generar
  // (ni pagar) nada. Se crea una sola vez y siempre esta disponible.
  if(!document.getElementById('bbanco')){
    var bb=document.createElement('button');
    bb.id='bbanco';
    bb.textContent='📼 Usar videos ya generados';
    bb.style.cssText='width:100%;margin-top:8px;padding:12px;background:#fff;border:2px solid #9ab47a;border-radius:10px;font-size:13px;font-weight:700;color:#6a8a4a;cursor:pointer;font-family:inherit';
    bb.addEventListener('click',abrirBanco);
    document.getElementById('imgCard').appendChild(bb);
    var bp=document.createElement('div');
    bp.id='bancoPanel';
    bp.style.cssText='display:none;margin-top:8px;border:1.5px solid var(--border);border-radius:10px;padding:10px;background:#fbfcf9;max-height:420px;overflow-y:auto';
    document.getElementById('imgCard').appendChild(bp);
  }
  document.getElementById('rES').style.display='none';
  document.getElementById('rEN').style.display='none';
  document.getElementById('ast').style.display='none';
  document.getElementById('ae').style.display='none';
  document.getElementById('igrid').innerHTML='';
  var tb=document.getElementById('thumbBox');
  if(tb){tb.innerHTML='';if(thumbImg)renderThumb();}
  document.getElementById('ist').style.display='none';
  document.getElementById('ie').style.display='none';
  document.getElementById('expbtn').style.display='none';
  document.getElementById('ow').style.display='block';
  setTimeout(function(){document.getElementById('ow').scrollIntoView({behavior:'smooth',block:'start'});},150);
}

function rfTabs(r){
  document.querySelectorAll('.tabbtn').forEach(function(btn){
    var tab=TABS.find(function(t){return t.id===btn.dataset.tab;});if(!tab)return;
    var s=tab.id===activeTab;btn.classList.toggle('on',s);
    btn.style.borderColor=s?tab.c:'';btn.style.color=s?tab.c:'';btn.style.background=s?tab.p:'';
  });
  var ct=document.getElementById('tabcontent');ct.innerHTML='';
  var tm=TABS.find(function(t){return t.id===activeTab;});
  var text={a:r.a,f:r.f}[activeTab]||'';
  if(!text){
    if(activeTab!=='f')return;
    // EL ESPANOL NO SE PIERDE PORQUE FALLE EL INGLES. El ingles va en su propia
    // llamada; si esa se cae, el reel sigue entero y desde aqui se vuelve a pedir.
    var av=document.createElement('div');
    av.style.cssText='background:#fdf6ee;border:1px solid #e0c89a;border-radius:10px;padding:12px';
    av.innerHTML='<div style="font-size:11.5px;color:#8a6a2a;line-height:1.5;font-weight:600">'
      +'El guion en inglés no salió'+(r.errorEN?': '+escHtml(r.errorEN):'')+'.</div>'
      +'<div style="font-size:10.5px;color:var(--tx3);line-height:1.5;margin-top:5px">'
      +'El de español está entero — esto solo afecta al vídeo en inglés.</div>';
    var bt=document.createElement('button');
    bt.type='button';
    bt.style.cssText='width:100%;margin-top:9px;border:1.5px solid var(--gold);background:#fff;color:var(--gold);'
      +'border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
    bt.textContent='🇺🇸 Escribir el guion en inglés';
    bt.addEventListener('click',async function(){
      bt.disabled=true;bt.textContent='Escribiéndolo...';
      try{
        r.f=await fetchIngles(r.a,r.modo,r.dO);
        r.errorEN='';
        if(lastRes&&lastRes.uid===r.uid){lastRes.f=r.f;lastRes.errorEN='';}
        guardarEnReel({f:r.f});
        cost+=0.01;updCost();
        renderOut(r);activeTab='f';rfTabs(r);
      }catch(e){
        bt.disabled=false;bt.textContent='🇺🇸 Escribir el guion en inglés';
        alert('Tampoco salió: '+(e.message||'error'));
      }
    });
    av.appendChild(bt);
    ct.appendChild(av);
    return;
  }
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
  // Mientras el lote sigue forjando guiones no se lanza otra llamada en paralelo
  // (todo va EN ORDEN para no chocar con los limites). Se pide al terminar con ↻.
  if(batchLoading){
    st.style.display='block';
    st.textContent='El lote sigue generando. Cuando termine, toca ↻ Regenerar para el caption.';
    er.style.display='none';box.style.display='none';
    return;
  }
  st.style.display='block';st.textContent='Generando caption y hashtags...';
  er.style.display='none';box.style.display='none';
  if(rb){rb.disabled=true;rb.style.opacity='.6';}
  var tema=lastRes.topic||(lastRes.tO?lastRes.tO.label:'');
  var pilar=lastRes.tO?lastRes.tO.label:'';
  var prompt='Eres el community manager de LEGADO DE HIERRO, un canal en espanol para hombres hispanos sobre libertad financiera, disciplina, mentalidad y emprendimiento. Voz cruda, directa, sin motivacion vacia, sin frases de coach, sin calcos del ingles.\n\n'
    +'A partir de este reel, escribe el texto para publicarlo en TRES plataformas distintas. Mismo mensaje, distinto formato segun los limites de cada una.\n\n'
    +'PILAR: '+pilar+'\nTEMA: '+tema+'\nGUION:\n'+lastRes.a+'\n\n'
    +'Devuelve EXACTAMENTE este formato en texto plano, sin markdown, sin ** ni ##:\n\n'
    +'CAPTION:\n[Para Facebook. 1 a 3 frases cortas y potentes que enganchen, en la voz de la marca, en espanol neutro. Puedes cerrar invitando a seguir el canal o a comentar. NO pongas hashtags aqui. Maximo 1 emoji, o ninguno.]\n\n'
    +'HASHTAGS:\n[Para Facebook. Entre 14 y 20 hashtags en UNA sola linea separados por espacios. El PRIMERO debe ser SIEMPRE #LegadoDeHierro. Los demas relevantes al tema del reel y al nicho (finanzas, disciplina, mentalidad, dinero, libertad financiera, emprendimiento, exito, negocios, inversion). Mezcla espanol y algunos universales. Sin repetir, sin numerar. Solo los hashtags, nada mas.]\n\n'
    +'TIKTOK:\n[Para TikTok. EXACTAMENTE 5 hashtags en una sola linea, ni uno mas, empezando SIEMPRE por #LegadoDeHierro. Elige los 5 mas relevantes de los que ya usaste arriba. Solo los hashtags, nada mas: NO repitas el caption aqui.]\n\n'
    +'YOUTUBE:\n[Para YouTube Shorts. NO es una descripcion: es un TITULO corto y potente mas los hashtags que quepan, todo en UNA sola linea de MAXIMO 100 caracteres contando titulo, espacios y hashtags. Empieza por #LegadoDeHierro si cabe. Cuenta los caracteres antes de responder: si pasa de 100, acortalo. Sin comillas.]\n\n'
    // La version en INGLES va en la MISMA llamada: no cuesta ni un centimo extra
    // y evita tener que traducir a mano fuera de la herramienta.
    // Los hashtags NO se traducen: los que funcionan en EE.UU. son otros
    // (#hustle, #sidehustle, #financialfreedom), no la traduccion literal.
    +'CAPTION_EN:\n[The same reel, written for a US English-speaking audience. NOT a translation: rewrite it the way it would be said in English. 1 to 3 short punchy sentences, brand voice, no coach cliches. No hashtags here. At most 1 emoji, or none.]\n\n'
    +'HASHTAGS_EN:\n[For Facebook in English. Between 14 and 20 hashtags on ONE line separated by spaces. The FIRST must always be #IronLegacy. The rest must be hashtags that people actually use in the US in this niche (money, discipline, mindset, financial freedom, entrepreneurship, side hustle, investing) — do NOT translate the Spanish ones literally. No repeats, no numbering.]\n\n'
    +'TIKTOK_EN:\n[For TikTok in English. EXACTLY 5 hashtags on one line, starting with #IronLegacy. Only the hashtags.]\n\n'
    +'YOUTUBE_EN:\n[For YouTube Shorts in English. A short punchy TITLE plus whatever hashtags fit, all on ONE line of AT MOST 100 characters. Count the characters before answering.]';
  try{
    var r=await fetch('/api/generate',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt}),
    });
    var d=await r.json();
    if(!r.ok||!d.text)throw new Error(d.error||'No se pudo generar');
    var parsed=parseCaption(d.text);
    lastCaption=parsed.caption;lastTags=parsed.tags;
    // Se pega al reel en el historial: antes eran variables en memoria y al
    // restaurar un reel habia que volver a pedirle el caption a Gemini y pagarlo
    // otra vez. Son cuatro cadenas, ~500 bytes.
    guardarEnReel({caption:lastCaption,tags:lastTags,tiktok:lastTikTok,youtube:lastYouTube,
      captionEN:lastCaptionEN,tagsEN:lastTagsEN,tiktokEN:lastTikTokEN,youtubeEN:lastYouTubeEN});
    document.getElementById('capText').textContent=lastCaption;
    document.getElementById('capTags').textContent=lastTags;
    pintarCaptionEN();
    box.style.display='block';st.style.display='none';
  }catch(e){
    er.textContent='Error: '+e.message;er.style.display='block';st.style.display='none';
  }finally{
    if(rb){rb.disabled=false;rb.style.opacity='1';}
  }
}

// Pinta el bloque en ingles si lo hay. Se oculta cuando no, para no dejar un
// hueco vacio en los reels viejos que se generaron antes de que existiera.
function pintarCaptionEN(){
  var c=document.getElementById('capBoxEN');
  if(!c)return;
  if(!lastCaptionEN&&!lastTagsEN){c.style.display='none';return;}
  var t=document.getElementById('capTextEN'),g=document.getElementById('capTagsEN');
  if(t)t.textContent=lastCaptionEN;
  if(g)g.textContent=lastTagsEN;
  c.style.display='block';
}

// Separa CAPTION / HASHTAGS y garantiza #LegadoDeHierro como primer hashtag.
function parseCaption(txt){
  var caption='',tags='';
  var t=(txt||'').replace(/\r/g,'').replace(/\*/g,'').replace(/#{2,}/g,'');
  // OJO con el orden: los bloques en ingles se llaman CAPTION_EN, HASHTAGS_EN...
  // El guion bajo antes de los dos puntos hace que /CAPTION\s*:/ NO los capture,
  // pero el de YOUTUBE si llegaba hasta el final del texto y se tragaba los
  // cuatro bloques ingleses enteros. Por eso cada uno corta en el siguiente.
  var FIN='(?:CAPTION_EN\\s*:|HASHTAGS_EN\\s*:|TIKTOK_EN\\s*:|YOUTUBE_EN\\s*:|$)';
  var mC=t.match(/CAPTION\s*:\s*([\s\S]*?)(?:HASHTAGS\s*:|TIKTOK\s*:|YOUTUBE\s*:|CAPTION_EN\s*:|$)/i);
  var mH=t.match(/HASHTAGS\s*:\s*([\s\S]*?)(?:TIKTOK\s*:|YOUTUBE\s*:|CAPTION_EN\s*:|$)/i);
  var mT=t.match(/TIKTOK\s*:\s*([\s\S]*?)(?:YOUTUBE\s*:|CAPTION_EN\s*:|$)/i);
  var mY=t.match(new RegExp('YOUTUBE\\s*:\\s*([\\s\\S]*?)'+FIN,'i'));
  // Los cuatro en ingles
  var mCe=t.match(/CAPTION_EN\s*:\s*([\s\S]*?)(?:HASHTAGS_EN\s*:|TIKTOK_EN\s*:|YOUTUBE_EN\s*:|$)/i);
  var mHe=t.match(/HASHTAGS_EN\s*:\s*([\s\S]*?)(?:TIKTOK_EN\s*:|YOUTUBE_EN\s*:|$)/i);
  var mTe=t.match(/TIKTOK_EN\s*:\s*([\s\S]*?)(?:YOUTUBE_EN\s*:|$)/i);
  var mYe=t.match(/YOUTUBE_EN\s*:\s*([\s\S]*)$/i);
  var corta=function(v){
    v=String(v||'').replace(/\n+/g,' ').trim();
    if(v.length<=100)return v;
    var cut=v.slice(0,100),sp=cut.lastIndexOf(' ');
    return (sp>60?cut.slice(0,sp):cut).trim();
  };
  lastCaptionEN=mCe?mCe[1].trim():'';
  lastTagsEN=mHe?mHe[1].replace(/\n+/g,' ').replace(/\s{2,}/g,' ').trim():'';
  lastTikTokEN=mTe?mTe[1].replace(/\n+/g,' ').trim():'';
  lastYouTubeEN=corta(mYe?mYe[1]:'');
  if(lastTagsEN&&lastTagsEN.toLowerCase().indexOf('#ironlegacy')<0)lastTagsEN='#IronLegacy '+lastTagsEN;
  if(mC)caption=mC[1].trim();
  if(mH)tags=mH[1].trim();
  lastTikTok=mT?mT[1].trim():'';
  lastYouTube=mY?mY[1].replace(/\n+/g,' ').trim():'';
  if(lastYouTube.length>100){
    // Cortar en el ultimo espacio antes de 100 para no partir una palabra ni un hashtag.
    var cut=lastYouTube.slice(0,100);
    var sp=cut.lastIndexOf(' ');
    lastYouTube=(sp>60?cut.slice(0,sp):cut).trim();
  }
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
// Ajustes de voz: dos motores (ElevenLabs y Gemini), cada uno con sus controles.
var voxWired=false;
function wireVox(){
  var VAL_G={
    voz:VOCES.map(function(x){return x.v;}),
    tono:['canal','autoridad','duro','cercano','energico','calmado','narrador'],
    velocidad:['0.80','0.90','1.00','1.10','1.20'],
    intensidad:['baja','media','alta'],
    model:['gemini-2.5-flash-tts','gemini-2.5-pro-tts','gemini-2.5-flash-lite-preview-tts'],
  };
  var RANGO_E={stability:[0,1],similarity_boost:[0,1],style:[0,1],speed:[0.7,1.2]};
  try{
    var saved=localStorage.getItem('lh_vox');
    if(saved){
      var o=JSON.parse(saved);
      if(o.engine==='eleven'||o.engine==='gemini'||o.engine==='chirp')VOX.engine=o.engine;
      if(o.chirp){
        if(VAL_G.voz.indexOf(o.chirp.voz)>-1)VOX.chirp.voz=o.chirp.voz;
        var cn=Number(o.chirp.velocidad);
        if(isFinite(cn)&&cn>=0.7&&cn<=1.3)VOX.chirp.velocidad=cn;
      }
      if(o.gemini)for(var k in o.gemini){
        if(!VOX.gemini.hasOwnProperty(k))continue;
        if(k==='extra'){VOX.gemini.extra=String(o.gemini.extra||'').slice(0,200);continue;}
        if(VAL_G[k]&&VAL_G[k].indexOf(o.gemini[k])>-1)VOX.gemini[k]=o.gemini[k];
      }
      // Solo numeros validos y dentro de rango (ojo: Number(null) es 0).
      if(o.eleven)for(var k2 in o.eleven){
        if(!VOX.eleven.hasOwnProperty(k2))continue;
        if(typeof VOX.eleven[k2]==='boolean'){VOX.eleven[k2]=!!o.eleven[k2];continue;}
        var raw=o.eleven[k2];
        if(raw===null||raw===undefined||raw==='')continue;
        var n=Number(raw),rg=RANGO_E[k2];
        if(isFinite(n)&&(!rg||(n>=rg[0]&&n<=rg[1])))VOX.eleven[k2]=n;
      }
    }
  }catch(e){}
  function save(){ try{localStorage.setItem('lh_vox',JSON.stringify(VOX));}catch(e){} }

  // Selector de voces de Gemini, agrupado por tipo. Se rellena una sola vez.
  var sel=document.getElementById('vVoz');
  if(sel&&!sel.options.length){
    var gH=document.createElement('optgroup');gH.label='Masculinas';
    var gM=document.createElement('optgroup');gM.label='Femeninas';
    VOCES.forEach(function(x){
      var op=document.createElement('option');
      op.value=x.v;op.textContent=x.v+' — '+x.d;
      (x.s==='H'?gH:gM).appendChild(op);
    });
    sel.appendChild(gH);sel.appendChild(gM);
  }

  var selC=document.getElementById('cVoz');
  if(selC&&!selC.options.length){
    var cH=document.createElement('optgroup');cH.label='Masculinas';
    var cM=document.createElement('optgroup');cM.label='Femeninas';
    VOCES.forEach(function(x){
      var op=document.createElement('option');
      op.value=x.v;op.textContent=x.v+' — '+x.d;
      (x.s==='H'?cH:cM).appendChild(op);
    });
    selC.appendChild(cH);selC.appendChild(cM);
  }

  var campG=[['vVoz','voz'],['vTono','tono'],['vVel','velocidad'],['vInt','intensidad'],['vModel','model'],['vExtra','extra']];
  var campE=[['vStab','vStabV','stability'],['vSim','vSimV','similarity_boost'],['vSty','vStyV','style'],['vSpd','vSpdV','speed']];

  function paint(){
    var e=document.getElementById('vEngine');
    if(e)e.value=VOX.engine;
    // Solo se muestran los ajustes del motor elegido.
    var pe=document.getElementById('voxEleven'),pg=document.getElementById('voxGemini'),pc=document.getElementById('voxChirp');
    if(pe)pe.style.display=VOX.engine==='eleven'?'block':'none';
    if(pg)pg.style.display=VOX.engine==='gemini'?'block':'none';
    if(pc)pc.style.display=VOX.engine==='chirp'?'block':'none';
    var cv=document.getElementById('cVoz');if(cv)cv.value=VOX.chirp.voz;
    var cr=document.getElementById('cVel'),crv=document.getElementById('cVelV');
    if(cr)cr.value=VOX.chirp.velocidad;
    if(crv)crv.textContent=Number(VOX.chirp.velocidad).toFixed(2);
    campG.forEach(function(c){
      var el=document.getElementById(c[0]);
      if(el)el.value=VOX.gemini[c[1]];
    });
    campE.forEach(function(c){
      var r=document.getElementById(c[0]),v=document.getElementById(c[1]);
      if(r)r.value=VOX.eleven[c[2]];
      if(v)v.textContent=Number(VOX.eleven[c[2]]).toFixed(2);
    });
    var b=document.getElementById('vBoost');
    if(b)b.checked=!!VOX.eleven.use_speaker_boost;
  }

  // Los manejadores se conectan UNA sola vez: wireVox corre en cada guion generado
  // y, sin esta guarda, se acumularian listeners sobre los mismos campos.
  if(!voxWired){
    var eng=document.getElementById('vEngine');
    if(eng)eng.addEventListener('change',function(){VOX.engine=eng.value;paint();save();});
    campG.forEach(function(c){
      var el=document.getElementById(c[0]);
      if(!el)return;
      el.addEventListener(c[0]==='vExtra'?'input':'change',function(){
        VOX.gemini[c[1]]=c[1]==='extra'?el.value.slice(0,200):el.value;
        save();
      });
    });
    campE.forEach(function(c){
      var r=document.getElementById(c[0]);
      if(!r)return;
      r.addEventListener('input',function(){
        VOX.eleven[c[2]]=parseFloat(r.value);
        var v=document.getElementById(c[1]);
        if(v)v.textContent=parseFloat(r.value).toFixed(2);
        save();
      });
    });
    var bx=document.getElementById('vBoost');
    if(bx)bx.addEventListener('change',function(){VOX.eleven.use_speaker_boost=bx.checked;save();});
    var cvz=document.getElementById('cVoz');
    if(cvz)cvz.addEventListener('change',function(){VOX.chirp.voz=cvz.value;save();});
    var cvl=document.getElementById('cVel');
    if(cvl)cvl.addEventListener('input',function(){
      VOX.chirp.velocidad=parseFloat(cvl.value);
      var e2=document.getElementById('cVelV');if(e2)e2.textContent=parseFloat(cvl.value).toFixed(2);
      save();
    });
    Array.prototype.forEach.call(document.querySelectorAll('.chirpSet'),function(btn){
      btn.addEventListener('click',function(){
        var p=(btn.getAttribute('data-p')||'').split(',');
        if(p.length!==2||VAL_G.voz.indexOf(p[0])===-1)return;
        var n2=parseFloat(p[1]);if(!isFinite(n2))return;
        VOX.chirp.voz=p[0];VOX.chirp.velocidad=n2;
        paint();save();
      });
    });
    // OJO: .voxP es solo una clase de ESTILO, compartida con los botones de
    // plantilla de post y de musica. Cada grupo escucha SOLO a su propia clase.
    Array.prototype.forEach.call(document.querySelectorAll('.voxSet'),function(btn){
      btn.addEventListener('click',function(){
        var p=(btn.getAttribute('data-p')||'').split(',');
        if(p.length!==4)return;
        if(VAL_G.voz.indexOf(p[0])===-1||VAL_G.tono.indexOf(p[1])===-1)return;
        if(VAL_G.velocidad.indexOf(p[2])===-1||VAL_G.intensidad.indexOf(p[3])===-1)return;
        VOX.gemini.voz=p[0];VOX.gemini.tono=p[1];VOX.gemini.velocidad=p[2];VOX.gemini.intensidad=p[3];
        paint();save();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.elevenSet'),function(btn){
      btn.addEventListener('click',function(){
        var p=(btn.getAttribute('data-p')||'').split(',').map(parseFloat);
        if(p.length!==4||p.some(function(n){return !isFinite(n);}))return;
        VOX.eleven.stability=p[0];VOX.eleven.similarity_boost=p[1];
        VOX.eleven.style=p[2];VOX.eleven.speed=p[3];
        paint();save();
      });
    });
    voxWired=true;
  }
  paint();
}

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
      // Se manda SOLO el bloque de ajustes del motor elegido.
      body:JSON.stringify({text:text,engine:VOX.engine,voice:VOX[VOX.engine],lang:isEN?'en':'es'}),
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
      // Una sola parte: se usa tal cual (Gemini-TTS entrega WAV ya con cabecera).
      var bytes=b64ToBytes(partsB64[0]);
      blob=new Blob([bytes],{type:(data.format==='wav'?'audio/wav':'audio/mpeg')});
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
    // partsB64: los MP3 originales de ElevenLabs, tal como llegaron. El servicio de
    // unificacion (Cloud Run) los une el mismo; asi no se manda el WAV gigante.
    if(isEN){audEN={blob:blob,url:url,alignment:combinedAlignment,partsB64:partsB64};}
    else{audES={blob:blob,url:url,alignment:combinedAlignment,partsB64:partsB64};}
    // Se suelta el cache de la escucha con CUALQUIERA de los dos idiomas: ahora
    // la vista previa tambien suena en ingles, asi que regenerar el audio EN
    // tambien tiene que invalidarla.
    if(typeof invalidateVoiceMix==='function')invalidateVoiceMix();
    document.getElementById(isEN?'pEN':'pES').src=url;
    document.getElementById(isEN?'dEN':'dES').href=url;
    document.getElementById(isEN?'rEN':'rES').style.display='block';
    st.textContent=isEN?'Audio EN listo.':'Audio ES listo.';
    cost+=0.05;updCost();chkExport();updUnifyCard();
  }catch(e){
    er.textContent='Error: '+e.message;er.style.display='block';st.style.display='none';
  }finally{
    btn.textContent=orig;btn.style.opacity='1';btn.disabled=false;
  }
}

// ============================================================================
//  BANCO DE VIDEOS YA GENERADOS
//  Trae clips que ya estan en el bucket para montar un reel nuevo sin volver a
//  generarlos. Se eligen TOCANDOLOS EN ORDEN: el orden de seleccion es el orden
//  en que se van a ensamblar, que es lo unico que importa para el montaje.
// ============================================================================
var BANCO=[];        // lo que hay en el bucket
var BANCO_SEL=[];    // objetos elegidos, EN ORDEN
var BANCO_TODOS=false; // false = solo la carpeta del canal; true = tambien la raiz
var BANCO_VIS=9;       // cuantos clips se pintan de golpe (el resto, con "Ver mas")
var BANCO_IO=null;     // observador de visibilidad

// Cambia SOLO los numeros y los bordes de la seleccion. Es importante que no
// rehaga el HTML: al rehacerlo se destruian y recreaban todos los <video>, y por
// eso todo lo que ya se habia visto volvia a negro y el panel se colgaba.
function actualizarBadges(){
  var p=document.getElementById('bancoPanel');if(!p)return;
  Array.prototype.forEach.call(p.querySelectorAll('.bancoIt'),function(el){
    var c=BANCO[parseInt(el.getAttribute('data-i'),10)];
    if(!c)return;
    var pos=BANCO_SEL.indexOf(c.object),sel=pos>-1;
    el.style.borderColor=sel?'#9ab47a':'var(--border)';
    var n=el.querySelector('.bancoNum');
    if(n){n.textContent=sel?(pos+1):'+';n.style.background=sel?'#9ab47a':'rgba(0,0,0,.55)';}
  });
  var us=p.querySelector('#bBancoUsar');
  if(us){
    us.textContent=BANCO_SEL.length?('✓ Usar estos '+BANCO_SEL.length+' clips en este orden'):'Toca los clips que quieras usar';
    us.style.background=BANCO_SEL.length?'#9ab47a':'#fff';
    us.style.color=BANCO_SEL.length?'#fff':'#6a8a4a';
  }
}

// Carga el video SOLO cuando esta a la vista y lo suelta al alejarse. Sin esto,
// una docena larga de videos vivos a la vez deja al navegador del movil en blanco.
function observarBanco(p){
  if(BANCO_IO){try{BANCO_IO.disconnect();}catch(e){}BANCO_IO=null;}
  if(typeof IntersectionObserver==='undefined'){
    // Navegador antiguo: se cargan tal cual, que son pocos por pagina.
    Array.prototype.forEach.call(p.querySelectorAll('.bancoVid'),function(v){
      if(!v.src)v.src=v.getAttribute('data-src')||'';
    });
    return;
  }
  BANCO_IO=new IntersectionObserver(function(entradas){
    entradas.forEach(function(en){
      var v=en.target;
      if(en.isIntersecting){
        if(!v.getAttribute('src')){v.preload='metadata';v.setAttribute('src',v.getAttribute('data-src')||'');}
      }else{
        if(!v.paused){try{v.pause();}catch(e){}}
        // Se libera el decodificador del que ya no se ve.
        if(v.getAttribute('src')){v.removeAttribute('src');try{v.load();}catch(e){}}
      }
    });
  },{root:p,rootMargin:'150px 0px'});
  Array.prototype.forEach.call(p.querySelectorAll('.bancoVid'),function(v){BANCO_IO.observe(v);});
}

// Cerrar el panel suelta TODO: observador, reproduccion y decodificadores. Si no,
// los videos siguen en memoria aunque el panel no se vea.
function cerrarBanco(p){
  p=p||document.getElementById('bancoPanel');
  if(!p)return;
  if(BANCO_IO){try{BANCO_IO.disconnect();}catch(e){}BANCO_IO=null;}
  Array.prototype.forEach.call(p.querySelectorAll('.bancoVid'),function(v){
    try{v.pause();}catch(e){}
    if(v.getAttribute('src')){v.removeAttribute('src');try{v.load();}catch(e){}}
  });
  p.style.display='none';
}

function abrirBancoRecargar(){
  cerrarBanco(); // suelta los videos y fuerza que abrirBanco recargue
  return abrirBanco();
}

async function abrirBanco(){
  var p=document.getElementById('bancoPanel');
  var b=document.getElementById('bbanco');
  if(!p)return;
  if(p.style.display==='block'){
    cerrarBanco(p);
    return;
  }
  p.style.display='block';
  p.innerHTML='<div style="font-size:12px;color:var(--tx3);padding:8px">Buscando tus videos en el bucket...</div>';
  var orig=b?b.textContent:'';
  if(b){b.disabled=true;b.textContent='Buscando...';}
  try{
    var r=await fetch('/api/videos',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'list',todos:BANCO_TODOS})});
    var d=await r.json().catch(function(){return{};});
    if(!r.ok)throw new Error(d.error||'Error '+r.status);
    BANCO=d.clips||[];BANCO_SEL=[];BANCO_VIS=9;
    pintarBanco();
  }catch(e){
    p.innerHTML='<div style="font-size:12px;color:#8a4a3a;padding:8px">No se pudo leer el banco: '+escHtml(e.message||'error')+'</div>';
  }finally{
    if(b){b.disabled=false;b.textContent=orig;}
  }
}

function pintarBanco(){
  var p=document.getElementById('bancoPanel');if(!p)return;
  var alterna='<button type="button" class="voxP" id="bBancoTodos" style="margin-top:8px">'
    +(BANCO_TODOS?'Ver solo los de Legado de Hierro':'Ver también los antiguos (raíz del bucket)')+'</button>';
  if(!BANCO.length){
    p.innerHTML='<div style="font-size:12px;color:var(--tx3);padding:8px;line-height:1.6">'
      +(BANCO_TODOS
        ?'No hay videos guardados todavia en el bucket.'
        :'Todavia no hay clips en la carpeta de Legado de Hierro. Los que generes a partir de ahora se guardaran ahi. '
         +'Los de antes quedaron en la raiz del bucket, mezclados con los de tus otros proyectos:')
      +'</div>'+(BANCO_TODOS?'':alterna);
    var b0=p.querySelector('#bBancoTodos');
    if(b0)b0.addEventListener('click',function(){BANCO_TODOS=!BANCO_TODOS;abrirBancoRecargar();});
    return;
  }
  var h='<div style="font-size:11px;color:var(--tx2);line-height:1.5;margin-bottom:9px">'
    +'<strong>'+BANCO.length+' clips</strong> '
    +(BANCO_TODOS?'de TODO el bucket (incluye otros proyectos)':'de Legado de Hierro')
    +', del mas reciente al mas antiguo. '
    +'Toca ▶ para <strong>ver</strong> cualquiera, y el recuadro para <strong>elegirlo</strong>. '
    +'El numero es su posicion en el reel: se unen en el orden en que los tocas.</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'
    +'<button type="button" class="voxP" id="bBancoTop5">Elegir los 5 mas recientes</button>'
    +'<button type="button" class="voxP" id="bBancoTop3">Elegir los 3 mas recientes</button>'
    +'<button type="button" class="voxP" id="bBancoClear">Limpiar seleccion</button>'
    +'<button type="button" class="voxP" id="bBancoTodos">'
    +(BANCO_TODOS?'Solo Legado de Hierro':'Ver también los antiguos')+'</button>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:7px">';
  // Solo se pintan BANCO_VIS de golpe. Meter 120 <video> a la vez tumba a Safari
  // en el iPhone: se queda sin decodificadores y la pantalla se pone en blanco.
  var visibles=Math.min(BANCO_VIS,BANCO.length);
  BANCO.slice(0,visibles).forEach(function(c,i){
    var pos=BANCO_SEL.indexOf(c.object);
    var sel=pos>-1;
    var fecha=c.fecha?new Date(c.fecha).toLocaleString('es',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'';
    // El src va en data-src: se carga SOLO cuando el clip entra en pantalla, y
    // se suelta al alejarse. Asi nunca hay muchos videos vivos a la vez.
    h+='<div class="bancoIt" data-i="'+i+'" style="position:relative;border-radius:9px;overflow:hidden;cursor:pointer;'
      +'border:2.5px solid '+(sel?'#9ab47a':'var(--border)')+';background:#000">'
      +'<video class="bancoVid" data-src="'+escHtml(c.url||'')+'" preload="none" muted playsinline '
      +'style="width:100%;aspect-ratio:9/16;object-fit:cover;display:block;background:#000"></video>'
      +'<span class="bancoNum" style="position:absolute;top:5px;left:5px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;'
      +'font-size:11px;font-weight:700;background:'+(sel?'#9ab47a':'rgba(0,0,0,.55)')+';color:#fff">'+(sel?(pos+1):'+')+'</span>'
      +'<button type="button" class="bancoPlay" data-i="'+i+'" style="position:absolute;top:5px;right:5px;width:24px;height:24px;border:none;border-radius:50%;'
      +'background:rgba(0,0,0,.55);color:#fff;font-size:11px;cursor:pointer;padding:0;font-family:inherit">▶</button>'
      +'<span style="position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;'
      +'font-size:9px;padding:10px 5px 3px;display:block">'+escHtml(fecha)+'</span>'
      +'</div>';
  });
  h+='</div>';
  if(BANCO.length>visibles){
    h+='<button type="button" class="voxP" id="bBancoMas" style="width:100%;margin-top:8px">'
      +'Ver 9 mas ('+(BANCO.length-visibles)+' restantes)</button>';
  }
  // El boton de confirmar va PEGADO abajo (sticky): antes quedaba debajo de las
  // miniaturas, fuera de la vista, y se seleccionaban clips sin llegar a
  // confirmarlos nunca — por eso la unificacion seguia diciendo que faltaban.
  h+='<div style="position:sticky;bottom:-10px;margin:8px -10px -10px;padding:8px 10px 10px;background:#fbfcf9;border-top:1px solid var(--border);z-index:5">'
    +'<button type="button" id="bBancoUsar" style="width:100%;padding:13px;border-radius:10px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;'
    +'border:2px solid #9ab47a;background:'+(BANCO_SEL.length?'#9ab47a':'#fff')+';color:'+(BANCO_SEL.length?'#fff':'#6a8a4a')+'">'
    +(BANCO_SEL.length?('✓ Usar estos '+BANCO_SEL.length+' clips en este orden'):'Toca los clips que quieras usar')+'</button>'
    +'</div>';
  p.innerHTML=h;

  Array.prototype.forEach.call(p.querySelectorAll('.bancoIt'),function(el){
    el.addEventListener('click',function(){
      var c=BANCO[parseInt(el.getAttribute('data-i'),10)];
      if(!c)return;
      var k=BANCO_SEL.indexOf(c.object);
      if(k>-1){
        BANCO_SEL.splice(k,1);
      }else{
        // La unificacion admite 10 clips como maximo. Se avisa AQUI, al elegir,
        // y no al final: antes se podian marcar 12 y el aviso llegaba despues de
        // confirmarlos, cuando ya no se sabia cual sobraba.
        if(BANCO_SEL.length>=10){
          alert('El máximo son 10 clips por reel (ya tienes 10 marcados). Quita alguno tocándolo otra vez si quieres cambiarlo.');
          return;
        }
        BANCO_SEL.push(c.object);
      }
      // NO se redibuja el panel: solo cambian los numeros y los bordes. Antes se
      // rehacia el HTML entero y eso reiniciaba todos los videos a negro.
      actualizarBadges();
    });
  });
  var mas=p.querySelector('#bBancoMas');
  if(mas)mas.addEventListener('click',function(){BANCO_VIS+=9;pintarBanco();});
  observarBanco(p);
  // Ver un clip. Se para el clic para que mirarlo NO lo seleccione, y se pausan
  // los demas: asi nunca suenan/corren dos a la vez.
  Array.prototype.forEach.call(p.querySelectorAll('.bancoPlay'),function(btn){
    btn.addEventListener('click',function(ev){
      ev.stopPropagation();
      var vids=p.querySelectorAll('.bancoVid');
      var v=vids[parseInt(btn.getAttribute('data-i'),10)];
      if(!v)return;
      Array.prototype.forEach.call(vids,function(o){if(o!==v&&!o.paused){try{o.pause();}catch(e){}}});
      // Puede no estar cargado todavia (se cargan solo los que estan a la vista).
      if(!v.getAttribute('src')){v.preload='auto';v.setAttribute('src',v.getAttribute('data-src')||'');}
      if(v.paused){v.play().catch(function(){});btn.textContent='❚❚';}
      else{v.pause();btn.textContent='▶';}
      v.onended=function(){btn.textContent='▶';};
    });
  });
  var t5=p.querySelector('#bBancoTop5');if(t5)t5.addEventListener('click',function(){BANCO_SEL=BANCO.slice(0,5).map(function(c){return c.object;});pintarBanco();});
  var t3=p.querySelector('#bBancoTop3');if(t3)t3.addEventListener('click',function(){BANCO_SEL=BANCO.slice(0,3).map(function(c){return c.object;});pintarBanco();});
  var cl=p.querySelector('#bBancoClear');if(cl)cl.addEventListener('click',function(){BANCO_SEL=[];pintarBanco();});
  var bt=p.querySelector('#bBancoTodos');
  if(bt)bt.addEventListener('click',function(){BANCO_TODOS=!BANCO_TODOS;abrirBancoRecargar();});
  var us=p.querySelector('#bBancoUsar');if(us)us.addEventListener('click',usarBanco);
}

async function usarBanco(){
  if(!BANCO_SEL.length){alert('Toca primero los clips que quieres usar.');return;}
  var us=document.getElementById('bBancoUsar');
  var orig=us?us.textContent:'';
  if(us){us.disabled=true;us.textContent='Preparando los clips...';}
  try{
    // URLs firmadas: son las que descarga el servicio de unificacion.
    var r=await fetch('/api/videos',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'link',objects:BANCO_SEL})});
    var d=await r.json().catch(function(){return{};});
    if(!r.ok||!d.urls)throw new Error(d.error||'Error '+r.status);
    // Se colocan EN EL MISMO ORDEN en que se eligieron.
    vids=d.urls.map(function(u){return {url:u,remoteUrl:u,delBanco:true};});
    vidState=d.urls.map(function(){return 'done';});
    cerrarBanco();
    updUnifyCard();chkExport();
    alert('Listos '+d.urls.length+' clips del banco, en el orden que elegiste. Ya puedes unificar (solo falta la narración).');
  }catch(e){
    alert('No se pudieron preparar los clips: '+(e.message||'error'));
  }finally{
    if(us){us.disabled=false;us.textContent=orig;}
  }
}

// ============================================================================
//  SUBIR LA NARRACION YA GENERADA (sin gastar API)
//  Permite crear el audio por fuera —p. ej. en la web de ElevenLabs, con los
//  creditos gratis y la voz de siempre del canal— y cargarlo aqui. A partir de
//  ese punto TODO sigue igual: mezcla con musica, unificacion y exportacion.
//  El archivo no pasa por ningun servidor: se lee en el propio navegador.
// ============================================================================
var MAX_AUD_MB=20;

function bytesToB64(bytes){
  // Por trozos: pasar un array enorme a fromCharCode de una vez desborda la pila.
  var CH=0x8000,partes=[];
  for(var i=0;i<bytes.length;i+=CH)partes.push(String.fromCharCode.apply(null,bytes.subarray(i,i+CH)));
  return btoa(partes.join(''));
}

async function subirAudio(file,isEN){
  var st=document.getElementById('upAudSt');
  function di(msg,err){
    if(!st)return;
    st.style.display='block';
    st.style.color=err?'#8a4a3a':'var(--tx3)';
    st.textContent=msg;
  }
  if(!file)return;
  var mb=file.size/1048576;
  if(mb>MAX_AUD_MB){di('Ese archivo pesa '+mb.toFixed(1)+' MB y el maximo es '+MAX_AUD_MB+' MB. Exportalo en MP3 y vuelve a intentarlo.',true);return;}
  di('Cargando "'+file.name+'"...');
  try{
    var ab=await file.arrayBuffer();
    var bytes=new Uint8Array(ab);
    if(bytes.length<1000)throw new Error('El archivo llego vacio o corrupto.');
    var b64=bytesToB64(bytes);
    var tipo=file.type||(/\.wav$/i.test(file.name)?'audio/wav':/\.m4a$/i.test(file.name)?'audio/mp4':/\.ogg$/i.test(file.name)?'audio/ogg':'audio/mpeg');
    var blob=new Blob([bytes],{type:tipo});
    var url=URL.createObjectURL(blob);

    // Se MIDE el audio: cuanto dura y, sobre todo, en que segundo empieza y
    // termina la voz. Antes solo se sacaba la duracion para enseñarla y se
    // tiraba. Ese dato es justo el que hace falta para que los subtitulos vayan
    // al ritmo del audio subido: sin el, el reparto de tiempos se hacia con una
    // velocidad de habla inventada (130 palabras por minuto) y el desfase se iba
    // acumulando hasta quedar muy por detras al final del reel.
    var dur=0,vozIni=0,vozFin=0,vozTramos=null;
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      var ctx=new AC();
      var dec=await ctx.decodeAudioData(bytes.slice(0).buffer);
      dur=dec.duration;
      var v=tramoDeVoz(dec);
      vozIni=v.ini;vozFin=v.fin;vozTramos=v.tramos;
      if(ctx.close)ctx.close();
    }catch(e){/* si el navegador no sabe decodificarlo, se sigue igual */}

    // Sin alignment de ElevenLabs (el plan gratis no da API), pero SI con la
    // medida real del audio: los subtitulos se ajustan a ella.
    var reg={blob:blob,url:url,alignment:null,partsB64:[b64],
             dur:dur,vozIni:vozIni,vozFin:vozFin,vozTramos:vozTramos,subido:true};
    if(isEN){audEN=reg;}else{audES=reg;}
    if(typeof invalidateVoiceMix==='function')invalidateVoiceMix();
    var ext=/wav/.test(tipo)?'wav':/mp4|m4a/.test(tipo)?'m4a':/ogg/.test(tipo)?'ogg':'mp3';
    var pl=document.getElementById(isEN?'pEN':'pES');if(pl)pl.src=url;
    var dl=document.getElementById(isEN?'dEN':'dES');
    if(dl){dl.href=url;dl.setAttribute('download','legado-'+(isEN?'en':'es')+'.'+ext);}
    var box=document.getElementById(isEN?'rEN':'rES');if(box)box.style.display='block';
    di('Audio '+(isEN?'EN':'ES')+' cargado: "'+file.name+'"'+(dur?' · '+dur.toFixed(1)+' s':'')+
       '. Ya puedes unificar; no se gasto ningun credito.');
    chkExport();updUnifyCard();
  }catch(e){
    di('No se pudo cargar el audio: '+(e.message||'archivo no valido'),true);
  }
}

// Busca en que segundo EMPIEZA y en cual TERMINA la voz dentro del audio.
// Los archivos que salen de ElevenLabs suelen traer un poco de silencio delante
// y detras; si se reparten los subtitulos sobre la duracion total, todos salen
// corridos. Se recorre la onda en ventanas de 20 ms y se busca donde la energia
// pasa de un umbral relativo al pico (no absoluto: asi da igual si el audio esta
// grabado fuerte o flojo).
function tramoDeVoz(buf){
  var d=buf.getChannelData(0),sr=buf.sampleRate;
  var vent=Math.max(1,Math.round(sr*0.02)),n=Math.floor(d.length/vent);
  var e=new Float32Array(n),pico=0;
  for(var i=0;i<n;i++){
    var s=0,base=i*vent;
    for(var j=0;j<vent;j++){var x=d[base+j];s+=x*x;}
    e[i]=Math.sqrt(s/vent);
    if(e[i]>pico)pico=e[i];
  }
  if(!pico)return {ini:0,fin:buf.duration,tramos:null};
  var umbral=pico*0.06; // 6% del pico: por encima de eso ya es voz, no ruido de fondo
  var a=0,b=n-1;
  while(a<n&&e[a]<umbral)a++;
  while(b>a&&e[b]<umbral)b--;
  if(a>=n)return {ini:0,fin:buf.duration,tramos:null};
  // Un pelin de margen para no cortar el ataque de la primera silaba.
  var ini=Math.max(0,(a*vent)/sr-0.05);
  var fin=Math.min(buf.duration,((b+1)*vent)/sr+0.05);
  if(fin-ini<0.5)return {ini:0,fin:buf.duration,tramos:null}; // medida absurda: mejor no fiarse

  // LOS TRAMOS DE VOZ, uno por cada trozo hablado entre silencios.
  //
  // Con el tramo entero bastaba en un reel de 40 s. En un video de tres minutos
  // no: repartir el texto proporcionalmente sobre TODO el tramo mete dentro los
  // silencios entre parrafos, que no son texto, y el desfase se va acumulando
  // hasta que al final los subtitulos van por otro lado. Sabiendo donde calla,
  // el texto se reparte solo por el tiempo en el que de verdad habla.
  var SILENCIO=Math.round(0.28/0.02);   // 280 ms callado ya cuenta como pausa
  var tramos=[],dentro=false,desde=0,callado=0;
  for(var k=a;k<=b;k++){
    if(e[k]>=umbral){
      if(!dentro){dentro=true;desde=k;}
      callado=0;
    }else if(dentro){
      callado++;
      if(callado>=SILENCIO){
        tramos.push({ini:(desde*vent)/sr,fin:((k-callado+1)*vent)/sr});
        dentro=false;
      }
    }
  }
  if(dentro)tramos.push({ini:(desde*vent)/sr,fin:((b+1)*vent)/sr});
  tramos=tramos.filter(function(t){return t.fin-t.ini>0.15;});
  if(!tramos.length)tramos=null;
  return {ini:ini,fin:fin,tramos:tramos};
}

// Pasa una posicion medida en TIEMPO HABLADO a la posicion real del audio,
// saltandose los silencios. Si no hay tramos medidos, reparte lineal.
function tiempoRealDeVoz(tramos,ini,fin,tVoz){
  if(!tramos||!tramos.length)return ini+tVoz;
  var acum=0;
  for(var i=0;i<tramos.length;i++){
    var d=tramos[i].fin-tramos[i].ini;
    if(tVoz<=acum+d)return tramos[i].ini+(tVoz-acum);
    acum+=d;
  }
  return tramos[tramos.length-1].fin;
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

var lastTikTok='',lastYouTube='';
// La version en ingles del caption y los hashtags: viene en la MISMA llamada a
// Gemini que la espanola, asi que no cuesta nada extra.
var lastCaptionEN='',lastTagsEN='',lastTikTokEN='',lastYouTubeEN='';
// Ajustes de voz de ElevenLabs. Rangos reales de la API: stability/similarity/style 0-1;
// speed 0.7-1.2 (fuera de ese rango la calidad se degrada).
// Las 30 voces de Gemini con su caracter, para poder elegir con criterio.
// Las masculinas graves y firmes van primero: son las que encajan con la marca.
var VOCES=[
  {v:'Alnilam',s:'H',d:'Firme y fuerte'},
  {v:'Orus',s:'H',d:'Firme y decidida'},
  {v:'Charon',s:'H',d:'Informativa y clara'},
  {v:'Sadaltager',s:'H',d:'Con conocimiento y autoridad'},
  {v:'Rasalgethi',s:'H',d:'Informativa y profesional'},
  {v:'Algenib',s:'H',d:'Rasposa, con textura'},
  {v:'Iapetus',s:'H',d:'Clara y bien articulada'},
  {v:'Schedar',s:'H',d:'Pareja y equilibrada'},
  {v:'Algieba',s:'H',d:'Suave y agradable'},
  {v:'Achird',s:'H',d:'Amistosa y cercana'},
  {v:'Umbriel',s:'H',d:'Tranquila y relajada'},
  {v:'Zubenelgenubi',s:'H',d:'Casual y conversacional'},
  {v:'Puck',s:'H',d:'Animada y con energía'},
  {v:'Fenrir',s:'H',d:'Excitable y dinámica'},
  {v:'Sadachbia',s:'H',d:'Viva y animada'},
  {v:'Enceladus',s:'H',d:'Susurrada y suave'},
  {v:'Kore',s:'M',d:'Firme y segura'},
  {v:'Gacrux',s:'M',d:'Madura y con experiencia'},
  {v:'Erinome',s:'M',d:'Clara y precisa'},
  {v:'Sulafat',s:'M',d:'Cálida y acogedora'},
  {v:'Despina',s:'M',d:'Suave y fluida'},
  {v:'Aoede',s:'M',d:'Ligera y natural'},
  {v:'Autonoe',s:'M',d:'Brillante y optimista'},
  {v:'Callirrhoe',s:'M',d:'Tranquila y relajada'},
  {v:'Laomedeia',s:'M',d:'Animada y alegre'},
  {v:'Leda',s:'M',d:'Joven y con energía'},
  {v:'Zephyr',s:'M',d:'Brillante y alegre'},
  {v:'Pulcherrima',s:'M',d:'Directa y expresiva'},
  {v:'Vindemiatrix',s:'M',d:'Amable y suave'},
  {v:'Achernar',s:'M',d:'Delicada y suave'},
];
// Ajustes de voz. Se guardan por MOTOR, para poder cambiar de uno a otro sin
// perder lo que tenias afinado en cada uno.
//  - eleven: perillas numericas de ElevenLabs (la voz original del canal).
//  - gemini: no hay perillas; el tono, la velocidad y la intensidad se convierten
//    en el servidor en una instruccion hablada delante del guion.
var VOX={
  engine:'eleven',
  eleven:{stability:0.5,similarity_boost:0.75,style:0,speed:1,use_speaker_boost:true},
  gemini:{voz:'Algenib',tono:'canal',velocidad:'0.90',intensidad:'media',model:'gemini-2.5-flash-tts',extra:''},
  chirp:{voz:'Algenib',velocidad:0.9},
};
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

// Minimo de referencias para permitir generar: con menos, el rostro del
// personaje sale MAL y la imagen es plata perdida — mejor frenar y reintentar.
var MIN_REFS=2;

async function loadRefs(){
  // 4 referencias FIJAS del personaje -- siempre las mismas, para maxima consistencia.
  // CAMINO 1 (principal): pedirlas al SERVIDOR (/api/refs?set=personaje), que las
  // descarga y cachea alla — mucho mas confiable que bajarlas en el navegador
  // del celular, donde ibb.co a veces falla y el personaje salia con otro rostro.
  try{
    var rr=await fetch('/api/refs?set=personaje');
    if(rr.ok){
      var dd=await rr.json().catch(function(){return{};});
      if(dd.refs&&dd.refs.length>=MIN_REFS){
        loadedRefsCount=dd.refs.length;
        return dd.refs;
      }
    }
  }catch(e){console.warn('Refs por servidor fallaron:',e.message);}
  // CAMINO 2 (respaldo): descarga directa desde el navegador, como antes.
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

// Cache de las vistas de cada secundario, para no pedirlas al servidor una vez
// por imagen. Se llenan la primera vez que ese personaje aparece.
var REFS_PERSONAJE={};

// El director marca los prompts con [CON: id] cuando en esa escena aparece
// alguien del reparto. Aqui se traduce esa marca a: (a) sus vistas de referencia,
// para que salga con SU cara y no con una persona cualquiera distinta cada vez,
// y (b) una descripcion suya dentro del prompt.
async function refsDeEscena(prompt){
  var ids=[],re=/\[CON:\s*([a-z0-9-]+)\s*\]/gi,m;
  while((m=re.exec(prompt))!==null){ if(ids.indexOf(m[1])<0)ids.push(m[1]); }
  // [LUGAR: id] se quita aqui igual que [CON: id]: es una marca para la
  // herramienta, no algo que tenga que leer el generador de imagenes.
  var limpio=prompt.replace(/\[CON:\s*[a-z0-9-]+\s*\]/gi,'')
    .replace(/\[LUGAR:\s*[a-z0-9-]+\s*\]/gi,'').replace(/^\s+/,'');
  if(!ids.length)return {prompt:limpio,refs:null,ids:[]};

  var extra=[],fichas=[];
  for(var i=0;i<ids.length&&i<2;i++){
    var p=personajePorId(ids[i]);
    if(!p)continue;
    fichas.push(p.nombre+' ('+(p.rol||'')+'): '+p.fisico+(p.vestuario?'. Viste: '+p.vestuario:''));
    if(REFS_PERSONAJE[p.id]===undefined){
      try{
        var r=await fetch('/api/refs',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({action:'imagenes',id:p.id})});
        var d=await r.json();
        REFS_PERSONAJE[p.id]=(d&&Array.isArray(d.refs)&&d.refs.length)?d.refs:null;
      }catch(e){ REFS_PERSONAJE[p.id]=null; }
    }
    var rp=REFS_PERSONAJE[p.id];
    if(rp)extra=extra.concat(rp.slice(0,2)); // 2 vistas por secundario: suficiente y no infla la peticion
  }
  // La descripcion va SIEMPRE, tenga vistas o no: si el personaje aun no tiene
  // imagenes generadas, al menos el texto mantiene su aspecto estable.
  if(fichas.length){
    limpio+='\n\nOTRAS PERSONAS EN ESTA ESCENA (respeta su aspecto exactamente): '+fichas.join(' | ')
      +'. El protagonista sigue siendo el hombre de las imagenes de referencia.';
  }
  return {prompt:limpio,refs:extra.length?extra:null,ids:ids};
}

// Junta las referencias del protagonista con las de los secundarios de la escena.
async function prepararImagen(promptCrudo,refsBase){
  var e=await refsDeEscena(promptCrudo);
  var refs=refsBase||[];
  if(e.refs)refs=refs.concat(e.refs);
  if(e.ids.length)apuntarPersonajes(e.ids);
  return {prompt:e.prompt,refs:refs};
}

// Deja constancia en el historial de quien salio, para que la proxima vez el
// reparto se ordene por quien lleva mas tiempo sin aparecer.
function apuntarPersonajes(ids){
  if(!lastRes||!ids||!ids.length)return;
  if(!lastRes.sem)lastRes.sem={};
  var ya=lastRes.sem.personajes||[];
  ids.forEach(function(x){ if(ya.indexOf(x)<0)ya.push(x); });
  lastRes.sem.personajes=ya;
  guardarEnReel({sem:lastRes.sem});
}

// DESCARGAR UN ARCHIVO DESDE EL IPHONE.
//
// Todo se bajaba con <a download>. En un ordenador funciona; en iOS Safari el
// atributo download se ignora para blob: y data:, asi que el boton parpadeaba y
// no pasaba nada — ni las imagenes, ni los clips, ni el video final, ni el ZIP,
// que encima decia "ZIP descargado" mintiendo.
//
// En el iPhone lo que si funciona es la hoja de compartir: navigator.share con un
// File deja guardarlo en Archivos o en Fotos. Hay que llamarla DENTRO del toque,
// que es lo que pasa aqui porque todo esto cuelga de un click.
function puedeCompartirArchivos(){
  try{ return !!(navigator.canShare&&navigator.share&&navigator.canShare({files:[new File([new Blob([1])],'x.txt',{type:'text/plain'})]})); }
  catch(e){ return false; }
}

async function comoBlob(origen){
  if(origen instanceof Blob)return origen;
  var r=await fetch(origen);          // vale igual para blob:, data: y https:
  return await r.blob();
}

// Devuelve 'compartido' | 'descargado' | 'cancelado', para poder decir la verdad
// en pantalla en vez de dar por hecho que se guardo.
async function descargarArchivo(origen,nombre,tipo){
  var blob=await comoBlob(origen);
  if(tipo&&blob.type!==tipo)blob=new Blob([blob],{type:tipo});
  if(puedeCompartirArchivos()){
    try{
      await navigator.share({files:[new File([blob],nombre,{type:blob.type||'application/octet-stream'})]});
      return 'compartido';
    }catch(e){
      // AbortError = el usuario cerro la hoja. Cualquier otro fallo cae al plan B.
      if(e&&e.name==='AbortError')return 'cancelado';
    }
  }
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download=nombre;a.rel='noopener';
  document.body.appendChild(a);a.click();
  setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},4000);
  return 'descargado';
}

// Un boton de descarga ya montado, para no repetir esto en seis sitios.
function botonDescarga(getOrigen,nombre,tipo,texto,estilo){
  var b=document.createElement('button');
  b.type='button';
  b.textContent=texto;
  b.style.cssText=estilo||'';
  b.addEventListener('click',async function(){
    var t0=b.textContent;
    b.disabled=true;b.textContent='...';
    try{
      var r=await descargarArchivo(await getOrigen(),nombre,tipo);
      b.textContent=r==='compartido'?'✓':(r==='cancelado'?t0:'✓');
      setTimeout(function(){b.textContent=t0;b.disabled=false;},1200);
    }catch(e){
      b.textContent=t0;b.disabled=false;
      alert('No se pudo guardar: '+(e.message||'error'));
    }
  });
  return b;
}

// LAS REFERENCIAS VIAJAN ENCOGIDAS.
//
// Cada referencia iba tal cual, en base64, dentro del JSON de la peticion. Cuatro
// PNG grandes ya rozaban el limite de 4,5 MB que acepta Vercel; al anadir las dos
// anclas del episodio se paso, y la respuesta era un 413 seco — "Error 413" en
// cinco imagenes seguidas. Encogidas a 1024 px y en JPEG, seis referencias ocupan
// menos que una sola de antes, y como referencia siguen valiendo igual.
var REF_LADO=896;
// Tope de lo que puede pesar el conjunto de referencias de UNA peticion. Vercel
// corta en 4,5 MB; se deja margen para el prompt y para el propio JSON.
var REF_TOPE=3200000;
var CACHE_ENCOGIDAS={};
function encogerRef(b64){
  if(!b64)return Promise.resolve(b64);
  var clave=b64.length+':'+b64.slice(0,32);
  if(CACHE_ENCOGIDAS[clave])return Promise.resolve(CACHE_ENCOGIDAS[clave]);
  return new Promise(function(res){
    var im=new Image();
    im.onerror=function(){res(b64);};             // si no se puede, va como estaba
    im.onload=function(){
      try{
        var e=Math.min(1,REF_LADO/Math.max(im.width,im.height));
        var c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(im.width*e));c.height=Math.max(1,Math.round(im.height*e));
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        var out=c.toDataURL('image/jpeg',0.85).split(',')[1];
        if(out&&out.length<b64.length){CACHE_ENCOGIDAS[clave]=out;res(out);}
        else res(b64);
      }catch(err){res(b64);}
    };
    im.src=/^data:/.test(b64)?b64:'data:image/png;base64,'+b64;
  });
}
async function encogerRefs(refs){
  if(!refs||!refs.length)return refs;
  var out=[];
  for(var i=0;i<refs.length;i++)out.push(await encogerRef(refs[i]));
  // Y si aun asi el conjunto se pasa, se sueltan referencias por DELANTE. Las
  // ultimas son las que mas mandan (el ancla del episodio va al final), asi que
  // las que se caen son las menos decisivas. Mejor generar con tres referencias
  // que recibir un 413 y no generar nada.
  var peso=function(a){var n=0;for(var i=0;i<a.length;i++)n+=a[i].length;return n;};
  while(out.length>1&&peso(out)>REF_TOPE)out.shift();
  return out;
}

async function genOneImage(prompt,refs){
  var ir;
  var refsLigeras=await encogerRefs(refs);
  try{
    ir=await fetch('/api/image',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt,refImages:refsLigeras,model:imgModel,aspectRatio:imgFmt}),
    });
  }catch(e){
    throw new Error('Error de conexion. Usa Regenerar.');
  }
  if(ir.status===504){
    throw new Error('Tiempo agotado. Usa Regenerar en unos segundos.');
  }
  if(ir.status===413){
    throw new Error('la petición pesaba demasiado ('+refsLigeras.length+' referencias)');
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

// Al REGENERAR una imagen, el clip que se habia animado a partir de la imagen
// VIEJA deja de valer. Antes no se tocaba: vidState[idx] seguia en 'done', el
// clip viejo se seguia mostrando y entraba tal cual en la unificacion
// (unifyVideo salta los que ya estan en 'done'). Resultado: corregias una imagen
// y el video final seguia enseñando la version que habias descartado.
// El clip viejo NO se pierde: sigue en el bucket y aparece en el banco.
function invalidarClip(idx){
  if(vidState[idx]!=='done'&&vidState[idx]!=='error')return false;
  vidState[idx]='idle';
  vids[idx]=null;
  if(typeof vidErrMsg!=='undefined')vidErrMsg[idx]='';
  return true;
}

function setSlotOk(slot,src,idx){
  slot.style.cssText='position:relative;border-radius:10px;overflow:visible;box-shadow:0 3px 12px rgba(74,74,90,0.15)';
  slot.innerHTML='';
  var imWrap=document.createElement('div');imWrap.style.cssText='position:relative;border-radius:10px;overflow:hidden';
  var im=document.createElement('img');im.src=src;im.style.cssText='width:100%;display:block;border-radius:10px';imWrap.appendChild(im);
  var dd=document.createElement('div');dd.style.cssText='position:absolute;bottom:6px;right:6px';
  var da=botonDescarga(function(){return src;},'legado-img-'+(idx+1)+'.png','image/png','⬇',
    'background:rgba(255,255,255,.93);border:none;border-radius:6px;padding:4px 9px;font-size:10px;font-weight:600;color:#2a2a3a;display:block;cursor:pointer;font-family:inherit');
  dd.appendChild(da);imWrap.appendChild(dd);
  var rd=document.createElement('div');rd.style.cssText='position:absolute;top:6px;right:6px';
  var rb=document.createElement('button');rb.textContent='↺';rb.title='Regenerar';
  rb.style.cssText='background:rgba(255,255,255,.85);border:none;border-radius:6px;padding:4px 8px;font-size:13px;cursor:pointer;line-height:1';
  var iidx=idx;
  rb.addEventListener('click',function(){
    setSlotLoading(slot,iidx);
    var p=lastRes&&lastRes.c&&lastRes.c[iidx]?lastRes.c[iidx]:'';
    prepararImagen(p,imgRefs).then(function(e){
      return genOneImage(imgPromptPrefix(imgFmt)+e.prompt,e.refs);
    }).then(function(s){
      imgs[iidx]={src:s,idx:iidx+1};
      var habia=invalidarClip(iidx); // el clip de la imagen vieja ya no vale
      setSlotOk(slot,s,iidx);cost+=imgCost();updCost();chkExport();
      if(habia)avisoClipInvalidado(iidx);
    }).catch(function(e){setSlotError(slot,iidx,e.message);});
  });
  rd.appendChild(rb);imWrap.appendChild(rd);
  slot.appendChild(imWrap);
  var videoBox=document.createElement('div');videoBox.className='vbox';videoBox.style.cssText='margin-top:6px';
  slot.appendChild(videoBox);
  renderVideoControls(videoBox,iidx);
}

// Aviso discreto y temporal: el clip de esa imagen se solto, hay que volver a
// animar. Sin esto el boton cambiaria de "Ver video" a "Animar" sin explicar por que.
function avisoClipInvalidado(idx){
  var card=document.getElementById('imgCard');
  if(!card)return;
  var id='avisoClip',prev=document.getElementById(id);
  if(prev)prev.parentNode.removeChild(prev);
  var d=document.createElement('div');
  d.id=id;
  d.style.cssText='margin:8px 0;padding:8px 10px;border-radius:8px;background:#fdf3e3;'
    +'border:1px solid #d8b878;font-size:11px;color:#7a5c2a;line-height:1.4';
  d.textContent='La imagen '+(idx+1)+' cambió, así que su video anterior se soltó: vuelve a animarla. '
    +'El clip viejo sigue guardado en el banco por si lo quieres.';
  card.insertBefore(d,card.firstChild);
  setTimeout(function(){ var x=document.getElementById(id); if(x)x.parentNode.removeChild(x); },9000);
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
    prepararImagen(prompt,imgRefs).then(function(e){
      return genOneImage(imgPromptPrefix(imgFmt)+e.prompt,e.refs);
    }).then(function(src){
      imgs[iidx]={src:src,idx:iidx+1};
      var habia=invalidarClip(iidx); // el clip de la imagen vieja ya no vale
      setSlotOk(slot,src,iidx);
      cost+=imgCost();updCost();chkExport();
      if(habia)avisoClipInvalidado(iidx);
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

// La pausa entre imagenes. 10 s es lo que aguanta el limite por minuto de Google
// con imagenes de calidad. Esta en una constante para poder bajarla en las pruebas.
var PAUSA_IMAGENES=10000;

// LAS ANCLAS DEL EPISODIO: la ropa y los escenarios que se repiten.
//
// El problema: cada imagen se genera por su cuenta a partir de una descripcion en
// palabras, y las palabras no fijan un decorado ni un traje. En modo profesor se
// veia a la legua — las tomas de "el mismo despacho" salian en despachos
// distintos, con otra lampara y otra ropa — pero pasa igual en cualquier modo con
// continuidad: la cocina de la escena 1 no es la misma que la de la escena 7.
//
// La solucion es generar PRIMERO las imagenes de referencia del episodio y
// mandarlas con cada escena:
//   - EL VESTUARIO: el presentador de cuerpo entero, con la ropa de este video.
//   - LOS ESCENARIOS: cada sitio que se repite, vacio y en plano general.
// En modo profesor el escenario es uno solo y viene del SET del guion. En historia
// y relato salen de las marcas [LUGAR: id] que pone el director.
var MODOS_CON_ANCLA={profesor:1,relato:1,historia:1};
var MAX_LUGARES=2;   // tope: cada lugar es una imagen mas

// Que lugares se repiten y con que texto se describen por primera vez.
function lugaresRepetidos(prompts){
  var vistos={},orden=[];
  (prompts||[]).forEach(function(p,i){
    var m=/\[LUGAR:\s*([a-z0-9-]+)\s*\]/i.exec(p||'');
    if(!m)return;
    var id=m[1].toLowerCase();
    if(!vistos[id]){ vistos[id]={id:id,veces:0,desc:String(p).replace(/\[LUGAR:[^\]]*\]/i,'').trim(),escenas:[]}; orden.push(id); }
    vistos[id].veces++; vistos[id].escenas.push(i);
  });
  return orden.map(function(id){return vistos[id];})
    .filter(function(l){return l.veces>1;})       // uno solo no necesita ancla
    .sort(function(a,b){return b.veces-a.veces;}) // primero el que mas sale
    .slice(0,MAX_LUGARES);
}

// Cuantas imagenes de referencia va a costar este episodio, para avisar antes.
function nAnclasEpisodio(res){
  if(!res||!MODOS_CON_ANCLA[res.modo])return 0;
  var n=1;                                        // el vestuario
  if(res.modo==='profesor')n+=res.set?1:0;
  else n+=lugaresRepetidos(res.c).length;
  return n;
}

async function generarAnclasEpisodio(res,refsBase,st){
  var out={personaje:null,lugares:{},fallos:[]};
  var pre=imgPromptPrefix(imgFmt);

  if(st)st.textContent='Fijando el vestuario del personaje para este vídeo...';
  try{
    out.personaje=await genOneImage(pre
      +'WARDROBE REFERENCE for this episode. The character standing, full length, facing the camera, '
      +'arms relaxed, neutral expression. Plain neutral grey studio background, nothing else in frame. '
      +'Choose ONE outfit that fits this episode and lock it in: this exact outfit is what he wears in '
      +'every shot of this video. Show it complete, head to feet.',refsBase);
  }catch(e){ out.fallos.push('el vestuario: '+(e.message||'error')); }

  // Los escenarios. En profesor es el SET del guion; en los demas, los lugares
  // que el director marco como repetidos.
  var sitios=res.modo==='profesor'
    ? (res.set?[{id:'set',desc:res.set,veces:99}]:[])
    : lugaresRepetidos(res.c);

  for(var k=0;k<sitios.length;k++){
    var sitio=sitios[k];
    if(st)st.textContent='Fijando el escenario '+(k+1)+' de '+sitios.length+'...';
    await new Promise(function(r){setTimeout(r,PAUSA_IMAGENES);});   // la misma cadencia que el resto
    try{
      // El escenario va SIN personas y sin referencias del personaje: si viaja su
      // cara, se cuela un tipo de pie en medio del decorado.
      out.lugares[sitio.id]=await genOneImage(pre
        +'SET REFERENCE. WIDE ESTABLISHING SHOT of an empty place, seen from a corner or from far enough '
        +'back that the whole space and its depth are visible at once. '
        +'NO PEOPLE in the image, not one figure. '
        +'THE PLACE: '+sitio.desc+'. '
        +'Every object, its colour, its material and its position must be clear enough to be reproduced '
        +'from other angles later. Even, natural lighting so nothing is hidden in shadow.',[]);
    }catch(e){ out.fallos.push('el escenario "'+sitio.id+'": '+(e.message||'error')); }
  }
  return out;
}

// Lo que le toca a UNA escena: su escenario (si lo tiene) y el vestuario.
// En profesor, las TOMAS van en el set y los EJEMPLOS ocurren fuera.
// `esToma` = esta escena ocurre en el set fijo del episodio (modo profesor).
//
// LA ROPA SOLO SE FIJA DONDE HAY CONTINUIDAD. En modo profesor eso son las TOMAS:
// la clase se graba de una sentada y ahi no puede cambiar de camisa. Los EJEMPLOS
// son otro momento y otro sitio; obligarles la misma ropa no aporta nada y ademas
// gastaba dos referencias de mas en cada peticion.
function conAnclasDeEpisodio(promptCrudo,promptLimpio,refs,ancla,esToma,modo){
  // EN LOS EJEMPLOS DEL PROFESOR NO SALE EL PROFESOR.
  //
  // El prefijo de estilo dice "el MISMO hombre en todas las imagenes", asi que
  // hasta ahora el protagonista se colaba en los ejemplos — incluido el del error
  // tipico. Y ahi deja de ser el profesor: pasa a ser uno mas que tampoco sabe. El
  // espectador tiene que verse a SI MISMO en esa escena, no al que le ensena.
  if(modo==='profesor'&&!esToma){
    return {
      prompt:'IMPORTANT OVERRIDE: the recurring signature character does NOT appear in this image. '
        +'This is an example of what happens to SOMEONE ELSE. Draw a different person — different face, '
        +'different age or build, different clothes. Do not draw the bearded man from the reference '
        +'images anywhere in this scene.\n'+promptLimpio,
      // Sin las referencias de su cara: si viajan, sale el.
      refs:null,
    };
  }
  if(!ancla)return {prompt:promptLimpio,refs:refs};
  var conVestuario=(modo==='profesor')?!!esToma:true;
  var extra=[],aviso='';
  var sinData=function(x){return String(x).replace(/^data:image\/[a-z+]+;base64,/,'');};

  var lugar=null;
  if(esToma&&ancla.lugares.set)lugar=ancla.lugares.set;         // modo profesor
  else{
    var m=/\[LUGAR:\s*([a-z0-9-]+)\s*\]/i.exec(promptCrudo||'');
    if(m&&ancla.lugares[m[1].toLowerCase()])lugar=ancla.lugares[m[1].toLowerCase()];
  }
  if(lugar){
    extra.push(sinData(lugar));
    aviso+='THE PLACE IS ALREADY DECIDED. One of the reference images is a wide shot of the empty place '
      +'where this scene happens: same walls, same furniture, same lamps, same colours, same objects in '
      +'the same positions. You are only moving the camera inside it. Do NOT invent a different place, '
      +'do NOT add or remove furniture. ';
  }
  if(ancla.personaje&&conVestuario){
    extra.push(sinData(ancla.personaje));
    aviso+='THE WARDROBE IS ALREADY DECIDED. The last reference image shows the character in the exact '
      +'outfit he wears in these shots. Same garments, same colours. Do NOT change his clothes. ';
  }
  if(!extra.length)return {prompt:promptLimpio,refs:refs};
  // EL ANCLA SUSTITUYE A LAS 4 DE MARCA, no se suma. El ancla del vestuario se
  // genero A PARTIR de ellas: ya lleva la misma cara y ademas la ropa de este
  // video. Mandar las seis juntas solo servia para pasarse del limite de tamano
  // de la peticion — el 413 que salia en cinco imagenes seguidas — y para diluir
  // justo la referencia que manda.
  var base=(ancla.personaje&&conVestuario)?[]:(refs||[]);
  return {prompt:aviso+promptLimpio,refs:base.concat(extra)};
}

async function genImages(){
  if(!lastRes||!lastRes.c||!lastRes.c.length){alert('No hay prompts. Regenera el episodio.');return;}
  // Determinar cuántas imágenes según modo y duración
  var totalImgsTarget=imagenesDe(lastRes.modo,lastRes.dO&&lastRes.dO.id);
  // Un video largo son 8-10 imagenes y, si luego se animan, otros tantos clips de
  // Veo. Eso son varios dolares, muy por encima de un reel: se avisa ANTES.
  if(esModoLargo(lastRes.modo)){
    // El modo profesor genera 2 imagenes mas: la del vestuario y la del set. No
    // salen en el video, pero fijan los dos y hay que contarlas en el coste.
    var extras=nAnclasEpisodio(lastRes);
    var cImg=(totalImgsTarget+extras)*imgCost(), cVid=totalImgsTarget*vidCost();
    if(!confirm('Vídeo largo ('+(MODE_LABELS[lastRes.modo]||lastRes.modo)+'): '+totalImgsTarget+' imágenes'
      +(extras?' + '+extras+' de referencia (el vestuario y '
        +(extras>2?'los escenarios que se repiten':'el escenario')+', para que no cambien entre escenas)':'')+'.\n\n'
      +'Imágenes: $'+cImg.toFixed(2)+'\n'
      +'Si luego las animas todas con Veo: +$'+cVid.toFixed(2)+'\n\n'
      +(lastRes.modo==='profesor'
        ? 'Las 5 tomas del set se REPITEN en el montaje, así que con estas 8 imágenes se cubre el vídeo entero.\n\n'
        : '')
      +'También puedes unificar solo con las imágenes (con movimiento) y no pagar los clips.\n\n¿Genero las imágenes?'))return;
  }
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
  if(loadedRefsCount<MIN_REFS){
    // FRENO DURO: sin referencias el rostro sale MAL. No se genera nada.
    st.style.display='none';
    er.textContent='Las referencias del personaje NO cargaron ('+loadedRefsCount+'/4). Sin ellas el rostro sale equivocado, así que no se generó nada. Espera unos segundos y toca 🖼 Generar de nuevo.';
    er.style.display='block';
    btn.textContent='🖼 Generar';btn.style.opacity='1';btn.disabled=false;
    return;
  }
  if(loadedRefsCount<4){
    st.textContent='Atención: solo '+loadedRefsCount+'/4 referencias del personaje cargaron. El rostro puede variar un poco en este lote.';
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
  // En modo profesor, primero se fija el set y la ropa. Sin esto cada toma se
  // inventa su propio despacho y su propio traje.
  var anclaEp=null;
  if(MODOS_CON_ANCLA[lastRes.modo]&&nAnclasEpisodio(lastRes)){
    anclaEp=await generarAnclasEpisodio(lastRes,imgRefs,st);
    var hechas=(anclaEp.personaje?1:0)+Object.keys(anclaEp.lugares).length;
    cost+=hechas*imgCost();updCost();
    if(anclaEp.fallos.length){
      er.textContent='Aviso: no se pudo fijar '+anclaEp.fallos.join(' ni ')
        +'. Esas escenas pueden salir en sitios distintos. Puedes parar y volver a intentarlo.';
      er.style.display='block';
    }
    await new Promise(function(r){setTimeout(r,PAUSA_IMAGENES);});
  }
  var nTomas=Number(lastRes.nTomas)||0;

  var gen=0;
  for(var i=0;i<totalImgs;i++){
    // SE ESPERA Y SE REINTENTA, no se salta. Es lo mismo que ya se arreglo en la
    // biblia: la mayoria de los fallos son el limite por minuto de Google, y
    // pasar a la siguiente imagen solo garantiza que esa tambien lo encuentre.
    // Salian ocho imagenes seguidas en rojo por esto.
    var ultimo='';
    for(var intento=0;intento<=ESPERAS_REINTENTO.length;intento++){
      try{
        st.textContent='Generando imagen '+(i+1)+' de '+totalImgs+'...';
        var esc=await prepararImagen(lastRes.c[i],imgRefs);
        var conj=conAnclasDeEpisodio(lastRes.c[i],esc.prompt,esc.refs,anclaEp,i<nTomas,lastRes.modo);
        var src=await genOneImage(imgPromptPrefix(imgFmt)+conj.prompt,conj.refs);
        imgs[i]={src:src,idx:i+1};
        setSlotOk(slots[i],src,i);
        gen++;cost+=imgCost();updCost();chkExport();
        ultimo='';
        break;
      }catch(e){
        ultimo=e.message||'error';
        if(intento<ESPERAS_REINTENTO.length){
          var esp=ESPERAS_REINTENTO[intento];
          if(esLimite(ultimo))esp*=2;   // el limite por minuto no se arregla insistiendo antes
          st.textContent='Imagen '+(i+1)+': '+ultimo.slice(0,50)
            +' — reintento '+(intento+1)+' de '+ESPERAS_REINTENTO.length+' en '+Math.round(esp/1000)+' s';
          await new Promise(function(rs){setTimeout(rs,esp);});
        }
      }
    }
    if(ultimo)setSlotError(slots[i],i,ultimo);
    if(i<totalImgs-1)await new Promise(function(resolve){setTimeout(resolve,PAUSA_IMAGENES);});
  }
  st.textContent=gen+'/'+totalImgs+' imagenes generadas.';
  if(gen>0){var bv=document.getElementById('ballvids');if(bv)bv.style.display='block';}
  btn.textContent='🖼 Generar';btn.style.opacity='1';btn.disabled=false;
  chkExport();updUnifyCard();
}

// MINIATURA — imagen de portada del reel, aparte de las imagenes numeradas del guion.
// No ilustra una parte del guion: su unico trabajo es detener el scroll antes del play.
// CADA REEL tiene su propia miniatura: se guarda por uid del reel (THUMBS), asi al
// cambiar entre los guiones del lote o del historial ninguna miniatura se mezcla.
var thumbImg=null; // data URL de la miniatura del reel EN PANTALLA (o null)
var THUMBS={};     // THUMBS[uid del reel] = data URL de su miniatura

// LA MINIATURA.
//
// La que habia era el personaje centrado sobre un fondo negro vacio. Para un reel
// pasa; para YouTube no vale: en la parrilla compite con veinte miniaturas y una
// silueta sobre negro no llama a nadie. Una portada de YouTube tiene cara grande y
// legible en pequeno, un fondo que CUENTA algo del tema, contraste fuerte, y un
// hueco limpio a un lado para el titulo.
function buildThumbPrompt(){
  var hookLine=lastRes&&lastRes.a?firstLine(lastRes.a):'';
  var horizontal=imgFmt==='16:9';
  var comun='THUMBNAIL COVER IMAGE — this is the COVER of the video, NOT a scene from the story. '
    +'Its only job: make someone stop and click.\n'
    +'THE FACE IS THE PRODUCT: the character\'s face must be large, sharp and readable even when the '
    +'image is shown the size of a thumbnail. ONE clear, strong emotion — not a neutral pose. '
    +'Direct eye contact with the camera, or looking at the thing that matters in the frame.\n'
    +'LIGHT AND COLOUR: high contrast, strong rim light separating the character from the background, '
    +'saturated cinematic colour. Never flat, never washed out, never a grey mush.\n'
    +'NO TEXT: do not draw letters, numbers, logos or watermarks anywhere. The title is added later.\n';
  if(horizontal){
    // YouTube: la cara a un lado, el tema al otro, y sitio para el titulo.
    return CHAR_STYLE_ANCHOR+aspectHint(imgFmt)+comun
      +'LAYOUT (YouTube, 16:9): the character occupies ONE SIDE of the frame — left or right, not the '
      +'centre — from the chest up, taking about 45% of the width and almost the full height. '
      +'The OTHER SIDE holds a single strong visual element that says what the video is about at a glance: '
      +'the object, the place or the consequence the video talks about. One element, big and clear, never a '
      +'cluttered collage. Behind everything, the real environment of the video, darkened and out of focus '
      +'so it gives depth without stealing attention. '
      +'Leave that side\'s upper area breathable: a big title will be laid over it later.\n'
      +'It must read at 320 pixels wide. If an element would be unreadable that small, make it bigger or drop it.\n'
      +'WHAT THE COVER IS ABOUT: "'+hookLine+'"';
  }
  // Reels: vertical, la cara arriba y el gancho abajo.
  return CHAR_STYLE_ANCHOR+aspectHint(imgFmt)+comun
    +'LAYOUT (Reels, 9:16): the character from the chest up, filling the middle of the frame, with ONE '
    +'powerful hooking gesture. Behind him, the real environment of the video, darkened and out of focus. '
    +'Leave clear empty space in the upper third for a title to be overlaid later.\n'
    +'WHAT THE COVER IS ABOUT: "'+hookLine+'"';
}

async function genThumb(){
  if(!lastRes||!lastRes.a){alert('Genera un guion primero.');return;}
  var btn=document.getElementById('bthumb');
  var st=document.getElementById('ist');
  var box=document.getElementById('thumbBox');
  var orig=btn.textContent;
  btn.textContent='...';btn.disabled=true;btn.style.opacity='.6';
  if(st){st.style.display='block';}
  try{
    if(!imgRefs||imgRefs.length<MIN_REFS){
      if(st)st.textContent='Cargando referencias del personaje...';
      imgRefs=await loadRefs();
    }
    if(!imgRefs||imgRefs.length<MIN_REFS){
      throw new Error('Las referencias del personaje no cargaron ('+(imgRefs?imgRefs.length:0)+'/4); sin ellas el rostro sale equivocado. Reintenta en unos segundos');
    }
    if(st)st.textContent='Generando miniatura de portada...';
    var src=await genOneImage(buildThumbPrompt(),imgRefs);
    thumbImg=src;
    if(lastRes&&lastRes.uid)THUMBS[lastRes.uid]=src; // miniatura propia de ESTE reel
    cost+=imgCost();updCost();chkExport();
    renderThumb();
    if(st)st.textContent='Miniatura lista. Se incluye en el ZIP como archivo aparte.';
  }catch(e){
    if(st)st.style.display='none';
    if(box)box.innerHTML='<div style="background:#f8ede8;border:1px solid #c4897a;border-radius:8px;padding:8px 10px;font-size:11px;color:#8a4a3a;margin-bottom:10px">Miniatura: '+escHtml(e.message||'Error')+'. Vuelve a intentar con + Miniatura.</div>';
  }finally{
    btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';
  }
}

function renderThumb(){
  var box=document.getElementById('thumbBox');
  if(!box||!thumbImg)return;
  box.innerHTML='';
  box.style.cssText='margin-bottom:12px';
  var lbl=document.createElement('div');
  lbl.style.cssText='font-size:9px;font-weight:700;letter-spacing:.14em;color:var(--tx3);text-transform:uppercase;margin-bottom:6px';
  lbl.textContent='🌟 Miniatura · portada del reel';
  box.appendChild(lbl);
  var wrap=document.createElement('div');
  wrap.style.cssText='position:relative;border-radius:10px;overflow:hidden;max-width:190px;box-shadow:0 3px 12px rgba(74,74,90,0.15)';
  var im=document.createElement('img');im.src=thumbImg;im.style.cssText='width:100%;display:block';
  wrap.appendChild(im);
  var dd=document.createElement('div');dd.style.cssText='position:absolute;bottom:6px;right:6px;display:flex;gap:5px';
  var da=botonDescarga(function(){return thumbImg;},'legado-miniatura.png','image/png','⬇',
    'background:rgba(255,255,255,.93);border:none;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:600;color:#2a2a3a;cursor:pointer;font-family:inherit');

  var rb=document.createElement('button');rb.textContent='↺';rb.title='Regenerar miniatura';
  rb.style.cssText='background:rgba(255,255,255,.93);border:none;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;line-height:1';
  rb.addEventListener('click',genThumb);
  dd.appendChild(da);dd.appendChild(rb);
  wrap.appendChild(dd);
  box.appendChild(wrap);
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
    var dl=botonDescarga(function(){return vids[idx].url;},'legado-video-'+(idx+1)+'.mp4','video/mp4','⬇ Descargar',
      'flex:1;text-align:center;background:#fff;border:1.5px solid #9ab47a;border-radius:6px;padding:6px;font-size:10px;font-weight:600;color:#9ab47a;cursor:pointer;font-family:inherit');
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

    // remoteUrl: URL firmada del clip en GCS; el servicio de unificacion descarga
    // los clips directo de ahi (no viajan por el navegador ni por Vercel).
    vids[idx]={url:localUrl,blob:vidBlob,remoteUrl:videoUrl};
    vidState[idx]='done';
    updUnifyCard();
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
  // Fuera la marca [CON: id]: es una instruccion nuestra para elegir referencias,
  // no algo que el generador de video deba leer (acabaria dibujando el texto).
  base=String(base).replace(/\[CON:\s*[a-z0-9-]+\s*\]/gi,'').replace(/^\s+/,'');
  return 'ANIMATION STYLE (strict, must match the input image exactly): American 2D comic book illustration style, clean ink outlines, flat cel-shading with hard color blocks and visible shading edges -- NOT 3D, NOT 3D render, NOT CGI, NOT photorealistic, NOT realistic rendering, NOT Pixar style, NOT smooth 3D shading. The animation must preserve the flat 2D comic look of the source image throughout the entire clip.\n\n'
    // OJO: aqui NO se nombra la lluvia. Los modelos de video no manejan bien la
    // negacion: escribir "sin lluvia" mete la palabra en el prompt y acaba
    // generandola igual (por eso salia agua hasta dentro del coche). Se describe
    // en POSITIVO lo que si debe haber, y las palabras prohibidas viven solo en
    // el negativePrompt de la API, que es donde de verdad restan.
    +'ATMOSPHERE (strict): the air is completely dry and still. Indoor scenes keep dry floors, dry surfaces and calm indoor air. Outdoor scenes have clear skies and dry ground. Every surface stays dry from the first frame to the last. The environment and the sky match the source image exactly, with nothing added to the air.\n\n'
    +'OBJECT AND HAND REALISM (strict): every object stays the SAME object for the whole clip -- it never morphs, transforms, changes type, multiplies, or turns into a different thing (a cup stays a cup, a paper stays a paper, a pen stays a pen). The character ONLY touches and interacts with the object the action requires; he does NOT reach for or pick up unrelated objects (coffee cups, glasses, decorations). Hands are steady and calm -- NO trembling, NO shaking, NO jitter. When signing or writing, ONE hand holds ONE pen; the other hand rests naturally -- never two pens, never writing with both hands at once. Papers and objects on the desk stay in place -- they do NOT jump, fly, flip, or scatter on their own. Correct human anatomy: exactly five fingers per hand, no extra or missing fingers, no merging.\n\n'
    +'MANDATORY ACTION FOR THIS CLIP (this single action drives the body, hands, and gaze direction for the ENTIRE clip): '+base+'\n\n'
    +'EYE LINE AND BODY DIRECTION (strict, this is not optional): the character looks at and engages with WHATEVER THE ACTION DESCRIBES -- his hands and the task, the person he is dealing with, the goods he is handling, the space he is overseeing. The character does NOT look at the camera, does NOT pose for the camera, does NOT turn the head toward the viewer, UNLESS the action explicitly says the character is speaking directly to camera. There is no head tilting, no modeling pose, no fashion-style head turn, no posing of any kind -- only the working posture that the action requires.\n\n'
    +'This is not a static pose and not a frozen stance with arms crossed -- the character is actively, physically DOING the described action with continuous natural motion for the full duration of the clip. A slow zoom toward a motionless or posing character is NOT acceptable.\n\n'
    +'Match the action to natural, continuous physical motion driven by what THIS scene shows. The range of entrepreneurial actions is wide -- pick whatever fits this scene: '
    +'working with the hands or tools -- arms and hands move with the real gesture of the task, steady and purposeful; '
    +'carrying, lifting, moving or arranging goods or boxes -- the body lifts, turns and sets things down with natural weight; '
    +'greeting a person or closing a deal -- a firm confident handshake, a nod, natural conversational gestures with a client or partner; '
    +'counting cash or handling money -- the hands move through the bills or coins deliberately; '
    +'directing, teaching or motivating a team -- open confident gestures toward the people or the work; '
    +'overseeing or surveying an operation -- calm attentive gaze sweeping across the space, subtle grounded body shifts; '
    +'walking through the workplace or the street -- a steady even adult stride (see locomotion rule); '
    +'speaking to camera -- the ONLY case where he faces the viewer, with natural confident hand gestures and an animated talking mouth; '
    +'signing or writing -- ONLY if the scene is clearly about that: head down toward the page, one hand one pen moving in a smooth continuous stroke. '
    +'Whatever the action, the character is actively DOING it with continuous grounded motion from the first frame to the last -- never a frozen pose, never arms crossed, never reduced to just a camera move or a slow zoom onto a motionless character.\n\n'
    +'NATURAL LOCOMOTION (strict): if the character is walking, he walks like a normal adult -- a smooth, steady, even stride at a constant calm pace, weight shifting naturally from one foot to the other, arms swinging subtly and naturally. ABSOLUTELY NO hopping, NO skipping, NO bouncing, NO little jumps, NO sudden bursts of speed, NO breaking into a jog or run, NO gliding or floating, NO moonwalking, NO stutter-steps. The walking speed stays constant and unhurried the whole clip. He only runs or jogs if the described action explicitly says he is running or jogging; otherwise it is always a calm natural walk.\n\n'
    +'FACIAL EXPRESSION ONLY (this controls the face, never the body posture or head direction, which are governed entirely by the action above): serious, focused, professional, concentrated on the task at hand. '
    +'NEVER sad, NEVER frowning, NEVER a long or droopy face, NEVER distorted or asymmetrical eyes, NEVER a flirtatious or seductive look, NEVER a modeling or beauty-pageant expression. '
    +'Expression stays consistent and composed throughout the clip. Natural subtle blinking only.\n\n'
    +'IF (AND ONLY IF) writing or signing on paper is actually visible in the source image: one hand holds one pen and moves in ONE smooth, confident, continuous adult gesture -- a flowing signature, NOT an attempt to spell out block letters. Any writing or text ALREADY on the page stays EXACTLY as it is -- it must NOT morph, wobble or turn into scribbles. ABSOLUTELY NO childish scribbles, random loops, zigzags or crayon-like marks. Do NOT add paper, a pen or writing that is not already clearly in the source image.\n\n'
    +'HEAD AND NECK MOVEMENT (strict): head movements must be minimal and slow -- slight forward nod or minor downward tilt toward the work only. '
    +'NO neck rotation, NO side-to-side head turning, NO looking up then down dramatically, NO head tilting. '
    +'Keeping the head relatively stable prevents anatomy distortion in the 2D comic style.\n\n'
    +'Realistic human anatomy proportions at all times (within the 2D comic style): natural hand and finger movement, no warping, no melting features, no extra or missing fingers, no distortion of the face or body.\n\n'
    +'CINEMATIC CAMERA MOVEMENT (mandatory): choose ONE of the following based on the scene action and apply it dynamically and intentionally throughout the entire clip -- '
    +'LOW ANGLE PUSH-IN: camera starts low looking up at the character with authority and slowly pushes forward -- use for power, decision-making, or speaking to camera; '
    +'TRACKING FOLLOW: camera follows the character hands or body movement fluidly -- use for working with the hands, handling goods, or walking; '
    +'DRAMATIC PUSH-IN: camera starts at medium distance and pushes in decisively toward the face or hands -- use for moments of confrontation or revelation; '
    +'SLOW ORBIT: camera moves laterally around the character in a slow deliberate arc -- use for closing a deal, thinking, or surveying the scene; '
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

// UNIFICACION VIDEO + AUDIO (punto 4 del plan) — el servicio de Cloud Run une los
// 5 clips en orden, les ajusta la velocidad con UNA sola proporcion para que la
// suma encaje con el audio de ElevenLabs (afinando el ultimo clip), le pega la
// narracion encima y devuelve UN solo archivo final. En CapCut solo queda la musica.
var finalVid=null; // el ultimo video final unificado, el que se ve en pantalla
// Los videos finales YA unificados, uno por idioma. Los dos salen de los MISMOS
// clips (que ya estan pagados): solo cambian la voz y los subtitulos.
var FINALES={es:null,en:null};

// BIBLIOTECA DE MUSICA — las pistas se suben UNA vez a la carpeta musica/ del
// bucket y quedan para siempre; en cada reel solo se elige cual va y a que
// volumen (18% por defecto, el nivel que se usaba a mano en CapCut).
var musicLoaded=false;

function loadMusicList(){
  var sel=document.getElementById('musicSel');if(!sel)return;
  fetch('/api/music',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'list'})})
    .then(function(r){return r.json();})
    .then(function(d){
      if(!d.tracks)return;
      musicLoaded=true;
      var saved='';
      try{saved=localStorage.getItem('lh_music_sel')||'';}catch(e){}
      sel.innerHTML='<option value="">Sin música</option>';
      d.tracks.forEach(function(t){
        var o=document.createElement('option');
        o.value=t.object;o.textContent='🎵 '+t.name;
        if(t.object===saved)o.selected=true;
        sel.appendChild(o);
      });
    })
    .catch(function(){/* sin conexion: el selector queda en "Sin música" */});
}

async function uploadMusic(){
  var inp=document.getElementById('musicFile');
  var st=document.getElementById('musicSt');
  var btn=document.getElementById('bMusicUp');
  if(!inp||!inp.files||!inp.files.length){alert('Primero elige el archivo de música (MP3).');return;}
  var f=inp.files[0];
  if(f.size>4*1024*1024){
    if(st){st.style.display='block';st.textContent='Ese archivo pesa mas de 4MB. Usa un MP3 mas liviano (o recórtalo).';}
    return;
  }
  var orig=btn.textContent;
  btn.textContent='Subiendo...';btn.disabled=true;
  if(st){st.style.display='block';st.textContent='Subiendo "'+f.name+'" a tu biblioteca...';}
  try{
    var b64=await new Promise(function(res,rej){
      var rd=new FileReader();
      rd.onloadend=function(){res(String(rd.result).split(',')[1]||'');};
      rd.onerror=function(){rej(new Error('No se pudo leer el archivo'));};
      rd.readAsDataURL(f);
    });
    var r=await fetch('/api/music',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'upload',name:f.name,b64:b64})});
    var d=await r.json();
    if(!r.ok||!d.object)throw new Error(d.error||'Error '+r.status);
    if(st)st.textContent='"'+d.name+'" quedó guardada en tu biblioteca.';
    inp.value='';
    loadMusicList();
    try{localStorage.setItem('lh_music_sel',d.object);}catch(e){}
    try{delete MIX.bufs[d.object];}catch(e){} // si reemplazaste un archivo con el mismo nombre, no usar el viejo
  }catch(e){
    if(st)st.textContent='Error subiendo: '+(e.message||'sin conexión');
  }finally{
    btn.textContent=orig;btn.disabled=false;
  }
}

// Genera una pista nueva con Lyria (IA de musica de Google) segun el estilo
// descrito. Queda guardada en la biblioteca y seleccionada para la unificacion.
// Los mismos nombres que ves en los botones. Si se anade o se renombra un estilo
// arriba (en el HTML), hay que reflejarlo aqui: es el nombre que sale en el aviso
// de "Componiendo ..." y el que va en el nombre del archivo de la pista.
var PRESET_LABELS={
  epica:'⚔ Épica de batalla', suspenso:'🕯 Suspenso', oscura:'🌑 Oscura y poderosa',
  determin:'🔨 Determinación', urbana:'🏙 Urbana / dinero', triunfo:'🏆 Triunfo',
  cuerdas:'🎻 Cuerdas que elevan', piano:'🎹 Piano inspirador',
  amanecer:'🌅 Amanecer', reflexiva:'🕰 Reflexiva',
};

async function genMusic(preset){
  var inp=document.getElementById('musicPrompt');
  var st=document.getElementById('musicSt');
  var btn=document.getElementById('bMusicGen');
  var style=(!preset&&inp)?inp.value.trim():'';
  var orig=btn.textContent;
  btn.textContent='Componiendo...';btn.disabled=true;btn.style.opacity='.6';
  if(st){
    st.style.display='block';
    st.textContent=(preset?'Componiendo '+(PRESET_LABELS[preset]||preset)+' con Lyria':(style?'Armando la ficha musical de "'+style.slice(0,50)+'" y componiendo':'Lyria está componiendo (estilo épico del canal)'))+'... 30-90 segundos.';
  }
  try{
    var r=await fetch('/api/music-gen',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(preset?{preset:preset}:{style:style})});
    var d=await r.json().catch(function(){return{};});
    if(!r.ok||!d.object)throw new Error(d.error||'Error '+r.status);
    try{localStorage.setItem('lh_music_sel',d.object);}catch(e){}
    loadMusicList();
    // Se muestra el formato real que devolvio el modelo: si algo suena mal (ruido,
    // estatica), este dato dice exactamente por que sin tener que adivinar.
    var info=d.formato?(' ['+d.formato+(d.trozos>1?', '+d.trozos+' trozos':'')+']'):'';
    if(st)st.textContent='🎼 "'+d.name+'" lista y seleccionada'+info+'. Toca ▶ Escuchar para oírla al volumen de la barra; si no te convence, genera otra.';
    cost+=0.06;updCost();
  }catch(e){
    if(st)st.textContent='Error generando música: '+(e.message||'sin conexión');
  }finally{
    btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';
  }
}

// ESCUCHA EN VIVO DE LA MEZCLA — reproduce la musica al volumen de la barrita
// (graduable MIENTRAS suena, incluso en iPhone gracias a Web Audio) y, si el
// Audio ES ya existe, suena la narracion al 100% por encima: exactamente la
// mezcla que va a quedar en el video final. Ese mismo nivel se usa al unificar.
var MIX={ctx:null,gain:null,srcs:[],playing:false,bufs:{}};

// UNA sola "consola de sonido" (AudioContext) que se abre la primera vez y se
// REUTILIZA siempre. Cerrarla y abrir otra en cada reproduccion hacia que el
// iPhone solo dejara sonar cada pista una vez.
function mixCtx(){
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!MIX.ctx||MIX.ctx.state==='closed')MIX.ctx=new AC();
  return MIX.ctx;
}

function stopMix(){
  MIX.srcs.forEach(function(s){try{s.onended=null;s.stop();}catch(e){}});
  MIX.srcs=[];MIX.gain=null;MIX.playing=false;
  if(MIX.ctx&&MIX.ctx.state==='running'){try{MIX.ctx.suspend();}catch(e){}}
  var btn=document.getElementById('bMusicPlay');
  // El texto vuelve al del idioma elegido, no a uno fijo en espanol.
  if(btn)btn.textContent=(typeof unifyLang==='function'&&unifyLang()==='en')
    ? '▶ Escuchar cómo quedará (narración EN + música)'
    : '▶ Escuchar cómo quedará (narración ES + música)';
}

// Al REGENERAR el Audio ES: se corta la mezcla si esta sonando y se borra la
// narracion vieja decodificada — la proxima escucha usa SIEMPRE el audio nuevo.
// (La unificacion, subtitulos y ZIP ya usan siempre el mas reciente.)
function invalidateVoiceMix(){
  try{
    stopMix();
    if(lastRes&&lastRes.uid){
      // Se sueltan los dos idiomas: la clave del cache lleva el idioma dentro.
      delete MIX.bufs['voz-es-'+lastRes.uid];
      delete MIX.bufs['voz-en-'+lastRes.uid];
      delete MIX.bufs['voz-'+lastRes.uid]; // clave vieja, por si quedo alguna
    }
  }catch(e){}
}

// Pausa los reproductores sueltos de narracion. Si uno de ellos esta sonando y
// ademas se lanza la mezcla, se oye la MISMA voz dos veces con un desfase: suena
// a "voz doble" y enturbiada (dos copias solapadas se filtran entre si).
function pausarReproductores(){
  ['pES','pEN'].forEach(function(id){
    var el=document.getElementById(id);
    if(el&&!el.paused){try{el.pause();}catch(e){}}
  });
}

async function toggleMixPreview(objectOverride){
  if(MIX.playing){stopMix();return;}
  pausarReproductores(); // nunca dos fuentes de la misma voz a la vez
  var sel=document.getElementById('musicSel');
  var st=document.getElementById('musicSt');
  var btn=document.getElementById('bMusicPlay');
  var mv=document.getElementById('mVol');
  var obj=objectOverride||(sel?sel.value:'');
  if(!obj){alert('Elige una pista primero (o genera una con IA).');return;}
  var orig=btn?btn.textContent:'';
  if(btn)btn.textContent='Cargando la pista...';
  try{
    // Desbloquear el audio DENTRO del toque (regla del iPhone), antes de cualquier espera.
    mixCtx();
    try{MIX.ctx.resume();}catch(e){}
    // Pista de musica (con cache para no descargarla dos veces)
    var mb=MIX.bufs[obj];
    if(!mb){
      var r=await fetch('/api/music',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'link',object:obj})});
      var d=await r.json();
      if(!r.ok||!d.url)throw new Error(d.error||'Error '+r.status);
      var resp=await fetch(d.url);
      if(!resp.ok)throw new Error('No se pudo descargar la pista');
      mb=await MIX.ctx.decodeAudioData(await resp.arrayBuffer());
      MIX.bufs[obj]=mb;
    }
    // Narracion (si ya se genero el Audio ES): la mezcla REAL
    // La narracion es la del IDIOMA elegido arriba. Antes esto era siempre audES,
    // asi que al poner el reel en ingles la vista previa te seguia sonando en
    // espanol: no se podia comprobar como quedaba la mezcla real del reel EN.
    var idiomaMix=(typeof unifyLang==='function')?unifyLang():'es';
    var audMix=idiomaMix==='en'?audEN:audES;
    var vb=null;
    if(audMix&&audMix.blob&&lastRes&&lastRes.uid){
      // La clave del cache lleva el idioma: si no, la voz en ingles se guardaba
      // bajo la misma clave que la espanola y se oia la que se hubiera cargado
      // primero.
      var vkey='voz-'+idiomaMix+'-'+lastRes.uid;
      if(!MIX.bufs[vkey])MIX.bufs[vkey]=await MIX.ctx.decodeAudioData(await audMix.blob.arrayBuffer());
      vb=MIX.bufs[vkey];
    }
    var vol=mv?parseInt(mv.value,10)/100:0.18;
    if(!isFinite(vol)||vol<0)vol=0.18;
    MIX.gen=(MIX.gen||0)+1;var myGen=MIX.gen; // invalida temporizadores de reproducciones anteriores
    var g=MIX.ctx.createGain();g.gain.value=vol;g.connect(MIX.ctx.destination);
    var ms=MIX.ctx.createBufferSource();ms.buffer=mb;ms.loop=true;ms.connect(g);
    MIX.gain=g;
    ms.start();MIX.srcs.push(ms);
    if(vb){
      var vs=MIX.ctx.createBufferSource();vs.buffer=vb;vs.connect(MIX.ctx.destination);
      vs.start();MIX.srcs.push(vs);
      vs.onended=function(){stopMix();};
    }else{
      // Sin narracion: la pista suena una sola pasada
      var durMs=Math.min(mb.duration,35)*1000+300;
      setTimeout(function(){if(MIX.gen===myGen&&MIX.playing)stopMix();},durMs);
    }
    MIX.playing=true;
    if(btn)btn.textContent='⏸ Detener';
    if(MIX.ctx.state==='suspended'){
      // Segundo intento de arranque; si el iPhone insiste, se pide otro toque.
      try{await MIX.ctx.resume();}catch(e){}
      if(MIX.ctx.state==='suspended'){
        stopMix();
        if(btn)btn.textContent=orig||'▶ Escuchar cómo quedará (narración + música)';
        if(st){st.style.display='block';st.textContent='Toca ▶ Escuchar una vez más para que arranque el sonido.';}
        return;
      }
    }
    if(st){
      st.style.display='block';
      st.textContent=vb
        ?'Sonando la MEZCLA REAL: narración al 100% + música al '+Math.round(vol*100)+'%. Mueve la barra mientras suena y déjala donde te guste.'
        :'Sonando la música al '+Math.round(vol*100)+'%. Genera el Audio ES para escuchar la mezcla completa con la narración.';
    }
  }catch(e){
    stopMix();
    if(btn)btn.textContent=orig||'▶ Escuchar cómo quedará (narración + música)';
    if(st){st.style.display='block';st.textContent='No se pudo reproducir: '+(e.message||'sin conexión');}
  }
}

function selectedMusic(){
  var sel=document.getElementById('musicSel');
  var vol=document.getElementById('mVol');
  if(!sel||!sel.value)return null;
  var v=vol?parseInt(vol.value,10)/100:0.18;
  if(!isFinite(v)||v<0||v>1)v=0.18;
  return {object:sel.value,volume:v};
}

// Cuantos clips componen el reel. Normalmente es el numero de imagenes, pero si
// se trajeron videos YA GENERADOS del banco puede no haber imagenes nuevas: en
// ese caso mandan los videos.
// El orden en que se ven los planos. Normalmente es 0,1,2...N (uno por imagen),
// pero en modo profesor lo dicta el BLOQUE M y las tomas se repiten.
function ordenDelMontaje(){
  var total=totalClips();
  var m=(lastRes&&Array.isArray(lastRes.montaje))?lastRes.montaje:null;
  if(!m||!m.length||lastRes.modo!=='profesor'){
    var lineal=[];
    for(var i=0;i<total;i++)lineal.push(i);
    return lineal;
  }
  // En el BLOQUE C las TOMAS van primero y los EJEMPLOS despues, asi que
  // "TOMA 3" es la imagen 2 (base 0) y "EJEMPLO 1" es la imagen nTomas+0.
  var nT=lastRes.nTomas||5;
  var out=[];
  m.forEach(function(x){
    var k=(x.tipo==='toma')?(x.n-1):(nT+x.n-1);
    if(k>=0&&k<total&&(!out.length||out[out.length-1]!==k))out.push(k);
  });
  if(!out.length){ for(var j=0;j<total;j++)out.push(j); }
  return out;
}

function totalClips(){
  var conImg=imgs.filter(function(x){return x&&x.src;}).length;
  var conVid=vids.filter(function(v){return v&&v.remoteUrl;}).length;
  return Math.max(conImg,conVid);
}

function updUnifyCard(){
  var card=document.getElementById('unifyCard');if(!card)return;
  if(!musicLoaded)loadMusicList();
  var sub=document.getElementById('unifySub');
  var total=totalClips();
  var listos=0;
  for(var i=0;i<vids.length;i++)if(vids[i]&&vids[i].remoteUrl)listos++;
  if(sub){
    var faltas=[];
    if(!total)faltas.push('imágenes');
    else if(listos<total)faltas.push('videos ('+listos+'/'+total+')');
    if(!(audES&&audES.partsB64&&audES.partsB64.length))faltas.push('audio ES');
    sub.textContent=faltas.length?('Faltan: '+faltas.join(' · '))
      :(listos===1?'Listo: 1 clip + la narración, en un solo video'
      :'Listo: se unirán los '+listos+' clips EN ORDEN + la narración, en un solo video');
  }
}

// Idioma con el que se va a unificar. Se recuerda entre sesiones.
var UNIFY_LANG='es';
function unifyLang(){ return UNIFY_LANG==='en'?'en':'es'; }
function setUnifyLang(l){
  UNIFY_LANG=(l==='en')?'en':'es';
  try{localStorage.setItem('lh_unify_lang',UNIFY_LANG);}catch(e){}
  Array.prototype.forEach.call(document.querySelectorAll('.unifyLang'),function(b){
    b.classList.toggle('sel',b.getAttribute('data-l')===UNIFY_LANG);
  });
  var btn=document.getElementById('bunify');
  if(btn)btn.textContent=UNIFY_LANG==='en'?'🎞 Unify video + English audio':'🎞 Unificar video + audio';
  // La escucha previa suena en ESTE idioma: se dice en el propio boton para que
  // no haya duda de que idioma vas a oir.
  var play=document.getElementById('bMusicPlay');
  if(play&&!MIX.playing){
    play.textContent=UNIFY_LANG==='en'
      ? '▶ Escuchar cómo quedará (narración EN + música)'
      : '▶ Escuchar cómo quedará (narración ES + música)';
  }
}
// ¿ESTA AL DIA EL CLOUD RUN? Antes no habia forma de saberlo: el servicio solo
// respondia {ok:true}, asi que cada vez que se tocaba el montaje habia que
// PREGUNTAR si se habia corrido el actualizador. Preguntar por algo que la
// maquina puede comprobar sola es hacerle perder el tiempo a quien la usa.
// Ahora el servicio devuelve su version, la herramienta la compara con la que
// espera, y lo dice ella misma en el panel de unificacion.
async function comprobarCloudRun(){
  var el=document.getElementById('crVer');
  if(!el)return;
  var d={};
  try{
    var r=await fetch('/api/unify');
    d=await r.json();
  }catch(e){ d={estado:'sin-respuesta',error:e.message}; }
  var css=function(borde,fondo,color){
    el.style.border='1px solid '+borde;el.style.background=fondo;el.style.color=color;
    el.style.display='block';
  };
  if(d.estado==='al-dia'){
    css('#9ab47a55','#f2f7ee','#5c7a45');
    el.innerHTML='✓ El montaje en Cloud Run está al día (versión '+escHtml(d.actual||'')+').';
  }else if(d.estado==='desactualizado'){
    css('#c4a05a66','#fbf5e8','#8a6a1f');
    el.innerHTML='⚠ <b>Al montaje le falta la última actualización.</b> '
      +'Tiene la versión '+escHtml(d.actual||'anterior a las versiones')+' y necesita la '+escHtml(d.esperada||'')+'.<br>'
      +'Corre esto una vez en la terminal de Google Cloud:<br>'
      +'<code style="display:block;margin-top:5px;padding:6px 8px;background:#fff;border:1px solid #e0d5bd;border-radius:6px;font-size:11px;word-break:break-all">curl -sL https://studio.legadodehierro.com/u.sh | bash</code>';
  }else if(d.estado==='sin-configurar'){
    css('#c4a05a66','#fbf5e8','#8a6a1f');
    el.textContent='⚠ El montaje aún no está configurado en Vercel (falta CLOUD_RUN_UNIFY_URL).';
  }else{
    css('#c4707066','#fbeeee','#96403f');
    el.textContent='⚠ El montaje no responde ahora mismo. Si acabas de desplegarlo, espera unos segundos y recarga.';
  }
}

function wireUnifyLang(){
  Array.prototype.forEach.call(document.querySelectorAll('.unifyLang'),function(b){
    if(b.dataset.wired)return; b.dataset.wired='1';
    b.addEventListener('click',function(){
      if(UNIFY_LANG===b.getAttribute('data-l'))return;
      // Si la escucha esta sonando, se corta: seguiria con la voz del idioma
      // anterior y daria la impresion de que el boton no hace nada.
      if(typeof stopMix==='function')stopMix();
      setUnifyLang(b.getAttribute('data-l'));
      chkExport();
    });
  });
  var g=null; try{g=localStorage.getItem('lh_unify_lang');}catch(e){}
  setUnifyLang(g==='en'?'en':'es');
}

async function unifyVideo(){
  if(!lastRes){alert('Genera un reel primero.');return;}
  var total=totalClips();
  // RESPALDO SIN CREDITOS: con imagenes pero sin clips, el reel se arma igual
  // dandoles movimiento. Sale por centimos en vez de dolares.
  var imgsListas=imgs.filter(function(x){return x&&x.src;});
  var soloImagenes=(!total&&imgsListas.length>0);
  if(!total&&!soloImagenes){
    // Caso tipico: se tocaron clips en el banco pero no se pulso el boton de
    // confirmar, asi que nunca llegaron a cargarse. Se dice tal cual.
    if(BANCO_SEL.length){
      alert('Tienes '+BANCO_SEL.length+' clips marcados en el banco, pero falta confirmarlos: pulsa el botón verde "✓ Usar estos '+BANCO_SEL.length+' clips en este orden" que está al final del panel.');
      var pb=document.getElementById('bancoPanel');
      if(pb&&pb.style.display==='block'){
        var ub=document.getElementById('bBancoUsar');
        if(ub&&ub.scrollIntoView)ub.scrollIntoView({block:'center',behavior:'smooth'});
      }
      return;
    }
    alert('Primero genera las imágenes y sus videos, o trae videos ya generados con "📼 Usar videos ya generados".');
    return;
  }
  // EL MONTAJE DEL MODO PROFESOR. El director entrega 5 tomas del mismo set y 3
  // ejemplos, y una lista de en que orden se ven. Las tomas SE REPITEN — asi se
  // filma una clase de verdad: se vuelve a la cara del que habla entre ejemplo y
  // ejemplo. Por eso un video de 5 minutos sale de 8 imagenes y no de 40.
  var orden=ordenDelMontaje();

  var urls=[];
  if(!soloImagenes){
    for(var oi=0;oi<orden.length;oi++){
      var k=orden[oi];
      if(!(vids[k]&&vids[k].remoteUrl)){alert('Falta el video del clip '+(k+1)+'. Genera todos los videos primero.');return;}
      urls.push(vids[k].remoteUrl);
    }
  }else{
    if(!confirm('No hay clips de video, pero sí '+imgsListas.length+' imágenes.\n\n'
      +'Se puede armar el reel con las imágenes, dándoles un movimiento lento para que no se vean estáticas. '
      +'Los clips de Veo son lo caro, así que esto no cuesta prácticamente nada.\n\n¿Lo armo así?'))return;
  }
  // IDIOMA DEL REEL. El mismo lote de clips (que ya esta pagado) sirve para el
  // reel en espanol y para el de ingles: solo cambia la narracion y los
  // subtitulos. Con el RPM de LATAM por los suelos, el reel en ingles es la via
  // mas barata que hay para subirlo, porque el video no se vuelve a generar.
  var idioma=unifyLang();
  var aud=idioma==='en'?audEN:audES;
  if(!(aud&&aud.partsB64&&aud.partsB64.length)){
    alert(idioma==='en'
      ? 'Genera (o sube) el Audio EN primero: es la narración en inglés que se pega a estos mismos clips.'
      : 'Genera el Audio ES primero (la narración que se pega al video).');
    return;
  }
  var btn=document.getElementById('bunify');
  var st=document.getElementById('unifySt');
  var er=document.getElementById('unifyErr');
  var box=document.getElementById('unifyRes');
  btn.disabled=true;btn.style.opacity='.6';
  er.style.display='none';box.style.display='none';
  st.style.display='block';st.textContent=soloImagenes
    ? 'Armando el reel con '+imgsListas.length+' imágenes y movimiento...'
    : 'Enviando trabajo al servicio de unificación...';
  try{
    var music=selectedMusic();
    // SUBTITULOS: se calculan aqui, con los tiempos por caracter que devuelve
    // ElevenLabs, y se mandan para QUEMARLOS en el video. Hasta ahora solo
    // acababan en un .srt suelto dentro del ZIP y el reel tenia que pasar por
    // CapCut. Si el audio se subio a mano no hay alignment: se estima por texto.
    var texto=idioma==='en'?(lastRes&&lastRes.f):(lastRes&&lastRes.a);
    var srt=aud.alignment?makeSRTFromAlignment(aud.alignment):makeSRT(texto||'',aud);
    var objetivo=Number((lastRes&&lastRes.dO&&lastRes.dO.id)||0);
    var r=await fetch('/api/unify',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({videos:urls,audioParts:aud.partsB64,music:music,
        srt:srt,targetSeconds:objetivo,
        imagenes:soloImagenes?orden.map(function(k){return dataUrlToB64(imgs[k].src);}):[]}),
    });
    var d=await r.json().catch(function(){return{};});
    if(!r.ok||!d.jobId)throw new Error(d.error||'Error '+r.status);
    st.textContent='Uniendo clips y ajustando velocidad... (1 a 3 minutos)';
    // Polling del estado, igual que con los videos de Veo.
    var videoUrl=null,attempts=0,maxAttempts=60; // ~7 min a 7s
    while(attempts<maxAttempts){
      await new Promise(function(res2){setTimeout(res2,7000);});
      attempts++;
      var sres=await fetch('/api/unify-status',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({jobId:d.jobId}),
      });
      var sd=await sres.json().catch(function(){return{};});
      if(!sres.ok)throw new Error(sd.error||'Error '+sres.status);
      if(sd.done){
        if(sd.error)throw new Error(sd.error);
        videoUrl=sd.videoUrl;
        break;
      }
      if(sd.stage)st.textContent=sd.stage;
    }
    if(!videoUrl)throw new Error('El servicio tardó demasiado. Revisa en unos minutos o vuelve a intentar.');
    st.textContent='Descargando el video final...';
    var vr=await fetch(videoUrl);
    if(!vr.ok)throw new Error('No se pudo descargar el video final.');
    var vb=await vr.blob();
    // Se guarda POR IDIOMA. Antes era una sola variable y el reel en ingles
    // pisaba al de espanol: en el ZIP solo llegaba el ultimo que hubieras hecho.
    // Ahora puedes unificar los dos y el ZIP se los lleva los dos.
    finalVid={url:URL.createObjectURL(vb),blob:vb,lang:idioma};
    FINALES[idioma]=finalVid;
    renderFinalVid();
    st.textContent=music?'Video final listo, con narración y música mezcladas. Listo para publicar.':'Video final listo (sin música de fondo).';
    chkExport();
  }catch(e){
    st.style.display='none';
    er.textContent='Error: '+(e.message||'Error de conexión');er.style.display='block';
  }finally{
    btn.disabled=false;btn.style.opacity='1';
  }
}

function renderFinalVid(){
  var box=document.getElementById('unifyRes');
  if(!box||!finalVid)return;
  box.innerHTML='';box.style.display='block';
  var vid=document.createElement('video');
  vid.src=finalVid.url;vid.controls=true;
  vid.style.cssText='width:100%;max-width:280px;border-radius:10px;display:block;background:#000;margin-bottom:8px';
  box.appendChild(vid);
  var slug=(lastRes&&lastRes.topic?lastRes.topic:'reel').slice(0,25).replace(/[^a-zA-Z0-9]/g,'-');
  // Un boton por cada idioma que YA este unificado, no solo por el ultimo.
  var fila=document.createElement('div');
  fila.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
  [['es','🇪🇸 Español'],['en','🇺🇸 English']].forEach(function(par){
    var f=FINALES[par[0]];
    if(!f)return;
    var dl=botonDescarga(function(){return f.url;},slug+'-final-'+par[0]+'.mp4','video/mp4','⬇ '+par[1],'');
    var activo=finalVid&&finalVid.lang===par[0];
    dl.style.cssText='display:inline-block;background:'+(activo
      ? 'linear-gradient(135deg,#7a9ec4,#9ab8d8)' : '#fff')
      +';color:'+(activo?'#fff':'#7a9ec4')+';border:1.5px solid #7a9ec4;padding:8px 14px;'
      +'border-radius:8px;font-size:12px;font-weight:600;text-decoration:none';
    fila.appendChild(dl);
  });
  box.appendChild(fila);
  // Si ya estan los dos, se dice: es la senal de que el ZIP se los llevara ambos.
  var nota=document.createElement('div');
  nota.style.cssText='font-size:10.5px;color:var(--tx3);line-height:1.5;margin-top:8px';
  nota.textContent=(FINALES.es&&FINALES.en)
    ? 'Los dos idiomas están unificados. El ZIP se lleva los dos vídeos finales, y las imágenes y los clips una sola vez.'
    : 'Ya puedes cambiar el idioma arriba, generar su narración y unificar otra vez: los clips no se vuelven a generar ni a pagar.';
  box.appendChild(nota);
}

function chkExport(){if(audES||audEN||imgs.length||thumbImg||finalVid||FINALES.es||FINALES.en)document.getElementById('expbtn').style.display='flex';}

// El tiempo de un subtitulo, en el formato exacto del SRT.
//
// Ojo con el redondeo de los milisegundos: 56,9997 s redondeaba a "1000" ms y
// salia "00:00:56,1000", que NO es un tiempo valido de SRT. Un solo timestamp
// invalido puede tirar el resto del archivo cuando ffmpeg lo lee. Se redondea
// primero el total en milisegundos y luego se reparte, que es lo unico que no
// puede desbordar.
function fmtSRTTime(s){
  var tot=Math.max(0,Math.round(Number(s||0)*1000));
  var ms=tot%1000; tot=(tot-ms)/1000;
  var sc=tot%60;   tot=(tot-sc)/60;
  var m=tot%60;    var h=(tot-m)/60;
  var dd=function(n){return(n<10?'0':'')+n;};
  return dd(h)+':'+dd(m)+':'+dd(sc)+','+(ms<100?(ms<10?'00':'0'):'')+ms;
}

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

// Subtitulos SIN los tiempos de ElevenLabs (cuando el audio se sube a mano,
// porque el plan gratis no da acceso a su API).
//
// Antes esto repartia el tiempo a 130 palabras por minuto FIJAS, sin mirar el
// audio. Si la voz real iba a otro ritmo — y siempre va a otro ritmo — el
// desfase se acumulaba palabra a palabra y al final del reel los subtitulos
// estaban muy por detras de la voz.
//
// Ahora, cuando se conoce el audio (`aud`), se reparte DENTRO del tramo real de
// voz: empieza donde empieza la voz y acaba donde acaba. Asi el error deja de
// acumularse; como mucho queda un pequeno baile dentro de cada frase.
// Y el peso de cada bloque se calcula por CARACTERES, no por numero de palabras
// ("de" y "responsabilidad" no tardan lo mismo), con un extra de tiempo en la
// puntuacion, que es donde la voz respira.
function makeSRT(text,aud){
  var words=String(text||'').replace(/\n+/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(function(w){return w.length>0;});
  if(!words.length)return '';
  var grupos=[],i=0;
  while(i<words.length){
    var group=[];
    while(i<words.length&&group.length<4){
      group.push(words[i]);i++;
      if(/[.!?,;:]$/.test(group[group.length-1]))break;
    }
    if(!group.length)break;
    grupos.push(group.join(' '));
  }
  // Peso de cada bloque: sus caracteres + una pausa segun el signo con que cierra.
  var PAUSA={'.':9,'!':9,'?':9,';':6,':':6,',':4};
  var pesos=grupos.map(function(g){
    var fin=g.slice(-1),extra=PAUSA[fin]||0;
    return Math.max(4,g.replace(/\s/g,'').length)+extra;
  });
  var suma=pesos.reduce(function(a,b){return a+b;},0);

  // Ventana en la que hay que encajar el texto.
  var t0=0,total,tramos=null;
  if(aud&&isFinite(aud.vozFin)&&aud.vozFin>aud.vozIni+0.5){
    t0=aud.vozIni;total=aud.vozFin-aud.vozIni;      // el tramo de voz medido
    tramos=aud.vozTramos||null;
  }else if(aud&&isFinite(aud.dur)&&aud.dur>0.5){
    total=aud.dur;                                   // al menos la duracion real
  }else{
    total=suma*(60/130)/5.5;                         // sin audio: la estimacion de siempre
  }

  // EL TEXTO SE REPARTE SOBRE EL TIEMPO HABLADO, no sobre el tiempo total.
  //
  // En un reel de 40 s daba igual. En uno de tres minutos, no: los silencios
  // entre parrafos se llevaban su parte del texto, y el desfase se acumulaba
  // hasta que los subtitulos iban por un lado y la voz por otro. Ahora el reparto
  // se hace por segundos de voz y luego se traduce al reloj del audio, con lo que
  // las pausas salen gratis y el error no pasa de una frase.
  var hablado=total;
  if(tramos&&tramos.length){
    hablado=0;
    for(var q=0;q<tramos.length;q++)hablado+=tramos[q].fin-tramos[q].ini;
    if(hablado<0.5){tramos=null;hablado=total;}
  }

  var segs=[],tv=0;
  for(var k=0;k<grupos.length;k++){
    var d=hablado*(pesos[k]/suma);
    segs.push({
      text:grupos[k],
      start:tiempoRealDeVoz(tramos,t0,t0+total,tv),
      end:tiempoRealDeVoz(tramos,t0,t0+total,tv+d),
    });
    tv+=d;
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
    var capFull='';
    if(lastCaption||lastTags){
      capFull+='===== FACEBOOK =====\n\n'+(lastCaption||'')+(lastTags?(lastCaption?'\n\n':'')+lastTags:'')+'\n\n\n';
    }
    if(lastTikTok){
      capFull+='===== TIKTOK =====\n\n'+(lastCaption||'')+(lastCaption?'\n\n':'')+lastTikTok+'\n\n\n';
    }
    if(lastYouTube){
      capFull+='===== YOUTUBE ('+lastYouTube.length+'/100 caracteres) =====\n\n'+lastYouTube+'\n';
    }
    if(capFull) zip.file(slug+'-caption-es.txt',capFull.trim()+'\n');
    // El mismo archivo en INGLES. Antes solo salia el espanol y habia que
    // traducir a mano fuera de la herramienta cada vez.
    var capEN='';
    if(lastCaptionEN||lastTagsEN){
      capEN+='===== FACEBOOK =====\n\n'+(lastCaptionEN||'')+(lastTagsEN?(lastCaptionEN?'\n\n':'')+lastTagsEN:'')+'\n\n\n';
    }
    if(lastTikTokEN){
      capEN+='===== TIKTOK =====\n\n'+(lastCaptionEN||'')+(lastCaptionEN?'\n\n':'')+lastTikTokEN+'\n\n\n';
    }
    if(lastYouTubeEN){
      capEN+='===== YOUTUBE ('+lastYouTubeEN.length+'/100 caracteres) =====\n\n'+lastYouTubeEN+'\n';
    }
    if(capEN) zip.file(slug+'-caption-en.txt',capEN.trim()+'\n');
    var srtES=audES&&audES.alignment?makeSRTFromAlignment(audES.alignment):makeSRT(lastRes&&lastRes.a?lastRes.a:'',audES);
    var srtEN=audEN&&audEN.alignment?makeSRTFromAlignment(audEN.alignment):makeSRT(lastRes&&lastRes.f?lastRes.f:'',audEN);
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
    if(thumbImg){
      var tb64=dataUrlToB64(thumbImg);
      // Archivo aparte, separado de las imagenes numeradas del guion.
      if(tb64) zip.file(slug+'-miniatura.png',tb64,{base64:true});
    }
    for(var vi=0;vi<vids.length;vi++){
      if(vids[vi]&&vids[vi].blob){
        var vb=await vids[vi].blob.arrayBuffer();
        zip.file('videos/'+slug+'-video-'+(vi+1)+'.mp4',vb);
      }
    }
    // Los dos videos finales, cada uno con su idioma en el nombre. Las imagenes y
    // los clips de arriba van UNA sola vez: son los mismos para los dos reels.
    var idiomas=['es','en'];
    for(var li=0;li<idiomas.length;li++){
      var fin=FINALES[idiomas[li]];
      if(fin&&fin.blob){
        var fb=await fin.blob.arrayBuffer();
        zip.file(slug+'-final-'+idiomas[li]+'.mp4',fb);
      }
    }
    var content=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:3}});
    // Y no se da por descargado hasta que de verdad se guarda: antes ponia
    // "ZIP Descargado" pasara lo que pasara, y en el iPhone no pasaba nada.
    var res=await descargarArchivo(content,slug+'-legado.zip','application/zip');
    btn.innerHTML=res==='cancelado'?'⬇ Descargar ZIP':'✓ ZIP guardado';
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
  audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];thumbImg=null;finalVid=null;FINALES={es:null,en:null};sT='';rfAll();
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

// Frases de respaldo (si la IA falla): CORTAS y duras, estilo post viral.
var POST_FRASES=[
  {titulo:'El sueldo te paga\nla jaula',subtitulo:'Los activos te compran la puerta.'},
  {titulo:'Nadie se hace rico\nobedeciendo',subtitulo:'Construye lo tuyo, aunque empieces pequeño.'},
  {titulo:'La disciplina pesa gramos.\nEl arrepentimiento, toneladas',subtitulo:''},
  {titulo:'Estar ocupado\nno es avanzar',subtitulo:'Construye activos, no jornadas.'},
  {titulo:'Tu tiempo se acaba.\nTu excusa sigue intacta',subtitulo:'Empieza hoy.'},
];

// Escenas COMPLETAS (la imagen llena todo el post, como los virales de Facebook).
// Composicion pensada para dejar aire abajo, donde va la frase.
var POST_ESTILOS_IMG=[
  'cinematic full scene, man standing at a rooftop edge at dusk overlooking glowing city lights, three-quarter view, dramatic sky with warm horizon, subject in the upper two thirds of the frame',
  'cinematic full scene, man in a dark office at night beside a floor-to-ceiling window with city lights behind, single warm lamp glow, powerful calm stance, subject in the upper two thirds of the frame',
  'cinematic full scene, man walking alone through a grand marble lobby toward camera, long confident stride, dramatic beams of light, subject in the upper two thirds of the frame',
  'cinematic full scene, man seated at the head of a long dark boardroom table, strong side lighting carving his face, papers and a closed laptop before him, subject in the upper two thirds of the frame',
  'cinematic full scene, man in a dark tailored suit staring out of a floor-to-ceiling window at sunrise over the city, seen from a low three-quarter angle, golden rim light, subject in the upper two thirds of the frame',
];

function downloadPost(){
  var canvas=document.getElementById('postCanvas');
  if(!canvas)return;
  descargarArchivo(canvas.toDataURL('image/png',1.0),'legado-post-'+postFmt+'.png','image/png')
    .catch(function(e){alert('No se pudo guardar: '+(e.message||'error'));});
}

// ==== POSTS VIRALES — 4 plantillas basadas en los formatos que funcionan en Facebook ====
// 'frase'      -> foto cinematografica completa + frase en bloques blanco/dorado al centro
// 'cita'       -> fondo negro elegante, cita en serif arriba, escena abajo
// 'lista'      -> infografia de reglas numeradas con titulo fuerte (sin imagen: rapida)
// 'comparacion'-> dos escenas: arriba lo correcto, abajo el error, con sus leyendas
// Todas con la paleta de LEGADO DE HIERRO y el personaje en estilo comic cuando aplica.

var POST_CHAR='Subject when a person appears: handsome confident man, 35 years old, short black hair slicked back, well-groomed short dark beard, sharp jawline, intense dark brown eyes, serious determined expression never smiling, dark tailored suit. American 2D comic book illustration style, bold ink lines, dramatic cel-shading, rich dark palette with golden accent lighting. No text in image. NO robots, NO futurism, NO sci-fi, NO broken chains around people, NO magic effects, NO rain or weather. Real business and finance world only. ';

var POST_ORO='#d9b46a',POST_ORO_CLARO='#e8cd8f',POST_FONDO='#0a0b10';

// Respaldos si la IA de texto falla, uno por plantilla
var FB_FRASE={lineas:[{t:'EL SUELDO TE PAGA',oro:false},{t:'LA JAULA',oro:true},{t:'LOS ACTIVOS TE COMPRAN',oro:false},{t:'LA PUERTA',oro:true}]};
var FB_CITA={destacada:'El miedo',resto:'no construye nada que te sobreviva.',escena_en:'dark elegant desk with neat stacks of cash, a laptop showing a rising golden chart, a luxury watch and a fountain pen, moody cinematic lighting'};
var FB_LISTA={titulo1:'5 REGLAS PARA QUE',titulo2:'EL DINERO TE RINDA',reglas:[
  {e:'💵',t:'EFECTIVO SOLO',d1:'Lleva solo lo necesario.',d2:'Si no lo tienes, no lo gastas.'},
  {e:'⏳',t:'REGLA 24H',d1:'Antes de comprar, espera un día.',d2:'El impulso pasará.'},
  {e:'📝',t:'LISTA BLINDADA',d1:'Si no está en la lista,',d2:'no existe.'},
  {e:'📅',t:'LÍMITE SEMANAL',d1:'Ponte un tope de gasto',d2:'y cúmplelo a muerte.'},
  {e:'🫙',t:'CORTA EL GOTEO',d1:'Los gastos pequeños diarios',d2:'arruinan tu cuenta.'}]};
var FB_COMP={titulo1:'Una vez que lo entiendes',titulo2:'no hay vuelta atrás',
  a_caption:'El dinero trabaja para ti',a_sub:'El dinero invertido genera más dinero solo',
  a_escena_en:'the brand man calmly reviewing golden rising charts in an elegant dark office, wealth flowing, warm golden light',
  b_caption:'Tú trabajas por el dinero',b_sub:'Cambias tiempo y esfuerzo por un salario',
  b_escena_en:'a tired worker hunched at a cramped desk buried in papers under cold fluorescent light, clock on the wall, exhausted posture'};

var postTpl='frase';
function selPostTpl(t){
  postTpl=t;
  Array.prototype.forEach.call(document.querySelectorAll('.postTpl'),function(b){
    var s=b.getAttribute('data-t')===t;
    b.style.borderColor=s?'#b8975a':'';b.style.color=s?'#b8975a':'';b.style.background=s?'#f0e8d8':'';
  });
}

// Pide a Gemini el texto de la plantilla en JSON; si falla, usa el respaldo.
async function postTexto(prompt,fallback){
  try{
    var r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:prompt})});
    var d=await r.json();
    var o=JSON.parse(d.text.replace(/```json|```/g,'').trim());
    if(o)return o;
  }catch(e){console.warn('Texto del post fallo, uso respaldo:',e.message);}
  return fallback;
}

async function postImagen(escena,aspect,refs,st,msg){
  if(st)st.textContent=msg||'Generando escena...';
  var r=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:POST_CHAR+escena+' Single full scene filling the whole frame.',refImages:refs||[],model:postImgModel,aspectRatio:aspect})});
  var d=await r.json();
  if(!r.ok||!d.image)throw new Error(d.error||'Error generando la escena');
  return d.image;
}

var POST_VOZ='Eres el estratega de contenido de LEGADO DE HIERRO, canal en español para hombres que trabajan para otro y quieren construir lo suyo. Voz cruda, directa, CONCRETA — nada vago, nada de frases de coach vistas mil veces. Español impecable con tildes. ';

// CAPTION + HASHTAGS del post (igual que en los videos): se genera solo al
// terminar cada post; el primer hashtag es SIEMPRE #LegadoDeHierro.
var lastPostCaption='',lastPostTags='',lastPostResumen='';

async function genPostCaption(){
  var box=document.getElementById('postCapBox');
  if(!box||!lastPostResumen)return;
  var stc=document.getElementById('postCapSt');
  var txt=document.getElementById('postCapText');
  var tgs=document.getElementById('postCapTags');
  box.style.display='block';
  txt.textContent='';tgs.textContent='';
  stc.style.display='block';stc.textContent='Generando caption y hashtags...';
  try{
    var r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:'Eres el community manager de LEGADO DE HIERRO, canal en español sobre libertad financiera, disciplina, mentalidad y construir lo propio. Voz cruda y directa, sin motivación vacía ni frases de coach.\n\nEste POST (imagen estática) se va a publicar en Facebook. Su contenido es:\n'+lastPostResumen+'\n\nEscribe el texto de la publicación. Devuelve EXACTAMENTE este formato en texto plano, sin markdown, sin ** ni ##:\n\nCAPTION:\n[2 a 4 frases cortas y potentes que amplíen la idea del post SIN repetirlo palabra por palabra, y cierren invitando a comentar, guardar o seguir el canal. Máximo 1 emoji o ninguno. Sin hashtags aquí.]\n\nHASHTAGS:\n[Entre 12 y 18 hashtags en UNA sola línea separados por espacios. El PRIMERO debe ser SIEMPRE #LegadoDeHierro. Los demás relevantes al tema del post y al nicho (finanzas, disciplina, mentalidad, dinero, libertad financiera, emprendimiento, éxito, negocios). Mezcla español y algunos universales. Sin numerar, solo los hashtags.]'})});
    var d=await r.json();
    if(!r.ok||!d.text)throw new Error(d.error||'Error '+r.status);
    var t=(d.text||'').replace(/\r/g,'').replace(/\*/g,'');
    var mC=t.match(/CAPTION\s*:\s*([\s\S]*?)(?:HASHTAGS\s*:|TIKTOK\s*:|YOUTUBE\s*:|$)/i);
    var mH=t.match(/HASHTAGS\s*:\s*([\s\S]*?)(?:TIKTOK\s*:|YOUTUBE\s*:|$)/i);
    var cap=mC?mC[1].trim():t.trim();
    var tags=mH?mH[1].replace(/\n+/g,' ').replace(/\s{2,}/g,' ').trim():'';
    if(tags){
      var lower=tags.toLowerCase();
      if(lower.indexOf('#legadodehierro')===-1){tags='#LegadoDeHierro '+tags;}
      else if(lower.indexOf('#legadodehierro')>0){
        tags=tags.replace(/#legadodehierro/ig,'').replace(/\s{2,}/g,' ').trim();
        tags='#LegadoDeHierro '+tags;
      }
    }else{tags='#LegadoDeHierro';}
    lastPostCaption=cap;lastPostTags=tags;
    txt.textContent=cap;tgs.textContent=tags;
    stc.style.display='none';
  }catch(e){
    stc.textContent='Error generando el caption: '+(e.message||'sin conexión')+' — toca ↻ para reintentar.';
  }
}

async function genPost(){
  var btn=document.getElementById('bpost');
  var st=document.getElementById('postSt');
  var err=document.getElementById('postErr');
  var result=document.getElementById('postResult');
  var orig=btn.textContent;
  btn.textContent='Generando...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';st.textContent='Escribiendo el contenido...';
  err.style.display='none';result.style.display='none';
  try{
    var pcb=document.getElementById('postCapBox');
    if(pcb)pcb.style.display='none';
    lastPostResumen='';lastPostCaption='';lastPostTags='';
    var tema=document.getElementById('postTema').value.trim();
    var sobre=tema?('sobre: "'+tema+'"'):'sobre libertad financiera, disciplina, dinero o construir lo propio (elige TÚ un ángulo específico y sorpréndeme)';
    var isVertical=postFmt==='vertical';
    var refs=[];
    async function cargarRefs(){
      if(refs.length)return refs;
      st.textContent='Cargando referencias del personaje...';
      var rr=await fetch('/api/refs?set=personaje').catch(function(){return null;});
      if(rr&&rr.ok){var rd=await rr.json().catch(function(){return{};});refs=(rd&&rd.refs)?rd.refs:[];}
      return refs;
    }

    if(postTpl==='lista'){
      var n=isVertical?6:5;
      var oL=await postTexto(POST_VOZ+'Crea una LISTA para un post viral de Facebook '+sobre+'. Devuelve SOLO un JSON sin markdown: {"titulo1":"primera línea del título, máximo 4 palabras","titulo2":"segunda línea, la FUERTE, máximo 4 palabras","reglas":[{"e":"UN emoji que ilustre la regla","t":"TÍTULO DE 2-3 PALABRAS","d1":"primera línea, máximo 7 palabras","d2":"segunda línea, máximo 7 palabras"}]} con EXACTAMENTE '+n+' reglas accionables y concretas. El título debe incluir el número, ej: "'+n+' REGLAS PARA QUE".',FB_LISTA);
      st.textContent='Componiendo la infografía...';
      composeLista(oL,isVertical);
      lastPostResumen='Post tipo LISTA: '+(oL.titulo1||'')+' '+(oL.titulo2||'')+'. Reglas: '+((oL.reglas||[]).map(function(g){return (g.t||'')+' ('+(g.d1||'')+' '+(g.d2||'')+')';}).join(' | '));
    }else if(postTpl==='comparacion'){
      var oC=await postTexto(POST_VOZ+'Crea un post viral de COMPARACIÓN (arriba lo correcto, abajo el error) '+sobre+'. Devuelve SOLO un JSON sin markdown: {"titulo1":"primera línea del título, máximo 5 palabras","titulo2":"segunda línea, máximo 5 palabras","a_caption":"leyenda de la escena CORRECTA, máximo 6 palabras","a_sub":"explicación corta, máximo 10 palabras","a_escena_en":"IN ENGLISH: scene showing the winning path, 20-30 words, may feature the brand man","b_caption":"leyenda de la escena del ERROR, máximo 6 palabras","b_sub":"explicación corta, máximo 10 palabras","b_escena_en":"IN ENGLISH: scene showing the losing path, 20-30 words"}',FB_COMP);
      await cargarRefs();
      var imgA=await postImagen(oC.a_escena_en||FB_COMP.a_escena_en,'16:9',refs,st,'Generando la escena correcta (1 de 2)...');
      var imgB=await postImagen(oC.b_escena_en||FB_COMP.b_escena_en,'16:9',refs,st,'Generando la escena del error (2 de 2)...');
      st.textContent='Componiendo el post...';
      await composeComparacion(oC,imgA,imgB,isVertical);
      lastPostResumen='Post de COMPARACIÓN: '+(oC.titulo1||'')+' '+(oC.titulo2||'')+'. Lo correcto: '+(oC.a_caption||'')+' ('+(oC.a_sub||'')+'). El error: '+(oC.b_caption||'')+' ('+(oC.b_sub||'')+').';
      cost+=(IMG_COST[postImgModel]||0.039)*2;updCost();
    }else if(postTpl==='cita'){
      var oQ=await postTexto(POST_VOZ+'Crea una CITA corta para un post viral elegante '+sobre+'. Devuelve SOLO un JSON sin markdown: {"destacada":"las 2-4 palabras INICIALES de la cita (las que van en negrita)","resto":"el resto de la cita; total máximo 14 palabras, que golpee","escena_en":"IN ENGLISH: dark elegant scene for the lower half (desk, money, city, the brand man optional), 20-30 words"}',FB_CITA);
      await cargarRefs();
      var imgQ=await postImagen(oQ.escena_en||FB_CITA.escena_en,'3:2',refs,st,'Generando la escena...');
      st.textContent='Componiendo el post...';
      await composeCita(oQ,imgQ,isVertical);
      lastPostResumen='Post de CITA: "'+(oQ.destacada||'')+' '+(oQ.resto||'')+'"';
      cost+=(IMG_COST[postImgModel]||0.039);updCost();
    }else{
      var oF=await postTexto(POST_VOZ+'Crea una FRASE para un post viral de Facebook '+sobre+'. Se muestra en bloques centrados, unas líneas blancas y las CLAVE en dorado. Devuelve SOLO un JSON sin markdown: {"lineas":[{"t":"2-4 palabras","oro":false}]} con 4 a 6 líneas que juntas formen UNA frase dura y concreta; marca "oro":true en las 1-3 líneas más fuertes.',FB_FRASE);
      var estilo=POST_ESTILOS_IMG[Math.floor(Math.random()*POST_ESTILOS_IMG.length)];
      await cargarRefs();
      var imgF=await postImagen(estilo+' Keep the middle band of the scene visually calm so a big caption can sit over it.',isVertical?'4:5':'1:1',refs,st,'Generando la escena de fondo...');
      st.textContent='Componiendo el post...';
      await composeFrase(oF,imgF,isVertical);
      lastPostResumen='Post de FRASE: "'+((oF.lineas||[]).map(function(l){return l.t;}).join(' '))+'"';
      cost+=(IMG_COST[postImgModel]||0.039);updCost();
    }
    result.style.display='block';
    st.textContent='Post listo para publicar.';
    await genPostCaption(); // caption + hashtags automaticos, #LegadoDeHierro primero
  }catch(e){
    err.textContent='Error: '+e.message;err.style.display='block';st.style.display='none';
  }finally{
    btn.textContent=orig;btn.style.opacity='1';btn.disabled=false;
  }
}

// ---- utilidades de lienzo ----
function postCanvas(isVertical){
  var canvas=document.getElementById('postCanvas');
  var W=1080,H=isVertical?1350:1080;
  canvas.width=W;canvas.height=H;
  return {c:canvas,x:canvas.getContext('2d'),W:W,H:H};
}
function cargarImg(b64){
  return new Promise(function(res,rej){
    var img=new Image();
    img.onload=function(){res(img);};
    img.onerror=function(){rej(new Error('No se pudo leer la imagen'));};
    img.src='data:image/png;base64,'+b64;
  });
}
function coverDraw(ctx,img,x,y,w,h){
  var s=Math.max(w/img.width,h/img.height);
  var dw=img.width*s,dh=img.height*s;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  ctx.restore();
}
function marcaLdH(ctx,W,y){
  ctx.textAlign='center';
  ctx.font='700 26px Arial Black, Arial';
  ctx.fillStyle=POST_ORO;
  ctx.fillText('⚔  L E G A D O  D E  H I E R R O',W/2,y);
  ctx.textAlign='left';
}
function esquinasOro(ctx,W,H){
  ctx.strokeStyle='rgba(217,180,106,0.55)';ctx.lineWidth=3;
  var m=34,l=64;
  [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(function(p){
    ctx.beginPath();ctx.moveTo(p[0]+l*p[2],p[1]);ctx.lineTo(p[0],p[1]);ctx.lineTo(p[0],p[1]+l*p[3]);ctx.stroke();
  });
}

// PLANTILLA 1 — FRASE dura sobre foto completa (bloques blanco/dorado, divisores)
async function composeFrase(o,imgB64,isVertical){
  var pc=postCanvas(isVertical),ctx=pc.x,W=pc.W,H=pc.H;
  var img=await cargarImg(imgB64);
  ctx.fillStyle=POST_FONDO;ctx.fillRect(0,0,W,H);
  coverDraw(ctx,img,0,0,W,H);
  ctx.fillStyle='rgba(5,5,10,0.38)';ctx.fillRect(0,0,W,H);
  var lineas=(o.lineas||FB_FRASE.lineas).slice(0,6);
  var maxW=W-150,size=isVertical?84:80;
  while(size>44){
    ctx.font='900 '+size+'px Arial Black, Arial';
    var ancha=lineas.some(function(l){return ctx.measureText(String(l.t||'').toUpperCase()).width>maxW;});
    if(!ancha)break;size-=4;
  }
  var lh=size*1.16,bloqueH=lineas.length*lh;
  var y0=H/2-bloqueH/2+size*0.8;
  // banda oscura tras el texto para lectura
  var g=ctx.createLinearGradient(0,y0-size*1.6,0,y0+bloqueH);
  g.addColorStop(0,'rgba(5,5,10,0)');g.addColorStop(0.2,'rgba(5,5,10,0.55)');
  g.addColorStop(0.8,'rgba(5,5,10,0.55)');g.addColorStop(1,'rgba(5,5,10,0)');
  ctx.fillStyle=g;ctx.fillRect(0,y0-size*1.9,W,bloqueH+size*2.2);
  // divisores dorados arriba y abajo del bloque
  ctx.fillStyle=POST_ORO;
  ctx.fillRect(W/2-W*0.29,y0-size-46,W*0.58,7);
  ctx.fillRect(W/2-W*0.29,y0+bloqueH-size+52,W*0.58,7);
  ctx.textAlign='center';
  ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=14;ctx.shadowOffsetY=3;
  lineas.forEach(function(l,i){
    ctx.font='900 '+size+'px Arial Black, Arial';
    ctx.fillStyle=l.oro?POST_ORO_CLARO:'#ffffff';
    ctx.fillText(String(l.t||'').toUpperCase(),W/2,y0+i*lh);
  });
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  var gB=ctx.createLinearGradient(0,H-190,0,H);
  gB.addColorStop(0,'rgba(5,5,10,0)');gB.addColorStop(1,'rgba(5,5,10,0.9)');
  ctx.fillStyle=gB;ctx.fillRect(0,H-190,W,190);
  marcaLdH(ctx,W,H-52);
}

// PLANTILLA 2 — CITA elegante (serif arriba, escena abajo)
async function composeCita(o,imgB64,isVertical){
  var pc=postCanvas(isVertical),ctx=pc.x,W=pc.W,H=pc.H;
  var img=await cargarImg(imgB64);
  ctx.fillStyle='#050507';ctx.fillRect(0,0,W,H);
  var imgY=H*0.46;
  coverDraw(ctx,img,0,imgY,W,H-imgY);
  var gT=ctx.createLinearGradient(0,imgY,0,imgY+220);
  gT.addColorStop(0,'rgba(5,5,7,1)');gT.addColorStop(1,'rgba(5,5,7,0)');
  ctx.fillStyle=gT;ctx.fillRect(0,imgY,W,220);
  // comillas doradas
  ctx.textAlign='left';
  ctx.font='900 150px Georgia, serif';
  ctx.fillStyle=POST_ORO;
  ctx.fillText('\u201C',110,H*0.20);
  // cita con arranque en negrita: se dibuja palabra por palabra centrando cada linea
  var size=isVertical?66:62;
  var maxW=W-220;
  var palabras=[];
  String(o.destacada||'').split(/\s+/).filter(Boolean).forEach(function(w){palabras.push({w:w,b:true});});
  String(o.resto||'').split(/\s+/).filter(Boolean).forEach(function(w){palabras.push({w:w,b:false});});
  function fuente(b){return (b?'700 ':'400 ')+size+'px Georgia, serif';}
  while(size>40){
    var lineasQ=[],cur=[],curW=0,esp;
    ctx.font=fuente(false);esp=ctx.measureText(' ').width;
    palabras.forEach(function(p){
      ctx.font=fuente(p.b);
      var pw=ctx.measureText(p.w).width;
      if(curW+pw>maxW&&cur.length){lineasQ.push(cur);cur=[];curW=0;}
      cur.push({w:p.w,b:p.b,pw:pw});curW+=pw+esp;
    });
    if(cur.length)lineasQ.push(cur);
    if(lineasQ.length<=4)
      {var yq=H*0.185;
      lineasQ.forEach(function(ln){
        var total=0;ln.forEach(function(p){total+=p.pw;});total+=esp*(ln.length-1);
        var xq=(W-total)/2;
        ln.forEach(function(p){
          ctx.font=fuente(p.b);
          ctx.fillStyle='#f5efe4';
          ctx.fillText(p.w,xq,yq);
          xq+=p.pw+esp;
        });
        yq+=size*1.35;
      });
      // arroba
      ctx.textAlign='center';
      ctx.font='400 30px Arial';
      ctx.fillStyle='rgba(255,255,255,0.45)';
      ctx.fillText('@legadodehierro',W/2,yq+8);
      break;}
    size-=4;
  }
  // firma de marca en dorado, italica, sobre la escena
  ctx.textAlign='right';
  ctx.font='italic 700 56px Georgia, serif';
  ctx.fillStyle=POST_ORO;
  ctx.shadowColor='rgba(0,0,0,0.8)';ctx.shadowBlur=10;
  ctx.fillText('Legado de Hierro',W-70,imgY+30);
  ctx.shadowBlur=0;
  ctx.textAlign='left';
}

// PLANTILLA 3 — LISTA de reglas (infografia, sin imagen de IA)
function composeLista(o,isVertical){
  var pc=postCanvas(isVertical),ctx=pc.x,W=pc.W,H=pc.H;
  // fondo oscuro con textura sutil
  ctx.fillStyle='#0a0e12';ctx.fillRect(0,0,W,H);
  var vg=ctx.createRadialGradient(W/2,H*0.4,100,W/2,H*0.5,H*0.85);
  vg.addColorStop(0,'rgba(30,40,45,0.35)');vg.addColorStop(1,'rgba(0,0,0,0.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  esquinasOro(ctx,W,H);
  // titulo: linea 1 blanca, linea 2 DORADA y mas grande
  ctx.textAlign='center';
  var t1=String(o.titulo1||'').toUpperCase(),t2=String(o.titulo2||'').toUpperCase();
  var s1=isVertical?58:52,s2=isVertical?86:76;
  ctx.font='900 '+s1+'px Arial Black, Arial';
  while(ctx.measureText(t1).width>W-260&&s1>34){s1-=3;ctx.font='900 '+s1+'px Arial Black, Arial';}
  ctx.font='900 '+s2+'px Arial Black, Arial';
  while(ctx.measureText(t2).width>W-160&&s2>44){s2-=3;ctx.font='900 '+s2+'px Arial Black, Arial';}
  var ty=isVertical?108:96;
  // adornos laterales del titulo
  ctx.strokeStyle=POST_ORO;ctx.lineWidth=3;
  ctx.font='900 '+s1+'px Arial Black, Arial';
  var t1w=ctx.measureText(t1).width;
  ctx.beginPath();ctx.moveTo(W/2-t1w/2-90,ty-s1*0.35);ctx.lineTo(W/2-t1w/2-20,ty-s1*0.35);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W/2+t1w/2+20,ty-s1*0.35);ctx.lineTo(W/2+t1w/2+90,ty-s1*0.35);ctx.stroke();
  ctx.fillStyle='#ffffff';
  ctx.fillText(t1,W/2,ty);
  ctx.font='900 '+s2+'px Arial Black, Arial';
  ctx.fillStyle=POST_ORO;
  ctx.fillText(t2,W/2,ty+s2*1.02);
  // items
  var reglas=(o.reglas||FB_LISTA.reglas).slice(0,isVertical?7:5);
  var topo=ty+s2*1.02+44;
  var brandY=H-52;
  var area=brandY-46-topo;
  var itemH=area/reglas.length;
  ctx.textAlign='left';
  reglas.forEach(function(rg,i){
    var cy=topo+i*itemH+itemH/2;
    // emoji-icono
    ctx.font=Math.round(Math.min(72,itemH*0.42))+'px Arial';
    ctx.textAlign='center';
    ctx.fillText(rg.e||'•',170,cy+18);
    // numero en circulo dorado
    ctx.beginPath();ctx.arc(300,cy-6,27,0,7);
    ctx.strokeStyle=POST_ORO;ctx.lineWidth=3;ctx.stroke();
    ctx.font='900 30px Arial Black, Arial';
    ctx.fillStyle=POST_ORO;
    ctx.fillText(String(i+1),300,cy+5);
    // titulo + descripcion
    ctx.textAlign='left';
    var tx=360;
    ctx.font='900 '+(isVertical?38:34)+'px Arial Black, Arial';
    ctx.fillStyle='#ffffff';
    ctx.fillText(String(rg.t||'').toUpperCase()+':',tx,cy-14);
    ctx.font='400 '+(isVertical?30:27)+'px Arial';
    ctx.fillStyle='rgba(255,255,255,0.82)';
    ctx.fillText(String(rg.d1||''),tx,cy+26);
    ctx.fillText(String(rg.d2||''),tx,cy+(isVertical?62:58));
    // separador
    if(i<reglas.length-1){
      ctx.strokeStyle='rgba(217,180,106,0.5)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(280,topo+(i+1)*itemH);ctx.lineTo(W-90,topo+(i+1)*itemH);ctx.stroke();
    }
  });
  marcaLdH(ctx,W,brandY);
}

// PLANTILLA 4 — COMPARACION (arriba lo correcto, abajo el error)
async function composeComparacion(o,imgAB64,imgBB64,isVertical){
  var pc=postCanvas(isVertical),ctx=pc.x,W=pc.W,H=pc.H;
  var imgA=await cargarImg(imgAB64),imgB=await cargarImg(imgBB64);
  ctx.fillStyle='#0b0d12';ctx.fillRect(0,0,W,H);
  esquinasOro(ctx,W,H);
  // titulo serif dorado de dos lineas
  ctx.textAlign='center';
  var ts=isVertical?64:56;
  ctx.font='700 '+ts+'px Georgia, serif';
  var t1=String(o.titulo1||''),t2=String(o.titulo2||'');
  while((ctx.measureText(t1).width>W-140||ctx.measureText(t2).width>W-140)&&ts>36){ts-=3;ctx.font='700 '+ts+'px Georgia, serif';}
  ctx.fillStyle=POST_ORO_CLARO;
  ctx.fillText(t1,W/2,isVertical?96:84);
  ctx.fillText(t2,W/2,(isVertical?96:84)+ts*1.12);
  var topY=(isVertical?96:84)+ts*1.12+34;
  var brandY=H-46;
  // dos paneles con sus leyendas
  var capH=isVertical?106:96; // espacio de leyenda por panel
  var libre=brandY-24-topY;
  var panelH=(libre-2*capH-26)/2;
  function panel(img,y,caption,sub){
    coverDraw(ctx,img,70,y,W-140,panelH);
    ctx.strokeStyle='rgba(217,180,106,0.4)';ctx.lineWidth=2;
    ctx.strokeRect(70,y,W-140,panelH);
    ctx.textAlign='center';
    ctx.font='700 '+(isVertical?48:42)+'px Georgia, serif';
    ctx.fillStyle=POST_ORO_CLARO;
    ctx.fillText(caption,W/2,y+panelH+(isVertical?52:46));
    ctx.font='400 '+(isVertical?29:26)+'px Georgia, serif';
    ctx.fillStyle='rgba(255,255,255,0.75)';
    ctx.fillText('('+sub+')',W/2,y+panelH+(isVertical?92:82));
  }
  panel(imgA,topY,String(o.a_caption||''),String(o.a_sub||''));
  // divisor
  var divY=topY+panelH+capH+2;
  ctx.strokeStyle='rgba(217,180,106,0.6)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(90,divY);ctx.lineTo(W-90,divY);ctx.stroke();
  panel(imgB,divY+24,String(o.b_caption||''),String(o.b_sub||''));
  marcaLdH(ctx,W,brandY);
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

// TENDENCIAS VIRALES (punto 5 del plan) — Gemini busca en Google, en vivo, que esta
// funcionando AHORA en reels de finanzas y motivacion en español, y resume patrones
// replicables. No usa lo que el modelo "recuerda": usa resultados actuales de internet.
var TREND_IDEAS=[]; // los 5 conceptos que salieron de la ultima investigacion
var TREND_TEXT='';  // el analisis en prosa de esa investigacion
var TREND_SOURCES=[]; // las fuentes que consulto Gemini

// Las tarjetas de la investigacion se repintan solas al cambiar de modo, porque
// no proponen lo mismo un reel que un video de YouTube: en los modos cortos
// puedes lanzar los 5 de golpe, y en los largos la investigacion es un MENU —
// varios temas de los que eliges UNO y sobre ese se hace el video.
function pintarTrends(){
  var box=document.getElementById('trendBox');
  if(!box||(!TREND_TEXT&&!TREND_IDEAS.length))return;
  var largo=esModoLargo();
  var html='<div style="white-space:pre-wrap;font-size:13px;line-height:1.7;color:var(--tx)">'+escHtml(TREND_TEXT)+'</div>';
  if(TREND_IDEAS.length){
    // Modos cortos: se sugiere un modo distinto por tarjeta para que el lote salga
    // variado. Modos largos: cada tarjeta hereda TU modo y TU duracion actuales,
    // porque solo vas a generar uno y ya elegiste arriba como lo quieres.
    var defModes=largo?TREND_IDEAS.map(function(){return sMode;})
      :shuffleArr(['reel','historia','impacto']).concat(shuffleArr(['reel','historia','impacto']).slice(0,2));
    var defDurs=largo?TREND_IDEAS.map(function(){return sD;}):shuffleArr(['30','60','60','30','60']);
    var opDur=dursDe(sMode);
    html+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">'
      +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--tx3);text-transform:uppercase;margin-bottom:8px">'
      +TREND_IDEAS.length+(largo?' temas posibles — elige UNO para el vídeo':' conceptos sacados de lo viral — elige modo y duración de cada uno')+'</div>';
    TREND_IDEAS.forEach(function(it,i){
      var th=THEMES.find(function(t){return t.id===it.t;});
      var dm=defModes[i],isImp=dm==='impacto';
      var dd=isImp?'30':defDurs[i];
      html+='<div style="background:#fff;border:1.5px solid var(--border);border-radius:8px;padding:8px 11px;margin-bottom:6px">'
        +'<span style="font-size:9px;font-weight:700;letter-spacing:.06em;color:'+(th?th.c:'#b8975a')+';text-transform:uppercase">'+(i+1)+' · '+(th?th.icon+' '+th.label:'')+'</span>'
        +'<div style="font-size:12px;font-weight:600;color:var(--tx);line-height:1.4;margin-top:3px">'+escHtml(it.concept)+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
        +'<label class="genLbl">Modo<select id="trendMode-'+i+'" class="genSel">'
        +(largo
          ?'<option value="profesor"'+(dm==='profesor'?' selected':'')+'>🎓 Profesor</option>'
           +'<option value="relato"'+(dm==='relato'?' selected':'')+'>🎞 Relato</option>'
          :'<option value="reel"'+(dm==='reel'?' selected':'')+'>🎬 Reel</option>'
           +'<option value="historia"'+(dm==='historia'?' selected':'')+'>📖 Historia</option>'
           +'<option value="impacto"'+(isImp?' selected':'')+'>⚡ Impacto (30s)</option>')
        +'</select></label>'
        +'<label class="genLbl">Duración<select id="trendDur-'+i+'" class="genSel"'+(isImp?' disabled':'')+'>'
        +opDur.map(function(d){
          return '<option value="'+d.id+'"'+(d.id===dd?' selected':'')+'>'+d.label+'</option>';
        }).join('')
        +'</select></label>'
        +'</div>'
        +'<button id="bTrendOne-'+i+'" style="width:100%;margin-top:8px;background:#fff;border:1.5px solid var(--gold);color:var(--gold);border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">⚔ '
        +(largo?'Hacer el vídeo sobre este tema':'Generar solo este')+'</button>'
        +'</div>';
    });
    // El lote de 5 SOLO en los modos cortos. Un video largo se sube uno o dos por
    // semana: cinco de golpe no tiene sentido ni por tiempo ni por coste.
    if(!largo){
      html+='<button id="bTrendBatch" style="width:100%;margin-top:6px;background:linear-gradient(135deg,var(--gold),var(--gold-l));color:#fff;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">⚔ Generar los 5 a la vez (lote)</button>'
        +'<div style="font-size:10px;color:var(--tx3);margin-top:6px">Cada tarjeta tiene su botón para generar solo ese reel; o usa el botón dorado para los 5 de una, uno tras otro (en orden).</div>';
    }else{
      html+='<div style="font-size:10px;color:var(--tx3);margin-top:6px">Estás en '+(MODE_LABELS[sMode]||sMode)+': la investigación te propone temas y tú eliges uno. Se genera un solo vídeo.</div>';
    }
    html+='</div>';
  }else{
    html+='<div style="margin-top:10px;font-size:11px;color:var(--tx3)">La investigación no trajo conceptos en formato usable esta vez. Vuelve a intentar con 🔎.</div>';
  }
  if(TREND_SOURCES.length){
    html+='<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--tx3);text-transform:uppercase;margin-bottom:6px">Fuentes consultadas</div>';
    TREND_SOURCES.slice(0,8).forEach(function(s2){
      html+='<a href="'+escHtml(s2.uri||'#')+'" target="_blank" rel="noopener" style="display:block;font-size:11px;color:#7a9ec4;text-decoration:none;margin-bottom:3px">• '+escHtml(s2.title||s2.uri||'fuente')+'</a>';
    });
    html+='</div>';
  }
  box.innerHTML=html;box.style.display='block';
  // Impacto fuerza la duracion a 30s y bloquea el selector de duracion.
  TREND_IDEAS.forEach(function(it,i){
    var ms=document.getElementById('trendMode-'+i);
    var ds=document.getElementById('trendDur-'+i);
    if(ms&&ds)ms.addEventListener('change',function(){
      if(ms.value==='impacto'){ds.value='30';ds.disabled=true;}
      else{ds.disabled=false;}
    });
    var b1=document.getElementById('bTrendOne-'+i);
    if(b1)b1.addEventListener('click',function(){genTrendOne(i);});
  });
  var bb=document.getElementById('bTrendBatch');
  if(bb)bb.addEventListener('click',function(){
    if(!TREND_IDEAS.length)return;
    // El lote respeta el modo y la duracion elegidos para CADA concepto.
    var jobs=TREND_IDEAS.map(function(it,i){
      var ms=document.getElementById('trendMode-'+i);
      var ds=document.getElementById('trendDur-'+i);
      var mode=ms?ms.value:'reel';
      return {topic:it.concept,t:it.t,h:it.h,mode:mode,d:mode==='impacto'?'30':(ds?ds.value:'60')};
    });
    generateBatch(jobs);
  });
}

// Generar UN SOLO reel de un concepto de la investigacion (boton chiquito de su
// tarjeta), respetando el modo y la duracion elegidos para ESE concepto.
async function genTrendOne(i){
  if(loading||batchLoading)return;
  var it=TREND_IDEAS[i];if(!it)return;
  var ms=document.getElementById('trendMode-'+i);
  var ds=document.getElementById('trendDur-'+i);
  var mode=ms?ms.value:'reel';
  var d=mode==='impacto'?'30':(ds?ds.value:'60');
  var btn=document.getElementById('bTrendOne-'+i);
  var orig=btn?btn.innerHTML:'';
  loading=true;updGBtn();hideErr();
  if(btn){btn.disabled=true;btn.innerHTML='<span class="spin" style="border-color:rgba(184,151,90,.3);border-top-color:#b8975a"></span> Forjando...';}
  try{
    applySelection(mode,it.t,d,it.h);
    document.getElementById('conc').value=it.concept;updCC();updGBtn();
    var built=buildEpisodeMsg(it.concept,it.t,it.h,mode,d);
    var p=await fetchEpisode(built.msg,mode,built.dO);
    lastRes=Object.assign({},p,{topic:it.concept,tO:built.tO,dO:built.dO,hO:built.hO,sem:built.sem,modo:mode,uid:nextUid()});
    genCount++;cost+=0.015;updCost();
    resetReelAssets();
    saveHistory(lastRes);
    renderOut(lastRes);
  }catch(e){
    showErr(e.message||'Error de conexion.');
  }finally{
    loading=false;updGBtn();
    if(btn){btn.disabled=false;btn.innerHTML=orig;}
  }
}

async function genTrends(){
  var btn=document.getElementById('bTrends');
  var st=document.getElementById('trendSt');
  var er=document.getElementById('trendErr');
  var orig=btn.textContent;
  btn.textContent='Investigando...';btn.disabled=true;btn.style.opacity='.6';
  st.style.display='block';st.textContent='Buscando en Google qué está funcionando ahora en el nicho... (30-60 segundos)';
  er.style.display='none';
  try{
    // Se le mandan los conceptos recientes (historial + la busqueda anterior) para que
    // NO repita: cada investigacion trae temas nuevos, no siempre los mismos cinco.
    var avoid=[];
    try{
      getHistory().forEach(function(x){if(x&&x.topic)avoid.push(x.topic);});
      TREND_IDEAS.forEach(function(x){if(x&&x.concept)avoid.push(x.concept);});
    }catch(e){}
    avoid=avoid.slice(0,20);
    var r=await fetch('/api/trends',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({avoid:avoid})});
    var d=await r.json().catch(function(){return{};});
    if(!r.ok||!d.text)throw new Error(d.error||'Error '+r.status);
    // Los conceptos vienen al final en lineas pilar|gancho|concepto: se separan
    // del analisis y se convierten en el lote de 5 con un solo boton.
    TREND_IDEAS=parseSuggestions(d.text).slice(0,5);
    TREND_TEXT=d.text.replace(/CONCEPTOS PARA GENERAR[\s\S]*$/i,'').trim();
    TREND_SOURCES=(d.sources||[]).slice();
    pintarTrends();
    st.style.display='none';
    cost+=0.02;updCost();
  }catch(e){
    st.style.display='none';
    er.textContent='Error: '+(e.message||'Error de conexión');er.style.display='block';
  }finally{
    btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';
  }
}

// INIT
document.addEventListener('DOMContentLoaded',function(){
  buildAll();
  wireGenSettings();
  document.getElementById('conc').addEventListener('input',function(){updCC();updGBtn();});
  document.getElementById('gbtn').addEventListener('click',generate);
  var b5=document.getElementById('gbtn5');
  if(b5)b5.addEventListener('click',function(){generateBatch();});
  var hb=document.getElementById('histBtn');
  if(hb)hb.addEventListener('click',function(){
    var o=document.getElementById('histPanel').classList.toggle('on');
    document.getElementById('ha').textContent=o?'▲':'▼';
  });
  buildHistory();
  wireUnifyLang();
  comprobarCloudRun();
  // La biblia se carga al entrar: el director la necesita ya en el primer guion.
  cargarBiblia();
  var bb=document.getElementById('bibliaBtn');
  if(bb)bb.addEventListener('click',function(){
    var o=document.getElementById('bibliaPanel').classList.toggle('on');
    document.getElementById('ba').textContent=o?'▲':'▼';
  });
  var bt2=document.getElementById('bBibliaTodas');
  if(bt2)bt2.addEventListener('click',function(){
    // El mismo boton para arrancar y para parar: mientras corre dice "Parar".
    if(bt2.dataset.parando==='1'){
      BIBLIA_PARAR=true;
      var st2=document.getElementById('bibliaSt');
      if(st2)st2.textContent='Parando al terminar la vista en curso...';
      return;
    }
    generarVistasFaltantes();
  });
  var br2=document.getElementById('bBibliaRecargar');
  if(br2)br2.addEventListener('click',function(){cargarBiblia();});
  var bt=document.getElementById('bthumb');
  if(bt)bt.addEventListener('click',genThumb);
  var bu=document.getElementById('bunify');
  if(bu)bu.addEventListener('click',unifyVideo);
  var bmu=document.getElementById('bMusicUp');
  if(bmu)bmu.addEventListener('click',uploadMusic);
  var bmg=document.getElementById('bMusicGen');
  if(bmg)bmg.addEventListener('click',function(){genMusic();});
  Array.prototype.forEach.call(document.querySelectorAll('.musicPre'),function(pb){
    pb.addEventListener('click',function(){genMusic(pb.getAttribute('data-p'));});
  });
  Array.prototype.forEach.call(document.querySelectorAll('.postTpl'),function(tb){
    tb.addEventListener('click',function(){selPostTpl(tb.getAttribute('data-t'));});
  });
  selPostTpl(postTpl); // resaltar la plantilla inicial
  var pcr=document.getElementById('bPostCapRegen');
  if(pcr)pcr.addEventListener('click',genPostCaption);
  var pcc=document.getElementById('bPostCapCopy');
  if(pcc)pcc.addEventListener('click',function(){
    if(lastPostCaption||lastPostTags){
      navigator.clipboard.writeText((lastPostCaption?lastPostCaption+'\n\n':'')+(lastPostTags||''));
      var o=pcc.textContent;pcc.textContent='Copiado ✓';setTimeout(function(){pcc.textContent=o;},1500);
    }
  });
  var msel=document.getElementById('musicSel');
  if(msel)msel.addEventListener('change',function(){
    try{localStorage.setItem('lh_music_sel',msel.value);}catch(e){}
    stopMix(); // al cambiar de pista se corta la anterior
  });
  var bmp=document.getElementById('bMusicPlay');
  if(bmp)bmp.addEventListener('click',function(){toggleMixPreview();});
  var mv=document.getElementById('mVol');
  if(mv){
    try{var sv=localStorage.getItem('lh_music_vol');if(sv!==null&&sv!=='')mv.value=sv;}catch(e){}
    var mvv=document.getElementById('mVolV');
    if(mvv)mvv.textContent=mv.value+'%';
    mv.addEventListener('input',function(){
      if(mvv)mvv.textContent=mv.value+'%';
      try{localStorage.setItem('lh_music_vol',mv.value);}catch(e){}
      // Graduacion EN VIVO: si la mezcla esta sonando, el cambio se oye al instante
      if(MIX.gain)MIX.gain.gain.value=parseInt(mv.value,10)/100;
    });
  }
  var btr=document.getElementById('bTrends');
  if(btr)btr.addEventListener('click',genTrends);
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
  // Y al reves: si se le da play a un reproductor de narracion, se corta la
  // mezcla. Asi nunca puede sonar la misma voz por dos sitios a la vez.
  ['pES','pEN'].forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('play',function(){
      if(typeof MIX!=='undefined'&&MIX.playing)stopMix();
      // y el otro reproductor tampoco sigue sonando
      var otro=document.getElementById(id==='pES'?'pEN':'pES');
      if(otro&&!otro.paused){try{otro.pause();}catch(e){}}
    });
  });
  // Subir la narracion hecha por fuera (ElevenLabs web u otro), sin gastar API.
  ['ES','EN'].forEach(function(L){
    var inp=document.getElementById('upAud'+L);
    if(inp)inp.addEventListener('change',function(){
      var f=inp.files&&inp.files[0];
      if(f)subirAudio(f,L==='EN');
      inp.value=''; // permite volver a subir el MISMO archivo si hace falta
    });
    var cp=document.getElementById('bCopy'+L);
    if(cp)cp.addEventListener('click',function(){
      var txt=L==='EN'?(lastRes&&lastRes.f):(lastRes&&lastRes.a);
      if(!txt){alert('Genera un episodio primero.');return;}
      navigator.clipboard.writeText(txt);
      var o=cp.textContent;cp.textContent='Copiado ✓';setTimeout(function(){cp.textContent=o;},1500);
    });
  });
  document.getElementById('expbtn').addEventListener('click',exportAll);
  document.getElementById('lp').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
  // Restaurar sesion: basta con haber iniciado antes. Si el candado (APP_KEY) esta
  // activo y la llave guardada ya no sirve, la primera llamada al API devuelve 401
  // y el interceptor manda de vuelta al login. Asi no dependemos del usuario local.
  var sess=localStorage.getItem('lh_sess');
  if(sess){
    ANT=HARDCODED_ANT;EL=HARDCODED_EL;VOICE=HARDCODED_VOICE;NB=HARDCODED_NB;
    showApp();
    // Al restaurar la sesion no pasamos por doLogin, asi que hay que preguntarle
    // al servidor si el candado sigue abierto. Si lo esta, sale la barra roja.
    fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'}})
      .then(function(r){return r.json().catch(function(){return{};});})
      .then(function(d){ CANDADO_ABIERTO=d&&d.open===true; avisoCandado(); })
      .catch(function(){});
  }else{
    document.getElementById('pg-login').classList.add('on');
  }
});
