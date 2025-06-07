import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Database,
    FileKey,
    Key,
    Lock,
    Shield,
    ShieldCheck,
    Timer,
    Wifi
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EmailAdvancedSettingsModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Local state for advanced security settings
  const [endToEndEncryption, setEndToEndEncryption] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [certificateValidation, setCertificateValidation] = useState(true);
  const [secureProtocolOnly, setSecureProtocolOnly] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [dataRetentionEnabled, setDataRetentionEnabled] = useState(false);

  const handleEncryptionSettings = () => {
    router.push('/modals/email/email-encryption-settings' as any);
  };

  const handleCertificateManagement = () => {
    router.push('/modals/email/email-certificate-management' as any);
  };

  const handleConnectionTimeout = () => {
    router.push('/modals/email/email-connection-timeout' as any);
  };

  const handleDataRetention = () => {
    router.push('/modals/email/email-data-retention' as any);
  };

  const handleAutoLockSettings = () => {
    Alert.alert(
      t('emailAdvancedSettings.autoLock.alertTitle'),
      t('emailAdvancedSettings.autoLock.alertMessage'),
      [{ text: t('common.ok'), style: 'default' }]
    );
  };

  const settingsGroups = [
    {
      title: t('emailAdvancedSettings.encryption.title'),
      items: [
        {
          icon: <Lock size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.endToEndEncryption.title'),
          subtitle: t('emailAdvancedSettings.endToEndEncryption.subtitle'),
          type: 'switch',
          value: endToEndEncryption,
          onToggle: setEndToEndEncryption,
        },
        {
          icon: <FileKey size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.encryptionSettings.title'),
          subtitle: t('emailAdvancedSettings.encryptionSettings.subtitle'),
          type: 'navigation',
          onPress: handleEncryptionSettings,
        },
      ],
    },
    {
      title: t('emailAdvancedSettings.authentication.title'),
      items: [
        {
          icon: <Key size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.twoFactorAuth.title'),
          subtitle: t('emailAdvancedSettings.twoFactorAuth.subtitle'),
          type: 'switch',
          value: twoFactorAuth,
          onToggle: setTwoFactorAuth,
        },
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.certificateValidation.title'),
          subtitle: t('emailAdvancedSettings.certificateValidation.subtitle'),
          type: 'switch',
          value: certificateValidation,
          onToggle: setCertificateValidation,
        },
        {
          icon: <ShieldCheck size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.certificateManagement.title'),
          subtitle: t('emailAdvancedSettings.certificateManagement.subtitle'),
          type: 'navigation',
          onPress: handleCertificateManagement,
        },
      ],
    },
    {
      title: t('emailAdvancedSettings.connection.title'),
      items: [
        {
          icon: <Wifi size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.secureProtocolOnly.title'),
          subtitle: t('emailAdvancedSettings.secureProtocolOnly.subtitle'),
          type: 'switch',
          value: secureProtocolOnly,
          onToggle: setSecureProtocolOnly,
        },
        {
          icon: <Timer size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.connectionTimeout.title'),
          subtitle: t('emailAdvancedSettings.connectionTimeout.subtitle'),
          type: 'navigation',
          onPress: handleConnectionTimeout,
        },
      ],
    },
    {
      title: t('emailAdvancedSettings.security.title'),
      items: [
        {
          icon: <Lock size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.autoLockEnabled.title'),
          subtitle: t('emailAdvancedSettings.autoLockEnabled.subtitle'),
          type: 'switch',
          value: autoLockEnabled,
          onToggle: setAutoLockEnabled,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.autoLockSettings.title'),
          subtitle: t('emailAdvancedSettings.autoLockSettings.subtitle'),
          type: 'navigation',
          onPress: handleAutoLockSettings,
          disabled: !autoLockEnabled,
        },
      ],
    },
    {
      title: t('emailAdvancedSettings.dataManagement.title'),
      items: [
        {
          icon: <Database size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.dataRetentionEnabled.title'),
          subtitle: t('emailAdvancedSettings.dataRetentionEnabled.subtitle'),
          type: 'switch',
          value: dataRetentionEnabled,
          onToggle: setDataRetentionEnabled,
        },
        {
          icon: <Timer size={20} color={colors.primary} />,
          title: t('emailAdvancedSettings.dataRetentionSettings.title'),
          subtitle: t('emailAdvancedSettings.dataRetentionSettings.subtitle'),
          type: 'navigation',
          onPress: handleDataRetention,
          disabled: !dataRetentionEnabled,
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
        {t('emailAdvancedSettings.title')}
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
            <Shield size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailAdvancedSettings.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailAdvancedSettings.summaryDescription')}
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

        {/* Warning Section */}
        <View style={styles.warningSection}>
          <View style={[styles.warningCard, { backgroundColor: colors.surface, borderColor: colors.primary + '40' }]}>
            <Shield size={24} color={colors.primary} style={styles.warningIcon} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: colors.text }]}>
                {t('emailAdvancedSettings.warning.title')}
              </Text>
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                {t('emailAdvancedSettings.warning.description')}
              </Text>
            </View>
          </View>
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
  warningSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 