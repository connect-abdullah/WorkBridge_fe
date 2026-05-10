import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { forceLogout } from "@/lib/forceLogout";

/**
 * Client HTTP layer.
 *
 * After the SSR migration the browser only ever talks to the same Next.js
 * origin. The Next Route Handler at `/api/[...path]` proxies to FastAPI and
 * keeps cookies first-party, so we use a relative `/api/v1` baseURL with
 * `withCredentials: true` and let the browser send/receive cookies on its
 * own. No tokens are read from localStorage anymore.
 *
 * On the server side (server components / actions / route handlers) you
 * should use `src/lib/api/server.ts` instead — it speaks directly to the
 * internal FastAPI URL.
 */

export const API_PREFIX = "/api/v1";

const isServer = typeof window === "undefined";

function readCookie(name: string): string | null {
  if (isServer) return null;
  const target = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      try {
        return decodeURIComponent(trimmed.slice(target.length));
      } catch {
        return trimmed.slice(target.length);
      }
    }
  }
  return null;
}

const http: AxiosInstance = axios.create({
  baseURL: "",
  timeout: 90_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // FormData uploads need the browser to set their own multipart boundary.
  if (config.data instanceof FormData && config.headers) {
    delete (config.headers as Record<string, unknown>)["Content-Type"];
  }

  // For unsafe methods, echo the CSRF cookie value via the configured header
  // (double-submit pattern). On the server, the server axios client handles
  // this — that path is intentionally inert here.
  const method = (config.method ?? "get").toLowerCase();
  if (!isServer && UNSAFE_METHODS.has(method)) {
    const csrf = readCookie("csrf_token");
    if (csrf) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["X-CSRF-Token"] = csrf;
    }
  }

  return config;
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isServer) return false;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (
      axios.isCancel(error) ||
      error.code === "ERR_CANCELED" ||
      error.message === "canceled"
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
          _isRefresh?: boolean;
        })
      | undefined;

    if (status === 401 && !isServer && original && !original._retry) {
      // Avoid infinite loops on the refresh endpoint itself.
      const url = original.url ?? "";
      if (url.includes("/auth/refresh") || original._isRefresh) {
        forceLogout();
        return Promise.reject(error);
      }

      original._retry = true;
      const ok = await refreshAccessToken();
      if (ok) {
        return http.request(original);
      }
      forceLogout();
      return Promise.reject(error);
    }

    if (status === 403) {
      console.error("Access forbidden");
    } else if (status === 404) {
      console.error("Resource not found");
    } else if (status && status >= 500) {
      console.error("Server error occurred");
    }

    return Promise.reject(error);
  },
);

function withPrefix(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith(API_PREFIX)) return url;
  if (url.startsWith("/")) return `${API_PREFIX}${url}`;
  return `${API_PREFIX}/${url}`;
}

export async function get<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await http.get<T>(withPrefix(url), config);
  return res.data;
}

export async function post<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await http.post<T>(withPrefix(url), body, config);
  return res.data;
}

export async function put<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await http.put<T>(withPrefix(url), body, config);
  return res.data;
}

export async function patch<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await http.patch<T>(withPrefix(url), body, config);
  return res.data;
}

export async function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await http.delete<T>(withPrefix(url), config);
  return res.data;
}

/**
 * Back-compat shim: previously the template let callers swap the token
 * source via setTokenGetter. With cookie auth there is nothing to inject —
 * the browser sends cookies on its own. Kept as a noop so existing imports
 * don't break during the migration.
 */
export function setTokenGetter(fn: () => string | null) {
  void fn;
}

export { http };
export default http;
