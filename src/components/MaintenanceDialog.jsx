import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, Phone } from 'lucide-react';

/**
 * Professional Maintenance/Updating Dialog
 * Shows when backend errors occur - displays as "Website Updating" like real websites
 */
const MaintenanceDialog = ({ isOpen, onRetry }) => {
  const modalRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-retry functionality
  useEffect(() => {
    if (!isOpen) return;

    const retryInterval = setInterval(async () => {
      setIsRetrying(true);
      try {
        const response = await fetch('/api/health/', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok || response.status === 401) {
          // Backend is back online (401 means it's responding, just needs auth)
          setIsRetrying(false);
          if (onRetry) {
            onRetry();
          }
        }
      } catch (error) {
        // Still offline, continue showing dialog
        setRetryCount(prev => prev + 1);
      } finally {
        setIsRetrying(false);
      }
    }, 10000); // Retry every 10 seconds

    return () => clearInterval(retryInterval);
  }, [isOpen, onRetry]);

  // Focus management and scroll lock
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Prevent all pointer events on body content
      const mainContent = document.querySelector('main');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      
      if (mainContent) mainContent.style.pointerEvents = 'none';
      if (header) header.style.pointerEvents = 'none';
      if (footer) footer.style.pointerEvents = 'none';
      
      // Focus first element
      if (modalRef.current) {
        setTimeout(() => {
          const firstFocusable = modalRef.current?.querySelector('button');
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }, 100);
      }
      
      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], a, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
              }
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        if (mainContent) mainContent.style.pointerEvents = '';
        if (header) header.style.pointerEvents = '';
        if (footer) footer.style.pointerEvents = '';
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('/api/health/', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok || response.status === 401) {
        if (onRetry) {
          onRetry();
        }
      } else {
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className="maintenance-dialog-container fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-indigo-900/95 backdrop-blur-md transition-opacity duration-300"
        style={{
          animation: isOpen ? 'fadeIn 300ms ease-out' : 'fadeOut 300ms ease-in',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 overflow-hidden"
        style={{
          animation: isOpen ? 'slideIn 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'slideOut 300ms ease-in'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
      >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Content */}
        <div className="p-8 sm:p-10">
          {/* Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                {isRetrying ? (
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                ) : (
                  <WifiOff className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 
            id="maintenance-title" 
            className="text-3xl font-bold text-gray-900 text-center mb-3"
          >
            Website Updating
          </h2>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg mb-2">
              We're currently updating our website{dots}
            </p>
            <p className="text-gray-500 text-sm">
              Please wait a moment while we complete the update
            </p>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex items-center justify-center space-x-3 text-blue-700">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isRetrying ? 'Checking connection...' : 'Auto-retrying in a few seconds'}
              </span>
            </div>
            {retryCount > 0 && (
              <p className="text-xs text-blue-600 text-center mt-2">
                Attempt {retryCount} - Still updating...
              </p>
            )}
          </div>

          {/* Manual Retry Button */}
          <button
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Wifi className="w-5 h-5" />
                <span>Check Again</span>
              </>
            )}
          </button>

          {/* Contact Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-gray-600 text-center mb-3 font-medium">
                Need immediate assistance?
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <a 
                  href="tel:0962943472"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-semibold text-lg"
                >
                  096 294 3472
                </a>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-400 text-center mt-6">
            This usually takes just a few moments
          </p>
        </div>

        {/* Bottom Decorative Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .transition-transform, .transition-opacity, .animate-spin, .animate-ping {
            animation: none !important;
            transition: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default MaintenanceDialog;

