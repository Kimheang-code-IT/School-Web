import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Icon */}
          <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
            <svg
              className="h-full w-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          
          {/* 404 Text */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Popular Pages</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/shop"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ShoppingBag className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Shop</div>
                <div className="text-sm text-gray-500">Browse our products</div>
              </div>
            </Link>
            
            <Link
              to="/courses"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Search className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Courses</div>
                <div className="text-sm text-gray-500">Find courses to enroll</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-500 font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
