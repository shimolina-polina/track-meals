import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  createMealId,
  loadMeals,
  normalizeInput,
  saveMeals,
  type Meal,
  type MealInput,
  type MealsByDate,
} from '@/lib/meals';

interface MealsContextValue {
  isReady: boolean;
  mealsByDate: MealsByDate;
  getMeals: (dateKey: string) => Meal[];
  addMeal: (dateKey: string, input: MealInput) => void;
  updateMeal: (dateKey: string, mealId: string, input: MealInput) => void;
  removeMeal: (dateKey: string, mealId: string) => void;
  clearDay: (dateKey: string) => void;
}

const MealsContext = createContext<MealsContextValue | null>(null);

function removeEmptyDays(data: MealsByDate): MealsByDate {
  const next: MealsByDate = {};
  for (const [key, meals] of Object.entries(data)) {
    if (meals.length > 0) next[key] = meals;
  }
  return next;
}

export function MealsProvider({ children }: { children: ReactNode }) {
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({});
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let active = true;
    loadMeals().then((data) => {
      if (!active) return;
      setMealsByDate(data);
      isReadyRef.current = true;
      setIsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isReadyRef.current) return;
    saveMeals(mealsByDate);
  }, [mealsByDate]);

  const getMeals = useCallback(
    (dateKey: string) => mealsByDate[dateKey] ?? [],
    [mealsByDate],
  );

  const addMeal = useCallback((dateKey: string, input: MealInput) => {
    const meal: Meal = { id: createMealId(), ...normalizeInput(input) };
    setMealsByDate((current) => ({
      ...current,
      [dateKey]: [...(current[dateKey] ?? []), meal],
    }));
  }, []);

  const updateMeal = useCallback((dateKey: string, mealId: string, input: MealInput) => {
    setMealsByDate((current) => {
      const meals = current[dateKey];
      if (!meals) return current;
      return {
        ...current,
        [dateKey]: meals.map((meal) =>
          meal.id === mealId ? { id: meal.id, ...normalizeInput(input) } : meal,
        ),
      };
    });
  }, []);

  const removeMeal = useCallback((dateKey: string, mealId: string) => {
    setMealsByDate((current) => {
      const meals = current[dateKey];
      if (!meals) return current;
      return removeEmptyDays({
        ...current,
        [dateKey]: meals.filter((meal) => meal.id !== mealId),
      });
    });
  }, []);

  const clearDay = useCallback((dateKey: string) => {
    setMealsByDate((current) => {
      if (!current[dateKey]) return current;
      const next = { ...current };
      delete next[dateKey];
      return next;
    });
  }, []);

  const value = useMemo<MealsContextValue>(
    () => ({
      isReady,
      mealsByDate,
      getMeals,
      addMeal,
      updateMeal,
      removeMeal,
      clearDay,
    }),
    [isReady, mealsByDate, getMeals, addMeal, updateMeal, removeMeal, clearDay],
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals(): MealsContextValue {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
}
