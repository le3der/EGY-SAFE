import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Target, Users } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <>
      <SEO 
        title={t('من نحن', 'About Us')} 
        description={t('شركة EGY SAFE الرائدة في الأمن السيبراني في مصر والشرق الأوسط.', 'EGY SAFE is the leading cybersecurity provider in Egypt and the MENA region.')}
      />
      <div className="pt-32 pb-20 relative z-10 max-w-5xl mx-auto px-6 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('نحن درعك السيبراني', 'We Are Your Cyber Shield')}</h1>
        <p className="text-lg text-neutral-400 max-w-3xl mx-auto mb-16">
          {t(
            'نهدف إلى توفير حماية سيبرانية استباقية للشركات المصرية والشرق أوسطية عبر دمج الذكاء الاصطناعي مع الخبرة البشرية للتصدي للتهديدات قبل وقوعها.',
            'Our mission is to provide proactive enterprise cybersecurity to Egyptian and MENA businesses by combining AI with human intelligence.'
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
          <div className="cyber-glass-card p-8 group hover:border-cyan/50 transition-colors">
            <Target className="w-10 h-10 text-cyan mb-4" />
            <h3 className="text-xl font-bold mb-3">{t('مهمتنا', 'Our Mission')}</h3>
            <p className="text-neutral-400 text-sm">{t('تمكين المؤسسات من العمل بآمان في عصر رقمي مليء بالتهديدات المتطورة باستمرار.', 'Empowering enterprises to operate securely in an increasingly hostile digital landscape.')}</p>
          </div>
          <div className="cyber-glass-card p-8 group hover:border-cyan/50 transition-colors">
            <Shield className="w-10 h-10 text-cyan mb-4" />
            <h3 className="text-xl font-bold mb-3">{t('قيمنا', 'Our Values')}</h3>
            <p className="text-neutral-400 text-sm">{t('الشفافية، السرعة في الاستجابة، والابتكار المستمر لمواجهة أحدث ثغرات يوم-الصفر.', 'Transparency, rapid incident response, and continuous innovation against 0-day threats.')}</p>
          </div>
          <div className="cyber-glass-card p-8 group hover:border-cyan/50 transition-colors">
            <Users className="w-10 h-10 text-cyan mb-4" />
            <h3 className="text-xl font-bold mb-3">{t('فريقنا', 'Our Team')}</h3>
            <p className="text-neutral-400 text-sm">{t('خبراء أمن سيبراني معتمدين دولياً مع خبرة تتجاوز العقد في حماية كبرى المؤسسات المالية والحكومية.', 'Internationally certified cyber experts with over a decade of experience securing top-tier financial and government assets.')}</p>
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-10 bg-black/50 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-8">{t('أرقامنا تتحدث', 'Our Impact in Numbers')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold text-cyan mb-2">150+</div>
              <div className="text-sm text-neutral-400">{t('عميل نشط', 'Active Clients')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan mb-2">24/7</div>
              <div className="text-sm text-neutral-400">{t('مراقبة مستمرة', 'SOC Monitoring')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan mb-2">10k+</div>
              <div className="text-sm text-neutral-400">{t('تهديد تم إحباطه', 'Threats Mitigated')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan mb-2">99.9%</div>
              <div className="text-sm text-neutral-400">{t('وقت التشغيل', 'Uptime SLA')}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
