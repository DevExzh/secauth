import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SupportedLanguage = 'en' | 'zh' | 'es';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18n]);

  const getSupportedLanguages = useCallback(() => {
    return [
      { code: 'en' as const, name: t('languages.en') },
      { code: 'zh' as const, name: t('languages.zh') },
      { code: 'es' as const, name: t('languages.es') },
    ];
  }, [t]);

  return {
    currentLanguage,
    changeLanguage,
    getSupportedLanguages,
    t,
  };
}; 