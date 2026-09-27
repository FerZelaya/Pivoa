import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { TicketStatus } from '@pivoa/shared'
import { useAdminTicket, useUpdateAdminTicket } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function AdminTicketPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { data: ticket, isPending } = useAdminTicket(id)
  const update = useUpdateAdminTicket(id)
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await update.mutateAsync({
        status: status || undefined,
        reply: reply.trim() || undefined,
      })
      setReply('')
      toast.success(t('admin.ticket.updated'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('admin.ticket.updateError'))
    }
  }

  if (isPending || !ticket) {
    return (
      <p className="font-body-md text-body-md text-outline">
        {isPending ? t('admin.ticket.loading') : t('admin.ticket.notFound')}
      </p>
    )
  }

  return (
    <>
      <PageHeader eyebrow={ticket.userEmail || t('admin.ticket.eyebrowFallback')} title={ticket.subject} />
      <p className="font-body-sm text-body-sm text-outline capitalize">
        {t('admin.ticket.meta', {
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
        })}
        {ticket.userId && (
          <>
            {' '}
            ·{' '}
            <Link to={`/admin/users/${ticket.userId}`} className="text-primary-container">
              {t('admin.ticket.openUser')}
            </Link>
          </>
        )}
      </p>
      <p className="font-body-md text-body-md whitespace-pre-wrap bg-surface-container-lowest rounded-xl p-space-lg">{ticket.body}</p>
      <ul className="flex flex-col gap-space-sm">
        {ticket.messages.map((message) => (
          <li key={message.id} className="bg-surface-container-low rounded-lg p-space-sm">
            <p className="font-label-caps text-label-caps uppercase text-outline">{message.authorRole}</p>
            <p className="font-body-md text-body-md whitespace-pre-wrap">{message.body}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={save} className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col gap-space-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TicketStatus | '')}
          className="bg-surface-container-low rounded-lg px-space-md py-2 max-w-xs"
        >
          <option value="">{t('admin.ticket.keepStatus')}</option>
          <option value="open">{t('admin.ticket.open')}</option>
          <option value="pending">{t('admin.ticket.pending')}</option>
          <option value="resolved">{t('admin.ticket.resolved')}</option>
          <option value="closed">{t('admin.ticket.closed')}</option>
        </select>
        <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t('admin.ticket.replyPlaceholder')} />
        <Button type="submit" disabled={update.isPending} className="self-start">
          {update.isPending ? t('admin.ticket.saving') : t('admin.ticket.update')}
        </Button>
      </form>
    </>
  )
}
