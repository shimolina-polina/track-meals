import type { ErrorBoundaryProps } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useTheme } from '@/lib/theme';

export function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  const theme = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
    >
      <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }])}>
        <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>Произошла ошибка</Text>
        <Text style={StyleSheet.flatten([styles.message, { color: theme.subtext }])}>
          {error.message || 'Возникла непредвиденная ошибка во время рендера экрана.'}
        </Text>
        <Button label="Попробовать снова" onPress={() => retry()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
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
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
