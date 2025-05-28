import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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

// Get device language
const getDeviceLanguage = () => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  // Map device language to supported languages
  if (deviceLanguage.startsWith('zh')) return 'zh';
  if (deviceLanguage.startsWith('es')) return 'es';
  return 'en'; // Default to English
};

// Language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (language: string) => void) => {
    try {
      // First try to get saved language from storage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
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
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

// Initialize i18n
i18n
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
    },
    
    debug: __DEV__, // Enable debug in development
  });

export default i18n; 