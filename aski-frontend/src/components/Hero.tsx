import { useState } from 'react'

interface HeroProps { onStartChat: () => void }

const EXAMPLE_QUESTIONS = [
  'What are the admission requirements for BSc Computer Science at UCC?',
  'How do I apply for the Students Loan Trust Fund this year?',
  'What aggregate do I need for BSc Nursing at UCC?',
  'Which UCC programmes accept a Business elective combination?',
]

export default function Hero({ onStartChat }: HeroProps) {
  const [activeQ, setActiveQ] = useState(0)
  const [inputVal, setInputVal] = useState('')

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 140,
        paddingBottom: 100,
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-60%)',
        width: 800, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(91,106,240,0.14) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 200, right: -100,
        width: 500, height: 500,
        background: 'radial-gradient(ellipse at center, rgba(16,217,160,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,217,160,0.1)', border: '1px solid rgba(16,217,160,0.25)',
              borderRadius: 100, padding: '5px 14px', marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10d9a0', display: 'block', flexShrink: 0 }} />
              <span style={{ color: '#10d9a0', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>
                AI EDUCATION ASSISTANT
              </span>
            </div>

            <h1 style={{
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: 'clamp(38px, 4.5vw, 58px)',
              lineHeight: 1.08,
              color: '#f0f4ff',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              Every student<br />
              <em style={{ color: '#10d9a0', fontStyle: 'italic' }}>deserves</em> the right<br />
              answer.
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.7, color: '#94a3b8', maxWidth: 440, marginBottom: 40,
            }}>
              Aski AI is your intelligent education companion — ask anything about UCC's
              programmes, admissions, fees, and scholarships. Get clear, reliable answers instantly.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <button
                onClick={onStartChat}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #5b6af0, #7c3aed)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                  padding: '13px 28px', borderRadius: 10,
                  boxShadow: '0 4px 24px rgba(91,106,240,0.4)',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                  letterSpacing: '0.01em', fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(91,106,240,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(91,106,240,0.4)' }}
              >
                Start Asking
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <a
                href="#features"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: '#94a3b8', textDecoration: 'none', fontSize: 15, fontWeight: 500,
                  padding: '13px 24px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8' }}
              >
                Learn More
              </a>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 36 }}>
              {[
                { val: '86+', label: 'UCC programmes covered' },
                { val: '24/7', label: 'Availability' },
                { val: '98%', label: 'Satisfaction rate' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 26, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                    {stat.val}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI chat mockup */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'rgba(26,37,64,0.6)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}>
              {/* Chat header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L13 5v6L8 14 3 11V5L8 2z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
                    <circle cx="8" cy="8" r="1.5" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff' }}>Aski AI</div>
                  <div style={{ fontSize: 11, color: '#10d9a0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10d9a0', display: 'inline-block' }} />
                    Online
                  </div>
                </div>
              </div>

              {/* Chat body */}
              <div style={{ padding: '20px', minHeight: 260 }}>
                {/* AI intro message */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
                    background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5L11.5 4v6L7 12.5 2.5 10V4L7 1.5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{
                    background: 'rgba(91,106,240,0.12)', border: '1px solid rgba(91,106,240,0.2)',
                    borderRadius: '4px 14px 14px 14px', padding: '12px 14px', maxWidth: 280,
                  }}>
                    <p style={{ fontSize: 13, color: '#c7d2fe', lineHeight: 1.6, margin: 0 }}>
                      Hello! I'm Aski AI. Ask me anything about UCC admissions, programmes, fees, or scholarships. I'm here to help you make the best academic decisions.
                    </p>
                  </div>
                </div>

                {/* Example questions */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, color: '#475569', marginBottom: 8, fontWeight: 500, letterSpacing: '0.05em' }}>
                    TRY ASKING:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {EXAMPLE_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveQ(i)}
                        style={{
                          background: activeQ === i ? 'rgba(16,217,160,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${activeQ === i ? 'rgba(16,217,160,0.25)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: 8, padding: '8px 12px',
                          color: activeQ === i ? '#10d9a0' : '#64748b',
                          fontSize: 12, textAlign: 'left', cursor: 'pointer',
                          transition: 'all 0.15s', lineHeight: 1.4,
                        }}
                        onMouseEnter={e => { if (activeQ !== i) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                        onMouseLeave={e => { if (activeQ !== i) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', gap: 8,
              }}>
                <input
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Ask a question about your education..."
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '9px 12px',
                    color: '#e2e8f0', fontSize: 13,
                    outline: 'none', fontFamily: 'Outfit, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(91,106,240,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button style={{
                  background: 'linear-gradient(135deg, #5b6af0, #7c3aed)',
                  border: 'none', borderRadius: 8, width: 36, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M8 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: -16, left: -20,
              background: 'rgba(16,217,160,0.1)',
              border: '1px solid rgba(16,217,160,0.3)',
              borderRadius: 12, padding: '10px 16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 12, color: '#10d9a0', fontWeight: 600 }}>✓ Verified Information</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Sourced from UCC's official admissions data</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
