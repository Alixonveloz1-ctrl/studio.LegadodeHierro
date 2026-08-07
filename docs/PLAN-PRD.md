# Plan de mejora de Legado de Hierro

**Punto de partida:** la herramienta ya hace el 80% de lo que el PRD promete. Lo que falta no es arquitectura, es **memoria**: el sistema no recuerda lo que ya hizo, y por eso se repite y pierde trabajo pagado. Todo el plan se construye encima de lo que hay (vanilla JS + Vercel + GCS + Cloud Run). No se reescribe nada.

**Regla que se sigue en todo el plan:** el almacén es el bucket de GCS que ya existe, guardando JSON. El patrón ya está escrito y funcionando tres veces en el repo (`api/refs.js:63-81` read/writeToBucket, `cloudrun/unify/index.js:70-73` writeStatus, `api/unify-status.js:106-112` lectura con `?alt=media`). **No hace falta ninguna base de datos en ninguna fase de este plan.**

---

## Orden de ataque (valor real ÷ esfuerzo)

| # | Fase | Tiempo | Ataca la queja de... |
|---|------|--------|----------------------|
| 0 | Cinco arreglos de veinte minutos | 2 h | dinero perdido en silencio |
| 1 | Memoria que de verdad se usa al escribir | 1 día | guiones repetitivos + perder el rastro |
| 2 | Ejes nuevos de variedad (estructura, emoción, escenarios) | medio día | guiones repetitivos + imágenes repetitivas |
| 3 | El historial sale del navegador (bucket) | medio día | perder el rastro |
| 4 | Dejar de repagar lo ya generado + control de gasto | 1-2 días | dinero |
| 5 | El reel sale terminado (subtítulos quemados, audio nivelado, QA) | 1-2 días | tiempo (CapCut) + archivos rotos |
| 6 | Saber qué funcionó (métricas a mano/CSV + analista) | 1-2 días | decidir con datos |
| 7 | Opcional: aviso de parecido semántico | medio día | repetición fina |

Las fases 1 y 2 son **solo `public/app.js`**. No tocan servidor, no tocan Cloud Run, no necesitan despliegue de nada nuevo. Se pueden hacer la semana que viene y se notan en el primer guion.

---

## FASE 0 — Cinco arreglos de veinte minutos (hacer antes que nada)

No son mejoras, son fugas tapadas. Ninguno lleva más de media hora.

**0.1 — La puerta de seguridad no puede abrirse sola.**
`api/_auth.js:19` dice `if (!key) return true;`. Si `APP_KEY` se borra, se renombra o no se propaga a un entorno de Vercel, **toda la API queda pública** y cualquiera puede quemar Veo a 0,30-0,60 USD el clip. El mismo agujero está copiado en `api/video-start.js:29-31` y `api/video-status.js:90-92` (runtime edge).
- Qué se hace: fallar cerrado cuando `process.env.VERCEL_ENV === 'production'`, y que `api/login.js` (que ya devuelve `{open:true}`) pinte un aviso rojo permanente en la UI cuando el candado esté abierto — hoy el frontend lo ignora (`public/app.js:536-539` solo mira `res.status===200`).
- Verificación: quitar `APP_KEY` en un deploy de vista previa y comprobar que `/api/generate` responde 401.

**0.2 — Regenerar una imagen deja el clip viejo pegado.**
En `setSlotOk` (`public/app.js:2166`), el botón de regenerar reemplaza `imgs[iidx]` pero **no toca `vidState[idx]`** (`public/app.js:2355`). El clip animado de la imagen MALA sigue en `done`, se muestra, y entra tal cual en la unificación (`public/app.js:2518` lo salta con `if(vidState[i]==='done') continue`). Corriges una imagen y el video final sigue mostrando la versión que descartaste.
- Qué se hace: al regenerar la imagen k, poner `vidState[k]='idle'` y `vids[k]=null`, y repintar los controles de video.
- Verificación: generar imagen, animarla, regenerar la imagen, comprobar que el botón vuelve a "Animar".

**0.3 — Los selectores de modelo no se recuerdan.**
`wireGenSettings` (`public/app.js:606`) solo engancha los selects a variables globales; en cada recarga vuelven a `imgModel='gemini-2.5-flash-image'` y `vidModel='veo-3.1-lite-generate-001'` (`public/app.js:576-577`). Si un día trabajas con `veo-3.1-fast` y recargas, vuelves al barato sin enterarte — o al revés, pagas de más.
- Qué se hace: `localStorage` como ya se hace con `lh_vox` (`public/app.js:1469`) y `lh_music_vol` (`public/app.js:3662`).

**0.4 — Borrar el panel fantasma de agenda.**
`buildSched` (`public/app.js:679`) sale con `return` porque `#schedGrid` no existe en el HTML; por tanto `refreshSched` (`public/app.js:654`) no tiene ni un llamador y con él muere `buildSuggestPrompt` (`public/app.js:627`). Son ~60 líneas que parecen un sistema de sugerencias con IA funcionando y nunca se ejecutan. **Ojo al limpiar:** `SCHED_CURRENT` (`public/app.js:284`) sí sigue vivo porque `batchJobs` lo lee en `public/app.js:941`, y como `refreshSched` nunca corre es siempre 7 elementos al azar del propio `SCHED_POOL` — redundante con la línea siguiente del mismo `concat`. Hay que quitarlo del concat, no dejarlo colgando.
- Por qué importa: la Fase 1 mete el balance de pilares exactamente en esa zona. Mejor no construir sobre un fantasma.

**0.5 — `node --check` antes de desplegar.**
`public/app.js` son 3.725 líneas de ES5 editadas a mano. Un error de sintaxis no rompe una pantalla: rompe **toda** la aplicación. Un script de dos líneas (`node --check` sobre `api/*.js` y `public/app.js`) como paso previo al push. Hoy pasan limpios, comprobado.

---

## FASE 1 — Memoria que de verdad se usa al escribir el guion

**El problema real.** El prompt le ordena tres veces al modelo cosas físicamente imposibles: "JAMÁS repitas el mismo detalle de un guion a otro", "cada guion debe sentirse distinto al anterior", "no repitas la misma frase de cierre de otro guion" — contra un modelo que **no tiene ni idea de que existió un guion anterior**. `buildEpisodeMsg` (`public/app.js:792-846`) no llama a `getHistory()` ni una vez, y `api/generate.js` manda un único turno de usuario sin historia. Toda la "variedad" es `Math.random()` sin memoria: `public/app.js:813` (3 de 12 registros visuales), `:836` (1 de 8 ángulos de herramientas), `:841` (1 de 18 puertas de entrada). Con 18 puertas de entrada, dos guiones seguidos tienen un 5,6% de entrar por la misma, y en cualquier tanda de 20 la colisión es casi segura. **Eso es exactamente por qué los guiones siempre criticaban el trabajo asalariado.**

Y encima el historial se autodestruye: `HIST_MAX=10` (`public/app.js:1078`), el reel 11 borra el 1 (`public/app.js:1095`). A los dos semanas el sistema no recuerda nada.

**Qué se construye** (todo en `public/app.js`, cero servidor):

1. **Historial de verdad.** `HIST_MAX` de 10 → 300. Una entrada pesa ~5-6 KB; 300 caben de sobra en la cuota de 5 MB de localStorage. Añadir **id estable** (`fecha + contador`) y arreglar `restoreHistory` (`public/app.js:1135`), que hoy indexa por POSICIÓN del array — y como `saveHistory` hace `unshift` (`public/app.js:1086-1094`), el índice de un reel cambia cada vez que generas otro.

2. **Guardar las decisiones creativas que hoy se tiran.** `buildEpisodeMsg` calcula el enfoque (`:841`), el ángulo (`:836`) y los 3 registros visuales (`:813`) y **devuelve solo `{msg,tO,dO,hO}`**. Se añaden al `return` y al objeto de `saveHistory`. Sin esto no se puede rotar sin repetir ni saber por qué un reel salió como salió. Menos de 15 líneas.

3. **Bloque "YA DICHO" en el prompt.** Añadir a `buildEpisodeMsg` un bloque con la **primera frase** (gancho) y la **penúltima** (cierre real; la última es "Legado de Hierro", que es firma de marca y no se toca) de los últimos 20-30 guiones, más sus conceptos. Convierte tres instrucciones imposibles en tres instrucciones cumplibles. Cero coste extra de API. **Este es el cambio que más cambia los guiones.**
   - El patrón ya está validado en el propio repo: `public/app.js:3521-3529` arma la lista `avoid` desde el historial y `api/trends.js:77-86` la inyecta como "CONCEPTOS YA USADOS RECIENTEMENTE". Solo se lleva ese mismo mecanismo a la escritura del guion.

4. **Rotación con memoria en vez de azar.** Sustituir `Math.random()` por "el menos usado en los últimos N" en `public/app.js:813`, `:836` y `:841`, leyendo del historial. Cinco líneas por sitio.

5. **Balance de pilares entre tandas.** `batchJobs` (`public/app.js:937-954`) ya evita repetir pilar DENTRO de un lote (`usedT`, `:943-950`), pero cada lote parte de cero: puedes sacar tres lotes seguidos con "libertad" en los tres. Se siembra `usedC`/`usedT` con el historial reciente. Añadir además una **cuota de monetización**: garantizar que 1 de cada 5 del lote es del pilar `herramientas` (hoy entra o no entra por azar). Tres líneas, y es la única parte de "objetivos de negocio" del PRD que paga.

6. **Guardar el caption y los hashtags.** `lastCaption`, `lastTags`, `lastTikTok`, `lastYouTube` (`public/app.js:1348` y `:2032`) son variables en memoria. Si restauras un reel del historial, **hay que volver a pedírselos a Gemini y pagarlos otra vez**. Cuatro strings más en el objeto del historial, ~500 bytes.

7. **Estado del contenido.** Un campo `estado` (borrador / producido / publicado) + fecha de publicación, con un botón en la tarjeta del historial (`public/app.js:1101-1130`). Es la casilla de "ya salió". Sin ella la anti-repetición penaliza guiones que nunca subiste, y las métricas de la Fase 6 no tienen dónde engancharse.

**Cómo se verifica.** Generar 12 guiones seguidos sobre pilares distintos y comprobar: (a) ninguna puerta de entrada se repite hasta agotar las 18; (b) ninguna primera frase comparte tres palabras seguidas con otra; (c) restaurar un reel del historial devuelve el caption sin ninguna llamada a Gemini (mirar la pestaña Red del navegador); (d) el reel 11 ya no borra el 1.

**Archivos tocados:** solo `public/app.js` (y `public/index.html` para el botón de estado).

---

## FASE 2 — Ejes nuevos de variedad (el mecanismo ya existe, solo faltan las constantes)

**El problema real.** Aunque no se repita el tema, todos los reels tienen la misma forma: gancho de 12 palabras, una idea, cierre que engancha con el inicio. Y siempre la misma paleta emocional: `public/app.js:308-312` mete los cuatro pilares emocionales JUNTOS en cada guion (reconocimiento / la herida / lo que cuesta no cambiar / el fuego), repetido idéntico en `:378-382` y `:454-458`. Por eso todos suenan igual de duros.

**Qué se construye.** El mecanismo de inyección por código ya está construido y probado (`seedRule`, `public/app.js:834-843`). Solo hay que darle más ejes:

1. **6-8 esqueletos de estructura narrativa** de tres líneas cada uno, asignados por código igual que los ENFOQUES: error común, comparación, caso concreto, conversación, fábula corta, debate interno. **No escribir 6 `buildSP` nuevos** (son 70 líneas de prompt cada uno) — son bloques de texto dentro de `seedRule`. Cambia la SENSACIÓN de variedad más que cualquier métrica de similitud.
2. **Un eje de emoción dominante** (orgullo, urgencia, vergüenza sana, esperanza, calma del que ya llegó, rabia contenida, nostalgia del tiempo perdido): uno mayoritario en vez de los cuatro siempre.
3. **Ampliar `VIS_REGISTROS` de 12 a 22-24** (`public/app.js:113-126`). Con 12 registros y 3 por guion, la probabilidad de que dos guiones seguidos no compartan ninguno es solo del 25%. Es escribir texto.
4. **Memoria de escenas usadas.** La lista de IMÁGENES QUEMADAS de `public/app.js:817` (cargando cajas, bodega con cartones, obra, obreros con casco, firmar papeles) la escribiste a mano cuando notaste el problema. Se automatiza: guardar una frase-resumen por imagen generada y meter las últimas ~40 en el `sceneDir` como "ya usaste esto". Así en tres meses no tienes que volver a editar `app.js` cada vez que una escena se gasta. **Esta es la respuesta directa a "imágenes repetitivas".**
5. **Paleta y continuidad en la dirección visual.** Añadir al `sceneDir` (`public/app.js:803-823`) 2-3 colores dominantes y temperatura por reel, y una regla de continuidad entre escena k y k+1. ~10 líneas de prompt; hace que 5 imágenes se vean de la misma pieza.
6. **Storyboard editable antes de pagar.** El BLOQUE C ya existe y ya está sincronizado con el guion (`syncRule`, `public/app.js:838-840`), pero **nunca se muestra**: `public/app.js:1255-1263` solo crea pestañas para `r.a` y `r.f`. Hoy no puedes corregir un prompt malo antes de pagarlo, y el botón de regenerar (`public/app.js:2181` y `:2205`) relee el MISMO prompt de `lastRes.c[iidx]` — así que un prompt malo se regenera mal para siempre. Una pestaña con textareas editables sobre `lastRes.c`. Un lote son ~2 USD y 10 minutos: poder arreglar un prompt antes de gastarlo se paga solo.
7. **Modo "3 versiones del mismo concepto".** Reutiliza `generateBatch` (`public/app.js:956`) con jobs que comparten `topic` pero fuerzan enfoque, estructura y emoción distintos. Resuelve el caso real de "el tema está bueno pero este guion no me convence": hoy volver a darle al botón tiene 1 entre 18 de caer en la misma puerta y sale casi calcado.

**Cómo se verifica.** Generar el mismo concepto 3 veces con el modo nuevo y comprobar que las tres tienen estructura, emoción y puerta de entrada distintas. Generar 5 reels y comprobar que ninguna imagen cae en las escenas quemadas.

**Archivos tocados:** `public/app.js` (constantes + `seedRule` + `sceneDir` + una pestaña en `renderOut`), `public/index.html`.

---

## FASE 3 — El historial sale del navegador

**El problema real.** Toda la memoria vive en `localStorage` (`public/app.js:1082`, `:1096`). Trabajas desde PC y desde móvil (hay código específico para móvil en `public/app.js:1711` y `:2102`), así que **hoy tienes dos memorias distintas y desconectadas**. Y un borrado de datos del navegador se lleva todo el trabajo editorial. No hay ni un botón de exportar: el "Exportar todo" de `public/app.js:2985` es el ZIP del reel en pantalla, no del historial.

**Qué se construye.**

1. **Un endpoint de memoria JSON.** Recomendado: `api/mem.js`, copiando los ~40 renglones de `getGCPToken` + `readFromBucket` + `writeToBucket` de `api/refs.js:30-81`, con dos acciones (`get`/`put`) y una lista blanca de nombres de fichero bajo el prefijo `memoria/`. Si tu plan de Vercel te aprieta con el número de funciones (`api/` ya tiene 13 endpoints y `vercel.json` declara 11), la alternativa sin coste es meterlo como dos acciones más dentro de `api/music.js`, que ya tiene despacho por `action` (`api/music.js:104`) y su propio `getGCPToken`.
2. **`memoria/historial.json`** como fuente de verdad, con `localStorage` de caché y respaldo (no se sustituye: si falla la red, se sigue trabajando). Escritura tras cada `saveHistory`, con debounce.
3. **`memoria/tendencias.json`**: hoy cada investigación de tendencias es una llamada a Gemini 3.1 Pro con googleSearch de 30-60 segundos que produce un plan semanal accionable (`api/trends.js:100`, sección "PARA REPLICAR ESTA SEMANA") y **se tira al recargar la página** (`public/app.js:3478` `TREND_IDEAS=[]`). Guardar las últimas 5.
4. **Botón exportar/importar JSON** del historial. Veinte líneas, y es el paracaídas.

**Sobre concurrencia:** eres un usuario con una pestaña activa. No hay carreras de escritura que justifiquen nada. Si se quiere ser prolijo, GCS soporta `ifGenerationMatch` para escritura optimista.

**Coste real:** 500 reels son ~3 MB en GCS Standard, del orden de 0,00006 USD/mes. Céntimos al año en operaciones.

**Cómo se verifica.** Generar un reel en el PC, abrir la herramienta en el móvil, ver el reel en el historial. Borrar datos del navegador del PC, recargar, ver que el historial vuelve del bucket.

**Archivos tocados:** `api/mem.js` (nuevo) o `api/music.js`, `public/app.js` (`getHistory`/`saveHistory` pasan a async con caché), `vercel.json` si se crea el endpoint.

---

## FASE 4 — Dejar de repagar lo que ya está pagado

**El problema real.** Un F5 o un cierre accidental a mitad de reel tira 5-8 imágenes de Nano Banana y el audio ya generado. Las imágenes viven solo como dataURL en memoria (`public/app.js:2182`), el audio como blob local (`public/app.js:1660-1662`), la miniatura en `THUMBS` (`public/app.js:2285`). `restoreHistory` llama a `resetReelAssets` (`public/app.js:906-911`), que hace `audES=null;audEN=null;imgs=[];vids=[]` — borra todo lo pagado. Con Veo a 0,30-0,60 el clip y 5-8 clips por reel, un reel cuesta del orden de 3-5 USD.

Los clips de Veo sí sobreviven (van al bucket, `api/video-start.js:95`) y el banco los reutiliza (`api/videos.js`, `public/app.js:1754-1925`) — **esa es la función que más dinero ahorra de toda la herramienta**. Pero el banco los ordena por fecha y nombre y **no sabe a qué guion pertenece cada clip**.

**Qué se construye.**

1. **IndexedDB para el reel en curso.** Imágenes, audio y miniatura, indexados por el id del reel. Sin el límite de 5 MB de localStorage y sin coste ni ancho de banda. Un F5 deja de doler.
2. **Vincular los materiales al reel.** Guardar en la entrada del historial las rutas de objeto de los clips de Veo y del MP4 final: esos nombres ya se conocen en el cliente, es trivial. A partir de ahí el banco puede decir de qué guion salió cada clip.
3. **Recuperar una unificación perdida.** El `jobId` solo vive en una variable local (`public/app.js:2825`); si cierras la pestaña, el MP4 SÍ está en `unify/<jobId>.mp4` pero no hay forma de recuperarlo. Guardar el `jobId` en localStorage y añadir un modo "último trabajo" en `/api/unify-status`.
4. **Coste por reel, de verdad.** Hoy `cost` (`public/app.js:573`) es una variable global que **nunca se reinicia por reel**, mezcla toda la sesión y desaparece al recargar: es un adorno, no un registro. Se reinicia en `resetReelAssets`, se congela en la entrada del historial al terminar, y se acumula en `memoria/costos-YYYY-MM.json` vía el endpoint de la Fase 3. Las tablas de tarifas ya existen y son buenas (`public/app.js:579` y `:581`).
5. **Tope de presupuesto.** Un `COSTO_TOPE_MES` en variables de Vercel (para que no se pueda cambiar desde el navegador), mostrado como "llevas $X de $Y este mes", y una confirmación extra en los dos endpoints caros (`api/video-start.js`, `api/image.js`) al pasarlo. **Es el único riesgo económico real del proyecto**: un lote con imágenes y clips puede irse a 15-25 USD en una tarde sin que nada avise, y la factura de Vertex llega a fin de mes.

**Cómo se verifica.** Generar 5 imágenes y el audio, pulsar F5, restaurar el reel del historial: las imágenes y el audio siguen ahí. Comprobar que el contador de coste empieza en 0 en cada reel nuevo y que el total mensual suma entre sesiones.

**Archivos tocados:** `public/app.js` (IndexedDB, `resetReelAssets`, `saveHistory`, `updCost`), `api/mem.js`, `api/video-start.js` y `api/image.js` (chequeo de tope), `api/unify-status.js`.

---

## FASE 5 — Que el reel salga terminado

**El problema real.** El MP4 sale de Cloud Run y va directo al botón de descarga (`public/app.js:2862-2875`) sin **ninguna** validación. Y sigue pasando por CapCut por una razón concreta: los subtítulos.

**5.1 — Subtítulos quemados.** El trabajo duro ya está hecho y se está tirando a la basura: con ElevenLabs hay tiempos por carácter reales (`api/_eleven.js:118`) que `makeSRTFromAlignment` (`public/app.js:2881-2907`) convierte en grupos de hasta 4 palabras cortando en puntuación, y `combineAlignments` (`public/app.js:2008-2027`) empalma los tiempos de varias partes con el desplazamiento correcto. **El .srt solo se escribe en el ZIP** (`public/app.js:2945-2948`); en todo `cloudrun/unify/index.js` no hay ni un filtro `drawtext` ni `subtitles`.
- Qué se hace: mandar el SRT en el cuerpo de `/api/unify` (junto a `audioParts`, `api/unify.js:35`), escribirlo a fichero temporal en Cloud Run y quemarlo con el filtro `subtitles=` en el paso 7 (`cloudrun/unify/index.js:224-241`). Obliga a cambiar `-c:v copy` por un reencode del vídeo en ese paso; Cloud Run tiene 2 CPU y timeout de 600 s, cabe.
- Los subtítulos quemados son obligatorios en Facebook (la mayoría mira sin sonido). Esto es lo que elimina el paso por CapCut.

**5.2 — Nivelar el audio.** `cloudrun/unify/index.js:222-231` ya protege picos con `amix normalize=0` + `alimiter` a -1 dBFS, pero no hay `loudnorm`: dos reels seguidos salen a volúmenes distintos según el motor de voz (ElevenLabs, Gemini-TTS y Chirp no coinciden), y Facebook normaliza distinto según el nivel de entrada. Añadir `loudnorm=I=-14:TP=-1:LRA=11`. **Es una línea de ffmpeg.**

**5.3 — El bug que puede producir un archivo roto diciendo que todo salió bien.** `cloudrun/unify/index.js` solo llama a `ffprobe` para la duración (`:52-60`), nunca pide `width`/`height`. El paso 5 reencodea sin `scale` (`:143-155`) y el paso 6 concatena con `-c copy` (`:161`). Si mezclas clips de distinta resolución — **cosa perfectamente posible trayendo clips del banco** generados con otro `aspectRatio` — el concat produce un archivo destrozado SIN error, y el estado se escribe igual como `status:'done'` (`:248`). Es el único fallo del pipeline que miente.
- Qué se hace: `ffprobe` de `width`/`height` por clip antes de concatenar; si difieren, normalizar con `scale`+`pad` al aspecto objetivo (o abortar con mensaje claro, como ya se hace bien con el factor fuera de rango en `:131-133`). Y un `ffprobe` final que confirme 1080x1920 y lo devuelva en el JSON de estado.

**5.4 — Duración objetivo.** El sistema conoce el objetivo (30/60s) y la duración real (`audioDur`, `cloudrun/unify/index.js:123`), las escribe juntas en el estado (`:248-252`) y **nunca las compara**. Mandar `targetSeconds` en `/api/unify` y avisar si se desvía más de un 15%. Mostrar la duración real junto al botón de descarga.

**5.5 — Revisión ortográfica del guion, no de los subtítulos.** Los subtítulos SON el guion. Una tilde mal puesta también hace que el TTS lea mal. Una llamada extra y barata a `/api/generate` pidiendo solo corrección ortográfica **antes** de generar el audio.

**Cómo se verifica.** Unificar un reel mezclando a propósito un clip 16:9 del banco: no debe producir basura. Descargar el MP4 y comprobar con `ffprobe` que es 1080x1920, que la pista de audio y la de vídeo duran lo mismo, y que los subtítulos están quemados y sincronizados.

**Archivos tocados:** `cloudrun/unify/index.js`, `api/unify.js`, `public/app.js`.

---

## FASE 6 — Saber qué funcionó (sin OAuth, sin App Review, sin tokens que caducan)

**El hallazgo honesto:** la integración oficial con la Graph API de Meta **no da RPM, ni CPM, ni ingresos por reel** (`monetized_video_insights` está restringido y no se concede para uso personal). O sea: la pregunta estrella del PRD, "¿por qué cayó el RPM?", **no se puede responder con la integración que el PRD pide**. Eso solo sale del panel de Monetización o de su exportación CSV. Y Meta deprecia versiones de la Graph API cada ~2 años renombrando métricas de vídeo: no es construir y olvidarse.

**Qué se construye en su lugar.**

1. **Esquema de métricas primero.** Un objeto con los campos, aceptando `null` en los que solo se llenan a mano. Es lo más barato de la dimensión y sin ello no hay nada que pintar. Para Facebook Reels son obtenibles con fiabilidad ~8: vistas, alcance, impresiones, tiempo medio visto, reacciones, comentarios, compartidos, seguidores ganados.
2. **ID del post.** Un campo donde pegar la URL o el ID del post publicado. Es el eslabón que hoy falta: aunque mañana llegaran las métricas perfectas, no habría forma de saber qué reel de la herramienta es qué post de la página.
3. **Importador de CSV.** Meta Business Suite exporta desde Estadísticas > Contenido un CSV con alcance, reproducciones, reproducciones de 3 s, tiempo medio, reacciones, comentarios, compartidos y seguidores ganados; el panel de Monetización exporta otro con ingresos y RPM. Se cruzan por ID de publicación. Un `<input type="file">` y ~60 líneas de parser en JS puro, sin dependencias. Dos minutos por semana para ti, y **sí trae ingresos y RPM**.
4. **Formulario manual de 4 campos** por reel, para cuando no quieras exportar nada.
5. **Panel de tres tablas, sin librería de gráficos:** rendimiento medio por PILAR (la taxonomía ya existe, `THEMES`), por GANCHO (5 tipos, `HOOKS`) y por DURACIÓN. Una tabla ordenada responde la pregunta igual de bien que un gráfico y no mete dependencias en un frontend que es ES5 puro. Más coste vs ingresos por reel, que sale gratis con la Fase 4.
6. **La señal positiva por el cable que ya existe.** Hoy `public/app.js:3521-3529` → `api/trends.js:77-86` transporta solo información negativa ("no repitas esto"). Añadir al mismo cuerpo un bloque con los ganchos, pilares y duraciones que **mejor rindieron**. Es la forma más barata y más segura de tener "aprendizaje": el modelo recibe la evidencia y decide, y tú lo ves en el texto del prompt.
7. **Analista en lenguaje natural.** Un modo nuevo dentro de `api/generate.js` que reciba el JSON de métricas entero en el contexto más tu pregunta. Doscientas filas caben de sobra en Gemini 3.1 Pro: nada de base vectorial, nada de SQL, nada de agregaciones. Es copiar `api/trends.js:145-165` quitándole `googleSearch`. **Aviso:** el prompt debe decir explícitamente cuándo no hay muestra suficiente, o se convierte en una máquina de confirmar sesgos.

**Cómo se verifica.** Importar el CSV de un mes, comprobar que las filas se cruzan con los reels del historial por ID de post, y que la tabla por gancho ordena correctamente. Preguntarle al analista algo cuya respuesta ya sepas.

**Archivos tocados:** `public/app.js`, `public/index.html`, `api/generate.js` (modo analista), `api/mem.js`, `api/trends.js` (bloque de señal positiva).

---

## FASE 7 — Opcional: aviso de parecido semántico

Solo si después de las fases 1, 2 y 6 sigues notando repetición. **Las tres auditorías discrepaban en esto y aquí está la decisión:** es viable sin base vectorial y sin base de datos, pero es lo último de la lista y no se hace como lo pide el PRD.

- **Embeber solo el gancho y la idea central, nunca el guion completo.** Un canal mononicho, una sola voz y un system prompt idéntico producen un corpus donde TODOS los pares salen entre 0,75 y 0,90. Un umbral absoluto de 0,85 rechazaría todo o nada. Sobre el gancho sí discrimina.
- Un modo `embed` en `api/generate.js` contra `text-multilingual-embedding-002`; el `getGCPToken` ya pide scope `cloud-platform` y sirve tal cual. 768 float32 = 3 KB por guion; 500 reels = 1,5 MB. El coseno por fuerza bruta contra 500 vectores tarda menos de un milisegundo en JavaScript. Coste de API: menos de 0,05 USD al año.
- **Aviso, no puerta.** "Esto se parece 0,91 al reel del 3 de marzo" con enlace al guion, visible arriba del guion **antes** de que se puedan disparar imágenes y vídeo (que es lo caro). Nada de regeneración automática: estás delante, lees el guion en 15 segundos y decides mejor que un umbral.

---

## DESCARTAR del PRD (peso muerto para un canal de una persona)

Sin piedad y con el porqué en una línea:

**Arquitectura**
- **React / Next.js** — reescribir 3.725 líneas que funcionan y están afinadas para tu móvil no produce ni un reel más; produce semanas de regresiones, y pierdes el editar-y-recargar sin build que `vercel.json` ya te da.
- **PostgreSQL** — todo lo que lo justificaría cabe en JSON de unos pocos KB en un bucket que ya pagas.
- **Base vectorial (pgvector, Pinecone)** — se justifica desde decenas de miles de documentos; con cientos, un array recorrido linealmente es más rápido y más fácil de depurar.
- **Redis** — el bucket ya hace de caché (`api/refs.js:28,118`) y de tablón de estado; Redis sería una suscripción y un punto de fallo más.
- **Colas distribuidas (Pub/Sub, Cloud Tasks)** — ya tienes dos pipelines asíncronos funcionando (`api/unify.js` → Cloud Run → `unify/<jobId>.json` → `api/unify-status.js`, y Veo con `operationName`). Una cola absorbe concurrencia; tú lanzas un trabajo cada vez.
- **API Gateway** — un gateway gobierna muchos clientes y equipos; aquí hay un navegador y una clave. Lo único valioso de esa lista (el tope de gasto) va dentro de los endpoints, Fase 4.
- **JWT** — con un solo usuario sería la misma clave con otro envoltorio. El riesgo real es el fail-open de `APP_KEY`, y ese se arregla en la Fase 0.
- **RBAC con seis roles** — cada endpoint comprobaría permisos que siempre dan "sí".
- **Multi-organización / multi-marca / multi-tenant** — es un producto distinto: obliga a parametrizar los prompts, que son el activo real y están afinados a mano para ESTA voz. Si algún día lanzas una segunda marca, sale más barato desplegar una segunda copia en Vercel con otras variables de entorno.
- **Paneles de monitoreo de infraestructura, alertas por email/cron, trazabilidad distribuida** — son para un equipo de guardia; nadie va a mirar un panel de latencia de su propia herramienta. Los errores ya llegan a pantalla y bien explicados (`api/_auth.js:33-36` distingue tu 401 del de un proveedor).

**Editorial**
- **Rotación de personajes / biblioteca de personajes con arquetipos** — el personaje fijo ES la marca (`public/app.js:798`, `api/refs.js:20-25`, y el prompt prohíbe expresamente inventar personajes en `:411`). Rotarlo destruiría el activo más valioso del canal.
- **Rotación de estilos visuales (8 estilos: neo-noir, vintage, corporativo...)** — el cómic 2D es lo que te hace reconocible al tercer scroll. Ocho estilos convertirían el feed en un muestrario sin marca.
- **Grafo de conocimiento** — un grafo sobre 8 nodos de tema y 5 de gancho no descubre nada que no se vea en una tabla ordenada.
- **Calendario automático diario/semanal/mensual** — un calendario que decida "el martes toca inversión" no produce, no publica y no mide. Lo que te falta no es un calendario: es la cola con estado de la Fase 1 ("4 listos, 2 sin imágenes, 1 publicado").
- **Ejecución programada / generar sin nadie delante** — revisar los guiones cuesta lo mismo que pedirlos, y el plan gratuito de Vercel limita los crons a una ejecución diaria; el pipeline pesado no cabe en 60 s.
- **Sistema de prioridades con score de cinco factores** — son cinco tarjetas en una pantalla y las lees en quince segundos.
- **Brief con justificación de cada decisión editorial** — pedirle una justificación al mismo modelo que eligió modo y duración con `shuffleArr` (`public/app.js:924-926`) es una explicación elegante de una tirada de dados.
- **Balance de emociones como taxonomía etiquetada y medida** — el eje de emoción sí (Fase 2), la contabilidad de emociones no: nadie la va a mirar.
- **Motor de aprendizaje que mueva pesos solo** — con 3-5 reels/semana, en seis meses tienes ~100 piezas entre 8 pilares y 5 ganchos: doce por celda, con la varianza salvaje del algoritmo de Meta. Mover pesos sobre eso no es aprender, es amplificar ruido, y crea un bucle que se estrecha solo (bajas un pilar → produces menos → tienes menos datos → lo bajas más). Además te quita lo único que es tuyo: decidir de qué hablas.
- **Aprender por plataforma, idioma y audiencia por separado** — partir en tres una muestra que ya es pequeña para una sola conclusión.
- **Regeneración automática por umbral de similitud** — quema otra llamada, tarda más y te quita la decisión a ti, que estás delante.

**Integraciones y producción**
- **OAuth a Meta / YouTube / TikTok para ingesta automática** — Meta no da RPM ni ingresos por esa vía; YouTube exige scopes sensibles y, si la pantalla de consentimiento se queda en "Testing", **el refresh token caduca a los 7 días**; TikTok no tiene siquiera el escape de "modo desarrollo con tus propios datos". El CSV da más, con cero credenciales.
- **Instagram y TikTok como fuentes de métricas** — el producto es "Sistema de Producción Facebook Reels" y ni siquiera generas caption de Instagram.
- **Arquitectura de conectores desacoplados** — abstracción preventiva para cuatro plataformas de las que usas una; con esquemas de métricas tan distintos, la "interfaz común" acabaría siendo un campo genérico más un objeto crudo por plataforma, o sea nada.
- **Panel financiero con ROI, coste por plataforma y coste por marca** — segmentar por plataforma y por marca cuando hay una de cada es multiplicar por uno.
- **Versiones distintas del vídeo por plataforma** — triplica el coste de Veo para un público que no existe. Los captions por plataforma que ya generas (`public/app.js:1374-1377`) bastan para resubir.
- **B-roll automático** — existe para tapar huecos cuando la voz dura más que el material, y aquí no hay huecos por diseño: el factor de velocidad (`cloudrun/unify/index.js:130`) estira los clips hasta cubrir exactamente la narración.
- **Transiciones y fundidos entre clips** — el corte seco es lo correcto para retención, y el prompt ya prohíbe fundidos a propósito (`public/app.js:2505-2508`).
- **Continuidad frame-a-frame entre clips (lastFrame de Veo)** — el formato son 5 escenas DISTINTAS al ritmo de la narración, no un plano secuencia; `public/app.js:818` prohíbe justamente que dos imágenes sean la misma escena.
- **Selección automática del proveedor más eficiente** — con tres modelos cuyos precios te sabes de memoria, un automatismo decidiría peor y sin explicar por qué; el barato ya viene marcado por defecto.
- **Exportación en múltiples aspectos (1:1, 16:9)** — trabajo para un destino que hoy no existe.
- **Registro de auditoría y gobernanza (aceptar/rechazar cambios estratégicos)** — una pista de auditoría existe para que alguien pida cuentas a otro alguien; aquí decides, ejecutas y revisas la misma persona. Y si no automatizas los pesos, la sección entera se evapora.
- **Dashboard de widgets como pantalla principal** — el flujo lineal actual (Tendencias → Modo → Pilar → Duración → Gancho → Concepto → Lote → producción) es MEJOR para producir un reel de principio a fin. Convertirlo en widgets sería empeorarlo por parecerse al PRD.

---

## Límites honestos que este plan respeta

- **Vercel funciones de 60 s** (`vercel.json`). Ninguna fase mete trabajo largo en una función: lo pesado sigue en Cloud Run con el patrón asíncrono que ya funciona.
- **Cron de Vercel en plan gratis: una ejecución al día.** Por eso ninguna fase depende de un cron. Las métricas se actualizan con un botón o un CSV, y no caducan.
- **Sin base de datos, y no hace falta.** Todo el estado nuevo son JSON en `memoria/` dentro del bucket que ya existe. El único escenario en que una BD empezaría a doler de verdad es la ingesta automática con OAuth y refresco de tokens — y ese escenario está descartado arriba por razones que no tienen que ver con el almacén.
- **Sin bloqueo de escritura en GCS.** Con un usuario y una pestaña no es un problema; si algún día lo fuera, `ifGenerationMatch` lo resuelve sin infraestructura.
- **localStorage tiene ~5 MB por origen.** Por eso el historial de texto cabe (300 reels ≈ 1,8 MB) pero las imágenes y el audio van a IndexedDB, no a localStorage.
- **`api/` ya tiene 13 endpoints.** Cada capacidad nueva entra como **acción dentro de un endpoint existente** siempre que se pueda; solo la Fase 3 propone un archivo nuevo, y con alternativa.
- **`public/app.js` es ES5 puro a propósito** (compatibilidad con WebKit de iOS). Nada de este plan introduce sintaxis moderna, frameworks ni build.
- **La muestra de datos es pequeña.** Cualquier conclusión de la Fase 6 con menos de 30-40 reels publicados es una narrativa plausible, no estadística. El plan lo dice en el prompt del analista en vez de fingir lo contrario.

---

## Si solo pudieras hacer una cosa

La **Fase 1, punto 3**: pasarle a `buildEpisodeMsg` los ganchos y cierres de los últimos 20-30 guiones. Son 30-40 líneas en un solo archivo, cero coste de API, cero infraestructura, y convierte tres órdenes imposibles del prompt en tres órdenes cumplibles. Es la línea que separa "el modelo se repite" de "el modelo sabe de qué no hablar".