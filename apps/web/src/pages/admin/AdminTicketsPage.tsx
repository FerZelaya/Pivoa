import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAdminTickets } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/card'

export default function AdminTicketsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const { data = [], isPending } = useAdminTickets(status || undefined, category || undefined)

  return (
    <>
      <PageHeader eyebrow={t('admin.tickets.eyebrow')} title={t('admin.tickets.title')} />
      <div className="flex gap-space-sm">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">{t('admin.tickets.allStatuses')}</option>
          <option value="open">{t('admin.tickets.open')}</option>
          <option value="pending">{t('admin.tickets.pending')}</option>
          <option value="resolved">{t('admin.tickets.resolved')}</option>
          <option value="closed">{t('admin.tickets.closed')}</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface-container-low rounded-lg px-space-md py-2"
        >
          <option value="">{t('admin.tickets.allCategories')}</option>
          <option value="bug">{t('admin.tickets.bug')}</option>
          <option value="account">{t('admin.tickets.account')}</option>
          <option value="billing">{t('admin.tickets.billing')}</option>
          <option value="other">{t('admin.tickets.other')}</option>
        </select>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm">
        {isPending && <p className="p-space-md font-body-sm text-body-sm text-outline">{t('admin.tickets.loading')}</p>}
        <ul>
          {data.map((ticket) => (
            <li key={ticket.id} className="border-b border-surface-container-low px-space-md py-space-sm">
              <Link to={`/admin/tickets/${ticket.id}`} className="font-body-md text-body-md font-semibold text-primary-container">
                {ticket.subject}
              </Link>
              <p className="font-body-sm text-body-sm text-outline">
                {t('admin.tickets.meta', {
                  email: ticket.userEmail,
                  status: ticket.status,
                  priority: ticket.priority,
                  category: ticket.category,
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
