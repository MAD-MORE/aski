export type MessageRole = 'user' | 'ai'
export type MessageStatus = 'sent' | 'loading' | 'error'

export interface Source {
  title: string
  institution: string
  url?: string
  relevance?: number
  retrieval?: string
  freshness?: string
  conflictWarning?: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
  sources?: Source[]
  confidence?: number
  timestamp: Date
  provider?: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
  pinned?: boolean
}
