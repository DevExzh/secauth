import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    AlertTriangle,
    ArrowLeft,
    Download,
    FileText,
    Shield,
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
    TouchableOpacity,
    View,
} from 'react-native';

interface ImportDataScreenProps {
  onBack: () => void;
}

interface MockFile {
  name: string;
  size: number;
  type: string;
}

export const ImportDataScreen: React.FC<ImportDataScreenProps> = ({
  onBack,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<MockFile | null>(null);
  const [mergeWithExisting, setMergeWithExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const handleSelectFile = async () => {
    try {
      // Simulate file picker - in a real implementation, this would use expo-document-picker
      const mockFiles = [
        { name: 'secauth_backup_2024.json', size: 15420, type: 'application/json' },
        { name: 'authenticator_export.json', size: 8932, type: 'application/json' },
        { name: 'backup_encrypted.json', size: 12045, type: 'application/json' },
      ];
      
      const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      setSelectedFile(randomFile);
    } catch (error) {
      Alert.alert(
        t('dataManagement.importData.importError'),
        t('dataManagement.importData.importErrorMessage')
      );
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      Alert.alert(
        t('dataManagement.importData.invalidFile'),
        t('dataManagement.importData.invalidFileMessage')
      );
      return;
    }

    if (!mergeWithExisting) {
      Alert.alert(
        t('dataManagement.importData.overwriteWarning'),
        t('dataManagement.importData.overwriteWarningMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), onPress: performImport },
        ]
      );
    } else {
      performImport();
    }
  };

  const performImport = async () => {
    setIsImporting(true);
    
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful import
      const importedCount = Math.floor(Math.random() * 10) + 1;
      
      Alert.alert(
        t('dataManagement.importData.importSuccess'),
        t('dataManagement.importData.importSuccessMessage', { count: importedCount }),
        [{ text: t('common.done'), onPress: onBack }]
      );
    } catch (error) {
      Alert.alert(
        t('dataManagement.importData.importError'),
        t('dataManagement.importData.importErrorMessage')
      );
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('dataManagement.importData.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Download size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('dataManagement.importData.title')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('dataManagement.importData.description')}
          </Text>
        </View>

        {/* File Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dataManagement.importData.selectFile')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('dataManagement.importData.selectFileDescription')}
          </Text>

          <TouchableOpacity
            style={[styles.fileSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSelectFile}
          >
            <FileText size={24} color={colors.primary} />
            <View style={styles.fileSelectorContent}>
              {selectedFile ? (
                <>
                  <Text style={[styles.fileName, { color: colors.text }]}>
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                    {formatFileSize(selectedFile.size || 0)}
                  </Text>
                </>
              ) : (
                <Text style={[styles.filePlaceholder, { color: colors.textSecondary }]}>
                  Tap to select a backup file
                </Text>
              )}
            </View>
            <Upload size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Supported Formats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dataManagement.importData.supportedFormats')}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            {t('dataManagement.importData.supportedFormatsDescription')}
          </Text>
        </View>

        {/* Import Options */}
        <View style={styles.section}>
          <View style={[styles.optionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.optionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Import Options
              </Text>
            </View>
            
            <View style={styles.optionItem}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {t('dataManagement.importData.mergeOption')}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Keep existing accounts and add imported ones
                </Text>
              </View>
              <Switch
                value={mergeWithExisting}
                onValueChange={setMergeWithExisting}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            {!mergeWithExisting && (
              <View style={[styles.warningCard, { backgroundColor: colors.warning + '20' }]}>
                <AlertTriangle size={16} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.warning }]}>
                  {t('dataManagement.importData.replaceOption')} - This action cannot be undone
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Import Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.importButton,
              { 
                backgroundColor: selectedFile ? colors.primary : colors.border,
                opacity: isImporting ? 0.6 : 1
              }
            ]}
            onPress={handleImport}
            disabled={!selectedFile || isImporting}
          >
            <Text style={[
              styles.importButtonText,
              { color: selectedFile ? colors.background : colors.textSecondary }
            ]}>
              {isImporting ? t('common.loading') : t('dataManagement.importData.importButton')}
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
  fileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  fileSelectorContent: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 14,
  },
  filePlaceholder: {
    fontSize: 14,
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  importButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 