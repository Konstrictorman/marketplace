# Postgres major version must match the pg_dump used for ./init (currently PG 18).
# Schema + data load from docker/postgres/init/*.sql — no separate migrate/seed in Compose.
FROM postgres:18-alpine

COPY init/*.sql /docker-entrypoint-initdb.d/
