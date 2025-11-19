import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext.jsx';
import { useTranslation } from '../hooks/useTranslation.jsx';
import LanguageDropdown from './LanguageDropdown.jsx';
import MobileNavigation from './MobileNavigation.jsx';
import contactInfoData from '../data/contactInfo.json';
import telegramIcon from '../assets/image.png';

const ResponsiveHeader = () => {
  const { isCartOpen, setIsCartOpen, setIsRegistrationOpen } = useUI();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { t, currentLanguage } = useTranslation();
  const location = useLocation();

  // Get flag image for current language
  const getCurrentFlag = (code) => {
    const flagMap = {
      'en': '/english.png',
      'km': '/cambodia.png',
      'zh': '/chinese.png',
    };
    return flagMap[code] || '/english.png';
  };
  
  const languageButtonRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsLanguageOpen(false);
        setIsRegistrationOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setIsCartOpen, setIsRegistrationOpen]);

  // Navigation items
  const navigation = [
    { name: t('nav.home', 'Home'), href: '/' },
    { name: t('nav.shop', 'Shop'), href: '/shop' },
    { name: t('nav.courses', 'Courses'), href: '/courses' },
    { name: t('nav.contact', 'Contact'), href: '/contact' },
  ];

  const isActive = (href) => location.pathname === href;


  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200' 
            : 'bg-white border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/logo.png" 
                alt="ដំណាក់សិក្សា - Learning Platform"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  console.log('Logo failed to load, using fallback');
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-800 font-khmer-muol group-hover:text-primary-600 transition-colors">
                  ដំណាក់សិក្សា
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  LEARNING FOR GROWING
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => {
                // Get icon for each navigation item
                const getIcon = (href) => {
                  switch (href) {
                    case '/shop':
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/>
                          <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/>
                          <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>
                        </svg>
                      );
                    case '/courses':
                      return (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 7v14"/>
                          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
                        </svg>
                      );
                    default:
                      return null;
                  }
                };

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    {getIcon(item.href)}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Icons - Always visible */}
            <div className="flex items-center space-x-2 md:space-x-4">

              {/* Language - Always visible */}
              <button
                ref={languageButtonRef}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="relative p-1.5 text-gray-700 hover:text-primary-600 transition-all duration-200 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Change language"
                aria-expanded={isLanguageOpen}
                aria-controls="language-dropdown"
                title="Change language"
              >
                <div className="relative w-8 h-6 rounded-md overflow-hidden transition-all duration-200">
                  <img
                    src={getCurrentFlag(currentLanguage)}
                    alt={`${currentLanguage} flag`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-xs font-semibold">${currentLanguage.toUpperCase()}</div>`;
                    }}
                  />
                </div>
              </button>

              {/* Register - Always visible */}
              <button
                onClick={() => setIsRegistrationOpen(true)}
                className="flex items-center space-x-1 md:space-x-2 bg-primary-600 text-white px-2 py-1.5 md:px-4 md:py-2 rounded-md md:rounded-full hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Register for courses"
                title="Register for courses"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium hidden sm:inline">{t('nav.register', 'Register')}</span>
              </button>

              {/* Telegram Icon - Right after Register button */}
              {contactInfoData?.telegram_link && contactInfoData.telegram_link !== '#' && contactInfoData.telegram_link !== '' && (
                <a
                  href={contactInfoData.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-1.5 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group"
                  aria-label="Contact us on Telegram"
                  title="Contact us on Telegram"
                >
                  <div className="relative w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center">
                    {/* Telegram Logo - Using imported image */}
                    <img
                      src={telegramIcon}
                      alt="Telegram"
                      className="w-full h-full object-contain rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Telegram icon failed to load');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </a>
              )}

              {/* Mobile Menu - Only on mobile */}
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                aria-label="Open mobile menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
                title="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mini Cart Panel */}

      {/* Language Dropdown */}
      <LanguageDropdown 
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        triggerRef={languageButtonRef}
      />


      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        triggerRef={mobileMenuButtonRef}
        navigation={navigation}
        isActive={isActive}
      />
    </>
  );
};

export default ResponsiveHeader;


