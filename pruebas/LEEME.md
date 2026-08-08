# Pruebas

Comprueban lo que ya se rompio alguna vez, para que no vuelva a romperse.

## Como correrlas

Las que abren un navegador necesitan el servidor de prueba, que sirve `public/`
y finge las respuestas del API (no gasta ni un credito):

    node pruebas/servidor-de-prueba.js &
    node pruebas/check-memoria.js
    node pruebas/check-seguridad-y-fugas.js
    node pruebas/check-zip-dos-idiomas.js

La de subtitulos NO necesita el servidor, pero si `ffmpeg` y `ffprobe`:

    node pruebas/check-subtitulos-ffmpeg.js

## Que cubre cada una

- **check-memoria.js** — que el guion nuevo reciba los ganchos, cierres y
  conceptos de los anteriores, y que las puertas de entrada no se repitan.
- **check-seguridad-y-fugas.js** — que sin APP_KEY la API quede CERRADA en
  produccion, y que regenerar una imagen suelte el clip viejo.
- **check-zip-dos-idiomas.js** — que el ZIP lleve los dos videos finales, que
  las imagenes y clips no se dupliquen, y que no se cuele el video de otro reel.
- **check-coherencia-modos.js** — que TODAS las reglas que dependen del modo
  conozcan los modos nuevos, no solo la que se toco al implementarlos. Nacio de
  un fallo real: el numero de imagenes se calculaba en tres sitios y al anadir
  los largos se actualizo uno.
- **check-modos-largos.js** — Profesor y Relato: que las duraciones cambien con
  el modo, que el profesor pida SET + TOMAS + EJEMPLOS + MONTAJE, y que el
  montaje reutilice las tomas (9 planos de 8 imagenes).
- **check-biblia-cola.js** — que las vistas se generen UNA POR UNA y en cola (no
  las cuatro de golpe, que reventaba el limite de tiempo y el de Vertex), y que
  cada vista use como referencia las ya guardadas para que la cara no cambie.
- **check-biblia-vista-previa.js** — que se pueda elegir el modelo dentro de la
  biblia y VER las vistas generadas, con un boton por vista para rehacer solo la
  que salio mal.
- **check-reparto.js** — que los 31 personajes esten completos, que el director
  los reciba y que la marca [CON: id] traiga la cara correcta a la imagen.
- **check-sincronia-subtitulos.js** — que los subtitulos del audio SUBIDO A MANO
  vayan al ritmo de la voz: se ajustan al tramo de voz medido en el propio
  archivo, en vez de repartir el tiempo a una velocidad de habla inventada.
- **check-escucha-por-idioma.js** — que la escucha previa suene en el idioma
  elegido, con una entrada de cache por idioma.
- **check-subtitulos-ffmpeg.js** — que los subtitulos SE PINTEN de verdad
  (se mide el brillo del fotograma, no los bytes del fichero: un reencode ya
  cambia los bytes aunque no dibuje nada, y asi se colo un falso positivo).

## Antes de desplegar

    bash comprobar.sh

Sintaxis, JSON, funciones que se llaman pero no existen, ids huerfanos y que el
index.js embebido en los instaladores de Cloud Run siga al dia.
- **check-version-montaje.js** — que la herramienta diga SOLA si el Cloud Run
  esta al dia o le falta la ultima actualizacion. Levanta sus propios servidores
  (8331 y 8332), no necesita el de siempre.
- **check-biblia-ancla.js** — no abre navegador: llama al endpoint real con el
  bucket y Vertex simulados. Comprueba que las 4 fotos de marca del insignia
  viajan SIEMPRE como referencia y que guardar una vista nueva no las borra
  (nacio de ahi: se borraban, y el protagonista salia siendo otro hombre).
- **check-biblia-ritmo.js** — que la biblia vaya a la MISMA cadencia que los
  reels (60 s de margen en el servidor, 10 s de pausa), que una vista que falla
  se reintente esperando en vez de saltarse, y que la tanda pare en vez de
  repartir huecos por toda la biblia.
- **check-guion-largo.js** — que el guion de los modos largos quepa (tope de
  salida), que una respuesta 200 pero inservible se reintente en vez de darse
  por buena, que haya reloj para no pasarse de los 60 s de Vercel, y que el
  aviso de error diga POR QUE fallo.
- **check-ingles-completo.js** — que el ingles sea EL MISMO video que el espanol:
  traduccion completa, mismas frases y mismo orden, con palabras de Estados
  Unidos pero sin resumir. Y que si viene corto se reclame en vez de colarlo.
- **check-tiempo-verbal.js** — que a los CINCO modos les llegue la regla de que
  al espectador no se le inventa un pasado: se le habla en presente de lo que le
  pasa y en imperativo de lo que tiene que hacer, y si hay una historia ya
  ocurrida, es de otro y en tercera persona.
- **check-set-y-miniatura.js** — que en modo profesor se fijen el vestuario y el
  set ANTES de las tomas y que las dos anclas viajen en cada toma (los ejemplos
  no, ocurren fuera), y que la miniatura sea una portada de verdad y no el
  personaje centrado sobre un fondo negro.
