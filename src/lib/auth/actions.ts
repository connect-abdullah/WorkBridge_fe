"use server";

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { APIResponse } from "@/lib/apis/apiResponse";
import type {
  LoginSchema,
  RegisterSchema,
  UserRead,
} from "@/lib/apis/auth/schema";

type Role = "freelancer" | "client";

export type AuthActionResult = {
  success: boolean;
  message: string;
  user?: UserRead | null;
};

function getInternalBase(): string {
  const internal = process.env.INTERNAL_API_URL;
  if (internal && internal.length > 0) return internal.replace(/\/$/, "");
  const isDev = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
  const fallback = isDev
    ? process.env.NEXT_PUBLIC_DEV_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!fallback) {
    throw new Error("Missing INTERNAL_API_URL");
  }
  return fallback.replace(/\/$/, "");
}

/**
 * Parse a single Set-Cookie line into a structured cookie definition.
 * We need this because Next's cookies().set() expects a structured object,
 * not a raw header line.
 */
function parseSetCookie(line: string):
  | {
      name: string;
      value: string;
      maxAge?: number;
      expires?: Date;
      path?: string;
      domain?: string;
      secure: boolean;
      httpOnly: boolean;
      sameSite?: "lax" | "strict" | "none";
    }
  | null {
  const parts = line.split(";").map((p) => p.trim());
  if (parts.length === 0) return null;
  const [head, ...attrs] = parts;
  const eq = head.indexOf("=");
  if (eq === -1) return null;
  const name = head.slice(0, eq).trim();
  const value = decodeURIComponent(head.slice(eq + 1).trim());
  if (!name) return null;

  const out: ReturnType<typeof parseSetCookie> = {
    name,
    value,
    secure: false,
    httpOnly: false,
  };
  for (const attr of attrs) {
    const [k, v] = attr.split("=").map((s) => s.trim());
    const key = k.toLowerCase();
    if (key === "max-age") out!.maxAge = Number(v);
    else if (key === "expires") out!.expires = new Date(v);
    else if (key === "path") out!.path = v;
    else if (key === "domain") out!.domain = v;
    else if (key === "secure") out!.secure = true;
    else if (key === "httponly") out!.httpOnly = true;
    else if (key === "samesite") {
      const lower = (v ?? "").toLowerCase();
      if (lower === "lax" || lower === "strict" || lower === "none") {
        out!.sameSite = lower;
      }
    }
  }
  return out;
}

/**
 * Forward every Set-Cookie header from FastAPI onto the Next response cookies
 * so the browser stores them as first-party cookies on the Next.js origin.
 */
async function applyUpstreamCookies(setCookies: string[]): Promise<void> {
  if (!setCookies.length) return;
  const store = await cookies();
  for (const line of setCookies) {
    const parsed = parseSetCookie(line);
    if (!parsed) continue;
    store.set({
      name: parsed.name,
      value: parsed.value,
      path: parsed.path,
      domain: parsed.domain,
      maxAge: parsed.maxAge,
      expires: parsed.expires,
      httpOnly: parsed.httpOnly,
      secure: parsed.secure,
      sameSite: parsed.sameSite,
    });
  }
}

async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  for (const name of ["access_token", "refresh_token", "csrf_token"]) {
    try {
      store.delete(name);
    } catch {
      // cookies().delete throws if not allowed in current scope; ignore.
    }
  }
}

async function callAuthEndpoint<TBody extends object>(
  path: "/auth/login" | "/auth/signup" | "/auth/logout" | "/auth/refresh",
  body?: TBody,
): Promise<{ status: number; data: APIResponse<UserRead> | null; cookies: string[] }> {
  const base = getInternalBase();
  const res = await fetch(`${base}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const setCookies =
    typeof (res.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (
          res.headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : (res.headers.get("set-cookie") ?? "")
          .split(/,(?=[^;]+=[^;]+)/)
          .map((s) => s.trim())
          .filter(Boolean);

  let json: APIResponse<UserRead> | null = null;
  try {
    json = (await res.json()) as APIResponse<UserRead>;
  } catch {
    json = null;
  }
  return { status: res.status, data: json, cookies: setCookies };
}

// ---------------------------------------------------------------------------
// Server actions
// ---------------------------------------------------------------------------

export async function loginAction(
  payload: LoginSchema,
): Promise<AuthActionResult> {
  const { status, data, cookies: upstreamCookies } = await callAuthEndpoint(
    "/auth/login",
    payload,
  );
  if (status >= 200 && status < 300 && data?.success) {
    await applyUpstreamCookies(upstreamCookies);
    // Bust every cached server render so the next navigation reflects the
    // newly-authenticated session.
    revalidatePath("/", "layout");
    return {
      success: true,
      message: data.message ?? "Logged in",
      user: data.data ?? null,
    };
  }
  return {
    success: false,
    message: data?.message ?? "Invalid email or password",
  };
}

export async function signupAction(
  payload: RegisterSchema,
): Promise<AuthActionResult> {
  const { status, data, cookies: upstreamCookies } = await callAuthEndpoint(
    "/auth/signup",
    payload,
  );
  if (status >= 200 && status < 300 && data?.success) {
    await applyUpstreamCookies(upstreamCookies);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: data.message ?? "Account created",
      user: data.data ?? null,
    };
  }
  return {
    success: false,
    message: data?.message ?? "Could not create account",
  };
}

/**
 * Logout the current session and redirect to /auth/login. Best-effort: the
 * browser cookies are cleared even if the upstream call fails.
 */
export async function logoutAction(redirectTo: string = "/auth/login"): Promise<never> {
  try {
    const { cookies: upstreamCookies } = await callUpstreamLogout();
    await applyUpstreamCookies(upstreamCookies);
  } catch {
    // ignore — fall through to local clear
  }
  await clearAuthCookies();
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

async function callUpstreamLogout(): Promise<{ cookies: string[] }> {
  const base = getInternalBase();
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const csrf = store.get("csrf_token")?.value;
  const res = await fetch(`${base}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    cache: "no-store",
  });
  const setCookies =
    typeof (res.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (
          res.headers as unknown as { getSetCookie: () => string[] }
        ).getSetCookie()
      : (res.headers.get("set-cookie") ?? "")
          .split(/,(?=[^;]+=[^;]+)/)
          .map((s) => s.trim())
          .filter(Boolean);
  return { cookies: setCookies };
}

export type { Role };
