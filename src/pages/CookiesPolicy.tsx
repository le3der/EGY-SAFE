import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { useLanguage } from '../context/LanguageContext';

export default function CookiesPolicy() {
  const { lang, t } = useLanguage();
  
  return (
    <LegalPageLayout
      title={lang === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
      tag={lang === 'ar' ? 'الكوكيز' : 'COOKIES'}
      description={lang === 'ar' ? 'استخدامنا لملفات تعريف الارتباط والتقنيات المشابهة' : 'Our use of cookies and similar technologies'}
      lastUpdated="April 22, 2026"
    >
      <h2>{lang === 'ar' ? '1. ما هي الكوكيز؟' : '1. What Are Cookies?'}</h2>
      <p>{lang === 'ar' ? 'الكوكيز هي ملفات نصية صغيرة تخزن على جهازك لتذكر تفضيلاتك وتحسين تجربتك.' : 'Cookies are small text files stored on your device to remember your preferences and improve your experience.'}</p>
      
      <h2>{lang === 'ar' ? '2. أنواع الكوكيز التي نستخدمها' : '2. Types of Cookies We Use'}</h2>
      <ul>
        <li><strong>{lang === 'ar' ? 'ضرورية: ' : 'Essential: '}</strong>{lang === 'ar' ? 'للمصادقة وحماية CSRF (XSRF-TOKEN). لا يمكن تعطيلها.' : 'For authentication and CSRF protection (XSRF-TOKEN). Cannot be disabled.'}</li>
        <li><strong>{lang === 'ar' ? 'وظيفية: ' : 'Functional: '}</strong>{lang === 'ar' ? 'تذكر اللغة وتفضيل الوضع الداكن.' : 'Remember language and dark mode preference.'}</li>
        <li><strong>{lang === 'ar' ? 'تحليلية: ' : 'Analytics: '}</strong>{lang === 'ar' ? 'تحليلات جوجل لفهم استخدام الموقع (مجهولة الهوية).' : 'Google Analytics to understand site usage (anonymized).'}</li>
        <li><strong>{lang === 'ar' ? 'تسويقية: ' : 'Marketing: '}</strong>{lang === 'ar' ? 'لا تستخدم حالياً.' : 'Not currently used.'}</li>
      </ul>

      <h2>{lang === 'ar' ? '3. إدارة الكوكيز' : '3. Managing Cookies'}</h2>
      <p>{lang === 'ar' ? 'يمكنك إدارة الكوكيز من خلال إعدادات متصفحك. قد يؤدي تعطيل الكوكيز الضرورية إلى منع تسجيل الدخول.' : 'You can manage cookies via your browser settings. Disabling essential cookies may prevent login.'}</p>

      <h2>{lang === 'ar' ? '4. كوكيز الطرف الثالث' : '4. Third-Party Cookies'}</h2>
      <p>{lang === 'ar' ? 'نستخدم جوجل (Firebase Auth، Analytics) كمزود موثوق. وهي تخضع لسياسات جوجل.' : "We use Google (Firebase Auth, Analytics) as a trusted provider. Governed by Google's policies."}</p>
    </LegalPageLayout>
  );
}
