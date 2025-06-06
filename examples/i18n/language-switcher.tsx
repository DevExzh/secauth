import { useLanguage, type SupportedLanguage } from '@/hooks/useLanguage';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Language Switcher Example
 * 
 * This component demonstrates various ways to implement language switching:
 * - Basic language switcher with buttons
 * - Settings-style language picker
 * - Inline language switcher
 * - Advanced dropdown selector
 */
export const LanguageSwitcherExample: React.FC = () => {
  const { currentLanguage, changeLanguage, getSupportedLanguages, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  
  const supportedLanguages = getSupportedLanguages();

  // Handle language change with loading state
  const handleLanguageChange = useCallback(async (newLanguage: SupportedLanguage) => {
    if (newLanguage === currentLanguage) return;

    setIsChanging(true);
    try {
      await changeLanguage(newLanguage);
      Alert.alert(
        t('settings.saved'),
        'Language changed successfully',
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        'Failed to change language',
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage, changeLanguage, t]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Language Switcher Examples</Text>

      {/* Current Language Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language</Text>
        <Text style={styles.currentLanguage}>
          {t('settings.language')}: {supportedLanguages.find(lang => lang.code === currentLanguage)?.name}
        </Text>
      </View>

      {/* Basic Button Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Button Switcher</Text>
        <View style={styles.buttonRow}>
          {supportedLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                currentLanguage === language.code && styles.activeLanguageButton
              ]}
              onPress={() => handleLanguageChange(language.code)}
              disabled={isChanging}
            >
              {isChanging && currentLanguage !== language.code ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.languageButtonText,
                    currentLanguage === language.code && styles.activeLanguageButtonText
                  ]}
                >
                  {language.name}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings-style List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings-style List</Text>
        {supportedLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={styles.settingsItem}
            onPress={() => handleLanguageChange(language.code)}
            disabled={isChanging}
          >
            <View style={styles.settingsItemContent}>
              <Text style={styles.settingsItemText}>
                {language.name}
              </Text>
              <Text style={styles.settingsItemCode}>
                {language.code.toUpperCase()}
              </Text>
            </View>
            {currentLanguage === language.code && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Compact Inline Switcher */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compact Inline Switcher</Text>
        <View style={styles.inlineContainer}>
          <Text style={styles.inlineLabel}>{t('settings.language')}:</Text>
          <View style={styles.inlineSwitcher}>
            {supportedLanguages.map((language, index) => (
              <React.Fragment key={language.code}>
                <TouchableOpacity
                  style={[
                    styles.inlineOption,
                    currentLanguage === language.code && styles.activeInlineOption
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                  disabled={isChanging}
                >
                  <Text
                    style={[
                      styles.inlineOptionText,
                      currentLanguage === language.code && styles.activeInlineOptionText
                    ]}
                  >
                    {language.name}
                  </Text>
                </TouchableOpacity>
                {index < supportedLanguages.length - 1 && (
                  <Text style={styles.inlineSeparator}>|</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      {/* Usage Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integration Examples</Text>
        <Text style={styles.codeExample}>
          {`// In a settings screen
const SettingsScreen = () => {
  const { currentLanguage, changeLanguage, getSupportedLanguages, t } = useLanguage();
  
  return (
    <View>
      <Text>{t('settings.language')}</Text>
      {getSupportedLanguages().map(lang => (
        <TouchableOpacity 
          key={lang.code}
          onPress={() => changeLanguage(lang.code)}
        >
          <Text>{lang.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};`}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  currentLanguage: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    minWidth: 80,
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activeLanguageButtonText: {
    color: '#fff',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
    borderRadius: 8,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingsItemCode: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  inlineLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inlineSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#e8e8e8',
  },
  activeInlineOption: {
    backgroundColor: '#007AFF',
  },
  inlineOptionText: {
    fontSize: 14,
    color: '#333',
  },
  activeInlineOptionText: {
    color: '#fff',
  },
  inlineSeparator: {
    fontSize: 14,
    color: '#ccc',
  },
  codeExample: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    color: '#333',
    lineHeight: 16,
  },
});

export default LanguageSwitcherExample; 