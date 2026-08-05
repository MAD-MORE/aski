const FOOTER_LINKS = {
  Product: ['Features', 'How it works', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'Student guide', 'Institution list', 'API'],
  Company: ['About us', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy policy', 'Terms of service', 'Cookie policy'],
}

export default function Footer() {
  return (
    <footer style={{
      background: '#060a14',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '72px 0 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Top: brand + links */}
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: 40, marginBottom: 64 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L13 4.5v7L8 14.5 3 11.5v-7L8 1.5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="1.5" fill="white"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 19, color: '#f0f4ff' }}>
                Aski <span style={{ color: '#10d9a0' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 220, margin: '0 0 20px' }}>
              Your intelligent education companion. Helping students navigate schools, courses, and admissions across South Africa.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Twitter', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.816l7.32-8.569L2.25 2.25h7.095l4.02 5.327 5.879-5.327z' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { label: 'GitHub', path: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z' },
              ].map(icon => (
                <a
                  key={icon.label}
                  href="#"
                  aria-label={icon.label}
                  style={{
                    width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    color: '#64748b', transition: 'color 0.2s, border-color 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d={icon.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 16px',
              }}>
                {group}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        color: '#475569', fontSize: 13, textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 28 }} />

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
            © 2025 Aski AI. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
            Empowering students across South Africa to make informed education decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}
