import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Shield, X, RefreshCw } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';

const SecurityErrorDialog = ({ 
  isOpen, 
  onClose, 
  error,
  identifier = 'account'
}) => {
  const { t } = useTranslation();
  const [remainingTime, setRemainingTime] = useState(0);
  // Simplified security info without backend
  const securityInfo = error?.securityInfo || {
    type: 'generic',
    title: 'Security Alert',
    message: error?.message || 'A security issue occurred.',
    showContactSupport: false
  };

  useEffect(() => {
    // No-op since we don't have backend lockout mechanism
    if (!isOpen || securityInfo.type !== 'account_locked') return;
  }, [isOpen, securityInfo.type, identifier, onClose]);

  if (!isOpen || !securityInfo) return null;

  const getIcon = () => {
    switch (securityInfo.type) {
      case 'account_locked':
        return <Shield className="w-12 h-12 text-orange-500" />;
      case 'rate_limit':
        return <Clock className="w-12 h-12 text-yellow-500" />;
      case 'ip_blocked':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    return securityInfo.title || 'Security Alert';
  };

  const getMessage = () => {
    if (securityInfo.type === 'account_locked' && remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      return (
        <>
          {securityInfo.message}
          <br /><br />
          <strong>Time remaining: {timeString}</strong>
        </>
      );
    }
    return securityInfo.message;
  };

  const getButtonText = () => {
    if (securityInfo.type === 'account_locked') {
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      return remainingTime > 0 ? `Try Again in ${timeString}` : 'Try Again';
    }
    if (securityInfo.type === 'rate_limit') {
      return `Retry in ${securityInfo.retryAfter || 60}s`;
    }
    return securityInfo.showContactSupport ? t('common.contact_support', 'Contact Support') : t('common.close', 'Close');
  };

  const handleButtonClick = () => {
    if (securityInfo.type === 'account_locked' && remainingTime > 0) {
      return; // Don't allow closing if still locked
    }
    if (securityInfo.showContactSupport) {
      // Open support contact or email
      window.location.href = 'mailto:support@websiteecom.com?subject=IP Blocked';
      return;
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={securityInfo.type !== 'account_locked' ? onClose : undefined}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
        {/* Close button (if allowed) */}
        {securityInfo.type !== 'account_locked' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
          {getTitle()}
        </h2>

        {/* Message */}
        <div className="text-gray-600 text-center mb-6">
          {typeof getMessage() === 'string' ? (
            <p className="whitespace-pre-line">{getMessage()}</p>
          ) : (
            <p>{getMessage()}</p>
          )}
        </div>

        {/* Additional info for rate limit */}
        {securityInfo.type === 'rate_limit' && securityInfo.requests && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 text-center">
              Limit: {securityInfo.requests} requests per {securityInfo.window || 60} seconds
            </p>
          </div>
        )}

        {/* Warning for failed login */}
        {securityInfo.showLockoutWarning && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800 text-center font-medium">
              ⚠️ Warning: {securityInfo.remainingAttempts} attempt{securityInfo.remainingAttempts !== 1 ? 's' : ''} remaining before account lockout
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleButtonClick}
            disabled={securityInfo.type === 'account_locked' && remainingTime > 0}
            className={`
              px-6 py-2.5 rounded-lg font-semibold transition-all duration-200
              ${securityInfo.type === 'account_locked' && remainingTime > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : securityInfo.type === 'ip_blocked'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : securityInfo.type === 'rate_limit'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${securityInfo.type === 'ip_blocked' 
                ? 'focus:ring-red-500' 
                : securityInfo.type === 'rate_limit'
                ? 'focus:ring-yellow-500'
                : 'focus:ring-primary-500'
              }
            `}
          >
            {securityInfo.type === 'rate_limit' && (
              <RefreshCw className="w-4 h-4 inline-block mr-2 animate-spin" />
            )}
            {getButtonText()}
          </button>
        </div>

        {/* Contact support link */}
        {securityInfo.showContactSupport && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Need help? <a href="mailto:support@websiteecom.com" className="text-primary-600 hover:underline">Contact Support</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default SecurityErrorDialog;

