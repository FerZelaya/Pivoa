import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useCompleteOnboarding, useSettings } from '@/hooks/useSettings'
import { useCategories } from '@/hooks/useCategories'
import { useCreateBudget } from '@/hooks/useBudgets'
import { useCreateGoal } from '@/hooks/useGoals'
import { useAuth } from '@/contexts/AuthContext'
import { SplashScreen } from '@/components/auth/SplashScreen'
import { Button } from '@/components/ui/button'
import { Input, MoneyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { GOAL_ICONS, categoryIcon, categoryTone } from '@/lib/categories'
import { CurrencySelect } from '@/components/ui/currency-select'
import { formatCurrency, ordinal, setDisplayCurrency } from '@/lib/format'
import { getCycleWindow } from '@/lib/cycle'
import { cn } from '@/lib/utils'

type Step = 0 | 1 | 2 | 3

const STEPS = [
  { title: 'Monthly Budget', icon: 'account_balance_wallet' },
  { title: 'Category Caps', icon: 'donut_small' },
  { title: 'Savings Goal', icon: 'flag' },
]

const INCOME_PRESETS = [2000, 3000, 5000, 8000]

const SUGGESTED_SPLIT: Record<string, number> = {
  housing: 0.3,
  food: 0.15,
  transport: 0.1,
  utilities: 0.08,
  shopping: 0.07,
  entertainment: 0.05,
  health: 0.05,
  other: 0.05,
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { data: settings, isPending: settingsPending } = useSettings()
  const { data: categories = [] } = useCategories()
  const completeOnboarding = useCompleteOnboarding()
  const createBudget = useCreateBudget()
  const createGoal = useCreateGoal()

  const [step, setStep] = useState<Step>(0)
  const [income, setIncome] = useState('')
  const [caps, setCaps] = useState<Record<string, string>>({})
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [goalIcon, setGoalIcon] = useState('savings')
  const [saving, setSaving] = useState(false)
  const [currency, setCurrency] = useState(settings?.currency ?? 'USD')
  const [cycleStartDay, setCycleStartDay] = useState(settings?.cycleStartDay ?? 1)

  useEffect(() => {
    setDisplayCurrency(currency)
  }, [currency])

  if (settingsPending) return <SplashScreen />
  if (settings?.onboardingCompleted && step !== 3) return <Navigate to="/overview" replace />

  const incomeValue = parseFloat(income) || 0
  const allocated = Object.values(caps).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const allocatedPct = incomeValue ? (allocated / incomeValue) * 100 : 0

  const suggestSplit = () => {
    if (!incomeValue) return
    const next: Record<string, string> = {}
    categories.forEach((c) => {
      const share = SUGGESTED_SPLIT[c.name.toLowerCase()]
      if (share) next[c.id] = String(Math.round(incomeValue * share))
    })
    setCaps(next)
  }

  const next = () => {
    if (step === 0 && incomeValue <= 0) return toast.error('Enter your monthly income or budget cap')
    if (step === 2) return finish()
    setStep((s) => (s + 1) as Step)
  }

  const finish = async (skipGoal = false) => {
    setSaving(true)
    try {
      await Promise.allSettled(
        Object.entries(caps)
          .filter(([, v]) => parseFloat(v) > 0)
          .map(([categoryId, v]) => createBudget.mutateAsync({ categoryId, monthlyLimit: parseFloat(v) }))
      )
      if (!skipGoal && goalName.trim() && parseFloat(goalTarget) > 0) {
        await createGoal.mutateAsync({
          name: goalName.trim(),
          targetAmount: parseFloat(goalTarget),
          targetDate: goalDate || undefined,
          icon: goalIcon,
        })
      }
      await completeOnboarding.mutateAsync({ monthlyIncomeCap: incomeValue, currency, cycleStartDay })
      setStep(3)
      setTimeout(() => navigate('/overview', { replace: true }), 1400)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete setup')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center justify-between px-space-lg sm:px-space-xl">
        <Logo className="h-10" />
        <button
          type="button"
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
          className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
        >
          <Icon name="logout" className="text-[16px]" /> Sign out
        </button>
      </header>

      <main className="flex-1 flex items-start justify-center px-space-md py-space-xl">
        <div className="w-full max-w-[620px] flex flex-col gap-space-lg">
          {step < 3 && (
            <>
              <div className="text-center">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Setup • Step {step + 1} of 3
                </span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">Let&apos;s build your monthly plan</h1>
              </div>

              <div className="flex items-center gap-space-sm">
                {STEPS.map((s, i) => (
                  <div key={s.title} className="flex-1 flex flex-col gap-space-xs">
                    <div className={cn('h-1.5 rounded-full transition-colors', i <= step ? 'bg-primary-container' : 'bg-surface-container-high')} />
                    <span
                      className={cn(
                        'flex items-center gap-1 font-label-caps text-label-caps uppercase',
                        i === step ? 'text-primary-container' : i < step ? 'text-secondary' : 'text-outline'
                      )}
                    >
                      <Icon name={i < step ? 'check_circle' : s.icon} className="text-[14px]" /> {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div key={step} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl animate-scale-in">
            {step === 0 && (
              <div className="flex flex-col gap-space-lg">
                <StepHeading
                  icon="account_balance_wallet"
                  title="What's your monthly budget?"
                  text="Enter your take-home income or the most you want to spend each month. We'll pace every day against it."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <CurrencySelect id="currency" value={currency} onChange={setCurrency} />
                  </div>
                  <div>
                    <Label htmlFor="cycleStartDay">Budget resets on</Label>
                    <select
                      id="cycleStartDay"
                      value={cycleStartDay}
                      onChange={(e) => setCycleStartDay(Number(e.target.value))}
                      className="w-full bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface border border-transparent focus:outline-none focus:border-primary-container"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          The {ordinal(day)}
                        </option>
                      ))}
                    </select>
                    <p className="font-body-sm text-body-sm text-outline mt-1">
                      Current window {getCycleWindow(cycleStartDay).start} – {getCycleWindow(cycleStartDay).end}
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="income">Max spend per month</Label>
                  <MoneyInput id="income" large currency={currency} placeholder="3000" value={income} onChange={(e) => setIncome(e.target.value)} autoFocus />
                </div>
                <div className="flex flex-wrap gap-space-sm">
                  {INCOME_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setIncome(String(p))}
                      className={cn(
                        'px-space-md py-1.5 rounded-lg font-label-numeric-sm text-label-numeric-sm transition-colors',
                        incomeValue === p ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      )}
                    >
                      {formatCurrency(p).replace('.00', '')}
                    </button>
                  ))}
                </div>
                {incomeValue > 0 && (
                  <div className="grid grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-lg">
                    <div>
                      <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Daily run rate</div>
                      <div className="font-label-numeric-md text-label-numeric-md font-semibold text-secondary">{formatCurrency(incomeValue / 30)}/d</div>
                    </div>
                    <div>
                      <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Weekly allowance</div>
                      <div className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatCurrency((incomeValue * 12) / 52)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-space-lg">
                <div className="flex items-start justify-between gap-space-md">
                  <StepHeading icon="donut_small" title="Cap your categories" text="Optional — set a max per category. You can change these anytime." />
                  <Button type="button" variant="tonal" size="sm" onClick={suggestSplit}>
                    <Icon name="auto_awesome" className="text-[16px]" /> Suggest
                  </Button>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between font-label-numeric-sm text-label-numeric-sm">
                    <span className="text-on-surface-variant">
                      {formatCurrency(allocated)} allocated of {formatCurrency(incomeValue)}
                    </span>
                    <span className={allocatedPct > 100 ? 'text-tertiary-container' : 'text-secondary'}>{allocatedPct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', allocatedPct > 100 ? 'bg-tertiary-container' : 'bg-primary-container')}
                      style={{ width: `${Math.min(100, allocatedPct)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {categories.map((c) => {
                    const tone = categoryTone(c.name)
                    return (
                      <div key={c.id} className="flex items-center gap-space-sm bg-surface-container-low/60 rounded-lg p-space-sm">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', tone.tile)}>
                          <Icon name={categoryIcon(c.icon, c.name)} className="text-[18px]" />
                        </div>
                        <span className="flex-1 font-body-md text-body-md font-medium text-on-surface truncate">{c.name}</span>
                        <div className="w-28">
                          <MoneyInput
                            placeholder="0"
                            value={caps[c.id] ?? ''}
                            onChange={(e) => setCaps((prev) => ({ ...prev, [c.id]: e.target.value }))}
                            className="py-1.5 bg-surface-container-lowest"
                            aria-label={`${c.name} monthly cap`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-space-lg">
                <StepHeading icon="flag" title="Set your first savings goal" text="Optional — an emergency fund is a great place to start." />
                <div>
                  <Label htmlFor="goalName">Goal name</Label>
                  <Input id="goalName" placeholder="Emergency Reserve" value={goalName} onChange={(e) => setGoalName(e.target.value)} autoFocus />
                </div>
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-8 gap-space-xs">
                    {GOAL_ICONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        title={o.label}
                        onClick={() => setGoalIcon(o.value)}
                        className={cn(
                          'h-10 rounded-lg flex items-center justify-center transition-colors',
                          goalIcon === o.value ? 'bg-primary-container text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        )}
                      >
                        <Icon name={o.value} className="text-[20px]" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-space-md">
                  <div>
                    <Label htmlFor="goalTarget">Target amount</Label>
                    <MoneyInput id="goalTarget" placeholder="10000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="goalDate">Target date</Label>
                    <Input id="goalDate" type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center text-center gap-space-md py-space-lg">
                <div className="w-16 h-16 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
                  <Icon name="task_alt" className="text-[36px]" />
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">You&apos;re all set!</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Your {formatCurrency(incomeValue)} monthly plan is live. Opening your overview…
                </p>
              </div>
            )}

            {step < 3 && (
              <div className="flex items-center justify-between gap-space-sm mt-space-xl pt-space-lg border-t border-surface-container-low">
                <Button type="button" variant="ghost" onClick={() => setStep((s) => (s - 1) as Step)} disabled={step === 0} className={step === 0 ? 'invisible' : ''}>
                  <Icon name="arrow_back" className="text-[18px]" /> Back
                </Button>
                <div className="flex items-center gap-space-sm">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (step === 1) {
                          setCaps({})
                          setStep(2)
                        } else {
                          finish(true)
                        }
                      }}
                      disabled={saving}
                    >
                      Skip
                    </Button>
                  )}
                  <Button type="button" onClick={next} disabled={saving}>
                    {saving ? 'Saving…' : step === 2 ? 'Complete Setup' : 'Continue'}
                    <Icon name={step === 2 ? 'check' : 'arrow_forward'} className="text-[18px]" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StepHeading({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-space-sm">
      <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
        <Icon name={icon} className="text-[22px]" />
      </div>
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{text}</p>
      </div>
    </div>
  )
}
