import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from './index';
import { storage, STORAGE_KEYS } from '../utils/storage';

type Lang = 'en' | 'sw';

interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => Promise<void>;
  t: (key: string, params?: Record<string, any>) => string;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: async () => {},
  t: (k) => k,
  ready: false,
});

export const useLanguage = () => useContext(LanguageContext);

/**
 * Wraps the entire app. Re-renders all children when language changes.
 * Loads the saved language on startup, falls back to English.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getItem(STORAGE_KEYS.LANGUAGE);
        if (saved === 'en' || saved === 'sw') {
          await i18n.changeLanguage(saved);
          setLangState(saved);
        }
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang: Lang) => {
    await i18n.changeLanguage(lang);
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    setLangState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      const v = i18n.t(key, params);
      return typeof v === 'string' ? v : key;
    },
    [language], // re-create when language changes so t() returns new strings
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, ready }}>
      {children}
    </LanguageContext.Provider>
  );
};
