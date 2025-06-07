import { mockAccounts } from '@/constants/mockData';
import type { Account, AccountCategory } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';

const STORAGE_KEY = 'secauth_accounts';
const BATCH_SIZE = 10; // Process accounts in batches to avoid blocking

export class AccountService {
  private static cache: Account[] | null = null;
  private static isLoading = false;
  private static loadPromise: Promise<Account[]> | null = null;

  /**
   * Get all accounts with performance optimization and proper sorting
   */
  static async getAccounts(): Promise<Account[]> {
    // Return cached data if available
    if (this.cache) {
      return this.sortAccounts(this.cache);
    }

    // Return existing promise if already loading
    if (this.isLoading && this.loadPromise) {
      const accounts = await this.loadPromise;
      return this.sortAccounts(accounts);
    }

    this.isLoading = true;
    this.loadPromise = this.loadAccountsInternal();
    
    try {
      const accounts = await this.loadPromise;
      this.cache = accounts;
      return this.sortAccounts(accounts);
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * Sort accounts according to business rules:
   * 1. Temporary email codes at top, newest first (not reorderable)
   * 2. Regular OTP accounts below, ordered by custom order or creation time (reorderable)
   */
  private static sortAccounts(accounts: Account[]): Account[] {
    const temporaryAccounts = accounts
      .filter(account => account.isTemporary)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const regularAccounts = accounts
      .filter(account => !account.isTemporary)
      .sort((a, b) => {
        const aExtended = a as Account & { customOrder?: number };
        const bExtended = b as Account & { customOrder?: number };
        
        // Sort by custom order if available
        if (typeof aExtended.customOrder === 'number' && typeof bExtended.customOrder === 'number') {
          return aExtended.customOrder - bExtended.customOrder;
        }
        
        // If only one has custom order, prioritize it
        if (typeof aExtended.customOrder === 'number') {
          return -1;
        }
        if (typeof bExtended.customOrder === 'number') {
          return 1;
        }
        
        // If neither has custom order, sort by creation time (newest first for better UX)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    return [...temporaryAccounts, ...regularAccounts];
  }

  /**
   * Internal method to load accounts with batching and async delays
   */
  private static async loadAccountsInternal(): Promise<Account[]> {
    try {
      // Wait for interactions to complete to avoid blocking UI
      await new Promise<void>(resolve => {
        InteractionManager.runAfterInteractions(() => resolve());
      });

      // Add small delay to ensure UI is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to load from storage first
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const accounts = JSON.parse(storedData) as Account[];
        // Validate and process in batches
        return await this.processBatches(accounts);
      }

      // If no stored data, use mock data and save it
      const processedMockData = await this.processBatches(mockAccounts);
      
      // Save to storage asynchronously (don't wait)
      this.saveAccountsAsync(processedMockData).catch(error => {
        console.warn('Failed to save accounts to storage:', error);
      });

      return processedMockData;
    } catch (error) {
      console.error('Error loading accounts:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Process accounts in batches to avoid blocking the main thread
   */
  private static async processBatches(accounts: Account[]): Promise<Account[]> {
    const processedAccounts: Account[] = [];
    
    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batch = accounts.slice(i, i + BATCH_SIZE);
      
      // Process batch
      const processedBatch = batch.map(account => ({
        ...account,
        // Ensure all required fields are present
        id: account.id || `account_${Date.now()}_${Math.random()}`,
        category: account.category || 'Other' as AccountCategory,
        createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
        updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
      }));
      
      processedAccounts.push(...processedBatch);
      
      // Yield control back to the main thread between batches
      if (i + BATCH_SIZE < accounts.length) {
        await new Promise<void>(resolve => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
      }
    }
    
    return processedAccounts;
  }

  /**
   * Save accounts asynchronously without blocking
   */
  private static async saveAccountsAsync(accounts: Account[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error saving accounts:', error);
    }
  }

  /**
   * Add a new account with optimization
   */
  static async addAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    try {
      const newAccount: Account = {
        ...account,
        id: `account_${Date.now()}_${Math.random()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: account.category || 'Other',
      };

      const accounts = await this.getAccounts();
      const updatedAccounts = [...accounts, newAccount];
      
      // Update cache immediately
      this.cache = updatedAccounts;
      
      // Save to storage and wait for completion to ensure persistence
      await this.saveAccountsAsync(updatedAccounts);

      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  }

  /**
   * Add multiple accounts with optimization (batch operation)
   */
  static async addAccounts(accountsToAdd: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Account[]> {
    try {
      const now = new Date();
      const newAccounts: Account[] = accountsToAdd.map((account, index) => ({
        ...account,
        id: `account_${Date.now()}_${Math.random()}_${index}`,
        createdAt: now,
        updatedAt: now,
        category: account.category || 'Other',
      }));

      const accounts = await this.getAccounts();
      const updatedAccounts = [...accounts, ...newAccounts];
      
      // Update cache immediately
      this.cache = updatedAccounts;
      
      // Save to storage and wait for completion to ensure persistence
      await this.saveAccountsAsync(updatedAccounts);

      return newAccounts;
    } catch (error) {
      console.error('Error adding accounts:', error);
      throw error;
    }
  }

  /**
   * Update account name with optimization
   */
  static async updateAccountName(accountId: string, newName: string): Promise<Account> {
    try {
      const accounts = await this.getAccounts();
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }

      const updatedAccount = {
        ...accounts[accountIndex],
        name: newName,
        updatedAt: new Date(),
      };

      const updatedAccounts = [...accounts];
      updatedAccounts[accountIndex] = updatedAccount;
      
      // Update cache immediately
      this.cache = updatedAccounts;
      
      // Save to storage and wait for completion
      await this.saveAccountsAsync(updatedAccounts);

      return updatedAccount;
    } catch (error) {
      console.error('Error updating account name:', error);
      throw error;
    }
  }

  /**
   * Delete an account with optimization
   */
  static async deleteAccount(accountId: string): Promise<void> {
    try {
      const accounts = await this.getAccounts();
      const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
      
      // Update cache immediately
      this.cache = updatedAccounts;
      
      // Save to storage and wait for completion
      await this.saveAccountsAsync(updatedAccounts);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  /**
   * Get accounts by category with caching
   */
  static async getAccountsByCategory(category: AccountCategory): Promise<Account[]> {
    const accounts = await this.getAccounts();
    return accounts.filter(account => account.category === category);
  }

  /**
   * Search accounts with optimization
   */
  static async searchAccounts(query: string): Promise<Account[]> {
    const accounts = await this.getAccounts();
    const lowercaseQuery = query.toLowerCase();
    
    return accounts.filter(account =>
      account.name.toLowerCase().includes(lowercaseQuery) ||
      account.email.toLowerCase().includes(lowercaseQuery) ||
      (account.issuer && account.issuer.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Clear cache (useful for testing or force refresh)
   */
  static clearCache(): void {
    this.cache = null;
  }

  /**
   * Preload accounts (call this early in app lifecycle)
   */
  static preloadAccounts(): void {
    // Start loading accounts in background without waiting
    this.getAccounts().catch(error => {
      console.warn('Failed to preload accounts:', error);
    });
  }

  /**
   * Force refresh accounts from storage (bypass cache)
   */
  static async refreshAccounts(): Promise<Account[]> {
    this.clearCache();
    return await this.getAccounts();
  }

  /**
   * Update account order for drag and drop functionality
   */
  static async updateAccountOrder(accountIds: string[]): Promise<void> {
    try {
      console.log('updateAccountOrder: Updating order for accounts:', accountIds);
      
      const accounts = await this.getAccounts();
      console.log('updateAccountOrder: Current accounts count:', accounts.length);
      
      // Create a map of new orders for faster lookup
      const orderMap = new Map<string, number>();
      accountIds.forEach((id, index) => {
        orderMap.set(id, index);
      });
      
      console.log('updateAccountOrder: Order map:', Array.from(orderMap.entries()));
      
      const updatedAccounts = accounts.map(account => {
        if (orderMap.has(account.id) && !account.isTemporary) {
          const newOrder = orderMap.get(account.id)!;
          console.log(`updateAccountOrder: Setting customOrder ${newOrder} for account ${account.name} (${account.id})`);
          return {
            ...account,
            customOrder: newOrder,
            updatedAt: new Date(),
          } as Account & { customOrder: number };
        }
        return account;
      });
      
      // Update cache immediately
      this.cache = updatedAccounts;
      console.log('updateAccountOrder: Updated cache');
      
      // Save to storage
      await this.saveAccountsAsync(updatedAccounts);
      console.log('updateAccountOrder: Saved to storage');
    } catch (error) {
      console.error('Error updating account order:', error);
      throw error;
    }
  }

  /**
   * Get accounts filtered by type (OTP, temporary, or all)
   */
  static async getAccountsByType(type: 'otp' | 'temporary' | 'all'): Promise<Account[]> {
    const accounts = await this.getAccounts();
    
    switch (type) {
      case 'otp':
        return accounts.filter(account => !account.isTemporary);
      case 'temporary':
        return accounts.filter(account => account.isTemporary);
      case 'all':
      default:
        return accounts;
    }
  }
} 