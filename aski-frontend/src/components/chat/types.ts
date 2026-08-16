export type MessageRole = 'user' | 'ai'
export type MessageStatus = 'sent' | 'loading' | 'error'
export type AnswerMode = 'quick' | 'detailed' | 'sources'

export interface Source {
  title: string
  institution: string
  url?: string
  relevance?: number
  retrieval?: string
  freshness?: string
  conflictWarning?: string
  official?: boolean
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
  followUps?: string[]
  conflictSummary?: string
  lastVerified?: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
  pinned?: boolean
}
