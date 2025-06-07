import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    ChevronRight,
    FileKey,
    Key,
    Lock,
    Shield,
    ShieldCheck
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EmailEncryptionSettingsModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Local state for encryption settings
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [strongEncryption, setStrongEncryption] = useState(true);
  const [keyRotation, setKeyRotation] = useState(false);
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState('AES-256');
  const [keyLength, setKeyLength] = useState('256-bit');

  const encryptionAlgorithms = [
    { label: 'AES-256', value: 'AES-256', recommended: true },
    { label: 'AES-128', value: 'AES-128', recommended: false },
    { label: 'ChaCha20', value: 'ChaCha20', recommended: true },
    { label: 'Blowfish', value: 'Blowfish', recommended: false },
  ];

  const keyLengths = [
    { label: '256-bit', value: '256-bit', recommended: true },
    { label: '128-bit', value: '128-bit', recommended: false },
    { label: '512-bit', value: '512-bit', recommended: false },
  ];

  const settingsGroups = [
    {
      title: t('emailEncryptionSettings.basicSettings.title'),
      items: [
        {
          icon: <Lock size={20} color={colors.primary} />,
          title: t('emailEncryptionSettings.encryptionEnabled.title'),
          subtitle: t('emailEncryptionSettings.encryptionEnabled.subtitle'),
          type: 'switch',
          value: encryptionEnabled,
          onToggle: setEncryptionEnabled,
        },
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: t('emailEncryptionSettings.strongEncryption.title'),
          subtitle: t('emailEncryptionSettings.strongEncryption.subtitle'),
          type: 'switch',
          value: strongEncryption,
          onToggle: setStrongEncryption,
          disabled: !encryptionEnabled,
        },
      ],
    },
    {
      title: t('emailEncryptionSettings.algorithmSettings.title'),
      items: [
        {
          icon: <FileKey size={20} color={colors.primary} />,
          title: t('emailEncryptionSettings.encryptionAlgorithm.title'),
          subtitle: encryptionAlgorithm,
          type: 'navigation',
          onPress: () => console.log('Select algorithm'),
          disabled: !encryptionEnabled,
        },
        {
          icon: <Key size={20} color={colors.primary} />,
          title: t('emailEncryptionSettings.keyLength.title'),
          subtitle: keyLength,
          type: 'navigation',
          onPress: () => console.log('Select key length'),
          disabled: !encryptionEnabled,
        },
      ],
    },
    {
      title: t('emailEncryptionSettings.keyManagement.title'),
      items: [
        {
          icon: <ShieldCheck size={20} color={colors.primary} />,
          title: t('emailEncryptionSettings.keyRotation.title'),
          subtitle: t('emailEncryptionSettings.keyRotation.subtitle'),
          type: 'switch',
          value: keyRotation,
          onToggle: setKeyRotation,
          disabled: !encryptionEnabled,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.settingItem, 
        { backgroundColor: colors.surface },
        item.disabled && styles.disabledItem
      ]}
      disabled={item.type === 'switch' || item.disabled}
      onPress={item.onPress}
    >
      <View style={[
        styles.settingIcon,
        item.disabled && { opacity: 0.5 }
      ]}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle, 
          { color: colors.text },
          item.disabled && { color: colors.textSecondary }
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.settingSubtitle, 
          { color: colors.textSecondary },
          item.disabled && { opacity: 0.7 }
        ]}>
          {item.subtitle}
        </Text>
      </View>
      <View style={styles.settingAction}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.background}
            disabled={item.disabled}
          />
        ) : (
          <ChevronRight 
            size={20} 
            color={item.disabled ? colors.border : colors.textSecondary} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {t('emailEncryptionSettings.title')}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <SmartScreen style={{ backgroundColor: colors.background }}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
            <FileKey size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailEncryptionSettings.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailEncryptionSettings.summaryDescription')}
          </Text>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
              {group.title}
            </Text>
            <View style={[styles.groupContainer, { backgroundColor: colors.surface }]}>
              {group.items.map((item, itemIndex) => (
                <View key={item.title}>
                  {renderSettingItem(item)}
                  {itemIndex < group.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Current Settings Status */}
        <View style={styles.statusSection}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {t('emailEncryptionSettings.currentSettings.title')}
          </Text>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailEncryptionSettings.currentSettings.algorithm')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {encryptionAlgorithm}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailEncryptionSettings.currentSettings.keyLength')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {keyLength}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailEncryptionSettings.currentSettings.status')}
              </Text>
              <Text style={[styles.statusValue, { color: encryptionEnabled ? colors.primary : colors.textSecondary }]}>
                {encryptionEnabled ? t('common.enabled') : t('common.disabled')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('emailEncryptionSettings.infoSection.title')}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('emailEncryptionSettings.infoSection.description')}
          </Text>
        </View>
      </ScrollView>
    </SmartScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  summarySection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  summaryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
    textTransform: 'uppercase',
  },
  groupContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  disabledItem: {
    opacity: 0.6,
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
  separator: {
    height: 1,
    marginLeft: 48,
  },
  statusSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 