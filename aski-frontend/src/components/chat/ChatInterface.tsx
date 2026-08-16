import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { askAski, mapSources } from '../../lib/api'
import type { Conversation, Message, Source } from './types'

interface ChatInterfaceProps {
  onBack: () => void
}

const QUICK_PROMPTS = [
  ['Academic calendar', 'When does the next semester begin?'],
  ['Registration', 'How do I register my courses?'],
  ['Student life', 'What halls are available?'],
]

function id() { return crypto.randomUUID() }
function cleanPreview(text: string) { return text.replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90) }
function timeLabel(date: Date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="ASKI"><span className={`brand-mark ${compact ? 'compact' : ''}`}>A</span><span className={`brand-word ${compact ? 'compact' : ''}`}>ASKI</span></div>
}
function VerifiedBadge() { return <span className="verified-badge"><span className="verified-dot" /> UCC verified</span> }

function SourceCard({ source }: { source: Source }) {
  const content = <><span className="source-icon">✓</span><span className="source-copy"><span className="source-title">{source.title}</span><span className="source-meta">{source.institution} · {source.freshness || 'Official source'}</span>{source.conflictWarning && <span className="source-warning">{source.conflictWarning}</span>}</span><span className="source-arrow">↗</span></>
  return source.url ? <a className="source-card" href={source.url} target="_blank" rel="noreferrer">{content}</a> : <div className="source-card">{content}</div>
}

function MessageView({ message }: { message: Message }) {
  if (message.role === 'user') return <div className="message-row user-row"><div className="user-bubble"><div>{message.content}</div><div className="message-time">{timeLabel(message.timestamp)}</div></div></div>
  if (message.status === 'loading') return <div className="message-row ai-row"><div className="ai-message"><div className="ai-label"><span className="ai-avatar">A</span> ASKI</div><div className="typing-indicator"><span /><span /><span /></div><div className="ai-searching">Checking UCC sources…</div></div></div>
  return <div className={`message-row ai-row ${message.status === 'error' ? 'error-row' : ''}`}><div className="ai-message"><div className="ai-label"><span className="ai-avatar">A</span> ASKI <span className="ai-verified">VERIFIED</span></div><div className="ai-content">{message.content}</div>{message.status === 'sent' && <div className="answer-meta"><span className="confidence"><span>✓</span> Grounded answer</span>{message.provider && <span className="provider-label">{message.provider}</span>}</div>}{!!message.sources?.length && <div className="source-stack"><div className="source-heading">Sources</div>{message.sources.map((source, index) => <SourceCard source={source} key={`${source.url || source.title}-${index}`} />)}</div>}<div className="message-time ai-time">{timeLabel(message.timestamp)}</div></div></div>
}

export default function ChatInterface({ onBack: _onBack }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeConversation = useMemo(() => conversations.find(item => item.id === activeId), [conversations, activeId])
  const hasMessages = messages.length > 0

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  const newChat = () => { setActiveId(null); setMessages([]); setSidebarOpen(false) }
  const selectConversation = (conversationId: string) => { const conversation = conversations.find(item => item.id === conversationId); if (!conversation) return; setActiveId(conversation.id); setMessages(conversation.messages); setSidebarOpen(false) }

  const sendMessage = async (value: string) => {
    const question = value.trim(); if (!question || isLoading) return
    const userMessage: Message = { id: id(), role: 'user', content: question, status: 'sent', timestamp: new Date() }
    const loadingMessage: Message = { id: id(), role: 'ai', content: '', status: 'loading', timestamp: new Date() }
    const history = messages
    setMessages([...history, userMessage, loadingMessage]); setIsLoading(true); setSidebarOpen(false)
    try {
      const response = await askAski(question, history)
      const aiMessage: Message = { id: id(), role: 'ai', content: response.answer, status: 'sent', sources: mapSources(response.sources), timestamp: new Date(), provider: response.provider }
      const finalMessages = [...history, userMessage, aiMessage]; setMessages(finalMessages)
      if (!activeId) {
        const conversation: Conversation = { id: id(), title: question.length > 52 ? `${question.slice(0, 52)}…` : question, preview: cleanPreview(response.answer), timestamp: new Date(), messages: finalMessages }
        setConversations(previous => [conversation, ...previous]); setActiveId(conversation.id)
      } else setConversations(previous => previous.map(conversation => conversation.id === activeId ? { ...conversation, messages: finalMessages, preview: cleanPreview(response.answer), timestamp: new Date() } : conversation))
    } catch (error) {
      const errorMessage: Message = { id: id(), role: 'ai', content: error instanceof Error ? error.message : 'ASKI could not reach the knowledge service. Please try again.', status: 'error', timestamp: new Date() }
      setMessages([...history, userMessage, errorMessage])
    } finally { setIsLoading(false) }
  }

  return <div className="aski-shell">
    <aside className={`aski-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-top"><Logo /><div className="sidebar-subtitle">UCC knowledge assistant</div><button className="new-chat-button" onClick={newChat}><span>+</span> New conversation</button></div>
      <div className="sidebar-scroll"><div className="sidebar-section-title">RECENT</div>{conversations.length === 0 ? <div className="sidebar-empty">Your conversations will appear here.</div> : conversations.map(conversation => <button className={`conversation-item ${conversation.id === activeId ? 'active' : ''}`} key={conversation.id} onClick={() => selectConversation(conversation.id)}><span className="conversation-title">{conversation.title}</span><span className="conversation-preview">{conversation.preview}</span></button>)}<div className="sidebar-divider" /><div className="sidebar-section-title">WORKSPACE</div><button className="workspace-item">Saved sources</button><button className="workspace-item">UCC updates</button><button className="workspace-item">Settings</button></div>
      <div className="verified-panel"><VerifiedBadge /><span>Official sources are cited</span></div>
    </aside>
    {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
    <main className="aski-main">
      <header className="aski-header"><div className="header-left"><button className="mobile-menu-button" onClick={() => setSidebarOpen(value => !value)} aria-label="Open menu">☰</button><div><div className="header-title">{activeConversation?.title || 'ASKI'}</div>{hasMessages && <div className="header-subtitle">{messages.filter(message => message.role === 'user').length} question{messages.filter(message => message.role === 'user').length === 1 ? '' : 's'}</div>}</div></div><div className="header-right">{hasMessages && <button className="header-new-button" onClick={newChat}>+ New chat</button>}<VerifiedBadge /></div></header>
      <section className="aski-content">{!hasMessages ? <div className="welcome-screen"><Logo compact /><h1>What do you need to know?</h1><p>Ask about UCC and get grounded answers with official sources.</p><div className="prompt-grid">{QUICK_PROMPTS.map(([label, question]) => <button className="prompt-card" key={label} onClick={() => sendMessage(question)}><span className="prompt-label">{label}</span><span className="prompt-question">{question}</span><span className="prompt-arrow">→</span></button>)}</div></div> : <div className="message-column">{messages.map(message => <MessageView key={message.id} message={message} />)}<div ref={bottomRef} /></div>}</section>
      <div className="composer-wrap"><MessageComposer onSend={sendMessage} disabled={isLoading} /></div>
    </main>
  </div>
}

function MessageComposer({ onSend, disabled }: { onSend: (value: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')
  const submit = () => { if (!value.trim() || disabled) return; onSend(value); setValue('') }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }
  return <div className="composer-area"><div className={`composer ${disabled ? 'disabled' : ''}`}><textarea value={value} onChange={event => setValue(event.target.value)} onKeyDown={onKeyDown} rows={1} placeholder="Ask anything about UCC…" aria-label="Ask ASKI" disabled={disabled} /><button className={`send-button ${value.trim() && !disabled ? 'ready' : ''}`} onClick={submit} disabled={!value.trim() || disabled} aria-label="Send question">↑</button></div><div className="composer-hint">Enter to send · Shift + Enter for a new line</div></div>
}
