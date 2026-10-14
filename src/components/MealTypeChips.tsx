import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MEAL_TYPES, type MealType } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';

interface MealTypeChipsProps {
  value: MealType;
  onChange: (type: MealType) => void;
}

export function MealTypeChips({ value, onChange }: MealTypeChipsProps) {
  const theme = useTheme();

  return (
    <View style={styles.chips}>
      {MEAL_TYPES.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            onPress={() => onChange(item.value)}
            style={StyleSheet.flatten([
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.cardMuted,
                borderColor: active ? theme.primary : theme.border,
              },
            ])}
          >
            <Text style={StyleSheet.flatten([styles.chipText, { color: active ? theme.onPrimary : theme.text }])}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
