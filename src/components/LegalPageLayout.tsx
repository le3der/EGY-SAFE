import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Mail, ArrowRight } from 'lucide-react';
import SEO from './SEO';
import { useLanguage } from '../context/LanguageContext';

interface LegalPageLayoutProps {
  title: string;
  tag: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, tag, description, lastUpdated, children }: LegalPageLayoutProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] overflow-y-auto text-neutral-300">
      <SEO title={title} description={description} />
      
      {/* Top Nav */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors focus:outline-none focus:text-white">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('العودة للرئيسية', 'Back to Home')}
        </button>
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors focus:outline-none focus:bg-white/10" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24 pt-8">
        <div className="mb-12">
          <span className="inline-block px-3 py-1 rounded-full border border-cyan/30 text-cyan text-[10px] font-bold tracking-widest uppercase mb-6">
            {tag}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{title}</h1>
          <p className="text-lg text-neutral-400 mb-6">{description}</p>
          <p className="text-sm text-neutral-500 border-b border-white/10 pb-8">
            {t('آخر تحديث: ', 'Last updated: ')}{lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert prose-p:text-neutral-300 prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-li:text-neutral-300 max-w-none">
          {children}
        </div>

        {/* Bottom Nav */}
        <div className="mt-24 pt-8 border-t border-white/10 flex justify-between items-center">
          <a href="mailto:legal@egysafe.com" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
            legal@egysafe.com
          </a>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-cyan hover:text-cyan/80 transition-colors focus:outline-none">
            {t('العودة للرئيسية', 'Back to Home')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
