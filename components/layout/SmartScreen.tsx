import { useSmartSafeArea } from '@/hooks/useSafeArea';
import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';

interface SmartScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  // Whether this screen has scrollable content (affects padding strategy)
  hasScrollableContent?: boolean;
}

/**
 * 🚀 UNIVERSAL SMART SCREEN COMPONENT
 * 
 * This component automatically:
 * - Detects if it's in a tab navigator context
 * - Applies appropriate padding for status bar and tab bar
 * - Works for modals, screens, and tab screens without any configuration
 * 
 * Usage:
 * <SmartScreen>
 *   <YourContent />
 * </SmartScreen>
 */
export function SmartScreen({ 
  children, 
  style, 
  backgroundColor, 
  hasScrollableContent = false 
}: SmartScreenProps) {
  const { containerPadding } = useSmartSafeArea();
  
  const screenStyle = [
    styles.container,
    containerPadding,
    backgroundColor && { backgroundColor },
    style,
  ];
  
  return (
    <SafeAreaView style={screenStyle}>
      {children}
    </SafeAreaView>
  );
}

/**
 * 🚀 UNIVERSAL SMART SCROLL FOOTER
 * 
 * Use this as ListFooterComponent for any scrollable list
 * It automatically provides the right amount of bottom spacing
 */
export function SmartScrollFooter() {
  const { listFooterHeight } = useSmartSafeArea();
  
  return <View style={{ height: listFooterHeight }} />;
}

/**
 * 🚀 UNIVERSAL SMART CONTENT CONTAINER
 * 
 * Use this style for contentContainerStyle in ScrollView/FlatList
 */
export function useSmartContentStyle() {
  const { contentPadding } = useSmartSafeArea();
  
  return {
    flexGrow: 1,
    ...contentPadding,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SmartScreen; 