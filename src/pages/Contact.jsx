import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useContactInfo } from '../hooks/useContactInfo.js';
import { useTranslation } from '../hooks/useTranslation.jsx';

// Google Maps short link (your input)
const MAP_LOCATION_URL = "https://maps.app.goo.gl/uhhp5e7NW32yZCSw5";

// Coordinates extracted from that link redirect:
const MAP_LAT = 11.5585301;
const MAP_LON = 104.8942701;

const BBOX_PAD = 0.012;

const MAP_EMBED_SRC =
  `https://www.openstreetmap.org/export/embed.html?` +
  `bbox=${MAP_LON - BBOX_PAD},${MAP_LAT - BBOX_PAD},${MAP_LON + BBOX_PAD},${MAP_LAT + BBOX_PAD}` +
  `&layer=mapnik&marker=${MAP_LAT},${MAP_LON}`;




const Contact = () => {
  const { data: contactInfo = {}, loading: isLoading } = useContactInfo();
  const { t } = useTranslation();

  // Format address with line breaks for display
  const getFormattedAddress = () => {
    if (!contactInfo) return [];
    
    const lines = [];
    if (contactInfo.address_line1) lines.push(contactInfo.address_line1);
    if (contactInfo.city) lines.push(contactInfo.city);
    if (contactInfo.country) lines.push(contactInfo.country);
    
    return lines;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.title', 'Contact Us')}</h1>
            <p className="text-lg text-gray-600">
              {t('contact.subtitle', 'Get in touch with our team')}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            {/* Email */}
            {contactInfo?.email_primary && (
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{t('contact.email', 'Email')}</h3>
                  <a 
                    href={`mailto:${contactInfo.email_primary}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors break-all"
                  >
                    {contactInfo.email_primary}
                  </a>
                </div>
              </div>
            )}

            {/* Phone */}
            {contactInfo?.phone_primary && (
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{t('contact.phone', 'Phone')}</h3>
                  <a 
                    href={`tel:${contactInfo.phone_primary}`}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    {contactInfo.phone_primary}
                  </a>
                </div>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t('contact.address', 'Address')}</h3>
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                ) : contactInfo && getFormattedAddress().length > 0 ? (
                <p className="text-gray-600">
                    {getFormattedAddress().map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < getFormattedAddress().length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">{t('footer.contact_unavailable', 'No address available')}</p>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {(contactInfo?.business_hour_weekday || contactInfo?.business_hour_saturday || contactInfo?.business_hour_sunday) && (
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('contact.business_hours', 'Business Hours')}</h3>
                  {isLoading ? (
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {contactInfo.business_hour_weekday && (
                        <p className="text-gray-600">{contactInfo.business_hour_weekday}</p>
                      )}
                      {contactInfo.business_hour_saturday && (
                        <p className="text-gray-600">{contactInfo.business_hour_saturday}</p>
                      )}
                      {contactInfo.business_hour_sunday && (
                        <p className="text-gray-600">{contactInfo.business_hour_sunday}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Map - OpenStreetMap embed (reliable; Google share links are blocked in iframes) */}
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
            <div className="relative w-full h-80">
              <iframe
                src={MAP_EMBED_SRC}
                title={t('contact.map_title', 'Our location on the map')}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={MAP_LOCATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 px-4 text-center text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
            >
              <MapPin className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              {t('contact.open_in_google_maps', 'Open exact location in Google Maps')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
