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

function getRandomSuggestions(){
  var pool=SCHED_POOL.slice();
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=pool[i];pool[i]=pool[j];pool[j]=tmp;}
  return pool.slice(0,7);
}
var SCHED_CURRENT=getRandomSuggestions();



function buildSP(mode){
  mode=mode||sMode;
  if(mode==='impacto')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que lleva años trabajando para otro y siente que la vida se le está yendo. Cansado, atrapado, con la sospecha de que va a llegar a viejo sin nada suyo. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es empezar.

NORTE: el canal empuja a UNA sola cosa — que deje de esperar y construya lo suyo. Libertad financiera, legado, disciplina, no rendirse, dejar de cambiar su vida por un sueldo, montar su propio negocio. Tu trabajo es encender la decisión, no dar recetas.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA QUEDARSE: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. El espectador ya sabe qué quiere montar; lo que le falta es arrancar. Habla de construir LO TUYO, en general, nunca en particular. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

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
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

BLOQUE A
[Guion hablado en español. Máximo 75 palabras. Termina con: Legado de Hierro.]

BLOQUE C
[3 prompts. Cada uno: UNA acción concreta + entorno específico + ángulo de cámara + luz. Sin describir al personaje — solo qué hace y dónde. Entorno diferente en cada prompt.]
PROMPT 1: [acción + entorno + ángulo + luz]
PROMPT 2: [acción + entorno diferente + ángulo + luz]
PROMPT 3: [acción + entorno diferente + ángulo + luz]

BLOQUE F
[Traducción natural al inglés. Sin calcos. Termina con: Iron Legacy.]`;

  if(mode==='historia')return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que lleva años trabajando para otro y siente que la vida se le está yendo. Cansado, atrapado, con la sospecha de que va a llegar a viejo sin nada suyo. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es empezar.

NORTE: el canal empuja a UNA sola cosa — que deje de esperar y construya lo suyo. Libertad financiera, legado, disciplina, no rendirse, dejar de cambiar su vida por un sueldo, montar su propio negocio. Tu trabajo es encender la decisión, no dar recetas.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA QUEDARSE: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. El espectador ya sabe qué quiere montar; lo que le falta es arrancar. Habla de construir LO TUYO, en general, nunca en particular. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

EL PILAR MANDA: el guion trata de lo que dice el PILAR que te dan, y de nada más.
- LIBERTAD FINANCIERA: el tiempo contra el dinero, la trampa del sueldo, lo que cuesta seguir esperando, la independencia real.
- MENTALIDAD Y DISCIPLINA: la cabeza del que construye. Decisiones duras, hábitos, ejecución cuando nadie mira, la disciplina que queda cuando la motivación se va.
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

MODO HISTORIA — el arco del que se levanta:
El camino de alguien que estaba abajo y decidió construir lo suyo: el punto en que se hartó, la decisión, lo que costó sostenerla, y a dónde llegó. No el éxito final ni el millonario: el hombre que dejó de esperar y hoy tiene algo propio. Cuéntalo en segunda persona (tú) o desde la lección, jamás inventando un personaje con nombre.
Esto es el esqueleto, NO una plantilla: entra por donde quieras, dale la vuelta al orden, sorprende.

NUNCA UN PERSONAJE INVENTADO: nada de "Marcos", "Carlos", "Pedro" ni la fórmula "[Nombre] vivía en un barrio... un día entendió...". Nada de biografías ficticias.

VARIEDAD (obligatoria): cada guion debe sentirse distinto al anterior — otra entrada, otras imágenes, otra forma de armar las frases. Tienes libertad total dentro de estas reglas: úsala. Si lo que escribes suena a algo que ya se ha visto mil veces, cámbialo.

PROHIBIDO: "el secreto mejor guardado" en cualquier variante. Porcentajes genéricos. Calcos del inglés. Repetir la misma frase de cierre de otro guion.
CIERRE: duro y con fuego, cerrando el círculo con la primera frase. Sin promesas falsas ni consuelo barato, pero la última línea debe ENCENDER, no enfriar. Termina con: Legado de Hierro.
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

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
PROMPT 8: [acción + entorno diferente + ángulo + luz]

BLOQUE F
[Traducción natural al inglés. Sin calcos. Termina con: Iron Legacy.]`;

  return `CANAL: LEGADO DE HIERRO — Facebook Reels. Forja personas libres a través de la autosuficiencia y la riqueza real.

VOZ: cruda, directa, segunda persona, con carga emocional real. Sin motivación de cartel ni frases de coach — pero nunca fría ni tiesa: tiene que golpear donde duele. Sin porcentajes genéricos ("el 90% de la gente"). Sin calcos del inglés. Español natural e impecable: cuida la concordancia de número y género, que un plural donde va singular arruina el audio.

A QUIÉN LE HABLAS: a un hombre que lleva años trabajando para otro y siente que la vida se le está yendo. Cansado, atrapado, con la sospecha de que va a llegar a viejo sin nada suyo. No es tonto ni le falta información: sabe lo que tiene que hacer. Lo que le falta es empezar.

NORTE: el canal empuja a UNA sola cosa — que deje de esperar y construya lo suyo. Libertad financiera, legado, disciplina, no rendirse, dejar de cambiar su vida por un sueldo, montar su propio negocio. Tu trabajo es encender la decisión, no dar recetas.

RETENCIÓN — LO QUE DECIDE TODO: en Reels, lo que el espectador aguanta en los primeros 3 segundos decide si el video se reparte a miles o se muere en doscientas vistas. Un video que retiene al 80% en el segundo 3 le gana a uno que retiene al 60% en el segundo 30. Todo lo demás va después de esto.
- EL GANCHO ES UNA BALA: primera frase, máximo 12 palabras. Sin calentamiento, sin contexto, sin presentación, sin "hoy te voy a hablar de". Empiezas en el punto más alto.
- UNA SOLA IDEA: el guion desarrolla UNA idea, no tres. El espectador tiene que poder contarle el video a otro en una frase. Si no puede, no lo comparte — y compartir es lo que lo hace estallar.
- LA PÉRDIDA PESA MÁS QUE LA GANANCIA: el ser humano evita perder mucho más de lo que persigue ganar. Decirle que está cometiendo un error lo congela en seco; prometerle un beneficio lo deja indiferente. Habla de lo que está perdiendo ahora mismo.
- EL CIERRE ENGANCHA CON EL INICIO: la última frase tiene que conectar con la primera y cerrar el círculo. Un video que se siente redondo se vuelve a ver, y la repetición es lo que lo dispara.

FUERZA EMOCIONAL: el guion tiene que MOVER, no solo informar. Si no siente nada, se va. La emoción NO sale de frases de coach: sale de la PRECISIÓN. Un detalle exacto de su vida golpea; una abstracción rebota. Mientras más específico, más duele.
- RECONOCIMIENTO: que piense "ese soy yo". Un detalle concreto de su día real, no una generalidad.
- LA HERIDA: lo que no dice en voz alta. Su miedo verdadero, el que no admite ni dentro de su propia cabeza.
- LO QUE CUESTA QUEDARSE: no es dinero. Es tiempo y dignidad. La vida que no vuelve.
- EL FUEGO: que termine con ganas de levantarse y hacer algo hoy.
LOS DETALLES LOS ELIGES TÚ, y ahí está tu trabajo de verdad: NO uses el primero que se te ocurra, porque ese es el que usaría cualquiera. JAMÁS repitas el mismo detalle de un guion a otro: si ya usaste una imagen concreta, esa queda quemada. Búscate una nueva cada vez.
La crudeza y la emoción no pelean: la frase más dura es la que más mueve.

PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto", "el negocio de aquello", "vende tal cosa", ni explicar cómo montar algo paso a paso. El espectador ya sabe qué quiere montar; lo que le falta es arrancar. Habla de construir LO TUYO, en general, nunca en particular. Un negocio nombrado le habla a diez personas y el resto pasa el video; el mensaje general le habla a todos.

EL PILAR MANDA: el guion trata de lo que dice el PILAR que te dan, y de nada más.
- LIBERTAD FINANCIERA: el tiempo contra el dinero, la trampa del sueldo, lo que cuesta seguir esperando, la independencia real.
- MENTALIDAD Y DISCIPLINA: la cabeza del que construye. Decisiones duras, hábitos, ejecución cuando nadie mira, la disciplina que queda cuando la motivación se va.
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
FORMATO: texto plano, sin **, sin ##, sin corchetes en el BLOQUE A.

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
var CHAR_STYLE_ANCHOR='Recurring signature character: the SAME man in every image, his face IDENTICAL to the reference images -- a 35-year-old man, short black hair slicked back, short well-groomed dark beard, strong jawline, intense dark eyes, serious expression. Keep his face, hair and beard consistent across all images. Wardrobe and setting follow the scene described below (do not force a suit if the scene is humble). Cinematic American 2D comic-book illustration: bold clean ink outlines, dramatic cel-shading, rich cinematic lighting with depth, graphic-novel aesthetic. IMPORTANT: this describes the DRAWING STYLE only. Each image is ONE single scene that fills the entire frame as one continuous illustration. NEVER a multi-panel comic page, NEVER split into panels, boxes, vignettes, a grid or a collage, NO dividing lines or internal borders. STRICTLY NOT photorealistic, not a photograph, not a 3D render, not CGI. No text, no letters, no captions, no watermark anywhere in the image. ';
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

function buildSuggestPrompt(){
  var pilares=THEMES.map(function(t){return t.id;}).join(', ');
  return 'Eres el estratega de contenido de LEGADO DE HIERRO, canal de Facebook Reels en español. Le hablas a un hombre que lleva años trabajando para otro y siente que la vida se le está yendo: cansado, atrapado, con la sospecha de que va a llegar a viejo sin nada suyo.\n\n'
    +'NORTE: el canal empuja a UNA sola cosa — que deje de esperar y construya lo suyo. Libertad financiera, legado, disciplina, no rendirse, dejar de cambiar su vida por un sueldo, montar su propio negocio.\n\n'
    +'PROHIBIDO — NEGOCIOS ESPECÍFICOS: jamás menciones un tipo de negocio concreto ni propongas un modelo. Nada de "monta una agencia de esto" ni "el negocio de aquello". Un negocio nombrado le habla a diez personas; el mensaje general le habla a todos. Habla en general, nunca en particular.\n\n'
    +'VOZ: cruda, directa, que incomode y que mueva. Sin motivación de cartel ni frases de coach, pero nunca fría: la emoción sale de la PRECISIÓN — un detalle exacto de su vida golpea, una abstracción rebota. Los detalles los eliges tú y deben ser distintos en cada concepto; no repitas la misma imagen dos veces.\n\n'
    +'Genera EXACTAMENTE 7 conceptos NUEVOS y variados para reels. Cada uno es una idea potente de máximo 15 palabras que haga que alguien se detenga. Sorpréndeme: nada de ideas típicas vistas mil veces. Usa pilares variados (máximo 2 por pilar). Español impecable, con mayúsculas y tildes.\n\n'
    +'PILARES válidos: '+pilares+'\nGANCHOS válidos: dato, pregunta, afirmacion, historia, pasos\n\n'
    +'FORMATO EXACTO — devuelve SOLO 7 líneas, sin numeración, sin texto extra, cada línea así:\npilar|gancho|concepto\n\nVariación aleatoria: '+Math.random().toString(36).slice(2,8);
}

function parseSuggestions(txt){
  var validT={},validH={dato:1,pregunta:1,afirmacion:1,historia:1,pasos:1};
  THEMES.forEach(function(t){validT[t.id]=1;});
  var out=[];
  (txt||'').replace(/\r/g,'').split('\n').forEach(function(ln){
    var p=ln.split('|');
    if(p.length<3)return;
    var norm=function(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');};
    var t=norm(p[0]),h=norm(p[1]),c=p.slice(2).join('|').trim();
    c=c.replace(/^[-–—\d.\s"']+/,'').replace(/["']+$/,'').trim();
    if(validT[t]&&validH[h]&&c.length>8&&c.length<200)out.push({t:t,concept:c,h:h});
  });
  return out;
}

var schedLoading=false;
async function refreshSched(){
  if(schedLoading)return;
  var sg=document.getElementById('schedGrid');
  if(!sg)return;
  schedLoading=true;
  sg.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:18px;color:var(--tx3);font-size:12px"><span class="spin"></span> Generando ideas nuevas con IA...</div>';
  try{
    var r=await fetch('/api/generate',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:buildSuggestPrompt()}),
    });
    var d=await r.json();
    if(!r.ok||!d.text)throw new Error(d.error||'sin texto');
    var parsed=parseSuggestions(d.text);
    if(parsed.length<4)throw new Error('respuesta invalida');
    SCHED_CURRENT=parsed.slice(0,7);
  }catch(e){
    // Fallback: pool local si la IA falla, para que el boton nunca quede muerto.
    SCHED_CURRENT=getRandomSuggestions();
  }
  sg.innerHTML='';
  buildSched();
  schedLoading=false;
}

function buildSched(){
  var sg=document.getElementById('schedGrid');
  if(!sg)return; // la seccion de sugerencias ya no existe: la reemplazo la investigacion de tendencias
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
  var b5=document.getElementById('gbtn5');
  if(b5){b5.disabled=loading;b5.style.opacity=loading?'.55':'1';b5.style.cursor=loading?'not-allowed':'pointer';}
}
function updCost(){document.getElementById('gcost').textContent='$'+cost.toFixed(3)+' estimado · '+genCount+' generaciones';}

// GENERATE
// Construye el mensaje completo de un episodio para /api/generate.
// Parametrizado por concepto/pilar/gancho/modo/duracion para que el lote de 5
// pueda variar TODO entre guiones (la generacion individual usa lo seleccionado).
function buildEpisodeMsg(topic,tId,hId,mode,dId){
  mode=mode||sMode;dId=dId||sD;
  var tO=THEMES.find(function(t){return t.id===tId;});
  var hO=HOOKS.find(function(h){return h.id===hId;});
  var dO=DURS.find(function(d){return d.id===dId;});
  var hi={dato:'Empieza con dato/cifra impactante.',pregunta:'Empieza con pregunta disruptiva.',afirmacion:'Empieza con verdad incomoda directa.',historia:'Empieza en primera persona con experiencia cruda.',pasos:'Desarrolla con Primero, Segundo, Tercero.'};
  var identidadBase='PERSONAJE FIJO — el MISMO hombre en TODAS las imagenes, rostro identico a las imagenes de referencia: hombre de 35 anos, cabello negro corto peinado hacia atras, barba corta oscura bien cuidada, mandibula marcada, ojos oscuros intensos, mirada seria. Su ROSTRO, cabello y barba son identicos en cada imagen; es el personaje principal de la marca y no puede cambiar. El vestuario y el entorno SI cambian segun la escena (traje oscuro de tres piezas en escenas de poder; camiseta simple en escenas humildes). ESTILO OBLIGATORIO: ilustracion estilo comic americano 2D cinematografico, lineas de tinta limpias y marcadas, cel-shading dramatico, iluminacion cinematografica con profundidad, estetica de novela grafica, sin texto en la imagen. NUNCA fotorrealista, NUNCA una foto, NUNCA render 3D ni CGI. PROHIBIDO EN TODA IMAGEN: lluvia, cualquier clima (nieve, tormenta, gotas de agua), cielos lluviosos, superficies mojadas, charcos -- NUNCA, ni dentro ni fuera del edificio; el clima es fuente de errores graves al animar. Tampoco robots, futurismo, sci-fi, cadenas rotas, magia ni fantasia. Solo el mundo real de negocios y finanzas; para dramatismo usa luces de ciudad, contraste y sombras, jamas clima. ESCENAS LIMPIAS: incluye solo los objetos que la accion necesita; evita objetos sueltos irrelevantes (tazas de cafe, vasos, adornos) que no formen parte de la accion, porque al animar se deforman o se transforman en otra cosa. MIRADA (obligatorio): el personaje mira lo que exige la accion (lo que hace con las manos, la persona con quien trata, el lugar que supervisa, el horizonte de la ciudad), NO a la camara y sin pose de modelo, salvo que el prompt diga explicitamente que habla directo a camara. ';
  var sceneDir;
  if(mode==='historia'){
    sceneDir='DIRECCION VISUAL — MODO HISTORIA (arco de emprendimiento, de cero a negocio solido): cada prompt es UNA sola imagen, un unico plano que llena todo el cuadro — NUNCA vinetas, cuadros ni collage. Las imagenes van EN SECUENCIA e ILUSTRAN en orden la parte del guion que a cada una le toca, y JUNTAS cuentan una historia visual de SUPERACION que AVANZA imagen a imagen: no son la misma escena repetida con otro fondo y otra ropa. '
      +'EL ARCO (repartelo segun el orden de las imagenes): las PRIMERAS imagenes = el arranque humilde y duro — el protagonista trabajando con sus propias manos en un espacio modesto y pequeno, con lo minimo, haciendo el trabajo pesado el solo (cargando, montando, acomodando, madrugando, atendiendo al primer cliente). Las IMAGENES DEL MEDIO = empieza a levantar — cerrar el primer trato con un apreton de manos, contar las primeras ganancias en efectivo, ensenar o sumar al primer ayudante, mudarse a un local un poco mas grande, mas movimiento y clientes. Las ULTIMAS imagenes = el negocio ya SOLIDO y rentable — un equipo pequeno trabajando, un espacio mas amplio y cuidado, el protagonista dirigiendo y supervisando con calma, el resultado logrado (solido, NO millonario ostentoso). '
      +'SIN NOMBRAR UN NEGOCIO CONCRETO: muestra emprendimiento GENERAL (un taller, un local, un puesto, una bodega, una oficina sencilla — puedes variar el tipo), lo que importa es que se vea la PROGRESION de esfuerzo a logro, no la industria. Deriva cada escena del CONTENIDO de su parte del guion; NO uses una lista fija de escenas. ';
  }else if(mode==='impacto'){
    sceneDir='DIRECCION VISUAL — MODO IMPACTO (imagenes para VOLVERSE VIRALES): 3 imagenes de altisimo impacto visual, cada una un golpe distinto ligado a un momento del mensaje de ESTE guion. Composicion audaz y cinematografica, alto contraste, mucha fuerza emocional — del tipo de imagen que detiene el scroll y da ganas de compartir. Puedes usar al protagonista exitoso en un momento poderoso, o un contraste simbolico que refuerce el mensaje (por ejemplo el que sigue atrapado frente al que se solto), SIEMPRE fiel a lo que se esta diciendo. Entornos completamente diferentes entre si, potentes. Deriva las escenas del guion; NO uses una lista fija de escenas. ';
  }else{
    sceneDir='DIRECCION VISUAL — MODO REEL (el protagonista YA TIENE su empresa y la esta ESCALANDO): nunca desde abajo, nunca pobre, nunca haciendo el trabajo pesado el solo — ya es un empresario exitoso que hace CRECER lo que ya construyo, con poder tranquilo y estetica de cine. Cada imagen ILUSTRA lo que la narracion dice en ese momento del guion, siguiendo su ritmo de principio a fin, y muestra al empresario en la accion concreta de esa parte: dirigiendo una reunion con su equipo, supervisando una operacion en marcha desde lo alto, cerrando un trato grande con un apreton de manos firme, guiando o instruyendo a su gente, llegando o saliendo en un auto de gama alta, de pie en una azotea o ventanal dominando la ciudad, expandiendose a un nuevo local, viajando por negocios. Entornos VARIADOS y coherentes con lo que se dice; NUNCA siempre la misma oficina ni siempre en un escritorio. Deriva cada escena del CONTENIDO de su parte del guion; NO uses una lista fija de escenas. ';
  }
  // Regla de variedad compartida por los tres modos: es lo que rompe la repeticion
  // de "papeles en un escritorio" y obliga a acciones fisicas distintas por imagen.
  sceneDir+='VARIEDAD DE ACCION (obligatorio, es lo mas importante): cada imagen debe mostrar una ACCION FISICA CONCRETA Y DISTINTA — PROHIBIDO que dos imagenes muestren la misma accion. NO uses "revisar papeles" ni "firmar un documento en un escritorio" como accion por defecto: a lo sumo UNA sola imagen de todo el conjunto puede tener papeles o pantalla; TODAS las demas son acciones distintas (trabajar con las manos o herramientas, cargar o mover cosas, saludar o cerrar un trato con alguien, contar dinero, dirigir a un equipo, caminar por el lugar, supervisar desde lo alto, hablar directo a camara). Si el guion no exige papeles, que NO aparezca ni un papel. Piensa cada imagen como un fotograma distinto de una escena en movimiento, no como un retrato del personaje posando. ';
  // Regla clave: el guion habla en METAFORAS. Sin esto, el modelo dibuja las
  // palabras al pie de la letra (fuego real por "apagar incendios", engranajes de
  // reloj por "engranajes") en vez del significado. No es una lista negra: es una
  // instruccion de RAZONAMIENTO que se aplica a cualquier figura del guion.
  sceneDir+='INTERPRETACION DEL SENTIDO, NUNCA LITERAL (obligatorio, hazlo ANTES de escribir cada prompt): el guion esta lleno de lenguaje FIGURADO, metaforas y frases hechas. Tu trabajo NO es dibujar las palabras, es dibujar lo que esas palabras SIGNIFICAN en el mundo real de los negocios. Ante cualquier expresion figurada, primero razona "que quiere decir esto de verdad para un empresario" y describe UNA escena concreta y creible de ese significado; jamas el objeto literal de la metafora. Ejemplos del TIPO de razonamiento que debes aplicar (NO es una lista cerrada, es la logica para TODA metafora que aparezca): "apagar incendios" NO es fuego ni bomberos, es resolver crisis y urgencias del negocio con calma -> el empresario resolviendo un problema con su equipo o gestionando una urgencia. "engranajes", "maquinaria", "que la maquina funcione sola" NO son piezas mecanicas ni relojeria, son los SISTEMAS, procesos y automatizacion que hacen que el negocio opere sin depender de el -> una operacion organizada fluyendo, el equipo trabajando coordinado, el empresario supervisando el flujo sin tener que hacerlo todo. "sembrar y cosechar" -> invertir esfuerzo o dinero hoy y recoger resultados despues, con acciones reales de negocio. "el timon", "el motor", "construir puentes", "escalar la montana", "la batalla", "romper cadenas", "no morir en la orilla" -> traduce SIEMPRE el significado a una escena real de empresa, trabajo o finanzas, nunca el objeto de la metafora. REGLA FIRME: si un elemento de la escena solo tendria sentido como la metafora tomada literal (fuego, engranajes de reloj, cadenas, semillas en la tierra, un barco, una montana, espadas o armas, una guerra), esta MAL: reemplazalo por la accion de negocios que representa. Cada imagen debe poder entenderse como un momento real y cotidiano del mundo empresarial, no como el dibujo de un refran. ';
  var identidad=identidadBase+sceneDir;
  var numPrompts=(mode==='impacto'||dId==='30')?3:dId==='90'?8:5;
  var maxPalabras=(mode==='impacto'||dId==='30')?75:dId==='90'?225:150;
  // Sincronizacion guion-imagen: en historia y reel, cada imagen ilustra su parte del guion.
  // En impacto no aplica (son 3 golpes visuales independientes).
  var syncRule=(mode!=='impacto')
    ? 'SINCRONIZACION GUION-IMAGEN (obligatorio en este modo): divide el BLOQUE A en EXACTAMENTE '+numPrompts+' partes consecutivas de peso similar, en el mismo orden en que se narra. El PROMPT k del BLOQUE C debe ILUSTRAR lo que se dice en la parte k del guion: el PROMPT 1 corresponde al inicio del guion, el PROMPT '+numPrompts+' al cierre, y los del medio en orden. Las imagenes van al ritmo de la narracion, como los fotogramas de lo que se esta diciendo; ninguna imagen puede ser una escena suelta ajena a su parte del guion.\n\n'
    : '';
  // Variedad mecánica: el código asigna el tipo de modelo al azar (el modelo de IA no elige).
  // Se omite en impacto (muy corto), herramientas (el modelo es la guía del enlace) e inversión (el pilar ya define: activos).
  var seedRule='';
  if(mode!=='impacto'&&tId==='herramientas'){
    var ang=HERRAM_ANGLES[Math.floor(Math.random()*HERRAM_ANGLES.length)];
    seedRule='ÁNGULO ASIGNADO PARA ESTE GUION (variedad obligatoria): '+ang+' Desarrolla ESE contenido con sustancia real; SOLO el cierre dirige al enlace del video, con una invitación distinta cada vez. PROHIBIDO repetir la fórmula de siempre.\n\n';
  }
  var msg=buildSP(mode)+'\n\n---\n\nGenera un episodio COMPLETO:\nPILAR: '+(tO?tO.label+' - '+tO.desc:'Independencia Financiera')+'\nDURACION: '+(dO?dO.label:'60 segundos')+'\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' - '+(hi[hId]||hi.dato)+'\nCONCEPTO: '+topic+'\n\n'+identidad+'\n\nREGLA DE LONGITUD OBLIGATORIA: el BLOQUE A debe tener EXACTAMENTE entre '+maxPalabras+' y '+(maxPalabras+10)+' palabras. Ni una más, ni una menos. Cuenta las palabras antes de terminar.\n\nINSTRUCCION CRITICA DE FORMATO — OBLIGATORIO:\nDebes generar los 3 bloques completos en este orden exacto:\n1. BLOQUE A — texto hablado en español ('+maxPalabras+' a '+(maxPalabras+10)+' palabras)\n2. BLOQUE C — exactamente '+numPrompts+' prompts de imagen, numerados PROMPT 1 hasta PROMPT '+numPrompts+'\n3. BLOQUE F — texto hablado en inglés\nSi no generas el BLOQUE C con los '+numPrompts+' prompts, la respuesta es incompleta y falla el sistema. NO omitas el BLOQUE C bajo ninguna circunstancia.\n\n'+syncRule+seedRule+'Recuerda: BLOQUE A es solo texto hablado sin prompts. BLOQUE C son exactamente los '+numPrompts+' prompts de imagen. BLOQUE F es el guion en ingles sin prompts.';
  return {msg:msg,tO:tO,dO:dO,hO:hO};
}

// Llama a /api/generate y devuelve el episodio ya parseado (a, f, c, cRaw, raw).
async function fetchEpisode(msg){
  var r=await fetch('/api/generate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:msg}),
  });
  var d=await r.json();
  if(!r.ok){throw new Error(d&&d.error?d.error:'Error '+r.status);}
  if(!d.text)throw new Error('Sin respuesta de texto.');
  var p=parseBlocks(d.text);
  if(!p.a||p.a.length<20)throw new Error('No se pudo leer el guion ES. Intenta de nuevo.');
  return Object.assign({},p,{raw:d.text});
}

async function generate(){
  var topic=document.getElementById('conc').value.trim();
  if(!topic||loading)return;
  loading=true;updGBtn();hideErr();
  document.getElementById('ow').style.display='none';
  document.getElementById('gbtn').innerHTML='<span class="spin"></span> Forjando...';
  document.getElementById('gnote').style.display='inline';
  document.getElementById('gnote').textContent=sMode==='impacto'?'Generando golpe de impacto 30s...':sMode==='historia'?'Generando narrativa Trabajador→Alpha...':'Generando guiones ES + EN y prompts...';
  try{
    var built=buildEpisodeMsg(topic,sT,sH,sMode,sD);
    var p=await fetchEpisode(built.msg);
    lastRes=Object.assign({},p,{topic:topic,tO:built.tO,dO:built.dO,hO:built.hO,modo:sMode,uid:nextUid()});
    genCount++;cost+=0.015;updCost();
    resetReelAssets();
    saveHistory(lastRes);
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
  audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];
  thumbImg=(lastRes&&THUMBS[lastRes.uid])?THUMBS[lastRes.uid]:null;
  finalVid=null;
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
  var src=shuffleArr((SCHED_CURRENT&&SCHED_CURRENT.length?SCHED_CURRENT:[]).concat(shuffleArr(SCHED_POOL)));
  var picked=[],usedT={},usedC={};
  for(var pass=0;pass<2&&picked.length<5;pass++){
    for(var i=0;i<src.length&&picked.length<5;i++){
      var it=src[i];
      if(usedC[it.concept])continue;
      if(pass===0&&usedT[it.t])continue; // primera pasada: pilares sin repetir
      picked.push(it);usedT[it.t]=1;usedC[it.concept]=1;
    }
  }
  // Si escribiste un concepto, el guion 1 es ese concepto con tu seleccion actual.
  var firstJob=topic?{topic:topic,t:sT||picked[0].t,h:sH,mode:sMode,d:sMode==='impacto'?'30':sD}:null;
  return jobsFromIdeas(picked,firstJob);
}

async function generateBatch(customJobs){
  if(loading||batchLoading)return;
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
      var p=await fetchEpisode(built.msg);
      var res=Object.assign({},p,{topic:jobs[i].topic,tO:built.tO,dO:built.dO,hO:built.hO,modo:jobs[i].mode,uid:nextUid()});
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
    var p=await fetchEpisode(built.msg);
    var res=Object.assign({},p,{topic:br.job.topic,tO:built.tO,dO:built.dO,hO:built.hO,modo:br.job.mode,uid:nextUid()});
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
var HIST_MAX=10;
var MODE_LABELS={reel:'🎬 Reel',historia:'📖 Historia',impacto:'⚡ Impacto'};

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
      t:res.tO?res.tO.id:'',d:res.dO?res.dO.id:'60',h:res.hO?res.hO.id:'dato',
      modo:res.modo||'reel',fecha:new Date().toISOString()
    });
    if(h.length>HIST_MAX)h=h.slice(0,HIST_MAX); // al llegar el 11, se descarta el mas viejo
    localStorage.setItem(HIST_KEY,JSON.stringify(h));
  }catch(e){/* almacenamiento lleno o bloqueado: el historial nunca rompe la generacion */}
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
      +'<div style="font-size:10px;color:'+col+';font-weight:600">→ Restaurar este reel</div>';
    el.addEventListener('mouseenter',function(){el.style.borderColor=col+'88';});
    el.addEventListener('mouseleave',function(){el.style.borderColor='var(--border)';});
    (function(ii){el.addEventListener('click',function(){restoreHistory(ii);});})(i);
    grid.appendChild(el);
  });
}

// Restaura un guion del historial en pantalla, como recien generado:
// desde ahi se pueden retomar imagenes, audio y ZIP.
function restoreHistory(i){
  var h=getHistory();
  var item=h[i];if(!item)return;
  applySelection(item.modo,item.t,item.d,item.h);
  var tO=THEMES.find(function(t){return t.id===item.t;});
  var dO=DURS.find(function(d){return d.id===item.d;});
  var hO=HOOKS.find(function(x){return x.id===item.h;});
  lastRes={a:item.a,f:item.f,c:item.c||[],cRaw:item.cRaw||'',raw:'',topic:item.topic||'',tO:tO,dO:dO,hO:hO,modo:item.modo||'reel',uid:nextUid()};
  resetReelAssets();
  document.getElementById('conc').value=item.topic||'';updCC();updGBtn();
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
    +'YOUTUBE:\n[Para YouTube Shorts. NO es una descripcion: es un TITULO corto y potente mas los hashtags que quepan, todo en UNA sola linea de MAXIMO 100 caracteres contando titulo, espacios y hashtags. Empieza por #LegadoDeHierro si cabe. Cuenta los caracteres antes de responder: si pasa de 100, acortalo. Sin comillas.]';
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
  var mC=t.match(/CAPTION\s*:\s*([\s\S]*?)(?:HASHTAGS\s*:|TIKTOK\s*:|YOUTUBE\s*:|$)/i);
  var mH=t.match(/HASHTAGS\s*:\s*([\s\S]*?)(?:TIKTOK\s*:|YOUTUBE\s*:|$)/i);
  var mT=t.match(/TIKTOK\s*:\s*([\s\S]*?)(?:YOUTUBE\s*:|$)/i);
  var mY=t.match(/YOUTUBE\s*:\s*([\s\S]*)$/i);
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
// Ajustes de voz: sliders, presets y persistencia en el navegador.
function wireVox(){
  var map=[['vStab','vStabV','stability'],['vSim','vSimV','similarity_boost'],['vSty','vStyV','style'],['vSpd','vSpdV','speed']];
  try{
    var saved=localStorage.getItem('lh_vox');
    if(saved){var o=JSON.parse(saved);for(var k in o){if(VOX.hasOwnProperty(k))VOX[k]=o[k];}}
  }catch(e){}
  function save(){ try{localStorage.setItem('lh_vox',JSON.stringify(VOX));}catch(e){} }
  function paint(){
    map.forEach(function(m){
      var r=document.getElementById(m[0]),v=document.getElementById(m[1]);
      if(r)r.value=VOX[m[2]];
      if(v)v.textContent=Number(VOX[m[2]]).toFixed(2);
    });
    var b=document.getElementById('vBoost');
    if(b)b.checked=!!VOX.use_speaker_boost;
  }
  map.forEach(function(m){
    var r=document.getElementById(m[0]);
    if(!r)return;
    r.addEventListener('input',function(){
      VOX[m[2]]=parseFloat(r.value);
      var v=document.getElementById(m[1]);
      if(v)v.textContent=parseFloat(r.value).toFixed(2);
      save();
    });
  });
  var bx=document.getElementById('vBoost');
  if(bx)bx.addEventListener('change',function(){VOX.use_speaker_boost=bx.checked;save();});
  Array.prototype.forEach.call(document.querySelectorAll('.voxP'),function(btn){
    btn.addEventListener('click',function(){
      var p=btn.getAttribute('data-p').split(',');
      VOX.stability=parseFloat(p[0]);VOX.similarity_boost=parseFloat(p[1]);
      VOX.style=parseFloat(p[2]);VOX.speed=parseFloat(p[3]);
      paint();save();
    });
  });
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
      body:JSON.stringify({text:text,voice:VOX}),
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
    // partsB64: los MP3 originales de ElevenLabs, tal como llegaron. El servicio de
    // unificacion (Cloud Run) los une el mismo; asi no se manda el WAV gigante.
    if(isEN){audEN={blob:blob,url:url,alignment:combinedAlignment,partsB64:partsB64};}
    else{
      audES={blob:blob,url:url,alignment:combinedAlignment,partsB64:partsB64};
      if(typeof invalidateVoiceMix==='function')invalidateVoiceMix(); // la escucha usara ESTE audio nuevo
    }
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
// Ajustes de voz de ElevenLabs. Rangos reales de la API: stability/similarity/style 0-1;
// speed 0.7-1.2 (fuera de ese rango la calidad se degrada).
var VOX={stability:0.5,similarity_boost:0.75,style:0,speed:1,use_speaker_boost:true};
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
  chkExport();updUnifyCard();
}

// MINIATURA — imagen de portada del reel, aparte de las imagenes numeradas del guion.
// No ilustra una parte del guion: su unico trabajo es detener el scroll antes del play.
// CADA REEL tiene su propia miniatura: se guarda por uid del reel (THUMBS), asi al
// cambiar entre los guiones del lote o del historial ninguna miniatura se mezcla.
var thumbImg=null; // data URL de la miniatura del reel EN PANTALLA (o null)
var THUMBS={};     // THUMBS[uid del reel] = data URL de su miniatura

function buildThumbPrompt(){
  var hookLine=lastRes&&lastRes.a?firstLine(lastRes.a):'';
  return CHAR_STYLE_ANCHOR+aspectHint(imgFmt)
    +'THUMBNAIL COVER IMAGE for a Facebook Reel — this is the COVER of the video, NOT a scene from the story. Its only job: stop the scroll before the viewer taps play. '
    +'COMPOSITION: the character CENTERED and dominant in the frame, medium close-up, ONE single powerful hooking gesture or intense commanding expression, direct eye contact with the camera. '
    +'HIGH CONTRAST dramatic cinematic lighting, strong rim light, clean dark uncluttered background. '
    +'Leave clear EMPTY negative space in the upper third of the image so a title text can be overlaid later (do NOT draw any text yourself). '
    +'The emotional theme of the cover follows this message: "'+hookLine+'"';
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
  var da=document.createElement('a');da.href=thumbImg;da.download='legado-miniatura.png';da.textContent='⬇';
  da.style.cssText='background:rgba(255,255,255,.93);border-radius:6px;padding:4px 9px;font-size:10px;font-weight:600;color:#2a2a3a;text-decoration:none';
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
  return 'ANIMATION STYLE (strict, must match the input image exactly): American 2D comic book illustration style, clean ink outlines, flat cel-shading with hard color blocks and visible shading edges -- NOT 3D, NOT 3D render, NOT CGI, NOT photorealistic, NOT realistic rendering, NOT Pixar style, NOT smooth 3D shading. The animation must preserve the flat 2D comic look of the source image throughout the entire clip.\n\n'
    +'NO WEATHER AT ALL (strict): there is NO rain, NO snow, NO storm, NO raindrops, NO water on any surface, NO wet floors, anywhere in the clip -- not outside the window, not in the background, and absolutely never indoors. Skies stay clear or neutral. Never add any weather effect that was not clearly in the source image, and never let anything look wet.\n\n'
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
var finalVid=null; // {url, blob} del video final unificado

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
var PRESET_LABELS={piano:'🎹 Piano nostálgico',cuerdas:'🎻 Cuerdas inspiradoras',ambiente:'🌫 Ambiente suave',epica:'⚔ Épica del canal'};

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
    if(st)st.textContent='🎼 "'+d.name+'" lista y seleccionada. Toca ▶ Escuchar para oírla al volumen de la barra; si no te convence, genera otra.';
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
  if(btn)btn.textContent='▶ Escuchar cómo quedará (narración + música)';
}

// Al REGENERAR el Audio ES: se corta la mezcla si esta sonando y se borra la
// narracion vieja decodificada — la proxima escucha usa SIEMPRE el audio nuevo.
// (La unificacion, subtitulos y ZIP ya usan siempre el mas reciente.)
function invalidateVoiceMix(){
  try{
    stopMix();
    if(lastRes&&lastRes.uid)delete MIX.bufs['voz-'+lastRes.uid];
  }catch(e){}
}

async function toggleMixPreview(objectOverride){
  if(MIX.playing){stopMix();return;}
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
    var vb=null;
    if(audES&&audES.blob&&lastRes&&lastRes.uid){
      var vkey='voz-'+lastRes.uid;
      if(!MIX.bufs[vkey])MIX.bufs[vkey]=await MIX.ctx.decodeAudioData(await audES.blob.arrayBuffer());
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

function updUnifyCard(){
  var card=document.getElementById('unifyCard');if(!card)return;
  if(!musicLoaded)loadMusicList();
  var sub=document.getElementById('unifySub');
  var total=imgs.filter(function(x){return x&&x.src;}).length;
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

async function unifyVideo(){
  if(!lastRes){alert('Genera un reel primero.');return;}
  var total=imgs.filter(function(x){return x&&x.src;}).length;
  if(!total){alert('Primero genera las imágenes y sus videos.');return;}
  var urls=[];
  for(var i=0;i<total;i++){
    if(!(vids[i]&&vids[i].remoteUrl)){alert('Falta el video del clip '+(i+1)+'. Genera todos los videos primero.');return;}
    urls.push(vids[i].remoteUrl);
  }
  if(!(audES&&audES.partsB64&&audES.partsB64.length)){alert('Genera el Audio ES primero (la narración que se pega al video).');return;}
  var btn=document.getElementById('bunify');
  var st=document.getElementById('unifySt');
  var er=document.getElementById('unifyErr');
  var box=document.getElementById('unifyRes');
  btn.disabled=true;btn.style.opacity='.6';
  er.style.display='none';box.style.display='none';
  st.style.display='block';st.textContent='Enviando trabajo al servicio de unificación...';
  try{
    var music=selectedMusic();
    var r=await fetch('/api/unify',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({videos:urls,audioParts:audES.partsB64,music:music}),
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
    finalVid={url:URL.createObjectURL(vb),blob:vb};
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
  var dl=document.createElement('a');
  dl.href=finalVid.url;dl.download=slug+'-final.mp4';dl.textContent='⬇ Descargar video final';
  dl.style.cssText='display:inline-block;background:linear-gradient(135deg,#7a9ec4,#9ab8d8);color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none';
  box.appendChild(dl);
}

function chkExport(){if(audES||audEN||imgs.length||thumbImg||finalVid)document.getElementById('expbtn').style.display='flex';}

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
    if(capFull) zip.file(slug+'-caption.txt',capFull.trim()+'\n');
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
    if(finalVid&&finalVid.blob){
      var fb=await finalVid.blob.arrayBuffer();
      zip.file(slug+'-final.mp4',fb);
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
  audES=null;audEN=null;imgs=[];vids=[];vidState=[];vidErrMsg=[];thumbImg=null;finalVid=null;sT='';rfAll();
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
  var a=document.createElement('a');
  a.download='legado-post-'+postFmt+'.png';
  a.href=canvas.toDataURL('image/png',1.0);
  a.click();
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
    var p=await fetchEpisode(built.msg);
    lastRes=Object.assign({},p,{topic:it.concept,tO:built.tO,dO:built.dO,hO:built.hO,modo:mode,uid:nextUid()});
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
  var box=document.getElementById('trendBox');
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
    var showText=d.text.replace(/CONCEPTOS PARA GENERAR[\s\S]*$/i,'').trim();
    var html='<div style="white-space:pre-wrap;font-size:13px;line-height:1.7;color:var(--tx)">'+escHtml(showText)+'</div>';
    if(TREND_IDEAS.length){
      // Cada concepto trae su propio selector de MODO y DURACION, con valores
      // sugeridos variados (los tres modos presentes). Impacto fuerza 30s.
      var defModes=shuffleArr(['reel','historia','impacto']).concat(shuffleArr(['reel','historia','impacto']).slice(0,2));
      var defDurs=shuffleArr(['30','60','60','30','60']);
      html+='<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">'
        +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--tx3);text-transform:uppercase;margin-bottom:8px">'+TREND_IDEAS.length+' conceptos sacados de lo viral — elige modo y duración de cada uno</div>';
      TREND_IDEAS.forEach(function(it,i){
        var th=THEMES.find(function(t){return t.id===it.t;});
        var dm=defModes[i],isImp=dm==='impacto';
        html+='<div style="background:#fff;border:1.5px solid var(--border);border-radius:8px;padding:8px 11px;margin-bottom:6px">'
          +'<span style="font-size:9px;font-weight:700;letter-spacing:.06em;color:'+(th?th.c:'#b8975a')+';text-transform:uppercase">'+(i+1)+' · '+(th?th.icon+' '+th.label:'')+'</span>'
          +'<div style="font-size:12px;font-weight:600;color:var(--tx);line-height:1.4;margin-top:3px">'+escHtml(it.concept)+'</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
          +'<label class="genLbl">Modo<select id="trendMode-'+i+'" class="genSel">'
            +'<option value="reel"'+(dm==='reel'?' selected':'')+'>🎬 Reel</option>'
            +'<option value="historia"'+(dm==='historia'?' selected':'')+'>📖 Historia</option>'
            +'<option value="impacto"'+(isImp?' selected':'')+'>⚡ Impacto (30s)</option>'
          +'</select></label>'
          +'<label class="genLbl">Duración<select id="trendDur-'+i+'" class="genSel"'+(isImp?' disabled':'')+'>'
            +'<option value="30"'+((isImp||defDurs[i]==='30')?' selected':'')+'>30 segundos</option>'
            +'<option value="60"'+(!isImp&&defDurs[i]==='60'?' selected':'')+'>60 segundos</option>'
          +'</select></label>'
          +'</div>'
          +'<button id="bTrendOne-'+i+'" style="width:100%;margin-top:8px;background:#fff;border:1.5px solid var(--gold);color:var(--gold);border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">⚔ Generar solo este</button>'
          +'</div>';
      });
      html+='<button id="bTrendBatch" style="width:100%;margin-top:6px;background:linear-gradient(135deg,var(--gold),var(--gold-l));color:#fff;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">⚔ Generar los 5 a la vez (lote)</button>'
        +'<div style="font-size:10px;color:var(--tx3);margin-top:6px">Cada tarjeta tiene su botón para generar solo ese reel; o usa el botón dorado para los 5 de una, uno tras otro (en orden).</div></div>';
    }else{
      html+='<div style="margin-top:10px;font-size:11px;color:var(--tx3)">La investigación no trajo conceptos en formato usable esta vez. Vuelve a intentar con 🔎.</div>';
    }
    if(d.sources&&d.sources.length){
      html+='<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border)"><div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--tx3);text-transform:uppercase;margin-bottom:6px">Fuentes consultadas</div>';
      d.sources.slice(0,8).forEach(function(s2){
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
  var sb=document.getElementById('schedBtn');
  if(sb)sb.addEventListener('click',function(){
    var o=document.getElementById('schedPanel').classList.toggle('on');
    document.getElementById('sa').textContent=o?'▲':'▼';
  });
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
