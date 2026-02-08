import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { useHeroSlides } from '../hooks/useHeroSlides.js';

const HeroSlideshow = () => {
  const { data: heroSlidesRaw = [], loading: isLoading } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const slideshowRef = useRef(null);

  const { t } = useTranslation();

  const slides = useMemo(() => {
    const raw = Array.isArray(heroSlidesRaw) ? heroSlidesRaw : [];
    return raw
      .filter(slide => slide && slide.is_active !== false)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .map(slide => ({
        id: slide.id,
        title: slide.title ?? '',
        subtitle: slide.subtitle ?? null,
        button_text: slide.button_text ?? null,
        button_link: slide.button_link ?? '/shop',
        image_url: slide.image_url || slide.image || '',
        duration: slide.duration ?? 5,
        is_active: slide.is_active,
        order: slide.order
      }));
  }, [heroSlidesRaw]); // Only run once on mount

  // Auto-scroll functionality - uses individual slide durations
  useEffect(() => {
    if (slides.length > 1) {
      const startAutoScroll = () => {
        const currentSlideData = slides[currentSlide];
        const duration = currentSlideData?.duration ? currentSlideData.duration * 1000 : 5000; // Default 5 seconds
        
        intervalRef.current = setTimeout(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, duration);
      };

      startAutoScroll();

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [slides.length, currentSlide, slides]);



  // Touch/swipe support
  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Refresh slides data


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-500 text-lg">Loading slideshow...</div>
          </div>
        </div>
      </div>
    );
  }

  // No slides state
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t('hero.welcome', 'Welcome')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('hero.no_slides', 'No slides available')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full p-2.5">
      {/* Slideshow Container */}
      <div 
        ref={slideshowRef}
        className="relative w-full h-64 sm:h-80 md:h-96 lg:h-screen overflow-hidden rounded-[10px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${currentSlideData.image_url || currentSlideData.image})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Content - Positioned at bottom with shadow overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* Shadow Overlay */}
        <div className="bg-gradient-to-t from-black via-black/70 to-transparent h-32 sm:h-48 md:h-64 lg:h-80 flex items-end">
          <div className="w-full pb-4 sm:pb-6 md:pb-8 lg:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {currentSlideData.title}
                </h1>
                
                {currentSlideData.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-relaxed max-w-2xl sm:max-w-3xl lg:max-w-4xl">
                    {currentSlideData.subtitle}
                  </p>
                )}
                
                {currentSlideData.button_text && (
                  <div className="flex justify-start">
                    <Link
                      to={currentSlideData.button_link || '/shop'}
                      className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-primary-600 text-white text-sm sm:text-base md:text-lg font-semibold rounded-lg hover:bg-primary-700 shadow-lg hover:shadow-xl"
                    >
                      {currentSlideData.button_text}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 sm:bottom-16 md:bottom-20 lg:bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-110 sm:scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      </div>

    
      
    </div>
  );
};

export default HeroSlideshow; 


