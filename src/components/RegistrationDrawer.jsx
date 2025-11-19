import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Monitor, Building, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import ErrorDialog from './ErrorDialog.jsx';
import coursesData from '../data/courses.json';
import { GOOGLE_SCRIPT_URL, SECURITY_TOKEN } from '../config/googleSheets.js';

const RegistrationDrawer = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm();
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const termsModalRef = useRef(null);
  const termsModalCloseRef = useRef(null);
  const firstErrorRef = useRef(null);
  const [courseError, setCourseError] = useState(null);

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

  // Handle escape key for terms modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showTermsModal) {
        setShowTermsModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTermsModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showTermsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showTermsModal]);

  // Focus trap for terms modal
  useEffect(() => {
    if (showTermsModal && termsModalRef.current) {
      const modal = termsModalRef.current;
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
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
      };

      // Focus close button
      termsModalCloseRef.current?.focus();

      modal.addEventListener('keydown', handleTabKey);
      return () => modal.removeEventListener('keydown', handleTabKey);
    }
  }, [showTermsModal]);

  // Get course from URL params
  const courseId = searchParams.get('course');

  // Load courses from JSON data
  useEffect(() => {
    if (isOpen) {
      setLoadingCourses(true);
      try {
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses. Please try again.');
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }
  }, [isOpen]);


  // Set selected course and session from URL params
  useEffect(() => {
    if (courseId && courses.length > 0) {
      // Try to find by ID first, then by slug
      const course = courses.find(c => c.id === parseInt(courseId) || c.slug === courseId);
      if (course) {
        setSelectedCourse(course);
      }
    }
  }, [courseId, courses]);


  const scrollToFirstError = () => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorRef.current.focus();
    } else if (courseError) {
      // Scroll to course selection if that's the error
      setTimeout(() => {
        const courseSelect = document.querySelector('select[value=""]');
        if (courseSelect) {
          courseSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
          courseSelect.focus();
        }
      }, 100);
    }
  };

  const onSubmit = async (data) => {
    // Clear previous errors
    clearErrors();
    setCourseError(null);
    firstErrorRef.current = null;

    let hasErrors = false;
    const errorFields = [];

    // Validate course selection
    if (!selectedCourse) {
      setCourseError('Please select a course to continue');
      hasErrors = true;
      errorFields.push('course');
    }

    // Basic validation and sanitization
    try {
      // Validate and sanitize firstName
      if (!data.firstName || data.firstName.trim().length < 2) {
        setError('firstName', {
          type: 'manual',
          message: 'Please enter a valid first name (at least 2 characters)'
        });
        hasErrors = true;
        errorFields.push('firstName');
      } else {
        data.firstName = data.firstName.trim();
        // Basic security check
        if (data.firstName.includes('<script') || data.firstName.includes('javascript:')) {
          toast.error('Invalid characters in first name.');
          return;
        }
      }

      // Validate and sanitize lastName
      if (!data.lastName || data.lastName.trim().length < 2) {
        setError('lastName', {
          type: 'manual',
          message: 'Please enter a valid last name (at least 2 characters)'
        });
        hasErrors = true;
        errorFields.push('lastName');
      } else {
        data.lastName = data.lastName.trim();
        // Basic security check
        if (data.lastName.includes('<script') || data.lastName.includes('javascript:')) {
          toast.error('Invalid characters in last name.');
          return;
        }
      }

      // Validate and sanitize email (if provided)
      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email.trim())) {
          setError('email', {
            type: 'manual',
            message: 'Please enter a valid email address'
          });
          hasErrors = true;
          errorFields.push('email');
        } else {
          data.email = data.email.trim().toLowerCase();
        }
      }

      // Validate and sanitize phone
      const phoneDigits = data.phone ? data.phone.replace(/\D/g, '') : '';
      if (!phoneDigits || phoneDigits.length < 8) {
        setError('phone', {
          type: 'manual',
          message: 'Please enter a valid phone number (at least 8 digits)'
        });
        hasErrors = true;
        errorFields.push('phone');
      } else {
        data.phone = phoneDigits;
      }

      // Validate date of birth
      if (!data.dateOfBirth || !data.dateOfBirth.trim()) {
        setError('dateOfBirth', {
          type: 'manual',
          message: 'Please enter a valid date of birth'
        });
        hasErrors = true;
        errorFields.push('dateOfBirth');
      } else {
        data.dateOfBirth = data.dateOfBirth.trim();
      }

      // Validate dropdown selections
      const allowedGenders = ['male', 'female', 'other'];
      const allowedEducation = ['high_school', 'under_university', 'university', 'master'];
      const allowedSessionTimes = ['morning', 'afternoon', 'evening'];
      const allowedDeliveryModes = ['physical', 'online'];

      if (!data.gender || !allowedGenders.includes(data.gender)) {
        setError('gender', {
          type: 'manual',
          message: 'Please select a valid gender'
        });
        hasErrors = true;
        errorFields.push('gender');
      }
      if (!data.education || !allowedEducation.includes(data.education)) {
        setError('education', {
          type: 'manual',
          message: 'Please select a valid education level'
        });
        hasErrors = true;
        errorFields.push('education');
      }
      if (!data.sessionTime || !allowedSessionTimes.includes(data.sessionTime)) {
        setError('sessionTime', {
          type: 'manual',
          message: 'Please select a valid session time'
        });
        hasErrors = true;
        errorFields.push('sessionTime');
      }
      if (!data.deliveryMode || !allowedDeliveryModes.includes(data.deliveryMode)) {
        setError('deliveryMode', {
          type: 'manual',
          message: 'Please select a valid delivery mode'
        });
        hasErrors = true;
        errorFields.push('deliveryMode');
      }
      const allowedProvinces = [
        'phnom_penh', 'banteay_meanchey', 'battambang', 'kampong_cham', 'kampong_chhnang',
        'kampong_speu', 'kampong_thom', 'kampot', 'kandal', 'kep', 'koh_kong', 'kratie',
        'mondulkiri', 'oddar_meanchey', 'pailin', 'preah_sihanouk', 'preah_vihear', 'pursat',
        'ratanakiri', 'siem_reap', 'stung_treng', 'svay_rieng', 'takeo', 'tboung_khmum', 'prey_veng'
      ];
      if (!data.province || !allowedProvinces.includes(data.province)) {
        setError('province', {
          type: 'manual',
          message: 'Please select a valid province'
        });
        hasErrors = true;
        errorFields.push('province');
      }

      // Additional security check for SQL injection and XSS
      const allFields = [data.firstName, data.lastName, data.email, data.phone, data.province].filter(Boolean);
      for (const field of allFields) {
        if (field && (field.includes('<script') || field.includes('javascript:') || field.includes('onerror='))) {
          toast.error('Security validation failed. Please check your input.');
          return;
        }
      }

    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation error. Please check your input.');
      return;
    }

    if (hasErrors) {
      // Show friendly summary toast
      toast.error(`Please complete ${errorFields.length} required field${errorFields.length > 1 ? 's' : ''}`, {
        duration: 3000,
      });
      
      // Scroll to first error after a short delay
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
      return;
    }

    // Store form data and show confirmation dialog
    setPendingFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    if (!pendingFormData || !selectedCourse) {
      return;
    }

    setShowConfirmDialog(false);
    setIsLoading(true);

    const data = pendingFormData;

    try {
      // Format phone number with +855 if not already formatted
      let phoneNumber = data.phone.trim();
      if (!phoneNumber.startsWith('+855')) {
        // Remove leading 0 if present
        if (phoneNumber.startsWith('0')) {
          phoneNumber = phoneNumber.substring(1);
        }
        phoneNumber = `+855${phoneNumber}`;
      }

      const enrollmentData = {
        // Security token for authentication
        token: SECURITY_TOKEN,
        
        // Registration data
        course_id: selectedCourse.id,
        course_name: selectedCourse.title || selectedCourse.name || 'Unknown Course',
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        gender: data.gender,
        education: data.education,
        date_of_birth: data.dateOfBirth.trim(),
        email: data.email ? data.email.trim().toLowerCase() : '',
        phone: phoneNumber,
        province: data.province,
        session_time: data.sessionTime,
        delivery_mode: data.deliveryMode,
        terms_accepted: data.termsAccepted ? 'Yes' : 'No',
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Check if Google Script URL is configured
      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        toast.error('Registration system not configured. Please contact support.', {
          duration: 4000,
        });
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }

      // Check if security token is configured
      if (!SECURITY_TOKEN || SECURITY_TOKEN === 'REG_CHANGE_THIS_TO_SECURE_TOKEN_2024!@#$%^&*()') {
        toast.error('Registration system security not configured. Please contact support.', {
          duration: 4000,
        });
        setShowErrorDialog(true);
        setIsLoading(false);
        return;
      }

      // Prepare confirmation data (for invoice display)
      const confirmationData = {
        id: Date.now().toString(), // Generate a temporary ID
        student_name: `${enrollmentData.first_name} ${enrollmentData.last_name}`,
        student_email: enrollmentData.email,
        student_phone: enrollmentData.phone,
        course_name: enrollmentData.course_name,
        course_id: enrollmentData.course_id,
        province: enrollmentData.province,
        gender: enrollmentData.gender,
        education: enrollmentData.education,
        date_of_birth: enrollmentData.date_of_birth,
        delivery_mode: enrollmentData.delivery_mode,
        session_time: enrollmentData.session_time,
        status: enrollmentData.status,
        created_at: enrollmentData.timestamp,
        terms_accepted: enrollmentData.terms_accepted
      };

      // Save to sessionStorage FIRST so invoice can show immediately
      sessionStorage.setItem('latestEnrollment', JSON.stringify(confirmationData));
      console.log('✅ Enrollment data saved to sessionStorage:', confirmationData);

      // Reset form and clear state
      reset();
      setPendingFormData(null);
      setSelectedCourse(null);
      setIsLoading(false);

      // Close drawer
      onClose();

      // Navigate to confirmation page IMMEDIATELY to show invoice
      // Using navigate with replace to ensure smooth transition
      navigate('/enrollment-confirmation', { replace: true });

      // Show success toast
      toast.success('Registration submitted! Showing invoice...', {
        duration: 2000,
      });

      // Post to Google Sheets in the background (async, don't wait)
      (async () => {
        try {
          console.log('Sending registration data to Google Sheets:', enrollmentData);
          console.log('To URL:', GOOGLE_SCRIPT_URL);
          
          const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(enrollmentData)
          });

          // Try to read the response if available
          let responseData = null;
          try {
            const responseText = await response.text();
            if (responseText) {
              responseData = JSON.parse(responseText);
              console.log('Registration response from Google Sheets:', responseData);
            }
          } catch (parseError) {
            console.log('Could not parse response:', parseError);
          }

          // Check if we got a successful response
          if (response.ok || responseData?.success) {
            console.log('✅ Registration data saved to Google Sheets successfully!');
          } else {
            console.warn('⚠️ Google Sheets response indicates failure:', responseData);
            // Try fallback method
            await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(enrollmentData)
            });
            console.log('✅ Registration data sent with no-cors fallback');
          }
          
        } catch (fetchError) {
          console.error('❌ Registration fetch error:', fetchError);
          
          // Try alternative method with no-cors as fallback
          try {
            console.log('Retrying with no-cors mode...');
            await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(enrollmentData)
            });
            console.log('✅ Registration data sent with no-cors fallback');
          } catch (retryError) {
            console.error('❌ Registration failed completely:', retryError);
            // Note: Invoice is already shown, user experience is not affected
          }
        }
      })();

    } catch (error) {
      console.error('Enrollment error:', error);
      
      // Clear all form data and state
      reset();
      setPendingFormData(null);
      setSelectedCourse(null);
      
      // Show error dialog instead of toast
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Helper function to get mode icon
  const getModeIcon = (mode) => {
    switch (mode) {
      case 'online':
        return <Monitor className="w-4 h-4" />;
      case 'physical':
        return <Building className="w-4 h-4" />;
      case 'both':
        return <Users className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  // Helper function to get mode display name
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'online':
        return 'Online Class';
      case 'physical':
        return 'Physical Class';
      case 'both':
        return 'Both Online & Physical';
      default:
        return 'Unknown Mode';
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
        aria-labelledby="registration-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="registration-title" className="text-lg font-semibold text-gray-900">
            Student Registration
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label="Close registration"
            title="Close registration"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Registration Content */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 registration-scroll min-h-0" style={{overflowY: 'auto' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        ref={errors.firstName && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                        type="text"
                        {...register('firstName', { required: 'Please enter your first name' })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.firstName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-primary-500'
                        }`}
                        placeholder="Enter your first name"
                        onChange={(e) => {
                          register('firstName').onChange(e);
                          if (errors.firstName) {
                            clearErrors('firstName');
                          }
                        }}
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.firstName.message}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        ref={errors.lastName && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                        type="text"
                        {...register('lastName', { required: 'Please enter your last name' })}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.lastName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-primary-500'
                        }`}
                        placeholder="Enter your last name"
                        onChange={(e) => {
                          register('lastName').onChange(e);
                          if (errors.lastName) {
                            clearErrors('lastName');
                          }
                        }}
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <span>⚠</span>
                          <span>{errors.lastName.message}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      ref={errors.gender && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      {...register('gender', { required: 'Please select your gender' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.gender 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      onChange={(e) => {
                        register('gender').onChange(e);
                        if (errors.gender) {
                          clearErrors('gender');
                        }
                      }}
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.gender.message}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      ref={errors.email && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="email"
                      {...register('email', { 
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="Enter your email (optional)"
                      onChange={(e) => {
                        register('email').onChange(e);
                        if (errors.email) {
                          clearErrors('email');
                        }
                      }}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>

                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level *</label>
                    <select
                      ref={errors.education && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      {...register('education', { required: 'Please select your education level' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.education 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      onChange={(e) => {
                        register('education').onChange(e);
                        if (errors.education) {
                          clearErrors('education');
                        }
                      }}
                    >
                      <option value="">Select your education level</option>
                      <option value="high_school">High School</option>
                      <option value="under_university">Under University</option>
                      <option value="university">University</option>
                      <option value="master">Master</option>
                    </select>
                    {errors.education && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.education.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                      ref={errors.dateOfBirth && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="date"
                      {...register('dateOfBirth', { required: 'Please enter your date of birth' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.dateOfBirth 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        register('dateOfBirth').onChange(e);
                        if (errors.dateOfBirth) {
                          clearErrors('dateOfBirth');
                        }
                      }}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.dateOfBirth.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +855
                      </span>
                      <input
                        ref={errors.phone && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                        type="tel"
                        {...register('phone', { 
                          required: 'Please enter your phone number',
                          pattern: {
                            value: /^[0-9]{8,10}$/,
                            message: 'Please enter a valid phone number (8-10 digits)'
                          }
                        })}
                        className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.phone 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-primary-500'
                        }`}
                        placeholder="123456789"
                        onChange={(e) => {
                          register('phone').onChange(e);
                          if (errors.phone) {
                            clearErrors('phone');
                          }
                        }}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                    <select
                      ref={errors.province && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      {...register('province', { required: 'Please select your province' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.province 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      onChange={(e) => {
                        register('province').onChange(e);
                        if (errors.province) {
                          clearErrors('province');
                        }
                      }}
                    >
                      <option value="">Select your province</option>
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
                        <span>{errors.province.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Selection</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course *</label>
                    <select
                      ref={courseError && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      value={selectedCourse?.id || ''}
                      onChange={(e) => {
                        const course = courses.find(c => c.id === parseInt(e.target.value));
                        setSelectedCourse(course);
                        if (course) {
                          setCourseError(null);
                        }
                      }}
                      disabled={loadingCourses}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                        courseError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                    >
                      <option value="">{loadingCourses ? 'Loading courses...' : 'Choose a course'}</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name || course.title} - {formatPrice(course.price || course.final_price || 0)}
                        </option>
                      ))}
                    </select>
                    {courseError && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{courseError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Session Time *</label>
                    <select
                      ref={errors.sessionTime && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      {...register('sessionTime', { required: 'Please select your preferred session time' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.sessionTime 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      onChange={(e) => {
                        register('sessionTime').onChange(e);
                        if (errors.sessionTime) {
                          clearErrors('sessionTime');
                        }
                      }}
                    >
                      <option value="">Select session time</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                    {errors.sessionTime && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.sessionTime.message}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery Mode *</label>
                    <select
                      ref={errors.deliveryMode && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      {...register('deliveryMode', { required: 'Please select your preferred delivery mode' })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.deliveryMode 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      onChange={(e) => {
                        register('deliveryMode').onChange(e);
                        if (errors.deliveryMode) {
                          clearErrors('deliveryMode');
                        }
                      }}
                    >
                      <option value="">Select delivery mode</option>
                      <option value="physical">Physical</option>
                      <option value="online">Online</option>
                    </select>
                    {errors.deliveryMode && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.deliveryMode.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Information Display */}
              {selectedCourse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Selected Course Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Course:</span>
                      <span className="text-sm text-blue-700">{selectedCourse.name || selectedCourse.title}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Price:</span>
                      <span className="text-sm text-blue-700 font-semibold">{formatPrice(selectedCourse.final_price || selectedCourse.price || 0)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Delivery Mode:</span>
                      <div className="flex items-center space-x-2">
                        <div className="text-blue-600">
                          {getModeIcon(selectedCourse.mode)}
                        </div>
                        <span className="text-sm text-blue-700">{getModeDisplayName(selectedCourse.mode)}</span>
                      </div>
                    </div>
                    
                    {selectedCourse.duration_hours && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Duration:</span>
                        <span className="text-sm text-blue-700">{selectedCourse.duration_hours} hours</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms and Policies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Policies</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={errors.termsAccepted && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                      type="checkbox"
                      id="termsAccepted"
                      {...register('termsAccepted', { required: 'You must accept the terms and conditions to proceed' })}
                      className={`rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                        errors.termsAccepted ? 'border-red-500' : ''
                      }`}
                      onChange={(e) => {
                        register('termsAccepted').onChange(e);
                        if (errors.termsAccepted) {
                          clearErrors('termsAccepted');
                        }
                      }}
                    />
                    <label htmlFor="termsAccepted" className="text-sm text-gray-700">
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
                  {errors.termsAccepted && (
                    <p className="text-red-600 text-sm mt-1 ml-6 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors.termsAccepted.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Registration Footer */}
          <div className="border-t border-gray-200 p-4 space-y-4 mb-8 flex-shrink-0">
            <div>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={!selectedCourse || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold text-center hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{isLoading ? 'Processing...' : 'Complete Registration'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingFormData && selectedCourse && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setPendingFormData(null);
          }}
          onConfirm={handleConfirmRegistration}
          title="Confirm Registration"
          message="Are you sure you want to complete this registration?"
          confirmText="Yes, Complete Registration"
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col transform transition-all duration-300 overflow-hidden"
            style={{
              animation: showTermsModal ? 'modalSlideIn 300ms ease-out' : 'modalSlideOut 300ms ease-in',
              height: '90vh',
              maxHeight: '90vh'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            {/* Header - Fixed at top */}
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

            {/* Content - Scrollable area */}
            <div 
              className="overflow-y-auto terms-scroll"
              style={{ 
                height: 'calc(90vh - 200px)',
                overflowY: 'auto',
                padding: '1.5rem',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="space-y-4 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Enrollment Agreement</h3>
                  <p className="text-sm leading-relaxed">
                    By enrolling in our courses, you agree to abide by all terms and conditions outlined herein.
                    Enrollment is subject to approval by our administrative team.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Course Requirements</h3>
                  <p className="text-sm leading-relaxed">
                    Students must meet the minimum requirements for their selected course. All course materials 
                    and schedules are subject to change with prior notice.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Payment and Refunds</h3>
                  <p className="text-sm leading-relaxed">
                    Payment is required upon enrollment confirmation. Refund policies vary by course type and 
                    are subject to our refund policy guidelines. Please contact our support team for specific 
                    refund inquiries.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Attendance and Participation</h3>
                  <p className="text-sm leading-relaxed">
                    Regular attendance is expected for all enrolled courses. Students are responsible for 
                    maintaining their attendance records and completing all required assignments.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Code of Conduct</h3>
                  <p className="text-sm leading-relaxed">
                    All students must maintain respectful and professional conduct during classes and interactions 
                    with instructors and fellow students. Violations may result in dismissal from the course.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Privacy and Data Protection</h3>
                  <p className="text-sm leading-relaxed">
                    We are committed to protecting your personal information. All data collected during enrollment 
                    will be used solely for course administration and communication purposes, in accordance with 
                    our privacy policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Intellectual Property</h3>
                  <p className="text-sm leading-relaxed">
                    All course materials, including but not limited to lectures, videos, documents, and resources, 
                    are protected by copyright and intellectual property laws. Unauthorized distribution or sharing 
                    is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Liability</h3>
                  <p className="text-sm leading-relaxed">
                    Our institution is not liable for any indirect, incidental, or consequential damages arising 
                    from course participation. Students participate at their own risk.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to Terms</h3>
                  <p className="text-sm leading-relaxed">
                    We reserve the right to modify these terms and conditions at any time. Students will be 
                    notified of significant changes via email or course announcements.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">10. Contact Information</h3>
                  <p className="text-sm leading-relaxed">
                    For questions or concerns regarding these terms, please contact our support team through 
                    the contact information provided on our website.
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

            {/* Footer - Fixed at bottom */}
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
        .registration-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .registration-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 5px;
        }
        .registration-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
          border: 2px solid #f1f5f9;
        }
        .registration-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .registration-scroll::-webkit-scrollbar-thumb:active {
          background: #475569;
        }
        /* Firefox scrollbar */
        .registration-scroll {
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
      `}} />
    </div>
  );
};

export default RegistrationDrawer;

