import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { ShieldCheck, FileText, Lock, Globe, Award, Users } from 'lucide-react';

export default function TrustSignals() {
  const { t } = useLanguage();

  const certs = [
    { icon: <ShieldCheck className="w-8 h-8 text-cyan mb-4" />, title: 'ISO 27001', subtitle: 'INFOSEC MANAGEMENT' },
    { icon: <FileText className="w-8 h-8 text-cyan mb-4" />, title: 'SOC 2 Type II', subtitle: 'IN PROGRESS' },
    { icon: <Lock className="w-8 h-8 text-cyan mb-4" />, title: 'GDPR', subtitle: 'COMPLIANT' },
    { icon: <Globe className="w-8 h-8 text-cyan mb-4" />, title: 'Egypt PDPL', subtitle: 'COMPLIANT' },
    { icon: <Award className="w-8 h-8 text-cyan mb-4" />, title: 'CREST', subtitle: 'CERTIFIED ANALYSTS' },
    { icon: <Users className="w-8 h-8 text-cyan mb-4" />, title: 'OSCP / CISSP', subtitle: 'TEAM CERTS' },
  ];

  const clients = [
    "بنك القاهرة", "فودافون مصر", "فوري", "Talabat", "CIB", "Banque Misr"
  ];

  return (
    <section className="py-24 relative bg-transparent text-white border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-bold tracking-[0.2em] text-cyan uppercase mb-4">
            {t('موثوق من قبل قادة الأمن', 'TRUSTED BY SECURITY LEADERS')}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t('شهادات وامتثال بمعايير عالمية', 'World-Class Certifications & Compliance')}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-20">
          {certs.map((cert, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm hover:border-cyan/30 transition-colors"
            >
              {cert.icon}
              <h3 className="text-lg font-bold text-white mb-2">{cert.title}</h3>
              <p className="text-[10px] md:text-xs font-medium tracking-widest text-neutral-500 uppercase">{cert.subtitle}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-neutral-500 uppercase mb-8">
            {t('نخدم كبرى المؤسسات في المنطقة', 'SERVING LEADING ENTERPRISES ACROSS THE REGION')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 mb-8">
            {clients.map((client, idx) => (
              <span key={idx} className="text-xl md:text-2xl font-bold text-neutral-300">
                {client}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-600 italic">
            {t('* أمثلة توضيحية لقطاعات العملاء. الأسماء الفعلية محمية بموجب اتفاقيات عدم الإفصاح.', '* Illustrative examples of client sectors. Actual names protected under NDA.')}
          </p>
        </div>
      </div>
    </section>
  );
}
