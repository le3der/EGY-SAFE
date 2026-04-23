import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { ContactForm } from '../components/Forms'; // We will reuse the current contact form

export default function ContactPage() {
  const { lang, t } = useLanguage();
  
  return (
    <>
      <SEO 
        title={lang === 'ar' ? 'اتصل بنا' : 'Contact Us'} 
        description={lang === 'ar' ? 'تواصل مع فريق المبيعات والدعم الفني.' : 'Get in touch with our sales and technical support team.'}
      />
      <div className="pt-32 pb-20 relative z-10 max-w-4xl mx-auto px-6 text-white min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-4 text-center">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h1>
        <p className="text-center text-neutral-400 mb-12">
          {lang === 'ar' ? 'نحن هنا لمساعدتك في تأمين شركتك.' : 'We are here to help secure your enterprise.'}
        </p>
        
        <div className="cyber-glass-card p-8 md:p-12">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
