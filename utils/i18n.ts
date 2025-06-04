import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

// Import translation files
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';
import zhCommon from '../locales/zh/common.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

// Language resources
const resources = {
  en: {
    common: enCommon,
  },
  zh: {
    common: zhCommon,
  },
  es: {
    common: esCommon,
  },
};

// Safe storage operations with platform detection
const safeStorageOperations = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Ensure we're not running in a web context where window doesn't exist
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      // Ensure we're not running in a web context where window doesn't exist
      if (Platform.OS === 'web' && typeof window === 'undefined') {
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
};

// Get device language
const getDeviceLanguage = () => {
  try {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    // Map device language to supported languages
    if (deviceLanguage.startsWith('zh')) return 'zh';
    if (deviceLanguage.startsWith('es')) return 'es';
    return 'en'; // Default to English
  } catch (error) {
    console.error('Error getting device language:', error);
    return 'en';
  }
};

// Language detector with improved async handling
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (language: string) => void) => {
    // Use setTimeout to ensure this runs after current execution cycle
    setTimeout(async () => {
      try {
        // First try to get saved language from storage
        const savedLanguage = await safeStorageOperations.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && Object.keys(resources).includes(savedLanguage)) {
          callback(savedLanguage);
          return;
        }
        
        // Fall back to device language
        const deviceLanguage = getDeviceLanguage();
        callback(deviceLanguage);
      } catch (error) {
        console.error('Error detecting language:', error);
        callback('en'); // Default fallback
      }
    }, 0);
  },
  init: () => {},
  cacheUserLanguage: (language: string) => {
    // Use setTimeout to defer the storage operation
    setTimeout(async () => {
      try {
        await safeStorageOperations.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }, 0);
  },
};

// Track initialization status
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Initialize i18n with improved error handling and deferred execution
const initI18n = () => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise<void>((resolve) => {
    // Use setTimeout to ensure initialization happens after current execution cycle
    setTimeout(async () => {
      try {
        await i18n
          .use(languageDetector)
          .use(initReactI18next)
          .init({
            resources,
            fallbackLng: 'en',
            defaultNS: 'common',
            ns: ['common'],
            
            interpolation: {
              escapeValue: false, // React already escapes values
            },
            
            react: {
              useSuspense: false, // Disable suspense for React Native
              bindI18n: 'languageChanged loaded', // Optimize re-rendering
              bindI18nStore: false, // Disable store binding for performance
            },
            
            debug: false, // Disable debug to prevent excessive logging
            
            // Reduce logging
            saveMissing: false,
            missingKeyHandler: false,
            
            // Optimize performance
            load: 'languageOnly',
            cleanCode: true,
            
            // Prevent excessive interpolation calls
            returnObjects: false,
            returnEmptyString: true,
            returnNull: false,
            
            // Additional performance optimizations
            initImmediate: false, // Don't block on init
            nonExplicitSupportedLngs: false, // Only use explicitly defined languages
          });
        
        isInitialized = true;
        resolve();
      } catch (error) {
        console.error('i18n initialization failed:', error);
        isInitialized = true; // Set to true to prevent infinite loading
        resolve(); // Always resolve to prevent app crash
      }
    }, 0);
  });

  return initPromise;
};

// Start initialization with proper timing
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(() => {
    initI18n();
  });
} else {
  // Fallback for environments without requestAnimationFrame
  setTimeout(() => {
    initI18n();
  }, 0);
}

export { initPromise, isInitialized };
export default i18n; 