import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { exportMealsToCsv } from '@/lib/exportCsv';
import type { MealsByDate } from '@/lib/meals';
import { useTheme } from '@/hooks/useTheme';

interface ExportSheetProps {
  visible: boolean;
  mealsByDate: MealsByDate;
  onClose: () => void;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function ExportSheet({ visible, mealsByDate, onClose }: ExportSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [fromDate, setFromDate] = useState(() => daysAgo(6));
  const [toDate, setToDate] = useState(() => new Date());
  const [datePicker, setDatePicker] = useState<'from' | 'to' | null>(null);

  const handleExport = async () => {
    setDatePicker(null);
    onClose();
    try {
      await exportMealsToCsv(mealsByDate, { range: 'range', from: fromDate, to: toDate });
      Alert.alert('Готово', 'Файл сохранён/отправлен');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Ошибка', message);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={StyleSheet.flatten([
            styles.sheet,
            { backgroundColor: theme.card, paddingBottom: Math.max(16, insets.bottom) },
          ])}
        >
          <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>Экспорт в CSV</Text>

          <View style={styles.quickRow}>
            <TouchableOpacity
              onPress={() => {
                setFromDate(daysAgo(6));
                setToDate(new Date());
              }}
              style={StyleSheet.flatten([styles.quickBtn, { borderColor: theme.border }])}
            >
              <Text style={{ color: theme.text }}>За неделю</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFromDate(daysAgo(29));
                setToDate(new Date());
              }}
              style={StyleSheet.flatten([styles.quickBtn, { borderColor: theme.border }])}
            >
              <Text style={{ color: theme.text }}>За месяц</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickRow}>
            <TouchableOpacity
              onPress={() => setDatePicker('from')}
              style={StyleSheet.flatten([styles.dateBtn, { borderColor: theme.border }])}
            >
              <Text style={{ color: theme.text }}>С: {fromDate.toLocaleDateString('ru-RU')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDatePicker('to')}
              style={StyleSheet.flatten([styles.dateBtn, { borderColor: theme.border }])}
            >
              <Text style={{ color: theme.text }}>По: {toDate.toLocaleDateString('ru-RU')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleExport}
            style={StyleSheet.flatten([styles.exportBtn, { backgroundColor: theme.primary }])}
          >
            <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>Экспортировать CSV</Text>
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
                  if (selectedDate > toDate) setToDate(selectedDate);
                } else {
                  setToDate(selectedDate);
                  if (selectedDate < fromDate) setFromDate(selectedDate);
                }
              }}
            />
          )}

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={{ color: theme.text }}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickBtn: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateBtn: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  exportBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    padding: 10,
    alignItems: 'center',
  },
});
