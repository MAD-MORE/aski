import { useEffect, useState, useRef } from 'react'
import { Check, Copy } from 'lucide-react'
import type { Message } from './types'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import AskiMark from './AskiMark'

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/**
 * Progressively reveals `text` a few characters at a time.
 *
 * There's no real token stream from a backend here — this is a
 * frontend-only illusion of one. Progressive disclosure of AI output
 * (rather than the full block appearing at once) is a well-established
 * chat-UI pattern: it reads as "writing as it thinks" and gives the
 * user an early chance to stop reading once they have what they need.
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'h-6 gap-1 px-1.5 text-[11px] font-medium',
        copied ? 'text-success' : 'text-muted-foreground hover:text-foreground'
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard API unavailable — fail silently, this is a nice-to-have.
        }
      }}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isLoading = message.status === 'loading'
  const isError = message.status === 'error'
  const shouldStream = !isUser && !isLoading && !!isLatest

  const { shown, done } = useStreamedText(message.content, shouldStream)
  const displayText = shouldStream ? shown : message.content

  return (
    <div className={cn('mb-5 flex items-start gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="mt-0.5 h-7 w-7 shrink-0 bg-gradient-to-br from-primary to-accent">
          <AvatarFallback className="bg-transparent">
            <AskiMark size={15} variant="white" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex max-w-[78%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'whitespace-pre-wrap break-words px-4 py-3 font-sans text-sm leading-relaxed',
            isUser
              ? 'rounded-2xl rounded-tr-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
              : isError
                ? 'rounded-2xl rounded-tl-md border border-destructive/25 bg-destructive/5 text-destructive'
                : 'rounded-2xl rounded-tl-md border border-border bg-secondary text-foreground'
          )}
        >
          {isLoading ? (
            <div className="flex h-5 items-center gap-1" aria-label="Aski is thinking">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                />
              ))}
            </div>
          ) : (
            <span>
              {displayText}
              {shouldStream && !done && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-muted-foreground align-text-bottom" />
              )}
            </span>
          )}
        </div>

        {!isLoading && (
          <div className={cn('mt-1 flex items-center gap-2', !isUser && 'pl-0.5')}>
            <span className="text-[10px] font-sans text-muted-foreground">{formatTime(message.timestamp)}</span>
            {!isUser && (!shouldStream || done) && <CopyButton text={message.content} />}
          </div>
        )}
      </div>
    </div>
  )
}
