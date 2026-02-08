import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { 
  ShoppingCart, Heart, Minus, Plus,
  Share2, CheckCircle, ArrowLeft, ImageOff
} from 'lucide-react';
import ErrorDisplay from '../components/ErrorDisplay.jsx';
import StarRating from '../components/StarRating.jsx';
import { formatPrice } from '../utils/priceUtils.jsx';
import toast from 'react-hot-toast';
import { useProducts } from '../hooks/useProducts.js';
import { useTranslation } from '../hooks/useTranslation.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const { data: products = [] } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const product = useMemo(() => {
    if (!slug || !Array.isArray(products)) return null;
    return products.find(p => p.slug === slug);
  }, [slug, products]);

  const isLoading = false;
  const error = product ? null : 'Product not found';

  // Reset image errors and selected image when product changes
  useEffect(() => {
    if (product) {
      setImageErrors({});
      setSelectedImage(0);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorDisplay
          error={error}
          title={t('product_detail.not_found', 'Product Not Found')}
          message={t('product_detail.not_found_message', "The product you're looking for doesn't exist or couldn't be loaded.")}
          onRetry={() => navigate('/shop')}
          isNetworkError={error?.message?.includes('Network') || error?.message?.includes('fetch')}
        />
      </div>
    );
  }

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      addToCart({
        ...product,
        title: product.title || product.name,
        images: product.images || (product.image_url ? [product.image_url] : []),
        image_url: product.image_url || product.images?.[0],
        quantity
      }, quantity);
      
      toast.success(`${product.title || product.name} added to cart!`, {
        duration: 2000,
        position: 'top-right',
      });
    } catch (error) {
      toast.error('Failed to add item to cart', {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
        } catch (error) {
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };


  // Helper function for calculating discount percentage (currently unused)
  // const calculateDiscount = (originalPrice, currentPrice) => {
  //   if (originalPrice > currentPrice) {
  //     return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  //   }
  //   return 0;
  // };

  // Prepare images array from API data
  const images = product?.images || (product?.image_url ? [product.image_url] : []);
  const hasImages = images.length > 0 && images.every(img => img && img !== '/placeholder-product.jpg');
  
  // Handle image load errors
  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };
  
  // Dynamic "What's Included" from product data (details.included or included array)
  const includedItems = Array.isArray(product?.details?.included)
    ? product.details.included
    : Array.isArray(product?.included)
      ? product.included
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className=" border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-4">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto">
            <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap">{t('nav.home', 'Home')}</Link>
            <span className="text-gray-400">/</span>
            <Link to="/shop" className="text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap">{t('nav.shop', 'Shop')}</Link>
            <span className="text-gray-400">/</span>
            <Link to={`/shop?category=${product?.category?.slug || ''}`} className="text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap">
              {product?.category?.name || t('common.category', 'Category')}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{product?.title || product?.name || t('product_detail.product', 'Product')}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Product Images - Fixed/Sticky on desktop, normal on mobile */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg relative flex items-center justify-center">
                {(!hasImages || imageErrors[selectedImage]) ? (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <ImageOff className="w-24 h-24 sm:w-32 sm:h-32 mb-4" />
                    <p className="text-sm sm:text-base text-gray-500">{t('product_detail.no_image', 'No Image Available')}</p>
                  </div>
                ) : (
                  <img
                    src={images[selectedImage]}
                    alt={product?.title || product?.name || 'Product'}
                    className="w-full h-full object-contain p-2 sm:p-4"
                    onError={() => handleImageError(selectedImage)}
                  />
                )}
              </div>
              
              {/* Thumbnail Images */}
              {hasImages && images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 sm:gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-50 ${
                        selectedImage === index 
                          ? 'border-blue-500 scale-105' 
                          : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                      }`}
                    >
                      {imageErrors[index] ? (
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      ) : (
                        <img
                          src={image}
                          alt={`${product?.title || product?.name || 'Product'} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info - Scrollable Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Rating */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">{product?.title || product?.name || 'Product'}</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-base sm:text-base rounded-lg min-h-[44px] sm:min-h-0"
                  >
                    <ArrowLeft className="w-8 h-5 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">{t('product_detail.back_to_shop', 'Back to Shop')}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title={t('product_detail.share_product', 'Share Product')}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isWishlisted 
                        ? 'text-red-500 hover:bg-red-50' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isWishlisted ? t('product_detail.remove_from_wishlist', 'Remove from Wishlist') : t('product_detail.add_to_wishlist', 'Add to Wishlist')}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={product?.star_rating || 0}
                    size="sm"
                    showNumber={true}
                  />
                  <span className="text-sm sm:text-base text-gray-600">
                    ({Math.floor(Math.random() * 50) + 10} reviews)
                  </span>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shrink-0 ${
                  product?.stock_status === 'in_stock'
                    ? 'bg-green-100 text-green-700' 
                    : product?.stock_status === 'low_stock'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product?.stock_status === 'in_stock' ? t('product_detail.in_stock', 'In Stock') : 
                   product?.stock_status === 'low_stock' ? t('product_detail.low_stock', 'Low Stock') : 
                   t('product_detail.out_of_stock', 'Out of Stock')}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              {product?.compare_price && product.compare_price > product.price ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-lg shadow-lg">
                      -{product.discount_percentage || Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg text-gray-500 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-green-600">
                        Save {formatPrice(product.compare_price - product.price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatPrice(product?.price || 0)}
                </div>
              )}
            </div>

            {/* What's Included - dynamic from product.details.included or product.included */}
            {includedItems.length > 0 && (
              <div className="bg-white rounded-lg border p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('product_detail.included', "What's Included")}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {includedItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </span>
                      <span className="text-sm sm:text-base">{typeof item === 'string' ? item : item?.label ?? String(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg border p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t('product_detail.product_description', 'Product Description')}</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product?.description || t('product_detail.no_description', 'No description available.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

