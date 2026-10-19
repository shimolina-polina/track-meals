import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


import { type MealsByDate, type Meal, mealTypeLabel } from '@/lib/meals';
import { fromDateKey, formatLongDate, toDateKey } from '@/lib/date';

export interface ExportOptions {
  from: Date;
  to: Date;
}

function getStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function computeRange(options: ExportOptions): { from: Date; to: Date } {
  const from = options.from ? getStartOfDay(options.from) : getStartOfDay(new Date());
  const to = options.to ? endOfDay(options.to) : endOfDay(new Date());
  return { from, to };
}

function escapeCsv(value: unknown): string {
  const s = String(value ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
  return `"${s}"`;
}

export interface ExportResult {
  uri: string;
  shared: boolean;
}

export async function exportMealsToCsv(mealsByDate: MealsByDate, options: ExportOptions): Promise<ExportResult> {
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

  const getWeekDay = (d: Date): string => {
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    return days[d.getDay()];
  };
  const header = ['Дата', 'День недели', 'Время', 'Тип приёма', 'Что съедено', 'объем - мл', 'вес - гр', 'физ.активность - мин'].join(',');
  const rows = entries.map((e) => {
    const meal = e.meal;
    return [
      escapeCsv(formatLongDate(e.date)),
      escapeCsv(getWeekDay(e.date)),
      escapeCsv(meal.time ?? ''),
      escapeCsv(mealTypeLabel(meal.type)),
      escapeCsv(meal.name ?? ''),
      escapeCsv(meal.liquidMl ?? ''),
      escapeCsv(meal.weightGrams ?? ''),
      escapeCsv(meal.activityMinutes ?? ''),
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');

  const fileName = `питание_${toDateKey(from)}_${toDateKey(to)}.csv`;

  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '/tmp/';
  const uri = `${cacheDir}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, '\uFEFF' + csv, { encoding: FileSystem.EncodingType.UTF8 });

  if (!(await Sharing.isAvailableAsync())) {
    const contentUri = await FileSystem.getContentUriAsync(uri);
    return { uri: contentUri, shared: false };
  }

  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Экспорт данных' });
  return { uri, shared: true };
}
