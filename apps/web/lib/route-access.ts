import { decodeMpSessionJwtPayload } from "@/lib/mp-session-payload";

export const UNAUTHORIZED_PATH = "/unauthorized";

export const ADMIN_ROLE = "admin";

/** Routes that require at least one of the listed role names (JWT `roles` claim). */
export const ROLE_PROTECTED_ROUTES: ReadonlyArray<{
  path: string;
  roles: readonly string[];
}> = [
  { path: "/manage", roles: [ADMIN_ROLE] as const },
  { path: "/dashboard", roles: [ADMIN_ROLE] as const },
];

export function hasAdminRole(roles: readonly string[]): boolean {
  return roles.includes(ADMIN_ROLE);
}

export function getRoleNamesFromSessionToken(token: string): string[] {
  const claims = decodeMpSessionJwtPayload(token);
  if (!claims) return [];

  if (Array.isArray(claims.roles)) {
    return claims.roles.filter((r): r is string => typeof r === "string");
  }

  if (typeof claims.role === "string" && claims.role.trim() !== "") {
    return [claims.role];
  }

  return [];
}

export function sessionHasAnyRole(
  token: string,
  allowed: readonly string[],
): boolean {
  const userRoles = getRoleNamesFromSessionToken(token);
  return allowed.some((role) => userRoles.includes(role));
}

export function requiredRolesForPath(
  pathname: string,
): readonly string[] | null {
  for (const route of ROLE_PROTECTED_ROUTES) {
    if (pathname === route.path || pathname.startsWith(`${route.path}/`)) {
      return route.roles;
    }
  }
  return null;
}
