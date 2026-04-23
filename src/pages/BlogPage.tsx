import React from 'react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogPage() {
  const { t } = useLanguage();
  
  const posts = [
    {
      id: 1,
      title: t('دليل الـ CISO للاستجابة السريعة للهجمات', 'The CISO Guide to Rapid Incident Response'),
      excerpt: t('كيف تبني استراتيجية فعالة للتصدي להجمات برامج الفدية في الساعات الأولى والحرجة.', 'How to architect a robust Ransomware response strategy during the critical golden hours.'),
      date: 'April 15, 2026',
      category: 'Guides',
    },
    {
      id: 2,
      title: t('الذكاء الاصطناعي في هجمات التصيد', 'Weaponized AI in Phishing Campaigns'),
      excerpt: t('تحليل لأساليب المهاجمين الجديدة في استخدام النماذج اللغوية الكبيرة (LLMs) لاستهداف الموظفين.', 'Analyzing how threat actors currently deploy Large Language Models to bypass standard email gateways.'),
      date: 'March 28, 2026',
      category: 'Threat Intel',
    },
    {
      id: 3,
      title: t('أسس الفريق الأحمر الفعال', 'Foundations of Effective Red Teaming'),
      excerpt: t('لماذا يعتبر اختبار محاكاة الخصوم (Adversary Simulation) ضرورياً لتحديد الثغرات قبل الاستغلال.', 'Why continuous adversary simulation is mandatory to uncover structural vulnerabilities.'),
      date: 'February 10, 2026',
      category: 'Offensive Security',
    },
    {
      id: 4,
      title: t('تأمين البنية التحتية السحابية 2026', 'Securing Cloud Infrastructure in 2026'),
      excerpt: t('أهم التحديات الأمنية في بيئات الـ Multi-Cloud وكيفية تطبيق نموذج Zero-Trust.', 'Overcoming visibility hurdles in Multi-Cloud architectures via Zero-Trust principles.'),
      date: 'January 05, 2026',
      category: 'Cloud Security',
    }
  ];

  return (
    <>
      <SEO 
        title={t('المدونة ومركز الموارد', 'Blog & Resource Center')} 
        description={t('أحدث مقالات وأدلة الأمن السيبراني من خبراء فريق EGY SAFE.', 'The latest cybersecurity articles, threat intel, and tactical guides from EGY SAFE experts.')}
      />
      <div className="pt-32 pb-20 relative z-10 max-w-6xl mx-auto px-6 text-white min-h-screen">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('مركز الموارد', 'Resource Center')}</h1>
          <p className="text-neutral-400 text-lg">{t('رؤى تكتيكية واستراتيجية للمدراء التنفيذيين ومحترفي الأمن السيبراني.', 'Tactical and strategic intelligence for Executives and Security Practitioners.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map(post => (
            <div key={post.id} className="cyber-glass-card p-6 md:p-8 flex flex-col group hover:border-cyan/50 transition-all cursor-pointer">
              <div className="text-xs text-cyan font-bold tracking-widest uppercase mb-3">{post.category}</div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-cyan transition-colors">{post.title}</h2>
              <p className="text-neutral-400 mb-6 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                <span className="text-sm text-neutral-500 font-mono tracking-wider">{post.date}</span>
                <span className="text-cyan text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {t('اقرأ المزيد', 'Read More')}
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
