/**
 * Session cookie used by `proxy.ts` and login / logout Route Handlers.
 * Set this cookie on successful auth — prefer HttpOnly + Secure + SameSite via a Route Handler.
 */
export const AUTH_SESSION_COOKIE_NAME = "mp_session" as const;
