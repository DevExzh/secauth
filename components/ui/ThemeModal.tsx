import { useLanguage } from '@/hooks/useLanguage';
import { ThemeMode } from '@/types/theme';
import { Check } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ThemeModalProps {
  visible: boolean;
  currentTheme: ThemeMode;
  onThemeSelect: (theme: ThemeMode) => void;
  onClose: () => void;
  colors: any;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  visible,
  currentTheme,
  onThemeSelect,
  onClose,
  colors,
}) => {
  const { t } = useLanguage();

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: t('settings.themeOptions.light') },
    { value: 'dark', label: t('settings.themeOptions.dark') },
    { value: 'system', label: t('settings.themeOptions.system') },
  ];

  const handleThemeSelect = (theme: ThemeMode) => {
    onThemeSelect(theme);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('settings.theme')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              {currentTheme === option.value && (
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
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
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
    paddingBottom: 32,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 