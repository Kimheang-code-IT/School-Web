import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Grid, List, Clock, Users, BookOpen, X, Filter, Search, ChevronUp } from 'lucide-react';
import LazyImage from '../components/LazyImage.jsx';
import StarRating from '../components/StarRating.jsx';
import { useDebounce } from '../hooks/useDebounce.jsx';
import { useUI } from '../context/UIContext.jsx';
import coursesData from '../data/courses.json';
import courseCategoriesData from '../data/courseCategories.json';
import '../styles/custom-scrollbar.css';

const Courses = () => {
  const location = useLocation();
  const { isCartOpen } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load data from JSON files
  const categories = useMemo(() => {
    return Array.isArray(courseCategoriesData)
      ? courseCategoriesData.filter(cat => cat.is_active !== false)
      : [];
  }, []);

  const courses = useMemo(() => {
    return Array.isArray(coursesData) ? coursesData : [];
  }, []);

  const courseStats = useMemo(() => {
    return {
      total_courses: courses.length,
      total_categories: categories.length,
      total_schedules: 0,
      courses_by_level: [],
      courses_by_mode: []
    };
  }, [courses.length, categories.length]);

  const isLoading = false;
  const error = null;

  // Add body class for scroll control
  useEffect(() => {
    document.body.classList.add('courses-page');
    return () => {
      document.body.classList.remove('courses-page');
    };
  }, []);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.main-scrollbar');
      if (scrollContainer) {
        const { scrollTop } = scrollContainer;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const scrollContainer = document.querySelector('.main-scrollbar');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
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

    return filtered;
  }, [courses, debouncedSearchTerm, selectedCategory, selectedLevel, selectedMode, showDiscountedOnly]);


  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const categoryName = categories.find(c => c.slug === selectedCategory)?.name || '';
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
          <p className="text-gray-600">Loading courses...</p>
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
              <h3 className="text-sm font-bold text-gray-900 uppercase">ALL CATEGORIES</h3>
        </div>

            {/* Scrollable Categories */}
            <div className="overflow-y-auto flex-1 sidebar-scrollbar scroll-container">
              <div className="p-4 space-y-2">
                {/* All Courses Button - Always visible */}
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-between ${
                    selectedCategory === '' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                  }`}
                >
                  <span className="uppercase">ALL COURSES</span>
                  
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
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">LEVEL</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedLevel('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      All Levels
                    </button>
                    <button
                      onClick={() => setSelectedLevel('beginner')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'beginner' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      Beginner
                    </button>
                    <button
                      onClick={() => setSelectedLevel('intermediate')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'intermediate' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      Intermediate
                    </button>
                    <button
                      onClick={() => setSelectedLevel('advanced')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedLevel === 'advanced' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
              </div>

              {/* Mode Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">DELIVERY MODE</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedMode('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      All Modes
                    </button>
                    <button
                      onClick={() => setSelectedMode('online')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'online' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      💻 Online
                    </button>
                    <button
                      onClick={() => setSelectedMode('physical')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'physical' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      🏢 Physical
                    </button>
                    <button
                      onClick={() => setSelectedMode('both')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        selectedMode === 'both' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      🔄 Both
                    </button>
                  </div>
                </div>

                {/* Discount Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">SPECIAL OFFERS</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowDiscountedOnly(false)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        !showDiscountedOnly 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-blue-100 hover:text-blue-900'
                      }`}
                    >
                      All Courses
                    </button>
                    <button
                      onClick={() => setShowDiscountedOnly(true)}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                        showDiscountedOnly 
                          ? 'bg-red-100 text-red-900' 
                          : 'text-gray-600 hover:bg-red-100 hover:text-red-900'
                      }`}
                    >
                      🔥 Discounted Only
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header - Sticky */}
          <div className="bg-white shadow-md p-3 lg:p-2 mb-3 sticky top-0 z-20 flex-shrink-0">
            <div className="flex items-center justify-between">

              {/* Page Title */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                    {selectedCategory 
                      ? categories.find(cat => cat.slug === selectedCategory)?.name || 'Courses'
                      : 'All Courses'
                    }
                  </h1>
                </div>
                <span className="text-xs lg:text-sm text-gray-500">
                  {filteredCourses.length} of {courses.length} courses
                  {debouncedSearchTerm && ` (filtered by "${debouncedSearchTerm}")`}
                  {showDiscountedOnly && ` (discounted only)`}
                  {courseStats && courseStats.total_courses > 0 && (
                    <span className="ml-2 text-blue-600">
                      • {courseStats.total_courses} total courses
                    </span>
                  )}
                  
                </span>
                {/* Error message display */}
                {error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses..."
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

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 mobile-filter-btn"
                title="Filter courses"
              >
                <Filter className="w-5 h-5" />
              </button>

              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden mobile-filter-overlay">
              <div className="mobile-filter-content">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Filter Content */}
                <div className="p-4 space-y-6">
                  {/* Categories */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Categories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                          selectedCategory === '' 
                            ? 'bg-blue-100 text-blue-900 border-2 border-blue-200' 
                            : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        All Courses
                      </button>
                      {categories && categories.length > 0 && categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.slug);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedCategory === category.slug 
                              ? 'bg-blue-100 text-blue-900 border-2 border-blue-200' 
                              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Level Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Course Level</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['', 'beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            setSelectedLevel(level);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedLevel === level 
                              ? 'bg-blue-100 text-blue-900 border-2 border-blue-200' 
                              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {level === '' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
              </div>
            </div>

                  {/* Mode Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Delivery Mode</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['', 'online', 'physical', 'both'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setSelectedMode(mode);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedMode === mode 
                              ? 'bg-blue-100 text-blue-900 border-2 border-blue-200' 
                              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {mode === '' ? 'All Modes' : `${getModeIcon(mode)} ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Special Offers</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setShowDiscountedOnly(false);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                          !showDiscountedOnly 
                            ? 'bg-blue-100 text-blue-900 border-2 border-blue-200' 
                            : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        All Courses
                      </button>
                      <button
                        onClick={() => {
                          setShowDiscountedOnly(true);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                          showDiscountedOnly 
                            ? 'bg-red-100 text-red-900 border-2 border-red-200' 
                            : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        🔥 Discounted Only
                      </button>
                    </div>
                  </div>

                  {/* Mobile Filter Actions */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setSelectedLevel('');
                          setSelectedMode('');
                          setShowDiscountedOnly(false);
                        }}
                        className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
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
                    {/* Discount Badge */}
                    {course.is_discounted && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {course.effective_discount_percentage ? `-${Math.round(course.effective_discount_percentage)}% OFF` : 'SALE'}
                        </span>
                      </div>
                    )}
                    
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        {course.cover_image ? (
                          <LazyImage
                            src={course.cover_image}
                            alt={course.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-blue-600" />
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
                          {course.level || 'Unknown'}
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
                            ({course.review_count || 0} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {course.short_description || course.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration_hours ? `${course.duration_hours} hours` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{getModeIcon(course.mode)}</span>
                          <span className="capitalize">{course.mode || 'Unknown'}</span>
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
                                  Save {formatPrice(course.savings_amount)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">Regular Price</div>
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
                          View Details
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
                  {debouncedSearchTerm ? `No courses found for "${debouncedSearchTerm}"` : 'No courses available'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {debouncedSearchTerm 
                    ? `We couldn't find any courses matching your search. Try different keywords, browse by category, or check our course catalog.`
                    : 'No courses match your current filter criteria. Try adjusting your filters or browse all courses.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {debouncedSearchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Clear Search
                    </button>
                  )}
                  {(selectedCategory || selectedLevel || selectedMode || showDiscountedOnly) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedLevel('');
                        setSelectedMode('');
                        setShowDiscountedOnly(false);
                        setSearchTerm('');
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Clear All Filters
                    </button>
                  )}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button - Hide when cart is open */}
      {showScrollTop && !isCartOpen && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Courses;


