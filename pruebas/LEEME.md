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
- **check-subtitulos-ffmpeg.js** — que los subtitulos SE PINTEN de verdad
  (se mide el brillo del fotograma, no los bytes del fichero: un reencode ya
  cambia los bytes aunque no dibuje nada, y asi se colo un falso positivo).

## Antes de desplegar

    bash comprobar.sh

Sintaxis, JSON, funciones que se llaman pero no existen, ids huerfanos y que el
index.js embebido en los instaladores de Cloud Run siga al dia.
