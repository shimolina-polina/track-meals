import { useColorScheme } from 'react-native';

export type ThemeName = 'light' | 'dark';

export interface Theme {
  name: ThemeName;
  background: string;
  card: string;
  cardMuted: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
  badge: string;
  onBadge: string;
  disabled: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    background: '#F6F7FB',
    card: '#FFFFFF',
    cardMuted: '#EEF1F6',
    text: '#111827',
    subtext: '#6B7280',
    border: '#E5E7EB',
    primary: '#16A34A',
    onPrimary: '#FFFFFF',
    danger: '#DC2626',
    badge: '#16A34A',
    onBadge: '#FFFFFF',
    disabled: '#9CA3AF',
  },
  dark: {
    name: 'dark',
    background: '#0B0F14',
    card: '#151B23',
    cardMuted: '#1E2733',
    text: '#F9FAFB',
    subtext: '#9CA3AF',
    border: '#27303B',
    primary: '#22C55E',
    onPrimary: '#06240F',
    danger: '#F87171',
    badge: '#22C55E',
    onBadge: '#06240F',
    disabled: '#4B5563',
  },
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
