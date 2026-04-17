import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bug, ShoppingCart, Radar, Server, Filter, BellRing, ChevronDown } from 'lucide-react';

const howItWorksSteps = [
  { 
    num: '01', 
    icon: <Bug className="w-6 h-6" />, 
    title: "Device Compromise", 
    desc: "Millions of devices are infected with info-stealer malware — delivered via cracked software, torrents, phishing, and other attack vectors.",
    details: "The infection often starts with an employee downloading a malicious file. It spreads rapidly, stealing cookies, passwords, and autologin tokens directly from the browser before the user even realizes they're compromised."
  },
  { 
    num: '02', 
    icon: <ShoppingCart className="w-6 h-6" />, 
    title: "Credentials Hit the Market", 
    desc: "Attackers publish stolen credentials and device data on exclusive underground marketplaces across multiple platforms.",
    details: "Within hours of the infection, underground forums and Telegram channels are flooded with automated bot logs. Prices for enterprise credentials can range from $10 to $500 depending on the target's revenue."
  },
  { 
    num: '03', 
    icon: <Radar className="w-6 h-6" />, 
    title: "We Monitor Everything", 
    desc: "Our engine monitors dark web marketplaces, hacking forums, private clouds, underground channels, Telegram, Discord, and paste sites — continuously.",
    details: "Egy Safe deploys automated scrapers and utilizes human intelligence operatives who actively infiltrate private, invite-only cybercriminal groups to intercept data before it goes mainstream."
  },
  { 
    num: '04', 
    icon: <Server className="w-6 h-6" />, 
    title: "C2 Server Intelligence", 
    desc: "By exploiting vulnerabilities in info-stealer Command-and-Control servers, we capture stolen data directly from attacker infrastructure.",
    details: "We don't wait for the data to be sold. By analyzing malware binaries, we uncover the active C2 servers and extract the stolen logs while the hackers are still sorting them."
  },
  { 
    num: '05', 
    icon: <Filter className="w-6 h-6" />, 
    title: "Automated Processing", 
    desc: "All collected data is filtered, validated, and classified through our automated pipelines and fed into the Egy Safe database.",
    details: "Our AI correlation engine automatically maps leaked credentials back to their originating corporate environments, filtering out duplicate or expired logs to eliminate alert fatigue."
  },
  { 
    num: '06', 
    icon: <BellRing className="w-6 h-6" />, 
    title: "Real-Time Alerts & Mitigation", 
    desc: "We deliver real-time breach alerts to your team and provide hands-on guidance to eliminate the risk before damage is done.",
    details: "You receive an instant notification via API, email, or Slack containing the exact stolen asset, along with a 1-click mitigation playbook to instantly invalidate the exposed tokens."
  }
];

export default function InteractiveTimeline() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    // Intersection Observer for timeline steps to fade them in initially
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const steps = document.querySelectorAll('.timeline-step-interactive');
    steps.forEach(step => stepObserver.observe(step));
    
    return () => stepObserver.disconnect();
  }, []);

  return (
    <div className="relative max-w-5xl mx-auto py-10">
      {/* Vertical Line */}
      <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-black/10 dark:bg-white/10 -translate-x-1/2 z-0">
        {/* Animated progressive line based on active step - could be added here */}
      </div>
      
      {howItWorksSteps.map((step, index) => {
        const isActive = activeStep === index;
        
        return (
          <div 
            key={index} 
            className={`relative flex flex-col md:flex-row items-center justify-between w-full mb-12 lg:mb-20 timeline-step-interactive opacity-0 translate-y-8 transition-all duration-700 ease-out md:even:flex-row-reverse group`}
          >
            {/* Center Node */}
            <div 
              className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 cursor-pointer ${
                isActive 
                  ? 'bg-cyan border-cyan shadow-[0_0_20px_rgba(0,194,255,0.4)] scale-110' 
                  : 'bg-black border-cyan/50 shadow-[0_0_15px_rgba(0,194,255,0.1)] hover:border-cyan hover:scale-105'
              }`}
              onClick={() => setActiveStep(isActive ? null : index)}
            >
              <span className={`text-sm font-bold transition-colors ${isActive ? 'text-black' : 'text-cyan'}`}>
                {step.num}
              </span>
            </div>

            {/* Empty Spacer for alternating layout */}
            <div className="hidden md:block w-[calc(50%-3rem)]"></div>

            {/* Interactive Content Card */}
            <div className="w-full pl-16 md:pl-0 md:w-[calc(50%-3rem)] relative z-10">
              <div 
                onClick={() => setActiveStep(isActive ? null : index)}
                className={`cyber-glass-card p-6 md:p-8 cursor-pointer transition-all duration-500 hover:shadow-xl ${
                  isActive 
                    ? 'border-cyan/50' 
                    : 'border-white/5 hover:border-cyan/30'
                }`}
              >
                <div className={`cyber-glass-card-glow ${isActive ? 'opacity-100 scale-150 text-cyan/30' : 'text-cyan/10'}`}></div>
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-lg transition-colors duration-300 ${isActive ? 'bg-cyan text-black' : 'bg-cyan/10 text-cyan'}`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  
                  {/* Chevron Toggle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 bg-white/5 ${isActive ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
                
                <p className="text-neutral-400 leading-relaxed mt-4 relative z-10">
                  {step.desc}
                </p>
                
                {/* Expanded Details Animation */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden relative z-10"
                    >
                      <div className="pt-6 mt-6 border-t border-white/10">
                        <div className="flex gap-3">
                          <div className="w-1.5 rounded-full bg-cyan shrink-0"></div>
                          <p className="text-sm font-medium text-white/80 leading-relaxed">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
