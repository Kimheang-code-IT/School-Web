import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { formatPrice } from '../utils/priceUtils.jsx';
import { X, CreditCard, User, MapPin, Mail, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import ErrorDialog from './ErrorDialog.jsx';
// Note: Checkout submission is disabled without backend API

const CheckoutDrawer = ({ isOpen, onClose }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { setIsCartOpen, setIsCheckoutOpen } = useUI();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const termsModalRef = useRef(null);
  const termsModalCloseRef = useRef(null);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    province: 'phnom_penh',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    delivery: 'standard',
    newsletter: false,
    terms: false,
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const firstErrorRef = useRef(null);

  // Focus management for checkout drawer
  useEffect(() => {
    if (isOpen) {
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
      
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
    }
  }, [isOpen]);

  // Focus management and scroll lock for terms modal
  useEffect(() => {
    if (showTermsModal) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // Focus modal close button
      if (termsModalCloseRef.current) {
        setTimeout(() => {
          termsModalCloseRef.current?.focus();
        }, 100);
      }
      
      // Trap focus within modal
      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = termsModalRef.current?.querySelectorAll(
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
        
        // Close modal on Escape key
        if (e.key === 'Escape') {
          setShowTermsModal(false);
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [showTermsModal]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Format phone number - only store digits (without +855 prefix)
    if (name === 'phone') {
      // Remove all non-digits
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const scrollToFirstError = () => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    firstErrorRef.current = null;
    
    // Validate cart has items
    if (!items || items.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    const newErrors = {};
    let hasErrors = false;

    // Basic validation for firstName
    if (!formData.firstName || formData.firstName.trim().length === 0) {
      newErrors.firstName = 'Please enter your first name';
      hasErrors = true;
    }

    // Basic validation for lastName
    if (!formData.lastName || formData.lastName.trim().length === 0) {
      newErrors.lastName = 'Please enter your last name';
      hasErrors = true;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || formData.email.trim().length === 0) {
      newErrors.email = 'Please enter your email address';
      hasErrors = true;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Basic phone validation
    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = 'Please enter your phone number';
      hasErrors = true;
    } else if (formData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'Please enter a valid phone number';
      hasErrors = true;
    }

    // Validate address
    if (!formData.streetAddress || formData.streetAddress.trim().length < 5) {
      newErrors.streetAddress = 'Please enter a complete street address (at least 5 characters)';
      hasErrors = true;
    }

    // Basic province validation
    const allowedProvinces = [
      'phnom_penh', 'banteay_meanchey', 'battambang', 'kampong_cham', 'kampong_chhnang',
      'kampong_speu', 'kampong_thom', 'kampot', 'kandal', 'kep', 'koh_kong', 'kratie',
      'mondulkiri', 'oddar_meanchey', 'pailin', 'preah_sihanouk', 'preah_vihear', 'pursat',
      'ratanakiri', 'siem_reap', 'stung_treng', 'svay_rieng', 'takeo', 'tboung_khmum', 'prey_veng'
    ];
    if (!formData.province || !allowedProvinces.includes(formData.province)) {
      newErrors.province = 'Please select a province';
      hasErrors = true;
    }

    // Basic delivery method validation
    const allowedDelivery = ['standard', 'express', 'overnight'];
    if (!formData.delivery || !allowedDelivery.includes(formData.delivery)) {
      newErrors.delivery = 'Please select a delivery method';
      hasErrors = true;
    }

    // Validate terms acceptance
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions to proceed';
      hasErrors = true;
    }

    // Basic security check - remove dangerous characters
    const allFields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.streetAddress,
      formData.notes
    ].filter(Boolean);
    
    for (const field of allFields) {
      if (field && (field.includes('<script') || field.includes('javascript:') || field.includes('onerror='))) {
        toast.error('Security validation failed. Please check your input.');
        return;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      // Show friendly summary toast
      const missingFields = Object.keys(newErrors);
      toast.error(`Please complete ${missingFields.length} required field${missingFields.length > 1 ? 's' : ''}`, {
        duration: 3000,
      });
      
      // Scroll to first error after a short delay
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirmDialog(false);
    setIsProcessing(true);

    try {
      // Prepare order items
      const orderItems = items.map(item => {
        // Handle price conversion - ensure it's a string for DecimalField
        const price = typeof item.product.price === 'string' 
          ? item.product.price 
          : String(parseFloat(item.product.price) || 0);
        
        return {
          product: item.product.id,
          quantity: item.quantity,
          price: price
        };
      });

      // Prepare order data matching backend OrderSerializer format
      const totalPrice = getTotalPrice();
      const formattedTotal = parseFloat(totalPrice.toFixed(2));
      
      const orderData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        customer_email: formData.email.trim(),
        customer_phone: formData.phone ? `+855${formData.phone.replace(/\D/g, '')}` : '+855',
        province: formData.province,
        street_address: formData.streetAddress.trim(),
        billing_address: formData.streetAddress 
          ? `${formData.streetAddress.trim()}, ${formData.province}` 
          : formData.province,
        status: 'pending',
        total_amount: String(formattedTotal),
        notes: formData.notes ? formData.notes.trim() : `Delivery method: ${formData.delivery}`,
        items: orderItems
      };

      // Create order via API
      // Note: Order submission is disabled without backend API
      toast.error('Order submission is currently unavailable. Please contact support directly.');
      setShowErrorDialog(true);
      return;
      
      // Reset form to initial state
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        streetAddress: '',
        province: 'phnom_penh',
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        delivery: 'standard',
        newsletter: false,
        terms: false,
        notes: ''
      });
      
      // Clear cart and show success
      clearCart();
      toast.success('Order placed successfully!');
      
      // Close checkout and cart
      onClose();
      setIsCartOpen(false);
      setIsCheckoutOpen(false);
      
      // Navigate to order confirmation page
      // Try to get order ID from response (could be id or order_number)
      const orderId = response?.id || response?.order_number || null;
      if (orderId) {
        navigate(`/order-confirmation/${orderId}`);
      } else {
        // Fallback: navigate to success page if no order ID
        navigate('/order-confirmation/SUCCESS');
      }
      
    } catch (error) {
      console.error('Order creation error:', error);
      
      // Clear all form data
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        streetAddress: '',
        province: 'phnom_penh',
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        delivery: 'standard',
        newsletter: false,
        terms: false,
        notes: ''
      });
      
      // Show error dialog instead of toast
      setShowErrorDialog(true);
    } finally {
      setIsProcessing(false);
    }
  };

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
      <div className="absolute inset-0 bg-black/35 transition-opacity duration-150 ease-out" />
      
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
        aria-labelledby="checkout-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 id="checkout-title" className="text-lg font-semibold text-gray-900">
            Checkout
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label="Close checkout"
            title="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Content */}
        <div className="flex flex-col h-full overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 checkout-scroll min-h-0" style={{overflowY: 'auto' }}>
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={errors.firstName && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.firstName}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={errors.lastName && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.lastName}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={errors.email && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex border rounded-lg overflow-hidden ${
                    errors.phone 
                      ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500' 
                      : 'border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500'
                  }`}>
                    <div className="bg-gray-100 px-3 py-2 flex items-center border-r border-gray-300">
                      <span className="text-gray-600 text-sm font-medium">+855</span>
                    </div>
                    <input
                      ref={errors.phone && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border-0 focus:outline-none focus:ring-0"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <div className="space-y-1">
                  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={errors.streetAddress && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    placeholder="Street Address"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.streetAddress 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  />
                  {errors.streetAddress && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.streetAddress}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={errors.province && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.province 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primary-500'
                    }`}
                  >
                  <option value="phnom_penh">Phnom Penh</option>
                  <option value="banteay_meanchey">Banteay Meanchey</option>
                  <option value="battambang">Battambang</option>
                  <option value="kampong_cham">Kampong Cham</option>
                  <option value="kampong_chhnang">Kampong Chhnang</option>
                  <option value="kampong_speu">Kampong Speu</option>
                  <option value="kampong_thom">Kampong Thom</option>
                  <option value="kampot">Kampot</option>
                  <option value="kandal">Kandal</option>
                  <option value="kep">Kep</option>
                  <option value="koh_kong">Koh Kong</option>
                  <option value="kratie">Kratie</option>
                  <option value="mondulkiri">Mondulkiri</option>
                  <option value="oddar_meanchey">Oddar Meanchey</option>
                  <option value="pailin">Pailin</option>
                  <option value="preah_sihanouk">Preah Sihanouk</option>
                  <option value="preah_vihear">Preah Vihear</option>
                  <option value="pursat">Pursat</option>
                  <option value="ratanakiri">Ratanakiri</option>
                  <option value="siem_reap">Siem Reap</option>
                  <option value="stung_treng">Stung Treng</option>
                  <option value="svay_rieng">Svay Rieng</option>
                  <option value="takeo">Takeo</option>
                  <option value="tboung_khmum">Tboung Khmum</option>
                  <option value="prey_veng">Prey Veng</option>
                </select>
                {errors.province && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{errors.province}</span>
                  </p>
                )}
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Delivery Options
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={formData.delivery === 'standard'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Standard Delivery</div>
                      <div className="text-sm text-gray-500">5-7 business days - Free</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={formData.delivery === 'express'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-gray-500">2-3 business days - $9.99</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery"
                      value="overnight"
                      checked={formData.delivery === 'overnight'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Overnight Delivery</div>
                      <div className="text-sm text-gray-500">Next business day - $19.99</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Additional Information
                </h3>
                <div className="space-y-1">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Special Instructions or Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Special instructions or notes (optional)"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <input 
                      ref={errors.terms && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="checkbox" 
                      id="terms" 
                      name="terms"
                      checked={formData.terms}
                      onChange={handleInputChange}
                      className={`rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                        errors.terms ? 'border-red-500' : ''
                      }`}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                      >
                        terms and conditions
                      </button>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-red-600 text-sm mt-1 ml-6 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.terms}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 space-y-4 flex-shrink-0">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(getTotalPrice())}</span>
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-center hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Complete Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && items && items.length > 0 && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmOrder}
          title="Confirm Order"
          message="Are you sure you want to complete this order?"
          confirmText="Yes, Complete Order"
          cancelText="No, Cancel"
          type="question"
        />
      )}

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false);
          onClose();
        }}
      />

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTermsModal(false);
            }
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            style={{
              animation: showTermsModal ? 'fadeIn 200ms ease-out' : 'fadeOut 200ms ease-in'
            }}
          />

          {/* Modal */}
          <div
            ref={termsModalRef}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col transform transition-all duration-300"
            style={{
              animation: showTermsModal ? 'modalSlideIn 300ms ease-out' : 'modalSlideOut 300ms ease-in',
              maxHeight: '90vh',
              height: 'auto'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-6 flex items-center justify-between z-10">
              <div>
                <h2 id="terms-modal-title" className="text-2xl font-bold mb-1">
                  Terms and Conditions
                </h2>
                <p className="text-blue-100 text-sm">Please read carefully before proceeding</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Close terms and conditions"
                ref={termsModalCloseRef}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto p-6 terms-scroll" 
              style={{ 
                minHeight: 0,
                maxHeight: '60vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="space-y-4 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Order Agreement</h3>
                  <p className="text-sm leading-relaxed">
                    By placing an order with us, you agree to abide by all terms and conditions outlined herein.
                    All orders are subject to product availability and our acceptance of your order.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Product Information</h3>
                  <p className="text-sm leading-relaxed">
                    We strive to provide accurate product descriptions, images, and pricing. However, we reserve 
                    the right to correct any errors, inaccuracies, or omissions and to change or update information 
                    at any time without prior notice.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Pricing and Payment</h3>
                  <p className="text-sm leading-relaxed">
                    All prices are displayed in USD and are subject to change without notice. Payment must be 
                    received in full before order processing. We accept various payment methods as indicated 
                    during checkout.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Shipping and Delivery</h3>
                  <p className="text-sm leading-relaxed">
                    Shipping costs and delivery times vary based on your location and selected delivery method. 
                    Delivery dates are estimates and not guaranteed. We are not responsible for delays caused 
                    by shipping carriers or customs.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Returns and Refunds</h3>
                  <p className="text-sm leading-relaxed">
                    Returns are accepted within 30 days of delivery for unused items in original packaging. 
                    Refund processing may take 5-10 business days after we receive and inspect the returned item. 
                    Shipping costs are non-refundable unless the item was defective or incorrect.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Order Cancellation</h3>
                  <p className="text-sm leading-relaxed">
                    You may cancel your order before it ships. Once an order has been shipped, cancellation is 
                    not possible, but you may return the item according to our return policy. We reserve the 
                    right to cancel any order at our discretion.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Privacy and Data Protection</h3>
                  <p className="text-sm leading-relaxed">
                    We are committed to protecting your personal information. All data collected during checkout 
                    will be used solely for order processing, shipping, and communication purposes, in accordance 
                    with our privacy policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Limitation of Liability</h3>
                  <p className="text-sm leading-relaxed">
                    Our liability for any claim arising from your purchase is limited to the purchase price of 
                    the product. We are not liable for any indirect, incidental, or consequential damages.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to Terms</h3>
                  <p className="text-sm leading-relaxed">
                    We reserve the right to modify these terms and conditions at any time. Changes will be 
                    effective immediately upon posting. Your continued use of our services constitutes acceptance 
                    of any changes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">10. Contact Information</h3>
                  <p className="text-sm leading-relaxed">
                    For questions or concerns regarding these terms or your order, please contact our customer 
                    service team through the contact information provided on our website.
                  </p>
                </section>

                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                  <p className="text-sm text-blue-900 font-medium">
                    <strong>By checking the box above, you acknowledge that you have read, understood, and agree 
                    to be bound by these terms and conditions.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalSlideOut {
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
        /* Custom scrollbar styles */
        .checkout-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .checkout-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 5px;
        }
        .checkout-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
          border: 2px solid #f1f5f9;
        }
        .checkout-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .checkout-scroll::-webkit-scrollbar-thumb:active {
          background: #475569;
        }
        /* Firefox scrollbar */
        .checkout-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
        /* Terms modal scrollbar */
        .terms-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .terms-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .terms-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        .terms-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .terms-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
      `}} />
    </div>
  );
};

export default CheckoutDrawer;


