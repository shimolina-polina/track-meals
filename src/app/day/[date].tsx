import { Link, Stack, useLocalSearchParams, type SuspenseFallbackProps } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { DaySummaryCard } from '@/components/DaySummaryCard';
import { LoadingFallback } from '@/components/LoadingFallback';
import { MealForm } from '@/components/MealForm';
import { MealList } from '@/components/MealList';
import { formatLongDate, fromDateKey } from '@/lib/date';
import type { Meal, MealInput } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';
import { useMeals } from '@/store/meals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const [editingId, setEditingId] = useState<string | null>(null);

  const meals = getMeals(dateKey);
  const editingMeal: Meal | null = editingId
    ? meals.find((item) => item.id === editingId) ?? null
    : null;

  const handleSubmit = (input: MealInput) => {
    if (editingId) {
      updateMeal(dateKey, editingId, input);
    } else {
      addMeal(dateKey, input);
    }
    setEditingId(null);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <Stack.Screen options={{ title: formatLongDate(date) }} />
      <ScrollView contentContainerStyle={StyleSheet.flatten([styles.content, { paddingBottom: Math.max(styles.content.padding, insets.bottom) }])} keyboardShouldPersistTaps="handled">
        <DaySummaryCard meals={meals} />

        <MealList meals={meals} onEdit={setEditingId} onRemove={(id) => removeMeal(dateKey, id)} />

        <MealForm
          key={editingId ?? 'new'}
          editingMeal={editingMeal}
          onSubmit={handleSubmit}
          onCancel={() => setEditingId(null)}
        />

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
