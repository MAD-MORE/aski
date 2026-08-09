import { useState } from 'react'

interface HeaderProps {
  onMenuToggle: () => void
  onNewChat: () => void
  isMobileOpen: boolean
}

// Design System
const DESIGN_SYSTEM = {
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
    border: '#e0e0e0',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#5b6af0',
    accent: '#10d9a0',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    headingMedium: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: 15, fontWeight: 400, lineHeight: 1.6 },
    bodySmall: { fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    light: '0 2px 8px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '0.15s',
    normal: '0.2s',
  },
}

export default function Header({ onMenuToggle, onNewChat, isMobileOpen }: HeaderProps) {
  const [hoverNewChat, setHoverNewChat] = useState(false)

  return (
    <header
      style={{
        background: DESIGN_SYSTEM.colors.background,
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
        padding: `${DESIGN_SYSTEM.spacing.md}px ${DESIGN_SYSTEM.spacing.lg}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        boxShadow: DESIGN_SYSTEM.shadows.light,
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* Left: Menu Toggle + Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: DESIGN_SYSTEM.spacing.md,
      }}>
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          title="Toggle sidebar"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: DESIGN_SYSTEM.spacing.sm,
            color: DESIGN_SYSTEM.colors.text,
            width: 40,
            height: 40,
            borderRadius: DESIGN_SYSTEM.radius.md,
            transition: `all ${DESIGN_SYSTEM.transitions.fast}`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="mobile-menu-btn"
          onMouseEnter={e => {
            e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo & Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: DESIGN_SYSTEM.spacing.sm,
          cursor: 'pointer',
          transition: `transform ${DESIGN_SYSTEM.transitions.fast}`,
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {/* Avatar Icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: DESIGN_SYSTEM.radius.md,
            background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary}, ${DESIGN_SYSTEM.colors.accent})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${DESIGN_SYSTEM.colors.primary}20`,
          }}>
            <svg width="18" height="18" viewBox="0 0 34 34" fill="none">
              <path d="M17 3L30 10v14L17 31 4 24V10L17 3z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="17" cy="17" r="3" fill="white"/>
            </svg>
          </div>

          {/* Brand Text */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>
            <div style={{
              ...DESIGN_SYSTEM.typography.headingMedium,
              color: DESIGN_SYSTEM.colors.text,
            }}>
              Aski AI
            </div>
            <div style={{
              fontSize: 11,
              color: DESIGN_SYSTEM.colors.textTertiary,
              fontWeight: 500,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}>
              Education Assistant
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: DESIGN_SYSTEM.spacing.md,
      }}>
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          style={{
            background: hoverNewChat ? DESIGN_SYSTEM.colors.primary : `${DESIGN_SYSTEM.colors.primary}15`,
            color: hoverNewChat ? 'white' : DESIGN_SYSTEM.colors.primary,
            border: `1.5px solid ${DESIGN_SYSTEM.colors.primary}`,
            borderRadius: DESIGN_SYSTEM.radius.md,
            padding: `${DESIGN_SYSTEM.spacing.sm}px ${DESIGN_SYSTEM.spacing.md}px`,
            cursor: 'pointer',
            transition: `all ${DESIGN_SYSTEM.transitions.normal}`,
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_SYSTEM.spacing.sm,
            fontSize: 14,
            fontWeight: 600,
            ...DESIGN_SYSTEM.typography.bodySmall,
          }}
          onMouseEnter={e => {
            setHoverNewChat(true)
            e.currentTarget.style.boxShadow = `0 4px 16px ${DESIGN_SYSTEM.colors.primary}25`
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            setHoverNewChat(false)
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span style={{ display: 'none' }} className="text-label">New Chat</span>
        </button>

        {/* Settings / More Menu */}
        <button
          title="Settings"
          style={{
            background: 'transparent',
            border: `1.5px solid ${DESIGN_SYSTEM.colors.border}`,
            borderRadius: DESIGN_SYSTEM.radius.md,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: DESIGN_SYSTEM.colors.textSecondary,
            transition: `all ${DESIGN_SYSTEM.transitions.fast}`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary
            e.currentTarget.style.color = DESIGN_SYSTEM.colors.primary
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
            e.currentTarget.style.color = DESIGN_SYSTEM.colors.textSecondary
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .text-label {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
