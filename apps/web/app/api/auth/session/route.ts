import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-session";
import {
  initialsFromDisplayName,
  initialsFromInstitutionalEmail,
} from "@/lib/user-initials";

type SessionClaims = {
  institutionalEmail?: string;
  username?: string;
};

function decodeJwtPayload(token: string): SessionClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  try {
    const json = atob(b64);
    return JSON.parse(json) as SessionClaims;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (!token?.length) {
    return NextResponse.json(
      { data: { authenticated: false as const } },
      { status: 200 },
    );
  }

  const claims = decodeJwtPayload(token);
  if (!claims) {
    return NextResponse.json(
      { data: { authenticated: false as const } },
      { status: 200 },
    );
  }

  const email =
    typeof claims.institutionalEmail === "string"
      ? claims.institutionalEmail
      : undefined;
  const username =
    typeof claims.username === "string" ? claims.username : undefined;

  const initials = email
    ? initialsFromInstitutionalEmail(email)
    : username
      ? initialsFromDisplayName(username)
      : "?";

  return NextResponse.json(
    {
      data: {
        authenticated: true as const,
        initials,
      },
    },
    { status: 200 },
  );
}
