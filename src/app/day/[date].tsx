import { Link, Stack, useLocalSearchParams, type SuspenseFallbackProps } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { LoadingFallback } from '@/components/LoadingFallback';
import { formatLongDate, fromDateKey } from '@/lib/date';
import { hasLiquid, mealTypeLabel, MEAL_TYPES, totalCalories, totalLiquidMl, type MealType } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';
import { useMeals } from '@/store/meals';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export function SuspenseFallback(_props: SuspenseFallbackProps) {
  return <LoadingFallback label="Preparing this day..." />;
}

export default function EditDayScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const dateKey = params.date ?? '';
  const date = fromDateKey(dateKey);

  if (!date) {
    return <InvalidDayFallback dateKey={dateKey} />;
  }

  return <EditDayContent dateKey={dateKey} date={date} />;
}

function InvalidDayFallback({ dateKey }: { dateKey: string }) {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'День не найден' }} />
      <View style={StyleSheet.flatten([styles.invalidContainer, { backgroundColor: theme.background }])}>
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
          <Text style={StyleSheet.flatten([styles.cardTitle, { color: theme.text }])}>We couldn&apos;t open that day</Text>
          <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
            {dateKey ? `"${dateKey}" is not a valid date.` : 'Дата не указана.'}
          </Text>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              style={StyleSheet.flatten([styles.linkButton, { backgroundColor: theme.primary }])}
            >
              <Text style={StyleSheet.flatten([styles.linkButtonText, { color: theme.onPrimary }])}>
                Вернуться в календарь
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}

function EditDayContent({ dateKey, date }: { dateKey: string; date: Date }) {
  const theme = useTheme();
  const { isReady, getMeals, addMeal, updateMeal, removeMeal, clearDay } = useMeals();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [type, setType] = useState<MealType>('breakfast');
  const [caloriesText, setCaloriesText] = useState('');
  const [liquidText, setLiquidText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const meals = getMeals(dateKey);

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

  const resetForm = () => {
    setName('');
    setType('breakfast');
    setCaloriesText('');
    setLiquidText('');
    setTimeText('');
    setEditingId(null);
  };

  const submit = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') return;
    const input = { name: trimmedName, type, calories, liquidMl, time: timeText.trim() === '' ? null : timeText };
    if (editingId) {
      updateMeal(dateKey, editingId, input);
    } else {
      addMeal(dateKey, input);
    }
    resetForm();
  };

  const startEdit = (id: string) => {
    const meal = meals.find((item) => item.id === id);
    if (!meal) {
      setTimeText(date.getHours() + ":" + date.getMinutes())
      return;
    }
    setName(meal.name);
    setType(meal.type);
    setCaloriesText(meal.calories === null ? '' : String(meal.calories));
    setLiquidText(meal.liquidMl === null ? '' : String(meal.liquidMl));
    setTimeText(meal.time ?? '');
    setEditingId(id);
  };

  const confirmClear = () => {
    if (meals.length === 0) return;
    Alert.alert('Очистить этот день?', 'Все приемы пищи за этот день будут удалены.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: () => clearDay(dateKey) },
    ]);
  };

  if (!isReady) {
    return <LoadingFallback />;
  }

  const canSubmit = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <Stack.Screen options={{ title: formatLongDate(date) }} />
      <ScrollView contentContainerStyle={StyleSheet.flatten([styles.content, { paddingBottom: Math.max(styles.content.padding, insets.bottom) }])} keyboardShouldPersistTaps="handled">
        <View style={StyleSheet.flatten([styles.summary, { backgroundColor: theme.card, borderColor: theme.border }])}>
          <Text style={StyleSheet.flatten([styles.summaryCount, { color: theme.text }])}>
            {meals.length} {meals.length % 10 === 1 ? 'прием' : meals.length % 10 === 2 || meals.length % 10 === 3 || meals.length % 10 === 4 ? 'приема' : 'приемов'} пищи
          </Text>
          <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
            {meals.length === 0
              ? 'Пока ничего не добавлено'
              : `${totalCalories(meals)} ккал${hasLiquid(meals) ? ` · ${totalLiquidMl(meals)} мл` : ''}`}
          </Text>
        </View>

        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
          {meals.length === 0 ? (
            <Text style={StyleSheet.flatten([styles.muted, { color: theme.subtext }])}>
              Добавьте свой первый прием пищи
            </Text>
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={StyleSheet.flatten([styles.mealRow, { borderColor: theme.border }])}>
                <Pressable style={styles.mealInfo} onPress={() => startEdit(meal.id)}>
                  <Text style={StyleSheet.flatten([styles.mealName, { color: theme.text }])} numberOfLines={1}>
                    {meal.name || 'Без названия'}
                  </Text>
                  <Text style={StyleSheet.flatten([styles.mealMeta, { color: theme.subtext }])}>
                    {mealTypeLabel(meal.type)}
                    {meal.calories === null ? '' : ` · ${meal.calories} ккал`}{meal.liquidMl === null ? '' : ` · ${meal.liquidMl} мл`}{meal.time ? ` · ${meal.time}` : '' }
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => removeMeal(dateKey, meal.id)}
                  hitSlop={8}
                >
                  <Text style={StyleSheet.flatten([styles.deleteText, { color: theme.danger }])}>Удалить</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
          <Text style={StyleSheet.flatten([styles.cardTitle, { color: theme.text }])}>
            {editingId ? 'Редактировать приём пищи' : 'Добавить приём пищи'}
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

          <View style={styles.chips}>
            {MEAL_TYPES.map((item) => {
              const active = item.value === type;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  onPress={() => setType(item.value)}
                  style={StyleSheet.flatten([
                    styles.chip,
                    {
                      backgroundColor: active ? theme.primary : theme.cardMuted,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ])}
                >
                  <Text
                    style={StyleSheet.flatten([styles.chipText, { color: active ? theme.onPrimary : theme.text }])}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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
            value={timeText}
            onChangeText={(text: string) => {
              if (text.length === 3 && text[2] !== ':')
                setTimeText(text.slice(0, 2) + ":" + text.slice(2));
              else setTimeText(text)
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
              label={editingId ? 'Сохранить изменения' : 'Добавить'}
              onPress={submit}
              disabled={!canSubmit}
            />
            {editingId ? (
              <Button label="Отмена" variant="secondary" onPress={resetForm} />
            ) : null}
          </View>
        </View>

        {meals.length > 0 ? (
          <Button label="Очистить день" variant="danger" onPress={confirmClear} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 16,
    gap: 16,
  },
  invalidContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
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
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
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
  formActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  linkButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
