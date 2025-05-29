export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorScheme = 'light' | 'dark';

export interface ThemeSettings {
  mode: ThemeMode;
  systemColorScheme?: ColorScheme | null;
} 