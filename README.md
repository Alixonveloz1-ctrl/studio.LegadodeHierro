# Legado de Hierro — estudio personal

Herramienta de un solo operador para preparar guiones, narraciones, imágenes, clips, música y videos de Facebook y YouTube. No es una plataforma comercial ni añade gestión de usuarios. Conserva la clave personal `APP_KEY` para proteger los créditos de generación.

## Esta actualización

- Dirección editorial por público y familia de contenido: identidad, método, relato ilustrativo o práctica. Cada guion debe cumplir una promesa concreta, aportar ejemplos y evitar biografías inventadas, incentivos falsos y relleno. La versión en inglés se prepara solo cuando se solicita.
- Referencias propias y de canales afines con fuentes y límites de evidencia. Tres aperturas, plan narrativo, revisión de siete criterios, una ronda de corrección y escenas basadas en el texto final. [Análisis editorial](docs/GUIONES-2026-09.md) y [ejemplos originales](docs/EJEMPLOS-GUIONES.md).
- Biblioteca persistente de imágenes, videos y música, con descripciones, acciones, lugares, encuadres, continuidad, etiquetas, colecciones y favoritos. Recupera clips antiguos y acepta importaciones desde el teléfono. Propone un montaje, alterna materiales compatibles y señala los huecos. Permite generar únicamente las escenas pendientes.
- 96 encargos de tomas para ampliar la biblioteca de forma ordenada. Son propuestas; no se generan ni cobran automáticamente.
- Guiones largos y narraciones por etapas guardadas. Al interrumpirse una petición se recupera el trabajo terminado. Con Google Cloud actualizado, el montaje se ejecuta como Cloud Run Job y continúa aunque se cierre el teléfono.
- Resultados por publicación y ventanas de 24 horas, 7 y 28 días. Se comparan plataforma y duración similares, se separan ingresos y bonos y se conservan los valores desconocidos como tales.

No hay una fórmula que garantice viralidad o ingresos. La aplicación permite producir con menos gasto repetido y comprobar qué historias, ganchos y métodos funcionan con el público real.

## Uso

Consulta [la guía de uso y actualización](docs/ACTUALIZACION-2026-09.md). La interfaz ofrece piezas de 30, 45, 60, 90 y 120 segundos y modos Profesor/Relato de 3, 5 y 8 minutos.

1. Elige plataforma, público, familia editorial y hechos reales que quieras usar.
2. Genera el guion y lee la revisión y su evidencia. Si lo editas, guarda la nueva versión y vuelve a revisarla antes de narrar.
3. Genera o importa la narración. Su duración medida determina el montaje.
4. Pulsa **Elegir tomas de la biblioteca**, revisa las coincidencias y completa los huecos. También puedes generar imágenes y animarlas como antes.
5. Conserva o cambia la música, unifica y revisa el resultado antes de publicarlo.
6. Guarda las mediciones de cada publicación a la misma edad. Las siguientes propuestas usan esas observaciones cuando existen suficientes piezas comparables.

## Arquitectura

| Parte | Implementación |
|---|---|
| Interfaz | HTML y JavaScript; `app.js`, `studio-core.js`, `studio.js` |
| API | Una función Node.js 24 compartida y una función Edge para consultar Veo; las URLs públicas se conservan |
| Texto e imágenes | Google Vertex AI Gemini; modelos configurados en los adaptadores existentes |
| Voz | Gemini TTS, Chirp 3 HD o ElevenLabs |
| Persistencia | Google Cloud Storage: fichas, proyectos, etapas y archivos |
| Montaje | Node.js 24 y FFmpeg en Cloud Run Jobs |
| Datos del canal | Entrada manual de métricas; no solicita OAuth de Facebook o YouTube |

Los proyectos guardan referencias de archivos. La subida directa con URL firmada evita enviar un WAV largo o un MP4 en base64 a Vercel. Las escrituras condicionales de GCS protegen las etapas frente a peticiones simultáneas. Las partes terminadas se conservan para reintentos.

## Configuración existente

En Vercel:

| Variable | Uso |
|---|---|
| `APP_KEY` | Tu clave personal; obligatoria en producción |
| `GCP_SERVICE_ACCOUNT` | JSON de la cuenta de servicio, solo en variables del servidor |
| `GCP_PROJECT_ID` | Proyecto con Vertex AI habilitado |
| `GCS_OUTPUT_BUCKET` | Bucket de archivos y persistencia del estudio |
| `CLOUD_RUN_UNIFY_URL` | URL del servicio `legado-unify` |
| `UNIFY_KEY` | Secreto compartido con el servicio de montaje |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | Solo si utilizas ElevenLabs |

El servicio Cloud Run conserva `BUCKET` y `UNIFY_KEY`. El actualizador instala el job `legado-render` y configura `RENDER_JOB_RESOURCE`. Reutiliza la cuenta de servicio actual y le concede `roles/run.jobsExecutorWithOverrides` sobre ese job. Esa cuenta y la utilizada por Vercel deben poder leer y escribir los objetos necesarios del bucket. No pegues credenciales en el código o en la interfaz.

La subida directa necesita CORS para el origen del estudio. El instalador añade GET/HEAD/PUT para `https://studio.legadodehierro.com` conservando las reglas existentes. Para otro dominio usa `LEGADO_STUDIO_ORIGIN` al actualizar.

## Actualizar el montaje desde el celular

1. Abre [Cloud Shell](https://shell.cloud.google.com/) con la cuenta que administra tu proyecto.
2. Escribe esta única línea y pulsa Enter:

```bash
curl -fsSL https://studio.legadodehierro.com/u.sh | bash
```

3. Si Google muestra **Autorizar**, pulsa ese botón. Espera a que diga **LISTO: montaje actualizado** y recarga la aplicación.

El archivo `public/u.sh` incluye el montador completo. Selecciona el proyecto configurado en el instalador, conserva las claves existentes, prepara el ejecutor y comprueba que responde. Las claves no forman parte del archivo público. La instalación no genera videos.

## Verificación local

Requiere Node.js 24, Python 3 y, para la prueba de montaje, FFmpeg/ffprobe.

```bash
npm ci
npm ci --prefix cloudrun/unify
npm test
npm run check
npm run test:render
```

Las pruebas de lógica, API e interfaz simulan proveedores y almacenamiento. La prueba de render usa el código de producción y FFmpeg real para un MP4 vertical de ocho minutos con recursos sintéticos, música de cuatro segundos repetida y subtítulos al final. Ninguna prueba llama a servicios de generación de pago.

Al modificar el ejecutor, incrementa su `VERSION` y `VERSION_ESPERADA` en `server/unify.js`, y regenera los instaladores:

```bash
npm run build:installers
```

## Límites operativos

El navegador avanza los trabajos de guion y voz por etapas. Si se cierra, hay que reabrir y reanudar. El montaje sí continúa en Cloud Run después de iniciarse. La recuperación evita repetir etapas **ya guardadas**; una respuesta perdida antes de guardarla todavía puede obligar a repetir una llamada.

Los subtítulos sin tiempos del proveedor son estimados dentro de cada tramo medido y deben escucharse antes de publicar. Las coincidencias de biblioteca usan descripciones y etiquetas; no incluyen reconocimiento automático del contenido de los archivos antiguos. Los videos antiguos deben revisarse y catalogarse.

La API detecta el servidor de montaje instalado. Mientras Google Cloud conserve el servidor anterior, permite montar imágenes o clips por separado dentro de sus límites previos. El montaje mixto, los tiempos personalizados de imágenes y la recuperación duradera necesitan ejecutar el actualizador de Google Cloud. La versión esperada es `2026-09-13.1` y debe informar que el ejecutor duradero está configurado.

Los cambios en `main` disparan el despliegue automático del proyecto existente `legado-de-hierro-final`. Los manejadores viven en `server/`; `api/index.js` y las reescrituras de `vercel.json` los agrupan para respetar el límite del plan Hobby. No se necesita subir de plan ni crear otro proyecto.
