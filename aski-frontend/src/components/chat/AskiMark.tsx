/**
 * The Aski AI mark.
 *
 * Previously three different icons stood in for "the AI" — a
 * hexagon-with-nodes in the sidebar logo, a similar but not-quite
 * -identical version in the welcome hero, and a third shape in the
 * message avatar. None of them were specific to what this product
 * actually is. This is one glyph, used everywhere: a mortarboard
 * (graduation cap), because Aski is an education product, not a
 * generic "AI sparkle." It reads clearly from 16px (sidebar) up to
 * 88px (hero) because it's a single flat silhouette rather than
 * fine detail.
 */

interface AskiMarkProps {
  size?: number
  /**
   * 'flat'  — single currentColor stroke, for tiny/mono contexts (sidebar logo, buttons)
   * 'gradient' — filled with the brand gradient, for standalone use on a light background
   * 'white' — flat white glyph, for use on top of a colored gradient surface (avatars)
   */
  variant?: 'flat' | 'gradient' | 'white'
}

export default function AskiMark({ size = 24, variant = 'gradient' }: AskiMarkProps) {
  const gradientId = 'aski-mark-gradient'
  const solid = variant === 'white' ? '#ffffff' : 'currentColor'
  const dim = variant === 'white' ? 'rgba(255,255,255,0.7)' : 'currentColor'

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16233F" />
            <stop offset="100%" stopColor="#F2B705" />
          </linearGradient>
        </defs>
      )}
      {/* Cap board */}
      <path
        d="M16 6L29 12.5L16 19L3 12.5L16 6Z"
        fill={variant === 'gradient' ? `url(#${gradientId})` : variant === 'white' ? solid : 'none'}
        stroke={variant === 'flat' ? 'currentColor' : 'none'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Button */}
      <circle cx="16" cy="12.5" r="1.4" fill={variant === 'gradient' ? 'rgba(255,255,255,0.85)' : solid} />
      {/* Tassel */}
      <path
        d="M24 15.2V21.5"
        stroke={variant === 'gradient' ? 'rgba(255,255,255,0.85)' : dim}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="23" r="1.5" fill={variant === 'gradient' ? 'rgba(255,255,255,0.85)' : dim} />
      {/* Base band — reads as the head opening beneath the board */}
      <path
        d="M9 15.5V21C9 21 12 24 16 24C20 24 23 21 23 21V15.5"
        stroke={variant === 'gradient' ? 'rgba(255,255,255,0.6)' : dim}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
