import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
};

/**
 * Custom hook for debouncing callback functions
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array for the callback
 * @returns {Function} The debounced callback function
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const [debouncedCallback, setDebouncedCallback] = useState(() => callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, delay, ...deps]);

  return debouncedCallback;
};

/**
 * Custom hook for debouncing async operations
 * @param {Function} asyncCallback - The async callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies array for the callback
 * @returns {Object} Object containing the debounced function and loading state
 */
export const useDebouncedAsyncCallback = (asyncCallback, delay = 300, deps = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedCallback, setDebouncedCallback] = useState(() => asyncCallback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => async (...args) => {
        setIsLoading(true);
        try {
          const result = await asyncCallback(...args);
          return result;
        } finally {
          setIsLoading(false);
        }
      });
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncCallback, delay, ...deps]);

  return { debouncedCallback, isLoading };
};
