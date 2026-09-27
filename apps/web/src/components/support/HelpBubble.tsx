import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TicketCategory } from '@pivoa/shared'
import { useCreateTicket } from '@/hooks/useTickets'
import { useMe } from '@/hooks/useMe'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const CATEGORY_IDS: TicketCategory[] = ['bug', 'account', 'billing', 'other']

export function HelpBubble() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'ticket' | 'chat'>('ticket')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<TicketCategory>('bug')
  const [body, setBody] = useState('')
  const createTicket = useCreateTicket()
  const { data: me } = useMe()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTicket.mutateAsync({ subject, category, body, priority: me?.highPriorityTickets ? 'high' : 'normal' })
      toast.success(t('support.help.sent'))
      setSubject('')
      setBody('')
      setOpen(false)
      navigate('/support')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('support.help.sendError'))
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-space-sm">
      {open && (
        <div className="w-[min(100vw-2rem,360px)] bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_-12px_rgba(11,28,48,0.25)] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-space-md py-space-sm bg-primary-container text-on-primary">
            <p className="font-body-md text-body-md font-semibold">{t('support.help.title')}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('support.help.close')}>
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
          <div className="flex border-b border-surface-container">
            {(['ticket', 'chat'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  'flex-1 py-2 font-label-caps text-label-caps uppercase',
                  tab === item ? 'text-primary-container border-b-2 border-primary-container' : 'text-outline'
                )}
              >
                {item === 'ticket' ? t('support.help.ticket') : t('support.help.chat')}
              </button>
            ))}
          </div>
          {tab === 'chat' ? (
            <div className="p-space-lg text-center">
              <Icon name="forum" className="text-[32px] text-outline" />
              <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">{t('support.help.comingSoon')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t('support.help.chatUnavailable')}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="p-space-md flex flex-col gap-space-sm">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('support.help.subject')} required minLength={3} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md"
              >
                {CATEGORY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {t(`support.help.categories.${id}`)}
                  </option>
                ))}
              </select>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('support.help.whatHappened')}
                required
                minLength={10}
                className="min-h-[96px]"
              />
              <Button type="submit" disabled={createTicket.isPending}>
                {createTicket.isPending ? t('support.help.sending') : t('support.help.sendTicket')}
              </Button>
            </form>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-14 w-14 rounded-full bg-primary-container text-on-primary shadow-lg flex items-center justify-center hover:bg-primary"
        aria-label={t('support.help.open')}
      >
        <Icon name={open ? 'close' : 'support_agent'} className="text-[28px]" />
      </button>
    </div>
  )
}
