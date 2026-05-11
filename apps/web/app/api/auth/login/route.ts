import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME, isRequestHttps } from "@/lib/auth-session";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

/** Parses `7d`, `24h`, `30m`, `900s` into seconds for `Set-Cookie` Max-Age. */
function expiresInToMaxAgeSeconds(expiresIn: string): number {
  const m = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
  if (!m) return 7 * 24 * 60 * 60;
  const n = Number.parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult =
    unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
  return n * mult;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid_json",
          message: "Request body must be JSON",
        },
      },
      { status: 400 },
    );
  }

  const institutionalEmail =
    typeof body === "object" &&
    body !== null &&
    "institutionalEmail" in body &&
    typeof (body as { institutionalEmail: unknown }).institutionalEmail ===
      "string"
      ? (body as { institutionalEmail: string }).institutionalEmail
      : undefined;
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof (body as { password: unknown }).password === "string"
      ? (body as { password: string }).password
      : undefined;

  if (!institutionalEmail?.trim() || !password) {
    return NextResponse.json(
      {
        error: {
          code: "validation_failed",
          message: "institutionalEmail and password are required",
        },
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ institutionalEmail, password }),
  });

  const payload: unknown = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  const data =
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    typeof (payload as { data: unknown }).data === "object" &&
    (payload as { data: unknown }).data !== null
      ? (payload as { data: { token?: string; expiresIn?: string } }).data
      : undefined;

  const token = data?.token;
  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_upstream",
          message: "Login succeeded but no token was returned",
        },
      },
      { status: 502 },
    );
  }

  const maxAge = expiresInToMaxAgeSeconds(data?.expiresIn ?? "7d");

  const res = NextResponse.json({ data: { ok: true } }, { status: 200 });
  res.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isRequestHttps(request),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
