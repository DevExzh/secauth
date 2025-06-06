import { useLanguage } from '@/hooks/useLanguage';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/**
 * Basic i18n Usage Example
 * 
 * This component demonstrates the fundamental usage of i18n in SecAuth:
 * - Basic text translation
 * - Current language detection
 * - Safe fallback when translations are missing
 */
export const BasicUsageExample: React.FC = () => {
  const { t, currentLanguage } = useLanguage();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('examples.i18n.basicUsage.title')}</Text>
      
      {/* Basic Translation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Translation</Text>
        <Text style={styles.example}>
          {t('common.welcome')}: {t('app.name')}
        </Text>
        <Text style={styles.code}>
          Code: {`{t('common.welcome')}: {t('app.name')}`}
        </Text>
      </View>

      {/* Current Language Detection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language</Text>
        <Text style={styles.example}>
          {t('settings.language')}: {currentLanguage.toUpperCase()}
        </Text>
        <Text style={styles.code}>
          Code: {`{t('settings.language')}: {currentLanguage.toUpperCase()}`}
        </Text>
      </View>

      {/* Common UI Elements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common UI Elements</Text>
        <View style={styles.buttonGroup}>
          <Text style={styles.button}>{t('common.save')}</Text>
          <Text style={styles.button}>{t('common.cancel')}</Text>
          <Text style={styles.button}>{t('common.delete')}</Text>
        </View>
        <Text style={styles.code}>
          Code: {`{t('common.save')}, {t('common.cancel')}, {t('common.delete')}`}
        </Text>
      </View>

      {/* Navigation Labels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Labels</Text>
        <View style={styles.navGroup}>
          <Text style={styles.navItem}>{t('navigation.home')}</Text>
          <Text style={styles.navItem}>{t('navigation.add')}</Text>
          <Text style={styles.navItem}>{t('navigation.profile')}</Text>
        </View>
        <Text style={styles.code}>
          Code: {`{t('navigation.home')}, {t('navigation.add')}, {t('navigation.profile')}`}
        </Text>
      </View>

      {/* Settings Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings Examples</Text>
        <Text style={styles.example}>
          {t('settings.title')}
        </Text>
        <Text style={styles.example}>
          {t('settings.theme')}: {t('settings.themeOptions.system')}
        </Text>
        <Text style={styles.example}>
          {t('settings.autoLock')}: {t('settings.autoLockOptions.5min')}
        </Text>
        <Text style={styles.code}>
          Code: Nested translations like {`{t('settings.themeOptions.system')}`}
        </Text>
      </View>

      {/* Language-specific Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language-specific Display</Text>
        {currentLanguage === 'zh' ? (
          <Text style={styles.example}>
            当前语言是中文，显示特定内容
          </Text>
        ) : currentLanguage === 'es' ? (
          <Text style={styles.example}>
            El idioma actual es español, mostrando contenido específico
          </Text>
        ) : (
          <Text style={styles.example}>
            Current language is English, showing specific content
          </Text>
        )}
        <Text style={styles.code}>
          Code: Conditional rendering based on currentLanguage
        </Text>
      </View>

      {/* Safe Fallback Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safe Fallback</Text>
        <Text style={styles.example}>
          Missing key: {t('nonexistent.key')}
        </Text>
        <Text style={styles.code}>
          Code: {`{t('nonexistent.key')}`} - Returns key when translation missing
        </Text>
      </View>

      {/* Multi-level Nesting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multi-level Nesting</Text>
        <Text style={styles.example}>
          {t('add.manual.serviceName')}: Google
        </Text>
        <Text style={styles.example}>
          {t('add.manual.typeOptions.TOTP')}
        </Text>
        <Text style={styles.code}>
          Code: Deep nesting like {`{t('add.manual.typeOptions.TOTP')}`}
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
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  example: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#e8e8e8',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  navGroup: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 8,
  },
  navItem: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default BasicUsageExample; 