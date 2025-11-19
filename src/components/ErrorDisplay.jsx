import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  title = "Something went wrong", 
  message = "We're having trouble loading this content. Please try again.",
  showRetry = true,
  isNetworkError = false 
}) => {
  const getErrorIcon = () => {
    if (isNetworkError) {
      return <WifiOff className="w-8 h-8 text-red-400" />;
    }
    return <AlertTriangle className="w-8 h-8 text-red-400" />;
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    return message;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {/* Error Icon */}
      <div className="mb-4">
        {getErrorIcon()}
      </div>
      
      {/* Error Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {/* Error Message */}
      <p className="text-gray-600 mb-6 max-w-md">
        {getErrorMessage()}
      </p>

      {/* Retry Button */}
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}

      {/* Error Details (Development) */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 w-full max-w-md">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Error Details (Development)
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorDisplay;
