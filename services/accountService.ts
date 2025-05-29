import { mockAccounts } from '@/constants/mockData';
import type { Account } from '@/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AccountService {
  private static readonly ACCOUNTS_KEY = 'accounts';
  private static accountsCache: Account[] | null = null;

  /**
   * Get all accounts
   */
  static async getAccounts(): Promise<Account[]> {
    try {
      if (this.accountsCache) {
        return this.accountsCache;
      }

      const stored = await AsyncStorage.getItem(this.ACCOUNTS_KEY);
      if (stored) {
        const accounts = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedAccounts = accounts.map((account: any) => ({
          ...account,
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt),
        }));
        this.accountsCache = parsedAccounts;
        return parsedAccounts;
      } else {
        // First time, use mock data
        await this.saveAccounts(mockAccounts);
        this.accountsCache = mockAccounts;
        return mockAccounts;
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      return mockAccounts;
    }
  }

  /**
   * Save accounts to storage
   */
  private static async saveAccounts(accounts: Account[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
      this.accountsCache = accounts;
    } catch (error) {
      console.error('Error saving accounts:', error);
      throw error;
    }
  }

  /**
   * Add a new account
   */
  static async addAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    const newAccounts = [...accounts, account];
    await this.saveAccounts(newAccounts);
  }

  /**
   * Update an existing account
   */
  static async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account> {
    const accounts = await this.getAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === accountId);
    
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const updatedAccount = {
      ...accounts[accountIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const newAccounts = [...accounts];
    newAccounts[accountIndex] = updatedAccount;
    
    await this.saveAccounts(newAccounts);
    return updatedAccount;
  }

  /**
   * Update account name
   */
  static async updateAccountName(accountId: string, newName: string): Promise<Account> {
    return this.updateAccount(accountId, { name: newName });
  }

  /**
   * Delete an account
   */
  static async deleteAccount(accountId: string): Promise<void> {
    const accounts = await this.getAccounts();
    const newAccounts = accounts.filter(acc => acc.id !== accountId);
    await this.saveAccounts(newAccounts);
  }

  /**
   * Get a specific account by ID
   */
  static async getAccountById(accountId: string): Promise<Account | null> {
    const accounts = await this.getAccounts();
    return accounts.find(acc => acc.id === accountId) || null;
  }

  /**
   * Clear cache to force reload from storage
   */
  static clearCache(): void {
    this.accountsCache = null;
  }
} 