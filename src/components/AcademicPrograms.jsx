import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Building, ArrowRight, ExternalLink, Users } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import deliveryModesData from '../data/deliveryModes.json';

const AcademicPrograms = () => {
  // State management
  const [deliveryModes, setDeliveryModes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedIcons, setFailedIcons] = useState([]);
  
  const { t } = useTranslation();

  // Load delivery modes from JSON data
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Transform JSON data to match component expectations
      const transformedModes = Array.isArray(deliveryModesData)
        ? deliveryModesData
            .filter(mode => mode.is_active !== false)
            .map(mode => ({
              id: mode.id,
              title: mode.title,
              description: mode.description,
              mode: mode.mode,
              icon: mode.icon,
              features: mode.features || [],
              link_url: mode.link_url || `/courses?mode=${mode.mode}`
            }))
        : [];
      
      setDeliveryModes(transformedModes);
      setFailedIcons([]);
    } catch (err) {
      console.error('Error loading delivery modes:', err);
      setError(err.message || 'Failed to load academic programs');
    } finally {
      setIsLoading(false);
    }
  }, []); // Only run once on mount

  // Helper function to get mode display name
  const getModeDisplayName = (mode) => {
    switch (mode) {
      case 'online':
        return 'Online';
      case 'physical':
        return 'Physical';
      case 'both':
        return 'Online & Physical';
      default:
        return 'Unknown';
    }
  };

  // Helper function to get default icon for mode
  const getDefaultIcon = (mode) => {
    switch (mode) {
      case 'online':
        return <Monitor className="w-6 h-6" />;
      case 'physical':
        return <Building className="w-6 h-6" />;
      case 'both':
        return <Users className="w-6 h-6" />;
      default:
        return <Building className="w-6 h-6" />;
    }
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

  // Error state
  if (error && deliveryModes.length === 0) {
    return (
      <section className="py-2 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('academic.programs', 'Academic Programs')}
            </h2>
            <div className="text-red-500 text-base mb-3">{error}</div>
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
            <p className="text-sm text-gray-600">
              {t('academic.no_programs', 'No programs available at the moment')}
            </p>
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
          {/* Error message display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-red-600">
                {t('academic.loading_error', 'Some programs may not be available.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Mode Cards - Full Width Horizontal Scroll */}
      <div className="w-full mb-6">
        {/* Horizontal Scroll Layout for All Screens - Full Width */}
        <div className="overflow-x-auto w-full">
          <div className="flex gap-4 pb-4 px-4 sm:px-6 lg:px-8" style={{ minWidth: 'max-content' }}>
            {deliveryModes.map((mode) => (
              <div
                key={mode.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex-shrink-0 w-80"
              >
                <div className="p-4">
                  {/* Icon and Mode */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                      {mode.icon && (mode.icon.startsWith('http') || mode.icon.startsWith('/') || mode.icon.startsWith('data:')) && !failedIcons.includes(mode.id) ? (
                        <img 
                          src={mode.icon} 
                          alt={mode.title}
                          className="w-8 h-8 object-contain"
                          onError={() => {
                            // Mark this icon as failed and fallback to default
                            setFailedIcons(prev => [...prev, mode.id]);
                          }}
                        />
                      ) : (
                        <div className="text-primary-600">
                          {getDefaultIcon(mode.mode)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <span className="capitalize">{getModeDisplayName(mode.mode)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {mode.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Features */}
                  {mode.features && mode.features.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-700 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2 flex-shrink-0"></div>
                          <span>{feature.feature_text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Learn More Button */}
                  {mode.link_url && mode.link_url.startsWith('http') ? (
                    <a
                      href={mode.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span>{t('academic.learn_more', 'Learn More')}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  ) : (
                    <Link
                      to={mode.link_url || `/courses?mode=${mode.mode}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span>{t('academic.learn_more', 'Learn More')}</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
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

