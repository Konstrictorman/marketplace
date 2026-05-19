import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "./lib/auth-session";
import {
  requiredRolesForPath,
  sessionHasAnyRole,
  UNAUTHORIZED_PATH,
} from "./lib/route-access";

const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
/** Next Route Handler that proxies to Express `POST /api/auth/login` and sets `mp_session`. */
const AUTH_LOGIN_PROXY_PATH = "/api/auth/login";
/** Clears `mp_session` (POST JSON or GET redirect). */
const AUTH_LOGOUT_PATH = "/api/auth/logout";
/** Public session probe for UI (initials); cookie is HttpOnly. */
const AUTH_SESSION_PATH = "/api/auth/session";

/** Paths that do not require a session. */
const PUBLIC_PREFIXES = [
  LOGIN_PATH,
  REGISTER_PATH,
  UNAUTHORIZED_PATH,
  AUTH_LOGIN_PROXY_PATH,
  AUTH_LOGOUT_PATH,
  AUTH_SESSION_PATH,
] as const;

function pathnameIsPublic(pathname: string): boolean {
  return (PUBLIC_PREFIXES as readonly string[]).some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Treat non-empty session cookie as authenticated.
 * Replace with signed JWT / opaque session-id validation when your auth API exists.
 */
function isAuthenticated(request: NextRequest): boolean {
  const value = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  return value !== undefined && value.length > 0;
}

/**
 * Only same-origin relative paths are allowed (open-redirect hardening).
 */
function safeCallbackPath(path: string): string | null {
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path === LOGIN_PATH || path.startsWith(`${LOGIN_PATH}/`)) return null;
  if (path === REGISTER_PATH || path.startsWith(`${REGISTER_PATH}/`))
    return null;
  return path;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = isAuthenticated(request);
  const isPublic = pathnameIsPublic(pathname);

  if (isPublic) {
    if (pathname === LOGIN_PATH && authenticated) {
      const callback = request.nextUrl.searchParams.get("callbackUrl");
      const target = (callback && safeCallbackPath(callback)) ?? "/";
      return NextResponse.redirect(new URL(target, request.url));
    }
    if (pathname === REGISTER_PATH && authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    const returnTo = `${pathname}${search}`;
    if (safeCallbackPath(returnTo)) {
      loginUrl.searchParams.set("callbackUrl", returnTo);
    }
    return NextResponse.redirect(loginUrl);
  }

  const allowedRoles = requiredRolesForPath(pathname);
  if (allowedRoles) {
    const token = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value ?? "";
    if (!sessionHasAnyRole(token, allowedRoles)) {
      return NextResponse.redirect(new URL(UNAUTHORIZED_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run for all paths except Next internals and typical static assets.
     * Adjust if you add more public files under `public/`.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
