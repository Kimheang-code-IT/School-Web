import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, BookOpen } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import heroSlidesData from '../data/heroSlides.json';

const HeroSlideshow = () => {
  // State management
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const slideshowRef = useRef(null);
  
  const { t } = useTranslation();

  // Load hero slides from JSON data
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Filter active slides and transform to match component expectations
      const activeSlides = Array.isArray(heroSlidesData) 
        ? heroSlidesData
            .filter(slide => slide.is_active !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(slide => ({
              id: slide.id,
              title: slide.title,
              subtitle: slide.subtitle,
              button_text: slide.button_text,
              image_url: slide.image_url || slide.image,
              duration: slide.duration || 5,
              is_active: slide.is_active,
              order: slide.order
            }))
        : [];
      
      setSlides(activeSlides);
    } catch (err) {
      console.error('Error loading hero slides:', err);
      setError(err.message || 'Failed to load slideshow');
    } finally {
      setIsLoading(false);
    }
  }, []); // Only run once on mount

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

  // Error state
  if (error && slides.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-800 mb-4">
              {t('hero.error', 'Error Loading Slideshow')}
            </h1>
            <p className="text-xl text-red-600 mb-4">
              {error}
            </p>
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
                      to="/shop"
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

      {/* Feature Cards Section - Redesigned */}
      <section className="py-2 sm:py-3 bg-gradient-to-br from-gray-50 via-white to-gray-50 w-screen relative left-1/2 -translate-x-1/2">
        <div className="w-full">
          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-2 gap-6 px-4 sm:px-6 lg:px-8">
            {/* Products Card */}
            <Link
              to="/shop"
              className="group relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-blue-100/50 hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="relative p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">500+</div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Products</div>
                  </div>
                </div>

                {/* Content Section */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                  Shop Quality Products
                </h3>
                <p className="text-base text-gray-600 mb-4 leading-relaxed">
                  Browse our extensive catalog of electronics, fashion, books, and home goods. 
                  All products are carefully selected for quality and value.
                </p>

                {/* CTA Button */}
                <div className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-blue-500/50">
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>

            {/* Courses Card */}
            <Link
              to="/courses"
              className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-green-100/50 hover:border-green-200 transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="relative p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">50+</div>
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-0.5">Courses</div>
                  </div>
                </div>

                {/* Content Section */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">
                  Learn New Skills
                </h3>
                <p className="text-base text-gray-600 mb-4 leading-relaxed">
                  Enroll in our professional courses covering IT, business, languages, and more. 
                  Learn from industry experts and advance your career.
                </p>

                {/* CTA Button */}
                <div className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-green-500/50">
                  <span>View Courses</span>
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Horizontal Scroll Layout */}
          <div className="md:hidden flex gap-8 sm:gap-12 overflow-x-auto pb-2 snap-x snap-mandatory mx-2">
            {/* Products Card */}
            <Link
              to="/shop"
              className="group relative bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-blue-100/50 flex-shrink-0 w-[calc(100vw-1rem)] sm:w-[calc(100vw-1rem)] snap-center transition-all duration-300"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="relative p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3 sm:mb-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">500+</div>
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Products</div>
                  </div>
                </div>

                {/* Content Section */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Shop Quality Products
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Browse our extensive catalog of electronics, fashion, books, and home goods. 
                  All products are carefully selected for quality and value.
                </p>

                {/* CTA Button */}
                <div className="inline-flex items-center justify-center w-full px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg">
                  <span className="text-sm sm:text-base">Explore Products</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </div>
              </div>
            </Link>

            {/* Courses Card */}
            <Link
              to="/courses"
              className="group relative bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-green-100/50 flex-shrink-0 w-[calc(100vw-1rem)] sm:w-[calc(100vw-1rem)] snap-center transition-all duration-300"
            >
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="relative p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-3 sm:mb-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800">50+</div>
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-0.5">Courses</div>
                  </div>
                </div>

                {/* Content Section */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Learn New Skills
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                  Enroll in our professional courses covering IT, business, languages, and more. 
                  Learn from industry experts and advance your career.
                </p>

                {/* CTA Button */}
                <div className="inline-flex items-center justify-center w-full px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl shadow-lg">
                  <span className="text-sm sm:text-base">View Courses</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSlideshow; 


