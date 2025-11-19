import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, Filter, Grid, List, Package, Search, Eye, ChevronUp
} from 'lucide-react';
import LazyImage from '../components/LazyImage.jsx';
import StarRating from '../components/StarRating.jsx';
import { useDebounce } from '../hooks/useDebounce.jsx';
import { useUI } from '../context/UIContext.jsx';
import { formatPrice } from '../utils/priceUtils.jsx';
import productsData from '../data/products.json';
import productCategoriesData from '../data/productCategories.json';
import '../styles/custom-scrollbar.css';
// Performance optimizations

const Shop = () => {
  const navigate = useNavigate();
  const { isCartOpen } = useUI();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('');
  const [productCondition, setProductCondition] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Debounced search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load data from JSON files
  const categories = useMemo(() => {
    return Array.isArray(productCategoriesData) ? productCategoriesData : [];
  }, []);

  const products = useMemo(() => {
    return Array.isArray(productsData) ? productsData : [];
  }, []);

  const isLoading = false;
  const error = null;

  // Add body class for scroll control
  useEffect(() => {
    document.body.classList.add('shop-page');
    return () => {
      document.body.classList.remove('shop-page');
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






  // Image Modal Component
  const ImageModal = ({ isOpen, onClose, imageUrl, productName }) => {
    const [imageLoading, setImageLoading] = useState(true);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        setImageLoading(true); // Reset loading state when modal opens
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative max-w-6xl max-h-[90vh] w-full mx-4 animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-all duration-200 hover:bg-opacity-70"
            aria-label="Close image modal"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{productName}</h3>
            </div>
            <div className="p-4 relative">
              {imageLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
          <img
            src={imageUrl}
            alt={productName}
                className={`max-w-full max-h-[70vh] object-contain mx-auto rounded-lg transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0 absolute' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                  setImageLoading(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Don't render until we have proper data structure
  if (isLoading && !Array.isArray(categories)) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
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
              <h3 className="text-[16px] font-bold text-gray-900 uppercase">ALL CATEGORIES</h3>
        </div>

            {/* Scrollable Filters */}
            <div className="overflow-y-auto flex-1 pb-6 sidebar-scrollbar scroll-container">
              <div className="p-4 space-y-6">
                {/* Categories Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Categories</h4>
                <div className="space-y-1">
                    {/* All Products Button */}
                        <button
                          onClick={() => setSelectedCategory('')}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                            selectedCategory === '' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                      All Products
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
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price ($)"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max Price ($)"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Sort By Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase">Sort By</h4>
                  <div className="space-y-1">
                    {[
                      { value: '', label: 'Default' },
                      { value: 'price_low', label: 'Price: Low to High' },
                      { value: 'price_high', label: 'Price: High to Low' },
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                      { value: 'name', label: 'Name A-Z' }
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
          
          {/* Mobile Header - Sticky */}
          <div className="bg-white shadow-md p-3 lg:p-2 mb-3 sticky top-0 z-20 flex-shrink-0">
            <div className="flex items-center justify-between">

              {/* Page Title */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  {selectedCategory 
                      ? categories.find(cat => cat.slug === selectedCategory)?.name || 'Products'
                      : 'All Products'
                  }
                </h1>
                </div>
                <span className="text-xs lg:text-sm text-gray-500">
                  {filteredProducts.length} of {products.length} products
                  {debouncedSearchTerm && ` (filtered by "${debouncedSearchTerm}")`}
                  
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
                    placeholder="Search products..."
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
                title="Filter products"
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
                            ? 'bg-blue-100 text-blue-900' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        All Products
                      </button>
                      {Array.isArray(categories) && categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.slug);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
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

                  {/* Price Range Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Price Range</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Min Price ($)"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max Price ($)"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Sort By</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '', label: 'Default' },
                        { value: 'price_low', label: 'Price: Low to High' },
                        { value: 'price_high', label: 'Price: High to Low' },
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'name', label: 'Name A-Z' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsMobileFiltersOpen(false);
                          }}
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

                  {/* Stock Status Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Stock Status</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { value: 'true', label: 'In Stock Only' },
                        { value: 'false', label: 'Out of Stock Only' },
                        { value: '', label: 'All Products' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            // Stock filter disabled without backend - just close mobile filters
                            setIsMobileFiltersOpen(false);
                          }}
                          className="w-full text-left py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium text-gray-600 hover:bg-gray-100 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Condition Filter - Disabled until backend support */}
                  <div className="opacity-50">
                    <h4 className="font-semibold text-gray-900 mb-3 text-base">Product Condition (Coming Soon)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '', label: 'All Conditions' },
                        { value: 'new', label: 'New' },
                        { value: 'used', label: 'Used' },
                        { value: 'refurbished', label: 'Refurbished' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          disabled
                          className="w-full text-left py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium text-gray-400 cursor-not-allowed"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>



                  {/* Mobile Filter Actions */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button
                      onClick={() => {
                        setSelectedCategory('');
                        setPriceRange({ min: '', max: '' });
                        setSortBy('');
                        setProductCondition('');
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
                                  -{discountPercent}% OFF
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
                            <span className="text-white text-xs font-medium drop-shadow-lg">Click to enlarge</span>
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
                              ({product.review_count || 0} reviews)
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
                                return product.category_name || (typeof product.category === 'object' ? product.category?.name : product.category) || 'Uncategorized';
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
                              {product.stock_status === 'in_stock' ? 'In Stock' : 
                               product.stock_status === 'low_stock' ? 'Low Stock' : 
                               'Out of Stock'}
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
                                      Save {formatPrice(comparePrice - finalPrice)}
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
                          <span>View Details</span>
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
                  {debouncedSearchTerm ? `No products found for "${debouncedSearchTerm}"` : 'No products available'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {debouncedSearchTerm 
                    ? `We couldn't find any products matching your search. Try different keywords or browse our categories.`
                    : 'No products match your current filter criteria. Try adjusting your filters or browse all products.'
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
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url}
        productName={selectedImage?.name}
      />

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

export default Shop;

