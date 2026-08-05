import { useState } from 'react'
import type { Conversation } from './types'
import { DEMO_CONVERSATIONS, SAVED_ANSWERS } from './mockData'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onBack: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

type NavSection = 'chats' | 'saved'

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Sidebar({ conversations, activeId, onSelect, onNewChat, onBack, mobileOpen, onMobileClose }: SidebarProps) {
  const [section, setSection] = useState<NavSection>('chats')
  const [searchVal, setSearchVal] = useState('')

  const allConvos = [...conversations, ...DEMO_CONVERSATIONS].slice(0, 8)
  const filtered = allConvos.filter(c =>
    c.title.toLowerCase().includes(searchVal.toLowerCase())
  )
  const pinned = filtered.filter(c => c.pinned)
  const recent = filtered.filter(c => !c.pinned)

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 39, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        className={mobileOpen ? 'sidebar sidebar-open' : 'sidebar'}
        style={{
          width: 260, flexShrink: 0,
          background: '#060a14',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 40,
        }}
      >
        {/* Top: logo + back */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg, #5b6af0, #10d9a0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5L13 4.5v7L8 14.5 3 11.5v-7L8 1.5z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                <circle cx="8" cy="8" r="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 16, color: '#f0f4ff' }}>
              Aski <span style={{ color: '#10d9a0' }}>AI</span>
            </span>
          </div>
          <button
            onClick={onBack}
            title="Back to home"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* New Chat button */}
        <div style={{ padding: '12px 12px 8px' }}>
          <button
            onClick={onNewChat}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              background: 'linear-gradient(135deg, #5b6af0, #7c3aed)',
              border: 'none', borderRadius: 8, padding: '9px 14px',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif', letterSpacing: '0.01em',
              boxShadow: '0 2px 12px rgba(91,106,240,0.3)',
              transition: 'box-shadow 0.2s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(91,106,240,0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,106,240,0.3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            New Chat
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0 12px 8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 7, padding: '7px 10px',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#475569', flexShrink: 0 }}>
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search conversations..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#94a3b8', fontSize: 12, fontFamily: 'Outfit, sans-serif',
              }}
            />
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', padding: '0 12px 8px', gap: 4 }}>
          {(['chats', 'saved'] as NavSection[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                flex: 1, background: section === s ? 'rgba(91,106,240,0.15)' : 'transparent',
                border: `1px solid ${section === s ? 'rgba(91,106,240,0.3)' : 'transparent'}`,
                borderRadius: 6, padding: '5px 8px',
                color: section === s ? '#818cf8' : '#475569',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', textTransform: 'capitalize',
                letterSpacing: '0.03em', transition: 'all 0.15s',
              }}
            >
              {s === 'chats' ? 'Conversations' : 'Saved'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {section === 'chats' ? (
            <>
              {pinned.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#334155', padding: '6px 8px 4px', textTransform: 'uppercase' }}>
                    Pinned
                  </div>
                  {pinned.map(c => (
                    <ConvoItem key={c.id} convo={c} active={activeId === c.id} onSelect={onSelect} />
                  ))}
                </>
              )}
              {recent.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#334155', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
                    Recent
                  </div>
                  {recent.map(c => (
                    <ConvoItem key={c.id} convo={c} active={activeId === c.id} onSelect={onSelect} />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#334155', padding: '6px 8px 4px', textTransform: 'uppercase' }}>
                Saved Answers
              </div>
              {SAVED_ANSWERS.map(s => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(16,217,160,0.1)', border: '1px solid rgba(16,217,160,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="#10d9a0" strokeWidth="1.1"/>
                      <path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="#10d9a0" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#334155', marginTop: 1 }}>{s.category}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* User profile */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px', borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #5b6af0 0%, #a78bfa 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              T
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#c7d2fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Thabo Molefe
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>Free plan</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#334155', flexShrink: 0 }}>
              <circle cx="7" cy="4" r="1" fill="currentColor"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
              <circle cx="7" cy="10" r="1" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </aside>
    </>
  )
}

function ConvoItem({ convo, active, onSelect }: { convo: Conversation; active: boolean; onSelect: (id: string) => void }) {
  return (
    <div
      onClick={() => onSelect(convo.id)}
      style={{
        padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
        background: active ? 'rgba(91,106,240,0.12)' : 'transparent',
        border: `1px solid ${active ? 'rgba(91,106,240,0.2)' : 'transparent'}`,
        transition: 'all 0.15s', marginBottom: 2,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: active ? '#c7d2fe' : '#64748b',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
        }}>
          {convo.title}
        </span>
        <span style={{ fontSize: 10, color: '#334155', flexShrink: 0 }}>
          {timeAgoShort(convo.timestamp)}
        </span>
      </div>
      <div style={{
        fontSize: 11, color: '#334155', marginTop: 3,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {convo.preview}
      </div>
    </div>
  )
}

function timeAgoShort(date: Date) {
  const h = Math.floor((Date.now() - date.getTime()) / 3600_000)
  if (h < 1) return 'now'
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
