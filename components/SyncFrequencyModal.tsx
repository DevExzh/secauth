import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ArrowLeft, Check } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    SafeAreaView,
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

interface SyncFrequencyModalProps {
  visible: boolean;
  currentFrequency: string;
  onSelect: (frequency: string) => void;
  onClose: () => void;
}

export const SyncFrequencyModal: React.FC<SyncFrequencyModalProps> = ({
  visible,
  currentFrequency,
  onSelect,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const frequencyOptions: SyncFrequencyOption[] = [
    {
      value: '实时',
      label: '实时同步',
      description: '收到邮件时立即扫描',
    },
    {
      value: '每15分钟',
      label: '每15分钟',
      description: '定期检查新邮件',
    },
    {
      value: '每30分钟',
      label: '每30分钟',
      description: '平衡性能和及时性',
    },
    {
      value: '每小时',
      label: '每小时',
      description: '推荐设置，节省电量',
    },
    {
      value: '每6小时',
      label: '每6小时',
      description: '低频同步，最省电',
    },
    {
      value: '手动',
      label: '仅手动同步',
      description: '完全手动控制',
    },
  ];

  const handleSelect = (frequency: string) => {
    onSelect(frequency);
    onClose();
  };

  const renderOption = (option: SyncFrequencyOption) => {
    const isSelected = option.value === currentFrequency;
    
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
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            同步频率
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              选择同步频率
            </Text>
            <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
              设置邮件扫描的频率，影响电池使用和同步及时性。
            </Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {frequencyOptions.map(renderOption)}
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              频率说明
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              • 实时同步：最及时，但耗电较多{'\n'}
              • 每小时：推荐设置，平衡性能和及时性{'\n'}
              • 手动同步：最省电，需要手动触发扫描
            </Text>
          </View>
        </ScrollView>
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
  summarySection: {
    paddingVertical: 24,
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
    marginBottom: 24,
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