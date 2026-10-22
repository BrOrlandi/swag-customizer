FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 NUXT_STORAGE_DIR=/data/files
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
RUN mkdir -p /data/files && chown -R node:node /data
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
