import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crosshair, Fingerprint, Code, Server, Shield } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface SecurityAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityAssessmentModal({ isOpen, onClose }: SecurityAssessmentModalProps) {
  const modalRef = useModalAccessibility(isOpen, onClose);
  
  const assessments = [
    {
      title: 'Red Teaming',
      icon: <Crosshair className="w-6 h-6 text-red" />,
      color: 'red',
      description: 'Adversary simulation mimicking real-world APTs to test your organization\'s detection and response capabilities across all domains (cyber, physical, social).'
    },
    {
      title: 'Network Penetration Testing',
      icon: <Server className="w-6 h-6 text-blue-500" />,
      color: 'blue-500',
      description: 'Comprehensive vulnerability discovery and exploitation of internal and external network infrastructure to identify critical security flaws.'
    },
    {
      title: 'Web & Mobile App Testing',
      icon: <Code className="w-6 h-6 text-emerald-500" />,
      color: 'emerald-500',
      description: 'Deep-dive security assessments of web and mobile applications to uncover OWASP Top 10 vulnerabilities, business logic flaws, and API weaknesses.'
    },
    {
      title: 'Social Engineering',
      icon: <Fingerprint className="w-6 h-6 text-purple-500" />,
      color: 'purple-500',
      description: 'Simulated phishing, vishing, and physical intrusion attempts to evaluate employee awareness and existing physical security controls.'
    },
    {
      title: 'Purple Teaming',
      icon: <Shield className="w-6 h-6 text-cyan" />,
      color: 'cyan',
      description: 'Collaborative exercises where our offensive experts (Red) work directly with your defensive teams (Blue) to build and validate robust detection rules.'
    }
  ];

  const overlayVariants: any = {
    hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
    visible: { 
      opacity: 1, 
      backdropFilter: 'blur(4px)',
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      backdropFilter: 'blur(0px)',
      transition: { duration: 0.3 }
    }
  };

  const modalVariants: any = {
    hidden: { opacity: 0, scale: 0.96, x: 40, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 280, 
        damping: 24, 
        mass: 0.8 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.96, 
      x: -20, 
      y: 10,
      transition: { 
        type: "spring", 
        stiffness: 280, 
        damping: 24, 
        mass: 0.8 
      }
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.15,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 220, damping: 20 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-white/80 dark:bg-black/80 z-[100]"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-black dark:text-white">Security Assessments Catalog</h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">Explore our comprehensive range of offensive security services.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto w-full no-scrollbar">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {assessments.map((assessment, index) => (
                    <motion.div 
                      key={index} 
                      variants={itemVariants}
                      className="p-5 rounded-xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#111] hover:border-black/20 dark:hover:border-white/20 transition-colors group"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 border border-black/5 dark:border-white/5`}>
                        {assessment.icon}
                      </div>
                      <h3 className="text-lg font-bold text-black dark:text-white mb-2">{assessment.title}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {assessment.description}
                      </p>
                    </motion.div>
                  ))}
                  
                  {/* Custom Scope Card */}
                  <motion.div variants={itemVariants} className="p-5 rounded-xl border border-dashed border-black/20 dark:border-white/20 bg-transparent flex flex-col items-center justify-center text-center min-h-[200px]">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2">Need a custom scope?</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      We tailor our engagements to your specific business logic, compliance needs, and threat model.
                    </p>
                    <button 
                      onClick={() => {
                        trackEvent('contact_sales_clicked', { source: 'SecurityAssessmentModal' });
                        onClose();
                      }} 
                      className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                    >
                      Contact Sales
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
