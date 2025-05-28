import { ChevronRight, Globe } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useLanguage, type SupportedLanguage } from '../../hooks/useLanguage';

interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  const { currentLanguage, changeLanguage, getSupportedLanguages, t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const supportedLanguages = getSupportedLanguages();
  const currentLanguageName = supportedLanguages.find(lang => lang.code === currentLanguage)?.name || 'English';

  const handleLanguageSelect = async (languageCode: SupportedLanguage) => {
    await changeLanguage(languageCode);
    setIsModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: { code: SupportedLanguage; name: string } }) => (
    <TouchableOpacity
      style={[styles.languageItem, { backgroundColor: colors.surface }]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={[styles.languageItemText, { color: colors.text }]}>{item.name}</Text>
      {item.code === currentLanguage && (
        <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
          <Text style={[styles.checkmarkText, { color: colors.background }]}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.surface }, style]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.settingIcon}>
          <Globe size={20} color={colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {t('settings.language')}
          </Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {currentLanguageName}
          </Text>
        </View>
        <View style={styles.settingAction}>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('settings.selectLanguage')}
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={[styles.doneButton, { color: colors.primary }]}>
                {t('common.done')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={supportedLanguages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            style={styles.languageList}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = {
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingAction: {
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  languageItemText: {
    fontSize: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
}; 