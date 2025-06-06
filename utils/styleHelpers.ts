import { Platform, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Get status bar height for Android (fallback - use useDynamicSafeArea for accurate values)
export function getStatusBarHeight(): number {
  return Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
}

// Get tab bar height (fallback - use useDynamicSafeArea for accurate values)
export function getTabBarHeight(): number {
  return Platform.OS === 'ios' ? 83 : 56;
}

// Common styles for avoiding tab bar
export const commonStyles = StyleSheet.create({
  // For containers that need to avoid status bar on Android
  androidStatusBarPadding: {
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() : 0,
  },
  
  // For scroll views that need to avoid tab bar
  scrollViewWithTabBar: {
    paddingBottom: getTabBarHeight(),
  },
  
  // For headers that need status bar padding
  headerWithStatusBar: {
    paddingTop: Platform.OS === 'android' ? getStatusBarHeight() + 12 : 12,
  },
  
  // For full screen modals
  fullScreenModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});

// Quick fix styles for common layout issues
export const quickFixStyles = StyleSheet.create({
  // For content that should avoid status bar on Android
  avoidStatusBar: {
    paddingTop: Platform.OS === 'android' ? 24 : 0, // Fallback value
  },
  
  // For content that should avoid tab bar
  avoidTabBar: {
    paddingBottom: Platform.OS === 'ios' ? 83 : 56, // Fallback values
  },
  
  // Common container styles
  fullScreenContainer: {
    flex: 1,
  },
  
  // Safe padding for modals
  modalSafePadding: {
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    paddingBottom: 20,
  },
});

// Dynamic style generators using hooks
export function useDynamicStyles() {
  const insets = useSafeAreaInsets();
  
  // Calculate intelligent tab bar height
  const tabBarHeight = Platform.OS === 'ios' ? 
    (insets.bottom > 0 ? 83 : 49) : // iPhone X+ vs older iPhones
    56; // Android Material Design
  
  return {
    // Full screen container with proper safe areas
    fullScreenContainer: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    } as ViewStyle,
    
    // Container that avoids tab bar overlay
    tabAwareContainer: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: Math.max(insets.bottom, tabBarHeight),
      paddingLeft: insets.left,
      paddingRight: insets.right,
    } as ViewStyle,
    
    // Just the padding to avoid tab bar (for ScrollView contentContainerStyle)
    tabBarPadding: {
      paddingBottom: tabBarHeight,
    } as ViewStyle,
    
    // Enhanced list padding that properly avoids tab bar
    listTabBarPadding: {
      paddingBottom: tabBarHeight + insets.bottom + 8, // Tab bar + safe area + breathing room
    } as ViewStyle,
    
    // Container without bottom padding (for screens with custom bottom handling)
    containerWithoutBottom: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: 0,
    } as ViewStyle,
    
    // Header safe area (status bar + additional padding)
    headerSafeArea: {
      paddingTop: insets.top,
    } as ViewStyle,
    
    // Modal container with appropriate padding
    modalContainer: {
      flex: 1,
      paddingTop: insets.top + 10, // Extra padding for visual breathing room
      paddingBottom: Math.max(insets.bottom, 20),
      paddingLeft: Math.max(insets.left, 16),
      paddingRight: Math.max(insets.right, 16),
    } as ViewStyle,
    
    // Values for manual calculations
    safeAreaInsets: insets,
    tabBarHeight,
    statusBarHeight: insets.top,
  };
}

// Specialized hook for list components that need to avoid tab bar
export function useListPadding() {
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = Platform.OS === 'ios' ? 
    (insets.bottom > 0 ? 83 : 49) : 
    56;
  
  return {
    // For FlatList/ScrollView contentContainerStyle
    contentContainerStyle: {
      paddingBottom: tabBarHeight + insets.bottom + 8, // Complete avoidance
    } as ViewStyle,
    
    // For outer container (SafeAreaView) that should not have bottom padding
    containerStyle: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: 0, // Let the tab bar sit over the safe area
    } as ViewStyle,
    
    // Values for manual use
    tabBarHeight,
    safeAreaBottom: insets.bottom,
    totalBottomPadding: tabBarHeight + insets.bottom + 8,
  };
}

// Universal layout helpers that work without hooks (for static styles)
export const universalLayout = {
  // Safe fallback values for different scenarios
  statusBarHeight: Platform.OS === 'android' ? 24 : 20,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 56,
  
  // Common spacing values
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border radius values
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  // Shadow styles for cards
  cardShadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
}; 