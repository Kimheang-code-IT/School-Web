import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    // Reset error boundary state without reloading
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center">
                {/* Icon with Animation */}
                <div className="mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mx-auto">
                    <RefreshCw className="w-10 h-10 text-white animate-spin" />
                  </div>
                </div>
                
                {/* Error Text */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Website Updating</h1>
                <p className="text-gray-600 mb-2 text-lg">
                  We're currently updating our website
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  Please refresh the page in a moment
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Page
                </button>
                
                <Link
                  to="/"
                  className="w-full flex justify-center items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </div>

              {/* Development Error Details - Only in dev mode */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development Only):</h3>
                  <pre className="text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error && this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  If this problem persists, please{' '}
                  <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                    contact support
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
