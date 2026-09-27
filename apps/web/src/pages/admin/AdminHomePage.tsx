import { useTranslation } from 'react-i18next'
import { useAdminStats } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/ui/card'

export default function AdminHomePage() {
  const { t } = useTranslation()
  const { data, isPending } = useAdminStats()
  const cards = [
    { label: t('admin.home.users'), value: data?.users },
    { label: t('admin.home.openTickets'), value: data?.openTickets },
    { label: t('admin.home.paid'), value: data?.paid },
    { label: t('admin.home.pastDue'), value: data?.pastDue },
  ]
  return (
    <>
      <PageHeader eyebrow={t('admin.home.eyebrow')} title={t('admin.home.title')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {cards.map((card) => (
          <article key={card.label} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
            <p className="font-label-caps text-label-caps uppercase text-outline">{card.label}</p>
            <p className="font-headline-md text-headline-md text-on-surface mt-1">
              {isPending ? t('common.emDash') : card.value ?? 0}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}
