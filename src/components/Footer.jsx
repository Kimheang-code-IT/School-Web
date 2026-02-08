import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import { useContactInfo } from '../hooks/useContactInfo.js';
import { useTranslation } from '../hooks/useTranslation.jsx';
import footerLogo from '../assets/domanksiksaa white logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { data: contactInfo = {} } = useContactInfo();
  const { t } = useTranslation();

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
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
          {/* Company */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start">
              <Link to="/" className="flex-shrink-0">
                <img
                  src={footerLogo}
                  alt="Logo"
                  className="h-9 w-auto sm:h-10 object-contain opacity-95 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed min-w-0 sm:max-w-xs">
                {t('footer.tagline', 'Your one-stop destination for shopping and learning in Cambodia.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {contactInfo?.facebook_link && (
                <a href={contactInfo.facebook_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.instagram_link && (
                <a href={contactInfo.instagram_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.telegram_link && (
                <a href={contactInfo.telegram_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors" aria-label="Telegram">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {contactInfo?.tiktok_link && (
                <a href={contactInfo.tiktok_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-colors" aria-label="TikTok">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">{t('footer.quick_links', 'Quick Links')}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/shop" className="text-gray-400 hover:text-white text-sm transition-colors w-fit">
                {t('footer.shop', 'Shop')}
              </Link>
              <Link to="/courses" className="text-gray-400 hover:text-white text-sm transition-colors w-fit">
                {t('footer.courses', 'Courses')}
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors w-fit">
                {t('footer.contact_page', 'Contact')}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">{t('footer.contact', 'Contact')}</h3>
            {contactInfo ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400">
                {getAddress() && (
                  <>
                    <span className="inline-flex items-center gap-1.5 whitespace-wrap">
                      <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      {getAddress()}
                    </span>
                    
                  </>
                )}
                {contactInfo?.phone_primary && (
                  <>
                    <a href={`tel:${contactInfo.phone_primary}`} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors">
                      <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                      {contactInfo.phone_primary}
                    </a>
                    {contactInfo?.email_primary && <span className="text-gray-600">·</span>}
                  </>
                )}
                {contactInfo?.email_primary && (
                  <a href={`mailto:${contactInfo.email_primary}`} className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-white transition-colors break-all">
                    <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                    {contactInfo.email_primary}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">{t('footer.contact_unavailable', 'Contact information unavailable')}</p>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center">
            © {currentYear} WebsiteEcom. {t('footer.copyright', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
