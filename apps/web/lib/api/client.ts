import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{ message?: string; error?: string; details?: unknown }>,
  ) => {
    const apiError: ApiError = {
      status: error.response?.status ?? 500,
      message:
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        "Unexpected API error",
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  },
);
