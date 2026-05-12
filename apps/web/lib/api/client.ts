import axios, { AxiosError, isAxiosError } from "axios";

/**
 * Browser: must use a URL reachable from the client (`NEXT_PUBLIC_API_URL`).
 * Server (RSC, Route Handlers, etc.): prefer `API_BASE_URL` so Docker can use the Compose service name (`http://api:3001`).
 */
function getExpressApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  }
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001"
  );
}

const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    typeof (value as ApiError).status === "number" &&
    "message" in value &&
    typeof (value as ApiError).message === "string"
  );
}

function formatAxiosApiError(
  error: AxiosError<{
    message?: string;
    error?: string | { message?: string; code?: string };
    details?: unknown;
  }>,
): ApiError {
  const raw = error.response?.data;
  let message: string | undefined;
  if (raw && typeof raw === "object") {
    if (typeof raw.message === "string") {
      message = raw.message;
    }
    if (!message && raw.error !== undefined) {
      if (
        typeof raw.error === "object" &&
        raw.error !== null &&
        "message" in raw.error
      ) {
        message = String((raw.error as { message: unknown }).message);
      } else if (typeof raw.error === "string") {
        message = raw.error;
      }
    }
  }

  return {
    status: error.response?.status ?? 500,
    message: message ?? error.message ?? "Unexpected API error",
    details:
      raw && typeof raw === "object" && "details" in raw
        ? (raw as { details: unknown }).details
        : undefined,
  };
}

function attachApiErrorInterceptor(instance: ReturnType<typeof axios.create>) {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error)) {
        return Promise.reject(formatAxiosApiError(error));
      }
      return Promise.reject(error);
    },
  );
}

/** Express API: `API_BASE_URL` on server (Docker), `NEXT_PUBLIC_API_URL` in the browser. */
export const apiClient = axios.create({
  baseURL: getExpressApiBaseUrl(),
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

attachApiErrorInterceptor(apiClient);

/**
 * Same-origin Next.js app (Route Handlers under `app/api/*`), e.g. login BFF that sets HttpOnly cookies.
 * Not the external Express base URL.
 */
export const webApiClient = axios.create({
  baseURL:
    typeof window !== "undefined"
      ? ""
      : (process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000"),
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

attachApiErrorInterceptor(webApiClient);
