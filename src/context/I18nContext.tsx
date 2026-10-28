import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { translations, TranslationKey } from '../i18n/translations';

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => any;
  translationsObj: typeof translations.ru;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('rabota_tj_lang') as SupportedLanguage;
    return saved && (saved === 'ru' || saved === 'tg' || saved === 'kk') ? saved : 'ru';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('rabota_tj_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: TranslationKey): any => {
    const currentDict = translations[language] || translations.ru;
    return currentDict[key] ?? translations.ru[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translationsObj: translations[language] || translations.ru }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
