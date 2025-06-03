import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AutoLockService, AutoLockSettings, AutoLockTimeout } from '@/services/autoLock';
import { Clock, Shield, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AutoLockSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange: (settings: AutoLockSettings) => void;
}

export const AutoLockSettingsModal: React.FC<AutoLockSettingsModalProps> = ({
  visible,
  onClose,
  onSettingsChange,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [settings, setSettings] = useState<AutoLockSettings>({
    enabled: false,
    timeout: '5min',
  });

  const timeoutOptions: { label: string; value: AutoLockTimeout }[] = [
    { label: t('autoLock.timeout.immediate'), value: 'immediate' },
    { label: t('autoLock.timeout.1minute'), value: '1min' },
    { label: t('autoLock.timeout.5minutes'), value: '5min' },
    { label: t('autoLock.timeout.15minutes'), value: '15min' },
    { label: t('autoLock.timeout.30minutes'), value: '30min' },
    { label: t('autoLock.timeout.never'), value: 'never' },
  ];

  useEffect(() => {
    if (visible) {
      loadCurrentSettings();
    }
  }, [visible]);

  const loadCurrentSettings = async () => {
    try {
      const currentSettings = await AutoLockService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load auto-lock settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await AutoLockService.updateSettings(settings);
      onSettingsChange(settings);
      Alert.alert(
        t('settings.saved'),
        t('autoLock.settingsSaved'),
        [{ text: t('common.ok'), onPress: onClose }]
      );
    } catch (error) {
      console.error('Failed to save auto-lock settings:', error);
      Alert.alert(t('common.error'), t('autoLock.saveError'));
    }
  };

  const updateSetting = <K extends keyof AutoLockSettings>(
    key: K,
    value: AutoLockSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('settings.autoLock')}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: colors.primary }]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Enable Auto-Lock */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Shield size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {t('autoLock.enable')}
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {t('autoLock.enableDescription')}
                </Text>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateSetting('enabled', value)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {settings.enabled && (
            <>
              {/* Auto-Lock Timeout */}
              <View style={[styles.section, { backgroundColor: colors.surface }]}>
                <View style={styles.sectionHeader}>
                  <Clock size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('autoLock.timeout.title')}
                  </Text>
                </View>
                <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                  {t('autoLock.timeout.description')}
                </Text>
                
                {timeoutOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      settings.timeout === option.value && { backgroundColor: colors.primary + '20' }
                    ]}
                    onPress={() => updateSetting('timeout', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: settings.timeout === option.value ? colors.primary : colors.text }
                    ]}>
                      {option.label}
                    </Text>
                    {settings.timeout === option.value && (
                      <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {t('autoLock.howItWorks')}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t('autoLock.howItWorksDescription')}
            </Text>
          </View>
        </ScrollView>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    lineHeight: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoSection: {
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 