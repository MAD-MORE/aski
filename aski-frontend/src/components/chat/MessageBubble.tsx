import { useState } from 'react'
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
          <div className="typing-indicator" aria-label="ASKI is thinking">
            <span /><span /><span />
          </div>
        ) : (
          <>
            <div className="ai-content">{message.content}</div>
            {sources.length > 0 && (
              <div className="sources-control">
                <button
                  type="button"
                  className="sources-toggle"
                  onClick={() => setShowSources(value => !value)}
                  aria-expanded={showSources}
                >
                  {showSources ? 'Hide sources' : `Sources · ${sources.length}`}
                </button>
                {showSources && (
                  <div className="source-stack">
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
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
