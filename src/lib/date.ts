export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date | null {
  const match = DATE_KEY_PATTERN.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isDateKey(key: string): boolean {
  return fromDateKey(key) !== null;
}

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}



/**
 * Returns a stable 6x7 (42 cell) grid covering the given month, starting on
 * Monday. Days outside the month are included so the grid keeps its shape.
 */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDayOfMonth = startOfMonth(year, month);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - daysToSubtract);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    cells.push(cellDate);
  }
  return cells;
}

export function formatMonthYear(date: Date): string {
  try {
    const newDate = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return newDate.slice(0, 1).toUpperCase() + newDate.slice(1);
  } catch {
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }
}

export function formatLongDate(date: Date): string {
  try {
    const newDate =  date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return newDate.slice(0, 1).toUpperCase() + newDate.slice(1);
  } catch {
    return toDateKey(date);
  }
}


