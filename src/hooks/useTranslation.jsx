import { useState, useContext, createContext, useEffect } from 'react';
import { get } from '../services/api.js';
import { ENDPOINTS } from '../api/endpoints.js';
import languagesData from '../data/languages.json';
import translationsData from '../data/translations.json';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Get initial language from localStorage or default to 'en' (English and Khmer only)
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-language');
      return (saved === 'en' || saved === 'km') ? saved : 'en';
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState({});
  const [languages, setLanguages] = useState(languagesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optional: load language list from API once on mount, fallback to static
  useEffect(() => {
    get(ENDPOINTS.LANGUAGES)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLanguages(data);
      })
      .catch(() => {});
  }, []);

  // Load translations when language changes: try API first, fallback to static JSON
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const fallback = () => {
      if (cancelled) return;
      const translationsForLanguage = translationsData[currentLanguage] || {};
      setTranslations(translationsForLanguage);
    };
    get(`${ENDPOINTS.TRANSLATIONS}?lang=${currentLanguage}`)
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setTranslations(data);
        } else {
          fallback();
        }
      })
      .catch(() => fallback())
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentLanguage]);

  // Update document language attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('langChange', { 
        detail: { language } 
      }));
    }
  };

  // Alias for compatibility
  const setLanguage = changeLanguage;

  const t = (key, defaultValue = key) => {
    if (!key || typeof key !== 'string') return defaultValue;
    const parts = key.split('.');
    let value = translations;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return defaultValue;
    }
    return typeof value === 'string' ? value : defaultValue;
  };

  const value = {
    currentLanguage,
    translations,
    languages,
    loading,
    error,
    changeLanguage,
    setLanguage, // Add alias for compatibility
    t,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;
