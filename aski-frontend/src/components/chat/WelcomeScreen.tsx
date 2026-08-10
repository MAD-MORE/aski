import { SUGGESTED_QUESTIONS } from './mockData'
import { DESIGN_SYSTEM } from './theme'

interface WelcomeScreenProps {
  onQuestion: (q: string) => void
}

export default function WelcomeScreen({ onQuestion }: WelcomeScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: `${DESIGN_SYSTEM.spacing.lg}px ${DESIGN_SYSTEM.spacing.lg}px`,
      minHeight: '100%',
      background: DESIGN_SYSTEM.colors.background,
    }}>
      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: 680,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: DESIGN_SYSTEM.spacing.lg,
      }}>
        {/* Hero Avatar Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: DESIGN_SYSTEM.spacing.lg,
          marginBottom: DESIGN_SYSTEM.spacing.sm,
        }}>
          {/* Avatar */}
          <div style={{
            width: 88,
            height: 88,
            borderRadius: DESIGN_SYSTEM.radius.lg,
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
            {/* Pulse Ring */}
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

          {/* Headline & Description */}
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: DESIGN_SYSTEM.spacing.md,
          }}>
            <h1 style={{
              ...DESIGN_SYSTEM.typography.headingLarge,
              fontSize: 'clamp(26px, 7vw, 36px)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: DESIGN_SYSTEM.colors.text,
              margin: 0,
            }}>
              Hello, I'm <em style={{ color: DESIGN_SYSTEM.colors.accent, fontStyle: 'italic' }}>Aski AI</em>
            </h1>

            <p style={{
              ...DESIGN_SYSTEM.typography.body,
              fontSize: 16,
              color: DESIGN_SYSTEM.colors.textSecondary,
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 520,
            }}>
              Your AI assistant for education decisions, school info, admissions, courses, and more. Ask anything!
            </p>
          </div>
        </div>

        {/* Capability Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: DESIGN_SYSTEM.spacing.sm,
          justifyContent: 'center',
          width: '100%',
          marginBottom: DESIGN_SYSTEM.spacing.md,
        }}>
          {[
            { label: 'Admissions', color: DESIGN_SYSTEM.colors.primary },
            { label: 'Scholarships', color: DESIGN_SYSTEM.colors.accent },
            { label: 'Courses', color: '#a78bfa' },
            { label: 'Aggregate Calc', color: '#f59e0b' },
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
                fontSize: 12,
              }}
            >
              {pill.label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          width: '100%',
          height: 1,
          background: `${DESIGN_SYSTEM.colors.textTertiary}20`,
          margin: `${DESIGN_SYSTEM.spacing.md}px 0`,
        }} />

        {/* Suggested Questions Section */}
        <div style={{ width: '100%' }}>
          <div style={{
            ...DESIGN_SYSTEM.typography.caption,
            color: DESIGN_SYSTEM.colors.textTertiary,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: DESIGN_SYSTEM.spacing.lg,
            fontSize: 11,
            fontWeight: 600,
          }}>
            Try asking about:
          </div>

          {/* Suggested Questions Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: DESIGN_SYSTEM.spacing.md,
            width: '100%',
          }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => onQuestion(q.text)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: DESIGN_SYSTEM.spacing.sm,
                  background: DESIGN_SYSTEM.colors.surface,
                  border: `1.5px solid #e5e5e5`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  padding: DESIGN_SYSTEM.spacing.md,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: `all ${DESIGN_SYSTEM.transitions.normal} cubic-bezier(0.16, 1, 0.3, 1)`,
                  fontFamily: 'Outfit, sans-serif',
                  width: '100%',
                  minHeight: '110px',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary
                  e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.hover
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface
                  e.currentTarget.style.borderColor = '#e5e5e5'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
                  {q.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    ...DESIGN_SYSTEM.typography.caption,
                    color: DESIGN_SYSTEM.colors.textTertiary,
                    marginBottom: DESIGN_SYSTEM.spacing.xs,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: 10,
                  }}>
                    {q.category}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: DESIGN_SYSTEM.colors.text,
                    lineHeight: 1.4,
                  }}>
                    {q.text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
