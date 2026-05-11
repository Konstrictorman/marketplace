import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME, isRequestHttps } from "@/lib/auth-session";

function clearSessionCookie(response: NextResponse, request: NextRequest) {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isRequestHttps(request),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  const res = NextResponse.json(
    { data: { ok: true as const } },
    { status: 200 },
  );
  clearSessionCookie(res, request);
  return res;
}

/** Full navigation (e.g. bookmark) clears session and sends user to login. */
export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  clearSessionCookie(res, request);
  return res;
}
