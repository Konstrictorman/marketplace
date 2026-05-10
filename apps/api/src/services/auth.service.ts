import { prisma } from "@marketplace/database";
import { SignJWT } from "jose";
import { verifyPassword } from "../lib/password-hash.js";
import { HttpError } from "../lib/http-errors.js";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

function getJwtSecretKey(): Uint8Array {
  const raw = process.env.JWT_SECRET?.trim();
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new HttpError(
        503,
        "Authentication is not configured on this server",
        "auth_misconfigured",
      );
    }
    console.warn(
      "[auth] JWT_SECRET is missing or shorter than 32 characters; using an insecure development default.",
    );
    return new TextEncoder().encode(
      "dev-only-insecure-jwt-secret-replace-me!!",
    );
  }
  return new TextEncoder().encode(raw);
}

export type LoginSuccess = {
  token: string;
  tokenType: "Bearer";
  expiresIn: string;
};

/**
 * Validates credentials and returns a signed HS256 JWT.
 * Claims: `sub` (user id), `userId`, `username` (display name), `roles` (role names), `role` (first role name, or empty string).
 */
export async function loginWithPassword(input: {
  institutionalEmail: string;
  password: string;
}): Promise<LoginSuccess> {
  const email = input.institutionalEmail.trim().toLowerCase();

  const invalidCredentials = new HttpError(
    401,
    "Invalid email or password",
    "invalid_credentials",
  );

  const user = await prisma.user.findUnique({
    where: { institutionalEmail: email },
    select: {
      id: true,
      name: true,
      passwordHash: true,
      isActive: true,
      roles: {
        include: {
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!user) {
    throw invalidCredentials;
  }

  if (!user.isActive) {
    throw new HttpError(403, "Account is disabled", "user_inactive");
  }

  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    throw invalidCredentials;
  }

  const roleNames = user.roles
    .map((ur) => ur.role.name)
    .sort((a, b) => a.localeCompare(b));
  const primaryRole = roleNames[0] ?? "";

  const secret = getJwtSecretKey();
  const token = await new SignJWT({
    userId: user.id,
    username: user.name,
    roles: roleNames,
    role: primaryRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);

  return {
    token,
    tokenType: "Bearer",
    expiresIn: JWT_EXPIRES_IN,
  };
}
