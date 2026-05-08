# Production image for apps/api (Express). Build context: monorepo root.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/

COPY packages/database ./packages/database/
COPY packages/types ./packages/types/
COPY apps/api ./apps/api/

RUN npm ci \
  && npm run build -w @marketplace/database \
  && npm run build -w @marketplace/types \
  && npm run build -w api \
  && npm prune --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
