import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Bell,
    ChevronRight,
    Clock,
    Link,
    Mail,
    Plus,
    RefreshCw,
    Settings,
    Shield,
    Trash2
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

export default function EmailSettingsModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Local state for settings
  const [emailAutoSync, setEmailAutoSync] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = useState(true);
  const [secureConnection, setSecureConnection] = useState(true);

  // Mock data
  const connectedAccountsCount = 2;
  const currentSyncFrequency = t('emailSettings.syncFrequency');

  const handleConnectedAccounts = () => {
    router.push('/modals/settings/connected-accounts' as any);
  };

  const handleAddAccount = () => {
    router.push('/modals/email/email-add-input' as any);
  };

  const handleSyncFrequency = () => {
    router.push('/modals/settings/sync-frequency' as any);
  };

  const settingsGroups = [
    {
      title: t('emailSettings.accountManagement.title'),
      items: [
        {
          icon: <Link size={20} color={colors.primary} />,
          title: t('emailSettings.connectedAccounts.title'),
          subtitle: t('emailSettings.connectedAccounts.subtitle', { count: connectedAccountsCount }),
          type: 'navigation',
          onPress: handleConnectedAccounts,
        },
        {
          icon: <Plus size={20} color={colors.primary} />,
          title: t('emailSettings.addEmailAccount.title'),
          subtitle: t('emailSettings.addEmailAccount.subtitle'),
          type: 'navigation',
          onPress: handleAddAccount,
        },
      ],
    },
    {
      title: t('emailSettings.syncSettings.title'),
      items: [
        {
          icon: <RefreshCw size={20} color={colors.primary} />,
          title: t('emailSettings.autoSync.title'),
          subtitle: t('emailSettings.autoSync.subtitle'),
          type: 'switch',
          value: emailAutoSync,
          onToggle: setEmailAutoSync,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: t('emailSettings.syncFrequencyOption.title'),
          subtitle: currentSyncFrequency,
          type: 'navigation',
          onPress: handleSyncFrequency,
          disabled: !emailAutoSync,
        },
      ],
    },
    {
      title: t('emailSettings.emailProcessing.title'),
      items: [
        {
          icon: <Trash2 size={20} color={colors.primary} />,
          title: t('emailSettings.autoDeleteEmails.title'),
          subtitle: t('emailSettings.autoDeleteEmails.subtitle'),
          type: 'switch',
          value: autoDeleteEmails,
          onToggle: setAutoDeleteEmails,
        },
        {
          icon: <Bell size={20} color={colors.primary} />,
          title: t('emailSettings.emailNotifications.title'),
          subtitle: t('emailSettings.emailNotifications.subtitle'),
          type: 'switch',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: t('emailSettings.securitySettings.title'),
      items: [
        {
          icon: <Shield size={20} color={colors.primary} />,
          title: t('emailSettings.secureConnection.title'),
          subtitle: t('emailSettings.secureConnection.subtitle'),
          type: 'switch',
          value: secureConnection,
          onToggle: setSecureConnection,
        },
        {
          icon: <Settings size={20} color={colors.primary} />,
          title: t('emailSettings.advancedSettings.title'),
          subtitle: t('emailSettings.advancedSettings.subtitle'),
          type: 'navigation',
          onPress: () => {
            // Navigate to advanced settings
            console.log('Navigate to advanced settings');
          },
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
        {t('emailSettings.title')}
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
            <Mail size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailSettings.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailSettings.summaryDescription')}
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

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {t('emailSettings.statusSection.title')}
          </Text>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailSettings.statusSection.lastSync')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {t('emailSettings.statusSection.lastSyncValue')}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailSettings.statusSection.scannedEmails')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {t('emailSettings.statusSection.scannedEmailsValue')}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailSettings.statusSection.foundAccounts')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {t('emailSettings.statusSection.foundAccountsValue')}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('emailSettings.infoSection.title')}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('emailSettings.infoSection.description')}
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