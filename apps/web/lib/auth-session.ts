import type { NextRequest } from "next/server";

/**
 * Session cookie used by `proxy.ts` and login / logout Route Handlers.
 * Set this cookie on successful auth — prefer HttpOnly + Secure + SameSite via a Route Handler.
 */
export const AUTH_SESSION_COOKIE_NAME = "mp_session" as const;

/** Use `Secure` only when this request came over HTTPS (or behind TLS that sets X-Forwarded-Proto). Not `NODE_ENV` — Docker `production` is often served over plain HTTP on localhost. */
export function isRequestHttps(request: NextRequest): boolean {
  const forwarded = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  return request.nextUrl.protocol === "https:" || forwarded === "https";
}
