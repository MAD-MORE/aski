interface NavbarProps {
  scrolled: boolean
  onStartChat: () => void
}

export default function Navbar({ scrolled, onStartChat }: NavbarProps) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(11,17,32,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L15 6v6L9 16 3 12V6L9 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 20, color: '#f0f4ff', letterSpacing: '-0.01em' }}>
              Aski <span style={{ color: '#10d9a0' }}>AI</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="nav-links">
            {['Features', 'How it works', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                style={{
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href="#"
              style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: 14,
                fontWeight: 500, padding: '8px 16px', borderRadius: 8,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              Log in
            </a>
            <button
              onClick={onStartChat}
              style={{
                background: 'linear-gradient(135deg, #5b6af0, #7c3aed)',
                color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600,
                padding: '8px 20px', borderRadius: 8,
                boxShadow: '0 2px 12px rgba(91,106,240,0.35)',
                transition: 'opacity 0.2s, box-shadow 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(91,106,240,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,106,240,0.35)' }}
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
