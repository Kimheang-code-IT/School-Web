import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from './ConfirmationDialog.jsx';
import ErrorDialog from './ErrorDialog.jsx';
import { useCourses } from '../hooks/useCourses.js';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { post } from '../services/api.js';
import { ENDPOINTS } from '../api/endpoints.js';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - 79 + i);

const RegistrationDrawer = ({ isOpen, onClose, triggerRef }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: coursesList = [] } = useCourses();
  const { t } = useTranslation();
  const courses = Array.isArray(coursesList) ? coursesList : [];
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setError, clearErrors } = useForm();
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const firstErrorRef = useRef(null);
  const termsModalRef = useRef(null);
  const termsModalCloseRef = useRef(null);

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showTermsModal) setShowTermsModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTermsModal]);

  useEffect(() => {
    if (showTermsModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showTermsModal]);

  useEffect(() => {
    if (showTermsModal && termsModalRef.current) {
      const modal = termsModalRef.current;
      const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };
      termsModalCloseRef.current?.focus();
      modal.addEventListener('keydown', handleTab);
      return () => modal.removeEventListener('keydown', handleTab);
    }
  }, [showTermsModal]);

  // Get course from URL params
  const courseId = searchParams.get('course');

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
    }
  };

  const onSubmit = async (data) => {
    // Clear previous errors
    clearErrors();
    firstErrorRef.current = null;

    let hasErrors = false;
    const errorFields = [];

    const allowedProvinces = [
      'phnom_penh', 'banteay_meanchey', 'battambang', 'kampong_cham', 'kampong_chhnang',
      'kampong_speu', 'kampong_thom', 'kampot', 'kandal', 'kep', 'koh_kong', 'kratie',
      'mondulkiri', 'oddar_meanchey', 'pailin', 'preah_sihanouk', 'preah_vihear', 'pursat',
      'ratanakiri', 'siem_reap', 'stung_treng', 'svay_rieng', 'takeo', 'tboung_khmum', 'prey_veng'
    ];
    const allowedGenders = ['male', 'female', 'other'];

    try {
      // Full Name (English) *
      if (!data.fullNameEnglish || data.fullNameEnglish.trim().length < 2) {
        setError('fullNameEnglish', {
          type: 'manual',
          message: 'Please enter a valid full name (English, at least 2 characters)'
        });
        hasErrors = true;
        errorFields.push('fullNameEnglish');
      } else {
        data.fullNameEnglish = data.fullNameEnglish.trim();
      }

      // Full Name (Khmer) - optional
      if (data.fullNameKhmer) data.fullNameKhmer = data.fullNameKhmer.trim();

      // Gender *
      if (!data.gender || !allowedGenders.includes(data.gender)) {
        setError('gender', {
          type: 'manual',
          message: 'Please select gender'
        });
        hasErrors = true;
        errorFields.push('gender');
      }

      // Date of birth (Day, Month, Year) *
      const day = data.birthDay && data.birthDay !== '' ? data.birthDay : null;
      const month = data.birthMonth && data.birthMonth !== '' ? data.birthMonth : null;
      const year = data.birthYear && data.birthYear !== '' ? data.birthYear : null;
      if (!day || !month || !year) {
        setError('birthDay', { type: 'manual', message: 'Please select date of birth (day, month, year)' });
        hasErrors = true;
        errorFields.push('birthDay');
      } else {
        data.dateOfBirth = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }

      // Phone *
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

      // Province *
      if (!data.province || !allowedProvinces.includes(data.province)) {
        setError('province', {
          type: 'manual',
          message: 'Please select a valid province'
        });
        hasErrors = true;
        errorFields.push('province');
      }

      if (!data.termsAccepted) {
        setError('termsAccepted', { type: 'manual', message: 'You must accept the terms and conditions to proceed' });
        hasErrors = true;
        errorFields.push('termsAccepted');
      }

      const allFields = [data.fullNameEnglish, data.fullNameKhmer, data.phone].filter(Boolean);
      for (const field of allFields) {
        if (field && (field.includes('<script') || field.includes('javascript:') || field.includes('onerror='))) {
          toast.error('Security validation failed. Please check your input.');
          return;
        }
      }
    } catch (error) {
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
    if (!pendingFormData) return;

    setShowConfirmDialog(false);
    setIsLoading(true);
    const data = pendingFormData;

    try {
      let phoneNumber = data.phone.trim();
      if (!phoneNumber.startsWith('+855')) {
        if (phoneNumber.startsWith('0')) phoneNumber = phoneNumber.substring(1);
        phoneNumber = `+855${phoneNumber}`;
      }

      const enrollmentData = {
        course_id: selectedCourse?.id ?? '',
        course_name: selectedCourse?.title || selectedCourse?.name || '',
        full_name_english: data.fullNameEnglish.trim(),
        full_name_khmer: data.fullNameKhmer?.trim() || '',
        gender: data.gender,
        date_of_birth: data.dateOfBirth || '',
        phone: phoneNumber,
        province: data.province,
        terms_accepted: data.termsAccepted ? 'Yes' : 'No',
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      const confirmationData = {
        id: Date.now().toString(),
        student_name: enrollmentData.full_name_english,
        student_name_khmer: enrollmentData.full_name_khmer || '',
        student_email: '',
        student_phone: enrollmentData.phone,
        course_name: enrollmentData.course_name || '',
        course_id: enrollmentData.course_id || '',
        province: enrollmentData.province,
        gender: enrollmentData.gender,
        date_of_birth: enrollmentData.date_of_birth,
        status: enrollmentData.status,
        created_at: enrollmentData.timestamp
      };

      // Save to sessionStorage FIRST so invoice can show immediately
      sessionStorage.setItem('latestEnrollment', JSON.stringify(confirmationData));

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

      // Optional: POST enrollment to API (fire-and-forget; user already sees confirmation)
      post(ENDPOINTS.ENROLLMENTS, enrollmentData).catch(() => {});

    } catch (error) {
      
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
            {t('registration.student_registration', 'Student Registration')}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label={t('common.close', 'Close registration')}
            title={t('common.close', 'Close registration')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Registration Content */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 registration-scroll min-h-0" style={{overflowY: 'auto' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name (English) * */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.full_name_en', 'Full Name (English)')} <span className="text-red-500">*</span></label>
                <input
                  ref={errors.fullNameEnglish && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                  type="text"
                  {...register('fullNameEnglish')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.fullNameEnglish ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  placeholder={t('registration.placeholder_name_en', 'Full name (English)')}
                  onChange={(e) => { register('fullNameEnglish').onChange(e); if (errors.fullNameEnglish) clearErrors('fullNameEnglish'); }}
                />
                {errors.fullNameEnglish && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.fullNameEnglish.message}</span></p>
                )}
              </div>

              {/* Full Name (Khmer) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.full_name_khmer', 'Full Name (Khmer)')}</label>
                <input
                  type="text"
                  {...register('fullNameKhmer')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('registration.placeholder_name_khmer', 'ឈ្មោះពេញ (Khmer)')}
                />
              </div>

              {/* Gender * */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.gender', 'Gender')} <span className="text-red-500">*</span></label>
                <select
                  ref={errors.gender && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                  {...register('gender')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  onChange={(e) => { register('gender').onChange(e); if (errors.gender) clearErrors('gender'); }}
                >
                  <option value="">{t('registration.select_gender', 'Select Gender')}</option>
                  <option value="male">{t('registration.male', 'Male')}</option>
                  <option value="female">{t('registration.female', 'Female')}</option>
                  <option value="other">{t('registration.other', 'Other')}</option>
                </select>
                {errors.gender && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.gender.message}</span></p>
                )}
              </div>

              {/* Date Of Birth * - Day, Month, Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.dob', 'Date Of Birth')} <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    {...register('birthDay')}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.birthDay ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={(e) => { register('birthDay').onChange(e); if (errors.birthDay) clearErrors('birthDay'); }}
                  >
                    <option value="">{t('registration.day', 'Day')}</option>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    {...register('birthMonth')}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.birthDay ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={(e) => { register('birthMonth').onChange(e); if (errors.birthDay) clearErrors('birthDay'); }}
                  >
                    <option value="">{t('registration.month', 'Month')}</option>
                    {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select
                    {...register('birthYear')}
                    className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.birthDay ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onChange={(e) => { register('birthYear').onChange(e); if (errors.birthDay) clearErrors('birthDay'); }}
                  >
                    <option value="">{t('registration.year', 'Year')}</option>
                    {BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.birthDay && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.birthDay.message}</span></p>
                )}
              </div>

              {/* Phone * */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.phone', 'Phone')} <span className="text-red-500">*</span></label>
                <input
                  ref={errors.phone && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  placeholder={t('registration.placeholder_phone', 'e.g. (+855) 12 345 678')}
                  onChange={(e) => { register('phone').onChange(e); if (errors.phone) clearErrors('phone'); }}
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.phone.message}</span></p>
                )}
              </div>

              {/* Province * */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('registration.province', 'Province')} <span className="text-red-500">*</span></label>
                <select
                  ref={errors.province && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                  {...register('province')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                    errors.province ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                  }`}
                  onChange={(e) => { register('province').onChange(e); if (errors.province) clearErrors('province'); }}
                >
                  <option value="">{t('registration.select_province', 'Select Province')}</option>
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
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.province.message}</span></p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="pt-1">
                <div className="flex items-start space-x-2">
                  <input
                    ref={errors.termsAccepted && !firstErrorRef.current ? (el) => { firstErrorRef.current = el; } : null}
                    type="checkbox"
                    id="termsAccepted"
                    {...register('termsAccepted')}
                    className={`rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5 ${
                      errors.termsAccepted ? 'border-red-500' : ''
                    }`}
                    onChange={(e) => { register('termsAccepted').onChange(e); if (errors.termsAccepted) clearErrors('termsAccepted'); }}
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                    {t('registration.read_terms', 'I have read and accept the')}{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}
                      className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                    >
                      {t('registration.terms', 'Terms and Conditions')}
                    </button>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><span>⚠</span><span>{errors.termsAccepted.message}</span></p>
                )}
              </div>
            </form>
          </div>

          {/* Registration Footer */}
          <div className="border-t border-gray-200 px-4 py-3 space-y-4 mb-2 flex-shrink-0">
            <div>
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold text-center hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{isLoading ? t('common.loading', 'Processing...') : t('registration.submit', 'Complete Registration')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingFormData && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setPendingFormData(null);
          }}
          onConfirm={handleConfirmRegistration}
          title={t('registration.confirm_title', 'Confirm Registration')}
          message={t('registration.confirm_message', 'Are you sure you want to complete this registration?')}
          confirmText={t('registration.confirm_yes', 'Yes, Complete Registration')}
          cancelText={t('registration.confirm_cancel', 'No, Cancel')}
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
          className="fixed inset-0 z-[60] flex items-center justify-center p-2"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTermsModal(false); }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ animation: showTermsModal ? 'fadeIn 200ms ease-out' : 'fadeOut 200ms ease-in' }}
          />
          <div
            ref={termsModalRef}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden"
            style={{
              animation: showTermsModal ? 'modalSlideIn 300ms ease-out' : 'modalSlideOut 300ms ease-in',
              height: '90vh',
              maxHeight: 'min(90vh, 90dvh)'
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-modal-title"
          >
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-4 sm:p-6 flex items-center justify-between">
              <div className="min-w-0">
                <h2 id="terms-modal-title" className="text-xl sm:text-2xl font-bold mb-1 truncate">{t('registration.terms_modal_title', 'Terms and Conditions')}</h2>
                <p className="text-blue-100 text-sm">{t('registration.terms_modal_subtitle', 'Please read carefully before proceeding')}</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                aria-label="Close terms and conditions"
                ref={termsModalCloseRef}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div
              className="terms-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y'
              }}
            >
              <div className="space-y-4 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Enrollment Agreement</h3>
                  <p className="text-sm leading-relaxed">By enrolling in our courses, you agree to abide by all terms and conditions outlined herein. Enrollment is subject to approval by our administrative team.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Course Requirements</h3>
                  <p className="text-sm leading-relaxed">Students must meet the minimum requirements for their selected course. All course materials and schedules are subject to change with prior notice.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Payment and Refunds</h3>
                  <p className="text-sm leading-relaxed">Payment is required upon enrollment confirmation. Refund policies vary by course type and are subject to our refund policy guidelines. Please contact our support team for specific refund inquiries.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Attendance and Participation</h3>
                  <p className="text-sm leading-relaxed">Regular attendance is expected for all enrolled courses. Students are responsible for maintaining their attendance records and completing all required assignments.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Code of Conduct</h3>
                  <p className="text-sm leading-relaxed">All students must maintain respectful and professional conduct during classes and interactions with instructors and fellow students. Violations may result in dismissal from the course.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Privacy and Data Protection</h3>
                  <p className="text-sm leading-relaxed">We are committed to protecting your personal information. All data collected during enrollment will be used solely for course administration and communication purposes, in accordance with our privacy policy.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Intellectual Property</h3>
                  <p className="text-sm leading-relaxed">All course materials, including but not limited to lectures, videos, documents, and resources, are protected by copyright and intellectual property laws. Unauthorized distribution or sharing is strictly prohibited.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Liability</h3>
                  <p className="text-sm leading-relaxed">Our institution is not liable for any indirect, incidental, or consequential damages arising from course participation. Students participate at their own risk.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to Terms</h3>
                  <p className="text-sm leading-relaxed">We reserve the right to modify these terms and conditions at any time. Students will be notified of significant changes via email or course announcements.</p>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">10. Contact Information</h3>
                  <p className="text-sm leading-relaxed">For questions or concerns regarding these terms, please contact our support team through the contact information provided on our website.</p>
                </section>
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                  <p className="text-sm text-blue-900 font-medium"><strong>By checking the box above, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</strong></p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
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

