import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Camera, Printer, Phone, Mail, MapPin, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { useContactInfo } from '../hooks/useContactInfo.js';
import { useTranslation } from '../hooks/useTranslation.jsx';
import telegramIcon from '../assets/Telegram-icon-removebg-preview.png';

const EnrollmentConfirmation = () => {
  const { data: contactInfoData = {} } = useContactInfo();
  const { t } = useTranslation();
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get enrollment data from sessionStorage (stored when registration is submitted)
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get from sessionStorage first (latest registration)
      const latestEnrollment = sessionStorage.getItem('latestEnrollment');
      
      if (latestEnrollment) {
        try {
          const enrollmentData = JSON.parse(latestEnrollment);
          // Ensure all required fields are present
          if (enrollmentData && enrollmentData.student_name && enrollmentData.course_name) {
            setEnrollment(enrollmentData);
            setIsLoading(false);
            return;
          } else {
            setError(t('enrollment_confirmation.error_incomplete', 'Enrollment data is incomplete. Please register again.'));
            setIsLoading(false);
            return;
          }
        } catch (parseError) {
          setError(t('enrollment_confirmation.error_load_failed', 'Failed to load enrollment data. Please register again.'));
          setIsLoading(false);
          return;
        }
      }

      // If no data in sessionStorage, show error
      if (!enrollmentId && !latestEnrollment) {
        setError(t('enrollment_confirmation.error_not_found', 'No enrollment data found. Please register first.'));
        setIsLoading(false);
        return;
      }

      // If enrollmentId is provided but no data in sessionStorage
      if (enrollmentId && !latestEnrollment) {
        setError(t('enrollment_confirmation.error_expired', 'Enrollment data not found. It may have expired or been cleared.'));
        setIsLoading(false);
        return;
      }

    } catch (err) {
      setError(t('enrollment_confirmation.error_load_failed', 'Failed to load enrollment details. Please contact support if this persists.'));
      setIsLoading(false);
    }
  }, [enrollmentId, t]);

  const invoiceRef = useRef(null);

  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const enrollmentUrl = window.location.href;
    const shareData = {
      title: `Enrollment Confirmation - ${enrollment?.id || enrollmentId}`,
      text: `Check out my enrollment confirmation: ${enrollment?.id || enrollmentId}`,
      url: enrollmentUrl,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(t('enrollment_confirmation.shared_success', 'Enrollment shared successfully!'));
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(enrollmentUrl);
        toast.success(t('enrollment_confirmation.copied_success', 'Enrollment link copied to clipboard!'));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard if share was cancelled or failed
        try {
          await navigator.clipboard.writeText(enrollmentUrl);
          toast.success(t('enrollment_confirmation.copied_success', 'Enrollment link copied to clipboard!'));
        } catch (clipboardError) {
          toast.error(t('enrollment_confirmation.share_failed', 'Failed to share enrollment'));
        }
      }
    }
  };

  const handleScreenshot = async () => {
    if (!invoiceRef.current || !enrollment) {
      toast.error(t('enrollment_confirmation.invoice_not_found', 'Invoice not found'));
      return;
    }

    try {
      toast.loading(t('enrollment_confirmation.capturing', 'Capturing invoice...'), { id: 'screenshot' });
      
      const canvas = await html2canvas(invoiceRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `enrollment-invoice-${enrollment?.id || 'unknown'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Invoice screenshot saved!', { id: 'screenshot' });
    } catch (error) {
      toast.error('Failed to capture screenshot', { id: 'screenshot' });
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return t('enrollment_confirmation.status_confirmed', 'Confirmed');
      case 'pending':
        return t('enrollment_confirmation.status_pending', 'Pending Review');
      case 'completed':
        return t('enrollment_confirmation.status_completed', 'Completed');
      case 'cancelled':
        return t('enrollment_confirmation.status_cancelled', 'Cancelled');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('enrollment_confirmation.not_found_title', 'Enrollment Not Found')}</h2>
          <p className="text-gray-600 mb-4">{error || t('enrollment_confirmation.not_found_message_generic', "The enrollment you're looking for doesn't exist.")}</p>
          <Link 
            to="/courses" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('enrollment_confirmation.browse_courses', 'Browse Courses')}
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = enrollment?.status === 'confirmed';

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Hide everything except invoice */
          .no-print,
          header,
          footer,
          nav,
          button,
          a[href],
          .sticky {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Show only invoice content */
          .print-invoice {
            display: block !important;
            visibility: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          
          /* Ensure invoice is centered and full width */
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
          }
          
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* Remove background colors that might not print */
          .bg-gray-50,
          .bg-white {
            background: white !important;
          }
          
          /* Ensure text is black for better printing */
          .text-gray-600,
          .text-gray-700,
          .text-gray-900 {
            color: #000 !important;
          }
          
          /* Keep colored elements for status badges */
          .bg-blue-600,
          .bg-green-100,
          .bg-yellow-100,
          .bg-red-100 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Prevent page breaks inside invoice sections */
          .print-invoice > div {
            page-break-inside: avoid;
          }
          
          /* Ensure table doesn't break across pages */
          table {
            page-break-inside: avoid;
          }
          
          /* Remove shadows and borders that might not print well */
          .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Header */}
        <div className="text-center mb-8 no-print">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className={`w-8 h-8 sm:w-10 sm:h-10 ${isConfirmed ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 px-4">
            {isConfirmed ? t('enrollment_confirmation.confirmed_title', 'Enrollment Confirmed!') : t('enrollment_confirmation.received_title', 'Enrollment Received')}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            {isConfirmed 
              ? t('enrollment_confirmation.thank_you_message', 'Thank you for enrolling! Your enrollment invoice is ready below.')
              : t('enrollment_confirmation.received_message', 'Your enrollment has been received. Invoice details below.')
            }
          </p>
        </div>

        {/* Main Layout: Invoice Centered, Buttons Right */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Invoice Container - Centered (Scrollable) */}
          <div className="flex-1 flex justify-center w-full lg:w-auto">
            <div className="w-full max-w-3xl">
              <div id="invoice" ref={invoiceRef} className="bg-white shadow-lg p-4 sm:p-6 mb-8 print-invoice mx-auto">
              {/* Invoice Header */}
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4">
                  {/* Company Logo & Name - Left Aligned */}
                  <div className="flex items-center">
                    <img 
                      src="/logo.png" 
                      alt="Logo"
                      className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Invoice Title & Details - Right Aligned */}
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">ENROLLMENT INVOICE</h2>
                    <div className="space-y-1 text-sm sm:text-base">
                      <p className="text-gray-700">{t('enrollment_confirmation.invoice_no', 'Invoice No')} : <span className="font-semibold">{enrollment?.id ? String(enrollment.id).padStart(8, '0') : t('enrollment_confirmation.na', 'N/A')}</span></p>
                      <p className="text-gray-700">{t('enrollment_confirmation.date', 'Date')} : <span className="font-semibold">{formatDateShort(enrollment?.created_at)}</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Blue Banner with Triangular Cutout */}
                <div className="relative bg-blue-600 h-3 w-full" style={{
                  clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%)'
                }}></div>
              </div>

              {/* Invoice To Section */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 uppercase">ENROLLMENT TO :</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Left Column - Student Information */}
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">Name :</span> 
                      <span className="font-bold italic text-blue-600 text-sm sm:text-base ml-2 sm:ml-4 break-words">{enrollment?.student_name || 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">Email :</span> 
                      <span className="text-gray-600 ml-2 sm:ml-4 break-all">{enrollment?.student_email || 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">Phone :</span> 
                      <span className="text-gray-600 ml-2 sm:ml-4">{enrollment?.student_phone || 'N/A'}</span>
                    </p>
                    
                  </div>
                  
                  {/* Right Column - Invoice Information */}
                  <div className="space-y-1">
                    {enrollment?.province && (
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">Province :</span> 
                        <span className="text-gray-600 ml-2 sm:ml-4">{enrollment.province}</span>
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">{t('enrollment_confirmation.invoice_no', 'Invoice No')} :</span> 
                      <span className="text-gray-600 ml-2 sm:ml-4">{enrollment?.id ? String(enrollment.id).padStart(8, '0') : 'N/A'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="text-gray-900 inline-block min-w-[80px] sm:min-w-[100px]">{t('enrollment_confirmation.date', 'Date')} :</span> 
                      <span className="text-gray-600 ml-2 sm:ml-4">{formatDateShort(enrollment?.created_at)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Enrollment Details Table */}
              <div className="mb-6 sm:mb-8">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="text-center py-2 sm:py-4 px-2 sm:px-4 font-bold uppercase text-xs sm:text-base">NO.</th>
                          <th className="text-center py-2 sm:py-4 px-2 sm:px-4 font-bold uppercase text-xs sm:text-base">DESCRIPTION</th>
                          <th className="text-center py-2 sm:py-4 px-2 sm:px-4 font-bold uppercase text-xs sm:text-base">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-2 sm:py-4 px-2 sm:px-4 text-center text-xs sm:text-base text-gray-700 font-medium">01.</td>
                          <td className="py-2 sm:py-4 px-2 sm:px-4 text-center text-xs sm:text-base text-gray-900 font-medium break-words">{enrollment?.course_name || 'Course Enrollment'}</td>
                          <td className="py-2 sm:py-4 px-2 sm:px-4 text-center">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getEnrollmentStatusColor(enrollment?.status || 'pending')}`}>
                              {getStatusLabel(enrollment?.status || 'pending')}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Notes & Status */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Enrollment Info - Shows first on mobile */}
                <div className="flex justify-center sm:justify-center md:justify-center order-1 md:order-2">
                  <div className="w-full sm:w-full md:w-64">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-center py-2 sm:py-3 text-sm sm:text-base text-gray-700 border-b-2 border-gray-300">
                        <span className="font-semibold">Enrollment Status: </span>
                        <span className="font-bold ml-2">{getStatusLabel(enrollment?.status || 'pending')}</span>
                      </div>
                      <div className="flex justify-center py-3 sm:py-4 px-4 bg-blue-600 text-white mt-2">
                        <span className="font-bold text-base sm:text-lg">Enrollment ID: </span>
                        <span className="font-bold text-lg sm:text-xl ml-2">{enrollment?.id ? String(enrollment.id).padStart(8, '0') : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms & Conditions - Shows second (bottom) on mobile */}
                <div className="text-center sm:text-left order-2 md:order-1">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 uppercase">TERMS & CONDITIONS :</h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="text-gray-600">Your enrollment has been received and is being processed. You will receive a confirmation email with course access details once your enrollment is confirmed.</span>
                  </p>
                </div>
              </div>
              {/* Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-300 pb-2 mb-2 mx-auto w-40 sm:w-48">
                      <p className="text-gray-900 font-semibold italic text-sm sm:text-lg break-words">{enrollment?.student_name || 'Student Name'}</p>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Student Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-300 pb-2 mb-2 mx-auto w-40 sm:w-48">
                      <p className="text-gray-900 font-semibold italic text-sm sm:text-lg">John Doe</p>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600">Your Name & Sign</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Assistant Manager</p>
                  </div>
                </div>

              {/* Footer */}
              <div className="bg-blue-600 text-white py-3 px-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
                  <p className="text-center text-base sm:text-xl font-bold mb-3 sm:mb-4">Thanks For Your <span className="italic">Business!</span></p>
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 lg:gap-14 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="break-all">{contactInfoData?.phone_primary || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="break-all">{contactInfoData?.email_primary || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="break-words text-center">
                        {[contactInfoData?.address_line1, contactInfoData?.city, contactInfoData?.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Right Side (Sticky) */}
          <div className="sticky top-[100px] h-fit no-print hidden lg:block">
            <div className="flex flex-col gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                title="Continue Shopping"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleScreenshot}
                className="inline-flex items-center justify-center w-12 h-12 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors shadow-md"
                title="Screenshot Invoice"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center w-12 h-12 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors shadow-md"
                title={t('enrollment_confirmation.print', 'Print')}
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center w-12 h-12 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors shadow-md"
                title={t('enrollment_confirmation.share', 'Share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              <a
                href={contactInfoData?.telegram_link || 'https://t.me/domankseuksa'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md overflow-hidden"
                title="Telegram"
              >
                <img src={telegramIcon} alt="Telegram" className="w-6 h-6 object-contain" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons - Visible on small screens */}
        <div className="flex flex-row gap-2 justify-center mt-6 mb-6 no-print lg:hidden">
          <button
            onClick={handleScreenshot}
            className="inline-flex items-center justify-center w-10 h-10 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            title="Screenshot Invoice"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center w-10 h-10 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            title={t('enrollment_confirmation.print', 'Print')}
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center w-10 h-10 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            title={t('enrollment_confirmation.share', 'Share')}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            title="Continue Shopping"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={contactInfoData?.telegram_link || 'https://t.me/domankseuksa'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden"
            title="Telegram"
          >
            <img src={telegramIcon} alt="Telegram" className="w-5 h-5 object-contain" />
          </a>
        </div>
      </div>
    </div>
    </>
  );
};

export default EnrollmentConfirmation;
