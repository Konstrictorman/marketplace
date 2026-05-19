/**
 * Decodes the JWT payload from `mp_session` (no signature verification).
 * Route Handlers and RSC only need stable claims the API already issued.
 */
export type MpSessionPayload = {
  sub?: string;
  userId?: string;
  institutionalEmail?: string;
  username?: string;
  roles?: string[];
  role?: string;
};

export function decodeMpSessionJwtPayload(
  token: string,
): MpSessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  try {
    const json = atob(b64);
    return JSON.parse(json) as MpSessionPayload;
  } catch {
    return null;
  }
}

/** Prefer explicit `userId` claim, then JWT `sub` (both set on login). */
export function getUserIdFromMpSessionPayload(
  claims: MpSessionPayload,
): string | undefined {
  const raw =
    typeof claims.userId === "string"
      ? claims.userId
      : typeof claims.sub === "string"
        ? claims.sub
        : "";
  const trimmed = raw.trim();
  return trimmed === "" ? undefined : trimmed;
}
