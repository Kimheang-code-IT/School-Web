import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';

const LanguageDropdown = ({ isOpen, onClose, triggerRef }) => {
  const { currentLanguage, setLanguage, languages, t } = useTranslation();
  const dropdownRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  // Default languages fallback (if API fails)
  const defaultLanguages = [
    { code: 'en', name: 'English', flagImage: '/english.png' },
    { code: 'km', name: 'ខ្មែរ', flagImage: '/cambodia.png' },
    { code: 'zh', name: '中文', flagImage: '/chinese.png' },
  ];

  // Map language codes to flag images
  const getLanguageDisplay = (code) => {
    const displayMap = {
      'en': { name: 'English', flagImage: '/english.png' },
      'km': { name: 'ខ្មែរ', flagImage: '/cambodia.png' },
      'zh': { name: '中文', flagImage: '/chinese.png' },
    };
    return displayMap[code] || { name: code.toUpperCase(), flagImage: '/english.png' };
  };

  // Get languages from API or use defaults
  const availableLanguages = languages && languages.length > 0 
    ? languages
        .filter(lang => ['en', 'km', 'zh'].includes(lang.code))
        .map(lang => ({
          code: lang.code,
          name: lang.name,
          flagImage: getLanguageDisplay(lang.code).flagImage
        }))
    : defaultLanguages;

  // Update selected language when currentLanguage changes
  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
      
      // Trap focus within dropdown
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = dropdownRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    } else {
      // Return focus to trigger
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen, triggerRef]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    if (setLanguage && typeof setLanguage === 'function') {
      setLanguage(languageCode);
      setSelectedLanguage(languageCode);
      
      // Close dropdown after a short delay
      setTimeout(() => {
        onClose();
      }, 150);
    } else {
      console.error('setLanguage is not a function');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-40"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-transparent" />
      
      {/* Dropdown */}
      <div 
        ref={dropdownRef}
        className="absolute right-0 top-20 w-auto bg-white shadow-xl rounded-xl border border-gray-200 transform transition-all duration-200 ease-out p-3 backdrop-blur-sm z-50"
        style={{
          animation: isOpen ? 'slideInDown 200ms ease-out' : 'slideOutUp 200ms ease-in',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        role="menu"
        aria-label="Select Language"
      >
        {/* Language Options - Flags Only */}
        <div className="flex flex-col gap-2.5">
          {availableLanguages.map((language, index) => (
            <button
              key={language.code}
              ref={index === 0 ? firstFocusableRef : null}
              onClick={() => handleLanguageSelect(language.code)}
              className={`group relative w-14 h-10 rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                selectedLanguage === language.code 
                  ? 'shadow-lg scale-105 opacity-100' 
                  : 'hover:shadow-md hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              role="menuitemradio"
              aria-checked={selectedLanguage === language.code}
              aria-label={language.name}
              title={language.name}
            >
              <img
                src={language.flagImage}
                alt={`${language.name} flag`}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  selectedLanguage === language.code ? '' : 'group-hover:scale-110'
                }`}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-bold text-gray-700">${language.code.toUpperCase()}</div>`;
                }}
              />
              {/* Hover overlay */}
              {selectedLanguage !== language.code && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 " />
              )}
            </button>
          ))}
        </div>
        
        {/* Tooltip hint */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {t('language.select', 'Select Language')}
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInDown {
          from { 
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideOutUp {
          from { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to { 
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .transition-all {
            transition: none;
          }
        }
      `}} />
    </div>
  );
};

export default LanguageDropdown;
