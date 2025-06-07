import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    Clock,
    Database,
    Timer,
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

export default function EmailDataRetentionModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Local state for data retention settings
  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [compressOldData, setCompressOldData] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState('30 days');
  const [cleanupSchedule, setCleanupSchedule] = useState('Weekly');

  const retentionPeriods = [
    { label: '7 days', value: '7 days' },
    { label: '30 days', value: '30 days' },
    { label: '90 days', value: '90 days' },
    { label: '6 months', value: '6 months' },
    { label: '1 year', value: '1 year' },
    { label: 'Never', value: 'Never' },
  ];

  const cleanupSchedules = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
  ];

  const settingsGroups = [
    {
      title: t('emailDataRetention.generalSettings.title'),
      items: [
        {
          icon: <Database size={20} color={colors.primary} />,
          title: t('emailDataRetention.retentionEnabled.title'),
          subtitle: t('emailDataRetention.retentionEnabled.subtitle'),
          type: 'switch',
          value: retentionEnabled,
          onToggle: setRetentionEnabled,
        },
        {
          icon: <Trash2 size={20} color={colors.primary} />,
          title: t('emailDataRetention.autoCleanup.title'),
          subtitle: t('emailDataRetention.autoCleanup.subtitle'),
          type: 'switch',
          value: autoCleanup,
          onToggle: setAutoCleanup,
          disabled: !retentionEnabled,
        },
      ],
    },
    {
      title: t('emailDataRetention.retentionSettings.title'),
      items: [
        {
          icon: <Calendar size={20} color={colors.primary} />,
          title: t('emailDataRetention.retentionPeriod.title'),
          subtitle: retentionPeriod,
          type: 'navigation',
          onPress: () => console.log('Select retention period'),
          disabled: !retentionEnabled,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: t('emailDataRetention.cleanupSchedule.title'),
          subtitle: cleanupSchedule,
          type: 'navigation',
          onPress: () => console.log('Select cleanup schedule'),
          disabled: !retentionEnabled || !autoCleanup,
        },
      ],
    },
    {
      title: t('emailDataRetention.storageOptimization.title'),
      items: [
        {
          icon: <Timer size={20} color={colors.primary} />,
          title: t('emailDataRetention.compressOldData.title'),
          subtitle: t('emailDataRetention.compressOldData.subtitle'),
          type: 'switch',
          value: compressOldData,
          onToggle: setCompressOldData,
          disabled: !retentionEnabled,
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
        {t('emailDataRetention.title')}
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
            <Database size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailDataRetention.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailDataRetention.summaryDescription')}
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

        {/* Storage Statistics */}
        <View style={styles.storageSection}>
          <Text style={[styles.storageTitle, { color: colors.text }]}>
            {t('emailDataRetention.storageStatistics.title')}
          </Text>
          <View style={[styles.storageCard, { backgroundColor: colors.surface }]}>
            <View style={styles.storageRow}>
              <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
                {t('emailDataRetention.storageStatistics.totalData')}
              </Text>
              <Text style={[styles.storageValue, { color: colors.text }]}>
                2.4 MB
              </Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
                {t('emailDataRetention.storageStatistics.oldestData')}
              </Text>
              <Text style={[styles.storageValue, { color: colors.text }]}>
                15 days ago
              </Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
                {t('emailDataRetention.storageStatistics.itemsToCleanup')}
              </Text>
              <Text style={[styles.storageValue, { color: colors.primary }]}>
                12 items
              </Text>
            </View>
          </View>
        </View>

        {/* Manual Cleanup Section */}
        <View style={styles.cleanupSection}>
          <Text style={[styles.cleanupTitle, { color: colors.text }]}>
            {t('emailDataRetention.manualCleanup.title')}
          </Text>
          <TouchableOpacity style={[styles.cleanupButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Trash2 size={20} color={colors.primary} />
            <Text style={[styles.cleanupButtonText, { color: colors.primary }]}>
              {t('emailDataRetention.manualCleanup.button')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.cleanupDescription, { color: colors.textSecondary }]}>
            {t('emailDataRetention.manualCleanup.description')}
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
  storageSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  storageCard: {
    padding: 16,
    borderRadius: 12,
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storageLabel: {
    fontSize: 14,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  cleanupSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  cleanupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  cleanupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  cleanupButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  cleanupDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
}); 