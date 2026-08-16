import { SUGGESTED_QUESTIONS } from './mockData'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AskiMark from './AskiMark'

interface WelcomeScreenProps {
  onQuestion: (q: string) => void
}

const CAPABILITIES = [
  { label: 'Admissions', variant: 'default' as const },
  { label: 'Scholarships', variant: 'accent' as const },
  { label: 'Courses', variant: 'default' as const },
  { label: 'Aggregate Calc', variant: 'accent' as const },
  { label: 'Rankings', variant: 'default' as const },
  { label: 'Careers', variant: 'accent' as const },
]

export default function WelcomeScreen({ onQuestion }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-6 py-6">
      <div className="flex w-full max-w-[680px] flex-col items-center gap-6">
        {/* Hero */}
        <div className="mb-2 flex flex-col items-center gap-6">
          {/* Avatar — the Aski seal, given one deliberate on-mount
              flourish (a "stamp" settle) instead of a looping pulse
              ring. Respects prefers-reduced-motion. */}
          <div
            className="hero-mark flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_12px_40px_rgba(22,35,63,0.22)]"
          >
            <AskiMark size={44} variant="white" />
          </div>
          <style>{`
            .hero-mark { animation: aski-stamp 0.5s cubic-bezier(0.2, 1.5, 0.4, 1) both; }
            @keyframes aski-stamp {
              0% { transform: scale(1.3) rotate(-8deg); opacity: 0; }
              60% { transform: scale(0.94) rotate(2deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-mark { animation: none; }
            }
          `}</style>

          <div className="flex flex-col gap-4 text-center">
            <h1 className="font-display text-[clamp(28px,7vw,40px)] font-normal leading-tight tracking-tight text-foreground">
              Hello, I'm <em className="text-accent-ink italic">Aski AI</em>
            </h1>
            <p className="mx-auto max-w-[520px] font-sans text-base leading-relaxed text-muted-foreground">
              Your AI assistant for education decisions, school info, admissions, courses, and more. Ask anything!
            </p>
          </div>
        </div>

        {/* Capability pills */}
        <div className="mb-2 flex w-full flex-wrap justify-center gap-2">
          {CAPABILITIES.map(pill => (
            <Badge
              key={pill.label}
              variant={pill.variant}
              className={cn(
                'cursor-default font-sans text-xs font-semibold',
                pill.variant === 'default' && 'bg-primary/10 text-primary border-primary/20',
                pill.variant === 'accent' && 'bg-accent/15 text-accent-foreground border-accent/35'
              )}
            >
              {pill.label}
            </Badge>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Suggested questions */}
        <div className="w-full">
          <div className="mb-6 text-center font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Try asking about:
          </div>

          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => onQuestion(q.text)}
                className={cn(
                  'group flex min-h-[110px] w-full flex-col items-start justify-between gap-3 rounded-xl border border-border',
                  'bg-secondary p-4 text-left font-sans transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  'hover:-translate-y-0.5 hover:border-primary hover:bg-background hover:shadow-[0_8px_24px_rgba(22,35,63,0.15)]'
                )}
              >
                <span className="text-2xl leading-none">{q.icon}</span>
                <div className="flex-1">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {q.category}
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-foreground">{q.text}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
