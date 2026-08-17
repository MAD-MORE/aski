import { useEffect, useState } from 'react'
import type { Message } from './types'

interface MessageBubbleProps { message: Message }

const sourceStyles = `
.source-orb{position:relative;width:28px;height:28px;display:inline-grid;place-items:center;border:1px solid #d0d5dd;border-radius:50%;background:#fff;color:#667085;cursor:pointer;box-shadow:0 1px 2px rgba(16,24,40,.06);transition:.15s ease}.source-orb:hover{border-color:#b2c2ff;color:#185adb;transform:translateY(-1px)}.source-orb svg{width:13px;height:13px}.source-count{position:absolute;right:-5px;top:-5px;min-width:15px;height:15px;padding:0 3px;display:grid;place-items:center;border:2px solid #fff;border-radius:999px;background:#185adb;color:#fff;font-size:8px;font-weight:700;line-height:1}.message-actions{display:flex;align-items:center;margin-top:12px}.sources-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,24,40,.22);backdrop-filter:blur(3px)}.sources-dialog{width:min(520px,100%);max-height:min(680px,88dvh);overflow:hidden;display:flex;flex-direction:column;border:1px solid #e4e7ec;border-radius:20px;background:#fff;box-shadow:0 24px 70px rgba(16,24,40,.18)}.sources-dialog-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #e4e7ec}.sources-dialog-header h2{margin:0;color:#101828;font-size:16px}.sources-dialog-header p{margin:4px 0 0;color:#98a2b3;font-size:11px}.sources-close{width:34px;height:34px;border:0;border-radius:10px;background:#f8fafc;color:#667085;cursor:pointer;font-size:22px}.source-list{overflow-y:auto;padding:12px}.source-list .source-card{display:flex;align-items:center;gap:12px;padding:13px 14px;margin:0 0 8px;border:1px solid #e4e7ec;border-radius:14px;background:#fff;text-decoration:none}.source-icon{width:28px;height:28px;flex:0 0 28px;display:grid;place-items:center;border-radius:9px;background:#e9f9f1;color:#079455;font-size:12px;font-weight:800}.source-copy{min-width:0;flex:1}.source-title{display:block;overflow:hidden;color:#101828;font-size:12px;font-weight:600;text-overflow:ellipsis;white-space:nowrap}.source-meta{display:block;margin-top:3px;overflow:hidden;color:#98a2b3;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.source-warning{display:block;margin-top:4px;color:#b54708;font-size:10px}.source-arrow{color:#98a2b3}.ai-message{background:#fff}.ai-row{background:#fff}@media(max-width:600px){.sources-overlay{align-items:flex-end;padding:0}.sources-dialog{width:100%;max-height:82dvh;border-radius:20px 20px 0 0}}
`

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const isLoading = message.status === 'loading'
  const isError = message.status === 'error'
  const sources = message.sources || []

  useEffect(() => {
    if (!showSources) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowSources(false) }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = '' }
  }, [showSources])

  if (isUser) return <div className="message-row user-row"><div className="user-bubble">{message.content}</div></div>

  return (
    <>
      <style>{sourceStyles}</style>
      <div className={`message-row ai-row ${isError ? 'error-row' : ''}`}>
        <div className="ai-message">
          <div className="ai-label"><span className="ai-dot" /> ASKI{isError ? ' · Error' : ''}</div>
          {isLoading ? <div className="typing-indicator" aria-label="ASKI is thinking"><span /><span /><span /></div> : <>
            <div className="ai-content">{message.content}</div>
            {sources.length > 0 && <div className="message-actions"><button type="button" className="source-orb" onClick={() => setShowSources(true)} aria-haspopup="dialog" aria-label={`View ${sources.length} sources`} title={`${sources.length} sources`}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg><span className="source-count">{sources.length}</span></button></div>}
          </>}
        </div>
      </div>
      {showSources && sources.length > 0 && <div className="sources-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowSources(false) }}><section className="sources-dialog" role="dialog" aria-modal="true" aria-label="Sources"><div className="sources-dialog-header"><div><h2>Sources</h2><p>{sources.length} official UCC source{sources.length === 1 ? '' : 's'}</p></div><button type="button" className="sources-close" onClick={() => setShowSources(false)} aria-label="Close sources">×</button></div><div className="source-list">{sources.map((source, index) => <a className="source-card" key={`${source.url || source.title}-${index}`} href={source.url} target="_blank" rel="noreferrer"><div className="source-icon">✓</div><div className="source-copy"><div className="source-title">{source.title}</div><div className="source-meta">{source.institution}{source.freshness ? ` · ${source.freshness}` : ''}</div>{source.conflictWarning && <div className="source-warning">{source.conflictWarning}</div>}</div><div className="source-arrow">↗</div></a>)}</div></section></div>}
    </>
  )
}
