import { Colors } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useSmartSafeArea } from '@/hooks/useSafeArea';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SyncFrequencyOption {
  value: string;
  label: string;
  description: string;
}

export default function SyncFrequencyModal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  const { containerPadding } = useSmartSafeArea();
  const { emailSyncFrequency, setEmailSyncFrequency } = useSettings();

  const frequencyOptions: SyncFrequencyOption[] = [
    {
      value: t('syncFrequency.options.realtime.value'),
      label: t('syncFrequency.options.realtime.label'),
      description: t('syncFrequency.options.realtime.description'),
    },
    {
      value: t('syncFrequency.options.every15min.value'),
      label: t('syncFrequency.options.every15min.label'),
      description: t('syncFrequency.options.every15min.description'),
    },
    {
      value: t('syncFrequency.options.every30min.value'),
      label: t('syncFrequency.options.every30min.label'),
      description: t('syncFrequency.options.every30min.description'),
    },
    {
      value: t('syncFrequency.options.hourly.value'),
      label: t('syncFrequency.options.hourly.label'),
      description: t('syncFrequency.options.hourly.description'),
    },
    {
      value: t('syncFrequency.options.every6hours.value'),
      label: t('syncFrequency.options.every6hours.label'),
      description: t('syncFrequency.options.every6hours.description'),
    },
    {
      value: t('syncFrequency.options.manual.value'),
      label: t('syncFrequency.options.manual.label'),
      description: t('syncFrequency.options.manual.description'),
    },
  ];

  const handleSelect = (frequency: string) => {
    setEmailSyncFrequency(frequency);
    router.back();
  };

  const renderOption = (option: SyncFrequencyOption) => {
    const isSelected = option.value === emailSyncFrequency;
    
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionItem,
          { backgroundColor: colors.surface },
          isSelected && { backgroundColor: colors.primary + '20' }
        ]}
        onPress={() => handleSelect(option.value)}
      >
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            { color: colors.text },
            isSelected && { color: colors.primary }
          ]}>
            {option.label}
          </Text>
          <Text style={[
            styles.optionDescription,
            { color: colors.textSecondary },
            isSelected && { color: colors.primary + 'CC' }
          ]}>
            {option.description}
          </Text>
        </View>
        
        {isSelected && (
          <View style={styles.checkIcon}>
            <Check size={20} color={colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, containerPadding]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('syncFrequency.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {t('syncFrequency.selectTitle')}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
            {t('syncFrequency.description')}
          </Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {frequencyOptions.map(renderOption)}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            {t('syncFrequency.infoSection.title')}
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('syncFrequency.infoSection.description')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  summarySection: {
    paddingVertical: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsList: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  checkIcon: {
    marginLeft: 12,
  },
  infoSection: {
    marginBottom: 16,
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