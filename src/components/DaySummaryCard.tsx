import { StyleSheet, Text, View } from 'react-native';

import { hasLiquid, totalCalories, totalLiquidMl, type Meal } from '@/lib/meals';
import { pluralizeMeals } from '@/lib/i18n';
import { useTheme } from '@/hooks/useTheme';

interface DaySummaryCardProps {
  meals: Meal[];
}

export function DaySummaryCard({ meals }: DaySummaryCardProps) {
  const theme = useTheme();

  return (
    <View style={StyleSheet.flatten([styles.summary, { backgroundColor: theme.card, borderColor: theme.border }])}>
      <Text style={StyleSheet.flatten([styles.summaryCount, { color: theme.text }])}>
        {meals.length} {pluralizeMeals(meals.length)} пищи
      </Text>
      <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
        {meals.length === 0
          ? 'Пока ничего не добавлено'
          : `${totalCalories(meals)} ккал${hasLiquid(meals) ? ` · ${totalLiquidMl(meals)} мл` : ''}`}
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
