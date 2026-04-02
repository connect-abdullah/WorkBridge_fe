"use client";

import { useEffect } from "react";
import { colors, hexToHslChannels, hexToRgba } from "@/constants/colors";

export type ThemeName = keyof typeof colors;

export const THEME_STORAGE_KEY = "workbridge-theme";

function buildThemeCssVars(theme: ThemeName) {
  const c = colors[theme];

  return {
    // Tailwind `colors.*` tokens
    "--background": hexToHslChannels(c.background),
    "--foreground": hexToHslChannels(c.foreground),
    "--primary": hexToHslChannels(c.primary),
    "--primary-foreground": hexToHslChannels(c.white),
    "--secondary": hexToHslChannels(c.secondary),
    "--secondary-foreground": hexToHslChannels(c.foreground),
    "--accent": hexToHslChannels(c.accent),
    "--accent-foreground": hexToHslChannels(c.foreground),
    "--muted": hexToHslChannels(c.muted),
    "--muted-foreground": hexToHslChannels(c.mutedForeground),
    "--border": hexToHslChannels(c.border),
    "--input": hexToHslChannels(c.input),
    "--ring": hexToHslChannels(c.ring),
    "--destructive": hexToHslChannels(c.destructive),
    "--destructive-foreground": hexToHslChannels(c.white),
    "--card": hexToHslChannels(c.card),
    "--card-foreground": hexToHslChannels(c.foreground),
    "--popover": hexToHslChannels(c.popover),
    "--popover-foreground": hexToHslChannels(c.foreground),
    "--success": hexToHslChannels(c.success),
    "--success-foreground": hexToHslChannels(c.successForeground),
    "--warning": hexToHslChannels(c.warning),
    "--warning-foreground": hexToHslChannels(c.warningForeground),
    "--disabled": hexToHslChannels(c.disabled),

    "--sidebar-background": hexToHslChannels(c.sidebarBackground),
    "--sidebar-foreground": hexToHslChannels(c.sidebarForeground),
    "--sidebar-primary": hexToHslChannels(c.sidebarPrimary),
    "--sidebar-primary-foreground": hexToHslChannels(c.white),
    "--sidebar-accent": hexToHslChannels(c.sidebarAccent),
    "--sidebar-accent-foreground": hexToHslChannels(c.textSecondary),
    "--sidebar-border": hexToHslChannels(c.sidebarBorder),
    "--sidebar-ring": hexToHslChannels(c.sidebarRing),

    // Status badge tokens (raw hex colors)
    "--status-in-progress-bg": c.statusInProgressBg,
    "--status-in-progress-fg": c.statusInProgressFg,
    "--status-pending-bg": c.statusPendingBg,
    "--status-pending-fg": c.statusPendingFg,
    "--status-completed-bg": c.statusCompletedBg,
    "--status-completed-fg": c.statusCompletedFg,
    "--status-paid-bg": c.statusPaidBg,
    "--status-paid-fg": c.statusPaidFg,
    "--status-issue-bg": c.statusIssueBg,
    "--status-issue-fg": c.statusIssueFg,

    // Modal overlay
    "--overlay-color": hexToRgba(c.overlayBase, c.overlayAlpha),
  } satisfies Record<string, string>;
}

function toCssVarRule(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join("");
}

export function applyTheme(theme: ThemeName) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");

  const vars = buildThemeCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function getInitialTheme(): ThemeName {
  if (typeof window === "undefined") return "light";

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage might be unavailable; fall back to default.
  }

  return "light";
}

export function ThemeApplicator() {
  const lightVars = buildThemeCssVars("light");
  const darkVars = buildThemeCssVars("dark");

  // Provide SSR-safe defaults via CSS variables, then "hydrate" to the
  // persisted theme (or system preference) on the client.
  const css = `
:root { ${toCssVarRule(lightVars)} }
html.dark { ${toCssVarRule(darkVars)} }
`;

  useEffect(() => {
    const theme = getInitialTheme();

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore persistence failures (e.g., private mode).
    }

    applyTheme(theme);
  }, []);

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

