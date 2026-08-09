import type { Message } from './types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isLoading = message.status === 'loading'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      animation: isLoading ? 'pulse 2s infinite' : 'none',
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isUser ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
        background: isUser 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'rgba(255,255,255,0.08)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.12)',
        color: isUser ? '#fff' : '#e2e8f0',
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: 'Outfit, sans-serif',
        wordWrap: 'break-word',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            height: 20,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#94a3b8',
              animation: 'bounce 1.4s infinite',
              animationDelay: '0s',
            }} />
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#94a3b8',
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.2s',
            }} />
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#94a3b8',
              animation: 'bounce 1.4s infinite',
              animationDelay: '0.4s',
            }} />
            <style>{`
              @keyframes bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
                40% { transform: translateY(-8px); opacity: 1; }
              }
            `}</style>
          </div>
        ) : (
          <>
            <div>{message.content}</div>
            {message.sources && message.sources.length > 0 && (
              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: 12,
                opacity: 0.8,
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Sources:</div>
                {message.sources.map((source, idx) => (
                  <div key={idx} style={{ marginBottom: 4 }}>
                    • {source}
                  </div>
                ))}
              </div>
            )}
            {message.confidence && (
              <div style={{
                marginTop: 8,
                fontSize: 11,
                opacity: 0.7,
              }}>
                Confidence: {(message.confidence * 100).toFixed(0)}%
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
