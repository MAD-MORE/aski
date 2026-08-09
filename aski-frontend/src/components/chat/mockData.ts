import type { Conversation } from './types'

export const SUGGESTED_QUESTIONS = [
  { icon: '🏫', text: 'What aggregate do I need to get into UCC?', category: 'Admissions' },
  { icon: '📚', text: 'What course should I choose for a career in technology?', category: 'Courses' },
  { icon: '📋', text: 'What are the admission requirements for BSc Nursing at UCC?', category: 'Requirements' },
  { icon: '💰', text: 'How do I apply for the Students Loan Trust Fund this year?', category: 'Scholarships' },
  { icon: '🎓', text: 'What subject combination do I need for BSc Computer Science?', category: 'Aggregate' },
  { icon: '🔍', text: 'Which UCC programmes fall under the College of Education Studies?', category: 'Programmes' },
]

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'UCC Nursing Requirements',
    preview: 'The general entry aggregate for UCC is 36 (WASSCE)...',
    timestamp: new Date(Date.now() - 3600_000 * 2),
    pinned: true,
    messages: [],
  },
  {
    id: 'c2',
    title: 'Students Loan Trust Fund 2025',
    preview: 'To apply for SLTF funding, you need to visit the studentloan.gov.gh portal...',
    timestamp: new Date(Date.now() - 3600_000 * 26),
    messages: [],
  },
  {
    id: 'c3',
    title: 'BSc Computer Science options',
    preview: 'UCC offers Computer Science under the College of Agriculture and Natural Sciences...',
    timestamp: new Date(Date.now() - 3600_000 * 50),
    messages: [],
  },
  {
    id: 'c4',
    title: 'UCC application deadlines',
    preview: 'The UCC online application window and e-voucher process typically opens...',
    timestamp: new Date(Date.now() - 3600_000 * 96),
    messages: [],
  },
]

export const SAVED_ANSWERS = [
  { id: 's1', title: 'UCC Aggregate Calculator', category: 'Admissions' },
  { id: 's2', title: 'Students Loan Trust Fund Eligibility', category: 'Funding' },
  { id: 's3', title: 'UCC Computer Science Requirements', category: 'Requirements' },
]

/**
 * Frontend-only response placeholder.
 *
 * This is intentionally NOT wired to a real model, database, or RAG
 * pipeline — there is no backend yet. It exists purely so the chat UI
 * has something to render and animate while the interface is being
 * designed. It never claims sources or confidence scores, because
 * nothing here has actually verified anything.
 *
 * Swap the body of this function for a real API call once the
 * backend (see aski-backend) exposes an endpoint.
 */
export function generateAIResponse(question: string): { content: string } {
  return {
    content: `Here's a placeholder response to: "${question}"\n\nThis chat is currently running in **frontend-only demo mode** — there's no model or knowledge base connected yet, so nothing here is a real, verified answer. Once the backend is wired up, this is where a grounded answer about UCC admissions, programmes, fees, and scholarships will appear.`,
  }
}
