import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Yes, Confirm',
  cancelText = 'No, Cancel',
  type = 'question' // 'question', 'warning', 'info'
}) => {
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Focus management and scroll lock
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Focus confirm button after a short delay
      if (confirmButtonRef.current) {
        setTimeout(() => {
          confirmButtonRef.current?.focus();
        }, 100);
      }
      
      // Trap focus within modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
        
        // Close modal on Escape key
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-12 h-12 text-blue-500" />;
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <span className="text-3xl">?</span>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{
          animation: isOpen ? 'fadeIn 200ms ease-out' : 'fadeOut 200ms ease-in'
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300"
        style={{
          animation: isOpen ? 'confirmationSlideIn 300ms ease-out' : 'confirmationSlideOut 300ms ease-in'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 id="confirmation-title" className="text-2xl font-bold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close confirmation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Message */}
          <p className="text-gray-700 text-center mb-6 text-lg">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
          >
            {confirmText}
          </button>
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
        @keyframes confirmationSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes confirmationSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
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

export default ConfirmationDialog;

