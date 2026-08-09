import { useState, useRef, useEffect } from 'react'
import Sidebar from './Sidebar'
import WelcomeScreen from './WelcomeScreen'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import type { Message, Conversation } from './types'
import { generateAIResponse } from './mockData'

interface ChatInterfaceProps {
  onBack: () => void
}

function genId() {
  return Math.random().toString(36).slice(2)
}

// Design System Constants (Single Source of Truth)
const DESIGN_SYSTEM = {
  colors: {
    background: '#ffffff',
    surface: '#fafafa',
    border: '#e0e0e0',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#5b6af0',
    accent: '#10d9a0',
    error: '#ff4444',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    headingLarge: { fontSize: 20, fontWeight: 700, lineHeight: 1.2 },
    headingMedium: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: 15, fontWeight: 400, lineHeight: 1.6 },
    bodySmall: { fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.4 },
    captionSmall: { fontSize: 11, fontWeight: 600, lineHeight: 1.3 },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    light: '0 2px 8px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
    hover: '0 8px 24px rgba(91, 106, 240, 0.15)',
  },
  transitions: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
}

export default function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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

  const sendMessage = async (text: string) => {
    if (isLoading) return

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
      height: '100vh',
      overflow: 'hidden',
      background: DESIGN_SYSTEM.colors.background,
      fontFamily: 'Outfit, sans-serif',
    }}>
      <style>{`
        @media (max-width: 768px) {
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

        {/* Header (Topbar) - Consistent Visual Hierarchy */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${DESIGN_SYSTEM.spacing.lg}px`,
          borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border}`,
          background: DESIGN_SYSTEM.colors.background,
          flexShrink: 0,
          zIndex: 10,
        }}>
          {/* Title Section - Clear Information Architecture */}
          <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_SYSTEM.spacing.md }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: DESIGN_SYSTEM.colors.textSecondary,
                padding: DESIGN_SYSTEM.spacing.sm,
                display: 'none',
                transition: `color ${DESIGN_SYSTEM.transitions.fast}`,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div>
              <h1 style={{
                ...DESIGN_SYSTEM.typography.headingMedium,
                color: DESIGN_SYSTEM.colors.text,
                margin: 0,
                letterSpacing: '-0.01em',
              }}>
                {activeConvo?.title || 'New Chat'}
              </h1>
              {hasMessages && (
                <p style={{
                  ...DESIGN_SYSTEM.typography.captionSmall,
                  color: DESIGN_SYSTEM.colors.textTertiary,
                  margin: `${DESIGN_SYSTEM.spacing.xs}px 0 0 0`,
                }}>
                  {messages.filter(m => m.role === 'user').length} question{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Action Section - Clear Affordances */}
          <div style={{ display: 'flex', gap: DESIGN_SYSTEM.spacing.md, alignItems: 'center' }}>
            {hasMessages && (
              <button
                onClick={startNewChat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_SYSTEM.spacing.sm,
                  background: DESIGN_SYSTEM.colors.surface,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
                  borderRadius: DESIGN_SYSTEM.radius.md,
                  padding: `${DESIGN_SYSTEM.spacing.sm}px ${DESIGN_SYSTEM.spacing.md}px`,
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
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New Chat
              </button>
            )}
            {/* Status Indicator - Feedback Principle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_SYSTEM.spacing.sm,
              background: `${DESIGN_SYSTEM.colors.accent}15`,
              border: `1px solid ${DESIGN_SYSTEM.colors.accent}30`,
              borderRadius: DESIGN_SYSTEM.radius.md,
              padding: `${DESIGN_SYSTEM.spacing.sm}px ${DESIGN_SYSTEM.spacing.md}px`,
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: DESIGN_SYSTEM.colors.accent,
                display: 'block',
                flexShrink: 0,
              }} />
              <span style={{
                ...DESIGN_SYSTEM.typography.captionSmall,
                color: DESIGN_SYSTEM.colors.accent,
              }}>Online</span>
            </div>
          </div>
        </div>

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
          <MessageInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}
