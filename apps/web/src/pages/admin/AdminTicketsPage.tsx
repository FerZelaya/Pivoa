import { useState } from 'react'
import { Link } from 'react-router'
import { useAdminTickets } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/card'

export default function AdminTicketsPage() {
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const { data = [], isPending } = useAdminTickets(status || undefined, category || undefined)

  return (
    <>
      <PageHeader eyebrow="Inbox" title="Tickets" />
      <div className="flex gap-space-sm">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">All categories</option>
          <option value="bug">Bug</option>
          <option value="account">Account</option>
          <option value="billing">Billing</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm">
        {isPending && <p className="p-space-md font-body-sm text-body-sm text-outline">Loading…</p>}
        <ul>
          {data.map((ticket) => (
            <li key={ticket.id} className="border-b border-surface-container-low px-space-md py-space-sm">
              <Link to={`/admin/tickets/${ticket.id}`} className="font-body-md text-body-md font-semibold text-primary-container">
                {ticket.subject}
              </Link>
              <p className="font-body-sm text-body-sm text-outline">
                {ticket.userEmail} · {ticket.status} · {ticket.priority} · {ticket.category}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
