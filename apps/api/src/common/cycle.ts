export interface CycleWindow {
  start: string;
  end: string;
  daysInCycle: number;
  dayIndex: number;
  daysRemaining: number;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clampDay(year: number, month: number, day: number): number {
  const last = new Date(year, month + 1, 0).getDate();
  return Math.min(Math.max(1, day), last);
}

function cycleStartOnOrBefore(now: Date, cycleStartDay: number): Date {
  const day = clampDay(now.getFullYear(), now.getMonth(), cycleStartDay);
  if (now.getDate() >= day) {
    return new Date(now.getFullYear(), now.getMonth(), day);
  }
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return new Date(prev.getFullYear(), prev.getMonth(), clampDay(prev.getFullYear(), prev.getMonth(), cycleStartDay));
}

function nextCycleStart(start: Date, cycleStartDay: number): Date {
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return new Date(next.getFullYear(), next.getMonth(), clampDay(next.getFullYear(), next.getMonth(), cycleStartDay));
}

function prevCycleStart(start: Date, cycleStartDay: number): Date {
  const prev = new Date(start.getFullYear(), start.getMonth() - 1, 1);
  return new Date(prev.getFullYear(), prev.getMonth(), clampDay(prev.getFullYear(), prev.getMonth(), cycleStartDay));
}

/**
 * Budget cycle window. Day 29–31 clamps to the last day of shorter months.
 * `offset` of -1 is the previous cycle, +1 the next.
 */
export function getCycleWindow(
  cycleStartDay: number,
  now = new Date(),
  offset = 0,
): CycleWindow {
  const day = Math.min(31, Math.max(1, Math.round(cycleStartDay) || 1));
  let start = cycleStartOnOrBefore(now, day);

  if (offset < 0) {
    for (let i = 0; i < -offset; i++) start = prevCycleStart(start, day);
  } else if (offset > 0) {
    for (let i = 0; i < offset; i++) start = nextCycleStart(start, day);
  }

  const next = nextCycleStart(start, day);
  const end = new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1);
  const daysInCycle = Math.round((next.getTime() - start.getTime()) / 86_400_000);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rawIndex = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
  const dayIndex = Math.max(1, Math.min(daysInCycle, rawIndex));
  const daysRemaining = Math.max(0, daysInCycle - dayIndex);

  return {
    start: toISODate(start),
    end: toISODate(end),
    daysInCycle,
    dayIndex,
    daysRemaining,
  };
}
