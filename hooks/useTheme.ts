import { ColorScheme, ThemeMode } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const THEME_STORAGE_KEY = 'app_theme_mode';

interface UseThemeReturn {
  themeMode: ThemeMode;
  currentColorScheme: ColorScheme;
  systemColorScheme: ColorScheme | null;
  isLoading: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

export const useTheme = (): UseThemeReturn => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState({});

  // Force re-render when appearance changes
  const triggerRerender = useCallback(() => {
    forceUpdate({});
  }, []);

  // Listen to system theme changes and force re-render
  useEffect(() => {
    const subscription = Appearance.addChangeListener(() => {
      // Force re-render when system theme changes
      triggerRerender();
    });

    return () => subscription?.remove();
  }, [triggerRerender]);

  // Get current system color scheme (fresh on every render as recommended)
  const systemColorScheme: ColorScheme | null = Appearance.getColorScheme() as ColorScheme | null;

  // Calculate current color scheme based on theme mode
  const currentColorScheme: ColorScheme = useCallback(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as ColorScheme;
  }, [themeMode, systemColorScheme])();

  // Apply theme using Appearance.setColorScheme()
  const applyTheme = useCallback((mode: ThemeMode) => {
    try {
      if (mode === 'system') {
        // Follow system preference
        Appearance.setColorScheme(null);
      } else {
        // Force specific theme
        Appearance.setColorScheme(mode as 'light' | 'dark');
      }
      // Force re-render after applying theme
      triggerRerender();
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [triggerRerender]);

  // Load theme preference from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          const mode = savedMode as ThemeMode;
          setThemeMode(mode);
          applyTheme(mode);
        } else {
          // Default to system theme
          setThemeMode('system');
          applyTheme('system');
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
        // Fallback to system theme
        setThemeMode('system');
        applyTheme('system');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeMode();
  }, [applyTheme]);

  // Save theme preference to storage
  const saveThemeMode = useCallback(async (mode: ThemeMode): Promise<void> => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  // Change theme mode - immediate update with forced re-render
  const setTheme = useCallback(async (mode: ThemeMode): Promise<void> => {
    // Update theme mode immediately
    setThemeMode(mode);
    // Apply theme immediately (this will also trigger re-render)
    applyTheme(mode);
    // Save to storage
    await saveThemeMode(mode);
  }, [applyTheme, saveThemeMode]);

  return {
    themeMode,
    currentColorScheme,
    systemColorScheme,
    isLoading,
    setTheme,
  };
}; 