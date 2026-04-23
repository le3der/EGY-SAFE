import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { Send, Terminal, ShieldAlert } from 'lucide-react';

export default function CareersPage() {
  const { t } = useLanguage();
  
  const jobs = [
    {
      title: t('محلل مركز العمليات الأمنية (SOC Analyst)', 'SOC Analyst (L2)'),
      type: t('دوام كامل', 'Full Time'),
      location: t('القاهرة, مصر (متاح العمل عن بعد)', 'Cairo, Egypt (Hybrid)'),
      req: t('خبرة سنتين+', '2+ Years Exp')
    },
    {
      title: t('خبير اختبار اختراق (Penetration Tester)', 'Senior Penetration Tester'),
      type: t('دوام كامل', 'Full Time'),
      location: t('عن بعد', 'Remote'),
      req: t('خبرة 5 سنوات+ وشهادة OSCP', '5+ Years Exp, OSCP required')
    }
  ];

  return (
    <>
      <SEO 
        title={t('الوظائف', 'Careers')} 
        description={t('انضم إلى فريق النخبة في EGY SAFE. نحن نبحث عن خبراء ومحللي أمن سيبراني طموحين.', 'Join the elite hacking and defense team at EGY SAFE. We are actively hiring.')}
      />
      <div className="pt-32 pb-20 relative z-10 max-w-5xl mx-auto px-6 text-white min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('انضم إلى النخبة', 'Join the Elite')}</h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">{t('نحن دائماً نبحث عن المواهب الاستثنائية التي لديها شغف حقيقي بتأمين المستقبل الرقمي للشركات.', 'We are constantly looking for exceptional talent with a true passion for securing the digital future of enterprises.')}</p>
        </div>

        <div className="space-y-6">
          {jobs.map((job, idx) => (
            <div key={idx} className="cyber-glass-card p-6 border-l-2 border-l-cyan flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/5 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-neutral-400 font-mono">
                  <span className="flex items-center gap-1"><Terminal className="w-4 h-4" /> {job.type}</span>
                  <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> {job.req}</span>
                  <span>📍 {job.location}</span>
                </div>
              </div>
              <a 
                href={`mailto:careers@egysafe.com?subject=Application for ${job.title}`}
                className="shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-cyan/10 text-cyan border border-cyan/20 px-6 py-3 rounded-lg font-bold text-sm tracking-wider uppercase transition-all"
              >
                <Send className="w-4 h-4" /> {t('قدّم الآن', 'Apply via Email')}
              </a>
            </div>
          ))}

          <div className="mt-12 p-8 border border-dashed border-white/20 rounded-2xl text-center bg-black/20">
            <h3 className="text-lg font-bold mb-2">{t('لم تجد وظيفتك المناسبة؟', 'Don\'t see an open role?')}</h3>
            <p className="text-neutral-400 text-sm mb-4">
              {t('أرسل سيرتك الذاتية إلينا وسنقوم بالتواصل معك فور توفر مقعد لك.', 'Drop your resume at careers@egysafe.com. We are always hiring offensive and defensive talent.')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
