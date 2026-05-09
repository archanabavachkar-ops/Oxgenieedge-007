import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AIAssistantPopup from './AIAssistantPopup.jsx';

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  };

  return (
    <>
      <AIAssistantPopup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onMinimize={() => setIsOpen(false)} 
      />
      
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[50px] h-[50px] md:w-[60px] md:h-[60px] bg-[#F97316] text-white rounded-full shadow-lg hover:shadow-2xl flex items-center justify-center z-50 focus:outline-none focus:ring-4 focus:ring-[#F97316]/50 transition-shadow"
        aria-label="Open AI Assistant"
        aria-expanded={isOpen}
      >
        <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
        
        {unreadCount > 0 && !isOpen && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1F2937]"
            aria-label={`${unreadCount} unread messages`}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </>
  );
}