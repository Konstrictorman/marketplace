import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Monorepo root (`apps/web` → `../../`) — consistent tracing in Docker and with Turbopack. */
const repoRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
