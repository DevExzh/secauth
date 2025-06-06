import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Simple, stable safe area hook
export function useSmartSafeArea() {
  const insets = useSafeAreaInsets();
  
  // Simple calculation without complex logic
  const bottomPadding = Platform.OS === 'ios' 
    ? (insets.bottom > 0 ? 140 : 100) 
    : Math.max(insets.bottom + 80, 100);
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    containerPadding: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: 0,
    },
    listFooterHeight: bottomPadding,
    contentPadding: {
      paddingBottom: bottomPadding,
    },
    // Add compatibility for SmartScreen
    isInTabContext: true, // Assume we're always in tab context for simplicity
  };
}

// Legacy compatibility
export function useDynamicSafeArea() {
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height based on platform and device
  const tabBarHeight = Platform.OS === 'ios' 
    ? (insets.bottom > 0 ? 83 : 49) // iPhone X+ vs older iPhones
    : 56; // Android Material Design
  
  return {
    // Full screen padding including safe areas
    fullScreenPadding: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    // Tab-aware padding that accounts for tab bar
    tabAwarePadding: {
      paddingTop: insets.top,
      paddingBottom: Math.max(insets.bottom, tabBarHeight),
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    tabBarHeight,
    bottomSafeArea: insets.bottom,
    // Include all the properties from useSmartSafeArea for backward compatibility
    ...useSmartSafeArea(),
  };
}

export function useListPadding() {
  const { contentPadding } = useSmartSafeArea();
  return contentPadding;
}

// For ScreenHeader compatibility
export function useSafeArea() {
  const insets = useSafeAreaInsets();
  
  return {
    statusBarHeight: insets.top,
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
} 