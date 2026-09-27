import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useReplyTicket, useTicket, useMyTickets } from '@/hooks/useTickets'
import { PageHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function SupportPage() {
  const { id } = useParams()
  const { data: tickets = [], isPending } = useMyTickets()
  const { data: ticket } = useTicket(id)
  const reply = useReplyTicket(id || '')
  const [body, setBody] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await reply.mutateAsync({ body })
      setBody('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reply')
    }
  }

  return (
    <>
      <PageHeader eyebrow="Help" title="Support" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-space-lg">
        <aside className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {isPending && <p className="p-space-md font-body-sm text-body-sm text-outline">Loading…</p>}
          {!isPending && tickets.length === 0 && (
            <p className="p-space-md font-body-sm text-body-sm text-outline">No tickets yet. Use the help button to send one.</p>
          )}
          <ul>
            {tickets.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/support/${item.id}`}
                  className="block px-space-md py-space-sm border-b border-surface-container-low hover:bg-surface-container-low"
                >
                  <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{item.subject}</p>
                  <p className="font-label-caps text-label-caps uppercase text-outline">
                    {item.status} · {item.category}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg min-h-[320px]">
          {!ticket && <p className="font-body-md text-body-md text-outline">Select a ticket to read the thread.</p>}
          {ticket && (
            <div className="flex flex-col gap-space-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{ticket.subject}</h2>
                <p className="font-body-sm text-body-sm text-outline capitalize">
                  {ticket.status} · {ticket.category} · {ticket.priority}
                </p>
                <p className="font-body-md text-body-md text-on-surface mt-space-sm whitespace-pre-wrap">{ticket.body}</p>
              </div>
              <ul className="flex flex-col gap-space-sm">
                {ticket.messages.map((message) => (
                  <li key={message.id} className="rounded-lg bg-surface-container-low p-space-sm">
                    <p className="font-label-caps text-label-caps uppercase text-outline">{message.authorRole}</p>
                    <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{message.body}</p>
                  </li>
                ))}
              </ul>
              {ticket.status !== 'closed' && (
                <form onSubmit={send} className="flex flex-col gap-space-sm">
                  <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply" required />
                  <Button type="submit" disabled={reply.isPending} className="self-end">
                    {reply.isPending ? 'Sending…' : 'Reply'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
