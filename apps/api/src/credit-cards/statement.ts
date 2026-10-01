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

function onDay(year: number, month: number, day: number): Date {
  return new Date(year, month, clampDay(year, month, day));
}

function parseISODate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Last statement close on or before `date`, then the following close. */
export function statementWindow(closeDay: number, chargeDate: string): { start: string; end: string } {
  const charge = parseISODate(chargeDate);
  const thisClose = onDay(charge.getFullYear(), charge.getMonth(), closeDay);
  const start = charge.getDate() >= thisClose.getDate()
    ? thisClose
    : onDay(charge.getFullYear(), charge.getMonth() - 1, closeDay);
  const following = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const end = onDay(following.getFullYear(), following.getMonth(), closeDay);
  return { start: toISODate(start), end: toISODate(end) };
}

/** First due date strictly after the statement close. */
export function dueAfterClose(statementEnd: string, dueDay: number): string {
  const close = parseISODate(statementEnd);
  const same = onDay(close.getFullYear(), close.getMonth(), dueDay);
  if (same.getTime() > close.getTime()) return toISODate(same);
  const next = new Date(close.getFullYear(), close.getMonth() + 1, 1);
  return toISODate(onDay(next.getFullYear(), next.getMonth(), dueDay));
}

export function nextCloseDate(closeDay: number, now = new Date()): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisClose = onDay(today.getFullYear(), today.getMonth(), closeDay);
  if (thisClose.getTime() >= today.getTime()) return toISODate(thisClose);
  const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return toISODate(onDay(next.getFullYear(), next.getMonth(), closeDay));
}

export function nextDueDate(closeDay: number, dueDay: number, now = new Date()): string {
  return dueAfterClose(nextCloseDate(closeDay, now), dueDay);
}
