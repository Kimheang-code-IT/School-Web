import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isCartOpen, isRegistrationOpen, isCheckoutOpen, isMobileMenuOpen } = useUI();

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hide button when cart, checkout, registration drawer, or mobile menu is open
  if (!isVisible || isCartOpen || isCheckoutOpen || isRegistrationOpen || isMobileMenuOpen) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-10 right-8 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50"
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTop;
