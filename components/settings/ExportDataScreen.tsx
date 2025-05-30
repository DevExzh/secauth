import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    FileText,
    Settings,
    Upload
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ExportDataScreenProps {
  onBack: () => void;
}

export const ExportDataScreen: React.FC<ExportDataScreenProps> = ({
  onBack,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [exportFormat, setExportFormat] = useState<'json' | 'encrypted'>('encrypted');
  const [includeSettings, setIncludeSettings] = useState(true);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (exportFormat === 'encrypted') {
      if (!encryptionPassword) {
        Alert.alert(
          t('dataManagement.exportData.exportError'),
          t('dataManagement.exportData.passwordRequired')
        );
        return;
      }

      if (encryptionPassword !== confirmPassword) {
        Alert.alert(
          t('dataManagement.exportData.exportError'),
          t('dataManagement.exportData.passwordMismatch')
        );
        return;
      }
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        t('dataManagement.exportData.exportSuccess'),
        t('dataManagement.exportData.exportSuccessMessage'),
        [{ text: t('common.done'), onPress: onBack }]
      );
    } catch (error) {
      Alert.alert(
        t('dataManagement.exportData.exportError'),
        t('dataManagement.exportData.exportErrorMessage')
      );
    } finally {
      setIsExporting(false);
    }
  };

  const mockAccountCount = 12; // Simulate number of accounts

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('dataManagement.exportData.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Upload size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('dataManagement.exportData.title')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('dataManagement.exportData.description')}
          </Text>
        </View>

        {/* Account Summary */}
        <View style={styles.section}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={styles.summaryHeader}>
              <FileText size={20} color={colors.primary} />
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Export Summary
              </Text>
            </View>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {mockAccountCount} accounts will be exported
            </Text>
          </View>
        </View>

        {/* Export Format */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dataManagement.exportData.exportFormat')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('dataManagement.exportData.exportFormatDescription')}
          </Text>

          <View style={[styles.formatCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[
                styles.formatOption,
                exportFormat === 'json' && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => setExportFormat('json')}
            >
              <View style={styles.formatContent}>
                <Text style={[styles.formatTitle, { color: colors.text }]}>
                  {t('dataManagement.exportData.jsonFormat')}
                </Text>
                <Text style={[styles.formatDescription, { color: colors.textSecondary }]}>
                  Readable format, not encrypted
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: colors.border },
                exportFormat === 'json' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}>
                {exportFormat === 'json' && <CheckCircle size={16} color={colors.background} />}
              </View>
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.formatOption,
                exportFormat === 'encrypted' && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => setExportFormat('encrypted')}
            >
              <View style={styles.formatContent}>
                <Text style={[styles.formatTitle, { color: colors.text }]}>
                  {t('dataManagement.exportData.encryptedFormat')}
                </Text>
                <Text style={[styles.formatDescription, { color: colors.textSecondary }]}>
                  Password protected and encrypted
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: colors.border },
                exportFormat === 'encrypted' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}>
                {exportFormat === 'encrypted' && <CheckCircle size={16} color={colors.background} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Encryption Settings */}
        {exportFormat === 'encrypted' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Encryption Settings
            </Text>
            
            <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('dataManagement.exportData.encryptionPassword')}
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={encryptionPassword}
                  onChangeText={setEncryptionPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('dataManagement.exportData.confirmPassword')}
                </Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              {encryptionPassword && confirmPassword && encryptionPassword !== confirmPassword && (
                <View style={[styles.errorCard, { backgroundColor: colors.error + '20' }]}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {t('dataManagement.exportData.passwordMismatch')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Export Options */}
        <View style={styles.section}>
          <View style={[styles.optionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.optionHeader}>
              <Settings size={20} color={colors.primary} />
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Export Options
              </Text>
            </View>
            
            <View style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {t('dataManagement.exportData.includeSettings')}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  {t('dataManagement.exportData.includeSettingsDescription')}
                </Text>
              </View>
              <Switch
                value={includeSettings}
                onValueChange={setIncludeSettings}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { 
                backgroundColor: colors.primary,
                opacity: isExporting ? 0.6 : 1
              }
            ]}
            onPress={handleExport}
            disabled={isExporting}
          >
            <Text style={[styles.exportButtonText, { color: colors.background }]}>
              {isExporting ? t('common.loading') : t('dataManagement.exportData.exportButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 14,
  },
  formatCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  formatContent: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
  inputCard: {
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  exportButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 