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

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 1800 + Math.random() * 1000))

    const response = generateAIResponse(text)
    const aiMsg: Message = {
      id: genId(),
      role: 'ai',
      content: response.content,
      status: 'sent',
      sources: response.sources,
      confidence: response.confidence,
      timestamp: new Date(),
    }

    const finalMessages = [...messages, userMsg, aiMsg]
    setMessages(finalMessages)
    setIsLoading(false)

    // Create/update conversation
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
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#0b1120', fontFamily: 'Outfit, sans-serif',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 50 !important;
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-overlay { display: block !important; }
          .welcome-grid { grid-template-columns: 1fr !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Sidebar */}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Chat topbar */}
        <div style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,17,32,0.8)', backdropFilter: 'blur(12px)',
          flexShrink: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', padding: 4, display: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div>
              <h1 style={{
                fontFamily: 'DM Serif Display, Georgia, serif',
                fontSize: 16, color: '#f0f4ff', margin: 0, letterSpacing: '-0.01em',
              }}>
                {activeConvo?.title || 'New Chat'}
              </h1>
              {hasMessages && (
                <p style={{ fontSize: 11, color: '#475569', margin: 0, marginTop: 1 }}>
                  {messages.filter(m => m.role === 'user').length} question{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} asked
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {hasMessages && (
              <button
                onClick={startNewChat}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
                  color: '#64748b', fontSize: 12, fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New
              </button>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,217,160,0.08)', border: '1px solid rgba(16,217,160,0.2)',
              borderRadius: 7, padding: '5px 10px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10d9a0', display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#10d9a0', fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          {!hasMessages ? (
            <WelcomeScreen onQuestion={sendMessage} />
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <MessageInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>

    </div>
  )
}
