import { startTransition } from "react";

/** Minimal router surface for tests / isolation. */
export type NotificationRouter = { push: (href: string) => void };

export function navigateFromNotificationActionUrl(
  url: string,
  router: NotificationRouter,
) {
  const trimmed = url.trim();
  if (!trimmed) return;
  const push = (path: string) => startTransition(() => router.push(path));
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      if (typeof window !== "undefined" && u.origin === window.location.origin) {
        push(`${u.pathname}${u.search}${u.hash}`);
        return;
      }
    } catch {
      push(trimmed);
      return;
    }
    window.open(trimmed, "_blank", "noopener,noreferrer");
    return;
  }
  push(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}
