import { useState, useRef, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  designSystem?: any
}

export default function MessageInput({ onSend, disabled, designSystem }: MessageInputProps) {
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
      padding: '20px 24px 24px',
      borderTop: '1px solid #e8e8e8',
      background: '#ffffff',
    }}>
      <style>{`
        textarea::placeholder {
          color: #999;
          opacity: 1;
        }
        textarea::-webkit-input-placeholder {
          color: #999;
        }
        textarea::-moz-placeholder {
          color: #999;
        }
        textarea:-ms-input-placeholder {
          color: #999;
        }
      `}</style>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 12,
        background: '#fafafa',
        border: '1.5px solid #ddd',
        borderRadius: 16, padding: '14px 16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
        onFocusCapture={e => {
          e.currentTarget.style.borderColor = '#5b6af0'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,106,240,0.15)'
        }}
        onBlurCapture={e => {
          e.currentTarget.style.borderColor = '#ddd'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        {/* Upload button */}
        <button
          title="Upload document"
          style={{
            background: '#f0f0f0', border: '1px solid #ddd',
            borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#999', transition: 'color 0.15s, border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#e8e8e8' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.background = '#f0f0f0' }}
        >
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
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
          placeholder="Ask Aski AI anything about education, courses, admissions, bursaries, and more..."
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
            color: '#333', fontSize: 16, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif',
            minHeight: 40, maxHeight: 200, overflowY: 'auto',
            alignSelf: 'center', paddingTop: 8,
            fontWeight: 500,
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: 10,
            background: canSend
              ? 'linear-gradient(135deg, #5b6af0, #7c3aed)'
              : '#e8e8e8',
            border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: canSend ? '0 3px 10px rgba(91,106,240,0.25)' : 'none',
          }}
          onMouseEnter={e => { if (canSend) e.currentTarget.style.boxShadow = '0 6px 16px rgba(91,106,240,0.4)' }}
          onMouseLeave={e => { if (canSend) e.currentTarget.style.boxShadow = '0 3px 10px rgba(91,106,240,0.25)' }}
        >
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
            <path
              d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z"
              stroke={canSend ? 'white' : '#ccc'}
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#b0b0b0', textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
        Aski may make mistakes. Verify important information with official sources.
      </p>
    </div>
  )
}
