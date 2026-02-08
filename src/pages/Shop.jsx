import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Grid, List, Package, Search, Eye, ChevronUp, SlidersHorizontal } from 'lucide-react';
import LazyImage from '../components/LazyImage.jsx';
import ImageLightbox from '../components/ImageLightbox.jsx';
import StarRating from '../components/StarRating.jsx';
import { useDebounce } from '../hooks/useDebounce.jsx';
import { useUI } from '../context/UIContext.jsx';
import { formatPrice } from '../utils/priceUtils.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useProductCategories } from '../hooks/useProductCategories.js';
import { useTranslation } from '../hooks/useTranslation.jsx';
import '../styles/custom-scrollbar.css';

const Shop = () => {
  const navigate = useNavigate();
  const { isCartOpen } = useUI();
  const { t } = useTranslation();
  const { data: products = [], loading: productsLoading, error: productsError } = useProducts();
  const { data: categories = [] } = useProductCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const mobileSearchInputRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const isLoading = productsLoading;
  const error = productsError;

  // Add body class for scroll control
  useEffect(() => {
    document.body.classList.add('shop-page');
    return () => {
      document.body.classList.remove('shop-page');
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

  // Handle scroll: scroll-to-top button + header hide on scroll down / show on scroll up (YouTube-style)
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

  // Filter products based on search term, category, price range, and sorting
  const filteredProducts = useMemo(() => {
    // Ensure products is an array
    if (!Array.isArray(products)) return [];
    
    let filtered = [...products];
    
    // Apply search filter
    if (debouncedSearchTerm && String(debouncedSearchTerm).trim()) {
      const searchTerm = String(debouncedSearchTerm).toLowerCase().trim();
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        const productName = String(product.name || product.title || '').toLowerCase();
        const description = String(product.description || product.short_description || '').toLowerCase();
        const categorySlug = String(product.category_slug || '').toLowerCase();
        
        // Find category name if available
        let categoryName = '';
        if (selectedCategory) {
          const category = categories.find(cat => cat.slug === selectedCategory);
          categoryName = category ? String(category.name || '').toLowerCase() : '';
        }
        
        return (
          productName.includes(searchTerm) ||
          description.includes(searchTerm) ||
          categorySlug.includes(searchTerm) ||
          categoryName.includes(searchTerm)
        );
      });
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => {
        return product && product.category_slug === selectedCategory;
      });
    }
    
    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        const price = product.final_price || product.price || 0;
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price_low':
            return (a.final_price || a.price || 0) - (b.final_price || b.price || 0);
          case 'price_high':
            return (b.final_price || b.price || 0) - (a.final_price || a.price || 0);
          case 'newest':
            return (b.id || 0) - (a.id || 0);
          case 'oldest':
            return (a.id || 0) - (b.id || 0);
          case 'name':
            return String(a.name || '').localeCompare(String(b.name || ''));
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  }, [products, debouncedSearchTerm, selectedCategory, priceRange, sortBy, categories]);

  // Search suggestions for mobile dialog (match by name/title/description, limit 8)
  const searchSuggestions = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term || !Array.isArray(products)) return [];
    return products
      .filter((p) => {
        const name = String(p.name || p.title || '').toLowerCase();
        const desc = String(p.description || p.short_description || '').toLowerCase();
        return name.includes(term) || desc.includes(term);
      })
      .slice(0, 8);
  }, [products, searchTerm]);






  // Don't render until we have proper data structure
  if (isLoading && !Array.isArray(categories)) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('shop.loading', 'Loading shop...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="flex h-full overflow-hidden ">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="w-0 lg:w-[300px] flex-shrink-0 h-full transition-all duration-300 ">
          <div className="bg-white shadow-md h-full overflow-hidden border-r border-gray-200 flex flex-col">
        {/* Header */}
            <div className="mx-4 p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-gray-900 uppercase">{t('shop.all_categories', 'All Categories')}</h3>
        </div>

            {/* Scrollable Filters */}
            <div className="overflow-y-auto flex-1 pb-6 sidebar-scrollbar scroll-container">
              <div className="p-4 space-y-6">
                {/* Categories Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.category', 'Categories')}</h4>
                <div className="space-y-1">
                    {/* {t('shop.all_products', 'All Products')} Button */}
                        <button
                          onClick={() => setSelectedCategory('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedCategory === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                      {t('shop.all_products', 'All Products')}
                        </button>
                    {Array.isArray(categories) && categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                          selectedCategory === category.slug 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.price_range', 'Price Range')}</h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder={t('shop.min_price', 'Min ($)')}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder={t('shop.max_price', 'Max ($)')}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Sort By Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.sort_by', 'Sort By')}</h4>
                  <div className="space-y-1">
                    {[
                      { value: '', label: t('shop.sort_default', 'Default') },
                      { value: 'price_low', label: t('shop.price_low', 'Price: Low to High') },
                      { value: 'price_high', label: t('shop.price_high', 'Price: High to Low') },
                      { value: 'newest', label: t('shop.newest', 'Newest First') },
                      { value: 'oldest', label: t('shop.oldest', 'Oldest First') },
                      { value: 'name', label: t('shop.name_az', 'Name A-Z') }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                          sortBy === option.value 
                            ? 'bg-blue-100 text-blue-900' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
              </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Sticky Header - hides on scroll down, shows on scroll up; wrapper collapses so products move to top */}
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
                      ? categories.find(cat => cat.slug === selectedCategory)?.name || t('shop.title', 'Products')
                      : t('shop.all_products', 'All Products')
                  }
                </h1>
                </div>
              </div>

              {/* Desktop: Search Input with suggestions dropdown | Mobile: Search icon opens dialog */}
              <div className="flex-1 max-w-md mx-4 hidden lg:block relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('shop.search_placeholder', 'Search products...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={t('shop.clear_search_aria', 'Clear search')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Desktop search suggestions dropdown */}
                {searchTerm.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-30">
                    {searchSuggestions.length > 0 ? (
                      <ul className="py-1" role="listbox">
                        {searchSuggestions.map((product) => (
                          <li key={product.id}>
                            <Link
                              to={`/products/${product.slug}`}
                              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                              role="option"
                            >
                              {product.image_url ? (
                                <img src={product.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-gray-100" />
                              ) : (
                                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate text-sm">{product.name || product.title}</div>
                                <div className="text-xs text-primary-600">{formatPrice(product.final_price || product.price)}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-4 text-center text-gray-500 text-sm">
                        {t('shop.no_products_for', 'No products found for "{search}"').replace('{search}', searchTerm.trim())}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile: Search + Filter icons to the right; Filter opens left drawer */}
              <div className="lg:hidden flex items-center gap-0.5">
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title={t('shop.search_products_aria', 'Search products')}
                  aria-label={t('shop.search_products_aria', 'Search products')}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedCategory || priceRange.min || priceRange.max || sortBy
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={t('shop.filters', 'Filter')}
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
          </div>

          {/* Mobile: Left Filter Drawer (category, min/max price, sort) */}
          {isFilterDrawerOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50"
              aria-modal="true"
              role="dialog"
              aria-label={t('shop.filters', 'Filters')}
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
                  <h3 className="text-lg font-bold text-gray-900">{t('shop.filters', 'Filters')}</h3>
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
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.category', 'Category')}</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                          selectedCategory === '' ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {t('shop.all_products', 'All Products')}
                      </button>
                      {Array.isArray(categories) && categories.map((cat) => (
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
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.price_range', 'Price Range')}</h4>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder={t('shop.min_price', 'Min ($)')}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="number"
                        placeholder={t('shop.max_price', 'Max ($)')}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">{t('shop.sort_by', 'Sort By')}</h4>
                    <div className="space-y-1">
                      {[
                        { value: '', label: t('shop.sort_default', 'Default') },
                        { value: 'price_low', label: t('shop.price_low', 'Price: Low to High') },
                        { value: 'price_high', label: t('shop.price_high', 'Price: High to Low') },
                        { value: 'newest', label: t('shop.newest', 'Newest First') },
                        { value: 'oldest', label: t('shop.oldest', 'Oldest First') },
                        { value: 'name', label: t('shop.name_az', 'Name A-Z') }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`w-full text-left py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                            sortBy === opt.value ? 'bg-blue-100 text-blue-900' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {t('shop.done', 'Done')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Search Dialog (vue.org style) with suggestions */}
          {isMobileSearchOpen && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-modal="true"
              role="dialog"
              aria-label={t('shop.search_products_aria', 'Search products')}
            >
              <div
                className="absolute top-0 left-0 right-0 max-h-[85vh] flex flex-col bg-white shadow-lg rounded-b-sm  overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 pb-3 flex items-center gap-2 flex-shrink-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      ref={mobileSearchInputRef}
                      type="text"
                      placeholder={t('shop.search_placeholder', 'Search products...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-base "
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        aria-label={t('shop.clear_search_aria', 'Clear search')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                    aria-label={t('shop.close_search_aria', 'Close search')}
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
                {/* Suggestions list */}
                {searchTerm.trim() && (
                  <div className="border-t border-gray-100 overflow-y-auto flex-1 min-h-0">
                    {searchSuggestions.length > 0 ? (
                      <ul className="py-2" role="listbox">
                        {searchSuggestions.map((product) => (
                          <li key={product.id}>
                            <Link
                              to={`/products/${product.slug}`}
                              onClick={() => setIsMobileSearchOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                              role="option"
                            >
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">{product.name || product.title}</div>
                                <div className="text-sm text-primary-600">{formatPrice(product.final_price || product.price)}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        {t('shop.no_products_for', 'No products found for "{search}"').replace('{search}', searchTerm.trim())}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scrollable Products Container */}
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
            ) : filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 hover:border-gray-200 overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 mb-4 relative overflow-hidden">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative group">
                        {/* Discount Badge on Image */}
                        {(() => {
                          const finalPrice = product.final_price || product.price || 0;
                          const comparePrice = product.compare_price;
                          
                          if (comparePrice && comparePrice > finalPrice) {
                            const discountPercent = Math.round(((comparePrice - finalPrice) / comparePrice) * 100);
                            return (
                              <div className="absolute top-2 left-2 z-10">
                                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                  {t('shop.percent_off', '-{percent}% OFF').replace('{percent}', discountPercent)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <LazyImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                          onClick={() => {
                            if (product.image_url) {
                              setSelectedImage({
                                url: product.image_url,
                                name: product.name
                              });
                            }
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
                            <Eye className="w-8 h-8 text-white drop-shadow-lg mb-1" />
                            <span className="text-white text-xs font-medium drop-shadow-lg">{t('shop.click_to_enlarge', 'Click to enlarge')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            <Link to={`/products/${product.slug}`} className="hover:underline">
                              {product.name}
                            </Link>
                          </h3>
                        </div>
                        
                        {/* Star Rating */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <StarRating 
                              rating={typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 0} 
                              size="sm" 
                              showNumber={true}
                              className="flex-shrink-0"
                            />
                            <span className="text-sm text-gray-500">
                              ({product.review_count || 0} {t('product_detail.reviews', 'reviews')})
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Package className="w-4 h-4" />
                            <span>
                              {(() => {
                                if (product.category_slug) {
                                  const category = categories.find(cat => cat.slug === product.category_slug);
                                  return category ? category.name : product.category_slug;
                                }
                                return product.category_name || (typeof product.category === 'object' ? product.category?.name : product.category) || t('shop.uncategorized', 'Uncategorized');
                              })()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              product.stock_status === 'in_stock' ? 'bg-green-500' : 
                              product.stock_status === 'low_stock' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}></div>
                            <span className={`font-semibold ${
                              product.stock_status === 'in_stock' ? 'text-green-600' : 
                              product.stock_status === 'low_stock' ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {product.stock_status === 'in_stock' ? t('shop.in_stock', 'In Stock') : 
                               product.stock_status === 'low_stock' ? t('shop.low_stock', 'Low Stock') : 
                               t('shop.out_of_stock', 'Out of Stock')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Price Display */}
                        <div className="flex items-center justify-between">
                          {(() => {
                            const finalPrice = product.final_price || product.price || 0;
                            const comparePrice = product.compare_price;
                            
                            if (comparePrice && comparePrice > finalPrice) {
                              return (
                                <>
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(comparePrice)}
                                    </span>
                                    <span className="text-sm font-semibold text-green-600">
                                      {t('shop.save', 'Save')} {formatPrice(comparePrice - finalPrice)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xl font-bold text-gray-900">
                                      {formatPrice(finalPrice)}
                                    </span>
                                  </div>
                                </>
                              );
                            } else {
                              return (
                                <div className="flex items-center">
                                  <span className="text-xl font-bold text-gray-900">
                                    {formatPrice(finalPrice)}
                                  </span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                      
                      {/* View Details Button */}
                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => navigate(`/products/${product.slug}`)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-1 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{t('shop.view_details', 'View Details')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="text-gray-400 mb-6">
                  <Package className="w-20 h-20 mx-auto opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {debouncedSearchTerm ? t('shop.no_products_for', 'No products found for "{search}"').replace('{search}', debouncedSearchTerm) : t('shop.no_products', 'No products available')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {debouncedSearchTerm 
                    ? t('shop.search_no_results_message', "We couldn't find any products matching your search. Try different keywords or browse our categories.")
                    : t('shop.no_products_match', 'No products match your current filter criteria.')
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {debouncedSearchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t('shop.clear_search', 'Clear Search')}
                    </button>
                  )}
                  {(selectedCategory || priceRange.min || priceRange.max || sortBy) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setPriceRange({ min: '', max: '' });
                        setSortBy('');
                        setSearchTerm('');
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      {t('shop.clear_filters', 'Clear All Filters')}
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
          title="Scroll to top"
          aria-label={t('common.scroll_to_top', 'Scroll to top')}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Shop;

