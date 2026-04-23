import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfService() {
  const { lang, t } = useLanguage();
  
  return (
    <LegalPageLayout
      title={lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
      tag={lang === 'ar' ? 'الشروط' : 'TERMS'}
      description={lang === 'ar' ? 'القواعد القانونية لاستخدام خدمات إيجي سيف' : 'The legal rules for using Egy Safe services'}
      lastUpdated="April 22, 2026"
    >
      <h2>{lang === 'ar' ? '1. قبول الشروط' : '1. Acceptance of Terms'}</h2>
      <p>{lang === 'ar' ? 'باستخدامك لخدمات إيجي سيف، فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام المنصة.' : 'By using Egy Safe services, you agree to these terms. If you do not agree, please do not use the platform.'}</p>
      
      <h2>{lang === 'ar' ? '2. الترخيص والاستخدام' : '2. License and Use'}</h2>
      <p>{lang === 'ar' ? 'نمنحك ترخيصاً محدوداً غير حصري وغير قابل للتحويل لاستخدام المنصة وفقاً لخطة اشتراكك. يُحظر: الهندسة العكسية، إعادة البيع، أو الاستخدام في أنشطة غير قانونية.' : 'We grant you a limited, non-exclusive, non-transferable license to use the platform per your subscription plan. Prohibited: reverse engineering, resale, or use in unlawful activities.'}</p>

      <h2>{lang === 'ar' ? '3. حسابات المستخدمين' : '3. User Accounts'}</h2>
      <p>{lang === 'ar' ? 'أنت مسؤول عن سرية بيانات اعتماد حسابك وجميع الأنشطة التي تتم بموجبه. أبلغنا فوراً عن أي اختراق محتمل.' : 'You are responsible for the confidentiality of your account credentials and all activities under it. Notify us immediately of any suspected compromise.'}</p>

      <h2>{lang === 'ar' ? '4. الفوترة والإلغاء' : '4. Billing and Cancellation'}</h2>
      <p>{lang === 'ar' ? 'الاشتراكات تُجدد تلقائياً ما لم يتم إلغاؤها. يبدأ الإلغاء في نهاية فترة الفوترة الحالية. لا توجد استردادات للفترات الجزئية.' : 'Subscriptions auto-renew unless cancelled. Cancellation takes effect at the end of the current billing period. No refunds for partial periods.'}</p>

      <h2>{lang === 'ar' ? '5. اتفاقية مستوى الخدمة (SLA)' : '5. Service Level Agreement (SLA)'}</h2>
      <p>{lang === 'ar' ? 'نلتزم بوقت تشغيل شهري بنسبة 99.9% للخدمات الأساسية. يتم إرسال التنبيهات الحرجة في غضون 15 دقيقة من اكتشافها.' : 'We commit to 99.9% monthly uptime for core services. Critical alerts are dispatched within 15 minutes of detection.'}</p>

      <h2>{lang === 'ar' ? '6. الملكية الفكرية' : '6. Intellectual Property'}</h2>
      <p>{lang === 'ar' ? 'جميع حقوق الملكية الفكرية المتعلقة بمنتجاتنا وخدماتنا وتقاريرنا (باستثناء بياناتك) هي ملك حصري لإيجي سيف.' : 'All intellectual property rights regarding our products, services, and reports (excluding your data) are the exclusive property of Egy Safe.'}</p>
    </LegalPageLayout>
  );
}
