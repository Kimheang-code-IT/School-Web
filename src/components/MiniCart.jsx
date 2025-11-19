import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { formatPrice } from '../utils/priceUtils.jsx';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { ImageOff } from 'lucide-react';
import CheckoutDrawer from './CheckoutDrawer.jsx';

const MiniCart = ({ isOpen, onClose, triggerRef }) => {
  const { items, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const { isCheckoutOpen, setIsCheckoutOpen } = useUI();
  const { t } = useTranslation();
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

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
        className="fixed top-0 right-0 h-full w-full sm:w-96 max-w-sm bg-white shadow-xl transform transition-transform duration-280 ease-out flex flex-col"
        style={{
          animation: isOpen ? 'slideInRight 280ms cubic-bezier(0.4, 0, 0.2, 1)' : 'slideOutRight 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          maxHeight: '100vh'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="cart-title" className="text-lg font-semibold text-gray-900">
            {t('cart.title', 'Shopping Cart')}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label="Close cart"
            title="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">{t('cart.empty', 'Your cart is empty')}</p>
                <p className="text-gray-400 text-sm mt-1">{t('cart.empty_subtitle', 'Add some items to get started')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 cart-scroll min-h-0" style={{overflowY: 'auto' }}>
                {items.map((item) => {
                  const hasImage = item.product.image && item.product.image !== '/placeholder-product.jpg';
                  const showIcon = !hasImage || imageErrors[item.product.id];
                  
                  return (
                    <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {showIcon ? (
                          <ImageOff className="w-6 h-6 text-gray-400" />
                        ) : (
                          <img 
                            src={item.product.image} 
                            alt={item.product.title}
                            className="w-full h-full object-cover rounded-md"
                            onError={() => setImageErrors(prev => ({ ...prev, [item.product.id]: true }))}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.title}</h3>
                        <p className="text-sm text-gray-500">{formatPrice(item.product.price)}</p>
                      </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4 mb-8 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">{t('cart.total', 'Total')}</span>
                  <span className="text-lg font-bold text-primary-600">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold text-center hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15l3-3-3-3m5 0h3a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h3" />
                    </svg>
                    <span>{t('cart.checkout', 'Proceed to Checkout')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Checkout Drawer */}
      <CheckoutDrawer 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .transition-transform, .transition-opacity {
            transition: none;
          }
        }
        /* Custom scrollbar styles */
        .cart-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .cart-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 5px;
        }
        .cart-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
          border: 2px solid #f1f5f9;
        }
        .cart-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .cart-scroll::-webkit-scrollbar-thumb:active {
          background: #475569;
        }
        /* Firefox scrollbar */
        .cart-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
      `}} />
    </div>
  );
};

export default MiniCart;


