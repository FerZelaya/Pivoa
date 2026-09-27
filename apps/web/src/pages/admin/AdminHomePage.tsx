import { useAdminStats } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/ui/card'

export default function AdminHomePage() {
  const { data, isPending } = useAdminStats()
  const cards = [
    { label: 'Users', value: data?.users },
    { label: 'Open tickets', value: data?.openTickets },
    { label: 'Plus & Pro', value: data?.paid },
    { label: 'Past due', value: data?.pastDue },
  ]
  return (
    <>
      <PageHeader eyebrow="Company" title="Admin" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {cards.map((card) => (
          <article key={card.label} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
            <p className="font-label-caps text-label-caps uppercase text-outline">{card.label}</p>
            <p className="font-headline-md text-headline-md text-on-surface mt-1">{isPending ? '—' : card.value ?? 0}</p>
          </article>
        ))}
      </div>
    </>
  )
}
