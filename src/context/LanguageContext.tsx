import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  dir: 'ltr' | 'rtl';
  t: (arText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  dir: 'ltr',
  t: (ar, en) => en
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');
  const t = (arText: string, enText: string) => lang === 'ar' ? arText : enText;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, dir: lang === 'ar' ? 'rtl' : 'ltr', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
