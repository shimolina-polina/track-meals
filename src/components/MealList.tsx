import { Pressable, StyleSheet, Text, View } from 'react-native';

import { mealTypeLabel, type Meal } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';

interface MealListProps {
  meals: Meal[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

export function MealList({ meals, onEdit, onRemove }: MealListProps) {
  const theme = useTheme();

  return (
    <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
      {meals.length === 0 ? (
        <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
          Добавьте свой первый прием пищи
        </Text>
      ) : (
        meals.map((meal) => (
          <View key={meal.id} style={StyleSheet.flatten([styles.mealRow, { borderColor: theme.border }])}>
            <Pressable style={styles.mealInfo} onPress={() => onEdit(meal.id)}>
              <Text style={StyleSheet.flatten([styles.mealName, { color: theme.text }])} numberOfLines={1}>
                {meal.name || 'Без названия'}
              </Text>
              <Text style={StyleSheet.flatten([styles.mealMeta, { color: theme.subtext }])}>
                {mealTypeLabel(meal.type)}
                {meal.calories === null ? '' : ` · ${meal.calories} ккал`}
                {meal.liquidMl === null ? '' : ` · ${meal.liquidMl} мл`}
                {meal.time ? ` · ${meal.time}` : ''}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onRemove(meal.id)}
              hitSlop={8}
            >
              <Text style={StyleSheet.flatten([styles.deleteText, { color: theme.danger }])}>Удалить</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  muted: {
    fontSize: 14,
    lineHeight: 20,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mealInfo: {
    flex: 1,
    gap: 2,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
  },
  mealMeta: {
    fontSize: 13,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
