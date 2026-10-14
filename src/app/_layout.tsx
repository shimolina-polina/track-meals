import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { MealsProvider } from '@/store/meals';

export { ErrorFallback as ErrorBoundary } from '@/components/ErrorFallback';

export default function RootLayout() {
  const theme = useTheme();
  const isDark = theme.name === 'dark';
  const base = isDark ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <MealsProvider>
        <ThemeProvider
          value={{
            ...base,
            dark: isDark,
            colors: {
              ...base.colors,
              primary: theme.primary,
              background: theme.background,
              card: theme.card,
              text: theme.text,
              border: theme.border,
            },
          }}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.card },
              headerTintColor: theme.text,
              headerTitleStyle: { color: theme.text },
              contentStyle: { backgroundColor: theme.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="day/[date]" options={{ title: 'Приёмы пищи' }} />
            <Stack.Screen name="help" options={{ title: 'Как пользоваться' }} />
          </Stack>
        </ThemeProvider>
      </MealsProvider>
    </SafeAreaProvider>
  );
}
