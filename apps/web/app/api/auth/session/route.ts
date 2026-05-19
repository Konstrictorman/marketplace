import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-session";
import {
  decodeMpSessionJwtPayload,
  getUserIdFromMpSessionPayload,
} from "@/lib/mp-session-payload";
import { getRoleNamesFromSessionToken } from "@/lib/route-access";
import {
  initialsFromDisplayName,
  initialsFromInstitutionalEmail,
} from "@/lib/user-initials";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (!token?.length) {
    return NextResponse.json(
      { data: { authenticated: false as const } },
      { status: 200 },
    );
  }

  const claims = decodeMpSessionJwtPayload(token);
  if (!claims) {
    return NextResponse.json(
      { data: { authenticated: false as const } },
      { status: 200 },
    );
  }

  const userId = getUserIdFromMpSessionPayload(claims);
  if (!userId) {
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
        userId,
        initials,
        roles: getRoleNamesFromSessionToken(token),
      },
    },
    { status: 200 },
  );
}
