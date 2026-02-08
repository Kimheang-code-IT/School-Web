import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation.jsx';
import { usePartners } from '../hooks/usePartners.js';

// Fallback: simple logo placeholder (SVG data URI) when image fails or is missing
const FALLBACK_LOGO_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect fill='%23f3f4f6' width='120' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='12'%3E%3Ctspan dy='0'%3ELogo%3C/tspan%3E%3C/text%3E%3C/svg%3E";

const PartnersMarquee = () => {
  const { data: partnersRaw = [], loading: isLoading } = usePartners();
  const [failedImages, setFailedImages] = useState(new Set());

  const { t } = useTranslation();

  const partners = useMemo(() => {
    return Array.isArray(partnersRaw)
      ? partnersRaw
          .filter(partner => partner.is_visible !== false)
          .map(partner => ({
            id: partner.id,
            name: partner.name,
            logo_url: partner.logo_url || partner.logo,
            website_url: partner.website_url || partner.website
          }))
      : [];
  }, [partnersRaw]);

  const handleImageError = (partnerId) => {
    setFailedImages((prev) => new Set(prev).add(partnerId));
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-4 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="flex space-x-8 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-32 h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No partners state
  if (partners.length === 0) {
    return (
      <section className="py-2 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('partners.title', 'Our Value Partners')}
            </h2>
            <p className="text-gray-600">
              {t('partners.no_partners', 'No partners available at the moment')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Create multiple copies for seamless infinite loop
  const createInfiniteLoop = (items, copies = 3) => {
    const result = [];
    for (let i = 0; i < copies; i++) {
      result.push(...items.map((item, index) => ({ ...item, uniqueKey: `${item.id}-${i}-${index}` })));
    }
    return result;
  };

  const infinitePartners = createInfiniteLoop(partners, 3);

  return (
    <section className="py-6 bg-gray-50 w-full">
      {/* Section Header - Centered with full width container */}
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('partners.title', 'Our Value Partners')}
            </h2>
            {/* Refresh Button - Only show if there's an error or for debugging */}
          </div>
          <p className="text-gray-600">
            {t('partners.description', 'Trusted by leading organizations worldwide')}
          </p>
        </div>
      </div>

      {/* Marquee Container - Full Width */}
      <div className="w-full relative overflow-hidden">
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex animate-marquee-smooth hover:pause-marquee py-4 px-4 sm:px-6 lg:px-8">
            {infinitePartners.map((partner, index) => (
              <div
                key={partner.uniqueKey}
                className="flex-shrink-0 mx-6 group"
              >
                {partner.website_url ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:-translate-y-1"
                    title={`Visit ${partner.name} website`}
                  >
                    <div className="w-36 h-24 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-200 group-hover:border-primary-200 overflow-hidden">
                      <div className="w-full h-14 flex items-center justify-center flex-shrink-0 p-1">
                        {partner.logo_url && !failedImages.has(partner.uniqueKey) ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:brightness-110"
                            loading="lazy"
                            onError={() => handleImageError(partner.uniqueKey)}
                          />
                        ) : (
                          <img
                            src={FALLBACK_LOGO_SVG}
                            alt=""
                            className="w-full h-full object-contain opacity-80"
                            aria-hidden
                          />
                        )}
                      </div>
                      <span className="text-gray-500 text-xs font-medium text-center px-2 line-clamp-2 group-hover:text-primary-600 transition-colors flex-shrink-0">
                        {partner.name}
                      </span>
                    </div>
                  </a>
                ) : (
                  <div className="w-36 h-24 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md overflow-hidden">
                    <div className="w-full h-14 flex items-center justify-center flex-shrink-0 p-1">
                      {partner.logo_url && !failedImages.has(partner.uniqueKey) ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain filter grayscale transition-all duration-300"
                          loading="lazy"
                          onError={() => handleImageError(partner.uniqueKey)}
                        />
                      ) : (
                        <img
                          src={FALLBACK_LOGO_SVG}
                          alt=""
                          className="w-full h-full object-contain opacity-80"
                          aria-hidden
                        />
                      )}
                    </div>
                    <span className="text-gray-500 text-xs font-medium text-center px-2 line-clamp-2 flex-shrink-0">
                      {partner.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      {/* Enhanced CSS for smooth marquee animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-smooth {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-marquee-smooth {
          animation: marquee-smooth 30s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }
        
        .hover\\:pause-marquee:hover {
          animation-play-state: paused;
        }
        
        .pause-marquee {
          animation-play-state: paused;
        }
        
        /* Smooth transitions for all elements */
        .group:hover .group-hover\\:scale-105 {
          transform: scale(1.05);
        }
        
        .group:hover .group-hover\\:-translate-y-1 {
          transform: translateY(-4px);
        }
        
        /* Responsive margins only - same speed on all screens */
        @media (max-width: 768px) {
          .group {
            margin-left: 1rem;
            margin-right: 1rem;
          }
        }
        
        /* Smooth hover effects */
        .group:hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />
    </section>
  );
};

export default PartnersMarquee;


