import React, { createContext, useState, useContext, ReactNode } from 'react';
import { en } from '../i18n/locales/en';
import { th } from '../i18n/locales/th';
import type { Language } from '../types';

type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  th,
};

// Fix: The previous DottedKeys type alias caused a circular reference error in some TypeScript versions.
// This new implementation generates a union of all possible dotted paths for the translation keys
// (e.g., "modalLabels.employeeId") without causing circular dependency issues.
type DottedKeys<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends Record<string, any>
      ? `${K}.${DottedKeys<T[K]>}`
      : K
    : never;
}[keyof T];

export type TranslationKey = DottedKeys<typeof en>;

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

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: TranslationKey, options?: { [key: string]: string | number }): string => {
    // Fallback logic: Try the current language, then English, then the key itself.
    let text = getNestedTranslation(translations[language], key) 
      || getNestedTranslation(translations['en'], key) 
      || String(key);

    if (options && text) {
      Object.keys(options).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(options[k]));
      });
    }
    return text || String(key);
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
