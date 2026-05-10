/**
 * Shared Login CTA styling. Uses the default Button variant (primary fill)
 * everywhere so hero, navbar, and bottom band match.
 */
export const landingLoginCtaClassNames = {
  heroAndBand: "h-11 rounded-full px-6 shadow-md",
  /** Same colors as hero; slightly smaller for the sticky nav bar. */
  nav: "h-9 rounded-full px-4 text-xs shadow-md sm:h-10 sm:px-5 sm:text-sm",
} as const;
