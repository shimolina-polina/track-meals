import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { MealsProvider } from '@/store/meals';

export { ErrorFallback as ErrorBoundary } from '@/components/ErrorFallback';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <MealsProvider>
        <ThemeProvider
          value={{
            ...base,
            dark: scheme === 'dark',
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
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
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
