import { useState, useRef, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div style={{
      padding: '12px 20px 16px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: '#0b1120',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        background: 'rgba(26,37,64,0.8)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 14, padding: '10px 12px',
        transition: 'border-color 0.2s',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
        onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(91,106,240,0.4)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
      >
        {/* Upload button */}
        <button
          title="Upload document"
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#475569', transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="2" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 6h5M5 8.5h5M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          onInput={handleInput}
          placeholder="Ask Aski anything about education..."
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
            color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif',
            minHeight: 34, maxHeight: 160, overflowY: 'auto',
            alignSelf: 'center', paddingTop: 4,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 34, height: 34, flexShrink: 0, borderRadius: 8,
            background: canSend
              ? 'linear-gradient(135deg, #5b6af0, #7c3aed)'
              : 'rgba(255,255,255,0.05)',
            border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canSend ? '0 2px 12px rgba(91,106,240,0.3)' : 'none',
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.boxShadow = '0 4px 18px rgba(91,106,240,0.5)' }}
          onMouseLeave={e => { if (canSend) e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,106,240,0.3)' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z"
              stroke={canSend ? 'white' : '#334155'}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p style={{ fontSize: 11, color: '#1e293b', textAlign: 'center', marginTop: 8 }}>
        Aski AI may make mistakes. Verify important information with official sources.
      </p>
    </div>
  )
}
