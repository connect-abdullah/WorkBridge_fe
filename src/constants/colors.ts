export const colors = {
  light: {
    // Base
    white: "#FFFFFF",
    black: "#000000",

    // Brand
    primary: "#000000",
    ring: "#000000",

    // Surfaces
    background: "#FFFFFF",
    card: "#FFFFFF",
    sidebarBackground: "#FFFFFF",

    // Text
    foreground: "#000000",
    textSecondary: "#4B5563",
    mutedForeground: "#6B7280",

    // UI tokens
    secondary: "#F3F4F6",
    accent: "#F3F4F6",
    muted: "#F3F4F6",
    border: "#E5E7EB",
    input: "#E5E7EB",
    destructive: "#D6455D",
    disabled: "#D1D5DB",

    // Popover
    popover: "#FFFFFF",

    // Semantic colors (used by Tailwind `text-success`/`text-warning`)
    success: "#15803D",
    successForeground: "#FFFFFF",
    warning: "#92400E",
    warningForeground: "#FFFFFF",

    // Sidebar tokens
    sidebarForeground: "#000000",
    sidebarPrimary: "#000000",
    sidebarAccent: "#F3F4F6",
    sidebarBorder: "#E5E7EB",
    sidebarRing: "#000000",

    // Status badges (raw hex colors used in Tailwind `bg-[var(--...)]`)
    statusInProgressBg: "#DBEAFE",
    statusInProgressFg: "#1D4ED8",
    statusPendingBg: "#FEF3C7",
    statusPendingFg: "#92400E",
    statusCompletedBg: "#DCFCE7",
    statusCompletedFg: "#15803D",
    statusPaidBg: "#DCFCE7",
    statusPaidFg: "#15803D",
    statusIssueBg: "#FEE2E2",
    statusIssueFg: "#B91C1C",

    // Overlay
    overlayBase: "#000000",
    overlayAlpha: 0.45,
  },
  dark: {
    // Base
    white: "#EEF2F7",
    black: "#0E1116",

    // Brand (vibrant but easy on eyes)
    primary: "#A78BFA",
    ring: "#C4B5FD",

    // Surfaces
    background: "#0B0B10",
    card: "#111118",
    sidebarBackground: "#0E0E14",

    // Text
    foreground: "#EDEDF5",
    textSecondary: "#C7C7D6",
    mutedForeground: "#9A9AAF",

    // UI tokens
    secondary: "#161622",
    accent: "#1D1D2A",
    muted: "#14141E",
    border: "#2A2A3A",
    input: "#2A2A3A",
    destructive: "#E17A8E",
    disabled: "#36404D",

    // Popover
    popover: "#111118",

    // Semantic colors (used by Tailwind `text-success`/`text-warning`)
    success: "#5CCB97",
    successForeground: "#0E1116",
    warning: "#D6AD51",
    warningForeground: "#0E1116",

    // Sidebar tokens
    sidebarForeground: "#EDEDF5",
    sidebarPrimary: "#A78BFA",
    sidebarAccent: "#1D1D2A",
    sidebarBorder: "#2A2A3A",
    sidebarRing: "#C4B5FD",

    // Status badges (raw hex colors used in Tailwind `bg-[var(--...)]`)
    statusInProgressBg: "#1A2433",
    statusInProgressFg: "#6EA1D4",
    statusPendingBg: "#2C2616",
    statusPendingFg: "#D6AD51",
    statusCompletedBg: "#1A2A23",
    statusCompletedFg: "#5CCB97",
    statusPaidBg: "#1A2A23",
    statusPaidFg: "#5CCB97",
    statusIssueBg: "#2D1D22",
    statusIssueFg: "#E17A8E",

    // Overlay
    overlayBase: "#0E1116",
    overlayAlpha: 0.5,
  },
} as const;

function normalizeHex(hex: string): string {
  const sanitized = hex.replace("#", "").trim();
  if (sanitized.length === 3) {
    return sanitized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  return sanitized;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hexToHslChannels(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
