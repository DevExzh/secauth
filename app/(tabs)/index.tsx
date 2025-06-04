import { AccountCard } from '@/components/account';
import { AccountTypeFilter, CategoryFilter, SearchBar } from '@/components/core';
import type { AccountTypeFilterValue } from '@/components/core/AccountTypeFilter';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { AccountService } from '@/services/accountService';
import type { Account, AccountCategory } from '@/types/auth';
import { useFocusEffect } from '@react-navigation/native';
import { Shield } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
  View
} from 'react-native';
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
} from 'react-native-draggable-flatlist';

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
  const [selectedType, setSelectedType] = useState<AccountTypeFilterValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Refs for performance optimization
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isUnmountedRef = useRef(false);
  const scrollOffset = useRef(0);
  const searchBarOpacity = useRef(new Animated.Value(0)).current;

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
  const filterAccounts = useCallback((accountsList: Account[], category: AccountCategory, type: AccountTypeFilterValue, query: string) => {
    let filtered = accountsList;

    // Filter by type first
    switch (type) {
      case 'otp':
        filtered = filtered.filter(account => !account.isTemporary);
        break;
      case 'temporary':
        filtered = filtered.filter(account => account.isTemporary);
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

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
        const filtered = filterAccounts(accounts, selectedCategory, selectedType, searchQuery);
        setFilteredAccounts(filtered);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [accounts, selectedCategory, selectedType, searchQuery, filterAccounts]);

  // Memoized handlers
  const handleCategoryChange = useCallback((category: AccountCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleTypeChange = useCallback((type: AccountTypeFilterValue) => {
    setSelectedType(type);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Show/hide search bar based on scroll position
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    console.log('Scroll offset:', currentOffset); // Debug log
    
    // Show search bar when pulling down from the top
    if (currentOffset < -10) {
      console.log('Showing search bar - pulled down'); // Debug log
      if (!showSearchBar) {
        setShowSearchBar(true);
        searchBarOpacity.setValue(1); // Set immediately
      }
    }
    // Hide search bar when scrolling down (more sensitive)
    else if (currentOffset > 20 && showSearchBar) {
      console.log('Hiding search bar - scrolled down'); // Debug log
      Animated.timing(searchBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSearchBar(false);
      });
    }
    
    scrollOffset.current = currentOffset;
  }, [searchBarOpacity, showSearchBar]);

  // Also show search bar when refresh control is triggered
  const handleRefreshControlPull = useCallback(() => {
    console.log('Refresh control triggered'); // Debug log
    setShowSearchBar(true);
    searchBarOpacity.setValue(1); // Set immediately instead of animating
    loadAccounts(true);
  }, [loadAccounts, searchBarOpacity]);

  // Handle drag and drop for reordering
  const handleDragEnd = useCallback(async ({ data }: DragEndParams<Account>) => {
    try {
      // Separate temporary and regular accounts
      const regularAccounts = data.filter((account: Account) => !account.isTemporary);
      
      // Only update order for regular accounts (temporary accounts maintain their order)
      if (regularAccounts.length > 0) {
        const regularAccountIds = regularAccounts.map((account: Account) => account.id);
        await AccountService.updateAccountOrder(regularAccountIds);
      }
      
      // Update local state
      setFilteredAccounts(data);
      
      // Reload accounts to ensure consistency
      await loadAccounts();
    } catch (error) {
      console.error('Error updating account order:', error);
      // Reload accounts on error to ensure consistency
      await loadAccounts();
    }
  }, [loadAccounts]);

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
  const renderAccountCard = useCallback(({ item, drag, isActive }: RenderItemParams<Account>) => (
    <AccountCardErrorBoundary account={item}>
      <AccountCard 
        account={item} 
        onAccountUpdate={handleAccountUpdate}
        onAccountDelete={handleAccountDelete}
        onLongPress={item.isTemporary ? undefined : drag}
        isDragging={isActive}
      />
    </AccountCardErrorBoundary>
  ), [handleAccountUpdate, handleAccountDelete]);

  const keyExtractor = useCallback((item: Account) => item.id, []);

  // Memoized components
  const emptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Shield size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {searchQuery || selectedCategory !== 'All' || selectedType !== 'all'
          ? t('accounts.noResults') 
          : t('accounts.empty')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery || selectedCategory !== 'All' || selectedType !== 'all'
          ? t('accounts.tryDifferentSearch')
          : t('accounts.addFirst')}
      </Text>
    </View>
  ), [colors, t, searchQuery, selectedCategory, selectedType]);

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

  // Handle scroll begin drag
  const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    console.log('Scroll begin drag, offset:', currentOffset);
    
    // If we're at the top and user starts dragging, show search bar immediately
    if (currentOffset <= 0) {
      console.log('Starting drag from top - showing search bar');
      setShowSearchBar(true);
      searchBarOpacity.setValue(1);
    }
    // If we're not at the top and search bar is visible, hide it
    else if (currentOffset > 20 && showSearchBar) {
      console.log('Starting drag from non-top position - hiding search bar');
      Animated.timing(searchBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSearchBar(false);
      });
    }
  }, [searchBarOpacity, showSearchBar]);

  // Handle momentum scroll
  const handleMomentumScrollBegin = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    console.log('Momentum scroll begin, offset:', currentOffset);
    
    // Hide search bar if we're scrolled down
    if (currentOffset > 20) {
      console.log('Hiding search bar during momentum scroll');
      Animated.timing(searchBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSearchBar(false);
      });
    }
  }, [searchBarOpacity]);

  // Handle momentum scroll end
  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    console.log('Momentum scroll end, offset:', currentOffset);
    
    // Hide search bar if we're scrolled down
    if (currentOffset > 20) {
      console.log('Hiding search bar after momentum scroll');
      Animated.timing(searchBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSearchBar(false);
      });
    }
  }, [searchBarOpacity]);

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <View style={styles.logoSection}>
          <Shield size={24} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.text }]}>
            {t('app.name')}
          </Text>
        </View>
        
        <View style={styles.categorySection}>
          <View style={styles.categoryFilterContainer}>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </View>
          <AccountTypeFilter
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
          />
        </View>
      </View>

      {/* Search Bar (conditional) */}
      {showSearchBar && (
        <Animated.View 
          style={[
            styles.searchBarContainer, 
            { 
              backgroundColor: colors.background,
              opacity: searchBarOpacity,
            }
          ]}
        >
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder={t('search.placeholder')}
          />
        </Animated.View>
      )}
      
      {/* Main Content */}
      <DraggableFlatList
        data={filteredAccounts}
        renderItem={renderAccountCard}
        keyExtractor={keyExtractor}
        ListEmptyComponent={isLoading ? null : emptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshControlPull}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onDragEnd={handleDragEnd}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
    paddingTop: 8,
  },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryFilterContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
