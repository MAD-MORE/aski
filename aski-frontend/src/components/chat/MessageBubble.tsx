import { useEffect, useState, useRef } from 'react'
import type { Message } from './types'
import { DESIGN_SYSTEM } from './theme'
import AskiMark from './AskiMark'

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

// Local aliases so the rest of this file didn't need a mechanical
// find-and-replace when it moved onto the shared token file.
const COLORS = {
  background: DESIGN_SYSTEM.colors.background,
  surface: DESIGN_SYSTEM.colors.surfaceAlt,
  border: DESIGN_SYSTEM.colors.border,
  text: DESIGN_SYSTEM.colors.text,
  textSecondary: DESIGN_SYSTEM.colors.textSecondary,
  textTertiary: DESIGN_SYSTEM.colors.textTertiary,
  primary: DESIGN_SYSTEM.colors.primary,
  accent: DESIGN_SYSTEM.colors.accent,
  positive: DESIGN_SYSTEM.colors.positive,
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

function AiAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginTop: 2,
    }}>
      <AskiMark size={15} variant="white" />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard API unavailable — fail silently, this is a nice-to-have.
        }
      }}
      title={copied ? 'Copied' : 'Copy response'}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? COLORS.positive : COLORS.textTertiary,
        fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 500,
        padding: '2px 4px', transition: 'color 0.15s',
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = COLORS.textSecondary }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = COLORS.textTertiary }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M2.5 8V2.5A1 1 0 013.5 1.5H8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

/**
 * Progressively reveals `text` a few characters at a time.
 *
 * There's no real token stream from a backend here — this is a
 * frontend-only illusion of one. It exists because progressive
 * disclosure of AI output (rather than a full block of text
 * appearing all at once) is a well-established pattern for chat
 * interfaces: it reads as "thinking as it writes," keeps the user
 * engaged during longer answers, and gives them an early chance to
 * interrupt or stop reading once they have what they need.
 */
function useStreamedText(fullText: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? '' : fullText)
  const doneRef = useRef(!enabled)

  useEffect(() => {
    if (!enabled) {
      setShown(fullText)
      return
    }
    doneRef.current = false
    setShown('')
    let i = 0
    const step = Math.max(1, Math.round(fullText.length / 120))
    const id = setInterval(() => {
      i += step
      if (i >= fullText.length) {
        setShown(fullText)
        doneRef.current = true
        clearInterval(id)
      } else {
        setShown(fullText.slice(0, i))
      }
    }, 16)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, enabled])

  return { shown, done: doneRef.current }
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isLoading = message.status === 'loading'
  const isError = message.status === 'error'
  const shouldStream = !isUser && !isLoading && !!isLatest

  const { shown, done } = useStreamedText(message.content, shouldStream)
  const displayText = shouldStream ? shown : message.content

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 20,
      }}
    >
      {!isUser && <AiAvatar />}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
        <div
          className="message-bubble"
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            background: isUser
              ? `linear-gradient(135deg, ${COLORS.primary}, ${DESIGN_SYSTEM.colors.primaryDark})`
              : isError
                ? '#fef2f2'
                : COLORS.surface,
            border: isUser ? 'none' : `1px solid ${isError ? '#fecaca' : COLORS.border}`,
            color: isUser ? '#ffffff' : isError ? '#b91c1c' : COLORS.text,
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'Outfit, sans-serif',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 20 }} aria-label="Aski is thinking">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.textTertiary, animation: 'bounce 1.4s infinite', animationDelay: '0s' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.textTertiary, animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS.textTertiary, animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }} />
              <style>{`
                @keyframes bounce {
                  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
                  40% { transform: translateY(-6px); opacity: 1; }
                }
              `}</style>
            </div>
          ) : (
            <span>
              {displayText}
              {shouldStream && !done && (
                <span style={{
                  display: 'inline-block', width: 7, height: 14, marginLeft: 2,
                  background: COLORS.textTertiary, verticalAlign: 'text-bottom',
                  animation: 'caret-blink 0.9s steps(1) infinite',
                }} />
              )}
              <style>{`
                @keyframes caret-blink { 50% { opacity: 0; } }
              `}</style>
            </span>
          )}
        </div>

        {!isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingLeft: isUser ? 0 : 2 }}>
            <span style={{ fontSize: 10, color: COLORS.textTertiary, fontFamily: 'Outfit, sans-serif' }}>
              {formatTime(message.timestamp)}
            </span>
            {!isUser && (!shouldStream || done) && <CopyButton text={message.content} />}
          </div>
        )}
      </div>
    </div>
  )
}
