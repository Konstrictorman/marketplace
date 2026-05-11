# Production Next.js image (standalone output). Build context: monorepo root.
FROM node:20-alpine AS builder

WORKDIR /app

# Inlined into the client bundle at build time — must be the URL the *browser* uses to reach Express.
# Default: local Docker / dev. Override at image build: `docker build --build-arg NEXT_PUBLIC_API_URL=http://<public-ip>:3001 ...`
# or docker-compose `args` / env (see docker-compose.yml `WEB_NEXT_PUBLIC_API_URL`).
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/

COPY packages/database ./packages/database/
COPY packages/types ./packages/types/
COPY apps/web ./apps/web/

RUN npm ci \
  && npm run build -w @marketplace/types \
  && npm run build -w web

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
