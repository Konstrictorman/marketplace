import fs from "node:fs";
import path from "node:path";

const DEFAULT_UPLOAD_DIR = path.resolve(process.cwd(), "data", "uploads");
const DEFAULT_PUBLIC_BASE = "http://localhost:3001/uploads";

/** Writable directory for uploaded binaries (bind-mounted in Docker as `/data/uploads`). */
export function getUploadDir(): string {
  const raw = process.env.UPLOAD_DIR?.trim();
  if (!raw) {
    return DEFAULT_UPLOAD_DIR;
  }
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

/**
 * Browser-reachable URL prefix for stored files (no trailing slash).
 * Files are served at `GET /uploads/:filename` on this host.
 */
export function getPublicUploadUrlBase(): string {
  const raw = process.env.PUBLIC_UPLOAD_URL_BASE?.trim() ?? DEFAULT_PUBLIC_BASE;
  return raw.replace(/\/$/, "");
}

export function ensureUploadDir(): void {
  fs.mkdirSync(getUploadDir(), { recursive: true });
}
