import { useState } from 'react'
import ChatInterface from './components/chat/ChatInterface'

export default function App() {
  const [page, setPage] = useState<'landing' | 'chat'>('chat')

  if (page === 'chat') {
    return <ChatInterface onBack={() => setPage('landing')} />
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Landing page removed */}
    </div>
  )
}
