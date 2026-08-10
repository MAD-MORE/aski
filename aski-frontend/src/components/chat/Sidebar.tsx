import { useState } from 'react'
import type { Conversation } from './types'
import { DEMO_CONVERSATIONS, SAVED_ANSWERS } from './mockData'
import { DESIGN_SYSTEM } from './theme'
import AskiMark from './AskiMark'

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
          background: '#f8f8f8',
          borderRight: '1px solid #e0e0e0',
          display: 'flex', flexDirection: 'column',
          height: '100vh',
          position: 'relative',
          zIndex: 40,
        }}
      >
        {/* Top: logo + back */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary}, ${DESIGN_SYSTEM.colors.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AskiMark size={15} variant="white" />
            </div>
            <span style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 16, color: DESIGN_SYSTEM.colors.text }}>
              Aski <span style={{ color: DESIGN_SYSTEM.colors.accent }}>AI</span>
            </span>
          </div>
          <button
            onClick={onBack}
            title="Back to home"
            style={{
              background: '#f0f0f0', border: '1px solid #ddd',
              borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#999', transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#ccc' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#ddd' }}
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
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary}, ${DESIGN_SYSTEM.colors.primaryDark})`,
              border: 'none', borderRadius: 8, padding: '9px 14px',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif', letterSpacing: '0.01em',
              boxShadow: '0 2px 12px rgba(11,107,79,0.28)',
              transition: 'box-shadow 0.2s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(11,107,79,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(11,107,79,0.28)' }}
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
            background: '#f0f0f0', border: '1px solid #ddd',
            borderRadius: 7, padding: '7px 10px',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#999', flexShrink: 0 }}>
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search conversations..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#666', fontSize: 12, fontFamily: 'Outfit, sans-serif',
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
                flex: 1, background: section === s ? `${DESIGN_SYSTEM.colors.primary}12` : 'transparent',
                border: `1px solid ${section === s ? `${DESIGN_SYSTEM.colors.primary}35` : 'transparent'}`,
                borderRadius: 6, padding: '5px 8px',
                color: section === s ? DESIGN_SYSTEM.colors.primary : DESIGN_SYSTEM.colors.textTertiary,
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
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#999', padding: '6px 8px 4px', textTransform: 'uppercase' }}>
                    Pinned
                  </div>
                  {pinned.map(c => (
                    <ConvoItem key={c.id} convo={c} active={activeId === c.id} onSelect={onSelect} />
                  ))}
                </>
              )}
              {recent.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#999', padding: '10px 8px 4px', textTransform: 'uppercase' }}>
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
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#999', padding: '6px 8px 4px', textTransform: 'uppercase' }}>
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
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: `${DESIGN_SYSTEM.colors.positive}14`, border: `1px solid ${DESIGN_SYSTEM.colors.positive}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 1h8a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke={DESIGN_SYSTEM.colors.positive} strokeWidth="1.1"/>
                      <path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke={DESIGN_SYSTEM.colors.positive} strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{s.category}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* User profile */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid #e0e0e0',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px', borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary} 0%, ${DESIGN_SYSTEM.colors.accent} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              K
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Kwame Mensah
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>Free plan</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: '#ccc', flexShrink: 0 }}>
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
        background: active ? `${DESIGN_SYSTEM.colors.primary}10` : 'transparent',
        border: `1px solid ${active ? `${DESIGN_SYSTEM.colors.primary}30` : 'transparent'}`,
        transition: 'all 0.15s', marginBottom: 2,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f0f0f0' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: active ? DESIGN_SYSTEM.colors.primary : DESIGN_SYSTEM.colors.textSecondary,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
        }}>
          {convo.title}
        </span>
        <span style={{ fontSize: 10, color: '#999', flexShrink: 0 }}>
          {timeAgoShort(convo.timestamp)}
        </span>
      </div>
      <div style={{
        fontSize: 11, color: '#999', marginTop: 3,
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
