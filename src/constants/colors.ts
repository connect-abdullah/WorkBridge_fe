export const colors = {
  light: {
    // Base
    white: "#FFFFFF",
    black: "#000000",

    // Brand (light: high-contrast neutral primary)
    primary: "#000000",
    ring: "#000000",

    // Surfaces
    background: "#FFFFFF",
    card: "#FFFFFF",
    sidebarBackground: "#FFFFFF",

    // Text hierarchy
    foreground: "#000000",
    textSecondary: "#4B5563",
    mutedForeground: "#6B7280",

    // UI tokens
    secondary: "#F3F4F6",
    accent: "#F3F4F6",
    muted: "#F3F4F6",
    border: "#E5E7EB",
    input: "#E5E7EB",
    inputBackground: "#FFFFFF",
    inputForeground: "#000000",
    destructive: "#D6455D",
    disabled: "#D1D5DB",

    // Popover
    popover: "#FFFFFF",

    // Semantic solids
    success: "#15803D",
    successForeground: "#FFFFFF",
    warning: "#92400E",
    warningForeground: "#FFFFFF",
    info: "#1D4ED8",
    infoForeground: "#FFFFFF",
    teal: "#0F766E",
    tealForeground: "#FFFFFF",

    // Sidebar
    sidebarForeground: "#000000",
    sidebarPrimary: "#000000",
    sidebarAccent: "#F3F4F6",
    sidebarBorder: "#E5E7EB",
    sidebarRing: "#000000",

    // Capsules (filled pills)
    statusInProgressBg: "#DBEAFE",
    statusInProgressFg: "#1E3A5F",
    statusPendingBg: "#FEF3C7",
    statusPendingFg: "#92400E",
    statusCompletedBg: "#DCFCE7",
    statusCompletedFg: "#15803D",
    statusPaidBg: "#DCFCE7",
    statusPaidFg: "#15803D",
    statusIssueBg: "#FEE2E2",
    statusIssueFg: "#B91C1C",
    statusNeutralBg: "#F3F4F6",
    statusNeutralFg: "#374151",

    // Overlay
    overlayBase: "#000000",
    overlayAlpha: 0.45,
  },
  dark: {
    // Base — pure white only used as foreground on saturated fills
    white: "#FFFFFF",
    black: "#0A0A0A",

    // Primary — violet (Linear-style), distinct from semantic info blue
    primary: "#8B5CF6",
    ring: "#A78BFA",

    // Surfaces — Tailwind `neutral` ladder: pure achromatic gray (no tint)
    background: "#0A0A0A",
    card: "#171717",
    sidebarBackground: "#0A0A0A",

    // Text — near-white, never pure white
    foreground: "#FAFAFA",
    textSecondary: "#D4D4D4",
    mutedForeground: "#A3A3A3",

    secondary: "#262626",
    accent: "#262626",
    muted: "#171717",
    border: "#262626",
    input: "#A3A3A3",
    inputBackground: "#E5E5E5",
    inputForeground: "#171717",
    destructive: "#F87171",
    disabled: "#525252",

    popover: "#171717",

    // Semantic solids — saturated 500-tier hues
    success: "#10B981",
    successForeground: "#FFFFFF",
    warning: "#F59E0B",
    warningForeground: "#171717",
    info: "#3B82F6",
    infoForeground: "#FFFFFF",
    teal: "#14B8A6",
    tealForeground: "#FFFFFF",

    sidebarForeground: "#FAFAFA",
    sidebarPrimary: "#A78BFA",
    sidebarAccent: "#262626",
    sidebarBorder: "#262626",
    sidebarRing: "#A78BFA",

    // Capsules — bright fills, max-contrast text
    statusInProgressBg: "#3B82F6",
    statusInProgressFg: "#FFFFFF",
    statusPendingBg: "#F59E0B",
    statusPendingFg: "#171717",
    statusCompletedBg: "#10B981",
    statusCompletedFg: "#FFFFFF",
    statusPaidBg: "#059669",
    statusPaidFg: "#FFFFFF",
    statusIssueBg: "#EF4444",
    statusIssueFg: "#FFFFFF",
    statusNeutralBg: "#404040",
    statusNeutralFg: "#FAFAFA",

    overlayBase: "#0A0A0A",
    overlayAlpha: 0.6,
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
