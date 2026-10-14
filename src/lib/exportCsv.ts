import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import { type MealsByDate, type Meal } from '@/lib/meals';
import { fromDateKey, formatLongDate } from '@/lib/date';

function mealTypeLabelLocal(type: Meal['type']): string {
  switch (type) {
    case 'breakfast': return 'Завтрак';
    case 'lunch': return 'Обед';
    case 'dinner': return 'Ужин';
    case 'snack': return 'Перекус';
  }
}

export type ExportRange = 'week' | 'month' | 'range';

export interface ExportOptions {
  range: ExportRange;
  from?: Date;
  to?: Date;
}

function getStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function computeRange(options: ExportOptions, now = new Date()): { from: Date; to: Date } {
  const today = getStartOfDay(now);
  if (options.range === 'week') {
    const from = addDays(today, -6);
    return { from, to: endOfDay(today) };
  }
  if (options.range === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from, to: endOfDay(today) };
  }
  if (options.range === 'range') {
    const from = options.from ? getStartOfDay(options.from) : today;
    const to = options.to ? endOfDay(options.to) : endOfDay(today);
    return { from, to };
  }
  return { from: today, to: endOfDay(today) };
}

function escapeCsv(value: unknown): string {
  const s = String(value ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
  return `"${s}"`;
}

export async function exportMealsToCsv(mealsByDate: MealsByDate, options: ExportOptions): Promise<void> {
  const { from, to } = computeRange(options);
  const entries: { date: Date; dateKey: string; meal: Meal }[] = [];
  for (const [key, meals] of Object.entries(mealsByDate)) {
    const d = fromDateKey(key);
    if (!d) continue;
    if (d < from || d > to) continue;
    for (const meal of meals) {
      entries.push({ date: d, dateKey: key, meal });
    }
  }
  entries.sort((a, b) => {
    const da = a.date.getTime() - b.date.getTime();
    if (da !== 0) return da;
    const ta = a.meal.time || '';
    const tb = b.meal.time || '';
    return ta.localeCompare(tb);
  });

  const header = ['Дата', 'Время', 'Тип приёма', 'Что съедено', 'ккал', 'мл'].join(',');
  const rows = entries.map((e) => {
    const meal = e.meal;
    return [
      escapeCsv(formatLongDate(e.date)),
      escapeCsv(meal.time ?? ''),
      escapeCsv(mealTypeLabelLocal(meal.type)),
      escapeCsv(meal.name ?? ''),
      escapeCsv(meal.calories ?? ''),
      escapeCsv(meal.liquidMl ?? ''),
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');

  const fileName = `питание_${from.getFullYear()}-${String(from.getMonth()+1).padStart(2,'0')}-${String(from.getDate()).padStart(2,'0')}_${to.getFullYear()}-${String(to.getMonth()+1).padStart(2,'0')}-${String(to.getDate()).padStart(2,'0')}.csv`;

  const uri = `${(FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '/tmp/'}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, '\uFEFF' + csv, { encoding: "utf8" });
  if (!(await Sharing.isAvailableAsync())) {
    await (FileSystem as any).getContentUriAsync(uri).then((u: string) => Alert.alert('Сохранено', u));
    return;
  }
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Экспорт данных' });
}
