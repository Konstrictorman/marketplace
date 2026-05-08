-- Runs first under docker-entrypoint-initdb.d (alphabetical order).
--
-- `02_marketplace_snapshot.sql` is a pg_dump of `public` from local Postgres (same DB name).
-- Refresh snapshot after schema/data changes:
--   docker run --rm -v "$(pwd)/docker/postgres/init:/out" postgres:18-alpine pg_dump \
--     "postgresql://USER:PASS@host.docker.internal:5432/marketplace" \
--     --no-owner --no-acl --exclude-table=public._prisma_migrations --schema=public \
--     -f /out/02_marketplace_snapshot.sql
--
-- Compose no longer runs Prisma migrate/seed for Docker DB — Prisma schema still drives local dev;
-- after schema changes, regenerate this dump or bring migrations back in Compose.

ALTER DATABASE marketplace SET timezone TO 'America/Bogota';

CREATE EXTENSION IF NOT EXISTS pgcrypto;
