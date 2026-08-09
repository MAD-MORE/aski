import { useState } from 'react'

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L20 7.5v9L12 21 4 16.5v-9L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 9v-2M12 17v-2M9 12H7M17 12h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'AI Education Assistant',
    description:
      'Ask any question and receive intelligent, contextual explanations. Aski AI understands academic terminology, institutional structures, and the nuances of education systems.',
    accent: '#5b6af0',
    tags: ['Natural language', 'Instant answers', 'Smart follow-ups'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 20.5C8 17.5 10 16 12 16s4 1.5 4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Education Guidance',
    description:
      'Navigate complex decisions about schools, faculties, and career paths. Get personalized guidance based on your academic profile, interests, and goals.',
    accent: '#10d9a0',
    tags: ['School matching', 'Aggregate calculator', 'Career alignment'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Trusted Information',
    description:
      'Every answer is grounded in verified data from official university publications, GTEC and GES sources, and Students Loan Trust Fund records. No guesswork — only accurate, current information.',
    accent: '#a78bfa',
    tags: ['Verified sources', 'Real-time updates', 'Official data'],
  },
]

export default function Features() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="features" style={{ padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <div style={{ marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(91,106,240,0.1)', border: '1px solid rgba(91,106,240,0.25)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20,
          }}>
            <span style={{ color: '#818cf8', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>
              CAPABILITIES
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 900 }}>
            <h2 style={{
              fontFamily: 'DM Serif Display, Georgia, serif',
              fontSize: 'clamp(28px, 3vw, 42px)',
              lineHeight: 1.12, color: '#f0f4ff',
              margin: 0, letterSpacing: '-0.02em',
            }}>
              Everything you need to navigate education.
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, margin: 0, paddingTop: 4 }}>
              From first-year applications to postgraduate decisions, Aski AI gives you the knowledge to move forward with confidence.
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? 'rgba(26,37,64,0.8)' : 'rgba(17,24,39,0.6)',
                border: `1px solid ${hovered === i ? `${f.accent}35` : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 18, padding: '32px',
                transition: 'all 0.25s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* glow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${f.accent}40, transparent)`,
                opacity: hovered === i ? 1 : 0,
                transition: 'opacity 0.25s',
              }} />

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 13,
                background: `${f.accent}14`,
                border: `1px solid ${f.accent}28`,
                color: f.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
                transition: 'background 0.2s',
              }}>
                {f.icon}
              </div>

              <h3 style={{
                fontFamily: 'DM Serif Display, Georgia, serif',
                fontSize: 22, color: '#f0f4ff',
                margin: '0 0 12px', letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 24px' }}>
                {f.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {f.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                      color: f.accent, background: `${f.accent}12`,
                      padding: '3px 9px', borderRadius: 100,
                      border: `1px solid ${f.accent}22`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #features .feature-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 680px) {
          #features { padding: 64px 0 !important; }
        }
      `}</style>
    </section>
  )
}
