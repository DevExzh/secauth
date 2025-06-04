import { ColorScheme, ThemeMode } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme | null>(
    () => Appearance.getColorScheme() as ColorScheme | null
  );
  
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Listen to system theme changes with proper state updates
  useEffect(() => {
    const updateSystemTheme = () => {
      const newColorScheme = Appearance.getColorScheme() as ColorScheme | null;
      
      // Use requestAnimationFrame to defer state update
      requestAnimationFrame(() => {
        if (!isUnmountedRef.current) {
          setSystemColorScheme(newColorScheme);
        }
      });
    };

    // Set initial value
    updateSystemTheme();

    const subscription = Appearance.addChangeListener(updateSystemTheme);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Calculate current color scheme using useMemo for performance
  const currentColorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode as ColorScheme;
  }, [themeMode, systemColorScheme]);

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
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, []);

  // Load theme preference from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          const mode = savedMode as ThemeMode;
          if (!isUnmountedRef.current) {
            setThemeMode(mode);
            applyTheme(mode);
          }
        } else {
          // Default to system theme
          if (!isUnmountedRef.current) {
            setThemeMode('system');
            applyTheme('system');
          }
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
        // Fallback to system theme
        if (!isUnmountedRef.current) {
          setThemeMode('system');
          applyTheme('system');
        }
      } finally {
        if (!isUnmountedRef.current) {
          setIsLoading(false);
        }
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

  // Change theme mode with proper state management
  const setTheme = useCallback(async (mode: ThemeMode): Promise<void> => {
    if (isUnmountedRef.current) return;
    
    // Update theme mode
    setThemeMode(mode);
    // Apply theme
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