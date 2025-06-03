import { AccountCard } from '@/components/account';
import { CategoryFilter, SearchBar } from '@/components/core';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AccountService } from '@/services/accountService';
import type { Account, AccountCategory } from '@/types/auth';
import { useFocusEffect } from '@react-navigation/native';
import { Shield } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  InteractionManager,
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

// Error Boundary for AccountCard
class AccountCardErrorBoundary extends React.Component<
  { children: React.ReactNode; account: Account },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; account: Account }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('AccountCard Error:', error, 'Account:', this.props.account.id);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Error loading account</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();
  
  // State management with performance optimization
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AccountCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for performance optimization
  const flatListRef = useRef<FlatList>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isUnmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Clean up expired temporary accounts
  const cleanupExpiredAccounts = useCallback(async () => {
    try {
      const currentAccounts = await AccountService.getAccounts();
      const now = new Date();
      const expiredAccounts: string[] = [];
      
      // Find expired accounts
      currentAccounts.forEach(account => {
        if (account.isTemporary && account.expiresAt && account.expiresAt <= now) {
          expiredAccounts.push(account.id);
        }
      });
      
      // Delete expired accounts one by one
      for (const accountId of expiredAccounts) {
        await AccountService.deleteAccount(accountId);
      }
      
      // Return updated accounts
      return await AccountService.getAccounts();
    } catch (error) {
      console.error('Error cleaning up expired accounts:', error);
      return await AccountService.getAccounts();
    }
  }, []);

  // Periodic cleanup for expired accounts
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      if (!isUnmountedRef.current) {
        try {
          const updatedAccounts = await cleanupExpiredAccounts();
          setAccounts(updatedAccounts);
        } catch (error) {
          console.error('Error in periodic cleanup:', error);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(cleanupInterval);
  }, [cleanupExpiredAccounts]);

  // Load accounts with performance optimization
  const loadAccounts = useCallback(async (showRefreshIndicator = false) => {
    if (isUnmountedRef.current) return;
    
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Use InteractionManager to avoid blocking UI
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => {
          resolve();
        });
      });

      // Clean up expired accounts first
      const loadedAccounts = await cleanupExpiredAccounts();
      
      if (!isUnmountedRef.current) {
        setAccounts(loadedAccounts);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      if (!isUnmountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      }
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [cleanupExpiredAccounts]);

  // Initial load
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Listen for focus events to refresh accounts when returning from other screens
  useFocusEffect(
    useCallback(() => {
      // Refresh accounts when this screen is focused
      const refreshOnFocus = async () => {
        try {
          await AccountService.refreshAccounts();
          await loadAccounts();
        } catch (error) {
          console.warn('Failed to refresh accounts on focus:', error);
        }
      };
      
      refreshOnFocus();
    }, [loadAccounts])
  );

  // Filter accounts with debouncing and memoization
  const filterAccounts = useCallback((accountsList: Account[], category: AccountCategory, query: string) => {
    let filtered = accountsList;

    // Filter by category
    if (category !== 'All') {
      filtered = filtered.filter(account => account.category === category);
    }

    // Filter by search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase().trim();
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(lowercaseQuery) ||
        account.email.toLowerCase().includes(lowercaseQuery) ||
        (account.issuer && account.issuer.toLowerCase().includes(lowercaseQuery))
      );
    }

    return filtered;
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        const filtered = filterAccounts(accounts, selectedCategory, searchQuery);
        setFilteredAccounts(filtered);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [accounts, selectedCategory, searchQuery, filterAccounts]);

  // Memoized handlers
  const handleCategoryChange = useCallback((category: AccountCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRefresh = useCallback(() => {
    loadAccounts(true);
  }, [loadAccounts]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Optional: Add scroll-based optimizations here
  }, []);

  const handleAccountUpdate = useCallback(async (accountId: string, newName: string) => {
    try {
      await AccountService.updateAccountName(accountId, newName);
      // Reload accounts to reflect the change
      await loadAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }, [loadAccounts]);

  const handleAccountDelete = useCallback(async (accountId: string) => {
    try {
      await AccountService.deleteAccount(accountId);
      // Update local state immediately
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      setFilteredAccounts(prev => prev.filter(account => account.id !== accountId));
    } catch (error) {
      console.error('Error deleting account:', error);
      // Reload accounts to ensure consistency
      await loadAccounts();
    }
  }, [loadAccounts]);

  // Memoized render functions
  const renderAccountCard = useCallback(({ item }: { item: Account }) => (
    <AccountCardErrorBoundary account={item}>
      <AccountCard 
        account={item} 
        onAccountUpdate={handleAccountUpdate}
        onAccountDelete={handleAccountDelete}
      />
    </AccountCardErrorBoundary>
  ), [handleAccountUpdate, handleAccountDelete]);

  const keyExtractor = useCallback((item: Account) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 120, // Approximate height of AccountCard
    offset: 120 * index,
    index,
  }), []);

  // Memoized components
  const headerComponent = useMemo(() => (
    <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Shield size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('app.name')}
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        placeholder={t('search.placeholder')}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </View>
  ), [colors, t, searchQuery, selectedCategory, handleSearchChange, handleCategoryChange]);

  const emptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Shield size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery || selectedCategory !== 'All' 
          ? t('accounts.noResults') 
          : t('accounts.empty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery || selectedCategory !== 'All'
          ? t('accounts.tryDifferentSearch')
          : t('accounts.addFirst')}
      </Text>
    </View>
  ), [colors, t, searchQuery, selectedCategory]);

  const errorComponent = useMemo(() => (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorTitle, { color: colors.error }]}>
        {t('error.title')}
      </Text>
      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={() => loadAccounts()}
      >
        <Text style={[styles.retryButtonText, { color: colors.background }]}>
          {t('error.retry')}
        </Text>
      </TouchableOpacity>
    </View>
  ), [colors, t, error, loadAccounts]);

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={false}
        />
        {errorComponent}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      
      <FlatList
        ref={flatListRef}
        data={filteredAccounts}
        renderItem={renderAccountCard}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={isLoading ? null : emptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
