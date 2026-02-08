import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, List, Clock, Users, BookOpen, X, Search, ChevronUp, SlidersHorizontal } from 'lucide-react';
import LazyImage from '../components/LazyImage.jsx';
import ImageLightbox from '../components/ImageLightbox.jsx';
import StarRating from '../components/StarRating.jsx';
import { useDebounce } from '../hooks/useDebounce.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useCourses } from '../hooks/useCourses.js';
import { useCourseCategories } from '../hooks/useCourseCategories.js';
import { useTranslation } from '../hooks/useTranslation.jsx';
import '../styles/custom-scrollbar.css';

const Courses = () => {
  const location = useLocation();
  const { isCartOpen } = useUI();
  const { t } = useTranslation();
  const { data: coursesData, loading: coursesLoading } = useCourses();
  const { data: courseCategoriesData } = useCourseCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const lastScrollTopRef = useRef(0);
  const mobileSearchInputRef = useRef(null);

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const categories = useMemo(() => {
    return Array.isArray(courseCategoriesData)
      ? courseCategoriesData.filter(cat => cat.is_active !== false)
      : [];
  }, [courseCategoriesData]);

  const courses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, [coursesData]);

  const isLoading = coursesLoading;

  // Add body class for scroll control
  useEffect(() => {
    document.body.classList.add('courses-page');
    return () => {
      document.body.classList.remove('courses-page');
    };
  }, []);

  // Focus search input when mobile search dialog opens
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Close mobile search on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMobileSearchOpen(false);
    };
    if (isMobileSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileSearchOpen]);

  // Handle scroll: scroll-to-top button + header hide on scroll down / show on scroll up (YouTube-style, like Shop)
  useEffect(() => {
    const scrollContainer = document.querySelector('.main-scrollbar');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setShowScrollTop(scrollTop > 300);

      const lastScrollTop = lastScrollTopRef.current;
      const delta = scrollTop - lastScrollTop;
      lastScrollTopRef.current = scrollTop;

      if (scrollTop <= 20) {
        setHeaderVisible(true);
        return;
      }
      if (delta > 8) setHeaderVisible(false);
      else if (delta < -8) setHeaderVisible(true);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    const scrollContainer = document.querySelector('.main-scrollbar');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Filter courses based on search term and other filters (client-side filtering for better UX)
  const filteredCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    
    let filtered = courses;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchTerm = String(debouncedSearchTerm || '').toLowerCase();
      filtered = filtered.filter(course => {
        if (!course) return false;
        return (
          (course.name && String(course.name).toLowerCase().includes(searchTerm)) ||
          (course.short_description && String(course.short_description).toLowerCase().includes(searchTerm)) ||
          (course.description && String(course.description).toLowerCase().includes(searchTerm)) ||
          (course.level && String(course.level).toLowerCase().includes(searchTerm)) ||
          (course.instructor && String(course.instructor).toLowerCase().includes(searchTerm))
        );
      });
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course && course.category_slug === selectedCategory);
    }

    // Apply level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course && course.level === selectedLevel);
    }

    // Apply mode filter
    if (selectedMode) {
      filtered = filtered.filter(course => course && course.mode === selectedMode);
    }

    // Apply discount filter
    if (showDiscountedOnly) {
      filtered = filtered.filter(course => course && course.is_discounted === true);
    }

    // Apply price range filter
    const minPrice = priceRange.min !== '' ? parseFloat(priceRange.min) : null;
    const maxPrice = priceRange.max !== '' ? parseFloat(priceRange.max) : null;
    if (minPrice != null && !Number.isNaN(minPrice)) {
      filtered = filtered.filter(course => {
        const p = course?.final_price ?? course?.price;
        return typeof p === 'number' && p >= minPrice;
      });
    }
    if (maxPrice != null && !Number.isNaN(maxPrice)) {
      filtered = filtered.filter(course => {
        const p = course?.final_price ?? course?.price;
        return typeof p === 'number' && p <= maxPrice;
      });
    }

    return filtered;
  }, [courses, debouncedSearchTerm, selectedCategory, selectedLevel, selectedMode, showDiscountedOnly, priceRange]);

  // Search suggestions for mobile dialog (match by name, description, level, instructor; limit 8)
  const searchSuggestions = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term || !Array.isArray(courses)) return [];
    return courses
      .filter((c) => {
        const name = String(c.name || '').toLowerCase();
        const desc = String(c.short_description || c.description || '').toLowerCase();
        const level = String(c.level || '').toLowerCase();
        const instructor = String(c.instructor || '').toLowerCase();
        return name.includes(term) || desc.includes(term) || level.includes(term) || instructor.includes(term);
      })
      .slice(0, 8);
  }, [courses, searchTerm]);

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // SEO metadata (can be used with react-helmet if needed)
  // const title = categoryName 
  //   ? `Courses - ${categoryName} | WebsiteEcom`
  //   : 'Courses - Professional Training & Education | WebsiteEcom';
  // const description = categoryName
  //   ? `Browse ${categoryName.toLowerCase()} courses in Cambodia. Professional training programs with expert instructors. Enroll today.`
  //   : `Browse professional courses and training programs in Cambodia. Learn programming, web development, design, business and more. Expert instructors, flexible schedules.`;

  // Safety check for router context - must be after all hooks
  if (!location) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('courses.loading', 'Loading courses...')}</p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'online':
        return '💻';
      case 'physical':
        return '🏢';
      case 'both':
        return '🔄';
      default:
        return '📚';
    }
  };


  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full overflow-hidden">
        {/* Left Sidebar - Full height, no left margin, sticky */}
        <div className="w-[300px] flex-shrink-0 h-full hidden lg:block">
          <div className="bg-white shadow-md h-full overflow-hidden border-r border-gray-200 flex flex-col">
        {/* Header */}
            <div className="mx-4 p-4 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase">{t('courses.all_categories', 'All Categories')}</h3>
        </div>

            {/* Scrollable Categories */}
            <div className="overflow-y-auto flex-1 sidebar-scrollbar scroll-container pb-4">
              <div className="p-4 space-y-2">
                {/* {t('courses.all_courses', 'All Courses')} Button - Always visible */}
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-between ${
                    selectedCategory === '' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                  }`}
                >
                  <span className="uppercase">{t('courses.all_courses', 'All Courses')}</span>
                  
                </button>

                {/* Categories */}
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-between ${
                        selectedCategory === category.slug 
                          ? 'bg-blue-100 text-blue-900' 
                            : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      <span className="uppercase">{category.name}</span>
                    
                    </button>
                  ))}
                </div>

              {/* Level Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.level', 'Level')}</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedLevel('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.level_all', 'All Levels')}
                    </button>
                    <button
                      onClick={() => setSelectedLevel('beginner')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'beginner' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.level_beginner', 'Beginner')}
                    </button>
                    <button
                      onClick={() => setSelectedLevel('intermediate')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'intermediate' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.level_intermediate', 'Intermediate')}
                    </button>
                    <button
                      onClick={() => setSelectedLevel('advanced')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'advanced' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.level_advanced', 'Advanced')}
                    </button>
                  </div>
              </div>

              {/* Mode Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.delivery_mode', 'Delivery Mode')}</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedMode('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.mode_all', 'All Modes')}
                    </button>
                    <button
                      onClick={() => setSelectedMode('online')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'online' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      💻 {t('courses.mode_online', 'Online')}
                    </button>
                    <button
                      onClick={() => setSelectedMode('physical')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'physical' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      🏢 {t('courses.mode_physical', 'Physical')}
                    </button>
                    <button
                      onClick={() => setSelectedMode('both')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'both' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      🔄 {t('courses.mode_both', 'Both')}
                    </button>
                  </div>
                </div>

                {/* Discount Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.special_offers', 'Special Offers')}</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowDiscountedOnly(false)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        !showDiscountedOnly 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      {t('courses.all_courses', 'All Courses')}
                    </button>
                    <button
                      onClick={() => setShowDiscountedOnly(true)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        showDiscountedOnly 
                          ? 'bg-red-100 text-red-900' 
                          : 'text-gray-600 hover:bg-red-100 hover:text-red-900'
                      }`}
                    >
                      🔥 {t('courses.discounted_only', 'Discounted Only')}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Sticky Header - hides on scroll down, shows on scroll up; wrapper collapses so courses move to top (like Shop) */}
          <div
            className={`sticky top-0 z-20 flex-shrink-0 overflow-hidden transition-all duration-300 ease-out ${
              headerVisible ? 'max-h-40 opacity-100 mb-3' : 'max-h-0 opacity-0 mb-0'
            }`}
          >
            <div className="bg-white shadow-md px-3 py-4 lg:py-2">
              <div className="flex items-center justify-between">
                {/* Page Title - left on mobile and desktop */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-start gap-2">
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 truncate">
                      {selectedCategory 
                        ? categories.find(cat => cat.slug === selectedCategory)?.name || t('courses.title', 'Courses')
                        : t('courses.all_courses', 'All Courses')
                      }
                    </h1>
                  </div>
                </div>

                {/* Desktop: Search Input | Mobile: Search icon opens dialog (like Shop) */}
                <div className="flex-1 max-w-md mx-4 hidden lg:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder={t('courses.search_placeholder', 'Search courses...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile: Search + Filter to the right; Filter opens left drawer */}
                <div className="lg:hidden flex items-center gap-0.5">
                  <button
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                    title={t('courses.search_courses_aria', 'Search courses')}
                    aria-label={t('courses.search_courses_aria', 'Search courses')}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedCategory || selectedLevel || selectedMode || showDiscountedOnly || priceRange.min || priceRange.max
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title={t('courses.filters', 'Filter')}
                    aria-label={t('shop.open_filters_aria', 'Open filters')}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
               
                </div>

                {/* View Mode Toggle - Desktop */}
                <div className="hidden lg:flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Left Filter Drawer (category, min/max price, level, mode, discount) */}
          {isFilterDrawerOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50"
              aria-modal="true"
              role="dialog"
              aria-label={t('courses.filters', 'Filters')}
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsFilterDrawerOpen(false)}
              />
              <div
                className="absolute top-0 left-0 bottom-0 h-full w-[min(320px,85vw)] bg-white shadow-xl flex flex-col overflow-hidden"
                style={{ animation: 'slideInLeft 0.25s ease-out' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-900">{t('courses.filters', 'Filters')}</h3>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                    aria-label={t('shop.close_filters_aria', 'Close filters')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div
                  className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 p-4 space-y-6"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    touchAction: 'pan-y'
                  }}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.category', 'Category')}</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                          selectedCategory === '' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {t('courses.all_courses', 'All Courses')}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.slug)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                            selectedCategory === cat.slug ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.price_range', 'Price Range')}</h4>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder={t('courses.min_price', 'Min ($)')}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        placeholder={t('courses.max_price', 'Max ($)')}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.level', 'Level')}</h4>
                    <div className="space-y-1">
                      {['', 'beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                          key={level || 'all'}
                          onClick={() => setSelectedLevel(level)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                            selectedLevel === level ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {level === '' ? t('courses.level_all', 'All Levels') : (level === 'beginner' ? t('courses.level_beginner', 'Beginner') : level === 'intermediate' ? t('courses.level_intermediate', 'Intermediate') : t('courses.level_advanced', 'Advanced'))}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.delivery_mode', 'Delivery Mode')}</h4>
                    <div className="space-y-1">
                      {[
                        { value: '', label: t('courses.mode_all', 'All Modes') },
                        { value: 'online', label: `💻 ${t('courses.mode_online', 'Online')}` },
                        { value: 'physical', label: `🏢 ${t('courses.mode_physical', 'Physical')}` },
                        { value: 'both', label: `🔄 ${t('courses.mode_both', 'Both')}` }
                      ].map(({ value, label }) => (
                        <button
                          key={value || 'all'}
                          onClick={() => setSelectedMode(value)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                            selectedMode === value ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('courses.special_offers', 'Special Offers')}</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => setShowDiscountedOnly(false)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                          !showDiscountedOnly ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {t('courses.all_courses', 'All Courses')}
                      </button>
                      <button
                        onClick={() => setShowDiscountedOnly(true)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                          showDiscountedOnly ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-red-100 hover:text-red-900'
                        }`}
                      >
                        🔥 {t('courses.discounted_only', 'Discounted Only')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {t('courses.done', 'Done')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Search Dialog (like Shop) with suggestions */}
          {isMobileSearchOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-modal="true"
              role="dialog"
              aria-label={t('courses.search_courses_aria', 'Search courses')}
            >
              <div
                className="absolute top-0 left-0 right-0 max-h-[85vh] flex flex-col bg-white  overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 pb-3 flex items-center gap-2 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      ref={mobileSearchInputRef}
                      type="text"
                      placeholder={t('courses.search_placeholder', 'Search courses...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300  text-base focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        aria-label={t('courses.clear_search_aria', 'Clear search')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                    aria-label={t('courses.close_search_aria', 'Close search')}
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
                {searchTerm.trim() && (
                  <div className="border-t border-gray-100 overflow-y-auto flex-1 min-h-0">
                    {searchSuggestions.length > 0 ? (
                      <ul className="py-2" role="listbox">
                        {searchSuggestions.map((course) => (
                          <li key={course.id}>
                            <Link
                              to={`/courses/${course.slug}`}
                              onClick={() => setIsMobileSearchOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              role="option"
                            >
                              {(course.cover_image || course.image_url) ? (
                                <img
                                  src={course.cover_image || course.image_url}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-6 h-6 text-primary-600" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">{course.name}</div>
                                <div className="text-sm text-primary-600">
                                  {formatPrice(course.final_price || course.price)}
                                  {course.instructor && ` · ${course.instructor}`}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        {t('courses.no_courses_for', 'No courses found for "{search}"').replace('{search}', searchTerm.trim())}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses Grid */}
          <div className="flex-1 overflow-y-auto p-4 pb-20 main-scrollbar scroll-container">
            {isLoading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="w-full h-48 loading-skeleton rounded-lg mb-4"></div>
                    <div className="h-4 loading-skeleton rounded mb-2"></div>
                    <div className="h-4 loading-skeleton rounded w-3/4 mb-4"></div>
                    <div className="h-6 loading-skeleton rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.isArray(filteredCourses) && filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 group relative">
                    {/* Discount Badge - show "-X% OFF" like shop cards */}
                    {course.is_discounted && (() => {
                      const comparePrice = course.compare_price ?? course.price;
                      const finalPrice = course.final_price ?? course.price;
                      const percent = course.effective_discount_percentage != null
                        ? Math.round(course.effective_discount_percentage)
                        : (comparePrice > 0 && finalPrice < comparePrice)
                          ? Math.round(((comparePrice - finalPrice) / comparePrice) * 100)
                          : null;
                      return percent != null && percent > 0 ? (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                            {t('courses.percent_off', '-{percent}% OFF').replace('{percent}', percent)}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                            {t('courses.discount_badge', 'DISCOUNT')}
                          </span>
                        </div>
                      );
                    })()}
                    
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer group relative">
                        {course.cover_image ? (
                          <LazyImage
                            src={course.cover_image}
                            alt={course.name}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                            onClick={() => setSelectedImage({ url: course.cover_image, name: course.name })}
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-blue-600" />
                        )}
                        {course.cover_image && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">{t('courses.click_to_enlarge', 'Click to enlarge')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {/* Course Title */}
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          <Link to={`/courses/${course.slug}`}>
                            {course.name}
                          </Link>
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)} ml-2 flex-shrink-0`}>
                          {course.level || t('courses.unknown', 'Unknown')}
                        </span>
                      </div>

                      {/* Star Rating below title */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <StarRating 
                            rating={typeof course.rating === 'number' ? course.rating : parseFloat(course.rating) || 0} 
                            size="sm" 
                            showNumber={true}
                          />
                          <span className="text-sm text-gray-600">
                            ({course.review_count || 0} {t('product_detail.reviews', 'reviews')})
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {course.short_description || course.description || t('courses.no_description', 'No description available')}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration_hours ? `${course.duration_hours} hours` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{getModeIcon(course.mode)}</span>
                          <span className="capitalize">{course.mode || t('courses.unknown', 'Unknown')}</span>
                        </div>
                      </div>
                      
                      {/* Pricing Section with Discount */}
                      <div className="flex items-center justify-between">
                        {/* Left Column: Compare Price & Save Amount */}
                        <div className="text-left">
                          {course.is_discounted && course.final_price ? (
                            <div className="space-y-1">
                              {course.compare_price && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(course.compare_price)}
                                </div>
                              )}
                              {course.savings_amount && course.savings_amount > 0 && (
                                <div className="text-xs text-green-600 font-medium">
                                  {t('shop.save', 'Save')} {formatPrice(course.savings_amount)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">{t('courses.regular_price', 'Regular Price')}</div>
                          )}
                        </div>
                        
                        {/* Right Column: Final Price */}
                        <div className="text-right">
                          {course.is_discounted && course.final_price ? (
                            <div className="text-lg font-bold text-black">
                              {formatPrice(course.final_price)}
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-black">
                              {formatPrice(course.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{course.instructor || 'TBA'}</span>
                        </div>
                        
                        <Link
                          to={`/courses/${course.slug}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {t('courses.view_details', 'View Details')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && filteredCourses.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="text-gray-400 mb-6">
                  <BookOpen className="w-20 h-20 mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {debouncedSearchTerm ? t('courses.no_courses_for', 'No courses found for "{search}"').replace('{search}', debouncedSearchTerm) : t('courses.no_courses', 'No courses available')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {debouncedSearchTerm 
                    ? t('courses.search_no_results_message', "We couldn't find any courses matching your search. Try different keywords, browse by category, or check our course catalog.")
                    : t('courses.no_courses_match', 'No courses match your current filter criteria.')
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {debouncedSearchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('courses.clear_search', 'Clear Search')}
                    </button>
                  )}
                  {(selectedCategory || selectedLevel || selectedMode || showDiscountedOnly || priceRange.min || priceRange.max) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedLevel('');
                        setSelectedMode('');
                        setShowDiscountedOnly(false);
                        setPriceRange({ min: '', max: '' });
                        setSearchTerm('');
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      {t('courses.clear_filters', 'Clear All Filters')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen image with zoom */}
      <ImageLightbox
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url}
        title={selectedImage?.name}
      />

      {/* Scroll to Top Button - Hide when cart is open */}
      {showScrollTop && !isCartOpen && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50"
          title={t('common.scroll_to_top', 'Scroll to top')}
          aria-label={t('common.scroll_to_top', 'Scroll to top')}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Courses;


