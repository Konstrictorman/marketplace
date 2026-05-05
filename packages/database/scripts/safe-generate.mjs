/**
 * Ensures Prisma can run `generate` even when DATABASE_URL is unset
 * (e.g. fresh `npm ci` before a local `.env` exists). Uses the same default
 * as `docker-compose.yml`; override with a real URL for migrations/runtime.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://marketplace:marketplace@127.0.0.1:5432/marketplace";
}

const result = spawnSync("npx", ["prisma", "generate"], {
  cwd: pkgRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
