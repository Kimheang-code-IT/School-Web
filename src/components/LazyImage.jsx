import React, { useState, useRef, useEffect } from 'react';
import { getOptimizedImageUrl, createImagePlaceholder } from '../utils/imageOptimization.jsx';
import { Package } from 'lucide-react';

const LazyImage = ({ src, alt, className, onClick, width = 400, quality = 80, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  const placeholder = createImagePlaceholder(width, 300);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {isInView && (
        <>
          {hasError ? (
            <div 
              className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
              onClick={onClick}
            >
              <Package className="w-16 h-16 mb-2" />
              <span className="text-sm font-medium">No Image</span>
            </div>
          ) : (
            <img
              src={optimizedSrc}
              alt={alt}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={onClick}
              loading="lazy"
              decoding="async"
              width={width}
              height="300"
            />
          )}
          {!isLoaded && !hasError && (
            <div 
              className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"
              style={{ backgroundImage: `url(${placeholder})` }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LazyImage;


