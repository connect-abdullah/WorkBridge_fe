import "server-only";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { API_PREFIX } from "@/lib/apis/apiResponse";

/**
 * Server axios client.
 *
 * Runs on the Next.js server (server components, server actions, route
 * handlers) and talks to FastAPI directly via INTERNAL_API_URL — bypassing
 * the public Route Handler proxy. Cookies from the incoming Next request
 * are forwarded so authentication continues to work for SSR fetches.
 *
 * Never imported into client components.
 */

function getInternalBase(): string {
  const internal = process.env.INTERNAL_API_URL;
  if (internal && internal.length > 0) return internal.replace(/\/$/, "");

  // Local-dev fallback — keeps the template working without an explicit env.
  const isDev = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
  const fallback = isDev
    ? process.env.NEXT_PUBLIC_DEV_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!fallback) {
    throw new Error(
      "Missing INTERNAL_API_URL (and no NEXT_PUBLIC_DEV_URL / NEXT_PUBLIC_BACKEND_URL fallback)",
    );
  }
  return fallback.replace(/\/$/, "");
}

const serverHttp: AxiosInstance = axios.create({
  baseURL: getInternalBase(),
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Per-request: do not follow redirects automatically (let the caller decide).
  maxRedirects: 0,
  validateStatus: (s) => s >= 200 && s < 300,
});

serverHttp.interceptors.request.use(async (config) => {
  // Forward incoming Cookie header so the FastAPI auth dependency sees the
  // same access_token / csrf_token that the browser is presenting to Next.
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    if (cookieHeader) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Cookie"] = cookieHeader;
    }
    // Also echo CSRF for unsafe methods (FastAPI enforces double-submit).
    const method = (config.method ?? "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const csrf = cookieStore.get("csrf_token")?.value;
      if (csrf) {
        (config.headers as Record<string, string>)["X-CSRF-Token"] = csrf;
      }
    }
  } catch {
    // cookies() throws outside of a request context — for example during
    // build-time prerendering of static segments. Server-axios calls there
    // simply won't include cookies, which is the correct behaviour.
  }
  return config;
});

function withPrefix(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith(API_PREFIX)) return url;
  if (url.startsWith("/")) return `${API_PREFIX}${url}`;
  return `${API_PREFIX}/${url}`;
}

export type ServerFetchOptions = AxiosRequestConfig & {
  /** Treat 401 as `null` data (so SSR pages don't crash on logged-out users). */
  swallow401?: boolean;
};

async function unwrap<T>(
  promise: Promise<{ data: T }>,
  opts?: ServerFetchOptions,
): Promise<T | null> {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    if (opts?.swallow401 && (err as AxiosError).response?.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function serverGet<T = unknown>(
  url: string,
  opts?: ServerFetchOptions,
) {
  return unwrap<T>(serverHttp.get<T>(withPrefix(url), opts), opts);
}

export async function serverPost<T = unknown, B = unknown>(
  url: string,
  body?: B,
  opts?: ServerFetchOptions,
) {
  return unwrap<T>(serverHttp.post<T>(withPrefix(url), body, opts), opts);
}

export async function serverPut<T = unknown, B = unknown>(
  url: string,
  body?: B,
  opts?: ServerFetchOptions,
) {
  return unwrap<T>(serverHttp.put<T>(withPrefix(url), body, opts), opts);
}

export async function serverPatch<T = unknown, B = unknown>(
  url: string,
  body?: B,
  opts?: ServerFetchOptions,
) {
  return unwrap<T>(serverHttp.patch<T>(withPrefix(url), body, opts), opts);
}

export async function serverDelete<T = unknown>(
  url: string,
  opts?: ServerFetchOptions,
) {
  return unwrap<T>(serverHttp.delete<T>(withPrefix(url), opts), opts);
}

export { serverHttp };
