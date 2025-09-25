import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en } from '../i18n/locales/en';
import { th } from '../i18n/locales/th';
import type { Language } from '../types';

type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  th,
};

// Simplified type for translation keys
export type TranslationKey = keyof typeof en | string;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, options?: { [key: string]: string | number }) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper to access nested keys like 'shiftSelector.morning' from a string path
const getNestedTranslation = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: TranslationKey, options?: { [key: string]: string | number }): string => {
    const currentTranslations = translations[language];
    
    // Try to get the translation using the key directly first
    let translation = (currentTranslations as any)[key];
    
    // If not found and key contains dots, try nested access
    if (translation === undefined && typeof key === 'string' && key.includes('.')) {
      translation = getNestedTranslation(currentTranslations, key);
    }
    
    // Fallback to English if not found in current language
    if (translation === undefined) {
      const englishTranslations = translations.en;
      translation = (englishTranslations as any)[key];
      
      if (translation === undefined && typeof key === 'string' && key.includes('.')) {
        translation = getNestedTranslation(englishTranslations, key);
      }
    }
    
    // Final fallback to the key itself
    if (translation === undefined) {
      translation = key;
    }
    
    // Handle string interpolation if options are provided
    if (options && typeof translation === 'string') {
      return Object.entries(options).reduce((str, [optionKey, value]) => {
        return str.replace(new RegExp(`{{${optionKey}}}`, 'g'), String(value));
      }, translation);
    }
    
    return String(translation);
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
