import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import {
    ArrowLeft,
    Book,
    ChevronRight,
    HelpCircle,
    MessageCircle,
    Play,
    RefreshCw,
    Search,
    Settings,
    Shield,
    Users,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface HelpCenterScreenProps {
  onBack: () => void;
}

interface HelpCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  articles: string[];
}

export const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({
  onBack,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories: HelpCategory[] = [
    {
      id: 'setup',
      icon: <Settings size={24} color={colors.primary} />,
      title: t('helpCenter.categories.setup.title'),
      description: t('helpCenter.categories.setup.description'),
      articles: [
        t('helpCenter.articles.howToAddAccount'),
        'Getting started with SecAuth',
        'Setting up your first account',
      ],
    },
    {
      id: 'accounts',
      icon: <Users size={24} color={colors.primary} />,
      title: t('helpCenter.categories.accounts.title'),
      description: t('helpCenter.categories.accounts.description'),
      articles: [
        'Managing multiple accounts',
        'Organizing accounts by category',
        'Editing account information',
      ],
    },
    {
      id: 'security',
      icon: <Shield size={24} color={colors.primary} />,
      title: t('helpCenter.categories.security.title'),
      description: t('helpCenter.categories.security.description'),
      articles: [
        t('helpCenter.articles.biometricSetup'),
        'Setting up PIN protection',
        'Auto-lock configuration',
      ],
    },
    {
      id: 'sync',
      icon: <RefreshCw size={24} color={colors.primary} />,
      title: t('helpCenter.categories.sync.title'),
      description: t('helpCenter.categories.sync.description'),
      articles: [
        t('helpCenter.articles.cloudSyncSetup'),
        t('helpCenter.articles.importExportData'),
        'Email integration setup',
      ],
    },
    {
      id: 'troubleshooting',
      icon: <HelpCircle size={24} color={colors.primary} />,
      title: t('helpCenter.categories.troubleshooting.title'),
      description: t('helpCenter.categories.troubleshooting.description'),
      articles: [
        t('helpCenter.articles.troubleshootCodes'),
        'App not opening or crashing',
        'Sync issues and solutions',
      ],
    },
  ];

  const quickActions = [
    {
      icon: <Book size={20} color={colors.primary} />,
      title: t('helpCenter.userGuide'),
      onPress: () => console.log('Open user guide'),
    },
    {
      icon: <Play size={20} color={colors.primary} />,
      title: t('helpCenter.videoTutorials'),
      onPress: () => console.log('Open video tutorials'),
    },
    {
      icon: <MessageCircle size={20} color={colors.primary} />,
      title: t('helpCenter.contactSupport'),
      onPress: () => console.log('Contact support'),
    },
  ];

  const filteredCategories = helpCategories.filter(category =>
    searchQuery === '' ||
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('helpCenter.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <HelpCircle size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('helpCenter.title')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('helpCenter.description')}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('helpCenter.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={[styles.quickActionsContainer, { backgroundColor: colors.surface }]}>
            {quickActions.map((action, index) => (
              <View key={action.title}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  onPress={action.onPress}
                >
                  <View style={styles.quickActionIcon}>
                    {action.icon}
                  </View>
                  <Text style={[styles.quickActionTitle, { color: colors.text }]}>
                    {action.title}
                  </Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {index < quickActions.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {searchQuery ? 'Search Results' : 'Browse by Category'}
          </Text>
          
          {filteredCategories.length === 0 ? (
            <View style={[styles.noResultsContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.noResultsTitle, { color: colors.text }]}>
                {t('helpCenter.noResults')}
              </Text>
              <Text style={[styles.noResultsMessage, { color: colors.textSecondary }]}>
                {t('helpCenter.noResultsMessage')}
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesContainer}>
              {filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: colors.surface }]}
                  onPress={() => console.log('Open category:', category.id)}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIcon}>
                      {category.icon}
                    </View>
                    <View style={styles.categoryContent}>
                      <Text style={[styles.categoryTitle, { color: colors.text }]}>
                        {category.title}
                      </Text>
                      <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                        {category.description}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.textSecondary} />
                  </View>
                  
                  <View style={styles.articlesList}>
                    {category.articles.slice(0, 3).map((article, index) => (
                      <Text
                        key={index}
                        style={[styles.articleItem, { color: colors.textSecondary }]}
                      >
                        • {article}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('helpCenter.faq')}
          </Text>
          <View style={[styles.faqContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I add a new 2FA account?
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                Why are my codes not working?
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.faqItem}>
              <Text style={[styles.faqQuestion, { color: colors.text }]}>
                How do I backup my accounts?
              </Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
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
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickActionIcon: {
    marginRight: 12,
  },
  quickActionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  articlesList: {
    marginTop: 8,
  },
  articleItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  noResultsContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  faqContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
}); 