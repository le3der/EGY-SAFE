import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicy() {
  const { lang, t } = useLanguage();
  
  return (
    <LegalPageLayout
      title={lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
      tag={lang === 'ar' ? 'الخصوصية' : 'PRIVACY'}
      description={lang === 'ar' ? 'كيف نقوم بجمع، استخدام، وحماية بياناتك' : 'How we collect, use, and protect your data'}
      lastUpdated="April 22, 2026"
    >
      <h2>{lang === 'ar' ? '1. المقدمة' : '1. Introduction'}</h2>
      <p>{lang === 'ar' ? 'إيجي سيف ("نحن") تحترم خصوصيتك وتلتزم بحماية بياناتك الشخصية...' : 'Egy Safe ("we") respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our platform or website.'}</p>
      
      <h2>{lang === 'ar' ? '2. البيانات التي نجمعها' : '2. Data We Collect'}</h2>
      <ul>
        <li>{lang === 'ar' ? 'بيانات الحساب: الاسم، البريد الإلكتروني، اسم الشركة، الوظيفة.' : 'Account data: name, email, company name, role.'}</li>
        <li>{lang === 'ar' ? 'بيانات الاستخدام: السجلات، عناوين IP، نوع المتصفح، طوابع تسجيل الدخول.' : 'Usage data: logs, IP addresses, browser type, session timestamps.'}</li>
        <li>{lang === 'ar' ? 'بيانات الفحص: الأصول والنطاقات التي تطلب منا مراقبتها.' : 'Scan data: assets and domains you request us to monitor.'}</li>
        <li>{lang === 'ar' ? 'بيانات الكوكيز: راجع سياسة الكوكيز.' : 'Cookie data: see Cookie Policy.'}</li>
      </ul>

      <h2>{lang === 'ar' ? '3. كيف نستخدم بياناتك' : '3. How We Use Your Data'}</h2>
      <ul>
        <li>{lang === 'ar' ? 'توفير خدمات مراقبة التهديدات والاستخبارات.' : 'Provide threat intelligence and monitoring services.'}</li>
        <li>{lang === 'ar' ? 'تحسين منتجاتنا وتجربة المستخدم.' : 'Improve our products and user experience.'}</li>
        <li>{lang === 'ar' ? 'الامتثال للمتطلبات القانونية والتنظيمية.' : 'Comply with legal and regulatory requirements.'}</li>
        <li>{lang === 'ar' ? 'إرسال تحديثات وتنبيهات أمنية.' : 'Communicate security updates and alerts.'}</li>
      </ul>

      <h2>{lang === 'ar' ? '4. الأساس القانوني (GDPR و PDPL)' : '4. Legal Basis (GDPR)'}</h2>
      <p>{lang === 'ar' ? 'نحن نعالج بياناتك بناءً على أداء العقد، الموافقة الصريحة، الالتزامات القانونية، أو المصلحة المشروعة في تقديم خدمات الكشف عن الثغرات الأمنية.' : 'We process your data based on contract performance, explicit consent, legal obligations, or legitimate interest in delivering our security services.'}</p>

      <h2>{lang === 'ar' ? '5. مشاركة البيانات' : '5. Data Sharing'}</h2>
      <p>{lang === 'ar' ? 'نحن لا نبيع بياناتك أبداً. قد نشارك بياناة محدودة مع: مزودي البنية التحتية الموثوقين (مثل Google Cloud)، الهيئات القانونية عند الطلب الرسمي، ومراجعي الأمن المعتمدين.' : 'We never sell your data. We may share limited data with: trusted infrastructure providers (Google Cloud, Firebase), legal authorities upon formal request, and certified security auditors.'}</p>

      <h2>{lang === 'ar' ? '6. الاحتفاظ بالبيانات' : '6. Data Retention'}</h2>
      <p>{lang === 'ar' ? 'نحتفظ ببيانات الحساب طوال فترة اشتراكك، وبيانات الفحص لمدة 12 شهراً بعد الإنهاء، وسجلات الأمان لمدة 24 شهراً للامتثال.' : 'We retain account data for the duration of your subscription, scan data for 12 months after termination, and security logs for 24 months for compliance.'}</p>

      <h2>{lang === 'ar' ? '7. حقوقك' : '7. Your Rights'}</h2>
      <p>{lang === 'ar' ? 'لديك الحق في الوصول لتصحيح، مسح، تقييد النقل، أو الاعتراض على بياناتك. لممارسة حقوقك تواصل معنا على: privacy@egysafe.com' : 'You have the right to access, rectify, erase, restrict processing, port data, and object. To exercise: privacy@egysafe.com'}</p>

      <h2>{lang === 'ar' ? '8. الأمان' : '8. Security'}</h2>
      <p>{lang === 'ar' ? 'نقوم بتطبيق تشفير AES-256 أثناء حفظ البيانات، و TLS 1.3 أثناء نقلها، ونلزم الموظفين بالمصادقة الثنائية، إلى جانب تدقيقات أمنية ربع سنوية.' : 'We apply AES-256 encryption at rest, TLS 1.3 in transit, mandatory MFA for staff, and quarterly security reviews.'}</p>

      <h2>{lang === 'ar' ? '9. للتواصل' : '9. Contact'}</h2>
      <p>{lang === 'ar' ? 'للاستفسارات، تواصل مع مسؤول الخصوصية على: privacy@egysafe.com — القاهرة، مصر.' : 'For inquiries: privacy@egysafe.com — Cairo, Egypt.'}</p>
    </LegalPageLayout>
  );
}
