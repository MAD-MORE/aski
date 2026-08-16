import { useRef, useState, type KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = value.trim().length > 0 && !disabled

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="message-input-shell">
      <div className={`message-input ${disabled ? 'is-disabled' : ''}`}>
        <button className="input-action" title="Attach document" type="button" aria-label="Attach document">＋</button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={handleKey}
          onInput={event => {
            event.currentTarget.style.height = 'auto'
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 160)}px`
          }}
          placeholder="Ask a question about UCC..."
          rows={1}
          disabled={disabled}
        />
        <button className={`send-button ${canSend ? 'ready' : ''}`} onClick={handleSend} disabled={!canSend} type="button" aria-label="Send question">↑</button>
      </div>
      <p>ASKI answers from verified UCC knowledge and shows its sources.</p>
    </div>
  )
}
