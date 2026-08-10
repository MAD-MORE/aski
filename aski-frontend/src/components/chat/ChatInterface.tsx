import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import WelcomeScreen from './WelcomeScreen'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import type { Message, Conversation } from './types'
import { generateAIResponse } from './mockData'
import { DESIGN_SYSTEM, MEDIA } from './theme'

interface ChatInterfaceProps {
  onBack: () => void
}

function genId() {
  return Math.random().toString(36).slice(2)
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  // Lets the input box interrupt an in-flight response — a standard
  // AI-chat affordance (ChatGPT/Claude both offer "Stop generating").
  // Using a ref (not state) means the async sendMessage closure can
  // read the latest value without being re-created on every render.
  const cancelledRef = useRef(false)

  const activeConvo = conversations.find(c => c.id === activeId)
  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startNewChat = () => {
    setActiveId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const selectConversation = (id: string) => {
    setActiveId(id)
    setMessages([])
    setSidebarOpen(false)
  }

  const stopGenerating = () => {
    cancelledRef.current = true
    setIsLoading(false)
    setMessages(prev =>
      prev.map(m => (m.status === 'loading' ? { ...m, status: 'error', content: 'Stopped.' } : m))
    )
  }

  const sendMessage = async (text: string) => {
    if (isLoading) return
    cancelledRef.current = false

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: text,
      status: 'sent',
      timestamp: new Date(),
    }

    const loadingMsg: Message = {
      id: genId(),
      role: 'ai',
      content: '',
      status: 'loading',
      timestamp: new Date(),
    }

    const nextMessages = [...messages, userMsg, loadingMsg]
    setMessages(nextMessages)
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    if (cancelledRef.current) return // user hit Stop while we were "thinking"

    const response = generateAIResponse(text)
    const aiMsg: Message = {
      id: genId(),
      role: 'ai',
      content: response.content,
      status: 'sent',
      timestamp: new Date(),
    }

    const finalMessages = [...messages, userMsg, aiMsg]
    setMessages(finalMessages)
    setIsLoading(false)

    if (!activeId) {
      const newConvo: Conversation = {
        id: genId(),
        title: text.length > 48 ? text.slice(0, 48) + '…' : text,
        preview: response.content.slice(0, 80).replace(/[#*]/g, '') + '…',
        timestamp: new Date(),
        messages: finalMessages,
      }
      setConversations(prev => [newConvo, ...prev])
      setActiveId(newConvo.id)
    } else {
      setConversations(prev =>
        prev.map(c =>
          c.id === activeId
            ? { ...c, messages: finalMessages, preview: response.content.slice(0, 80).replace(/[#*]/g, '') + '…' }
            : c
        )
      )
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100dvh',
      overflow: 'hidden',
      background: DESIGN_SYSTEM.colors.background,
      fontFamily: 'Outfit, sans-serif',
    }}>
      <style>{`
        ${MEDIA.tablet} {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform ${DESIGN_SYSTEM.transitions.normal} cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 50 !important;
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
          .app-header { padding-left: ${DESIGN_SYSTEM.spacing.md}px !important; padding-right: ${DESIGN_SYSTEM.spacing.md}px !important; }
        }
        ${MEDIA.mobile} {
          .app-header { padding-left: ${DESIGN_SYSTEM.spacing.sm}px !important; padding-right: ${DESIGN_SYSTEM.spacing.sm}px !important; gap: ${DESIGN_SYSTEM.spacing.xs}px; }
          .header-subtitle { display: none !important; }
          .new-chat-label { display: none !important; }
          .new-chat-btn { padding: 0 !important; width: ${DESIGN_SYSTEM.touchTarget}px !important; justify-content: center !important; }
          .status-label { display: none !important; }
          .status-pill { padding: ${DESIGN_SYSTEM.spacing.xs}px !important; }
        }
      `}</style>

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNewChat={startNewChat}
        onBack={onBack}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header (Topbar) — responsive, safe-area aware, consistent hierarchy */}
        <header
          className="app-header"
          style={{
            minHeight: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: DESIGN_SYSTEM.spacing.sm,
            padding: `env(safe-area-inset-top, 0px) ${DESIGN_SYSTEM.spacing.lg}px 0`,
            borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
            background: DESIGN_SYSTEM.colors.background,
            flexShrink: 0,
            zIndex: 10,
            boxSizing: 'border-box',
          }}
        >
          {/* Title Section — shrinks and truncates instead of wrapping/overflowing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_SYSTEM.spacing.md, minWidth: 0, flex: 1, height: 64 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle conversation list"
              aria-expanded={sidebarOpen}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: DESIGN_SYSTEM.colors.textSecondary,
                width: DESIGN_SYSTEM.touchTarget,
                height: DESIGN_SYSTEM.touchTarget,
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: DESIGN_SYSTEM.radius.sm,
                transition: `color ${DESIGN_SYSTEM.transitions.fast}, background ${DESIGN_SYSTEM.transitions.fast}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <h1
                title={activeConvo?.title || 'New Chat'}
                style={{
                  ...DESIGN_SYSTEM.typography.headingMedium,
                  color: DESIGN_SYSTEM.colors.text,
                  margin: 0,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeConvo?.title || 'New Chat'}
              </h1>
              {hasMessages && (
                <p className="header-subtitle" style={{
                  ...DESIGN_SYSTEM.typography.captionSmall,
                  color: DESIGN_SYSTEM.colors.textTertiary,
                  margin: `${DESIGN_SYSTEM.spacing.xs}px 0 0 0`,
                  whiteSpace: 'nowrap',
                }}>
                  {messages.filter(m => m.role === 'user').length} question{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Action Section — collapses to icon-only affordances on small screens */}
          <div style={{ display: 'flex', gap: DESIGN_SYSTEM.spacing.sm, alignItems: 'center', flexShrink: 0 }}>
            {hasMessages && (
              <button
                onClick={startNewChat}
                className="new-chat-btn"
                aria-label="Start a new chat"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_SYSTEM.spacing.sm,
                  background: DESIGN_SYSTEM.colors.surface,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  padding: `0 ${DESIGN_SYSTEM.spacing.md}px`,
                  height: DESIGN_SYSTEM.touchTarget,
                  cursor: 'pointer',
                  color: DESIGN_SYSTEM.colors.textSecondary,
                  ...DESIGN_SYSTEM.typography.caption,
                  transition: `all ${DESIGN_SYSTEM.transitions.fast}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f0f0f0'
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = DESIGN_SYSTEM.colors.surface
                  e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
                }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="new-chat-label">New Chat</span>
              </button>
            )}
            {/* Status Indicator — decorative, so it's hidden from assistive tech
                rather than announced as a redundant "Online" every page load */}
            <div
              className="status-pill"
              aria-hidden="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_SYSTEM.spacing.sm,
                background: `${DESIGN_SYSTEM.colors.positive}15`,
                border: `1px solid ${DESIGN_SYSTEM.colors.positive}30`,
                borderRadius: DESIGN_SYSTEM.radius.md,
                padding: `${DESIGN_SYSTEM.spacing.sm}px ${DESIGN_SYSTEM.spacing.md}px`,
                height: DESIGN_SYSTEM.touchTarget,
                boxSizing: 'border-box',
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: DESIGN_SYSTEM.colors.positive,
                display: 'block',
                flexShrink: 0,
              }} />
              <span className="status-label" style={{
                ...DESIGN_SYSTEM.typography.captionSmall,
                color: DESIGN_SYSTEM.colors.positive,
                whiteSpace: 'nowrap',
              }}>Online</span>
            </div>
          </div>
        </header>

        {/* Messages Container - Proper Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${DESIGN_SYSTEM.spacing.lg}px ${DESIGN_SYSTEM.spacing.lg}px`,
          background: DESIGN_SYSTEM.colors.surface,
        }}>
          {!hasMessages ? (
            <WelcomeScreen onQuestion={sendMessage} />
          ) : (
            <div
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              style={{ maxWidth: 820, margin: '0 auto' }}
            >
              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area - Bottom Priority, Persistent */}
        <div style={{
          maxWidth: 920,
          margin: '0 auto',
          width: '100%',
          background: DESIGN_SYSTEM.colors.background,
        }}>
          <MessageInput onSend={sendMessage} onStop={stopGenerating} disabled={isLoading} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
