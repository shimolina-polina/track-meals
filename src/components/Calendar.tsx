import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/Button';
import {
  addMonths,
  formatMonthYear,
  getMonthGrid,
  sameMonth,
  toDateKey,
  WEEKDAYS,
} from '@/lib/date';
import { useTheme, type Theme } from '@/hooks/useTheme';

interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  mealCounts: Record<string, number>;
  selectedKey?: string;
  onSelectDate: (date: Date) => void;
  onLongSelectDate?: (date: Date) => void;
}

export function Calendar({
  month,
  onMonthChange,
  mealCounts,
  selectedKey,
  onSelectDate,
  onLongSelectDate
}: CalendarProps) {
  const theme = useTheme();
  const grid = useMemo(() => getMonthGrid(month.getFullYear(), month.getMonth()), [month]);
  const todayKey = toDateKey(new Date());

  return (
    <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.card, borderColor: theme.border }])}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Предыдущий месяц"
          onPress={() => onMonthChange(addMonths(month, -1))}
          style={styles.arrow}
        >
          <Text style={StyleSheet.flatten([styles.arrowText, { color: theme.primary }])}>‹</Text>
        </Pressable>
        <Text style={StyleSheet.flatten([styles.monthLabel, { color: theme.text }])}>
          {formatMonthYear(month)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Следующий месяц"
          onPress={() => onMonthChange(addMonths(month, 1))}
          style={styles.arrow}
        >
          <Text style={StyleSheet.flatten([styles.arrowText, { color: theme.primary }])}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={StyleSheet.flatten([styles.weekday, { color: theme.subtext }])}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((date) => {
          const key = toDateKey(date);
          const inMonth = sameMonth(date, month);
          const count = mealCounts[key] ?? 0;
          const selected = key === selectedKey;
          const today = key === todayKey;
          return (
            <DayCell
              key={key}
              theme={theme}
              day={date.getDate()}
              count={count}
              inMonth={inMonth}
              selected={selected}
              today={today}
              onPress={() => onSelectDate(date)}
              onLongPress={() => onLongSelectDate?.(date)}
            />
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label="Сегодня"
          disabled={month.getMonth() === (new Date()).getMonth() && selectedKey === todayKey}
          variant={"secondary"}
          onPress={() => onSelectDate(new Date())}
        />
      </View>
    </View>
  );
}

interface DayCellProps {
  theme: Theme;
  day: number;
  count: number;
  inMonth: boolean;
  selected: boolean;
  today: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

function DayCell({ theme, day, count, inMonth, selected, today, onPress, onLongPress }: DayCellProps) {
  const textColor = !inMonth ? theme.disabled : selected ? theme.onPrimary : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Day ${day}${count > 0 ? `, ${count} приёмов пищи` : ''}`}
      onPress={onPress}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress?.();
      }}
      style={styles.cell}
    >
      <View
        style={StyleSheet.flatten([
          styles.cellInner,
          selected && { backgroundColor: theme.primary },
          !selected && today && { borderColor: theme.primary, borderWidth: 1 },
        ])}
      >
        <Text style={StyleSheet.flatten([styles.dayText, { color: textColor }])}>{day}</Text>
        {count > 0 ? (
          <View
            style={StyleSheet.flatten([
              styles.badge,
              {
                backgroundColor: selected ? theme.onPrimary : theme.badge,
              },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.badgeText,
                { color: selected ? theme.primary : theme.onBadge },
              ])}
            >
              {count > 9 ? '9+' : count}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  arrow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 28,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  cellInner: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'transparent',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
