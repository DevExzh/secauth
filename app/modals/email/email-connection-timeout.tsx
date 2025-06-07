import { SmartScreen } from '@/components/layout/SmartScreen';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { router } from 'expo-router';
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Timer,
    Wifi,
    Zap
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

export default function EmailConnectionTimeoutModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  // Local state for timeout settings
  const [customTimeouts, setCustomTimeouts] = useState(false);
  const [autoRetry, setAutoRetry] = useState(true);
  const [connectionTimeout, setConnectionTimeout] = useState('30 seconds');
  const [readTimeout, setReadTimeout] = useState('60 seconds');
  const [retryAttempts, setRetryAttempts] = useState('3 attempts');

  const timeoutOptions = [
    { label: '10 seconds', value: '10 seconds' },
    { label: '30 seconds', value: '30 seconds' },
    { label: '60 seconds', value: '60 seconds' },
    { label: '2 minutes', value: '2 minutes' },
    { label: '5 minutes', value: '5 minutes' },
  ];

  const retryOptions = [
    { label: '1 attempt', value: '1 attempt' },
    { label: '3 attempts', value: '3 attempts' },
    { label: '5 attempts', value: '5 attempts' },
    { label: '10 attempts', value: '10 attempts' },
  ];

  const settingsGroups = [
    {
      title: t('emailConnectionTimeout.generalSettings.title'),
      items: [
        {
          icon: <Timer size={20} color={colors.primary} />,
          title: t('emailConnectionTimeout.customTimeouts.title'),
          subtitle: t('emailConnectionTimeout.customTimeouts.subtitle'),
          type: 'switch',
          value: customTimeouts,
          onToggle: setCustomTimeouts,
        },
        {
          icon: <Zap size={20} color={colors.primary} />,
          title: t('emailConnectionTimeout.autoRetry.title'),
          subtitle: t('emailConnectionTimeout.autoRetry.subtitle'),
          type: 'switch',
          value: autoRetry,
          onToggle: setAutoRetry,
        },
      ],
    },
    {
      title: t('emailConnectionTimeout.timeoutSettings.title'),
      items: [
        {
          icon: <Wifi size={20} color={colors.primary} />,
          title: t('emailConnectionTimeout.connectionTimeout.title'),
          subtitle: connectionTimeout,
          type: 'navigation',
          onPress: () => console.log('Select connection timeout'),
          disabled: !customTimeouts,
        },
        {
          icon: <Clock size={20} color={colors.primary} />,
          title: t('emailConnectionTimeout.readTimeout.title'),
          subtitle: readTimeout,
          type: 'navigation',
          onPress: () => console.log('Select read timeout'),
          disabled: !customTimeouts,
        },
      ],
    },
    {
      title: t('emailConnectionTimeout.retrySettings.title'),
      items: [
        {
          icon: <Timer size={20} color={colors.primary} />,
          title: t('emailConnectionTimeout.retryAttempts.title'),
          subtitle: retryAttempts,
          type: 'navigation',
          onPress: () => console.log('Select retry attempts'),
          disabled: !autoRetry,
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
        {t('emailConnectionTimeout.title')}
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
            <Timer size={32} color={colors.primary} />
          </View>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('emailConnectionTimeout.summaryTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('emailConnectionTimeout.summaryDescription')}
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
            {t('emailConnectionTimeout.currentSettings.title')}
          </Text>
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailConnectionTimeout.currentSettings.connectionTimeout')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {connectionTimeout}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailConnectionTimeout.currentSettings.readTimeout')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {readTimeout}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                {t('emailConnectionTimeout.currentSettings.retryAttempts')}
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {retryAttempts}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendations Section */}
        <View style={styles.recommendationSection}>
          <Text style={[styles.recommendationTitle, { color: colors.text }]}>
            {t('emailConnectionTimeout.recommendations.title')}
          </Text>
          <View style={[styles.recommendationCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
              {t('emailConnectionTimeout.recommendations.description')}
            </Text>
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
  recommendationSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationCard: {
    padding: 16,
    borderRadius: 12,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 