import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

export type AutoLockTimeout = 'immediate' | '1min' | '5min' | '15min' | '30min' | 'never';

export interface AutoLockSettings {
  enabled: boolean;
  timeout: AutoLockTimeout;
}

export class AutoLockService {
  private static readonly AUTO_LOCK_SETTINGS_KEY = 'auto_lock_settings';
  private static readonly LAST_ACTIVE_TIME_KEY = 'last_active_time';
  
  private static appStateSubscription: any = null;
  private static lockTimer: ReturnType<typeof setTimeout> | null = null;
  private static onLockRequired: (() => void) | null = null;
  private static isLocked = false;

  /**
   * Initialize auto-lock service
   */
  static async initialize(onLockRequiredCallback: () => void): Promise<void> {
    this.onLockRequired = onLockRequiredCallback;
    
    // Subscribe to app state changes
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    
    // Check if app should be locked on startup
    await this.checkLockStatus();
  }

  /**
   * Cleanup auto-lock service
   */
  static cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }

  /**
   * Get auto-lock settings
   */
  static async getSettings(): Promise<AutoLockSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.AUTO_LOCK_SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error getting auto-lock settings:', error);
    }
    
    // Default settings
    return {
      enabled: true,
      timeout: '5min'
    };
  }

  /**
   * Update auto-lock settings
   */
  static async updateSettings(settings: AutoLockSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.AUTO_LOCK_SETTINGS_KEY, JSON.stringify(settings));
      
      // Reset timer with new settings
      this.resetLockTimer();
    } catch (error) {
      console.error('Error updating auto-lock settings:', error);
      throw new Error('Failed to save auto-lock settings');
    }
  }

  /**
   * Get timeout in milliseconds
   */
  private static getTimeoutMs(timeout: AutoLockTimeout): number {
    switch (timeout) {
      case 'immediate':
        return 0;
      case '1min':
        return 60 * 1000;
      case '5min':
        return 5 * 60 * 1000;
      case '15min':
        return 15 * 60 * 1000;
      case '30min':
        return 30 * 60 * 1000;
      case 'never':
        return Infinity;
      default:
        return 5 * 60 * 1000; // Default to 5 minutes
    }
  }

  /**
   * Handle app state changes
   */
  private static handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App is going to background, save current time
      await this.saveLastActiveTime();
      this.startLockTimer();
    } else if (nextAppState === 'active') {
      // App is becoming active, check if it should be locked
      await this.checkLockStatus();
    }
  };

  /**
   * Save the last active time
   */
  private static async saveLastActiveTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LAST_ACTIVE_TIME_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving last active time:', error);
    }
  }

  /**
   * Check if app should be locked based on time elapsed
   */
  private static async checkLockStatus(): Promise<void> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.enabled || settings.timeout === 'never') {
        return;
      }

      const lastActiveTimeStr = await AsyncStorage.getItem(this.LAST_ACTIVE_TIME_KEY);
      if (!lastActiveTimeStr) {
        return;
      }

      const lastActiveTime = parseInt(lastActiveTimeStr, 10);
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastActiveTime;
      const timeoutMs = this.getTimeoutMs(settings.timeout);

      if (timeElapsed >= timeoutMs) {
        this.lockApp();
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  }

  /**
   * Start the lock timer
   */
  private static async startLockTimer(): Promise<void> {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }

    const settings = await this.getSettings();
    
    if (!settings.enabled || settings.timeout === 'never') {
      return;
    }

    const timeoutMs = this.getTimeoutMs(settings.timeout);
    
    if (timeoutMs === 0) {
      // Immediate lock
      this.lockApp();
      return;
    }

    if (timeoutMs !== Infinity) {
      this.lockTimer = setTimeout(() => {
        this.lockApp();
      }, timeoutMs);
    }
  }

  /**
   * Reset the lock timer (called when user interacts with app)
   */
  static resetLockTimer(): void {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }

  /**
   * Lock the app
   */
  private static lockApp(): void {
    if (!this.isLocked && this.onLockRequired) {
      this.isLocked = true;
      this.onLockRequired();
    }
  }

  /**
   * Unlock the app
   */
  static unlockApp(): void {
    this.isLocked = false;
    this.resetLockTimer();
  }

  /**
   * Check if app is currently locked
   */
  static getIsLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Manually trigger app lock
   */
  static async lockNow(): Promise<void> {
    await this.saveLastActiveTime();
    this.lockApp();
  }
} 