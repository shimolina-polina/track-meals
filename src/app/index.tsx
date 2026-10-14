import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import { ExportSheet } from '@/components/ExportSheet';
import { LoadingFallback } from '@/components/LoadingFallback';
import { formatLongDate, toDateKey } from '@/lib/date';
import { pluralizeMeals } from '@/lib/i18n';
import { hasLiquid, totalCalories, totalLiquidMl } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';
import { useMeals } from '@/store/meals';

export default function CalendarScreen() {
  const theme = useTheme();
  const { isReady, mealsByDate, getMeals } = useMeals();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [showExport, setShowExport] = useState(false);

  const mealCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [key, meals] of Object.entries(mealsByDate)) {
      counts[key] = meals.length;
    }
    return counts;
  }, [mealsByDate]);

  if (!isReady) {
    return <LoadingFallback />;
  }

  const selectedMeals = getMeals(selectedKey);
  const selectedDate = new Date(`${selectedKey}T00:00:00`);

  const openDay = () => {
    router.push({ pathname: '/day/[date]', params: { date: selectedKey } });
  };

  const openSelectedDay = (dayKey: string) => {
    router.push({ pathname: '/day/[date]', params: { date: dayKey } });
  };

  return (
    <>
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={StyleSheet.flatten([styles.content, { paddingTop: Math.max(styles.content.padding, insets.top), paddingBottom: Math.max(styles.content.padding, insets.bottom) }])}
    >
      <View style={styles.headerRow}>
        <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>Дневник питания</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowExport(true)}
            style={StyleSheet.flatten([styles.helpButton, { borderColor: theme.border }])}
          >
            <MaterialCommunityIcons
                name="export-variant"
                size={22}
                color={theme.primary}
            />
          </Pressable>
          <Link href="/help" asChild>
            <Pressable
              accessibilityRole="button"
              style={StyleSheet.flatten([styles.helpButton, { borderColor: theme.border }])}
            >
              <MaterialCommunityIcons
                  name="information-outline"
                  size={22}
                  color={theme.primary}
              />
            </Pressable>
          </Link>
        </View>
      </View>

      <Calendar
        month={month}
        onMonthChange={setMonth}
        mealCounts={mealCounts}
        selectedKey={selectedKey}
        onSelectDate={(date) => {
          const key = toDateKey(date);
          setSelectedKey(key);
          if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
            setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          }
        }}
        onLongSelectDate={(date) => {
          const key = toDateKey(date);
          setSelectedKey(key);
          openSelectedDay(key)
        }}
      />

      <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
        <Text style={StyleSheet.flatten([styles.cardDate, { color: theme.text }])}>
          {formatLongDate(selectedDate)}
        </Text>
        <Text style={StyleSheet.flatten([styles.cardMeta, { color: theme.subtext }])}>
          {selectedMeals.length === 0
            ? 'Ещё нет приёмов пищи'
            : `${selectedMeals.length} ${pluralizeMeals(selectedMeals.length)} пищи · ${totalCalories(selectedMeals)} ккал${hasLiquid(selectedMeals) ? ` · ${totalLiquidMl(selectedMeals)} мл` : ""}`}
        </Text>

        {selectedMeals.length > 0 ? (
          <View style={styles.mealPreview}>
            {selectedMeals.slice(0, 4).map((meal) => (
              <View key={meal.id} style={styles.mealRow}>
                <Text style={StyleSheet.flatten([styles.mealName, { color: theme.text }])} numberOfLines={1}>
                  {meal.name || 'Без названия'}
                </Text>
                <Text style={StyleSheet.flatten([styles.mealCalories, { color: theme.subtext }])}>
                  {meal.calories != null && `${meal.calories} ккал`}
                  {meal.calories != null && meal.liquidMl != null && " · "}
                  {meal.liquidMl != null && `${meal.liquidMl} мл`}
                </Text>
              </View>
            ))}
            {selectedMeals.length > 4 ? (
              <Text style={StyleSheet.flatten([styles.more, { color: theme.subtext }])}>
                +{selectedMeals.length - 4} еще
              </Text>
            ) : null}
          </View>
        ) : null}

        <Button
          label={selectedMeals.length === 0 ? 'Добавление' : 'Изменить приёмы пищи'}
          onPress={openDay}
        />
      </View>
    </ScrollView>
      <ExportSheet
        visible={showExport}
        mealsByDate={mealsByDate}
        onClose={() => setShowExport(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  helpButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
  cardDate: {
    fontSize: 17,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
  },
  mealPreview: {
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 14,
  },
  mealCalories: {
    fontSize: 13,
  },
  more: {
    fontSize: 12,
  },
});
