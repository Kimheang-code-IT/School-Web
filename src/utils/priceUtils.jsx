/**
 * Utility functions for price formatting and calculations
 */

/**
 * Format a price value as currency
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: 'USD')
 * @param {string} locale - The locale for formatting (default: 'en-US')
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - The original price
 * @param {number} salePrice - The sale price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, salePrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Calculate tax amount
 * @param {number} price - The base price
 * @param {number} taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns {number} Tax amount
 */
export const calculateTax = (price, taxRate = 0.08) => {
  return price * taxRate;
};

/**
 * Calculate total price including tax
 * @param {number} price - The base price
 * @param {number} taxRate - The tax rate as a decimal
 * @returns {number} Total price including tax
 */
export const calculateTotalWithTax = (price, taxRate = 0.08) => {
  return price + calculateTax(price, taxRate);
};

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {string} currency - Currency code
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice, currency = 'USD') => {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }
  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
};

/**
 * Parse price from string
 * @param {string} priceString - Price as string
 * @returns {number} Parsed price as number
 */
export const parsePrice = (priceString) => {
  if (typeof priceString === 'number') return priceString;
  if (typeof priceString !== 'string') return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = priceString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate price
 * @param {any} price - Price to validate
 * @returns {boolean} Whether price is valid
 */
export const isValidPrice = (price) => {
  return typeof price === 'number' && !isNaN(price) && price >= 0;
};
