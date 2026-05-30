import React from 'react';
import { Mail, Clock, ShieldCheck, Lock, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { ContactForm } from '../components/Forms';

export default function ContactPage() {
  const { lang, t } = useLanguage();

  const assurances = [
    {
      icon: <Clock className="w-5 h-5 text-cyan" />,
      title: t('رد خلال ساعة عمل واحدة', 'Reply within 1 business hour'),
      body: t('يتابع فريق الاستجابة لدينا الطلبات على مدار الساعة.', 'Our response team monitors inquiries around the clock.'),
    },
    {
      icon: <Lock className="w-5 h-5 text-cyan" />,
      title: t('اتصالات مشفّرة', 'Encrypted communications'),
      body: t('تُحمى بياناتك أثناء النقل والتخزين وفق أفضل الممارسات.', 'Your data is protected in transit and at rest using best practices.'),
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-cyan" />,
      title: t('سرية تامة', 'Strict confidentiality'),
      body: t('كل المحادثات تخضع لاتفاقيات عدم الإفصاح.', 'Every conversation is covered under non-disclosure agreements.'),
    },
  ];

  return (
    <>
      <SEO
        title={lang === 'ar' ? 'اتصل بنا' : 'Contact Us'}
        description={lang === 'ar' ? 'تواصل مع فريق المبيعات والدعم الفني.' : 'Get in touch with our sales and technical support team.'}
      />
      <main className="pt-32 pb-20 relative z-10 max-w-6xl mx-auto px-6 text-white min-h-[80vh]">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            {lang === 'ar' ? 'نحن هنا لمساعدتك في تأمين شركتك.' : 'We are here to help secure your enterprise.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Trust / assurance column */}
          <aside className="lg:col-span-2 space-y-4">
            <div className="cyber-glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4">{t('لماذا تتواصل معنا بثقة', 'Why reach out with confidence')}</h2>
              <ul className="space-y-5">
                {assurances.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
                      {a.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{a.title}</h3>
                      <p className="text-neutral-500 text-xs leading-relaxed mt-0.5">{a.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cyber-glass-card p-6 rounded-2xl space-y-3 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan shrink-0" />
                <a href="mailto:contact@egysafe.com" className="hover:text-cyan transition-colors" dir="ltr">
                  contact@egysafe.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan shrink-0" />
                <span>{t('القاهرة، مصر / عن بُعد في الشرق الأوسط', 'Cairo, Egypt / Remote MENA')}</span>
              </div>
            </div>
          </aside>

          {/* Form column */}
          <div className="lg:col-span-3 cyber-glass-card p-8 md:p-10 rounded-2xl">
            <h2 className="text-lg font-bold mb-6">{t('أرسل لنا رسالة', 'Send us a message')}</h2>
            <ContactForm />
          </div>
        </div>
      </main>
    </>
  );
}
