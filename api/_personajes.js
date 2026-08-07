// api/_personajes.js — EL REPARTO DE LEGADO DE HIERRO.
//
// El archivo empieza por "_" a proposito: Vercel no lo despliega como funcion,
// es solo un modulo que carga api/refs.js.
//
// POR QUE EXISTE ESTO. Hasta ahora el canal tenia UN personaje y el prompt
// prohibia expresamente inventar otros, asi que todos los reels eran el mismo
// hombre solo, en escenas sueltas. Eso es una de las razones de que todo
// pareciera lo mismo: sin nadie mas en el cuadro no hay conflicto, no hay
// dialogo y no hay historia — solo un senor pensando.
//
// Estos 31 son gente que de verdad aparece en la vida de alguien que intenta
// salir adelante: su familia, su trabajo, sus clientes, sus espejos. El director
// elige en cada guion quien encaja (o nadie, si el guion es de el solo).
//
// COMO SE DESCRIBEN. El campo `fisico` va directo al generador de imagenes, asi
// que tiene que ser concreto y repetible: edad, pelo, cara, complexion. Sin eso
// el mismo personaje sale distinto cada vez. El campo `encaja` es para el
// DIRECTOR: le dice cuando tiene sentido llamar a este personaje.
//
// Todos son latinoamericanos y del mundo real: nada de fantasia, futurismo ni
// oficios inventados. El estilo (comic 2D) lo pone el generador, no la ficha.

const REPARTO = [
  // ---------- FAMILIA Y ENTORNO INTIMO ----------
  {
    id: 'companera', nombre: 'La compañera', rol: 'Su pareja', edad: '33 anos',
    // Esta descripcion va con sus fotos ancla (public/biblia/companera-*.jpg): son
    // la misma mujer. El texto solo no bastaba — daba "una rubia", no ESTA.
    fisico: 'mujer de 33 anos, muy guapa, cabello rubio dorado largo y ondulado por debajo de los hombros (a veces recogido en mono alto con mechones sueltos), rostro de rasgos finos y pomulos marcados, ojos verde grisaceo grandes, cejas oscuras definidas, labios llenos, piel calida, complexion alta y esbelta',
    vestuario: 'en casa, vestido camisero corto de punto rosa palo con botones y cordon a la cintura; fuera, jersey crema de cuello redondo con pantalon beige de vestir; collar fino con colgante redondo',
    habla: 'directa pero sin gritar; pregunta lo que nadie mas se atreve',
    encaja: 'cuando el guion habla del precio que paga la familia, de la duda, del apoyo o de la conversacion dificil en casa',
  },
  {
    id: 'hijo-pequeno', nombre: 'El hijo pequeno', rol: 'Su hijo', edad: '7 anos',
    fisico: 'nino latino de 7 anos, cabello negro corto y algo despeinado, cara redonda, ojos oscuros grandes, delgado',
    vestuario: 'camiseta sencilla y pantalon corto; uniforme escolar en escenas de manana',
    habla: 'pocas palabras, preguntas que dan en el blanco sin querer',
    encaja: 'cuando el guion habla del para que, del tiempo que no vuelve, del ejemplo que se deja',
  },
  {
    id: 'hija-adolescente', nombre: 'La hija adolescente', rol: 'Su hija', edad: '15 anos',
    fisico: 'adolescente latina de 15 anos, cabello negro largo y liso recogido en cola, rostro delgado, mirada observadora',
    vestuario: 'sudadera y jeans; mochila del colegio',
    habla: 'ironica, corta, ve mas de lo que dice',
    encaja: 'cuando el guion habla de lo que los hijos observan, del respeto que se gana o se pierde, del legado',
  },
  {
    id: 'padre-mayor', nombre: 'El padre', rol: 'Su padre', edad: '68 anos',
    fisico: 'hombre latino de 68 anos, cabello blanco corto, bigote canoso, rostro curtido con arrugas marcadas, espalda algo encorvada, manos grandes y gastadas',
    vestuario: 'camisa de trabajo desteñida, pantalon de tela, sueter viejo',
    habla: 'lento, resignado, con orgullo de haber cumplido aunque no le alcanzara',
    encaja: 'cuando el guion habla de trabajar 40 anos para otro, de la jubilacion que no alcanza, del ciclo que se repite entre generaciones',
  },
  {
    id: 'madre', nombre: 'La madre', rol: 'Su madre', edad: '64 anos',
    fisico: 'mujer latina de 64 anos, cabello canoso recogido, rostro amable con arrugas de expresion, complexion menuda, manos trabajadas',
    vestuario: 'blusa sencilla y delantal en casa',
    habla: 'poco y bajito; se le nota lo que calla',
    encaja: 'cuando el guion habla del sacrificio silencioso, de lo que costo llegar hasta aqui, de la deuda con quien te crio',
  },
  {
    id: 'hermano-menor', nombre: 'El hermano menor', rol: 'Su hermano', edad: '26 anos',
    fisico: 'hombre latino de 26 anos, cabello negro con corte moderno, sin barba o con barba muy corta, complexion delgada, parecido de rasgos al protagonista pero mas joven',
    vestuario: 'ropa urbana casual, sudadera, tenis',
    habla: 'inseguro, busca aprobacion, todavia no sabe que quiere',
    encaja: 'cuando el guion habla de a quien arrastras contigo, del ejemplo hacia abajo, de empezar tarde o temprano',
  },

  // ---------- EL TRABAJO DE OTRO ----------
  {
    id: 'jefe', nombre: 'El jefe', rol: 'Su superior en el empleo', edad: '52 anos',
    fisico: 'hombre latino de 52 anos, cabello oscuro con entradas y canas en las sienes, rostro ancho, complexion robusta, gafas de montura fina',
    vestuario: 'camisa formal remangada, corbata floja, reloj visible',
    habla: 'cordial y firme; no es cruel, simplemente manda',
    encaja: 'cuando el guion habla del techo del empleo, de quien decide tu tiempo, de pedir permiso para vivir. NUNCA como villano',
  },
  {
    id: 'companero-resignado', nombre: 'El companero resignado', rol: 'Colega de trabajo', edad: '45 anos',
    fisico: 'hombre latino de 45 anos, cabello ralo peinado a un lado, rostro cansado con ojeras, complexion con algo de sobrepeso, hombros caidos',
    vestuario: 'camisa de oficina algo arrugada, credencial colgada al cuello',
    habla: 'bromea para no pensar; dice "ya para que" muy seguido',
    encaja: 'cuando el guion habla de acomodarse, del espejo de quedarse, de los anos que pasan en la misma silla',
  },
  {
    id: 'companero-inquieto', nombre: 'La companera que quiere salir', rol: 'Colega de trabajo', edad: '31 anos',
    fisico: 'mujer latina de 31 anos, cabello castano recogido en cola alta, rostro despierto de rasgos finos, complexion delgada, mirada atenta',
    vestuario: 'blusa sencilla, pantalon de vestir, mochila',
    habla: 'pregunta mucho, apunta cosas, tiene prisa',
    encaja: 'cuando el guion habla de quien si escucha, de contagiar, de los dos caminos que se separan',
  },
  {
    id: 'vigilante', nombre: 'El vigilante', rol: 'Seguridad del edificio', edad: '58 anos',
    fisico: 'hombre latino de 58 anos, cabello corto canoso, bigote, complexion gruesa, rostro tranquilo',
    vestuario: 'uniforme de seguridad azul oscuro, radio en el cinturon',
    habla: 'saluda siempre igual, lleva 20 anos en la misma puerta',
    encaja: 'cuando el guion habla del tiempo que se va sin darse cuenta, de los invisibles, de la rutina que no cambia nunca',
  },
  {
    id: 'gerente-joven', nombre: 'El gerente joven', rol: 'Mando intermedio', edad: '29 anos',
    fisico: 'hombre latino de 29 anos, cabello oscuro engominado, afeitado, complexion delgada, postura tensa',
    vestuario: 'traje ajustado moderno, camisa blanca',
    habla: 'seguro por fuera, inseguro por dentro; repite frases de manual',
    encaja: 'cuando el guion habla del titulo que no da autoridad, de aparentar, de subir rapido sin base',
  },

  // ---------- EL NEGOCIO PROPIO ----------
  {
    id: 'primer-cliente', nombre: 'La primera clienta', rol: 'Quien le dio el primer si', edad: '47 anos',
    fisico: 'mujer latina de 47 anos, cabello oscuro corto con mechas grises, rostro de rasgos firmes, gafas finas, complexion media, gesto evaluador',
    vestuario: 'blusa de vestir y blazer ligero',
    habla: 'pocas palabras, decide rapido',
    encaja: 'cuando el guion habla del primer ingreso propio, de la primera prueba de que funciona, de arrancar',
  },
  {
    id: 'cliente-dificil', nombre: 'El cliente que regatea', rol: 'Cliente exigente', edad: '55 anos',
    fisico: 'hombre latino de 55 anos, calvicie avanzada, rostro ancho, complexion corpulenta, ceno fruncido',
    vestuario: 'guayabera o camisa holgada, reloj llamativo',
    habla: 'todo le parece caro, presiona por costumbre',
    encaja: 'cuando el guion habla de poner precio, de aprender a decir que no, de valorar el propio trabajo',
  },
  {
    id: 'socio', nombre: 'El socio', rol: 'Su socio en el negocio', edad: '38 anos',
    fisico: 'hombre latino de 38 anos, cabello castano ondulado corto, barba media cuidada, complexion fuerte, sonrisa facil',
    vestuario: 'camisa remangada, pantalon de vestir',
    habla: 'entusiasta, arriesga mas de la cuenta',
    encaja: 'cuando el guion habla de confiar en alguien, de repartir, del conflicto entre dos que construyen lo mismo',
  },
  {
    id: 'primer-empleado', nombre: 'El primer empleado', rol: 'Su primera contratacion', edad: '24 anos',
    fisico: 'joven latino de 24 anos, cabello negro rizado corto, rostro juvenil, complexion delgada, actitud atenta',
    vestuario: 'polo sencillo, pantalon de trabajo',
    habla: 'agradecido, pregunta todo, quiere hacerlo bien',
    encaja: 'cuando el guion habla de dar trabajo, de la responsabilidad sobre otro, de dejar de ser el que hace todo',
  },
  {
    id: 'proveedor', nombre: 'El proveedor', rol: 'Quien le surte', edad: '50 anos',
    fisico: 'hombre latino de 50 anos, cabello corto oscuro con canas, bigote espeso, complexion robusta, manos anchas',
    vestuario: 'camisa de trabajo con logo, gorra',
    habla: 'de trato rapido, cumple o no cumple',
    encaja: 'cuando el guion habla de la cadena de la que dependes, de los acuerdos, de cumplir la palabra',
  },
  {
    id: 'competidor', nombre: 'El competidor', rol: 'Quien vende lo mismo', edad: '41 anos',
    fisico: 'hombre latino de 41 anos, cabello oscuro peinado hacia atras, afeitado, complexion atletica, mirada calculadora',
    vestuario: 'traje moderno bien cortado, sin corbata',
    habla: 'cordial en publico, competitivo en privado',
    encaja: 'cuando el guion habla del mercado, de diferenciarse, de que siempre habra alguien haciendo lo mismo',
  },
  {
    id: 'banquero', nombre: 'La del banco', rol: 'Ejecutiva de credito', edad: '43 anos',
    fisico: 'mujer latina de 43 anos, cabello negro liso recogido en mono, rostro serio de rasgos definidos, gafas rectangulares, complexion delgada',
    vestuario: 'blazer oscuro, blusa clara, credencial del banco',
    habla: 'formal, cifras en la mano, sin margen',
    encaja: 'cuando el guion habla de deuda, de credito, de que el sistema no te presta cuando lo necesitas sino cuando ya no',
  },
  {
    id: 'contador', nombre: 'La contadora', rol: 'Quien lleva sus numeros', edad: '56 anos',
    fisico: 'mujer latina de 56 anos, cabello canoso corto y liso, gafas gruesas de montura oscura, rostro delgado, complexion menuda',
    vestuario: 'blusa clara, chaqueta de punto, boligrafo en la mano',
    habla: 'preciso, sin adornos, dice la verdad de los numeros',
    encaja: 'cuando el guion habla de saber cuanto ganas de verdad, de ordenar las cuentas, del autoengano financiero',
  },
  {
    id: 'inversionista', nombre: 'El inversionista', rol: 'Quien pone capital', edad: '60 anos',
    fisico: 'hombre latino de 60 anos, cabello plateado peinado hacia atras, barba blanca muy corta, complexion delgada y erguida, mirada penetrante',
    vestuario: 'traje azul oscuro impecable, sin corbata, reloj sobrio',
    habla: 'pausado, pregunta poco pero certero',
    encaja: 'cuando el guion habla de escalar, de convencer a alguien con dinero, de que te midan de verdad',
  },

  // ---------- ESPEJOS Y MENTORES ----------
  {
    id: 'mentor', nombre: 'El mentor', rol: 'El que ya lo logro', edad: '65 anos',
    fisico: 'hombre latino de 65 anos, cabello blanco corto, barba blanca recortada, rostro sereno con arrugas profundas, complexion solida, porte tranquilo',
    vestuario: 'camisa de lino, chaqueta sencilla; nada ostentoso',
    habla: 'habla poco, cada frase pesa; nunca da la respuesta completa',
    encaja: 'cuando el guion habla de aprender de quien ya paso por ahi, de la paciencia, de la diferencia entre saber y entender',
  },
  {
    id: 'amigo-que-no-cambio', nombre: 'El amigo que no cambio', rol: 'Amigo de siempre', edad: '36 anos',
    fisico: 'hombre latino de 36 anos, cabello descuidado, barba de varios dias, complexion con sobrepeso ligero, gesto relajado',
    vestuario: 'camiseta holgada, chanclas o tenis viejos',
    habla: 'se rie de todo, minimiza, invita a dejarlo para manana',
    encaja: 'cuando el guion habla del espejo de lo que pudiste ser, de la gente que te frena sin querer, del precio de la comodidad',
  },
  {
    id: 'el-que-quebro', nombre: 'El que quebro', rol: 'Intento y perdio', edad: '48 anos',
    fisico: 'hombre latino de 48 anos, cabello oscuro despeinado con canas, ojeras marcadas, complexion delgada, hombros hundidos',
    vestuario: 'camisa de vestir vieja sin planchar, sin corbata',
    habla: 'honesto y duro consigo mismo; avisa de lo que el hizo mal',
    encaja: 'cuando el guion habla del riesgo real, de aprender del fracaso ajeno, de que no todo el que lo intenta gana',
  },
  {
    id: 'vecino-aparenta', nombre: 'El vecino que aparenta', rol: 'Vecino', edad: '39 anos',
    fisico: 'hombre latino de 39 anos, cabello negro con corte de moda, barba perfilada, complexion cuidada, sonrisa de foto',
    vestuario: 'ropa de marca visible, gafas de sol, cadena al cuello',
    habla: 'presume sin que le pregunten',
    encaja: 'cuando el guion habla de aparentar, de la deuda disfrazada de exito, de comparar tu vida con la fachada de otro',
  },
  {
    id: 'el-que-se-fue', nombre: 'El que se fue del pais', rol: 'Amigo emigrado', edad: '34 anos',
    fisico: 'hombre latino de 34 anos, cabello corto oscuro, barba corta, complexion normal, expresion de cansancio contenido',
    vestuario: 'chaqueta de invierno, gorro de lana',
    habla: 'cuenta lo bueno, calla lo dificil',
    encaja: 'cuando el guion habla de irse o quedarse, de empezar de cero en otro sitio, de lo que se deja atras',
  },

  // ---------- LA CALLE Y EL OFICIO ----------
  {
    id: 'comerciante', nombre: 'El comerciante del mercado', rol: 'Duenno de un puesto', edad: '54 anos',
    fisico: 'hombre latino de 54 anos, cabello oscuro con canas bajo una gorra, bigote, complexion fuerte, brazos gruesos, piel curtida',
    vestuario: 'delantal sobre camisa a cuadros, gorra',
    habla: 'rapido, calcula de cabeza, conoce a todos por su nombre',
    encaja: 'cuando el guion habla del negocio de verdad, del que lleva 30 anos vendiendo, de la escuela de la calle',
  },
  {
    id: 'taxista', nombre: 'El taxista', rol: 'Conductor', edad: '46 anos',
    fisico: 'hombre latino de 46 anos, cabello corto oscuro, barba rala, complexion media, brazo apoyado en la ventanilla',
    vestuario: 'camisa de manga corta, gafas de sol en la cabeza',
    habla: 'conversador, filosofa mientras maneja',
    encaja: 'cuando el guion habla de las horas que se cambian por dinero, del trabajo sin techo, de la conversacion que te cambia el dia',
  },
  {
    id: 'obrero', nombre: 'El obrero', rol: 'Trabajador de obra', edad: '40 anos',
    fisico: 'hombre latino de 40 anos, cabello negro corto bajo el casco, rostro bronceado, complexion fuerte, manos callosas',
    vestuario: 'casco, chaleco reflectante, botas',
    habla: 'directo, sin rodeos, orgulloso de su oficio',
    encaja: 'cuando el guion habla del esfuerzo fisico, de construir con las manos, de lo que cuesta cada peso. NO como escena generica: solo si el guion lo pide',
  },
  {
    id: 'vendedor-ambulante', nombre: 'El vendedor ambulante', rol: 'Vende en la calle', edad: '30 anos',
    fisico: 'hombre latino de 30 anos, cabello negro corto, delgado, piel bronceada por el sol, mirada rapida',
    vestuario: 'camiseta, rinonera, caja o bandeja de mercancia',
    habla: 'insiste con simpatia, no se rinde',
    encaja: 'cuando el guion habla de empezar sin nada, de la constancia diaria, de que vender se aprende vendiendo',
  },
  {
    id: 'emprendedora', nombre: 'La emprendedora', rol: 'Monto lo suyo', edad: '35 anos',
    fisico: 'mujer latina de 35 anos, cabello negro rizado recogido, rostro decidido de rasgos marcados, complexion media, postura firme',
    vestuario: 'blusa sencilla y delantal de trabajo o blazer, segun la escena',
    habla: 'practica, cero drama, resuelve',
    encaja: 'cuando el guion habla de que no hay excusas, de montar algo desde la cocina o el garaje, de crecer despacio y firme',
  },
  {
    id: 'aprendiz', nombre: 'La joven que empieza', rol: 'A quien ahora ensena', edad: '20 anos',
    fisico: 'joven latina de 20 anos, cabello negro largo recogido, rostro juvenil sin maquillaje, complexion delgada, mirada atenta',
    vestuario: 'camiseta sencilla, mochila, libreta en la mano',
    habla: 'escucha mas de lo que habla, apunta todo',
    encaja: 'cuando el guion habla de ensenar lo aprendido, de cerrar el ciclo, de en quien te conviertes cuando ya llegaste',
  },
];

module.exports = { REPARTO };
