import { useEffect, useState } from 'react'
import type { Message } from './types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const isLoading = message.status === 'loading'
  const isError = message.status === 'error'
  const sources = message.sources || []

  useEffect(() => {
    if (!showSources) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSources(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showSources])

  if (isUser) {
    return (
      <div className="message-row user-row">
        <div className="user-bubble">{message.content}</div>
      </div>
    )
  }

  return (
    <div className={`message-row ai-row ${isError ? 'error-row' : ''}`}>
      <div className="ai-message">
        <div className="ai-label"><span className="ai-dot" /> ASKI{isError ? ' · Error' : ''}</div>
        {isLoading ? (
          <div className="typing-indicator" aria-label="ASKI is thinking"><span /><span /><span /></div>
        ) : (
          <>
            <div className="ai-content">{message.content}</div>
            {sources.length > 0 && (
              <div className="message-actions">
                <button
                  type="button"
                  className="sources-toggle"
                  onClick={() => setShowSources(true)}
                  aria-haspopup="dialog"
                  aria-label={`View ${sources.length} sources`}
                >
                  Sources · {sources.length}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showSources && sources.length > 0 && (
        <div className="sources-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowSources(false)
        }}>
          <section className="sources-dialog" role="dialog" aria-modal="true" aria-label="Sources">
            <div className="sources-dialog-header">
              <div>
                <h2>Sources</h2>
                <p>{sources.length} official UCC source{sources.length === 1 ? '' : 's'}</p>
              </div>
              <button type="button" className="sources-close" onClick={() => setShowSources(false)} aria-label="Close sources">×</button>
            </div>
            <div className="source-list">
              {sources.map((source, index) => (
                <a className="source-card" key={`${source.url || source.title}-${index}`} href={source.url} target="_blank" rel="noreferrer">
                  <div className="source-icon">✓</div>
                  <div className="source-copy">
                    <div className="source-title">{source.title}</div>
                    <div className="source-meta">{source.institution}{source.freshness ? ` · ${source.freshness}` : ''}</div>
                    {source.conflictWarning && <div className="source-warning">{source.conflictWarning}</div>}
                  </div>
                  <div className="source-arrow">↗</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
