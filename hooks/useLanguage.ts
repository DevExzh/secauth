import { isInitialized } from '@/utils/i18n';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'en' | 'zh' | 'es';

export const useLanguage = () => {
  const { i18n, t: originalT } = useTranslation();

  // Safe translation function that returns key if i18n is not ready
  const t = useCallback((key: string, options?: any): string => {
    if (!isInitialized) {
      console.warn(`i18n not initialized yet, returning key: ${key}`);
      return key;
    }
    return originalT(key, options) as string;
  }, [originalT]);

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    if (!isInitialized) {
      console.warn('i18n not initialized yet, cannot change language');
      return;
    }
    try {
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  const getSupportedLanguages = useCallback(() => {
    return [
      { code: 'en' as const, name: isInitialized ? t('languages.en') : 'English' },
      { code: 'zh' as const, name: isInitialized ? t('languages.zh') : '中文' },
      { code: 'es' as const, name: isInitialized ? t('languages.es') : 'Español' },
    ];
  }, [t]);

  return {
    currentLanguage,
    changeLanguage,
    getSupportedLanguages,
    t,
  };
}; 