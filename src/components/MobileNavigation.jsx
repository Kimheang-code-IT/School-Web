import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const MobileNavigation = ({ 
  isOpen, 
  onClose, 
  triggerRef, 
  navigation, 
  isActive, 
  cartCount, 
  displayCount 
}) => {
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
      
      // Trap focus within panel
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = panelRef.current?.querySelectorAll(
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

  // Handle navigation link click
  const handleNavClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/35 transition-opacity duration-150 ease-out"
        style={{
          animation: isOpen ? 'fadeIn 150ms ease-out' : 'fadeOut 150ms ease-in'
        }}
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform duration-280 ease-out"
        style={{
          animation: isOpen ? 'slideInLeft 280ms cubic-bezier(0.4, 0, 0.2, 1)' : 'slideOutLeft 280ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="ដំណាក់សិក្សា - Learning Platform"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-blue-800 font-khmer-muol">
                ដំណាក់សិក្សា
              </span>
              <span className="text-xs text-blue-600 font-medium">
                LEARNING FOR GROWING
              </span>
            </div>
          </div>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label="Close menu"
            title="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <nav className="flex-1 p-4 pb-8 space-y-1">
            <h2 id="mobile-nav-title" className="sr-only">Mobile Navigation</h2>
            {navigation.map((item) => {
              // Get icon for each navigation item
              const getIcon = (href) => {
                switch (href) {
                  case '/shop':
                    return (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/>
                        <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/>
                        <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/>
                      </svg>
                    );
                  case '/courses':
                    return (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  onClick={handleNavClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
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

        </div>
      </div>


      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideOutDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .transition-transform, .transition-opacity {
            transition: none;
          }
        }
      `}} />
    </div>
  );
};

export default MobileNavigation;


