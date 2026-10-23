import { StyleSheet, Text, View } from 'react-native';

import {
  hasActivity,
  hasLiquid,
  hasWeight,
  totalActivityMinutes,
  totalCalories,
  totalLiquidMl,
  totalWeightGrams,
  type Meal,
} from '@/lib/meals';
import { pluralizeMeals } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';

interface DaySummaryCardProps {
  meals: Meal[];
}

export function DaySummaryCard({ meals }: DaySummaryCardProps) {
  const theme = useTheme();

  if (meals.length === 0) {
    return (
      <View style={StyleSheet.flatten([styles.summary, { backgroundColor: theme.card, borderColor: theme.border }])}>
        <Text style={StyleSheet.flatten([styles.summaryCount, { color: theme.text }])}>
          {meals.length} {pluralizeMeals(meals.length)} пищи
        </Text>
        <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
          Пока ничего не добавлено
        </Text>
      </View>
    );
  }

  const parts: string[] = [];
  parts.push(`${totalCalories(meals)} ккал`);
  if (hasLiquid(meals)) parts.push(`${totalLiquidMl(meals)} мл`);
  if (hasWeight(meals)) parts.push(`${totalWeightGrams(meals)} г`);
  if (hasActivity(meals)) parts.push(`${totalActivityMinutes(meals)} мин`);

  return (
    <View style={StyleSheet.flatten([styles.summary, { backgroundColor: theme.card, borderColor: theme.border }])}>
      <Text style={StyleSheet.flatten([styles.summaryCount, { color: theme.text }])}>
        {meals.length} {pluralizeMeals(meals.length)} пищи
      </Text>
      <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
        {parts.join(' · ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 4,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
});
