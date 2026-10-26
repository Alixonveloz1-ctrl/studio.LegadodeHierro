# Dirección monetizable · octubre de 2026

Objetivo del canal, sin garantía de viralidad ni de ingresos: que la herramienta genere
motivación financiera general que funcione para personas que nunca vieron el canal,
que se quede hasta el final, que se pueda guardar o compartir, y que después se
pueda medir en el panel de Facebook.

## Corrección importante

En la revisión de octubre de 2026 se había dicho, por error, que ningún video se
acercaba a las 500.000 vistas. La captura de la cuadrícula de Reels del usuario lo
corrige: el reel del 13 de abril, con el hombre de traje señalando el reloj, marca
480.610 vistas en la cuadrícula, con 20.634 likes, 403 compartidos y 1.282 guardados
en la vista del reel. Ese video es la referencia principal de alcance, no un video
de agosto a octubre.

Otros conteos públicos visibles en esa misma cuadrícula, para comparar, fueron
119.015, 97.472, 24.478, 11.828, 5.439, 3.898 y 1.518 vistas. La biblioteca del panel
y la cuadrícula pública no siempre ordenan igual; por eso el panel debe revisarse
directamente y no se debe dar por cerrado un ranking con una sola vista.

## Qué funcionó en el canal

- Un reto con horizonte comprensible y una decisión personal, con una imagen
  reconocible: el hombre de traje, la oficina de noche y el reloj.
- Temas de motivación financiera general: dinero, libertad financiera, capital,
  construir un sistema o un imperio, el precio de la riqueza y de la libertad,
  disciplina y ejecución, deuda y activo, y vender un servicio que alguien quiera
  pagar hoy.
- Videos que llegaron sobre todo a personas que no seguían la página, casi todo
  por Reels, en marzo y abril.
- Piezas largas con una práctica o un sistema que se puede repetir y guardar,
  no solo una frase para escuchar una vez.
- Historias con una transformación observable: un antes y un después, no solo
  un hombre hablando en una sola escena.

## Qué dejó de funcionar

- Videos cortos y repetidos de agosto a octubre, casi todos con la misma lección
  sobre sueldo, quincena, disciplina y sistemas, sin una decisión nueva ni un
  cambio visible.
- Publicar 31 veces en agosto y después casi parar en septiembre y octubre.
- Temas de pitch de un negocio específico que no conectaron como la motivación
  financiera general, salvo que el encargo los pida expresamente con datos.
- Cierres que solo dicen “únete”, sin una acción útil hoy ni una pregunta sobre
  una decisión real.

## Qué debe generar ahora la herramienta

1. **Para personas nuevas:** la primera escena o utilidad en las primeras dos
   frases, entendible sin conocer el canal.
2. **Una sola promesa, cumplida dentro del video:** un cálculo, unos pasos, un
   antes y después, o una historia con consecuencia observable.
3. **Progresión real:** cada tramo añade una decisión, una demostración o una
   consecuencia nueva, y un cambio visible de acción, objeto o lugar. Nunca una
   sola escena estática durante todo el video.
4. **Retención:** en piezas largas, algo nuevo cada 30 a 45 segundos. En piezas
   cortas, entregar utilidad antes del cierre, no guardarla para el final.
5. **Cierre que se puede usar:** una acción útil hoy y, si hay pregunta, que sea
   sobre una decisión real del espectador, en sus palabras.
6. **Cierre comercial, cuando el encargo lo pida:** pedir comentar una palabra,
   seguir, compartir, suscribirse o pedir información de una asesoría, comunidad
   o producto real. La oferta debe existir y entregarse: qué es, para quién, qué
   recibe y cómo pedirla. Sin esos datos del usuario, la herramienta no inventa
   precio, cupos, testimonios ni resultados.
7. **Sistema, no un video suelto:** Reels cortos para llegar a personas nuevas,
   piezas largas para sostener la vista y generar vistas aptas, y cierre comercial
   para convertir esa atención en ingresos reales.
8. **Identidad visual:** continuidad dentro de cada video (mismo protagonista,
   vestuario y mundo en ese video), pero con acciones distintas en cada tramo.
   El protagonista puede cambiar de un video a otro: la biblia de personajes es
   opcional, no obligatoria, y ya no incluye menores.

## Qué no debe hacer la herramienta

- Prometer asesorías, regalos, enlaces o estabilidad económica en un plazo que
  no existen. La prohibición anterior de pedir una palabra clave o de ofrecer
  una asesoría quedó quitada el 26 de octubre de 2026 por decisión del usuario:
  lo que sigue prohibido es prometer algo que no existe o no se va a entregar.
- Prometer riqueza, viralidad o monetización.
- Inventar vivencias del autor, clientes, testimonios, estadísticas o resultados.
- Convertir todos los temas en el mismo sermón sobre sueldo y quincena.
- Copiar frases, personajes, cifras o la secuencia literal de otro video.
- Obligar a usar siempre al mismo protagonista ni a la biblia completa de
  personajes en todos los videos.

## Cambio de cuenta de Google Cloud (pendiente, no hecho todavía)

La herramienta no tiene cuentas ni proyectos escritos en el código: todo llega
por variables de entorno en Vercel. Cuando se cambie a la cuenta nueva con
créditos, hay que cambiar solo esas variables y reinstalar el ensamblador de
Cloud Run en la cuenta nueva; no hace falta reescribir el código. Las variables
son, por nombre: `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT`, `GCS_OUTPUT_BUCKET`,
`CLOUD_RUN_UNIFY_URL` y `UNIFY_KEY`, más las que ya usaba la herramienta para
modelos y sesión. Antes de cambiar, hay que decidir qué pasa con la biblioteca
que vive en el bucket viejo: si no se copia, las tomas y personajes guardados
allí no aparecen en el bucket nuevo. El protagonista y la compañera sí se pueden
volver a sembrar, porque sus imágenes están en `public/biblia/` y en el código.
No se cambia la cuenta en este paso; queda lista para cuando el usuario lo pida.

## Cómo medir si está funcionando

Revisar en el panel, después de publicar, no en el guion: vistas, reproducciones
de 3 segundos y de 1 minuto, tiempo promedio, compartidos, guardados, comentarios
y seguidores nuevos. Un video con muchas vistas rápidas pero poco tiempo de vista
no es lo mismo que un video que retiene y se guarda. Si los compartidos y los
guardados siguen en uno o dos por video, el problema sigue siendo el contenido,
aunque las vistas suban un poco.

Esta dirección está implementada en `public/studio-core.js` (base del canal,
referencia del reto y dirección monetizable) y en la revisión de
`server/_editorial.js` (gancho, progresión, concreción y cierre). No incluye
cifras privadas del panel de monetización.
