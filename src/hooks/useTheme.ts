import { useColorScheme } from 'react-native';

import { themes, type Theme } from '@/lib/theme';

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}

export type { Theme, ThemeName } from '@/lib/theme';
