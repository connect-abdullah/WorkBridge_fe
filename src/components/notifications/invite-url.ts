/**
 * Extract invite token from notification `action_url` (relative or absolute).
 * Backend uses `/join-project?token=...` (see WorkBridge_bk `_join_url`).
 */
export function parseInviteTokenFromActionUrl(
  actionUrl: string | null | undefined,
): string | null {
  if (!actionUrl?.trim()) return null;
  const trimmed = actionUrl.trim();
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const u = new URL(trimmed);
      const path = u.pathname.replace(/\/$/, "");
      if (!path.endsWith("/join-project") && path !== "/join-project") {
        return null;
      }
      const token = u.searchParams.get("token")?.trim();
      return token || null;
    }
    const pathAndQuery = trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;
    const u = new URL(pathAndQuery, "http://_local.invalid");
    const path = u.pathname.replace(/\/$/, "");
    if (!path.endsWith("/join-project") && path !== "/join-project") {
      return null;
    }
    const token = u.searchParams.get("token")?.trim();
    return token || null;
  } catch {
    return null;
  }
}
