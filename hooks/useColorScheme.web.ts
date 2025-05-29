import { useEffect, useState } from 'react';
import { useTheme } from './useTheme';

/**
 * Web version of useColorScheme that follows React Native's recommendation
 * to get fresh values on every render and subscribe to changes for immediate updates
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { currentColorScheme, isLoading } = useTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // For web, we need to handle hydration but still get fresh values on every render
  if (!hasHydrated && isLoading) {
    return 'light';
  }

  // Return the current color scheme (fresh on every render as recommended)
  return currentColorScheme;
}
