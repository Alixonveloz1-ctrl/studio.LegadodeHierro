# Legado De Hierro Studio en Cloud Run.
# El contexto de construcción lo prepara instalar.sh: es la raíz de la app
# (public/, server/, api/, package.json) más main.js y este Dockerfile.
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
# La app decide su candado de producción mirando VERCEL_ENV (en Vercel lo
# inyecta la plataforma). Aquí se fija el mismo valor para que el
# comportamiento sea idéntico: producción cerrada con APP_KEY.
ENV VERCEL_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
# api/video-status.js está escrito como módulo ES (runtime Edge de Vercel);
# con extensión .mjs Node lo carga tal cual, sin tocar el archivo original.
RUN cp api/video-status.js video-status.mjs
CMD ["node", "main.js"]
