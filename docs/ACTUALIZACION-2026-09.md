# Actualización de septiembre de 2026

## Qué cambia para el canal

Los cambios se concentran en contenido específico, continuidad de producción y aprovechamiento del material propio. El código anterior mezclaba demasiadas instrucciones, prohibía ejemplos útiles y empujaba a renovar escenarios incluso cuando la biblioteca del canal podía servir. Además, pedir guion completo, traducción y escenas en una misma operación hacía especialmente frágiles los videos largos.

Ahora el encargo identifica público, conflicto y utilidad. Los relatos inventados se presentan como situaciones ilustrativas, las cifras hipotéticas se identifican como ejemplos y los cierres resuelven el planteamiento. Se conserva la estética del canal y se puede mantener la música reconocible. Son hipótesis para probar con publicaciones, no afirmaciones sobre lo que Facebook o YouTube van a distribuir.

El [análisis editorial](GUIONES-2026-09.md) contrasta referencias propias y recientes de canales afines. El generador prepara tres aperturas y un plan, escribe, revisa siete criterios con citas del texto, corrige una vez las partes señaladas y vuelve a revisar. Las escenas se preparan sobre la narración definitiva. Los reels y los largos guardan todas estas etapas. La revisión detallada queda en un apartado opcional. El público y el formato se eligen automáticamente según el tema y el modo; no hay un formulario de dirección editorial.

## Construir la biblioteca sin generar todo otra vez

1. Abre **Biblioteca de tomas y música** y carga los materiales.
2. Usa **Recuperar clips ya generados**. La búsqueda normal mira la carpeta de clips del estudio. La opción de archivos antiguos amplía la búsqueda al bucket compartido; identifica cuáles pertenecen a este canal.
3. En cada ficha escribe la acción visible, el entorno y el encuadre. Indica su formato y, cuando corresponda, el personaje y la continuidad. Por ejemplo: «Protagonista calcula un presupuesto en la oficina, detalle de manos y calculadora, luz cálida».
4. Agrupa material parecido en colecciones y marca tus favoritos. Una toma favorita no sustituye una escena de otra acción o formato.
5. Puedes subir varios archivos desde el teléfono. Describe un grupo coherente; después edita las fichas que necesiten diferencias.
6. Para ampliar la colección, elige una de las 96 propuestas. Cada imagen se confirma con su coste estimado y queda guardada. No hace falta producir las 96 para empezar.

Las tomas propuestas cubren trabajo, decisiones, presupuestos, pequeños negocios, aprendizaje, familia y disciplina, con cuatro encuadres por situación. Los archivos antiguos sin descripción o sin formato revisado necesitan catalogarse antes de la selección automática.

En un proyecto, **Elegir tomas de la biblioteca** propone una secuencia. Puedes ver cada material, buscar otro por su descripción y revisar el texto que acompaña a la escena. Los huecos permanecen visibles. **Generar solo lo que falta** crea imágenes para esas escenas y conserva el resto. El botón habitual de imágenes también conserva los materiales que ya tiene el proyecto; una sustitución se hace desde la toma concreta.

Con Google Cloud actualizado, el montaje combina imágenes con movimiento y clips. Usa cortes de duración manejable, mantiene la velocidad natural de los clips y repite un clip corto cuando es necesario. Reutilizar no equivale a publicar el mismo video terminado: el nuevo guion, la narración y el orden de las escenas deben aportar una pieza distinta y útil.

## Música y narración

Una pista se puede usar muchas veces. El selector recuerda la elegida y su volumen; desde su ficha puedes marcarla favorita o elegirla como música del canal. La música se repite durante todo el audio, con empalmes y salida al final. No se genera otra pista por cambiar de proyecto.

**Generar audio** utiliza los ajustes de voz actuales. **Recuperar narración ES/EN** recupera los ajustes y partes guardados del proyecto, o el archivo que importaste. Cambiar el guion invalida la narración y los resultados finales anteriores para evitar publicar una versión equivocada.

El inglés es opcional y se prepara aparte. Su montaje reutiliza las mismas imágenes y clips, ajustados a la duración de esa narración.

## Si se interrumpe una historia o un montaje

- Guion largo: pulsa **Reanudar guion**. Se recupera el esquema y las partes guardadas. No cierres el teléfono si quieres que continúen avanzando las siguientes etapas.
- Voz: abre el proyecto y pulsa **Recuperar narración**. Los tramos terminados se descargan y los pendientes continúan.
- Animación: una operación iniciada queda asociada a su imagen. El reintento consulta esa operación; un fallo definitivo permite pedir una nueva.
- Video final: abre el proyecto y pulsa **Consultar mi montaje**. Cloud Run puede seguir trabajando aunque cierres el teléfono. Si la tarea falló, un nuevo montaje de los mismos materiales recupera los segmentos terminados.
- Error de guardado: lee el aviso del estudio. Un archivo generado puede estar en la biblioteca aunque no haya terminado de asociarse al proyecto. No confundas «generado» con «guardado» cuando la conexión falla.

## Buscar una idea y producirla

Pulsa **Buscar ideas**. Cada tarjeta explica el tema y el formato, como «historia con giro» o «reto de transformación». Pulsa **Generar este guion**: su apertura, los avances de la historia y el cierre pasan al generador automáticamente. Se usa la duración que tengas seleccionada. Las ideas quedan guardadas en el teléfono.

La búsqueda usa Google para consultar videos públicos de Facebook y YouTube. Si encuentra una referencia de YouTube, al producir la idea se envía el video a Gemini para analizar hasta sus primeros tres minutos: mecanismos narrativos, cambios visuales y momentos observados. El análisis se guarda en Google Cloud Storage y se recupera en usos posteriores. Si no se puede leer el video, se indica y el guion continúa con la estructura propuesta por la búsqueda.

Esto distingue investigación pública de análisis audiovisual: una página o título no demuestra cómo retiene un video. No se accede automáticamente a estadísticas privadas de Facebook desde la aplicación, ni se conectan cuentas de terceros. Los nombres de los canales quedan fuera de las tarjetas y del selector, que se retiró. No se piden enlaces, porcentajes ni mediciones: esas consultas se hacen en Meta o YouTube.


## Instalar la actualización

El proyecto existente `legado-de-hierro-final` despliega automáticamente los cambios de `main`. La vista previa inicial falló con `exceeded_serverless_functions_per_deployment`: el plan Hobby admite 12 funciones. Se corrigió agrupando las rutas Node en `api/index.js`, con sus manejadores en `server/`, y conservando la consulta Edge de Veo y todas las URLs públicas. No hace falta crear otro proyecto ni cambiar de plan.

Vercel y Google Cloud son despliegues separados. La API detecta el servidor de montaje actual y mantiene un adaptador para imágenes o clips por separado dentro de los límites anteriores. Si el plan mezcla ambos, excede esos límites o requiere tiempos de imagen personalizados, informa que falta actualizar Google Cloud antes de enviar el trabajo. No descarta material para forzar un resultado. Cuando el servicio declara su ejecutor duradero disponible, cambia automáticamente al contrato nuevo.

No se han ejecutado generaciones reales de texto, voz o imágenes para validar la actualización. El estado de publicación se comprueba en los despliegues de Vercel y en el indicador de montaje dentro de la aplicación.

Desde el celular basta con abrir [Cloud Shell](https://shell.cloud.google.com/) y escribir esta única línea:

```bash
curl -fsSL https://studio.legadodehierro.com/u.sh | bash
```

Si Google solicita **Autorizar**, pulsa ese botón. Espera hasta ver **LISTO: montaje actualizado**, vuelve a la aplicación y recarga. El indicador de montaje debe mostrar que está actualizado. Si aparece un error, conserva una captura de las últimas líneas; el mismo comando puede repetirse.

El instalador incluye todos los archivos necesarios, usa por defecto `creaciondecontenido1` y `us-central1`, conserva la clave y la cuenta del servicio actual y añade las subidas desde el teléfono sin borrar las reglas de otros proyectos. Prepara una revisión sin tráfico, instala el job y su permiso y luego activa la revisión. Si falla la comprobación final, restablece el tráfico anterior. No inicia generaciones. La descarga debe estar completa antes de ejecutar operaciones de Google Cloud.

Después de instalar, verifica guardado y recuperación de un proyecto y el montaje de archivos existentes. Luego prueba el relato de cinco u ocho minutos con tus proveedores, revisando duración, voz y subtítulos.

Para un origen distinto, ejecuta el actualizador con `LEGADO_STUDIO_ORIGIN=https://tu-dominio`. Si utilizas una vista previa de Vercel, añade explícitamente ese origen a CORS conservando las reglas que ya tiene el bucket. Las URLs firmadas no sustituyen los permisos de lectura/escritura de la cuenta de servicio.

El job dispone de una hora por intento, un reintento y 2 GiB de memoria. Su cuenta de servicio necesita acceso al bucket. Si el despliegue del job falla, completa esa configuración: la API no intentará enviarle trabajos hasta que declare el ejecutor disponible. No se crea otro sistema de usuarios ni se migran o eliminan los archivos originales.

## Verificación realizada y pendiente

Pasaron 48 pruebas automatizadas de guiones por partes, revisión y corrección editorial, recuperación de audio, escrituras concurrentes, API, catálogo, compatibilidad de datos anteriores, controles DOM, investigación pública, análisis audiovisual y arranque del ejecutor. Se comprobó que una revisión guardada se recupera sin otra llamada, que se rechazan citas inexistentes y que la corrección no entra en un ciclo infinito. FFmpeg produjo un MP4 vertical real de ocho minutos con narración sintética dividida, imágenes, video, música audible cerca del final y subtítulos. La diferencia entre duración del video y la narración quedó dentro de un fotograma en las comprobaciones del plan.

Las pruebas de despliegue verifican las rutas agrupadas, su autenticación, el rechazo de rutas internas y la compatibilidad de ambos contratos de montaje. Cuatro pruebas adicionales ejecutan el instalador con Google Cloud simulado: instalación completa sin incluir claves en la compilación, fallo del job antes de cambiar tráfico, recuperación de la revisión anterior si falla la comprobación final y descarga incompleta sin operaciones en la nube.

La prueba de interfaz usa los archivos reales de HTML y JavaScript en un DOM local simulado. El navegador de vista previa fue bloqueado por el entorno; no constituye una comprobación visual en Safari. Quedan por verificar con acceso al despliegue real: permisos de Google, CORS, ejecución del job, respuestas reales de los proveedores y reproducción/descarga desde el iPhone. No se han comprobado mejoras de alcance o ingresos posteriores a esta actualización.

## Referencias técnicas

- [Límites de Vercel Functions](https://vercel.com/docs/functions/limitations).
- [Precondiciones de Google Cloud Storage](https://docs.cloud.google.com/storage/docs/request-preconditions).
- [Ejecución de Cloud Run Jobs](https://docs.cloud.google.com/run/docs/execute/jobs).
- [Permisos de Cloud Run](https://docs.cloud.google.com/iam/docs/roles-permissions/run).
- [Configuración CORS de Cloud Storage](https://docs.cloud.google.com/storage/docs/using-cors).

La integración de análisis usa [videos públicos de YouTube como entrada de Gemini](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/video-understanding) y [metadatos para limitar el fragmento](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest/v1/Content#VideoMetadata). Las pruebas locales simulan Google y verifican el flujo completo hasta el encargo del guion; no validan una llamada pagada con las credenciales de producción.
