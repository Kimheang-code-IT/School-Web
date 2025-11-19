import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import contactInfoData from '../data/contactInfo.json';

const Contact = () => {
  const contactInfo = contactInfoData;
  const isLoading = false;

  // Format address display
  const getAddress = () => {
    if (!contactInfo) return '';
    
    const parts = [];
    if (contactInfo.address_line1) parts.push(contactInfo.address_line1);
    if (contactInfo.city) parts.push(contactInfo.city);
    if (contactInfo.country) parts.push(contactInfo.country);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600">
              Get in touch with us for any questions or support
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
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
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
                  <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
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
                <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
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
                  <p className="text-gray-500 text-sm">No address available</p>
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
                  <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
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

          {/* Map Placeholder */}
          <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="font-semibold">Map Location</p>
              <p className="text-sm mt-1">{getAddress()}</p>
              <p className="text-xs mt-2 text-gray-400">Interactive map would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
