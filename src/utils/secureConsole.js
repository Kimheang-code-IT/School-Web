/**
 * Secure Console Utility
 * Prevents console.log statements from exposing sensitive data in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug,
  info: console.info,
};

// Override console methods in production
if (!isDevelopment) {
  // In production, only allow error logging (but sanitized)
  console.log = () => {}; // Silent in production
  console.debug = () => {}; // Silent in production
  console.info = () => {}; // Silent in production
  
  // Allow errors but sanitize sensitive data
  console.error = (...args) => {
    const sanitized = args.map(arg => {
      if (typeof arg === 'string') {
        // Remove potential sensitive data patterns
        return arg
          .replace(/token[=:]\s*['"]?[\w-]+['"]?/gi, 'token=[REDACTED]')
          .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=[REDACTED]')
          .replace(/api[_-]?key[=:]\s*['"]?[\w-]+['"]?/gi, 'api_key=[REDACTED]')
          .replace(/authorization[=:]\s*['"]?[\w\s-]+['"]?/gi, 'authorization=[REDACTED]');
      }
      return arg;
    });
    originalConsole.error(...sanitized);
  };
  
  // Allow warnings but sanitize
  console.warn = (...args) => {
    const sanitized = args.map(arg => {
      if (typeof arg === 'string') {
        return arg
          .replace(/token[=:]\s*['"]?[\w-]+['"]?/gi, 'token=[REDACTED]')
          .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=[REDACTED]');
      }
      return arg;
    });
    originalConsole.warn(...sanitized);
  };
}

// Export original console for cases where you need it
export const originalConsoleMethods = originalConsole;

// Export secure logging functions
export const secureLog = {
  log: (...args) => {
    if (isDevelopment) {
      originalConsole.log(...args);
    }
  },
  error: (...args) => {
    const sanitized = args.map(arg => {
      if (typeof arg === 'string') {
        return arg
          .replace(/token[=:]\s*['"]?[\w-]+['"]?/gi, 'token=[REDACTED]')
          .replace(/password[=:]\s*['"]?[^'"]+['"]?/gi, 'password=[REDACTED]')
          .replace(/api[_-]?key[=:]\s*['"]?[\w-]+['"]?/gi, 'api_key=[REDACTED]');
      }
      return arg;
    });
    originalConsole.error(...sanitized);
  },
  warn: (...args) => {
    if (isDevelopment) {
      originalConsole.warn(...args);
    }
  },
};

export default secureLog;

