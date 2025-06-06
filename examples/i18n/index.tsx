import { useLanguage } from '@/hooks/useLanguage';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AdvancedUsageExample from './advanced-usage';
import BasicUsageExample from './basic-usage';
import LanguageSwitcherExample from './language-switcher';

/**
 * i18n Examples Index
 * 
 * This component serves as the main entry point for all i18n examples.
 * It provides navigation between different example components and demonstrates
 * how to structure i18n examples in a real application.
 */

type ExampleType = 'basic' | 'switcher' | 'advanced';

export const I18nExamplesIndex: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [currentExample, setCurrentExample] = useState<ExampleType>('basic');

  const examples = [
    {
      id: 'basic' as ExampleType,
      title: 'Basic Usage',
      description: 'Fundamental i18n usage patterns and translation basics',
      component: BasicUsageExample,
    },
    {
      id: 'switcher' as ExampleType,
      title: 'Language Switcher',
      description: 'Various language switching UI components and patterns',
      component: LanguageSwitcherExample,
    },
    {
      id: 'advanced' as ExampleType,
      title: 'Advanced Usage',
      description: 'Complex scenarios, performance optimization, and best practices',
      component: AdvancedUsageExample,
    },
  ];

  const CurrentExampleComponent = examples.find(ex => ex.id === currentExample)?.component || BasicUsageExample;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>i18n Examples</Text>
        <Text style={styles.headerSubtitle}>
          Current Language: {currentLanguage.toUpperCase()}
        </Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {examples.map((example) => (
            <TouchableOpacity
              key={example.id}
              style={[
                styles.tab,
                currentExample === example.id && styles.activeTab
              ]}
              onPress={() => setCurrentExample(example.id)}
            >
              <Text style={[
                styles.tabTitle,
                currentExample === example.id && styles.activeTabTitle
              ]}>
                {example.title}
              </Text>
              <Text style={[
                styles.tabDescription,
                currentExample === example.id && styles.activeTabDescription
              ]}>
                {example.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Example Content */}
      <View style={styles.content}>
        <CurrentExampleComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 150,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activeTabTitle: {
    color: '#fff',
  },
  tabDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
  },
  activeTabDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
});

// Export individual components for direct usage
export { AdvancedUsageExample, BasicUsageExample, LanguageSwitcherExample };

// Export the main index component as default
export default I18nExamplesIndex; 