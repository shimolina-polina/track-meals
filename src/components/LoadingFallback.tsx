import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface LoadingFallbackProps {
  label?: string;
}

export function LoadingFallback({ label = 'Загружаем приемы пищи...' }: LoadingFallbackProps) {
  const theme = useTheme();
  return (
    <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}>
      <ActivityIndicator color={theme.primary} />
      <Text style={StyleSheet.flatten([styles.label, { color: theme.subtext }])}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
});
