/**
 * Design tokens for the chat interface.
 *
 * Before this file existed, the same color/spacing/typography object
 * was copy-pasted into ChatInterface.tsx and WelcomeScreen.tsx (and
 * MessageBubble.tsx kept its own inline copy). That's a system-design
 * smell: three sources of truth that will inevitably drift as the UI
 * grows. Pulling it into one module means a token change here
 * propagates everywhere it's used, instead of being fixed in one
 * component and silently stale in the others.
 *
 * Palette: "Palm & Gari" — grounded in the product's actual subject
 * (Ghanaian tertiary admissions) rather than a generic indigo/purple
 * AI-startup gradient. Palm (deep emerald) is the primary brand
 * color; Gari (warm gold) is used sparingly for accents that carry
 * an "excellence / certified" connotation — a scholarship badge, a
 * distinction grade. `positive` is a separate, plainer green kept
 * only for status semantics (online/success), so the decorative
 * brand gold never gets confused with a status signal.
 */

export const BREAKPOINTS = {
  mobile: 480, // phones
  tablet: 768, // large phones / small tablets — sidebar collapses here
} as const

export const MEDIA = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const

export const DESIGN_SYSTEM = {
  colors: {
    background: '#ffffff',
    surface: '#F5F7F5',
    surfaceAlt: '#F0F3EF',
    border: '#E3E7E1',
    borderStrong: '#D6DBD3',
    text: '#161B18',
    textSecondary: '#5B6359',
    textTertiary: '#93998F',
    primary: '#0B6B4F',      // Palm — deep emerald, brand primary
    primaryDark: '#084A37',  // Palm, shaded — gradients & hover
    accent: '#D9A62E',       // Gari — warm gold, decorative/brand accent only
    positive: '#1C8F63',     // status green — kept distinct from accent
    error: '#C81E3A',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    headingLarge: { fontSize: 20, fontWeight: 700, lineHeight: 1.2 },
    headingMedium: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: 15, fontWeight: 400, lineHeight: 1.6 },
    bodySmall: { fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
    captionSmall: { fontSize: 11, fontWeight: 600, lineHeight: 1.3 },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    light: '0 2px 8px rgba(11, 27, 20, 0.06)',
    medium: '0 4px 16px rgba(11, 27, 20, 0.1)',
    hover: '0 8px 24px rgba(11, 107, 79, 0.18)',
  },
  transitions: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
  // WCAG 2.5.5 (Target Size) / iOS & Material HIG minimum for any
  // tappable control — applied to every interactive element in the
  // header and input bar so touch accuracy doesn't degrade on phones.
  touchTarget: 44,
} as const
