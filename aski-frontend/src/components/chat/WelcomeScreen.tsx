import { SUGGESTED_QUESTIONS } from './mockData'

interface WelcomeScreenProps {
  onQuestion: (q: string) => void
}

export default function WelcomeScreen({ onQuestion }: WelcomeScreenProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '40px 24px',
      maxWidth: 680, margin: '0 auto', width: '100%',
    }}>
      {/* Hero avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: 20, marginBottom: 24,
        background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 24px rgba(91,106,240,0.2)',
        position: 'relative',
      }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <path d="M17 3L30 10v14L17 31 4 24V10L17 3z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="17" cy="17" r="4" fill="white"/>
          <circle cx="17" cy="9" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="17" cy="25" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="9" cy="13" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="25" cy="13" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="9" cy="21" r="1.5" fill="rgba(255,255,255,0.6)"/>
          <circle cx="25" cy="21" r="1.5" fill="rgba(255,255,255,0.6)"/>
        </svg>
        {/* Pulse */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: 28,
          border: '1px solid rgba(91,106,240,0.15)',
          animation: 'pulse-ring 2.5s ease-out infinite',
        }} />
        <style>{`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.3); opacity: 0; }
          }
        `}</style>
      </div>

      <h1 style={{
        fontFamily: 'DM Serif Display, Georgia, serif',
        fontSize: 'clamp(24px, 3vw, 34px)',
        color: '#000', margin: '0 0 12px', textAlign: 'center',
        letterSpacing: '-0.02em', lineHeight: 1.15,
      }}>
        Hello, I'm <em style={{ color: '#10d9a0', fontStyle: 'italic' }}>Aski AI.</em>
      </h1>

      <p style={{
        fontSize: 15, color: '#666', textAlign: 'center',
        maxWidth: 480, margin: '0 0 40px', lineHeight: 1.7,
      }}>
        I can help you with education decisions, school information, courses, admissions, fees, and more. Ask me anything.
      </p>

      {/* Capability pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
        {[
          { label: 'Admissions', color: '#5b6af0' },
          { label: 'Bursaries & NSFAS', color: '#10d9a0' },
          { label: 'Course selection', color: '#a78bfa' },
          { label: 'APS calculator', color: '#f59e0b' },
          { label: 'University rankings', color: '#5b6af0' },
          { label: 'Career guidance', color: '#10d9a0' },
        ].map(pill => (
          <span
            key={pill.label}
            style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
              color: pill.color, background: `${pill.color}15`,
              padding: '6px 14px', borderRadius: 100,
              border: `1px solid ${pill.color}30`,
            }}
          >
            {pill.label}
          </span>
        ))}
      </div>

      {/* Suggested questions */}
      <div style={{ width: '100%' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 14, textTransform: 'uppercase' }}>
          Try asking
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => onQuestion(q.text)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#f8f8f8',
                border: '1px solid #e0e0e0',
                borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.2s',
                fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f0f0f0'
                e.currentTarget.style.borderColor = '#5b6af0'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,106,240,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f8f8f8'
                e.currentTarget.style.borderColor = '#e0e0e0'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{q.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase' }}>
                  {q.category}
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>
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
