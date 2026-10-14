import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Отслеживайте любой день',
    body: 'В календаре отображается текущий месяц. Нажмите на любой день, чтобы открыть его и зафиксировать съеденные блюда.',
  },
  {
    title: 'Добавление приёма пищи',
    body: 'Выберите день, введите название блюда, укажите тип приёма пищи (завтрак, обед, ужин или перекус) и при необходимости добавьте количество калорий. Затем нажмите «Добавить».',
  },
  {
    title: 'Редактирование и удаление',
    body: 'Нажмите на запись о приёме пищи, чтобы открыть её в форме — так вы сможете изменить данные и сохранить правки. Чтобы удалить одну запись, нажмите «Удалить», а чтобы очистить весь день — «Очистить день».',
  },
  {
    title: 'Ваши данные',
    body: 'Все данные хранятся только на вашем устройстве. При закрытии приложения записи сохраняются, регистрация и подключение к интернету не требуются.',
  },
];

export default function HelpScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={StyleSheet.flatten([styles.content, { paddingBottom: Math.max(styles.content.padding, insets.bottom) }])}
    >
      <Text style={StyleSheet.flatten([styles.lead, { color: theme.subtext }])}>
        Дневник питания помогает вести простой дневник еды — день за днём
      </Text>

      {SECTIONS.map((section) => (
        <View
          key={section.title}
          style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}
        >
          <Text style={StyleSheet.flatten([styles.cardTitle, { color: theme.text }])}>{section.title}</Text>
          <Text style={StyleSheet.flatten([styles.cardBody, { color: theme.subtext }])}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
