import AsyncStorage from '@react-native-async-storage/async-storage';

import { isDateKey } from './date';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  calories: number | null;
  liquidMl: number | null;
  time: string | null;
}

export type MealInput = Omit<Meal, 'id'>;

export type MealsByDate = Record<string, Meal[]>;

export const STORAGE_KEY = 'track-meals:v1';

const MEAL_TYPE_VALUES = MEAL_TYPES.map((item) => item.value);

export function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && (MEAL_TYPE_VALUES as string[]).includes(value);
}

export function mealTypeLabel(type: MealType): string {
  return MEAL_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function createMealId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeInput(input: MealInput): MealInput {
  return {
    name: input.name.trim(),
    type: isMealType(input.type) ? input.type : 'breakfast',
    calories:
      input.calories === null || Number.isNaN(input.calories)
        ? null
        : Math.max(0, Math.round(input.calories)),
    liquidMl:
      input.liquidMl === null || Number.isNaN(input.liquidMl)
        ? null
        : Math.max(0, Math.round(input.liquidMl)),
    time: normTime(input.time),
  };
}

function normTime(t: unknown): string | null {
  if (t === null || t === undefined || t === '') return null;
  if (typeof t !== 'string') return null;
  const s2 = t.trim();
  const m = /^([0-1]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(s2);
  if (!m) return null;
  return `${String(Number(m[1])).padStart(2, '0')}:${m[2]}`;
}

function sanitizeMeal(value: unknown): Meal | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string') return null;
  const calories =
    typeof record.calories === 'number' && Number.isFinite(record.calories)
      ? Math.max(0, Math.round(record.calories))
      : null;
  const liquidMl =
    typeof (record as any).liquidMl === 'number' && Number.isFinite((record as any).liquidMl)
      ? Math.max(0, Math.round((record as any).liquidMl))
      : null;
  const timeRaw = (record as any).time;
  const time = typeof timeRaw === 'string' ? normTime(timeRaw) : null;
  return {
    id: record.id,
    name: record.name,
    type: isMealType(record.type) ? record.type : 'breakfast',
    calories,
    liquidMl,
    time,
  };
}

export function sanitizeMealsByDate(value: unknown): MealsByDate {
  if (!value || typeof value !== 'object') return {};
  const result: MealsByDate = {};
  for (const [key, meals] of Object.entries(value as Record<string, unknown>)) {
    if (!isDateKey(key) || !Array.isArray(meals)) continue;
    const clean = meals.map(sanitizeMeal).filter((meal): meal is Meal => meal !== null);
    if (clean.length > 0) result[key] = clean;
  }
  return result;
}

export async function loadMeals(): Promise<MealsByDate> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitizeMealsByDate(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function saveMeals(data: MealsByDate): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Persistence is best-effort; the in-memory state stays the source of truth.
  }
}

export function totalCalories(meals: Meal[]): number {
  return meals.reduce((sum, meal) => sum + (meal.calories ?? 0), 0);
}

export function totalLiquidMl(meals: Meal[]): number {
  return meals.reduce((sum, meal) => sum + (meal.liquidMl ?? 0), 0);
}

export function hasLiquid(meals: Meal[]): boolean {
  return meals.some((meal) => meal.liquidMl !== null);
}


