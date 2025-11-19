import React from 'react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'sm', 
  showNumber = true, 
  interactive = false,
  onRatingChange = null,
  className = ''
}) => {
  // Ensure rating is a number
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isFilled = starValue <= numericRating;
    const isHalfFilled = starValue === Math.ceil(numericRating) && numericRating % 1 !== 0;
    
    return (
      <button
        key={index}
        type="button"
        className={`${sizeClasses[size]} ${
          interactive 
            ? 'cursor-pointer hover:scale-110 transition-transform duration-150' 
            : 'cursor-default'
        } focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded`}
        onClick={() => handleStarClick(starValue)}
        disabled={!interactive}
        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
      >
        <svg
          className={`w-full h-full ${
            isFilled || isHalfFilled 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isHalfFilled ? (
            <defs>
              <linearGradient id={`half-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={isHalfFilled ? `url(#half-${index})` : 'currentColor'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>
      {showNumber && (
        <span className={`ml-1 font-medium text-gray-600 ${textSizeClasses[size]}`}>
          {numericRating > 0 ? numericRating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
