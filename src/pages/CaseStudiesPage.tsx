import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Landmark, Stethoscope } from 'lucide-react';

export default function CaseStudiesPage() {
  const { t } = useLanguage();
  
  const cases = [
    {
      id: 1,
      icon: <Landmark className="w-8 h-8 text-cyan" />,
      entity: t('مؤسسة مالية كبرى', 'Tier-1 Financial Institution'),
      challenge: t('تعرضت المؤسسة لهجوم متقدم للسيطرة على خوادم الـ Active Directory الداخلية.', 'Faced an Advanced Persistent Threat (APT) targeting internal AD controllers.'),
      solution: t('تم نشر فريق احتواء الهجمات ونظام المراقبة المستمرة، وعزل الأنظمة المصابة في 4 ساعات.', 'Deployed Incident Response and ASM. Isolated compromised assets within 4 hours.'),
      impact: t('إيقاف الهجوم بنسبة 100% بدون أي تسريب لبيانات العملاء.', '100% threat eradication with zero PII exfiltration.'),
    },
    {
      id: 2,
      icon: <Stethoscope className="w-8 h-8 text-cyan" />,
      entity: t('شبكة مستشفيات إقليمية', 'Regional Healthcare Network'),
      challenge: t('هجوم ببرمجيات الفدية (Ransomware) أدى لتوقف العمليات الجراحية المبرمجة.', 'Hit by devastating Ransomware payload halting scheduled surgical operations.'),
      solution: t('تأمين الشبكات المعزولة، وإجراء عملية استعادة آمنة، وتنفيذ نموذج Zero-Trust لتقييد الحركة الأفقية.', 'Secured air-gapped networks, executed safe restore, implemented Zero-Trust to halt lateral movement.'),
      impact: t('استعادة الأنظمة الحيوية خلال 12 ساعة، وتفادي دفع أي فدية.', 'Critical systems restored in < 12 hours. Zero ransom paid.'),
    },
    {
      id: 3,
      icon: <Building2 className="w-8 h-8 text-cyan" />,
      entity: t('منصة تجارية رائدة', 'Leading E-Commerce Platform'),
      challenge: t('وجود ثغرات API تسمح بتسريب معلومات الدفع لآلاف المشتريات يومياً.', 'Hidden API vulnerabilities allowing mass scraping of payment info.'),
      solution: t('إجراء اختبار اختراق لتطبيقات الويب (PenTest)، واكتشاف الـ Endpoints المخفية ترقيعها.', 'Deep Web App PenTest uncovering shadow endpoints. Immediate automated patching protocols applied.'),
      impact: t('تأمين 2 مليون مستخدم، وحصول المنصة على شهادة امتثال PCI-DSS.', 'Secured 2M+ users, enabling the platform to retain full PCI-DSS compliance.'),
    }
  ];

  return (
    <>
      <SEO 
        title={t('دراسات الحالة', 'Case Studies')} 
        description={t('قصص نجاح من أرض الواقع حول كيفية قيام EGY SAFE بحماية أعظم المؤسسات.', 'Real-world success stories detailing how EGY SAFE secures top organizations.')}
      />
      <div className="pt-32 pb-20 relative z-10 max-w-6xl mx-auto px-6 text-white min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('دراسات الحالة', 'Case Studies')}</h1>
          <p className="text-neutral-400 text-lg">{t('نتائج إيجابية قابلة للقياس، حماية حقيقية من المخاطر.', 'Measurable defensive impact against real-world adversaries.')}</p>
        </div>

        <div className="space-y-8">
          {cases.map(c => (
            <div key={c.id} className="cyber-glass-card p-8 md:p-10 border-l-4 border-l-cyan flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl shrink-0">
                {c.icon}
              </div>
              <div className="space-y-4 flex-1">
                <h2 className="text-2xl font-bold">{c.entity}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-red font-bold text-sm uppercase tracking-widest mb-1">{t('التحدي', 'The Challenge')}</h3>
                    <p className="text-neutral-300 text-sm">{c.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-green-500 font-bold text-sm uppercase tracking-widest mb-1">{t('الأثر والنتيجة', 'The Impact')}</h3>
                    <p className="text-neutral-300 text-sm">{c.impact}</p>
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 mt-4">
                  <h3 className="text-cyan font-bold text-sm uppercase tracking-widest mb-1">{t('حل EGY SAFE', 'Our Solution')}</h3>
                  <p className="text-neutral-300 text-sm">{c.solution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
