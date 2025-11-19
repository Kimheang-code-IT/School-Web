import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Calendar } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import newsData from '../data/news.json';

const NewsSection = () => {
  // State management
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // Load news items from JSON data
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Transform JSON data to match component expectations
      const transformedNews = Array.isArray(newsData)
        ? newsData
            .filter(item => item.published !== false)
            .map(item => ({
              id: item.id,
              title: item.title,
              excerpt: item.excerpt,
              cover_image_url: item.cover_image_url || item.cover_image,
              video_file_url: item.video_file_url || item.video_file,
              content_type: item.content_type || 'image',
              external_link: item.external_link,
              publish_date: item.publish_date || item.created_at,
              read_time: item.read_time || "5 min read"
            }))
        : [];
      
      setNewsItems(transformedNews);
    } catch (err) {
      console.error('Error loading news items:', err);
      setError(err.message || 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, []); // Only run once on mount


  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-2 bg-gradient-to-b from-gray-50 to-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-5">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4 animate-pulse"></div>
            <div className="h-10 sm:h-12 bg-gray-200 rounded w-64 sm:w-80 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 max-w-full mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-200"></div>
                <div className="p-5 sm:p-6 lg:p-7 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error && newsItems.length === 0) {
    return (
      <section className="py-2 sm:py-3 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t('news.title', 'News & Events')}
            </h2>
            <div className="text-red-500 text-base sm:text-lg mb-4 px-4">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  // No news items state
  if (newsItems.length === 0) {
    return (
      <section className="py-2 sm:py-3 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t('news.title', 'News & Events')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {t('news.no_items', 'No news items available at the moment')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 sm:py-3 bg-gradient-to-b from-gray-50 to-white w-full relative">
      {/* Section Header - Modern Design */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5">
        <div className="text-center">
          <div className="inline-block mb-4">
            <span className="text-primary-600 font-semibold text-sm sm:text-base uppercase tracking-wider">
              Latest Updates
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('news.title', 'News & Events')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t('news.description', 'Stay updated with our latest news, events, and announcements')}
          </p>
          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-red-600">
                {t('news.loading_error', 'Some news items may not be available.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Grid Layout - 3 Columns, 2 Rows with Vertical Scroll */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Cards Container - Show 2 rows with vertical scroll */}
        {/* Mobile: 1 column x 2 rows, Tablet: 2 columns x 2 rows, Desktop: 3 columns x 2 rows */}
        <div 
          className="news-scrollable-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 overflow-y-auto"
          style={{
            scrollBehavior: 'smooth'
          }}
        >
          {newsItems.map((item, index) => {
            return (
              <article
                key={item.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2 cursor-pointer animate-fadeIn"
                onClick={() => {
                  if (item.external_link) {
                    window.open(item.external_link, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
              {/* Image Container with Overlay */}
              <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {item.cover_image_url || item.video_file_url ? (
                  <>
                    {item.content_type === 'video' ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          controls={false}
                          poster={item.cover_image_url}
                          onError={(e) => {
                            console.error('Video load error:', e);
                            e.target.style.display = 'none';
                          }}
                        >
                          <source src={item.video_file_url} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 text-primary-600" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    )}
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                        {index === 0 ? 'Featured' : item.content_type === 'video' ? 'Video' : 'News'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-gray-400 text-sm font-medium">No media available</div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-6 lg:p-7">
                {/* Date */}
                <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                  <time dateTime={item.publish_date}>
                    {formatDate(item.publish_date)}
                  </time>
                  {item.read_time && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{item.read_time}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm sm:text-base text-gray-600 mb-5 leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>

                {/* Read More Button */}
                {item.external_link && (
                  <div className="flex items-center text-primary-600 font-semibold text-sm sm:text-base group-hover:gap-2 transition-all duration-300">
                    <span>Read More</span>
                    <ExternalLink className="w-4 h-4 ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                )}
              </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-primary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Mobile - 1 column, show exactly 2 rows (2 cards) */
        @media (max-width: 639px) {
          .news-scrollable-container {
            /* Card height ~420px (image 192px + content ~220px) + gap 24px between rows = 2 cards + 1 gap */
            max-height: calc(420px + 24px + 420px) !important;
            grid-template-columns: 1fr !important; /* Force 1 column */
            grid-auto-rows: minmax(420px, auto);
          }
        }
        
        /* Tablet - 2 columns, show exactly 2 rows (4 cards) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .news-scrollable-container {
            /* Card height ~440px + gap 32px between rows = 2 rows */
            max-height: calc(440px + 32px + 440px) !important;
            grid-template-columns: repeat(2, 1fr) !important; /* Force 2 columns */
            grid-auto-rows: minmax(440px, auto);
          }
        }
        
        /* Desktop - 3 columns, show exactly 2 rows (6 cards) */
        @media (min-width: 1024px) {
          .news-scrollable-container {
            /* Card height ~480px + gap 32px between rows = 2 rows */
            max-height: calc(480px + 32px + 480px) !important;
            grid-template-columns: repeat(3, 1fr) !important; /* Force 3 columns */
            grid-auto-rows: minmax(480px, auto);
          }
        }
        
        /* Hide scrollbar but keep scroll functionality */
        .news-scrollable-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
          width: 0;
          height: 0;
        }
        .news-scrollable-container {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default NewsSection;


