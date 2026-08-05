import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import ChatInterface from './components/chat/ChatInterface'

export default function App() {
  const [page, setPage] = useState<'landing' | 'chat'>('landing')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (page === 'chat') {
    return <ChatInterface onBack={() => setPage('landing')} />
  }

  return (
    <div style={{ background: '#0b1120', minHeight: '100vh' }}>
      <Navbar scrolled={scrolled} onStartChat={() => setPage('chat')} />
      <main>
        <Hero onStartChat={() => setPage('chat')} />
        <Features />
        <HowItWorks onStartChat={() => setPage('chat')} />
      </main>
      <Footer />
    </div>
  )
}
