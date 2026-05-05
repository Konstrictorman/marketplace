import type { CorsOptions } from "cors";

/**
 * CORS: set `CORS_ORIGIN` to a comma-separated list (e.g. `http://localhost:3000`).
 * If unset: permissive in non-production; in production no cross-origin until you set it.
 */
export function getCorsOptions(): CorsOptions {
  const raw = process.env.CORS_ORIGIN?.trim();

  if (raw) {
    const origins = raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    return { origin: origins, credentials: true };
  }

  const permissiveInDev = process.env.NODE_ENV !== "production";
  return {
    origin: permissiveInDev,
    credentials: true,
  };
}
