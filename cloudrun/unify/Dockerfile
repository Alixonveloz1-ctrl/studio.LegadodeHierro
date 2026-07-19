# Servicio legado-unify: Node 20 + ffmpeg (para medir, ajustar velocidad, unir y pegar audio)
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV NODE_ENV=production
CMD ["node", "index.js"]
