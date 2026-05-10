import { toast } from "sonner";

import { API_PREFIX } from "@/lib/apis/apiResponse";

const LOGOUT_REDIRECT_MS = 700;

/**
 * Client-side logout: hits the cookie-clearing logout endpoint and redirects
 * to the login page. The browser sends + clears cookies for us; localStorage
 * is no longer used for auth.
 */
export async function forceLogout(redirect = true) {
  if (typeof window === "undefined") return;

  try {
    const csrf = readCookie("csrf_token");
    await fetch(`${API_PREFIX}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      },
    });
  } catch {
    // Best effort — even if the call fails the redirect below puts the user
    // back at /auth/login where they can re-authenticate.
  }

  toast.success("Logout Successful, redirecting to login");

  if (redirect) {
    window.setTimeout(() => {
      window.location.href = "/auth/login";
    }, LOGOUT_REDIRECT_MS);
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
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
