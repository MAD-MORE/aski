import { useState, useRef, type KeyboardEvent } from 'react'
import { DESIGN_SYSTEM, MEDIA } from './theme'

interface MessageInputProps {
  onSend: (text: string) => void
  onStop?: () => void
  disabled?: boolean
  isLoading?: boolean
}

const MAX_LENGTH = 2000
// Cap the textarea's growth to a fraction of the viewport so it can
// never eat the whole screen on a short mobile browser window.
const MAX_TEXTAREA_VH = 35

export default function MessageInput({ onSend, onStop, disabled, isLoading }: MessageInputProps) {
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
    const maxPx = Math.round((window.innerHeight * MAX_TEXTAREA_VH) / 100)
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxPx)}px`
  }

  const canSend = value.trim().length > 0 && !disabled
  const nearLimit = value.length > MAX_LENGTH * 0.9

  return (
    <div
      className="input-bar"
      style={{
        padding: `20px ${DESIGN_SYSTEM.spacing.lg}px calc(${DESIGN_SYSTEM.spacing.lg}px + env(safe-area-inset-bottom, 0px))`,
        borderTop: `1px solid ${DESIGN_SYSTEM.colors.border}`,
        background: DESIGN_SYSTEM.colors.background,
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        ${MEDIA.mobile} {
          .input-bar { padding-left: ${DESIGN_SYSTEM.spacing.sm}px !important; padding-right: ${DESIGN_SYSTEM.spacing.sm}px !important; padding-top: ${DESIGN_SYSTEM.spacing.md}px !important; }
          .input-upload-btn { display: none !important; }
        }
      `}</style>

      <div
        role="group"
        aria-label="Message composer"
        style={{
          display: 'flex', alignItems: 'flex-end', gap: DESIGN_SYSTEM.spacing.sm,
          background: DESIGN_SYSTEM.colors.surface,
          border: `1.5px solid ${DESIGN_SYSTEM.colors.borderStrong}`,
          borderRadius: DESIGN_SYSTEM.radius.lg, padding: `${DESIGN_SYSTEM.spacing.sm}px ${DESIGN_SYSTEM.spacing.md}px`,
          transition: `border-color ${DESIGN_SYSTEM.transitions.normal}, box-shadow ${DESIGN_SYSTEM.transitions.normal}`,
          boxShadow: DESIGN_SYSTEM.shadows.light,
        }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.primary
            e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.hover
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.borderStrong
            e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.light
          }}
        >
        {/* Upload button — hidden on very small screens so the send
            control never gets pushed off a narrow phone viewport */}
        <button
          type="button"
          title="Upload document"
          aria-label="Upload a document"
          className="input-upload-btn"
          style={{
            background: '#f0f0f0', border: `1px solid ${DESIGN_SYSTEM.colors.borderStrong}`,
            borderRadius: DESIGN_SYSTEM.radius.sm,
            width: DESIGN_SYSTEM.touchTarget, height: DESIGN_SYSTEM.touchTarget,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, color: '#999',
            transition: `color ${DESIGN_SYSTEM.transitions.fast}, border-color ${DESIGN_SYSTEM.transitions.fast}, background ${DESIGN_SYSTEM.transitions.fast}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#e8e8e8' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.borderStrong; e.currentTarget.style.background = '#f0f0f0' }}
        >
          <svg width="16" height="16" viewBox="0 0 15 15" fill="none">
            <rect x="2" y="2" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 6h5M5 8.5h5M5 11h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            <path d="M9 1v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Textarea — grows with content, capped to a viewport fraction */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKey}
          onInput={handleInput}
          placeholder="Ask Aski anything about education..."
          aria-label="Message"
          rows={1}
          maxLength={MAX_LENGTH}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
            color: '#333', fontSize: 16, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif',
            minHeight: 24, overflowY: 'auto',
            alignSelf: 'center', padding: '8px 0',
            fontWeight: 500,
          }}
        />

        {/* Send / Stop — same slot, different affordance depending on state */}
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
            style={{
              width: DESIGN_SYSTEM.touchTarget, height: DESIGN_SYSTEM.touchTarget, flexShrink: 0, borderRadius: DESIGN_SYSTEM.radius.sm,
              background: DESIGN_SYSTEM.colors.text,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `all ${DESIGN_SYSTEM.transitions.normal}`,
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fff' }} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
            style={{
              width: DESIGN_SYSTEM.touchTarget, height: DESIGN_SYSTEM.touchTarget, flexShrink: 0, borderRadius: DESIGN_SYSTEM.radius.sm,
              background: canSend
                ? `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary}, ${DESIGN_SYSTEM.colors.primaryDark})`
                : '#e8e8e8',
              border: 'none', cursor: canSend ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `all ${DESIGN_SYSTEM.transitions.normal}`,
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
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <p style={{ fontSize: 12, color: '#b0b0b0', textAlign: 'center', margin: 0, fontWeight: 500 }}>
          Aski may make mistakes. Verify important information with official sources.
        </p>
        {nearLimit && (
          <span style={{ fontSize: 11, color: value.length >= MAX_LENGTH ? DESIGN_SYSTEM.colors.error : '#b0b0b0', fontWeight: 600, flexShrink: 0 }}>
            {value.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </div>
  )
}
