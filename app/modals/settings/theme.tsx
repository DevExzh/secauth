import { Colors } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { ThemeMode } from '@/types/theme';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ThemeScreen() {
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const settings = useSettings();

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t('settings.themeOptions.light') },
    { value: 'dark', label: t('settings.themeOptions.dark') },
    { value: 'system', label: t('settings.themeOptions.system') },
  ];

  const handleThemeSelect = (theme: ThemeMode) => {
    settings.handleThemeChange(theme);
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('settings.theme')}
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: colors.primary }]}>
            {t('common.done')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Theme Options */}
      <View style={styles.content}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              { borderBottomColor: colors.border },
            ]}
            onPress={() => handleThemeSelect(option.value)}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {option.label}
            </Text>
            {settings.themeMode === option.value && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('settings.themeDescription')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 