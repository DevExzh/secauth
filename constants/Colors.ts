/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * SecureAuth App Color Scheme
 * Designed to match the dark theme prototype with blue accent colors
 */

const tintColorLight = '#007AFF';
const tintColorDark = '#007AFF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // SecureAuth specific colors
    primary: '#007AFF',
    secondary: '#5856D6',
    surface: '#F2F2F7',
    surfaceSecondary: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1C1C1E',
    tint: tintColorDark,
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    // SecureAuth specific colors (matching the design prototype)
    primary: '#007AFF',
    secondary: '#5856D6',
    surface: '#2C2C2E',
    surfaceSecondary: '#3A3A3C',
    textSecondary: '#8E8E93',
    border: '#48484A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    // Additional colors for the authenticator app
    cardBackground: '#2C2C2E',
    searchBackground: '#3A3A3C',
    categoryActive: '#007AFF',
    categoryInactive: '#48484A',
    codeText: '#007AFF',
    timerText: '#007AFF',
  },
};
