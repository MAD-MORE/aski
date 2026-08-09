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
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div style={{
      padding: '16px 20px 20px',
      borderTop: '1px solid #e0e0e0',
      background: '#ffffff',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 12,
        background: '#fafafa',
        border: '1px solid #ddd',
        borderRadius: 14, padding: '12px 14px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = '#5b6af0'
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,106,240,0.15)'
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = '#ddd'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {/* Upload button */}
        <button
          title="Upload document"
          style={{
            background: '#f0f0f0', border: '1px solid #ddd',
            borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#999', transition: 'color 0.15s, border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#e8e8e8' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.background = '#f0f0f0' }}
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
            color: '#333', fontSize: 15, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif',
            minHeight: 36, maxHeight: 200, overflowY: 'auto',
            alignSelf: 'center', paddingTop: 6,
            fontWeight: 500,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: 8,
            background: canSend
              ? 'linear-gradient(135deg, #5b6af0, #7c3aed)'
              : '#e8e8e8',
            border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canSend ? '0 2px 8px rgba(91,106,240,0.2)' : 'none',
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.boxShadow = '0 4px 12px rgba(91,106,240,0.3)' }}
          onMouseLeave={e => { if (canSend) e.currentTarget.style.boxShadow = '0 2px 8px rgba(91,106,240,0.2)' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z"
              stroke={canSend ? 'white' : '#ccc'}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p style={{ fontSize: 11, color: '#999', textAlign: 'center', marginTop: 8 }}>
        Aski AI may make mistakes. Verify important information with official sources.
      </p>
    </div>
  )
}
