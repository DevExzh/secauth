import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ThemeSelectorProps {
  currentTheme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const themeOptions = [
    { key: 'system', label: t('settings.themeOptions.system') },
    { key: 'light', label: t('settings.themeOptions.light') },
    { key: 'dark', label: t('settings.themeOptions.dark') },
  ] as const;

  const handleThemeSelect = (theme: 'system' | 'light' | 'dark') => {
    onThemeChange(theme);
    setShowModal(false);
  };

  const getCurrentThemeLabel = () => {
    const option = themeOptions.find(opt => opt.key === currentTheme);
    return option?.label || t('settings.themeOptions.system');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.settingIcon}>
          {/* You can add a theme icon here */}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {t('settings.theme')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {getCurrentThemeLabel()}
          </Text>
        </View>
        <View style={styles.settingAction}>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={[styles.cancelText, { color: colors.primary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('settings.theme')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.optionsContainer}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.optionItem, { backgroundColor: colors.surface }]}
                onPress={() => handleThemeSelect(option.key)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {option.label}
                </Text>
                {currentTheme === option.key && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingAction: {
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 60,
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
}); 