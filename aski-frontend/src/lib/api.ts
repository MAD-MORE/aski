import type { Message, Source } from '../components/chat/types'

const API_BASE = (import.meta.env.VITE_API_URL || 'https://aski-o7hl0rij6-padmoreyeboah123-1582s-projects.vercel.app').replace(/\/$/, '')

export interface AskResponse {
  question: string
  answer: string
  provider?: string
  model?: string
  intent?: string
  sources?: Array<{
    title?: string
    url?: string
    relevance?: number
    retrieval?: string
    freshness?: string
    conflict_warning?: string | null
  }>
}

function toSource(source: AskResponse['sources'][number]): Source {
  return {
    title: source.title || 'UCC source',
    institution: 'University of Cape Coast',
    url: source.url,
    relevance: source.relevance,
    retrieval: source.retrieval,
    freshness: source.freshness,
    conflictWarning: source.conflict_warning || undefined,
  }
}

export async function askAski(question: string, history: Message[] = []): Promise<AskResponse> {
  const sessionId = getSessionId()
  const response = await fetch(`${API_BASE}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      history: history.slice(-8).map(message => ({ role: message.role, content: message.content })),
    }),
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error(`ASKI backend returned HTTP ${response.status}`)
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload
      ? String((payload as { error: unknown }).error)
      : `ASKI backend returned HTTP ${response.status}`
    throw new Error(message)
  }

  const result = payload as AskResponse
  result.sources = (result.sources || []).map(source => source)
  return result
}

export function mapSources(sources: AskResponse['sources'] = []): Source[] {
  return sources.map(toSource)
}

function getSessionId() {
  const key = 'aski-session-id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const created = crypto.randomUUID()
  window.localStorage.setItem(key, created)
  return created
}
