import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';
type ColorScheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app_theme_mode';

export function useTheme() {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Calculate the actual color scheme based on theme mode
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (systemColorScheme ?? 'dark')
      : themeMode;
  
  const isDark = colorScheme === 'dark';

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return {
    colorScheme,
    themeMode,
    setThemeMode,
    isDark,
  };
}

// For backward compatibility, export a hook that returns just the color scheme
export function useColorScheme() {
  const { colorScheme } = useTheme();
  return colorScheme;
} 