import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to not overwhelm on initial load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-6 md:max-w-sm z-[100] cyber-glass-card border border-white/10 rounded-xl p-5 bg-[#060606]/95 backdrop-blur-xl shadow-2xl"
          role="dialog"
          aria-labelledby="cookie-banner-title"
        >
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2">
                <Cookie className="w-5 h-5 text-cyan" aria-hidden="true" />
                <h2 id="cookie-banner-title" className="font-bold text-white text-sm">
                  {t('نحن نقدر خصوصيتك', 'We value your privacy')}
                </h2>
             </div>
             <button 
               onClick={declineCookies} 
               className="text-neutral-500 hover:text-white transition-colors"
               aria-label="Close"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
          
          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            {t(
              'نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحليل حركة المرور، وتقديم محتوى مخصص. انقر على "قبول" للموافقة.', 
              'We use cookies to enhance your experience, analyze our traffic, and serve tailored content. Click "Accept" to consent.'
            )}
          </p>

          <div className="flex gap-2">
            <button 
              onClick={acceptCookies}
              className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors focus:ring-2 focus:ring-cyan focus:outline-none"
            >
              {t('قبول', 'Accept')}
            </button>
            <button 
              onClick={declineCookies}
              className="flex-1 bg-transparent border border-white/20 text-white py-2 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              {t('رفض الضروري فقط', 'Essential Only')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
