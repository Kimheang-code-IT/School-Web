import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmation</h1>
        <p className="text-gray-600 mb-6">
          Order confirmation functionality is not available without backend API integration.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Return to Shop</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
