import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import contactInfoData from '../data/contactInfo.json';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const contactInfo = contactInfoData;

  // Format address display
  const getAddress = () => {
    if (!contactInfo) return '';
    
    const parts = [];
    if (contactInfo.address_line1) parts.push(contactInfo.address_line1);
    if (contactInfo.city) parts.push(contactInfo.city);
    if (contactInfo.country) parts.push(contactInfo.country);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2">
          {/* Company Info - Full width on mobile, then in grid */}
          <div className="col-span-3 sm:col-span-1 space-y-2 sm:space-y-4">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <img 
                src="/logo.png" 
                alt="ដំណាក់សិក្សា - Learning Platform"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                onError={(e) => {
                  console.log('Logo failed to load, using fallback');
                  e.target.style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-bold text-white font-khmer-muol group-hover:text-primary-400 transition-colors">
                  ដំណាក់សិក្សា
                </span>
                <span className="text-[10px] sm:text-xs text-gray-300 font-medium">
                  LEARNING FOR GROWING
                </span>
              </div>
            </Link>
            <p className="text-gray-300 text-xs sm:text-sm">
              Your one-stop destination for shopping and learning in Cambodia. 
              Quality products and professional courses at your fingertips.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {contactInfo?.facebook_link && (
                <a 
                  href={contactInfo.facebook_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.instagram_link && (
                <a 
                  href={contactInfo.instagram_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.telegram_link && (
                <a 
                  href={contactInfo.telegram_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.tiktok_link && (
                <a 
                  href={contactInfo.tiktok_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold">Quick Links</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/shop" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Shop
              </Link>
              <Link to="/courses" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Courses
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold">Customer Service</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Contact Us
              </Link>
              <Link to="/help" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Help Center
              </Link>
              <Link to="/shipping" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Shipping Info
              </Link>
              <Link to="/returns" className="block text-gray-300 hover:text-white transition-colors text-xs sm:text-sm">
                Returns
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-semibold">Contact Info</h3>
            {contactInfo ? (
              <div className="space-y-2 sm:space-y-3">
                {getAddress() && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                    <span className="text-gray-300 text-xs sm:text-sm">
                      {getAddress()}
                    </span>
                  </div>
                )}
                {contactInfo?.phone_primary && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                    <a 
                      href={`tel:${contactInfo.phone_primary}`}
                      className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm"
                    >
                      {contactInfo.phone_primary}
                    </a>
                  </div>
                )}
                {contactInfo?.email_primary && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${contactInfo.email_primary}`}
                      className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm break-all"
                    >
                      {contactInfo.email_primary}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">Contact information unavailable</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 sm:space-y-4 md:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © {currentYear} WebsiteEcom. All rights reserved.
            </p>
            <div className="flex space-x-4 sm:space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
