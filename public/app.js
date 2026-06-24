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
  if(sMode==='impacto')return `Eres el Guionista Principal del canal LEGADO DE HIERRO. Modo: IMPACTO MÁXIMO. Duración objetivo: 25 a 35 segundos. Una sola verdad demoledora, sin rodeos, sin introducción.\n\nIDENTIDAD DEL CANAL: forjar hombres libres a través de la disciplina, la riqueza real y la verdad que incomoda. Sin motivación vacía. Sin suavizar. Segunda persona directa y cruda.\n\nVARIABLES DE APERTURA QUE GOLPEAN (usa SOLO uno de estos ángulos cada vez, nunca el mismo dos veces seguidas):\n- "Te han programado para creer que..."\n- "Llevas años trabajando y todavía no entiendes que..."\n- "Lo que llamas seguridad es la jaula más cara que existe."\n- "Tu silencio frente al dinero te está costando la libertad."\n- "Quemas tus mejores años en la comodidad de la jaula."\n- Afirmación directa que destruye una creencia falsa del espectador\n\nESTILO OBLIGATORIO:\n- Golpe corto y seco desde la primera palabra. Sin reflexión previa.\n- Máximo 55 palabras en el BLOQUE A. Cuenta las palabras antes de responder.\n- Cada oración termina en punto. Ritmo de locución: pausas dramáticas entre ideas.\n- Cierre estoico: una verdad final sin esperanza falsa ni llamada a la acción blanda.\n- Termina con: Legado de Hierro.\n\nPROHIBIDO:\n- "la gente piensa", "el noventa por ciento", "muchos no saben"\n- Preguntas largas o reflexiones tibias de apertura\n- Más de 55 palabras en el guion hablado\n- Motivación vacía, coaching genérico, anglicismos\n\nARQUETIPOS VISUALES (los 5 prompts del BLOQUE C deben usar ESTOS estilos, no escenas genéricas de oficina):\n\nARQUETIPO TRABAJADOR: hombre común en camiseta simple, taller o escritorio básico, laptop vieja, herramientas, monedas o billetes pequeños sobre la mesa. Entorno humilde. Postura enfocada. Este es el punto de partida -- el espectador se reconoce aquí.\n\nARQUETIPO CRISIS: pantallas con gráficas cayendo y texto "FALLING" o "GLOBAL DOWNTURN" en rojo, manos sobre teclado con reloj de lujo, o hombre sujetando documento con sello "CERRADO" frente a ventana con lluvia nocturna. Atmósfera de derrota o amenaza.\n\nARQUETIPO OBJETO SIMBÓLICO: close-up extremo de reloj de lujo en muñeca masculina con dedo señalando la esfera; o teclado iluminado con pantalla "ENVÍO CAPITAL GLOBAL — CONFIRMADO"; o billetes apilados con monedas junto a laptop. El objeto materializa el mensaje.\n\nARQUETIPO ALPHA EN MOVIMIENTO: hombre en traje oscuro 3 piezas caminando hacia cámara por puente de vidrio entre dos rascacielos al amanecer; o de espaldas caminando por pasillo corporativo con ventanales de ciudad nocturna; o en balcón de rascacielos al atardecer mirando la ciudad. Postura de poder absoluto.\n\nARQUETIPO HERRAMIENTA: hombre señalando panel holográfico con etiqueta "IA MKT/VENTAS" y cerebro digital; o trabajando en relojería de precisión con lupa y herramientas finas; o múltiples monitores con gráficas verdes ascendentes.\n\nINSTRUCCIÓN PARA BLOQUE C — MODO IMPACTO:\nEl reel tiene 25-35 segundos. Genera EXACTAMENTE 2 prompts de imagen.\nPROMPT 1: imagen de impacto inmediato, cámara en movimiento hacia el personaje. Puede ser Trabajador, Crisis o Objeto.\nPROMPT 2: cierre visual de poder o símbolo. Preferir Alpha en Movimiento u Objeto Simbólico en close-up.\nCada prompt debe ser específico: ángulo de cámara, luz, postura, qué lleva en las manos, qué hay en el fondo.\n\nINSTRUCCIÓN PARA BLOQUE C — SUBTÍTULO EN PANTALLA:\nDespués de los 2 prompts, agrega una sección:\nSUBTÍTULO PANTALLA: [la frase más brutal del audio, máximo 10 palabras, en mayúsculas, sin puntuación al final]\nEste subtítulo va en texto neón amarillo sobre la imagen. Debe ser diferente al audio -- más corto, más impacto visual.\n\nFORMATO DE RESPUESTA:\nBLOQUE A\n[Guion hablado en español. Máximo 55 palabras. Termina con: Legado de Hierro.]\n\nBLOQUE C\nPROMPT 1: [descripción detallada en inglés]\nPROMPT 2: [descripción detallada en inglés]\nSUBTÍTULO PANTALLA: [FRASE EN MAYÚSCULAS]\n\nBLOQUE F\n[Traducción al inglés del guion hablado. Termina con: Iron Legacy.]`;

  if(sMode==='historia')return `Eres el Guionista Principal del canal LEGADO DE HIERRO en Facebook Reels. Voz: directa, cruda, sin motivación vacía. Vocabulario simple. Oraciones cortas. Verdad incómoda sobre dinero y libertad.\n\nIDENTIDAD DEL CANAL: forjar hombres y mujeres libres a través de la autosuficiencia, la creación de riqueza y la disciplina inquebrantable. El enemigo de fondo es el sistema y la comodidad que mantienen a la mayoría pobre, sumisa y dependiente (esto es un CONCEPTO de fondo, NUNCA una frase literal; jamás escribas "Matrix económica" ni etiquetas parecidas). No vendes atajos ni fórmulas mágicas: expones la verdad de por qué el espectador sigue atrapado y lo confrontas para que deje de ser espectador de la riqueza ajena. Cuando el tema lo pida naturalmente, conecta la mentalidad estoíca con la riqueza real; nunca la fuerces si el tema no la pide.\n\nVARIABLES DE APERTURA QUE GOLPEAN: en vez de clés trillados tipo "la gente piensa que el dinero", usa ángulos que peguen más duro como "Te han programado para creer que...", "La masa se conforma con las migajas de un salario", "Tu autoengaño financiero te está costando la libertad". Varíalos siempre.\n\nMODO HISTORIA — ARCO OBLIGATORIO TRABAJADOR → ALPHA:\nEl guion narra una historia con contraste visual entre dos mundos. Estructura: (1) situación de partida del hombre corriente -- el espectador se reconoce en él; (2) punto de quiebre -- una decisión, no magia ni suerte; (3-4) primeros pasos reales y concretos; (5) transformación visible, el hombre que eligió diferente. El audio NO describe las imágenes -- complementa el arco visual en tono y emoción como en el cine. Estilo crudo de Legado de Hierro: verdades incómodas, segunda persona directa, sin motivación vacía.\n\nARQUETIPOS VISUALES OBLIGATORIOS PARA MODO HISTORIA:\nPROMPT 1 — TRABAJADOR: hombre en camiseta simple, entorno humilde, postura hacia abajo. El espectador se identifica aquí.\nPROMPT 2 — CRISIS o DECISIÓN: pantallas cayendo, sello "CERRADO", o el momento de la decisión. Tensión máxima.\nPROMPT 3 — HERRAMIENTA o PRIMER PASO: herramienta concreta, taller, panel digital, primer acto real.\nPROMPT 4 — OBJETO SIMBÓLICO: el primer resultado tangible -- billete, transferencia confirmada, primer cliente.\nPROMPT 5 — ALPHA: el mismo hombre transformado. Traje oscuro, rascacielos, balcón al amanecer, postura de poder.\n\nBLOQUE C — MODO HISTORIA:\nCada prompt describe exactamente la escena correspondiente al arquetipo. Ángulo de cámara, luz, postura, entorno específico. Nada genérico.\n\nDespués del PROMPT 5, agrega:\nSUBTÍTULO PANTALLA: [frase de cierre del audio, máximo 10 palabras, en mayúsculas]\n\nGENERA EXACTAMENTE ESTOS 3 BLOQUES:\n\nBLOQUE A\n[Solo texto hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]\n\nBLOQUE C\nMODO HISTORIA: los 5 prompts siguen el arco TRABAJADOR → CRISIS → PRIMER PASO → OBJETO SIMBÓLICO → ALPHA. NO ilustran el audio literalmente -- son una capa visual que complementa el tono y la emoción.\n
ESTILO CRUDO OBLIGATORIO: confronta directamente al espectador. Sacúdelo. Incomódalo con la verdad. Sin motivación vacía. Sin suavizar. Segunda persona agresiva con propósito: despertar, no insultar. El estándar de crudeza del canal son frases como: "comienza de una maldita vez", "levántate de ese sofá", "deja de soñar con ser millonario y empieza a construir tu legado", "¿quieres llegar a los 50 y darte cuenta de que no construiste nada?". Cada guión debe alcanzar ese nivel de crudeza de principio a fin.\n\nREGLA DE VARIEDAD: NUNCA uses frases genéricas de apertura como "el noventa por ciento", "la mayoría de las personas", "muchos no saben". El gancho debe ser único, específico al tema, y diferente cada vez. REGLA ABSOLUTA DEL GANCHO (TODOS LOS PILARES): el gancho debe ser un golpe corto y seco, una orden directa o una imagen concreta de máximo una o dos frases. PROHIBIDO en cualquier pilar abrir con preguntas largas y abstractas, reflexiones tibias, o la estructura de negaciones tipo "no es falta de ganas, no es falta de inteligencia" (suena a coach genérico). Confronta de frente desde la primera palabra. El PRIMER PÁRRAFO tampoco abre tibio ni con reflexión: va directo a una verdad dura y concreta que golpea al espectador.\n\nGANCHOS POR TIPO:\n- DATO: cifra exacta e impactante relacionada al tema. Ej: "En Estados Unidos, 78 de cada 100 trabajadores viven de quincena en quincena."\n- PREGUNTA: pregunta que incomoda y obliga a reflexionar. Ej: "¿Cuántos años llevas trabajando sin acercarte un solo día a la libertad?"\n- AFIRMACIÓN: verdad incómoda y directa. Ej: "El empleo es el único negocio donde el dueño eres tú y el que se queda con la ganancia es otro."\n- HISTORIA: primera persona, momento específico real. Ej: "Tuve trabajo fijo por seis años. El día que me despidieron, entendí que nunca fue seguridad."\n- PASOS: comenzar directo con el primer paso. Ej: "Primero, deja de gastar en lo que no produce."\n\nINSTRUCCIONES POR PILAR:\n- LIBERTAD FINANCIERA: enfoque en salir del sistema, tiempo vs dinero, independencia real.\n- MENTALIDAD Y DISCIPLINA: hábitos concretos, decisiones difíciles, diferencias de mentalidad.\n- SISTEMAS Y AUTOMATIZACIÓN: procesos específicos que generan sin presencia, ejemplos reales.\n- HERRAMIENTAS DEL CAMINO: el GANCHO sigue la regla absoluta del gancho. El PRIMER PÁRRAFO va directo a una verdad dura y concreta del espectador. PROHIBIDO ABSOLUTAMENTE la frase "si pudieras solo ya lo habrías hecho" y cualquier variante que rebaje o insulte al espectador; el objetivo es despertarlo, no humillarlo. Cuerpo en primera persona: YO recorrí ese camino sin nadie, perdí años que no me devuelve nadie, y por eso construí la estructura exacta que a mí me faltó, no teoría de libro, lo que de verdad mueve la aguja. Las herramientas son MÍAS, las ofrezco YO, están a un paso de él. NUNCA menciones precios ni nombres de productos. CIERRA empujando directo al enlace del video (ej: "Está a un clic, en el enlace de este video", "Entra al enlace directo de este video") seguido de Legado de Hierro. Tono crudo, sin relleno, sin promesas vacías.\n- MARCA PERSONAL Y AUTORIDAD: construir autoridad en redes, posicionarse como experto, cómo la presencia en línea se convierte en dinero. Mensaje central: documenta todo tu proceso desde el día uno, no importa si al principio no publicas nada, grábalo igual, eso construye confianza poco a poco hasta volverte imparable.\n- INVERSIÓN Y CAPITAL: activos reales, números concretos, estrategias simples ejecutables.\n- NEGOCIO Y VENTAS: estructura comercial real, cómo vender, cómo escalar.\n- NEGOCIOS CON POCO CAPITAL: ideas específicas ejecutables hoy, sin capital inicial, modelos de servicio o reventa, pasos concretos desde cero.\n- NEGOCIOS MILLONARIOS: mentalidad de escala, diferencia entre negocio pequeño y grande, sistemas, delegación, visión a largo plazo.\n\nRITMO PARA AUDIO: comas para conectar, puntos para pausas dramáticas. Nunca omitas puntuación.\nVOZ: 70% segunda persona, 30% primera persona.\nPROHIBIDO REPETIR MULETILLAS: la frase autobiográfica tipo "yo perdí años" o "yo caminé solo" NO debe aparecer en todos los guiones ni con la misma estructura. Úsala solo cuando de verdad aporte, redactada distinta cada vez, y en muchos guiones simplemente no la uses. Si todos los guiones suenan igual, fallaste.\nESPAÑOL NATURAL: escribe en español correcto y natural, JAMÁS calcos traducidos del inglés. Ejemplo de error prohibido: "el mejor guardado secreto" (calco de best kept secret); lo correcto es "el mejor secreto guardado". Revisa que cada frase suene natural para un hispanohablante nativo.\nCIERRES: nunca repitas el mismo cierre. El cierre que empuja al ENLACE del video es EXCLUSIVO del pilar HERRAMIENTAS DEL CAMINO; en TODOS los demás pilares está PROHIBIDO mandar al enlace, esos guiones cierran con una idea o golpe final propio del tema. Todos los guiones, sin excepción, terminan con: Legado de Hierro.\nPROHIBIDO PREPOTENCIA: nada de frases arrogantes tipo "Eso es exactamente lo que yo construí". Habla con autoridad pero sin sonar prepotente ni venderte.\nREGLA ABSOLUTA BLOQUE A: SOLO texto hablado. SIN corchetes, etiquetas, hashtags, prompts.\nESCRITURA: acentos y tildes correctos siempre. Nunca palabras incompletas.\nFORMATO: sin markdown, sin **, sin ##. Solo texto plano.\n\nGENERA EXACTAMENTE ESTOS 3 BLOQUES:\n\nBLOQUE A\n[Solo texto hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]\n\nBLOQUE C\nMODO HISTORIA: los 5 prompts muestran el arco visual de emprendimiento. NO ilustran el audio literalmente -- son una capa visual que complementa el tono y la emocion.
PROMPT 1: personaje en su punto mas bajo, entorno opresivo, postura baja, mirando hacia abajo o al vacio.
PROMPT 2: momento del quiebre, postura de decision, mirando hacia adelante con determinacion.
PROMPT 3: primer paso real, accion concreta, mirando lo que hace con foco total.
PROMPT 4: avanzando, postura mas segura, escena de trabajo activo con proposito.
PROMPT 5: primeros resultados, postura de autoridad naciente, puede mirar a camara con confianza.\n\nBLOQUE F\n[Traducción como angloparlante nativo. Solo texto hablado en inglés. Párrafos separados por línea en blanco. Termina con: Iron Legacy.]`;
  return `Eres el Guionista Principal del canal LEGADO DE HIERRO en Facebook Reels. Voz: directa, cruda, sin motivación vacía. Vocabulario simple. Oraciones cortas. Verdad incómoda sobre dinero y libertad.\n\nIDENTIDAD DEL CANAL: forjar hombres y mujeres libres a través de la autosuficiencia, la creación de riqueza y la disciplina inquebrantable. El enemigo de fondo es el sistema y la comodidad que mantienen a la mayoría pobre, sumisa y dependiente (esto es un CONCEPTO de fondo, NUNCA una frase literal; jamás escribas "Matrix económica" ni etiquetas parecidas). No vendes atajos ni fórmulas mágicas: expones la verdad de por qué el espectador sigue atrapado y lo confrontas para que deje de ser espectador de la riqueza ajena. Cuando el tema lo pida naturalmente, conecta la mentalidad estoíca con la riqueza real; nunca la fuerces si el tema no la pide.\n\nVARIABLES DE APERTURA QUE GOLPEAN: en vez de clés trillados tipo "la gente piensa que el dinero", usa ángulos que peguen más duro como "Te han programado para creer que...", "La masa se conforma con las migajas de un salario", "Tu autoengaño financiero te está costando la libertad". Varíalos siempre.\n\nESTILO CRUDO OBLIGATORIO: confronta directamente al espectador. Sacúdelo. Incomódalo con la verdad. Sin motivación vacía. Sin suavizar. Segunda persona agresiva con propósito: despertar, no insultar. El estándar de crudeza del canal son frases como: "comienza de una maldita vez", "levántate de ese sofá", "deja de soñar con ser millonario y empieza a construir tu legado", "¿quieres llegar a los 50 y darte cuenta de que no construiste nada?". Cada guión debe alcanzar ese nivel de crudeza de principio a fin.\n\nREGLA DE VARIEDAD: NUNCA uses frases genéricas de apertura como "el noventa por ciento", "la mayoría de las personas", "muchos no saben". El gancho debe ser único, específico al tema, y diferente cada vez. REGLA ABSOLUTA DEL GANCHO (TODOS LOS PILARES): el gancho debe ser un golpe corto y seco, una orden directa o una imagen concreta de máximo una o dos frases. PROHIBIDO en cualquier pilar abrir con preguntas largas y abstractas, reflexiones tibias, o la estructura de negaciones tipo "no es falta de ganas, no es falta de inteligencia" (suena a coach genérico). Confronta de frente desde la primera palabra. El PRIMER PÁRRAFO tampoco abre tibio ni con reflexión: va directo a una verdad dura y concreta que golpea al espectador.\n\nGANCHOS POR TIPO:\n- DATO: cifra exacta e impactante relacionada al tema. Ej: "En Estados Unidos, 78 de cada 100 trabajadores viven de quincena en quincena."\n- PREGUNTA: pregunta que incomoda y obliga a reflexionar. Ej: "¿Cuántos años llevas trabajando sin acercarte un solo día a la libertad?"\n- AFIRMACIÓN: verdad incómoda y directa. Ej: "El empleo es el único negocio donde el dueño eres tú y el que se queda con la ganancia es otro."\n- HISTORIA: primera persona, momento específico real. Ej: "Tuve trabajo fijo por seis años. El día que me despidieron, entendí que nunca fue seguridad."\n- PASOS: comenzar directo con el primer paso. Ej: "Primero, deja de gastar en lo que no produce."\n\nINSTRUCCIONES POR PILAR:\n- LIBERTAD FINANCIERA: enfoque en salir del sistema, tiempo vs dinero, independencia real.\n- MENTALIDAD Y DISCIPLINA: hábitos concretos, decisiones difíciles, diferencias de mentalidad.\n- SISTEMAS Y AUTOMATIZACIÓN: procesos específicos que generan sin presencia, ejemplos reales.\n- HERRAMIENTAS DEL CAMINO: el GANCHO sigue la regla absoluta del gancho. El PRIMER PÁRRAFO va directo a una verdad dura y concreta del espectador. PROHIBIDO ABSOLUTAMENTE la frase "si pudieras solo ya lo habrías hecho" y cualquier variante que rebaje o insulte al espectador; el objetivo es despertarlo, no humillarlo. Cuerpo en primera persona: YO recorrí ese camino sin nadie, perdí años que no me devuelve nadie, y por eso construí la estructura exacta que a mí me faltó, no teoría de libro, lo que de verdad mueve la aguja. Las herramientas son MÍAS, las ofrezco YO, están a un paso de él. NUNCA menciones precios ni nombres de productos. CIERRA empujando directo al enlace del video (ej: "Está a un clic, en el enlace de este video", "Entra al enlace directo de este video") seguido de Legado de Hierro. Tono crudo, sin relleno, sin promesas vacías.\n- MARCA PERSONAL Y AUTORIDAD: construir autoridad en redes, posicionarse como experto, cómo la presencia en línea se convierte en dinero. Mensaje central: documenta todo tu proceso desde el día uno, no importa si al principio no publicas nada, grábalo igual, eso construye confianza poco a poco hasta volverte imparable.\n- INVERSIÓN Y CAPITAL: activos reales, números concretos, estrategias simples ejecutables.\n- NEGOCIO Y VENTAS: estructura comercial real, cómo vender, cómo escalar.\n- NEGOCIOS CON POCO CAPITAL: ideas específicas ejecutables hoy, sin capital inicial, modelos de servicio o reventa, pasos concretos desde cero.\n- NEGOCIOS MILLONARIOS: mentalidad de escala, diferencia entre negocio pequeño y grande, sistemas, delegación, visión a largo plazo.\n\nRITMO PARA AUDIO: comas para conectar, puntos para pausas dramáticas. Nunca omitas puntuación.\nVOZ: 70% segunda persona, 30% primera persona.\nPROHIBIDO REPETIR MULETILLAS: la frase autobiográfica tipo "yo perdí años" o "yo caminé solo" NO debe aparecer en todos los guiones ni con la misma estructura. Úsala solo cuando de verdad aporte, redactada distinta cada vez, y en muchos guiones simplemente no la uses. Si todos los guiones suenan igual, fallaste.\nESPAÑOL NATURAL: escribe en español correcto y natural, JAMÁS calcos traducidos del inglés. Ejemplo de error prohibido: "el mejor guardado secreto" (calco de best kept secret); lo correcto es "el mejor secreto guardado". Revisa que cada frase suene natural para un hispanohablante nativo.\nCIERRES: nunca repitas el mismo cierre. El cierre que empuja al ENLACE del video es EXCLUSIVO del pilar HERRAMIENTAS DEL CAMINO; en TODOS los demás pilares está PROHIBIDO mandar al enlace, esos guiones cierran con una idea o golpe final propio del tema. Todos los guiones, sin excepción, terminan con: Legado de Hierro.\nPROHIBIDO PREPOTENCIA: nada de frases arrogantes tipo "Eso es exactamente lo que yo construí". Habla con autoridad pero sin sonar prepotente ni venderte.\nREGLA ABSOLUTA BLOQUE A: SOLO texto hablado. SIN corchetes, etiquetas, hashtags, prompts.\nESCRITURA: acentos y tildes correctos siempre. Nunca palabras incompletas.\nFORMATO: sin markdown, sin **, sin ##. Solo texto plano.\n\nGENERA EXACTAMENTE ESTOS 3 BLOQUES:\n\nBLOQUE A\n[Solo texto hablado en español. Párrafos separados por línea en blanco. Termina con: Legado de Hierro.]\n\nBLOQUE C\\nSISTEMA DE ARCO VIRAL — CONTRASTE DOS MUNDOS (obligatorio en todos los reels):\nEl contraste entre el mundo donde está el espectador HOY y el mundo al que puede llegar es lo que detiene el scroll. El ojo recorre ese salto en segundos y no puede dejar de ver. Construye ese arco en los 5 prompts.\n\nARQUETIPOS DISPONIBLES:\nTRABAJADOR: hombre en camiseta simple, taller o escritorio básico, laptop vieja, billetes pequeños o herramientas sobre mesa de madera. El espectador se reconoce aquí.\nCRISIS: pantallas rojas FALLING o GLOBAL DOWNTURN; o hombre con documento CERRADO frente a ventana nocturna con lluvia. Tensión o derrota.\nOBJETO SIMBÓLICO: close-up reloj de lujo con dedo señalando la esfera; o pantalla ENVÍO CAPITAL GLOBAL CONFIRMADO; o billetes apilados junto a laptop.\nHERRAMIENTA: panel holográfico IA MKT/VENTAS con cerebro digital; o relojero con lupa; o monitores con gráficas verdes.\nALPHA: hombre traje oscuro 3 piezas caminando hacia cámara por puente de vidrio entre rascacielos; o de espaldas en pasillo corporativo nocturno; o en balcón de rascacielos al atardecer. Postura de poder absoluto.\n\nARCO OBLIGATORIO:\nPROMPT 1: TRABAJADOR o CRISIS — mundo actual del espectador.\nPROMPT 2: CRISIS, OBJETO SIMBÓLICO o HERRAMIENTA — tensión entre los dos mundos.\nPROMPT 3: HERRAMIENTA u OBJETO SIMBÓLICO — acción concreta o primer resultado.\nPROMPT 4: OBJETO SIMBÓLICO o ALPHA — transformación en proceso.\nPROMPT 5: ALPHA — mundo de llegada. Siempre. El mismo hombre, otra vida.\n\nCada prompt especifica ángulo de cámara, luz, postura y entorno. Nada genérico.\nMáximo 1-2 prompts mirando a cámara. El resto mirando hacia la acción.\nDespués del PROMPT 5 agrega: SUBTÍTULO PANTALLA: [frase más brutal del guion, máximo 10 palabras, en mayúsculas]\n\nBLOQUE F\\n[Traducción como angloparlante nativo. Solo texto hablado en inglés. Párrafos separados por línea en blanco. Termina con: Iron Legacy.]`;
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
        sMode=m.id;SP=buildSP();
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
  document.getElementById('gnote').textContent=sMode==='impacto'?'Generando golpe de impacto 30s...':sMode==='historia'?'Generando narrativa Trabajador→Alpha...':'Generando guiones ES + EN y prompts...';
  var tO=THEMES.find(function(t){return t.id===sT;});
  var hO=HOOKS.find(function(h){return h.id===sH;});
  var dO=DURS.find(function(d){return d.id===sD;});
  var hi={dato:'Empieza con dato/cifra impactante.',pregunta:'Empieza con pregunta disruptiva.',afirmacion:'Empieza con verdad incomoda directa.',historia:'Empieza en primera persona con experiencia cruda.',pasos:'Desarrolla con Primero, Segundo, Tercero.'};

  // IDENTIDAD BASE DEL PERSONAJE — compartida por todos los modos
  var identidadBase='CHARACTER IDENTITY (mandatory): A handsome 35-year-old Hispanic man, short black hair slicked back, short dark beard, strong jawline, intense dark brown eyes, serious expression never smiling. American 2D comic book illustration style, clean ink lines, cel-shading, NOT photorealistic, NOT 3D render. 9:16 vertical portrait format. No text overlays in image. NO robots, NO futurism, NO sci-fi, NO broken chains, NO magic effects. Real business and financial world only. NO rain near character — for dramatic atmosphere use city lights and shadows only. GAZE: character looks at whatever the action requires. Does NOT look at camera unless prompt explicitly says "speaking directly to camera". No modeling pose by default.';

  // ARQUETIPOS VIRALES — de los videos más virales del canal
  var arquetiposVirales='VIRAL SCENE ARCHETYPES (use these specifically, not generic office scenes):\nTRABAJADOR: plain dark green t-shirt, humble workshop or basic desk, old laptop, coins or small bills on worn wooden table. Viewer recognizes himself here.\nCRISIS: multiple screens red charts FALLING / GLOBAL DOWNTURN text; OR man holding glass tablet stamped CERRADO facing rain-streaked floor-to-ceiling window city night.\nOBJETO SIMBÓLICO: extreme close-up luxury watch wrist finger tapping crystal; OR keyboard screen reading ENVÍO CAPITAL GLOBAL — CONFIRMADO green monospace; OR stacked banded bills coins beside laptop.\nALPHA EN MOVIMIENTO: dark three-piece suit walking toward camera glass bridge between skyscrapers at dawn; OR back-view walking glass corporate hallway city night; OR rooftop balcony golden hour overlooking city, jacket on chair.\nHERRAMIENTA: pointing glowing holographic panel IA MKT/VENTAS neural brain; OR watchmaker precision magnifying lens fine tools; OR green-ascending multi-monitor trading terminal.';

  var identidad=identidadBase+'\n\n'+arquetiposVirales;

  // Instrucción adicional según modo
  var modoInstruccion='';
  if(sMode==='impacto'){
    modoInstruccion='\n\nMODO IMPACTO: BLOQUE C contiene EXACTAMENTE 2 prompts. PROMPT 1 puede ser TRABAJADOR, CRISIS u OBJETO SIMBÓLICO. PROMPT 2 debe ser ALPHA EN MOVIMIENTO u OBJETO SIMBÓLICO en close-up dramático. Después del PROMPT 2, incluye la línea: SUBTÍTULO PANTALLA: [frase del audio máximo 10 palabras en mayúsculas]';
  } else if(sMode==='historia'){
    modoInstruccion='\n\nMODO HISTORIA: BLOQUE C sigue el arco TRABAJADOR (prompt1) → CRISIS (prompt2) → HERRAMIENTA (prompt3) → OBJETO SIMBÓLICO (prompt4) → ALPHA EN MOVIMIENTO (prompt5). Después del prompt 5, incluye: SUBTÍTULO PANTALLA: [frase de cierre máximo 10 palabras en mayúsculas].';
  }

  var msg;
  if(sMode==='impacto'){
    // El SP de impacto ya contiene todas las instrucciones de formato, arquetipos y bloques.
    // Solo se añaden los datos del episodio para no duplicar instrucciones y confundir al modelo.
    msg=SP+'\\n\\n---\\n\\nDATOS DEL EPISODIO:\\nPILAR: '+(tO?tO.label+' — '+tO.desc:'Independencia Financiera')+'\\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' — '+(hi[sH]||hi.dato)+'\\nCONCEPTO: '+topic+'\\n\\nAhora genera los 3 bloques exactamente como se indica arriba.';
  } else {
    var numPrompts='5 prompts de imagen';
    msg=SP+'\\n\\n---\\n\\nGenera un episodio COMPLETO:\\nPILAR: '+(tO?tO.label+' - '+tO.desc:'Independencia Financiera')+'\\nDURACION: '+(dO?dO.label:'60 segundos')+'\\nGANCHO: '+(hO?hO.label:'Dato Crudo')+' - '+(hi[sH]||hi.dato)+'\\nCONCEPTO: '+topic+'\\n\\n'+identidad+modoInstruccion+'\\n\\nRecuerda: BLOQUE A es solo texto hablado sin prompts. BLOQUE C son los '+numPrompts+'. BLOQUE F es el guion en ingles sin prompts.';
  }
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
    console.log('=== RAW API RESPONSE ===\n'+txt+'\n=== END RAW ===');
    var p=parseBlocks(txt);
    console.log('=== PARSED ===','posC encontrado:'+(txt.indexOf('BLOQUE C')),'prompts:',p.c.length,'subtitulo:',p.subtitulo);
    if(!p.a||p.a.length<20)throw new Error('No se pudo leer el guion ES. Intenta de nuevo.');
    // Si no hay prompts, mostrar el raw para diagnóstico
    if(!p.c||p.c.length===0){
      var debugMsg='Sin prompts. Respuesta del modelo (primeros 800 chars):\n\n'+txt.slice(0,800);
      throw new Error(debugMsg);
    }
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
  // Extract SUBTÍTULO PANTALLA if present in cRaw
  var subtitulo='';
  if(cRaw){
    var subMatch=cRaw.match(/SUBTÍTULO\s*PANTALLA\s*[:\-]\s*(.+)/i);
    if(subMatch) subtitulo=subMatch[1].replace(/[`*]/g,'').trim();
    // Also remove subtítulo line from last prompt if it leaked in
    if(prompts.length>0&&/SUBTÍTULO\s*PANTALLA/i.test(prompts[prompts.length-1])){
      prompts[prompts.length-1]=prompts[prompts.length-1].replace(/SUBTÍTULO\s*PANTALLA[:\-][^]*/i,'').trim();
      if(prompts[prompts.length-1].length<10)prompts.pop();
    }
  }
  return{a:cleanG(aRaw),f:cleanG(fRaw),c:prompts,cRaw:cRaw,subtitulo:subtitulo};
}

// RENDER
function renderOut(r){
  var col=(r.tO&&r.tO.c)?r.tO.c:'#b8975a';
  document.getElementById('otag').style.color=col;
  var modoLabel=r.modo==='impacto'?'⚡ IMPACTO':r.modo==='historia'?'📖 HISTORIA':'🎬 REEL';
  document.getElementById('otag').textContent='✓ '+modoLabel+' · '+(r.dO?r.dO.label:'')+' · '+(r.tO?r.tO.label:'')+' · '+(r.hO?r.hO.label:'');
  document.getElementById('oconcept').textContent='"'+(r.topic.length>70?r.topic.slice(0,70)+'...':r.topic)+'"';
  // Show subtítulo en pantalla si existe
  var subEl=document.getElementById('osubtitulo');
  if(!subEl){
    subEl=document.createElement('div');subEl.id='osubtitulo';
    subEl.style.cssText='margin-top:8px;background:#1a1500;border:1.5px solid #d4f000;border-radius:8px;padding:9px 14px;font-size:13px;font-weight:700;color:#d4f000;letter-spacing:.04em;display:none';
    var ocEl=document.getElementById('oconcept');
    if(ocEl&&ocEl.parentNode)ocEl.parentNode.insertBefore(subEl,ocEl.nextSibling);
  }
  if(r.subtitulo){
    subEl.textContent='📺 SUBTÍTULO EN PANTALLA: '+r.subtitulo;
    subEl.style.display='block';
  }else{
    subEl.style.display='none';
  }
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

async function loadRefs(){
  // 4 referencias FIJAS del personaje -- siempre las mismas, para maxima consistencia de rostro/cuerpo
  var REFS=[
    'https://i.ibb.co/RGgryDhy/Cu-nto-tiempo-m-s-vas-a-imagen-5.png',
    'https://i.ibb.co/fzZF6dsK/Prefiero-intentarlo-mil-v-imagen-7.png',
    'https://i.ibb.co/chTyj7RC/La-diferencia-entre-traba-imagen-2.png',
    'https://i.ibb.co/mFtmDw1N/Recorr-este-camino-solo-imagen-4.png'
  ];
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
    genOneImage('9:16 vertical portrait format, tall image not square. '+p,imgRefs).then(function(s){
      imgs[iidx]={src:s,idx:iidx+1};setSlotOk(slot,s,iidx);cost+=0.068;updCost();chkExport();
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

// Extrae el base64 puro (sin el prefijo data:image/...;base64,) de un data URL
function dataUrlToB64(dataUrl){
  if(!dataUrl)return null;
  var idx=dataUrl.indexOf(',');
  return idx>-1?dataUrl.slice(idx+1):dataUrl;
}

async function genImages(){
  if(!lastRes||!lastRes.c||!lastRes.c.length){alert('No hay prompts. Regenera el episodio.');return;}
  // Modo Impacto: 2 prompts. Resto: completar hasta 5 si faltan.
  if(lastRes.modo!=='impacto'){
    while(lastRes.c.length<5){lastRes.c.push(lastRes.c[lastRes.c.length-1]);}
  }
  var btn=document.getElementById('bimg');
  var st=document.getElementById('ist');
  var grid=document.getElementById('igrid');
  var er=document.getElementById('ie');
  btn.textContent='...';btn.style.opacity='.6';btn.disabled=true;
  st.style.display='block';grid.innerHTML='';er.style.display='none';
  vids=[];vidState=[];vidErrMsg=[];
  st.textContent='Cargando referencias del personaje...';
  imgRefs=await loadRefs();
  imgs=[];
  var totalImgs=Math.min(lastRes.c.length,5);
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
      body:JSON.stringify({imageBase64:imgInfo.b64,prompt:movePrompt}),
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
        body:JSON.stringify({operationName:startData.operationName}),
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
    cost+=0.40;updCost();chkExport(); // Veo 3.1 Lite: $0.05/seg x 8 seg = $0.40 por clip
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
    +'WEATHER AND ENVIRONMENT (strict): if the scene shows rain, snow, or any weather outside a window or in the background, that weather effect stays OUTSIDE. It must NEVER bleed, extend, or appear inside the indoor space where the character is. Interior spaces remain completely dry, clean, and unaffected by any exterior weather at all times.\n\n'
    +'MANDATORY ACTION FOR THIS CLIP (this single action drives the body, hands, and gaze direction for the ENTIRE clip): '+base+'\n\n'
    +'EYE LINE AND BODY DIRECTION (strict, this is not optional): the character looks at and engages with WHATEVER THE ACTION DESCRIBES -- the document being signed, the paper being written on, the whiteboard being drawn on. The character does NOT look at the camera, does NOT pose for the camera, does NOT turn the head toward the viewer, UNLESS the action explicitly says the character is speaking directly to camera. There is no head tilting, no modeling pose, no fashion-style head turn, no posing of any kind -- only the working posture that the action requires.\n\n'
    +'This is not a static pose and not a frozen stance with arms crossed -- the character is actively, physically DOING the described action with continuous natural motion for the full duration of the clip. A slow zoom toward a motionless or posing character is NOT acceptable.\n\n'
    +'Match the action type to natural physical motion: '
    +'if signing or writing on paper -- head and eyes are down toward the page, hand and pen move continuously across the page with deliberate natural strokes; '
    +'if writing or pointing on a whiteboard -- body is angled toward the whiteboard, arm and hand move actively, tracing real legible numbers, charts, or words, never static, never paused; '
    +'if speaking to camera -- this is the ONLY case where the character faces the viewer; natural confident hand gestures accompany the speech, mouth and expression are animated as if talking; '
    +'if walking or reviewing documents -- eyes and attention stay on the path or the documents, continuous realistic body and hand movement throughout. '
    +'The motion must feel grounded, purposeful, and continuous from the first frame to the last -- never random, never exaggerated, never reduced to just camera movement or a held pose.\n\n'
    +'FACIAL EXPRESSION ONLY (this controls the face, never the body posture or head direction, which are governed entirely by the action above): serious, focused, professional, concentrated on the task at hand. '
    +'NEVER sad, NEVER frowning, NEVER a long or droopy face, NEVER distorted or asymmetrical eyes, NEVER a flirtatious or seductive look, NEVER a modeling or beauty-pageant expression. '
    +'Expression stays consistent and composed throughout the clip. Natural subtle blinking only.\n\n'
    +'IF WRITING OR DRAWING ON A WHITEBOARD OR PAPER IS VISIBLE: every stroke must have clear visible purpose -- '
    +'single digits (1, 5, 10, 100), short words (PLAN, META, ROI, ACTIVO), simple arrows pointing somewhere, '
    +'straight lines connecting two labeled points, or basic bar/line chart shapes. '
    +'Strokes are slow, deliberate, and directional -- never random, never circular scribbles, never meaningless zigzag lines. '
    +'The hand moves with intention, as if writing something the character means to communicate. '
    +'Complexity is NOT required -- a single number written clearly is better than a complex formula written messily.\n\n'
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
