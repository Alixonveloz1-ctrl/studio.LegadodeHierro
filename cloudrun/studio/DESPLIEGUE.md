# Legado De Hierro Studio en Cloud Run

La puerta de la app (antes el proyecto de Vercel `legado-de-hierro-final`)
vive como servicio de Cloud Run **`legado-studio`** en el proyecto
`drama-ai-studio-513501` (us-central1). El almacén
`drama-ai-studio-513501-legado-de-hierro` y el montador `legado-unify`
no cambian: ya vivían en ese proyecto.

## Piezas

- `main.js` — servidor Node (solo biblioteca estándar) que sirve `public/`
  y despacha `/api/<nombre>` a `api/index.js` con `?endpoint=<nombre>`
  (los mismos destinos que los rewrites de `vercel.json`) y
  `/api/video-status` al controlador Edge `api/video-status.js`, que el
  Dockerfile copia como `video-status.mjs` para cargarlo como módulo ES.
- `Dockerfile` — Node 24, `npm ci --omit=dev`, `VERCEL_ENV=production`
  (la app mira esa marca para mantener el candado de producción con
  `APP_KEY`, igual que en Vercel).
- `instalar.sh` — despliegue completo desde Google Cloud Shell.

## Desplegar

En Cloud Shell (cuenta alixoncbp1@gmail.com), con el repositorio clonado:

```bash
bash cloudrun/studio/instalar.sh
```

El instalador activa APIs, prepara el contexto, trae las variables de
producción desde Vercel (los valores nunca se imprimen; si Vercel pide
iniciar sesión, muestra el enlace de autorización), despliega el servicio
público y comprueba la salud (portada 200, `/app.js` 200 y `/api/login`
sin clave = 401). Es idempotente.

Vercel no se toca: queda como respaldo.
