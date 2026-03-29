import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import { forceLogout } from "@/lib/forceLogout";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/";

export const API_PREFIX = "/api/v1";

let tokenGetter: () => string | null = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth:token");
  } catch {
    return null;
  }
};

export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = tokenGetter?.();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (
      axios.isCancel(error) ||
      error.code === "ERR_CANCELED" ||
      error.message === "canceled"
    ) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (typeof window !== "undefined") {
          forceLogout();
        }
      } else if (status === 403) {
        console.error("Access forbidden");
      } else if (status === 404) {
        console.error("Resource not found");
      } else if (status >= 500) {
        console.error("Server error occurred");
      }
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request error:", error.message);
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

export { http };
export default http;

