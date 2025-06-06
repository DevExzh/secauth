import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { BiometricAuthService } from '@/services/biometricAuth';
import { getLogger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface SettingsState {
  // Security settings
  biometric: boolean;
  hasPinSet: boolean;
  
  // Preference settings  
  notifications: boolean;
  
  // Email settings
  emailAutoSync: boolean;
  emailNotifications: boolean;
  autoDeleteEmails: boolean;
  emailSyncFrequency: string;
  connectedEmailAccounts: number;
  
  // Theme (managed by useTheme hook)
  themeMode: 'light' | 'dark' | 'system';
}

interface SettingsContextType extends SettingsState {
  // Setters
  setBiometric: (value: boolean) => void;
  setHasPinSet: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setEmailAutoSync: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setAutoDeleteEmails: (value: boolean) => void;
  setEmailSyncFrequency: (value: string) => void;
  setConnectedEmailAccounts: (value: number) => void;
  
  // Complex handlers
  handleBiometricToggle: (value: boolean) => void;
  handleThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  handlePinSet: () => void;
  
  // Persistence
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = '@secauth_settings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logger = getLogger('contexts.settings');
  const { t } = useLanguage();
  const { themeMode, setTheme } = useTheme();
  
  // Settings state
  const [biometric, setBiometric] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailAutoSync, setEmailAutoSync] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDeleteEmails, setAutoDeleteEmails] = useState(true);
  const [emailSyncFrequency, setEmailSyncFrequency] = useState(t('syncFrequency.options.hourly.value'));
  const [connectedEmailAccounts, setConnectedEmailAccounts] = useState(2);

  // Save settings to AsyncStorage
  const saveSettings = useCallback(async () => {
    try {
      const settings = {
        biometric,
        hasPinSet,
        notifications,
        emailAutoSync,
        emailNotifications,
        autoDeleteEmails,
        emailSyncFrequency,
        connectedEmailAccounts,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      logger.error('保存设置失败', error as Error, { 
        operation: 'save_settings',
        settingsKeys: Object.keys({
          biometric, hasPinSet, notifications, emailAutoSync, 
          emailNotifications, autoDeleteEmails, emailSyncFrequency, 
          connectedEmailAccounts
        })
      });
    }
  }, [biometric, hasPinSet, notifications, emailAutoSync, emailNotifications, autoDeleteEmails, emailSyncFrequency, connectedEmailAccounts]);

  // Load settings from AsyncStorage
  const loadSettings = useCallback(async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setBiometric(parsed.biometric ?? false);
        setHasPinSet(parsed.hasPinSet ?? false);
        setNotifications(parsed.notifications ?? true);
        setEmailAutoSync(parsed.emailAutoSync ?? true);
        setEmailNotifications(parsed.emailNotifications ?? true);
        setAutoDeleteEmails(parsed.autoDeleteEmails ?? true);
        setEmailSyncFrequency(parsed.emailSyncFrequency ?? t('syncFrequency.options.hourly.value'));
        setConnectedEmailAccounts(parsed.connectedEmailAccounts ?? 2);
      }
    } catch (error) {
      logger.error('加载设置失败', error as Error, { 
        operation: 'load_settings',
        storageKey: SETTINGS_STORAGE_KEY
      });
    }
  }, [t]);

  // Initialize settings on mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Load from storage first
        await loadSettings();
        
        // Then check actual biometric/PIN status
        const [isBiometricEnabled, hasPIN] = await Promise.all([
          BiometricAuthService.isBiometricEnabled(),
          BiometricAuthService.hasPIN(),
        ]);
        setBiometric(isBiometricEnabled);
        setHasPinSet(hasPIN);
      } catch (error) {
        logger.error('初始化设置失败', error as Error, { 
          operation: 'initialize_settings'
        });
      }
    };

    initializeSettings();
  }, [loadSettings]);

  // Auto-save settings when they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Complex handlers
  const handleBiometricToggle = useCallback(async (value: boolean) => {
    try {
      await BiometricAuthService.setBiometricEnabled(value);
      setBiometric(value);
    } catch (error) {
      logger.error('切换生物识别失败', error as Error, { 
        operation: 'toggle_biometric',
        targetValue: value
      });
    }
  }, []);

  const handleThemeChange = useCallback((newThemeMode: 'light' | 'dark' | 'system') => {
    setTheme(newThemeMode);
  }, [setTheme]);

  const handlePinSet = useCallback(async () => {
    setHasPinSet(true);
    
    try {
      // Optionally re-check biometric availability
      const isAvailable = await BiometricAuthService.isAvailable();
      if (isAvailable && !biometric) {
        // Could show alert to enable biometric, but for now just set the flag
        logger.info('生物识别可用，用户可以启用', { 
          biometricAvailable: true,
          currentlyEnabled: biometric
        });
      }
    } catch (error) {
      logger.error('检查生物识别可用性失败', error as Error, { 
        operation: 'check_biometric_availability'
      });
    }
  }, [biometric]);

  const contextValue: SettingsContextType = {
    // State
    biometric,
    hasPinSet,
    notifications,
    emailAutoSync,
    emailNotifications,
    autoDeleteEmails,
    emailSyncFrequency,
    connectedEmailAccounts,
    themeMode,
    
    // Setters
    setBiometric,
    setHasPinSet,
    setNotifications,
    setEmailAutoSync,
    setEmailNotifications,
    setAutoDeleteEmails,
    setEmailSyncFrequency,
    setConnectedEmailAccounts,
    
    // Handlers
    handleBiometricToggle,
    handleThemeChange,
    handlePinSet,
    
    // Persistence
    saveSettings,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 