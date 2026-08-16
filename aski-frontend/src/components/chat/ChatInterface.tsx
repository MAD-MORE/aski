import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { askAski, mapSources } from '../../lib/api'
import type { AnswerMode, Conversation, Message, Source } from './types'
import './intelligence.css'

interface ChatInterfaceProps { onBack: () => void }

const QUICK_PROMPTS = [
  ['Academic calendar', 'When does the next semester begin?'],
  ['Registration', 'How do I register my courses?'],
  ['Student life', 'What halls are available?'],
  ['Announcements', 'What recent official updates should I know?'],
]

const FALLBACK_FOLLOWUPS = ['Show the official sources', 'Compare the relevant UCC documents', 'What else should I know?']

function id() { return crypto.randomUUID() }
function cleanPreview(text: string) { return text.replace(/[#*_`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90) }
function timeLabel(date: Date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function firstSentence(text: string) { const match = text.match(/^(.+?[.!?])(?:\s|$)/); return match?.[1] || text }

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="ASKI"><span className={`brand-mark ${compact ? 'compact' : ''}`}>A</span><span className={`brand-word ${compact ? 'compact' : ''}`}>ASKI</span></div>
}
function VerifiedBadge() { return <span className="verified-badge"><span className="verified-dot" /> UCC sources</span> }

function SourceCard({ source, onAsk }: { source: Source; onAsk: (prompt: string) => void }) {
  const content = <>
    <span className={`source-icon ${source.conflictWarning ? 'warning' : ''}`}>{source.conflictWarning ? '!' : '✓'}</span>
    <span className="source-copy">
      <span className="source-title">{source.title}</span>
      <span className="source-meta">{source.institution} · {source.freshness || 'Official source'}</span>
      {source.conflictWarning && <span className="source-warning">{source.conflictWarning}</span>}
    </span>
    <span className="source-arrow">↗</span>
  </>
  return <div className="source-card-wrap">
    {source.url ? <a className="source-card" href={source.url} target="_blank" rel="noreferrer">{content}</a> : <div className="source-card">{content}</div>}
    <button className="source-ask" onClick={() => onAsk(`Tell me more about this source: ${source.title}`)}>Ask about this document</button>
  </div>
}

function AnswerModes({ mode, setMode }: { mode: AnswerMode; setMode: (mode: AnswerMode) => void }) {
  const options: Array<[AnswerMode, string]> = [['quick', 'Quick'], ['detailed', 'Detailed'], ['sources', 'Sources only']]
  return <div className="answer-modes" aria-label="Answer mode">{options.map(([value, label]) => <button key={value} className={mode === value ? 'active' : ''} onClick={() => setMode(value)}>{label}</button>)}</div>
}

function MessageView({ message, mode, onFollowUp, onAskSource }: { message: Message; mode: AnswerMode; onFollowUp: (prompt: string) => void; onAskSource: (prompt: string) => void }) {
  if (message.role === 'user') return <div className="message-row user-row"><div className="user-bubble"><div>{message.content}</div><div className="message-time">{timeLabel(message.timestamp)}</div></div></div>
  if (message.status === 'loading') return <div className="message-row ai-row"><div className="ai-message"><div className="ai-label"><span className="ai-avatar">A</span> ASKI</div><div className="retrieval-status"><span className="status-dot" /> Searching UCC sources…</div><div className="retrieval-steps"><span>Checking official sources</span><span>Matching relevant documents</span><span>Preparing grounded answer</span></div></div></div>

  const sources = message.sources || []
  const followUps = message.followUps?.length ? message.followUps : FALLBACK_FOLLOWUPS
  const hasConflict = Boolean(message.conflictSummary || sources.some(source => source.conflictWarning))
  const visibleAnswer = mode === 'quick' ? firstSentence(message.content) : message.content

  return <div className={`message-row ai-row ${message.status === 'error' ? 'error-row' : ''}`}>
    <div className="ai-message">
      <div className="ai-label"><span className="ai-avatar">A</span> ASKI <span className="ai-verified">SOURCE-BACKED</span></div>
      {mode !== 'sources' && <div className="ai-content">{visibleAnswer}</div>}
      {message.status === 'sent' && <div className="answer-meta">
        <span className="confidence"><span>✓</span> Source-backed</span>
        {message.lastVerified && <span className="freshness-chip">Verified {message.lastVerified}</span>}
        {message.provider && <span className="provider-label">{message.provider}</span>}
      </div>}
      {hasConflict && <div className="conflict-panel"><span className="conflict-icon">!</span><div><strong>Official sources differ</strong><span>{message.conflictSummary || 'ASKI found different details across official UCC sources. Review the relevant sources before deciding.'}</span></div><button onClick={() => onFollowUp('Compare the official UCC sources and explain why they differ.')}>Compare</button></div>}
      {!!sources.length && <div className="source-stack"><div className="source-heading">SOURCES · {sources.length}</div>{sources.map((source, index) => <SourceCard source={source} key={`${source.url || source.title}-${index}`} onAsk={onAskSource} />)}</div>}
      {message.status === 'sent' && <div className="followups"><div className="followup-heading">CONTINUE</div><div className="followup-list">{followUps.map((prompt, index) => <button key={`${prompt}-${index}`} onClick={() => onFollowUp(prompt)}>{prompt}<span>→</span></button>)}</div></div>}
      <div className="message-time ai-time">{timeLabel(message.timestamp)}</div>
    </div>
  </div>
}

export default function ChatInterface({ onBack: _onBack }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sourceSheet, setSourceSheet] = useState<Source[] | null>(null)
  const [mode, setMode] = useState<AnswerMode>('detailed')
  const bottomRef = useRef<HTMLDivElement>(null)
  const activeConversation = useMemo(() => conversations.find(item => item.id === activeId), [conversations, activeId])
  const hasMessages = messages.length > 0
  const questionCount = messages.filter(message => message.role === 'user').length

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  const newChat = () => { setActiveId(null); setMessages([]); setSidebarOpen(false); setMode('detailed') }
  const selectConversation = (conversationId: string) => { const conversation = conversations.find(item => item.id === conversationId); if (!conversation) return; setActiveId(conversation.id); setMessages(conversation.messages); setSidebarOpen(false) }

  const sendMessage = async (value: string) => {
    const question = value.trim(); if (!question || isLoading) return
    const userMessage: Message = { id: id(), role: 'user', content: question, status: 'sent', timestamp: new Date() }
    const loadingMessage: Message = { id: id(), role: 'ai', content: '', status: 'loading', timestamp: new Date() }
    const history = messages
    setMessages([...history, userMessage, loadingMessage]); setIsLoading(true); setSidebarOpen(false)
    try {
      const response = await askAski(question, history, mode)
      const aiMessage: Message = {
        id: id(), role: 'ai', content: response.answer, status: 'sent', sources: mapSources(response.sources), timestamp: new Date(),
        provider: response.provider, confidence: response.confidence, followUps: response.follow_ups, conflictSummary: response.conflict_summary || undefined, lastVerified: response.last_verified,
      }
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

  const latestSources = [...messages].reverse().find(message => message.role === 'ai' && message.sources?.length)?.sources || []

  return <div className="aski-shell">
    <aside className={`aski-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-top"><Logo /><div className="sidebar-subtitle">UCC knowledge assistant</div><button className="new-chat-button" onClick={newChat}><span>+</span> New conversation</button></div>
      <div className="sidebar-scroll"><div className="sidebar-section-title">RECENT</div>{conversations.length === 0 ? <div className="sidebar-empty">Your conversations will appear here.</div> : conversations.map(conversation => <button className={`conversation-item ${conversation.id === activeId ? 'active' : ''}`} key={conversation.id} onClick={() => selectConversation(conversation.id)}><span className="conversation-title">{conversation.title}</span><span className="conversation-preview">{conversation.preview}</span></button>)}<div className="sidebar-divider" /><div className="sidebar-section-title">WORKSPACE</div><button className="workspace-item" onClick={() => setSourceSheet(latestSources)}>Saved sources</button><button className="workspace-item" onClick={() => newChat()}>UCC updates</button><button className="workspace-item">Settings</button></div>
      <div className="verified-panel"><VerifiedBadge /><span>Official sources are cited. URLs come from the knowledge service.</span></div>
    </aside>
    {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
    <main className="aski-main">
      <header className="aski-header"><div className="header-left"><button className="mobile-menu-button" onClick={() => setSidebarOpen(value => !value)} aria-label="Open menu">☰</button><div><div className="header-title">{activeConversation?.title || 'ASKI'}</div>{hasMessages && <div className="header-subtitle">{questionCount} question{questionCount === 1 ? '' : 's'} · Context preserved</div>}</div></div><div className="header-right">{hasMessages && <button className="header-new-button" onClick={newChat}>+ New chat</button>}<VerifiedBadge /></div></header>
      <section className="aski-content">
        {!hasMessages ? <div className="welcome-screen intelligence-home"><Logo compact /><h1>What do you need to know?</h1><p>Ask about UCC and get grounded answers with official sources.</p><div className="home-search-wrap"><div className="home-search"><span>Ask anything about UCC…</span><span className="home-search-icon">⌕</span></div></div><div className="mode-row"><span>Answer mode</span><AnswerModes mode={mode} setMode={setMode} /></div><div className="ucc-today"><div className="ucc-today-header"><div><strong>UCC Today</strong><span>Quick access to common information</span></div><VerifiedBadge /></div><div className="today-grid">{QUICK_PROMPTS.map(([label, question]) => <button className="today-card" key={label} onClick={() => sendMessage(question)}><span className="today-label">{label}</span><span className="today-question">{question}</span><span className="today-arrow">→</span></button>)}</div><div className="home-health"><span className="health-dot" /> UCC knowledge sources are monitored automatically</div></div></div> : <div className="message-column"><div className="conversation-toolbar"><span>{questionCount} questions in this conversation</span><AnswerModes mode={mode} setMode={setMode} /></div>{messages.map(message => <MessageView key={message.id} message={message} mode={mode} onFollowUp={sendMessage} onAskSource={sendMessage} />)}<div ref={bottomRef} /></div>}
      </section>
      <div className="composer-wrap"><MessageComposer onSend={sendMessage} disabled={isLoading} /></div>
    </main>
    {sourceSheet && <div className="source-sheet-backdrop" onClick={() => setSourceSheet(null)}><section className="source-sheet" onClick={event => event.stopPropagation()}><div className="sheet-handle" /><div className="sheet-header"><div><strong>Sources</strong><span>Official UCC references for this conversation</span></div><button onClick={() => setSourceSheet(null)} aria-label="Close sources">×</button></div><div className="sheet-list">{sourceSheet.length ? sourceSheet.map((source, index) => <SourceCard source={source} key={`${source.title}-${index}`} onAsk={sendMessage} />) : <div className="sheet-empty">Sources will appear after ASKI retrieves an answer.</div>}</div></section></div>}
  </div>
}

function MessageComposer({ onSend, disabled }: { onSend: (value: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')
  const submit = () => { if (!value.trim() || disabled) return; onSend(value); setValue('') }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }
  return <div className="composer-area"><div className={`composer ${disabled ? 'disabled' : ''}`}><textarea value={value} onChange={event => setValue(event.target.value)} onKeyDown={onKeyDown} rows={1} placeholder="Ask anything about UCC…" aria-label="Ask ASKI" disabled={disabled} /><button className={`send-button ${value.trim() && !disabled ? 'ready' : ''}`} onClick={submit} disabled={!value.trim() || disabled} aria-label="Send question">↑</button></div><div className="composer-hint">Enter to send · Shift + Enter for a new line · Answers stay grounded in UCC sources</div></div>
}
