import { SUGGESTED_QUESTIONS } from './mockData'

interface WelcomeScreenProps {
  onQuestion: (q: string) => void
}

// Design System (Consistency)
const DESIGN_SYSTEM = {
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
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
    headingLarge: { fontSize: 36, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    headingMedium: { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: 16, fontWeight: 400, lineHeight: 1.7 },
    bodySmall: { fontSize: 14, fontWeight: 500, lineHeight: 1.6 },
    caption: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 },
  },
  radius: {
    md: 12,
    lg: 16,
  },
  shadows: {
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    hover: '0 8px 24px rgba(91, 106, 240, 0.2)',
  },
  transitions: {
    fast: '0.15s',
    normal: '0.2s',
  },
}

export default function WelcomeScreen({ onQuestion }: WelcomeScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: `${DESIGN_SYSTEM.spacing.xl}px ${DESIGN_SYSTEM.spacing.lg}px`,
      minHeight: '100%',
    }}>
      {/* Hero Avatar - Visual Hierarchy Anchor */}
      <div style={{
        width: 88,
        height: 88,
        borderRadius: DESIGN_SYSTEM.radius.lg,
        marginBottom: DESIGN_SYSTEM.spacing.xl,
        background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary}, ${DESIGN_SYSTEM.colors.accent})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 12px 40px ${DESIGN_SYSTEM.colors.primary}30`,
        position: 'relative',
      }}>
        <svg width="44" height="44" viewBox="0 0 34 34" fill="none">
          <path d="M17 3L30 10v14L17 31 4 24V10L17 3z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="17" cy="17" r="4" fill="white"/>
          <circle cx="17" cy="9" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="17" cy="25" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="9" cy="13" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="25" cy="13" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="9" cy="21" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="25" cy="21" r="1.5" fill="rgba(255,255,255,0.6)"/>
        </svg>
        {/* Pulse Ring - Subtle Feedback */}
        <div style={{
          position: 'absolute',
          inset: -12,
          borderRadius: DESIGN_SYSTEM.radius.lg,
          border: `2px solid ${DESIGN_SYSTEM.colors.primary}15`,
          animation: 'pulse-ring 2.5s ease-out infinite',
        }} />
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.2); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Primary Headline - Clear Information Hierarchy */}
      <h1 style={{
        ...DESIGN_SYSTEM.typography.headingLarge,
        color: DESIGN_SYSTEM.colors.text,
        margin: `0 0 ${DESIGN_SYSTEM.spacing.md}px 0`,
        textAlign: 'center',
      }}>
        Hello, I'm <em style={{ color: DESIGN_SYSTEM.colors.accent, fontStyle: 'italic' }}>Aski AI</em>
      </h1>

      {/* Subheadline - Context & Value Proposition */}
      <p style={{
        ...DESIGN_SYSTEM.typography.body,
        color: DESIGN_SYSTEM.colors.textSecondary,
        textAlign: 'center',
        maxWidth: 540,
        margin: `0 0 ${DESIGN_SYSTEM.spacing.xl}px 0`,
      }}>
        Your AI assistant for education decisions, school info, admissions, courses, and more. Ask anything!
      </p>

      {/* Capability Pills - Visual Affordances */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: DESIGN_SYSTEM.spacing.md,
        justifyContent: 'center',
        marginBottom: DESIGN_SYSTEM.spacing.xl,
        maxWidth: 760,
      }}>
        {[
          { label: 'Admissions', color: DESIGN_SYSTEM.colors.primary },
          { label: 'Bursaries', color: DESIGN_SYSTEM.colors.accent },
          { label: 'Courses', color: '#a78bfa' },
          { label: 'APS Calc', color: '#f59e0b' },
          { label: 'Rankings', color: DESIGN_SYSTEM.colors.primary },
          { label: 'Careers', color: DESIGN_SYSTEM.colors.accent },
        ].map(pill => (
          <span
            key={pill.label}
            style={{
              ...DESIGN_SYSTEM.typography.caption,
              color: pill.color,
              background: `${pill.color}12`,
              padding: `${DESIGN_SYSTEM.spacing.xs}px ${DESIGN_SYSTEM.spacing.md}px`,
              borderRadius: 100,
              border: `1.5px solid ${pill.color}28`,
              transition: `all ${DESIGN_SYSTEM.transitions.fast}`,
              cursor: 'default',
              whiteSpace: 'nowrap',
            }}
          >
            {pill.label}
          </span>
        ))}
      </div>

      {/* Suggested Questions Section - Interaction Pattern */}
      <div style={{ width: '100%', maxWidth: 760 }}>
        <p style={{
          ...DESIGN_SYSTEM.typography.caption,
          color: DESIGN_SYSTEM.colors.textTertiary,
          textAlign: 'center',
          marginBottom: DESIGN_SYSTEM.spacing.lg,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
        }}>
          Suggested Questions
        </p>

        {/* Grid - Consistent Layout (FIXED: proper centering) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: DESIGN_SYSTEM.spacing.md,
          marginTop: DESIGN_SYSTEM.spacing.lg,
        }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => onQuestion(q.text)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: DESIGN_SYSTEM.spacing.md,
                background: DESIGN_SYSTEM.colors.surface,
                border: `1.5px solid #e0e0e0`,
                borderRadius: DESIGN_SYSTEM.radius.lg,
                padding: DESIGN_SYSTEM.spacing.md,
                cursor: 'pointer',
                textAlign: 'left',
                transition: `all ${DESIGN_SYSTEM.transitions.normal}`,
                fontFamily: 'Outfit, sans-serif',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0'
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.hover
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                {q.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  ...DESIGN_SYSTEM.typography.caption,
                  color: DESIGN_SYSTEM.colors.textTertiary,
                  marginBottom: DESIGN_SYSTEM.spacing.xs,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {q.category}
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: DESIGN_SYSTEM.colors.text,
                  lineHeight: 1.5,
                }}>
                  {q.text}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
