import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AutoLockTimeout } from '@/services/autoLock';
import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AutoLockSettingsProps {
  currentTimeout: AutoLockTimeout;
  onTimeoutChange: (timeout: AutoLockTimeout) => void;
}

export function AutoLockSettings({ currentTimeout, onTimeoutChange }: AutoLockSettingsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const timeoutOptions: { key: AutoLockTimeout; label: string }[] = [
    { key: 'immediate', label: t('settings.autoLockOptions.immediate') },
    { key: '1min', label: t('settings.autoLockOptions.1min') },
    { key: '5min', label: t('settings.autoLockOptions.5min') },
    { key: '15min', label: t('settings.autoLockOptions.15min') },
    { key: '30min', label: t('settings.autoLockOptions.30min') },
    { key: 'never', label: t('settings.autoLockOptions.never') },
  ];

  const handleTimeoutSelect = (timeout: AutoLockTimeout) => {
    onTimeoutChange(timeout);
    setShowModal(false);
  };

  const getCurrentTimeoutLabel = () => {
    const option = timeoutOptions.find(opt => opt.key === currentTimeout);
    return option?.label || t('settings.autoLockOptions.5min');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.settingIcon}>
          {/* You can add an auto-lock icon here */}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {t('settings.autoLock')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {getCurrentTimeoutLabel()}
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
              {t('auth.autoLock.title')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {t('auth.autoLock.description')}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {timeoutOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[styles.optionItem, { backgroundColor: colors.surface }]}
                onPress={() => handleTimeoutSelect(option.key)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {option.label}
                </Text>
                {currentTimeout === option.key && (
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
  descriptionContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    paddingHorizontal: 16,
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