import { webApiClient } from "@/lib/api/client";

export type LoginRequestBody = {
  institutionalEmail: string;
  password: string;
};

export type LoginResponseData = {
  ok: true;
};

/**
 * Signs in via the Next.js BFF `POST /api/auth/login`, which proxies to Express and sets the HttpOnly `mp_session` cookie.
 */
export async function login(
  body: LoginRequestBody,
): Promise<LoginResponseData> {
  const { data } = await webApiClient.post<{ data: LoginResponseData }>(
    "/api/auth/login",
    body,
  );
  return data.data;
}

export type LogoutResponseData = {
  ok: true;
};

/**
 * Clears the HttpOnly `mp_session` cookie via `POST /api/auth/logout`.
 */
export async function logout(): Promise<LogoutResponseData> {
  const { data } = await webApiClient.post<{ data: LogoutResponseData }>(
    "/api/auth/logout",
  );
  return data.data;
}

export type AuthSessionData =
  | { authenticated: false }
  | { authenticated: true; userId: string; initials: string; roles: string[] };

/**
 * Reads `mp_session` via `GET /api/auth/session` (same-origin, credentials).
 */
export async function getAuthSession(): Promise<AuthSessionData> {
  const { data } = await webApiClient.get<{ data: AuthSessionData }>(
    "/api/auth/session",
  );
  return data.data;
}
