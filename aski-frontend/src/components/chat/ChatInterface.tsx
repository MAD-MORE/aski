import { useState, useRef, useEffect } from 'react'
import { Menu, MessageCirclePlus } from 'lucide-react'
import Sidebar from './Sidebar'
import WelcomeScreen from './WelcomeScreen'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import type { Message, Conversation } from './types'
import { generateAIResponse } from './mockData'
import { TooltipProvider } from '@/components/ui/tooltip'

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
    <TooltipProvider delayDuration={300}>
      <div className="flex h-dvh overflow-hidden bg-background font-sans">
        <style>{`
          @media (max-width: 768px) {
            .sidebar {
              position: fixed !important;
              top: 0; left: 0; bottom: 0;
              transform: translateX(-100%);
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 50 !important;
            }
            .sidebar.sidebar-open { transform: translateX(0); }
            .mobile-overlay { display: block !important; }
            .mobile-menu-btn { display: flex !important; }
          }
          @media (max-width: 480px) {
            .header-subtitle { display: none !important; }
            .new-chat-label { display: none !important; }
            .new-chat-btn { padding: 0 !important; width: 44px !important; justify-content: center !important; }
            .status-label { display: none !important; }
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
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header — responsive, safe-area aware, consistent hierarchy */}
          <header
            className="z-10 flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {/* Title — shrinks and truncates instead of wrapping/overflowing */}
            <div className="flex h-16 min-w-0 flex-1 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mobile-menu-btn hidden h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Toggle conversation list"
                aria-expanded={sidebarOpen}
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <h1
                  title={activeConvo?.title || 'New Chat'}
                  className="truncate font-sans text-lg font-semibold tracking-tight text-foreground"
                >
                  {activeConvo?.title || 'New Chat'}
                </h1>
                {hasMessages && (
                  <p className="header-subtitle mt-0.5 whitespace-nowrap font-sans text-[11px] font-semibold text-muted-foreground">
                    {messages.filter(m => m.role === 'user').length} question
                    {messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Actions — collapse to icon-only affordances on small screens */}
            <div className="flex shrink-0 items-center gap-2">
              {hasMessages && (
                <button
                  onClick={startNewChat}
                  className="new-chat-btn flex h-11 items-center gap-2 rounded-md border border-border bg-secondary px-4 font-sans text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-muted"
                  aria-label="Start a new chat"
                >
                  <MessageCirclePlus className="size-3.5 shrink-0" />
                  <span className="new-chat-label">New Chat</span>
                </button>
              )}
              {/* Decorative — hidden from assistive tech rather than
                  announced as a redundant "Online" on every page load */}
              <div
                aria-hidden="true"
                className="flex h-11 items-center gap-2 rounded-md border border-success/30 bg-success/[0.08] px-4"
              >
                <span className="block size-2 shrink-0 rounded-full bg-success" />
                <span className="status-label whitespace-nowrap font-sans text-[11px] font-semibold text-success">
                  Online
                </span>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-secondary/60 px-4 py-6 sm:px-6">
            {!hasMessages ? (
              <WelcomeScreen onQuestion={sendMessage} />
            ) : (
              <div role="log" aria-live="polite" aria-relevant="additions" className="mx-auto max-w-[820px]">
                {messages.map((msg, i) => (
                  <MessageBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mx-auto w-full max-w-[920px] bg-background">
            <MessageInput onSend={sendMessage} onStop={stopGenerating} disabled={isLoading} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
