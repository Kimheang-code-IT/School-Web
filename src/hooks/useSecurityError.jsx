import { useState, useCallback } from 'react';

/**
 * Custom hook for handling security errors - simplified without backend
 * Since we don't have backend API, security errors are not applicable
 */
export const useSecurityError = () => {
  const [securityError, setSecurityError] = useState(null);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  const handleError = useCallback((error) => {
    // No-op since we don't have backend
    return false;
  }, []);

  const clearError = useCallback(() => {
    setSecurityError(null);
    setShowSecurityDialog(false);
  }, []);

  const isAccountLocked = useCallback((identifier = 'account') => {
    return false; // Always return false without backend
  }, []);

  const getRemainingLockoutTime = useCallback((identifier = 'account') => {
    return 0; // Always return 0 without backend
  }, []);

  return {
    securityError,
    showSecurityDialog,
    handleError,
    clearError,
    isAccountLocked,
    getRemainingLockoutTime,
    setShowSecurityDialog,
  };
};

export default useSecurityError;

