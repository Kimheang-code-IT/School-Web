import React from 'react';
import { Send } from 'lucide-react';
import { useUI } from '../context/UIContext.jsx';
import contactInfoData from '../data/contactInfo.json';

const ChatbotWrapper = () => {
  const { isCartOpen, isRegistrationOpen, isCheckoutOpen } = useUI();

  // Hide Telegram button when cart, checkout, or registration drawer is open
  if (isCartOpen || isCheckoutOpen || isRegistrationOpen) {
    return null;
  }

  // Get Telegram link from contact info
  const telegramLink = contactInfoData?.telegram_link || '#';
  const hasLink = telegramLink && telegramLink !== '#';

  // Telegram icon button in the same location where chatbot was (bottom-right corner)
  const buttonClassName = "fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50";

  if (hasLink) {
    return (
      <a
        href={telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClassName}
        title="Contact us on Telegram"
        aria-label="Contact us on Telegram"
      >
        <Send className="w-6 h-6" />
      </a>
    );
  }

  // Show button even without link (user can add link later)
  return (
    <div
      className={`${buttonClassName} opacity-75 cursor-default`}
      title="Telegram (link not configured - add telegram_link to contactInfo.json)"
      aria-label="Telegram"
    >
      <Send className="w-6 h-6" />
    </div>
  );
};

export default ChatbotWrapper;