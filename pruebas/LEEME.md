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
