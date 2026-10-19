import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { MealTypeChips } from '@/components/MealTypeChips';
import type { Meal, MealInput, MealType } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';

interface MealFormProps {
  editingMeal: Meal | null;
  onSubmit: (input: MealInput) => void;
  onCancel: () => void;
}

function toNumberText(value: number | null): string {
  return value === null ? '' : String(value);
}

export function MealForm({ editingMeal, onSubmit, onCancel }: MealFormProps) {
  const theme = useTheme();

  const [name, setName] = useState(editingMeal?.name ?? '');
  const [type, setType] = useState<MealType>(editingMeal?.type ?? 'breakfast');
  const [caloriesText, setCaloriesText] = useState(toNumberText(editingMeal?.calories ?? null));
  const [liquidText, setLiquidText] = useState(toNumberText(editingMeal?.liquidMl ?? null));
  const [weightText, setWeightText] = useState(toNumberText(editingMeal?.weightGrams ?? null));
  const [activityText, setActivityText] = useState(toNumberText(editingMeal?.activityMinutes ?? null));
  const [timeText, setTimeText] = useState(() => {
    if (editingMeal?.time) return editingMeal.time;
    if (editingMeal) return '';
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  const calories = useMemo(() => {
    const trimmed = caloriesText.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
  }, [caloriesText]);

  const liquidMl = useMemo(() => {
    const trimmed = liquidText.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
  }, [liquidText]);

  const weightGrams = useMemo(() => {
    const trimmed = weightText.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
  }, [weightText]);

  const activityMinutes = useMemo(() => {
    const trimmed = activityText.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
  }, [activityText]);

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') return;
    onSubmit({
      name: trimmedName,
      type,
      calories,
      liquidMl,
      weightGrams,
      activityMinutes,
      time: timeText.trim() === '' ? null : timeText,
    });
  };

  return (
    <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
      <Text style={StyleSheet.flatten([styles.cardTitle, { color: theme.text }])}>
        {editingMeal ? 'Редактировать приём пищи' : 'Добавить приём пищи'}
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Что вы съели?"
        placeholderTextColor={theme.subtext}
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <MealTypeChips value={type} onChange={setType} />

      <TextInput
        value={caloriesText}
        onChangeText={setCaloriesText}
        placeholder="Калории (необязательно)"
        placeholderTextColor={theme.subtext}
        keyboardType="number-pad"
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <TextInput
        value={liquidText}
        onChangeText={setLiquidText}
        placeholder="Жидкость, мл (необязательно)"
        placeholderTextColor={theme.subtext}
        keyboardType="number-pad"
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <TextInput
        value={weightText}
        onChangeText={setWeightText}
        placeholder="Вес, г (необязательно)"
        placeholderTextColor={theme.subtext}
        keyboardType="number-pad"
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <TextInput
        value={activityText}
        onChangeText={setActivityText}
        placeholder="Физ. активность, мин (необязательно)"
        placeholderTextColor={theme.subtext}
        keyboardType="number-pad"
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <TextInput
        value={timeText}
        onChangeText={(text: string) => {
          if (text.length === 3 && text[2] !== ':') setTimeText(text.slice(0, 2) + ':' + text.slice(2));
          else setTimeText(text);
        }}
        placeholder="Время приёма (ЧЧ:ММ)"
        placeholderTextColor={theme.subtext}
        keyboardType="default"
        style={StyleSheet.flatten([
          styles.input,
          { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardMuted },
        ])}
      />

      <View style={styles.formActions}>
        <Button
          label={editingMeal ? 'Сохранить изменения' : 'Добавить'}
          onPress={submit}
          disabled={!canSubmit}
        />
        {editingMeal ? <Button label="Отмена" variant="secondary" onPress={onCancel} /> : null}
      </View>
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
});
