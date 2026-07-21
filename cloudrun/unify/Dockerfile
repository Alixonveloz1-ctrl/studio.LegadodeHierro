# Servicio legado-unify: Node 20 + ffmpeg (para medir, ajustar velocidad, unir y pegar audio)
# Base fijada a bookworm (Debian 12): garantiza ffmpeg 5.1+, con soporte de
# amix normalize=0, acrossfade y alimiter que usa el pipeline de audio.
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV NODE_ENV=production
CMD ["node", "index.js"]
