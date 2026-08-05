import type { Conversation } from './types'

export const SUGGESTED_QUESTIONS = [
  { icon: '🏫', text: 'Which school can I enter with my results?', category: 'Admissions' },
  { icon: '📚', text: 'What course should I choose for a career in technology?', category: 'Courses' },
  { icon: '📋', text: 'What are the admission requirements for Medicine at UCT?', category: 'Requirements' },
  { icon: '💰', text: 'How do I apply for NSFAS funding this year?', category: 'Bursaries' },
  { icon: '🎓', text: 'What is the minimum APS score for BSc Engineering?', category: 'APS Score' },
  { icon: '🔍', text: 'Which universities offer BCom Accounting in Johannesburg?', category: 'Universities' },
]

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: 'UCT Medicine Requirements',
    preview: 'The minimum APS score for Medicine at UCT is 42...',
    timestamp: new Date(Date.now() - 3600_000 * 2),
    pinned: true,
    messages: [],
  },
  {
    id: 'c2',
    title: 'NSFAS Application 2025',
    preview: 'To apply for NSFAS, you need to visit the myNSFAS portal...',
    timestamp: new Date(Date.now() - 3600_000 * 26),
    messages: [],
  },
  {
    id: 'c3',
    title: 'BSc Computer Science options',
    preview: 'Several universities offer excellent Computer Science programs...',
    timestamp: new Date(Date.now() - 3600_000 * 50),
    messages: [],
  },
  {
    id: 'c4',
    title: 'Engineering APS requirements',
    preview: 'The minimum APS score for Engineering varies by university...',
    timestamp: new Date(Date.now() - 3600_000 * 96),
    messages: [],
  },
]

export const SAVED_ANSWERS = [
  { id: 's1', title: 'UCT APS Calculator', category: 'Admissions' },
  { id: 's2', title: 'NSFAS Eligibility Criteria', category: 'Funding' },
  { id: 's3', title: 'Wits Engineering Requirements', category: 'Requirements' },
]

export function generateAIResponse(question: string): { content: string; sources: { title: string; institution: string }[]; confidence: number } {
  const q = question.toLowerCase()

  if (q.includes('nsfas') || q.includes('fund') || q.includes('bursary')) {
    return {
      content: `**NSFAS (National Student Financial Aid Scheme)** provides funding for eligible South African students who cannot afford to pay for higher education.

**Eligibility requirements:**
- South African citizen or permanent resident
- Household income below R350,000 per year
- First-time entering undergraduate student (in most cases)
- Registered at a public university or TVET college

**How to apply:**
1. Visit **myNSFAS.org.za** and create an account
2. Complete the online application form
3. Upload supporting documents (ID, proof of income, acceptance letter)
4. Submit before the closing date — typically **31 January** for the following academic year

**Important:** Applications open in September each year. Late applications are generally not accepted.`,
      sources: [
        { title: 'NSFAS Application Guide 2025', institution: 'National Student Financial Aid Scheme' },
        { title: 'Government Higher Education Funding Policy', institution: 'Department of Higher Education' },
      ],
      confidence: 94,
    }
  }

  if (q.includes('medicine') || q.includes('mbchb') || q.includes('uct')) {
    return {
      content: `**Medicine (MBChB) at the University of Cape Town** is one of the most competitive undergraduate programs in South Africa.

**Minimum requirements:**
- APS Score: **42 out of 42** (with Life Sciences and Mathematics)
- Mathematics: Level 7 (80%+)
- Physical Sciences: Level 7 (80%+)
- Life Sciences: Level 7 (80%+)
- English: Level 5 (60%+)
- Two additional subjects at Level 5+

**Selection process:**
UCT uses the **National Benchmark Tests (NBTs)** alongside matric results. The NBT Academic and Quantitative Literacy (AQL) and Mathematics (MAT) tests are compulsory.

**Application deadline:** Applications open **1 April** and close **31 July** for the following year through the UCT Online Application System.

The program is 6 years and leads to the MBChB degree, with internship registration through the HPCSA thereafter.`,
      sources: [
        { title: 'UCT Faculty of Health Sciences Prospectus 2025', institution: 'University of Cape Town' },
        { title: 'Undergraduate Admissions Policy', institution: 'UCT Admissions Office' },
      ],
      confidence: 97,
    }
  }

  if (q.includes('engineering') || q.includes('aps') || q.includes('bsc')) {
    return {
      content: `**BSc Engineering** programs are offered at most major South African universities. Requirements vary by institution.

**Typical APS score requirements:**
| University | Program | Min APS |
|---|---|---|
| University of Pretoria | BEng | 34 |
| Wits University | BSc Eng | 36 |
| Stellenbosch University | BEng | 36 |
| UCT | BSc Eng | 40 |

**Subject requirements (across all universities):**
- Mathematics: Level 5–7 depending on institution
- Physical Sciences: Level 5–6
- English: Level 4–5

**Specialisations available:**
Civil, Mechanical, Electrical, Chemical, Computer, Industrial, and Mining Engineering.

Which institution are you most interested in? I can give you more specific requirements.`,
      sources: [
        { title: 'Engineering Faculty Admissions 2025', institution: 'Universities South Africa (USAf)' },
        { title: 'National Qualification Framework Guidelines', institution: 'SAQA' },
      ],
      confidence: 91,
    }
  }

  return {
    content: `Thank you for your question. Based on the South African education database I have access to, here is what I can tell you:

**Education in South Africa** operates across **26 public universities** and **50 TVET colleges** offering a wide range of programs from certificates to doctoral degrees.

To give you a more accurate and specific answer, could you clarify:
- Which institution or type of institution you are interested in?
- The specific qualification or course level?
- Your current academic results or matric score?

I can then provide precise admission requirements, application deadlines, and funding options specific to your situation.`,
    sources: [
      { title: 'South African Higher Education Landscape 2025', institution: 'Department of Higher Education' },
    ],
    confidence: 78,
  }
}
