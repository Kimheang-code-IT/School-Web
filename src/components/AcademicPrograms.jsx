import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Building, ArrowRight, Users } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { useDeliveryModes } from '../hooks/useDeliveryModes.js';

const AcademicPrograms = () => {
  const { data: deliveryModesRaw = [], loading: isLoading, error } = useDeliveryModes();
  const [failedImages, setFailedImages] = useState([]);

  const { t } = useTranslation();

  const deliveryModes = useMemo(() => {
    return Array.isArray(deliveryModesRaw)
      ? deliveryModesRaw
          .filter(mode => mode.is_active !== false)
          .map(mode => ({
            id: mode.id,
            title: mode.title,
            description: mode.description,
            mode: mode.mode,
            image_url: mode.image_url || mode.image || mode.icon,
            icon: mode.icon,
            course_slug: mode.course_slug || null,
            link_url: mode.link_url || `/courses?mode=${mode.mode}`
          }))
      : [];
  }, [deliveryModesRaw]);

  // Helper: default icon for placeholder when no image
  const getDefaultIcon = (mode) => {
    switch (mode) {
      case 'online':
        return <Monitor className="w-10 h-10 text-white/90" />;
      case 'physical':
        return <Building className="w-10 h-10 text-white/90" />;
      case 'both':
        return <Users className="w-10 h-10 text-white/90" />;
      default:
        return <Building className="w-10 h-10 text-white/90" />;
    }
  };

  const hasImage = (mode) => {
    const url = mode.image_url;
    return url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) && !failedImages.includes(mode.id);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-2 bg-gray-50 w-full">
        {/* Section Header Skeleton */}
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-4">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
        </div>
        
        {/* Cards Skeleton - Full Width */}
        <div className="w-full overflow-x-auto">
          <div className="flex gap-4 pb-4 px-4 sm:px-6 lg:px-8" style={{ minWidth: 'max-content' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse flex-shrink-0 w-80">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-1 mb-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No delivery modes state
  if (deliveryModes.length === 0) {
    return (
      <section className="py-2 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('academic.programs', 'Academic Programs')}
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 bg-gray-50 w-full">
      {/* Section Header - Centered with max-width for text readability */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('academic.programs', 'Academic Programs')}
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('academic.programs_description', 'Choose your preferred learning method and start your educational journey')}
          </p>
        </div>
      </div>

      {/* Delivery Mode Cards - Full Width Horizontal Scroll */}
      <div className="w-full">
        {/* Horizontal Scroll Layout for All Screens - Full Width */}
        <div className="overflow-x-auto w-full">
          <div className="flex gap-2 sm:gap-5 pb-4 px-1 sm:px-4 lg:px-16" style={{ minWidth: 'max-content' }}>
            {deliveryModes.map((mode) => {
              // If course_slug is set, go to course detail; otherwise use link_url (courses list or external)
              const href = mode.course_slug
                ? `/courses/${mode.course_slug}`
                : (mode.link_url || `/courses?mode=${mode.mode}`);
              const isExternal = href.startsWith('http');
              const cardContent = (
                <>
                  {/* Image */}
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden">
                    {hasImage(mode) ? (
                      <img
                        src={mode.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages(prev => [...prev, mode.id])}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {getDefaultIcon(mode.mode)}
                      </div>
                    )}
                  </div>
                  {/* Description + Read more */}
                  <div className="py-3 px-4 flex flex-col gap-2">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 flex-1">
                      {mode.description}
                    </p>
                    <div className="flex justify-end">
                      <span className="inline-flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                        {t('academic.learn_more', 'Read more')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </>
              );
              return isExternal ? (
                <a
                  key={mode.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex-shrink-0 w-80 block"
                >
                  {cardContent}
                </a>
              ) : (
                <Link
                  key={mode.id}
                  to={href}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex-shrink-0 w-80 block"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* View All Programs Link - Centered */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mt-6">
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span>{t('academic.view_all_programs', 'View All Programs')}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AcademicPrograms;

