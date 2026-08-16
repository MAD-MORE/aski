import { useState } from 'react'
import { ArrowLeft, BookMarked, MoreVertical, Plus, Search } from 'lucide-react'
import type { Conversation } from './types'
import { DEMO_CONVERSATIONS, SAVED_ANSWERS } from './mockData'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import AskiMark from './AskiMark'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onBack: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

type NavSection = 'chats' | 'saved'

export default function Sidebar({ conversations, activeId, onSelect, onNewChat, onBack, mobileOpen, onMobileClose }: SidebarProps) {
  const [section, setSection] = useState<NavSection>('chats')
  const [searchVal, setSearchVal] = useState('')

  const allConvos = [...conversations, ...DEMO_CONVERSATIONS].slice(0, 8)
  const filtered = allConvos.filter(c => c.title.toLowerCase().includes(searchVal.toLowerCase()))
  const pinned = filtered.filter(c => c.pinned)
  const recent = filtered.filter(c => !c.pinned)

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} className="mobile-overlay fixed inset-0 z-[39] hidden bg-black/60" />
      )}

      <aside
        className={cn(
          'sidebar relative z-40 flex h-dvh w-[260px] shrink-0 flex-col border-r border-border bg-secondary',
          mobileOpen && 'sidebar-open'
        )}
      >
        {/* Logo + back */}
        <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
              <AskiMark size={15} variant="white" />
            </div>
            <span className="font-display text-base text-foreground">
              Aski <span className="text-accent-ink">AI</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onBack}
            title="Back to home"
            className="border-border bg-background text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
        </div>

        {/* New chat */}
        <div className="p-3 pb-2">
          <Button
            onClick={onNewChat}
            className="w-full gap-2 bg-gradient-to-br from-primary to-primary/80 font-sans text-sm font-semibold tracking-tight text-primary-foreground shadow-[0_2px_12px_rgba(22,35,63,0.28)] hover:opacity-90 hover:shadow-[0_4px_18px_rgba(22,35,63,0.4)]"
          >
            <Plus className="size-3.5" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex gap-1 px-3 pb-2">
          {(['chats', 'saved'] as NavSection[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn(
                'flex-1 rounded-md border px-2 py-1.5 font-sans text-[11px] font-semibold tracking-wide transition-colors',
                section === s
                  ? 'border-primary/35 bg-primary/10 text-primary'
                  : 'border-transparent text-muted-foreground hover:bg-background'
              )}
            >
              {s === 'chats' ? 'Conversations' : 'Saved'}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-2">
          {section === 'chats' ? (
            <>
              {pinned.length > 0 && (
                <>
                  <SectionLabel>Pinned</SectionLabel>
                  {pinned.map(c => (
                    <ConvoItem key={c.id} convo={c} active={activeId === c.id} onSelect={onSelect} />
                  ))}
                </>
              )}
              {recent.length > 0 && (
                <>
                  <SectionLabel className="mt-2">Recent</SectionLabel>
                  {recent.map(c => (
                    <ConvoItem key={c.id} convo={c} active={activeId === c.id} onSelect={onSelect} />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <SectionLabel>Saved Answers</SectionLabel>
              {SAVED_ANSWERS.map(s => (
                <div
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-background"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-success/30 bg-success/10">
                    <BookMarked className="size-3.5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-sans text-xs font-medium text-muted-foreground">{s.title}</div>
                    <div className="mt-0.5 font-sans text-[10px] text-muted-foreground/70">{s.category}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </ScrollArea>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-background">
            <Avatar className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent">
              <AvatarFallback className="rounded-full bg-transparent text-sm font-bold text-primary-foreground">
                K
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate font-sans text-[13px] font-medium text-foreground">Kwame Mensah</div>
              <div className="font-sans text-[11px] text-muted-foreground">Free plan</div>
            </div>
            <MoreVertical className="size-3.5 shrink-0 text-muted-foreground/60" />
          </div>
        </div>
      </aside>
    </>
  )
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-2 pb-1 pt-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70', className)}>
      {children}
    </div>
  )
}

function ConvoItem({ convo, active, onSelect }: { convo: Conversation; active: boolean; onSelect: (id: string) => void }) {
  return (
    <div
      onClick={() => onSelect(convo.id)}
      className={cn(
        'mb-0.5 cursor-pointer rounded-md border px-2.5 py-2 transition-colors',
        active ? 'border-primary/30 bg-primary/10' : 'border-transparent hover:bg-background'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn('flex-1 truncate font-sans text-xs font-medium', active ? 'text-primary' : 'text-foreground/80')}>
          {convo.title}
        </span>
        <span className="shrink-0 font-sans text-[10px] text-muted-foreground">{timeAgoShort(convo.timestamp)}</span>
      </div>
      <div className="mt-0.5 truncate font-sans text-[11px] text-muted-foreground">{convo.preview}</div>
    </div>
  )
}

function timeAgoShort(date: Date) {
  const h = Math.floor((Date.now() - date.getTime()) / 3600_000)
  if (h < 1) return 'now'
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
