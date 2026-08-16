import { useEffect, useRef, useState } from 'react'
import Sidebar from './Sidebar'
import WelcomeScreen from './WelcomeScreen'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import type { Message, Conversation } from './types'
import { askAski, mapSources } from '../../lib/api'

interface ChatInterfaceProps {
  onBack: () => void
}

function genId() {
  return crypto.randomUUID()
}

const QUICK_PROMPTS = [
  'Academic calendar',
  'Registration',
  'Courses',
  'Fees',
]

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
    const conversation = conversations.find(item => item.id === id)
    if (!conversation) return
    setActiveId(id)
    setMessages(conversation.messages)
    setSidebarOpen(false)
  }

  const sendMessage = async (text: string) => {
    const question = text.trim()
    if (!question || isLoading) return

    const userMsg: Message = {
      id: genId(),
      role: 'user',
      content: question,
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
    const pending = [...messages, userMsg, loadingMsg]
    setMessages(pending)
    setIsLoading(true)

    try {
      const response = await askAski(question, messages)
      const aiMsg: Message = {
        id: genId(),
        role: 'ai',
        content: response.answer,
        status: 'sent',
        sources: mapSources(response.sources),
        timestamp: new Date(),
        provider: response.provider,
      }
      const finalMessages = [...messages, userMsg, aiMsg]
      setMessages(finalMessages)

      if (!activeId) {
        const newConvo: Conversation = {
          id: genId(),
          title: question.length > 48 ? `${question.slice(0, 48)}…` : question,
          preview: response.answer.replace(/[#*]/g, '').slice(0, 90),
          timestamp: new Date(),
          messages: finalMessages,
        }
        setConversations(previous => [newConvo, ...previous])
        setActiveId(newConvo.id)
      } else {
        setConversations(previous => previous.map(conversation =>
          conversation.id === activeId
            ? { ...conversation, messages: finalMessages, preview: response.answer.replace(/[#*]/g, '').slice(0, 90), timestamp: new Date() }
            : conversation
        ))
      }
    } catch (error) {
      const errorMsg: Message = {
        id: genId(),
        role: 'ai',
        content: error instanceof Error ? error.message : 'ASKI could not reach the knowledge service. Please try again.',
        status: 'error',
        timestamp: new Date(),
      }
      setMessages([...messages, userMsg, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="aski-shell">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onNewChat={startNewChat}
        onBack={onBack}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <main className="aski-main">
        <header className="aski-header">
          <div className="aski-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(value => !value)}
              aria-label="Open conversation menu"
            >
              <span />
              <span />
              <span />
            </button>
            <div>
              <div className="aski-title">{activeConvo?.title || 'New Chat'}</div>
              {hasMessages && <div className="aski-subtitle">{messages.filter(message => message.role === 'user').length} question{messages.filter(message => message.role === 'user').length === 1 ? '' : 's'}</div>}
            </div>
          </div>
          <div className="aski-header-right">
            {hasMessages && <button className="secondary-button" onClick={startNewChat}>+ New Chat</button>}
            <div className="verified-pill"><span /> UCC knowledge · Verified</div>
          </div>
        </header>

        <section className="aski-content">
          {!hasMessages ? (
            <div className="welcome-wrap">
              <WelcomeScreen onQuestion={sendMessage} />
              <div className="quick-prompts">
                {QUICK_PROMPTS.map(prompt => (
                  <button key={prompt} onClick={() => sendMessage(`Tell me about ${prompt.toLowerCase()} at UCC`)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-column">
              {messages.map(message => <MessageBubble key={message.id} message={message} />)}
              <div ref={bottomRef} />
            </div>
          )}
        </section>

        <div className="input-wrap">
          <MessageInput onSend={sendMessage} disabled={isLoading} designSystem={undefined} />
          <div className="input-note">ASKI answers from verified UCC knowledge and shows its sources.</div>
        </div>
      </main>
    </div>
  )
}
