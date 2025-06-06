import { useLanguage, type SupportedLanguage } from '@/hooks/useLanguage';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Advanced i18n Usage Example
 * 
 * This component demonstrates advanced i18n techniques:
 * - Parameter interpolation
 * - Pluralization handling
 * - Dynamic content translation
 * - Performance optimization
 * - Custom translation functions
 * - Conditional translations based on language
 */
export const AdvancedUsageExample: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [userName, setUserName] = useState('John');
  const [itemCount, setItemCount] = useState(5);
  const [isVIP, setIsVIP] = useState(false);

  // Example: Dynamic greeting based on time
  const getTimeBasedGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greetings.morning');
    } else if (hour < 18) {
      return t('greetings.afternoon');
    } else {
      return t('greetings.evening');
    }
  }, [t]);

  // Example: Language-specific formatting
  const formatCurrency = useCallback((amount: number) => {
    const currencySymbols = {
      en: '$',
      zh: '¥',
      es: '€',
    };
    
    const symbol = currencySymbols[currentLanguage] || '$';
    
    // Different formatting rules for different languages
    if (currentLanguage === 'zh') {
      return `${symbol}${amount.toFixed(2)}`;
    } else if (currentLanguage === 'es') {
      return `${amount.toFixed(2)} ${symbol}`;
    } else {
      return `${symbol}${amount.toFixed(2)}`;
    }
  }, [currentLanguage]);

  // Example: Pluralization logic
  const getPluralForm = useCallback((count: number, singularKey: string, pluralKey: string) => {
    // Simple pluralization - in real app, use i18n pluralization
    if (count === 1) {
      return t(singularKey);
    } else {
      return t(pluralKey);
    }
  }, [t]);

  // Example: Memoized translations for performance
  const memoizedTranslations = useMemo(() => ({
    title: t('advanced.title'),
    description: t('advanced.description'),
    navigationItems: [
      t('navigation.home'),
      t('navigation.add'),
      t('navigation.profile'),
    ],
  }), [t]);

  // Example: Custom translation hook for specific domain
  const useAccountTranslations = () => {
    return useMemo(() => ({
      addAccount: t('add.title'),
      editAccount: t('edit.title'),
      deleteAccount: t('delete.title'),
      types: {
        totp: t('add.manual.typeOptions.TOTP'),
        hotp: t('add.manual.typeOptions.HOTP'),
        steam: t('add.manual.typeOptions.Steam'),
      },
    }), [t]);
  };

  const accountTranslations = useAccountTranslations();

  // Example: Language-specific conditional rendering
  const renderLanguageSpecificContent = () => {
    switch (currentLanguage) {
      case 'zh':
        return (
          <View style={styles.languageSpecific}>
            <Text style={styles.languageTitle}>中文特定内容</Text>
            <Text style={styles.languageText}>
              这里显示只有中文用户才能看到的内容，比如特定的文化背景信息。
            </Text>
          </View>
        );
      case 'es':
        return (
          <View style={styles.languageSpecific}>
            <Text style={styles.languageTitle}>Contenido específico en español</Text>
            <Text style={styles.languageText}>
              Aquí se muestra contenido que solo los usuarios de español pueden ver.
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.languageSpecific}>
            <Text style={styles.languageTitle}>English-specific Content</Text>
            <Text style={styles.languageText}>
              This content is only visible to English users.
            </Text>
          </View>
        );
    }
  };

  // Example: Safe translation with fallback
  const safeTranslate = useCallback((key: string, fallback: string, params?: Record<string, any>) => {
    try {
      const result = t(key, params);
      // If translation returns the key itself, use fallback
      return result === key ? fallback : result;
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return fallback;
    }
  }, [t]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Advanced i18n Usage Examples</Text>

      {/* Parameter Interpolation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parameter Interpolation</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>User Name:</Text>
          <TextInput
            style={styles.textInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter name"
          />
        </View>

        <Text style={styles.example}>
          Welcome: {safeTranslate('welcome.user', `Welcome, ${userName}!`, { name: userName })}
        </Text>
        
        <Text style={styles.code}>
          {`t('welcome.user', { name: userName })`}
        </Text>
      </View>

      {/* Dynamic Time-based Greeting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dynamic Time-based Greeting</Text>
        <Text style={styles.example}>
          {getTimeBasedGreeting()}, {userName}!
        </Text>
        <Text style={styles.code}>
          Dynamic function: getTimeBasedGreeting()
        </Text>
      </View>

      {/* Pluralization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pluralization</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Item Count:</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setItemCount(Math.max(0, itemCount - 1))}
            >
              <Text style={styles.counterButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{itemCount}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setItemCount(itemCount + 1)}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.example}>
          You have {itemCount} {getPluralForm(itemCount, 'item.singular', 'item.plural')}
        </Text>
        
        <Text style={styles.code}>
          {`getPluralForm(${itemCount}, 'item.singular', 'item.plural')`}
        </Text>
      </View>

      {/* Language-specific Formatting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language-specific Formatting</Text>
        <Text style={styles.example}>
          Price: {formatCurrency(99.99)}
        </Text>
        <Text style={styles.example}>
          Discount: {formatCurrency(19.99)}
        </Text>
        <Text style={styles.code}>
          Different currency symbols and formats per language
        </Text>
      </View>

      {/* Conditional Content by Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language-specific Content</Text>
        {renderLanguageSpecificContent()}
      </View>

      {/* Memoized Translations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Memoized Translations (Performance)</Text>
        <Text style={styles.example}>Title: {memoizedTranslations.title}</Text>
        <Text style={styles.example}>
          Navigation: {memoizedTranslations.navigationItems.join(' | ')}
        </Text>
        <Text style={styles.code}>
          useMemo() to cache translations and prevent unnecessary re-renders
        </Text>
      </View>

      {/* Custom Translation Domain */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Translation Domain</Text>
        <Text style={styles.example}>Add: {accountTranslations.addAccount}</Text>
        <Text style={styles.example}>Types: {Object.values(accountTranslations.types).join(', ')}</Text>
        <Text style={styles.code}>
          Custom hook for domain-specific translations
        </Text>
      </View>

      {/* VIP Content Example */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conditional Content</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>VIP Status:</Text>
          <Switch
            value={isVIP}
            onValueChange={setIsVIP}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isVIP ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.example}>
          {isVIP 
            ? safeTranslate('vip.welcome', 'Welcome VIP member!', { name: userName })
            : safeTranslate('regular.welcome', 'Welcome!', { name: userName })
          }
        </Text>
        
        <Text style={styles.code}>
          Conditional translation based on user status
        </Text>
      </View>

      {/* Error Handling */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safe Translation with Fallback</Text>
        <Text style={styles.example}>
          Non-existent key: {safeTranslate('nonexistent.key', 'Fallback text')}
        </Text>
        <Text style={styles.code}>
          safeTranslate() with automatic fallback
        </Text>
      </View>

      {/* Quick Language Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Language Test</Text>
        <View style={styles.languageButtons}>
          {(['en', 'zh', 'es'] as SupportedLanguage[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.quickLangButton,
                currentLanguage === lang && styles.activeLangButton
              ]}
              onPress={() => changeLanguage(lang)}
            >
              <Text style={[
                styles.quickLangText,
                currentLanguage === lang && styles.activeLangText
              ]}>
                {lang.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.code}>
          Switch languages to see dynamic content changes
        </Text>
      </View>

      {/* Best Practices Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Practices Summary</Text>
        <View style={styles.bestPractices}>
          <Text style={styles.practiceItem}>• Use memoization for performance</Text>
          <Text style={styles.practiceItem}>• Implement safe fallbacks</Text>
          <Text style={styles.practiceItem}>• Create domain-specific translation hooks</Text>
          <Text style={styles.practiceItem}>• Handle pluralization properly</Text>
          <Text style={styles.practiceItem}>• Consider language-specific formatting</Text>
          <Text style={styles.practiceItem}>• Test with all supported languages</Text>
        </View>
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  example: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#e9ecef',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  languageSpecific: {
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976d2',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickLangButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  activeLangButton: {
    backgroundColor: '#007AFF',
  },
  quickLangText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeLangText: {
    color: '#fff',
  },
  bestPractices: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  practiceItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default AdvancedUsageExample; 