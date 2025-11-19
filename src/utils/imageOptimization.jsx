/**
 * Image optimization utilities
 */

/**
 * Generate responsive image URLs with different sizes
 * @param {string} baseUrl - Base image URL
 * @param {number} width - Desired width
 * @param {number} height - Desired height (optional)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (baseUrl, width, height = null) => {
  if (!baseUrl) return '/placeholder-image.jpg';
  
  // If it's already an external URL with optimization parameters, return as is
  if (baseUrl.includes('?') || baseUrl.startsWith('http')) {
    return baseUrl;
  }
  
  // For local images, you might want to add optimization parameters
  // This is a placeholder - in a real app, you'd integrate with an image CDN
  return baseUrl;
};

/**
 * Generate srcset for responsive images
 * @param {string} baseUrl - Base image URL
 * @param {Array} sizes - Array of size objects with width and height
 * @returns {string} Srcset string
 */
export const generateSrcSet = (baseUrl, sizes = []) => {
  if (!baseUrl || sizes.length === 0) return '';
  
  return sizes
    .map(size => {
      const url = getOptimizedImageUrl(baseUrl, size.width, size.height);
      return `${url} ${size.width}w`;
    })
    .join(', ');
};

/**
 * Get placeholder image URL
 * @param {string} type - Type of placeholder (product, course, news, etc.)
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder
 * @returns {string} Placeholder image URL (data URL SVG)
 */
export const getPlaceholderImage = (type = 'default', width = 400, height = 300) => {
  // Create SVG placeholder as data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">Image</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Check if image URL is valid
 * @param {string} url - Image URL to validate
 * @returns {boolean} Whether URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
};

/**
 * Get image dimensions from URL (placeholder implementation)
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      resolve({ width: 400, height: 300 }); // Default fallback
    };
    img.src = url;
  });
};

/**
 * Generate blur data URL for lazy loading
 * @param {number} width - Width of blur placeholder
 * @param {number} height - Height of blur placeholder
 * @returns {string} Blur data URL
 */
export const generateBlurDataUrl = (width = 20, height = 20) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple gradient blur
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

/**
 * Preload image
 * @param {string} url - Image URL to preload
 * @returns {Promise<boolean>} Whether image loaded successfully
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Create a placeholder image URL
 * @param {number} width - Width of placeholder
 * @param {number} height - Height of placeholder
 * @param {string} text - Text to display on placeholder
 * @returns {string} Placeholder image URL (data URL SVG)
 */
export const createImagePlaceholder = (width = 400, height = 300, text = 'Image') => {
  // Create SVG placeholder as data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
