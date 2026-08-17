import { useEffect, useState } from 'react'
import type { Message } from './types'

interface MessageBubbleProps {
  message: Message
}

const sourceStyles = `
.message-actions{display:flex;align-items:center;margin-top:14px}
.sources-toggle{border:0;background:transparent;padding:5px 0;color:#667085;font-size:11px;font-weight:600;cursor:pointer}
.sources-toggle:hover{color:#185adb}
.sources-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,24,40,.22);backdrop-filter:blur(3px)}
.sources-dialog{width:min(520px,100%);max-height:min(680px,88dvh);overflow:hidden;display:flex;flex-direction:column;border:1px solid #e4e7ec;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(16,24,40,.18)}
.sources-dialog-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e4e7ec}
.sources-dialog-header h2{margin:0;color:#101828;font-size:16px;line-height:1.3}
.sources-dialog-header p{margin:4px 0 0;color:#98a2b3;font-size:11px}
.sources-close{width:34px;height:34px;border:0;border-radius:10px;background:#f8fafc;color:#667085;cursor:pointer;font-size:22px;line-height:1}
.sources-close:hover{background:#f2f4f7;color:#101828}
.source-list{overflow-y:auto;padding:12px}
.source-list .source-card{display:flex;align-items:center;gap:12px;padding:13px 14px;margin:0 0 8px;border:1px solid #e4e7ec;border-radius:14px;background:#fff;text-decoration:none}
.source-list .source-card:last-child{margin-bottom:0}
.source-list .source-card:hover{border-color:#b2c2ff;background:#fafcff}
.source-icon{width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:9px;background:#e9f9f1;color:#079455;font-size:12px;font-weight:800}
.source-copy{min-width:0;flex:1}.source-title{display:block;overflow:hidden;color:#101828;font-size:12px;font-weight:600;line-height:1.45;text-overflow:ellipsis;white-space:nowrap}.source-meta{display:block;margin-top:3px;overflow:hidden;color:#98a2b3;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.source-warning{display:block;margin-top:4px;color:#b54708;font-size:10px}.source-arrow{color:#98a2b3;font-size:15px}
@media(max-width:600px){.sources-overlay{align-items:flex-end;padding:0}.sources-dialog{width:100%;max-height:82dvh;border-radius:20px 20px 0 0}.sources-dialog-header{padding:16px}.source-list{padding:10px}}
`

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
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [showSources])

  if (isUser) {
    return <div className="message-row user-row"><div className="user-bubble">{message.content}</div></div>
  }

  return (
    <>
      <style>{sourceStyles}</style>
      <div className={`message-row ai-row ${isError ? 'error-row' : ''}`} style={{ background: '#fff' }}>
        <div className="ai-message" style={{ background: '#fff' }}>
          <div className="ai-label"><span className="ai-dot" /> ASKI{isError ? ' · Error' : ''}</div>
          {isLoading ? (
            <div className="typing-indicator" aria-label="ASKI is thinking"><span /><span /><span /></div>
          ) : (
            <>
              <div className="ai-content">{message.content}</div>
              {sources.length > 0 && (
                <div className="message-actions">
                  <button type="button" className="sources-toggle" onClick={() => setShowSources(true)} aria-haspopup="dialog" aria-label={`View ${sources.length} sources`}>
                    Sources · {sources.length}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showSources && sources.length > 0 && (
        <div className="sources-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSources(false) }}>
          <section className="sources-dialog" role="dialog" aria-modal="true" aria-label="Sources">
            <div className="sources-dialog-header">
              <div><h2>Sources</h2><p>{sources.length} official UCC source{sources.length === 1 ? '' : 's'}</p></div>
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
    </>
  )
}
