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

export function generateAIResponse(question: string): { content: string; sources: { title: string; institution: string }[]; confidence: number } {
  const q = question.toLowerCase()

  if (q.includes('loan') || q.includes('fund') || q.includes('scholarship') || q.includes('sltf')) {
    return {
      content: `**The Students Loan Trust Fund (SLTF)** provides loans for eligible Ghanaian tertiary students to help cover fees and living costs.

**Eligibility requirements:**
- Ghanaian citizen with a valid Ghana Card
- Admitted to, or currently enrolled in, an accredited tertiary institution in Ghana
- Registered with SSNIT or able to provide an acceptable guarantor
- Not in default on a previous student loan

**How to apply:**
1. Visit **studentloan.gov.gh** and create an account
2. Complete the online application form
3. Upload supporting documents (Ghana Card, admission letter, guarantor details)
4. Submit before the closing date for the academic year

**Important:** Applications typically open shortly after the academic year begins. Some UCC students also qualify for GETFund scholarships or departmental bursaries — check with the UCC Scholarships Secretariat for additional options.`,
      sources: [
        { title: 'Students Loan Trust Fund Application Guide', institution: 'Students Loan Trust Fund (SLTF)' },
        { title: 'Scholarships and Financial Aid', institution: 'University of Cape Coast' },
      ],
      confidence: 92,
    }
  }

  if (q.includes('nursing') || q.includes('medicine') || q.includes('health')) {
    return {
      content: `**BSc Nursing at the University of Cape Coast** is offered through the School of Nursing and Midwifery under the College of Health and Allied Sciences.

**Minimum requirements:**
- Overall aggregate of **36 or better** (WASSCE) — six subjects, credit passes (A1–C6)
- Core subjects: English Language, Core Mathematics, Integrated Science — all at credit level
- Relevant elective subjects, typically including Biology and Chemistry
- D7, E8 and F9 grades are **not accepted** for admission purposes

**Selection process:**
UCC processes applications through its online portal. Some health-related and competitive programmes may apply an internal ranking on top of the general aggregate when applicant numbers exceed available slots.

**Application:** Apply through **admissions.ucc.edu.gh**. Ghanaian applicants purchase an e-voucher (around GHS 220) to access the online application form; international applicants apply via **apply.ucc.edu.gh**.

Would you like the fee breakdown or hall of residence information as well?`,
      sources: [
        { title: 'UCC Admissions — Programme Requirements', institution: 'University of Cape Coast' },
        { title: 'UCC Undergraduate Admissions Brochure', institution: 'UCC Admissions Office' },
      ],
      confidence: 95,
    }
  }

  if (q.includes('computer') || q.includes('technology') || q.includes('aggregate') || q.includes('bsc')) {
    return {
      content: `**BSc Computer Science** at UCC is offered under the College of Agriculture and Natural Sciences.

**General UCC entry requirement (applies across most BSc programmes):**
| Requirement | Detail |
|---|---|
| Overall aggregate | 36 or better (WASSCE) / 24 or better (SSSCE) |
| Core subjects | English Language, Core Mathematics, Integrated Science — credit passes |
| Electives | Three relevant electives, typically including Elective Mathematics and a Science subject |
| Grades accepted | A1–C6 (WASSCE) only — D7, E8, F9 not accepted |

**Note:** UCC does not publish a separate cut-off aggregate for every individual programme — the general 36 aggregate is the baseline, and admission for competitive programmes can depend on the number of applicants in a given year.

**Related programmes at UCC:** BSc Information Technology, BSc Mathematics, and Computer Science offered through the Faculty/Department of Education for those pursuing a B.Ed. route.

Would you like me to check a specific set of WASSCE grades against this requirement?`,
      sources: [
        { title: 'UCC Admissions — Programme Requirements', institution: 'University of Cape Coast' },
        { title: 'UCC Cut-off Points Catalogue', institution: 'UCC Admissions Office' },
      ],
      confidence: 90,
    }
  }

  return {
    content: `Thank you for your question. Based on the UCC admissions data I have access to, here is what I can tell you:

**The University of Cape Coast** offers over **80 undergraduate programmes** across several colleges, including the College of Education Studies, College of Health and Allied Sciences, College of Humanities and Legal Studies, and College of Agriculture and Natural Sciences.

To give you a more accurate and specific answer, could you clarify:
- Which programme or college you're interested in?
- The qualification level (undergraduate or postgraduate)?
- Your WASSCE/SSSCE grades or aggregate, if you'd like an eligibility check?

I can then provide precise admission requirements, application steps, and funding options specific to your situation.`,
    sources: [
      { title: 'UCC Admissions Portal', institution: 'University of Cape Coast' },
    ],
    confidence: 80,
  }
}
