import { useState, useContext, createContext, useEffect } from 'react';
import languagesData from '../data/languages.json';
import translationsData from '../data/translations.json';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Get initial language from localStorage or default to 'en'
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-language');
      return saved || 'en';
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState({});
  const [languages] = useState(languagesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load translations when language changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const translationsForLanguage = translationsData[currentLanguage] || {};
      setTranslations(translationsForLanguage);
    } catch (err) {
      console.error(`Failed to load translations for ${currentLanguage}:`, err);
      setError(err.message);
      setTranslations({});
    } finally {
      setLoading(false);
    }
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
    // Return translation if available, otherwise return default value
    return translations[key] || defaultValue;
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
