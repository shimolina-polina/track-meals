import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View, Alert, Modal, TouchableOpacity, Platform} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@/components/Button';
import { exportMealsToCsv } from '@/lib/exportCsv';
import { Calendar } from '@/components/Calendar';
import { LoadingFallback } from '@/components/LoadingFallback';
import { formatLongDate, toDateKey } from '@/lib/date';
import { hasLiquid, totalCalories, totalLiquidMl } from '@/lib/meals';
import { useTheme } from '@/lib/theme';
import { useMeals } from '@/store/meals';

export default function CalendarScreen() {
  const theme = useTheme();
  const { isReady, mealsByDate, getMeals } = useMeals();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));
  const [showExport, setShowExport] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date;
  });

  const [toDate, setToDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);


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

  const openSelectedDay = (selectedKey: string) => {
    router.push({ pathname: '/day/[date]', params: { date: selectedKey } });
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
            : `${selectedMeals.length} ${selectedMeals.length % 10 === 1 ? 'прием' : selectedMeals.length % 10 === 2 || selectedMeals.length % 10 === 3 || selectedMeals.length % 10 === 4 ? 'приема' : 'приемов'} пищи · ${totalCalories(selectedMeals)} ккал${hasLiquid(selectedMeals) ? ` · ${totalLiquidMl(selectedMeals)} мл` : ""}`}
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
      <Modal transparent visible={showExport} animationType="slide" onRequestClose={() => setShowExport(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
          <View style={StyleSheet.flatten([{ backgroundColor:theme.card, borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, gap:12 }, { paddingBottom: Math.max(16, insets.bottom) }])}>
            <Text style={{ color:theme.text, fontSize:16, fontWeight:'700' }}>Экспорт в CSV</Text>
            <View style={{ flexDirection:'column', gap:8, flexWrap:'wrap' }}>
              <View style={{display: 'flex', flexDirection: 'row', gap: 8}}>
                <TouchableOpacity
                  onPress={async () => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 6);
                    setFromDate(start);
                    setToDate(end);
                  }}
                  style={{ padding:10, borderRadius:10, borderWidth: 1,
                    borderColor: theme.border }}>
                  <Text style={{ color:theme.text }}>За неделю</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={async ()=>{
                      const end = new Date();
                      const start = new Date();
                      start.setDate(start.getDate() - 29);
                      setFromDate(start);
                      setToDate(end);
                    }}
                    style={{ padding:10, borderRadius:10, borderWidth: 1,
                      borderColor: theme.border }}>
                  <Text style={{ color:theme.text }}>За месяц</Text>
                </TouchableOpacity>
              </View>
              <View style={{display: 'flex', flexDirection: 'row', gap: 8}}>
                <TouchableOpacity
                    onPress={() => setDatePicker('from')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                >
                  <Text style={{ color: theme.text }}>
                    С: {fromDate.toLocaleDateString('ru-RU')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setDatePicker('to')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                >
                  <Text style={{ color: theme.text }}>
                    По: {toDate.toLocaleDateString('ru-RU')}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                  onPress={async () => {
                    setShowExport(false);
                    setDatePicker(null);

                    try {
                      await exportMealsToCsv(mealsByDate, {
                        range: 'range',
                        from: fromDate,
                        to: toDate,
                      });

                      Alert.alert('Готово', 'Файл сохранён/отправлен');
                    } catch (e: any) {
                      Alert.alert('Ошибка', String(e?.message || e));
                    }
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                  }}
              >
                <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>
                  Экспортировать CSV
                </Text>
              </TouchableOpacity>

            {datePicker && (
                <DateTimePicker
                    value={datePicker === 'from' ? fromDate : toDate}
                    mode="date"
                    maximumDate={new Date()}
                    onChange={(_, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setDatePicker(null);
                      }

                      if (!selectedDate) return;

                      if (datePicker === 'from') {
                        setFromDate(selectedDate);

                        if (selectedDate > toDate) {
                          setToDate(selectedDate);
                        }
                      } else {
                        setToDate(selectedDate);

                        if (selectedDate < fromDate) {
                          setFromDate(selectedDate);
                        }
                      }
                    }}
                />
            )}
            </View>
            <TouchableOpacity onPress={()=>setShowExport(false)} style={{ padding:10, alignItems:'center' }}>
              <Text style={{ color:theme.text }}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    wordWrap: 'break-word',
  },
  helpButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
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
