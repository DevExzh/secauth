import { useDynamicSafeArea } from '@/hooks/useSafeArea';
import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  showHeader?: boolean;
  header?: React.ReactNode;
  scrollable?: boolean;
  avoidTabBar?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function Screen({
  children,
  showHeader = false,
  header,
  scrollable = true,
  avoidTabBar = true,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { fullScreenPadding, tabBarHeight, bottomSafeArea } = useDynamicSafeArea();

  // Calculate the appropriate padding based on props
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      ...fullScreenPadding,
      ...style,
    };

    // Adjust bottom padding based on whether we want to avoid tab bar
    if (avoidTabBar) {
      baseStyle.paddingBottom = Math.max(bottomSafeArea, tabBarHeight);
    }

    return baseStyle;
  };

  const getContentContainerStyle = (): ViewStyle => {
    const baseContentStyle: ViewStyle = {
      flexGrow: 1,
      ...contentContainerStyle,
    };

    // For scrollable content, add bottom padding to avoid tab bar
    if (scrollable && avoidTabBar) {
      baseContentStyle.paddingBottom = tabBarHeight;
    }

    return baseContentStyle;
  };

  const containerStyle = getContainerStyle();

  if (scrollable) {
    return (
      <View style={containerStyle}>
        {showHeader && header}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={getContentContainerStyle()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {showHeader && header}
      <View style={getContentContainerStyle()}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
}); 