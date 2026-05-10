/**
 * Session cookie used by `middleware.ts` and (once wired) login / logout routes.
 * Set this cookie on successful auth — prefer HttpOnly + Secure + SameSite via a Route Handler.
 */
export const AUTH_SESSION_COOKIE_NAME = "mp_session" as const;
