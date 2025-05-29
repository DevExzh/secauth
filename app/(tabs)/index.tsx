import { AccountCard } from '@/components/AccountCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/Colors';
import { mockAccounts } from '@/constants/mockData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import type { Account, AccountCategory } from '@/types/auth';
import { Bell, Settings, Shield } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>('All');
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef<number>(0);
  const scrollViewRef = useRef<FlatList>(null);

  const filteredAccounts = useMemo(() => {
    return mockAccounts.filter(account => {
      const matchesSearch = searchQuery === '' || 
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (account.issuer && account.issuer.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || account.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    
    // 如果滚动位置大于20，标记为已滚动，隐藏Welcome Section
    if (scrollY > 20 && !hasScrolled) {
      setHasScrolled(true);
      setShowSearchBar(false); // 滚动时隐藏搜索框
    }
  }, [hasScrolled]);

  const handleRefresh = useCallback(() => {
    // 下拉刷新时显示搜索框
    setIsRefreshing(true);
    setShowSearchBar(true);
    
    // 模拟刷新延迟
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  const handleCategoryChange = useCallback((category: AccountCategory) => {
    setSelectedCategory(category);
    // 重置搜索查询，因为用户改变了分类
    setSearchQuery('');
  }, []);

  const renderAccount = ({ item }: { item: Account }) => (
    <AccountCard account={item} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.appIconContainer, { backgroundColor: colors.primary }]}>
            <Shield size={24} color={colors.background} />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>
            {t('home.subtitle')}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Bell size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome Section - 只在未滚动时显示 */}
      {!hasScrolled && (
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            {t('home.title')}
          </Text>
          <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
            {t('home.description')}
          </Text>
        </View>
      )}

      {/* Search Bar - 只在下拉时显示 */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.search')}
          />
        </View>
      )}

      {/* Category Filter - 始终显示 */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Accounts List */}
      <View style={styles.listWrapper}>
        <FlatList
          ref={scrollViewRef}
          data={filteredAccounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            filteredAccounts.length === 0 && styles.emptyListContainer
          ]}
          style={styles.flatList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          onMomentumScrollBegin={() => {
            // 当开始滚动时，标记为已滚动
            if (!hasScrolled) {
              setHasScrolled(true);
              setShowSearchBar(false);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 90,
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
});
