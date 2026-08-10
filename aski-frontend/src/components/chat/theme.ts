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
 */

export const BREAKPOINTS = {
  mobile: 480, // phones
  tablet: 768, // large phones / small tablets — sidebar collapses here
} as const

export const MEDIA = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
} as const

export const DESIGN_SYSTEM = {
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
    surfaceAlt: '#f7f7f8',
    border: '#e0e0e0',
    borderStrong: '#ddd',
    text: '#0f0f0f',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#5b6af0',
    primaryDark: '#7c3aed',
    accent: '#10d9a0',
    error: '#ff4444',
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
    light: '0 2px 8px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
    hover: '0 8px 24px rgba(91, 106, 240, 0.15)',
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
