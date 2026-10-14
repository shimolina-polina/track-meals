import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Не найдено' }} />
      <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}>
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
          <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>Страница не найдена</Text>
          <Text style={StyleSheet.flatten([styles.body, { color: theme.subtext }])}>
            Похоже, экран который вы искали не существует.
          </Text>
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              style={StyleSheet.flatten([styles.button, { backgroundColor: theme.primary }])}
            >
              <Text style={StyleSheet.flatten([styles.buttonText, { color: theme.onPrimary }])}>
                Перейти в календарь
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
