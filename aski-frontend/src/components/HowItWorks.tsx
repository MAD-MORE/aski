interface HowItWorksProps { onStartChat: () => void }

const STEPS = [
  {
    num: '01',
    title: 'Ask your question',
    description:
      'Type your question in plain language — no special format needed. Ask about admission requirements, fees, bursaries, course content, or anything else.',
    color: '#5b6af0',
    detail: 'Supports English and major South African languages.',
  },
  {
    num: '02',
    title: 'AI finds the answer',
    description:
      'Aski AI searches verified education databases, official university publications, and government records to find the most accurate and current information.',
    color: '#10d9a0',
    detail: 'Processing takes under 3 seconds on average.',
  },
  {
    num: '03',
    title: 'You get clarity',
    description:
      'Receive a clear, human-readable explanation with source references. Ask follow-up questions to dive deeper or explore related topics.',
    color: '#a78bfa',
    detail: 'Every answer includes source attribution.',
  },
]

export default function HowItWorks({ onStartChat }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      style={{
        padding: '100px 0',
        background: 'rgba(17,24,39,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(16,217,160,0.1)', border: '1px solid rgba(16,217,160,0.25)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ color: '#10d9a0', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>
              HOW IT WORKS
            </span>
          </div>
          <h2 style={{
            fontFamily: 'DM Serif Display, Georgia, serif',
            fontSize: 'clamp(28px, 3vw, 42px)',
            lineHeight: 1.12, color: '#f0f4ff',
            margin: '0 0 16px', letterSpacing: '-0.02em',
          }}>
            From question to clarity<br />
            <em style={{ color: '#818cf8', fontStyle: 'italic' }}>in seconds.</em>
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>
            Aski AI makes it effortless to get the exact education information you need, when you need it.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 40, left: '16.67%', right: '16.67%', height: 1,
            background: 'linear-gradient(90deg, rgba(91,106,240,0.4), rgba(16,217,160,0.4), rgba(167,139,250,0.4))',
            zIndex: 0,
          }} />

          {STEPS.map((step, i) => (
            <div key={i} style={{ padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Step number bubble */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 32px',
                background: `${step.color}12`,
                border: `2px solid ${step.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{
                  fontFamily: 'DM Serif Display, Georgia, serif',
                  fontSize: 26, color: step.color, fontWeight: 400,
                }}>
                  {step.num}
                </span>
                {/* Pulse ring */}
                <div style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  border: `1px solid ${step.color}18`,
                }} />
              </div>

              <h3 style={{
                fontFamily: 'DM Serif Display, Georgia, serif',
                fontSize: 22, color: '#f0f4ff',
                margin: '0 0 14px', letterSpacing: '-0.01em',
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 16px' }}>
                {step.description}
              </p>
              <span style={{
                display: 'inline-block',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                color: step.color, background: `${step.color}10`,
                padding: '4px 10px', borderRadius: 100,
                border: `1px solid ${step.color}20`,
              }}>
                {step.detail}
              </span>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div style={{
          marginTop: 80, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(91,106,240,0.1), rgba(16,217,160,0.06))',
          border: '1px solid rgba(91,106,240,0.2)',
          borderRadius: 20, padding: '48px 32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />
          <div style={{ position: 'relative' }}>
            <h3 style={{
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: 'clamp(22px, 2.5vw, 32px)',
              color: '#f0f4ff', margin: '0 0 12px',
            }}>
              Ready to get your answers?
            </h3>
            <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 28px' }}>
              Join thousands of students making informed education decisions with Aski AI.
            </p>
            <button
              onClick={onStartChat}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #5b6af0, #7c3aed)',
                color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                padding: '14px 32px', borderRadius: 10,
                boxShadow: '0 4px 24px rgba(91,106,240,0.45)',
                transition: 'box-shadow 0.2s, transform 0.15s',
                letterSpacing: '0.01em', fontFamily: 'Outfit, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,106,240,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(91,106,240,0.45)' }}
            >
              Start Asking — It's Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
