# Actualización de septiembre de 2026

## Qué cambia para el canal

Los cambios se concentran en contenido específico, continuidad de producción y aprovechamiento del material propio. El código anterior mezclaba demasiadas instrucciones, prohibía ejemplos útiles y empujaba a renovar escenarios incluso cuando la biblioteca del canal podía servir. Además, pedir guion completo, traducción y escenas en una misma operación hacía especialmente frágiles los videos largos.

Ahora el encargo identifica público, conflicto y utilidad. Los relatos inventados se presentan como situaciones ilustrativas, las cifras hipotéticas se identifican como ejemplos y los cierres resuelven el planteamiento. Se conserva la estética del canal y se puede mantener la música reconocible. Son hipótesis para probar con publicaciones, no afirmaciones sobre lo que Facebook o YouTube van a distribuir.

El [análisis editorial](GUIONES-2026-09.md) contrasta referencias propias y recientes de canales afines. El generador prepara tres aperturas y un plan, escribe, revisa siete criterios con citas del texto, corrige una vez las partes señaladas y vuelve a revisar. Las escenas se preparan sobre la narración definitiva. Los reels y los largos guardan todas estas etapas. En pantalla se muestran la promesa, la resolución prevista, el diagnóstico y el borrador previo cuando hubo mejora.

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

## Medir la recuperación

Registra cada publicación a las 24 horas, a los 7 días o a los 28 días. Anota duración, vistas, tiempo medio visto y, cuando existan, porcentaje de no seguidores, guardados, compartidos y nuevos seguidores. Separa los ingresos del contenido de las bonificaciones.

No compares una pieza de ayer con otra que acumuló vistas durante meses. Tampoco atribuyas una diferencia de ingresos a la música por sí sola. Usa grupos de plataforma, duración y edad similares; cambia una decisión editorial principal por grupo y conserva el resto tanto como sea práctico. Con al menos tres publicaciones comparables, las siguientes propuestas incorporan las necesidades y ganchos que dieron mejores señales relativas. Los campos incompletos se excluyen de la clasificación común.

El registro es manual. Esta versión no descarga estadísticas privadas ni publica automáticamente en las cuentas de Facebook o YouTube.

## Instalar la actualización

El proyecto existente `legado-de-hierro-final` despliega automáticamente los cambios de `main`. La vista previa inicial falló con `exceeded_serverless_functions_per_deployment`: el plan Hobby admite 12 funciones. Se corrigió agrupando las rutas Node en `api/index.js`, con sus manejadores en `server/`, y conservando la consulta Edge de Veo y todas las URLs públicas. No hace falta crear otro proyecto ni cambiar de plan.

Vercel y Google Cloud son despliegues separados. La API detecta el servidor de montaje actual y mantiene un adaptador para imágenes o clips por separado dentro de los límites anteriores. Si el plan mezcla ambos, excede esos límites o requiere tiempos de imagen personalizados, informa que falta actualizar Google Cloud antes de enviar el trabajo. No descarta material para forzar un resultado. Cuando el servicio declara su ejecutor duradero disponible, cambia automáticamente al contrato nuevo.

No se han ejecutado generaciones reales de texto, voz o imágenes para validar la actualización. El estado de publicación se comprueba en los despliegues de Vercel y en el indicador de montaje dentro de la aplicación.

Se puede completar desde un navegador, incluido el teléfono, usando Google Cloud Shell y el panel de Vercel. Debe hacerse con las cuentas que ya administran esta aplicación.

1. En Google Cloud selecciona el proyecto donde existe `legado-unify`. El instalador usa por defecto `creaciondecontenido1`, región `us-central1`; se pueden ajustar con `LEGADO_PROJECT_ID` y `LEGADO_REGION`.
2. Guarda la revisión activa de Cloud Run y el despliegue activo de Vercel para poder volver atrás. Espera a que termine cualquier montaje en curso.
3. Abre el repositorio de esta actualización en Cloud Shell, entra en su carpeta y ejecuta `bash cloudrun/unify/actualizar.sh`. El script compila los archivos incluidos, instala `legado-render`, configura su permiso y conserva la clave del servicio. Añade CORS para la subida directa sin borrar las reglas de otros orígenes. No ejecuta ninguna generación.
4. La actualización de `main` despliega Vercel automáticamente y conserva las variables de entorno. El adaptador permite publicar primero Vercel y completar después Google Cloud, sin presentar el montaje anterior como duradero.
5. Recarga la aplicación. El comprobador debe mostrar servicio `2026-09-13.1` actualizado y con el job configurado.
6. Comprueba primero guardado/restauración de un proyecto, subida de un archivo pequeño y montaje con recursos existentes. Después valida una generación corta con tus proveedores. Finalmente prueba un relato de cinco minutos y otro de ocho, revisando duración, voz y subtítulos.

Para un origen distinto, ejecuta el actualizador con `LEGADO_STUDIO_ORIGIN=https://tu-dominio`. Si utilizas una vista previa de Vercel, añade explícitamente ese origen a CORS conservando las reglas que ya tiene el bucket. Las URLs firmadas no sustituyen los permisos de lectura/escritura de la cuenta de servicio.

El job dispone de una hora por intento, un reintento y 2 GiB de memoria. Su cuenta de servicio necesita acceso al bucket. Si el despliegue del job falla, completa esa configuración: la API no intentará enviarle trabajos hasta que declare el ejecutor disponible. No se crea otro sistema de usuarios ni se migran o eliminan los archivos originales.

## Verificación realizada y pendiente

Pasaron 38 pruebas automatizadas de guiones por partes, revisión y corrección editorial, recuperación de audio, escrituras concurrentes, API, catálogo, mediciones, controles DOM y arranque del ejecutor. Se comprobó que una revisión guardada se recupera sin otra llamada, que se rechazan citas inexistentes y que la corrección no entra en un ciclo infinito. FFmpeg produjo un MP4 vertical real de ocho minutos con narración sintética dividida, imágenes, video, música audible cerca del final y subtítulos. La diferencia entre duración del video y la narración quedó dentro de un fotograma en las comprobaciones del plan.

Las pruebas de despliegue verifican las rutas agrupadas, su autenticación, el rechazo de rutas internas y la compatibilidad de ambos contratos de montaje.

La prueba de interfaz usa los archivos reales de HTML y JavaScript en un DOM local simulado. El navegador de vista previa fue bloqueado por el entorno; no constituye una comprobación visual en Safari. Quedan por verificar con acceso al despliegue real: permisos de Google, CORS, ejecución del job, respuestas reales de los proveedores y reproducción/descarga desde el iPhone. No se han comprobado mejoras de alcance o ingresos posteriores a esta actualización.

## Referencias técnicas

- [Límites de Vercel Functions](https://vercel.com/docs/functions/limitations).
- [Precondiciones de Google Cloud Storage](https://docs.cloud.google.com/storage/docs/request-preconditions).
- [Ejecución de Cloud Run Jobs](https://docs.cloud.google.com/run/docs/execute/jobs).
- [Permisos de Cloud Run](https://docs.cloud.google.com/iam/docs/roles-permissions/run).
- [Configuración CORS de Cloud Storage](https://docs.cloud.google.com/storage/docs/using-cors).
