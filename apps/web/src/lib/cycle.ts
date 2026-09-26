import { toISODate } from './format'

export interface CycleWindow {
  start: string
  end: string
  daysInCycle: number
  dayIndex: number
  daysRemaining: number
}

function clampDay(year: number, month: number, day: number) {
  const last = new Date(year, month + 1, 0).getDate()
  return Math.min(Math.max(1, day), last)
}

function cycleStartOnOrBefore(now: Date, cycleStartDay: number) {
  const day = clampDay(now.getFullYear(), now.getMonth(), cycleStartDay)
  if (now.getDate() >= day) return new Date(now.getFullYear(), now.getMonth(), day)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return new Date(prev.getFullYear(), prev.getMonth(), clampDay(prev.getFullYear(), prev.getMonth(), cycleStartDay))
}

function nextCycleStart(start: Date, cycleStartDay: number) {
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  return new Date(next.getFullYear(), next.getMonth(), clampDay(next.getFullYear(), next.getMonth(), cycleStartDay))
}

export function getCycleWindow(cycleStartDay: number, now = new Date()): CycleWindow {
  const day = Math.min(31, Math.max(1, Math.round(cycleStartDay) || 1))
  const start = cycleStartOnOrBefore(now, day)
  const next = nextCycleStart(start, day)
  const end = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1)
  const daysInCycle = Math.round((next.getTime() - start.getTime()) / 86_400_000)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rawIndex = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1
  const dayIndex = Math.max(1, Math.min(daysInCycle, rawIndex))
  return {
    start: toISODate(start),
    end: toISODate(end),
    daysInCycle,
    dayIndex,
    daysRemaining: Math.max(0, daysInCycle - dayIndex),
  }
}
