import { useState, useRef, type KeyboardEvent } from 'react'
import { Paperclip, Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

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
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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
      className="border-t border-border bg-background px-3 pt-4 sm:px-6"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-secondary px-3 py-2.5 shadow-sm transition-shadow focus-within:border-primary focus-within:shadow-md">
        {/* Upload — hidden below 480px so Send never gets pushed off a narrow phone viewport */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden shrink-0 border-border bg-background text-muted-foreground hover:text-foreground sm:flex"
              aria-label="Upload a document"
            >
              <Paperclip className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload document</TooltipContent>
        </Tooltip>

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
          className="min-h-6 flex-1 resize-none self-center bg-transparent py-2 font-sans text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        {isLoading ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                onClick={onStop}
                aria-label="Stop generating"
                className="shrink-0 bg-foreground text-background hover:bg-foreground/85"
              >
                <Square className="size-3.5 fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Stop generating</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'shrink-0',
              canSend
                ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="size-4" />
          </Button>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        <p className="text-center font-sans text-xs font-medium text-muted-foreground/80">
          Aski may make mistakes. Verify important information with official sources.
        </p>
        {nearLimit && (
          <span
            className={cn(
              'shrink-0 text-[11px] font-semibold',
              value.length >= MAX_LENGTH ? 'text-destructive' : 'text-muted-foreground/80'
            )}
          >
            {value.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </div>
  )
}
