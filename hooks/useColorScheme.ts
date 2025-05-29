import { useTheme } from './useTheme';

export function useColorScheme() {
  const { currentColorScheme } = useTheme();
  // Return the current color scheme (fresh on every render as recommended by React Native docs)
  return currentColorScheme;
}
