import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Network, ScanSearch, Lock, Terminal, Globe, ChevronRight, Activity, AlertTriangle, Database, Shield, Eye, Radar, ShieldCheck, Bug, ShoppingCart, Server, Filter, BellRing, Plus, Zap, Linkedin, Twitter, Send, Check, ArrowUp, Sun, Moon, ChevronLeft, ArrowRight, Share2 } from 'lucide-react';
import Chatbot from './components/Chatbot';
import LiveThreatFeed from './components/LiveThreatFeed';
import SecurityAssessmentModal from './components/SecurityAssessmentModal';
import DataFlowBackground from './components/DataFlowBackground';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';

const carouselItems = [
  { icon: Globe, name: 'Global Tech Enterprise' },
  { icon: Lock, name: 'Financial Institution' },
  { icon: Shield, name: 'Healthcare Provider' }
];

const StatCounter = ({ end, prefix = '', suffix = '', duration = 2000, delay = 0 }: { end: number, prefix?: string, suffix?: string, duration?: number, delay?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        
        setTimeout(() => {
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          requestAnimationFrame(animate);
        }, delay);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, delay, hasAnimated]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default function App() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  
  // Services filtering & carousel state
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark if no saved preference
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(initialTheme);
  }, []);

  // Monitor theme changes and update DOM/localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // Scroll listener for sticky nav
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Intersection Observer for timeline steps
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          stepObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => stepObserver.observe(step));

    // Intersection Observer for section fade-ins
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => sectionObserver.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      stepObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const howItWorksSteps = [
    { num: '01', icon: <Bug className="w-6 h-6" />, title: "Device Compromise", desc: "Millions of devices are infected with info-stealer malware — delivered via cracked software, torrents, phishing, and other attack vectors." },
    { num: '02', icon: <ShoppingCart className="w-6 h-6" />, title: "Credentials Hit the Market", desc: "Attackers publish stolen credentials and device data on exclusive underground marketplaces across multiple platforms." },
    { num: '03', icon: <Radar className="w-6 h-6" />, title: "We Monitor Everything", desc: "Our engine monitors dark web marketplaces, hacking forums, private clouds, underground channels, Telegram, Discord, and paste sites — continuously." },
    { num: '04', icon: <Server className="w-6 h-6" />, title: "C2 Server Intelligence", desc: "By exploiting vulnerabilities in info-stealer Command-and-Control servers, we capture stolen data directly from attacker infrastructure." },
    { num: '05', icon: <Filter className="w-6 h-6" />, title: "Automated Processing", desc: "All collected data is filtered, validated, and classified through our automated pipelines and fed into the Egy Safe database." },
    { num: '06', icon: <BellRing className="w-6 h-6" />, title: "Real-Time Alerts & Mitigation", desc: "We deliver real-time breach alerts to your team and provide hands-on guidance to eliminate the risk before damage is done." }
  ];

  const whyEgySafeItems = [
    { title: "Comprehensive Coverage", body: "Our monitoring engine covers dark web markets, hacking forums, source code repositories, paste sites, private clouds, Telegram, Discord, Tor sites, and more — leaving no blind spots." },
    { title: "Hybrid AI + Human Intelligence", body: "We combine artificial intelligence with human analyst expertise to eliminate false positives and ensure every alert is verified, classified, and actionable." },
    { title: "Always Up-to-Date", body: "Our team and tools run around the clock — meaning every single day is a new opportunity to protect your business from an emerging breach." },
    { title: "Post-Alert Mitigation Plans", body: "Unlike other vendors, we don't just notify you. We provide a detailed action plan and a unified dashboard to track and manage every mitigation activity." },
    { title: "Continuous Monitoring", body: "Our deep presence across dark, deep, and surface web communities means we track not just known breaches, but threat actors who may be targeting you next." },
    { title: "API Integration", body: "Integrate Egy Safe's intelligence directly into your existing security stack via our REST API — compatible with SIEMs, SOAR platforms, and custom workflows." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-600 dark:text-neutral-400 font-sans text-base leading-[1.7] selection:bg-cyan selection:text-black overflow-x-hidden relative">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(0,194,255,0.3)' } }} />
      {/* Global Noise Overlay */}
      <div className="fixed inset-0 bg-noise z-50 mix-blend-overlay pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-10 h-10">
              <Shield className="w-8 h-8 text-blue-600 dark:text-cyan" />
              <Eye className="w-4 h-4 text-navy absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xl font-bold tracking-tight text-black dark:text-offwhite">
              EgySafe
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/70 dark:text-offwhite/80">
            <a href="#services" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">How It Works</a>
            <a href="#why" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Why Egy Safe</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-black hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="bg-cyan hover:bg-cyan/90 text-navy px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan hidden sm:block focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-navy">
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[90vh] flex flex-col justify-center overflow-hidden bg-white dark:bg-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0"></div>
        
        {/* Abstract Glowing Node Graph Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none z-0 animate-slow-float"></div>
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-red/5 blur-[100px] rounded-full pointer-events-none animate-slow-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center fade-in-section">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md text-black dark:text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 rounded-full bg-red animate-ping absolute opacity-75"></span>
              <span className="w-2 h-2 rounded-full bg-red relative"></span>
              Live Monitoring — 24/7
            </div>
            
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1.05] tracking-tighter mb-6">
              <span className="text-gradient-shimmer">Your Data is Already Out There.</span><br />
              <span className="text-blue-600 dark:text-cyan-shimmer">Do You Know What's Exposed?</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed max-w-3xl font-medium"
            >
              Egy Safe monitors the surface, deep & dark web 24/7 — alerting you the moment your company's assets, credentials, or data appear in the wrong hands.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button className="bg-cyan hover:bg-white text-black px-8 py-4 rounded-md font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black">
                Start Free Scan
              </button>
              <button className="bg-transparent border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-white/10 hover:border-black/5 dark:border-black/50 dark:border-white/50 px-8 py-4 rounded-md font-bold text-base transition-all duration-300 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                See How It Works
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ticker Bar */}
      <div className="w-full overflow-hidden border-y border-black/5 dark:border-white/5 bg-white dark:bg-black py-4 flex whitespace-nowrap relative z-20 mask-edges">
        <div className="animate-marquee flex gap-12 text-sm font-mono text-neutral-500 dark:text-neutral-500 items-center w-max">
          {/* Half 1 */}
          <div className="flex gap-12 items-center">
            <span>32,400 credentials found today</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>14 Egyptian companies at risk</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>Updated 3 mins ago</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>32,400 credentials found today</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>14 Egyptian companies at risk</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>Updated 3 mins ago</span><span className="text-black/70 dark:text-offwhite/30">|</span>
          </div>
          {/* Half 2 */}
          <div className="flex gap-12 items-center">
            <span>32,400 credentials found today</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>14 Egyptian companies at risk</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>Updated 3 mins ago</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>32,400 credentials found today</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>14 Egyptian companies at risk</span><span className="text-black/70 dark:text-offwhite/30">|</span>
            <span>Updated 3 mins ago</span><span className="text-black/70 dark:text-offwhite/30">|</span>
          </div>
        </div>
      </div>

      {/* Live Threat Feed Section */}
      <LiveThreatFeed />

      {/* Services Section */}
      <section id="services" className="py-32 bg-[#020202] dark:bg-[#020202] relative fade-in-section overflow-hidden">
        {/* Subtle Horizontal glowing line running across the section */}
        <div className="absolute top-[65%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-12 text-white">What We Protect You From</h2>
            
            {/* Trusted by Industry Leaders Carousel box */}
            <div className="flex justify-center mb-16">
              <div className="bg-[#050505] border border-white/5 rounded-2xl px-12 py-6 flex flex-col items-center justify-center max-w-[320px] w-full shadow-2xl transition-all duration-300 hover:border-white/10">
                <div className="text-[9px] font-bold tracking-widest text-neutral-600 uppercase mb-5">Trusted by Industry Leaders</div>
                <div className="flex items-center gap-2 mb-6 h-6">
                  {(() => {
                    const IconComponent = carouselItems[activeCarouselIndex].icon;
                    return <IconComponent className="w-4 h-4 text-cyan" />;
                  })()}
                  <span className="text-white font-bold tracking-wider uppercase text-sm">{carouselItems[activeCarouselIndex].name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronLeft 
                    onClick={() => setActiveCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
                    className="w-4 h-4 text-neutral-600 cursor-pointer hover:text-white transition-colors" 
                  />
                  {carouselItems.map((_, i) => (
                     <div 
                       key={i} 
                       onClick={() => setActiveCarouselIndex(i)}
                       className={`cursor-pointer transition-all duration-300 ${i === activeCarouselIndex ? 'w-3 h-1.5 rounded-full bg-cyan glow-cyan' : 'w-1.5 h-1.5 rounded-full bg-neutral-700 hover:bg-neutral-500'}`}
                     ></div>
                  ))}
                  <ChevronRight 
                    onClick={() => setActiveCarouselIndex((prev) => (prev + 1) % carouselItems.length)}
                    className="w-4 h-4 text-neutral-600 cursor-pointer hover:text-white transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-20">
              <button 
                onClick={() => setActiveFilter('ALL')} 
                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeFilter === 'ALL' ? 'bg-cyan text-black glow-cyan hover:scale-105 active:scale-95' : 'bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >ALL</button>
              <button 
                onClick={() => setActiveFilter('MONITORING')} 
                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeFilter === 'MONITORING' ? 'bg-cyan text-black glow-cyan hover:scale-105 active:scale-95' : 'bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >MONITORING</button>
              <button 
                onClick={() => setActiveFilter('DISCOVERY')} 
                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeFilter === 'DISCOVERY' ? 'bg-cyan text-black glow-cyan hover:scale-105 active:scale-95' : 'bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >DISCOVERY</button>
              <button 
                onClick={() => setActiveFilter('ASSESSMENT')} 
                className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs tracking-wider transition-all duration-300 ${activeFilter === 'ASSESSMENT' ? 'bg-cyan text-black glow-cyan hover:scale-105 active:scale-95' : 'bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >ASSESSMENT</button>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
          >
            <AnimatePresence>
            {/* Card 1 */}
            {(activeFilter === 'ALL' || activeFilter === 'MONITORING') && (
            <motion.div 
              key="monitoring"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              whileHover="hover"
              className="bg-[#050505] border border-white/5 hover:border-cyan/30 p-8 rounded-xl transition-all group flex flex-col relative overflow-hidden"
            >
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                01
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-cyan/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(0,194,255,0.4)] group-hover:bg-cyan/10 z-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                  variants={{ hover: { rotate: 360, transition: { duration: 4, ease: "linear", repeat: Infinity } } }} className="absolute">
                  <Network className="w-8 h-8 text-cyan/20" />
                </motion.div>
                <div className="relative z-10">
                  <Eye className="w-6 h-6 text-cyan" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white relative z-10">Dark Web Monitoring</h3>
              <div className="text-[9px] font-bold tracking-widest text-cyan uppercase mb-6 relative z-10">Real-Time Threat Intelligence Feed</div>
              
              <p className="text-neutral-400 leading-relaxed text-sm mb-6 flex-grow relative z-10">
                With our automated monitoring of the surface, deep & dark web, your company assets are tracked 24/7 for data-leaks, stolen credentials, and exposed records.
              </p>

              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10 glow-red">
                <Activity className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-[9px] font-bold text-red-500 tracking-widest uppercase leading-snug">Real-Time Threat Intelligence Feed</span>
              </div>

              <a href="#" className="inline-flex items-center gap-2 text-cyan font-bold text-[11px] tracking-widest uppercase hover:text-cyan/80 mt-auto transition-colors relative z-10">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
            )}

            {/* Card 2 */}
            {(activeFilter === 'ALL' || activeFilter === 'DISCOVERY') && (
            <motion.div 
              key="discovery"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              whileHover="hover"
              className="bg-[#050505] border border-white/5 hover:border-blue-500/30 p-8 rounded-xl transition-all group flex flex-col relative overflow-hidden"
            >
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                02
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-blue-500/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] group-hover:bg-blue-500/10 z-10">
                <motion.div 
                  animate={{ rotate: 180 }}
                  transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
                  variants={{ hover: { rotate: 360, transition: { duration: 2, ease: "linear", repeat: Infinity } } }}>
                  <Radar className="w-6 h-6 text-blue-500" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-6 text-white relative z-10">Attack Surface Discovery</h3>
              <p className="text-neutral-400 leading-relaxed text-sm mb-8 flex-grow relative z-10">
                Automated security scanning for vulnerabilities, CVEs, and misconfigurations — periodically scanning all your external-facing assets before attackers do.
              </p>
              
              <div className="mb-6 flex-grow"></div>

              <a href="#" className="inline-flex items-center gap-2 text-blue-500 font-bold text-[11px] tracking-widest uppercase hover:text-blue-400 mt-auto transition-colors relative z-10">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
            )}

            {/* Card 3 */}
            {(activeFilter === 'ALL' || activeFilter === 'ASSESSMENT') && (
            <motion.div 
              key="assessment"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              whileHover="hover"
              className="bg-[#050505] border border-white/5 hover:border-purple-500/30 p-8 rounded-xl transition-all group flex flex-col relative overflow-hidden"
            >
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                03
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-purple-500/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] group-hover:bg-purple-500/10 z-10">
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                  variants={{ hover: { scale: 1.15, transition: { duration: 0.4 } } }}>
                  <ShieldCheck className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-6 text-white relative z-10">Security Assessment</h3>
              <p className="text-neutral-400 leading-relaxed text-sm mb-6 flex-grow relative z-10">
                Information security assessments, penetration testing, red & purple teaming, SAP hacking, and scenario-based security exercises tailored to your threat model.
              </p>

              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10">
                <Share2 className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-[9px] font-bold text-purple-400 tracking-widest uppercase leading-snug">Enterprise API Ready</span>
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsAssessmentModalOpen(true);
                }}
                className="inline-flex items-center gap-2 text-purple-500 font-bold text-[11px] tracking-widest uppercase hover:text-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus:outline-none mt-auto transition-colors relative z-10 text-left"
                aria-haspopup="dialog"
              >
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative border-t border-black/5 dark:border-white/5 fade-in-section bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-black dark:text-white">How Egy Safe Works</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">From stolen device to real-time alert — here's our end-to-end process.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2"></div>
            
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative flex flex-col md:flex-row items-center justify-between w-full mb-12 md:mb-24 timeline-step opacity-0 translate-y-8 transition-all duration-700 ease-out md:even:flex-row-reverse">
                {/* Node */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-black border-2 border-cyan flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,194,255,0.2)]">
                  <span className="text-blue-600 dark:text-cyan text-sm font-bold">{step.num}</span>
                </div>

                {/* Spacer */}
                <div className="hidden md:block w-[calc(50%-3rem)]"></div>

                {/* Content */}
                <div className="w-full pl-16 md:pl-0 md:w-[calc(50%-3rem)]">
                  <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 p-8 rounded-xl hover:border-cyan/30 transition-colors card-gradient-hover">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-cyan/10 rounded-lg text-blue-600 dark:text-cyan">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold text-black dark:text-white">{step.title}</h3>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Egy Safe Section */}
      <section id="why" className="py-24 relative bg-gray-100 dark:bg-[#050505] fade-in-section">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-black dark:text-white">Why Security Teams Choose Egy Safe</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Our feeds are updated across the hour. We capture and contextualize as much leaked data as possible — helping you prevent breaches before they escalate.</p>
          </div>

          <div className="space-y-4">
            {whyEgySafeItems.map((item, index) => {
              const isOpen = openAccordion === index;
              return (
                <div key={index} className="border border-black/5 dark:border-white/5 rounded-lg bg-gray-50 dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 hover:border-black/10 dark:border-white/10">
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : index)}
                    className="group w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-inset"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${index}`}
                    id={`faq-button-${index}`}
                  >
                    <span className="text-lg font-bold text-black dark:text-white pr-8">{item.title}</span>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'rotate-45 bg-white text-black border-black dark:border-white' : 'border-black/20 dark:border-white/20 text-black dark:text-white bg-transparent'}`}>
                      <Plus className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                  </button>
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="p-6 pt-0 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terminal / Code Section */}
      <section className="py-24 bg-white dark:bg-black border-y border-black/5 dark:border-white/5 fade-in-section">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-6 text-black dark:text-white">Intelligence-Driven Defense</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-6 leading-relaxed">
              Traditional security relies on known signatures. Egy Safe utilizes proprietary threat intelligence gathered directly from the Egyptian and MENA regional underground.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Real-time alert integration via API or Webhook',
                'Contextualized threat reports for executive teams',
                'Zero-day vulnerability impact analysis',
                'Takedown services for fraudulent domains'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded bg-cyan/10 border border-cyan/30 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-cyan rounded-sm"></div>
                  </div>
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
            {/* Fake Terminal Window */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="rounded-xl overflow-hidden border border-black/20 dark:border-white/20 bg-white dark:bg-black/60 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,194,255,0.05)] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="bg-gray-50 dark:bg-[#0A0A0A]/80 px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2 relative z-10 backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-red/80 shadow-[0_0_10px_rgba(255,59,87,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="ml-4 text-xs font-mono text-neutral-500 dark:text-neutral-500">egysafe-intel-engine ~ root</span>
              </div>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.3 } },
                  hidden: {}
                }}
                className="p-6 font-mono text-sm text-blue-600 dark:text-cyan/90 leading-relaxed overflow-x-auto relative z-10"
              >
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-neutral-500 dark:text-neutral-500 mb-2">$ ./scan_surface --target enterprise.com.eg</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Initializing reconnaissance module...</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Discovering subdomains (passive + active)</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Found 42 subdomains.</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-4">[+] Scanning for exposed services...</motion.p>
                
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-red mb-1">! CRITICAL: Exposed database port detected on dev.enterprise.com.eg:5432</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-yellow-500 mb-4">! WARNING: Outdated TLS certificate on mail.enterprise.com.eg</motion.p>
                
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.5 } } }} className="text-neutral-500 dark:text-neutral-500 mb-2">$ ./check_darkweb --domain enterprise.com.eg</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.6 } } }} className="mb-1">[+] Querying deep web indices and forum dumps...</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.8 } } }} className="text-red mb-1 font-bold">! ALERT: 3 compromised credentials found in recent 'Citadel' dump.</motion.p>
                <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1 } } }} className="text-blue-600 dark:text-cyan animate-pulse mt-4">_</motion.p>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-black relative fade-in-section border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-black dark:text-white">Transparent Pricing for Every Scale</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Choose the right level of protection for your organization.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {/* Basic Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              className="bg-gray-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 rounded-2xl p-8 flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Basic</h3>
                <p className="text-neutral-500 dark:text-neutral-500 text-sm mb-6">For small businesses and startups.</p>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">Contact Sales</div>
                <p className="text-neutral-600 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['Surface Web Monitoring', 'Basic Vulnerability Scanning', 'Weekly Security Reports', 'Email Alerts'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm">
                    <Check className="w-5 h-5 text-blue-600 dark:text-cyan shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-6 rounded-lg border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </button>
            </motion.div>

            {/* Professional Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              className="card-gradient border border-cyan/30 p-8 flex flex-col relative transform md:-translate-y-6 md:scale-105 shadow-[0_0_50px_rgba(0,194,255,0.1)] z-10 rounded-2xl"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan text-black px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,194,255,0.4)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white dark:bg-black animate-pulse"></span>
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-600 dark:text-cyan mb-2">Professional</h3>
                <p className="text-blue-600 dark:text-cyan/60 text-sm mb-6">For mid-market and growing enterprises.</p>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">Contact Sales</div>
                <p className="text-blue-600 dark:text-cyan/40 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['Dark Web Monitoring', 'Attack Surface Discovery', 'Real-time SMS & Email Alerts', 'API Access', 'Monthly Security Assessment'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-black dark:text-white text-sm">
                    <Check className="w-5 h-5 text-blue-600 dark:text-cyan shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-6 rounded-lg bg-cyan text-black font-bold hover:bg-cyan/90 transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </button>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } }
              }}
              className="bg-gray-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 rounded-2xl p-8 flex flex-col"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">Enterprise</h3>
                <p className="text-neutral-500 dark:text-neutral-500 text-sm mb-6">For large enterprises and government.</p>
                <div className="text-3xl font-bold text-black dark:text-white mb-2">Contact Sales</div>
                <p className="text-neutral-600 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {['Full Red Teaming', 'Dedicated Security Analyst', 'Zero-day Vulnerability Alerts', 'Takedown Services', 'Custom Integrations & Webhooks'].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm">
                    <Check className="w-5 h-5 text-blue-600 dark:text-cyan shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-6 rounded-lg border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="py-16 bg-gray-100 dark:bg-[#050505] border-y border-black/5 dark:border-white/5 fade-in-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center border-b border-r border-black/5 dark:border-white/5 lg:border-b-0">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-cyan mb-2">
                <StatCounter end={50} suffix="M+" delay={0} duration={1500} />
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">Compromised credentials in database</div>
            </div>
            <div className="p-6 text-center border-b border-black/5 dark:border-white/5 lg:border-b-0 lg:border-r">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-cyan mb-2">
                <StatCounter end={10000} suffix="+" delay={1000} duration={1500} />
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">Dark web sources monitored</div>
            </div>
            <div className="p-6 text-center border-r border-black/5 dark:border-white/5">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-cyan mb-2">
                <StatCounter end={15} prefix="<" suffix="min" delay={2000} duration={1500} />
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">Average alert delivery time</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-cyan mb-2">
                <StatCounter end={24} suffix="/7" delay={3000} duration={1500} />
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">Live monitoring coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-white dark:bg-black fade-in-section">
        {/* Animated Data Flow Background */}
        <DataFlowBackground />
        
        {/* Subtle static gradient fallback underneath */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-cyan/5 blur-[120px] pointer-events-none z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {/* Live Scan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-blue-600 dark:text-cyan text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
            </span>
            Live Scan Available
          </div>

          <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-6 text-black dark:text-white">Is Your Data Already on the Dark Web?</h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">
            Run a free exposure scan and find out in minutes. No commitment required.
          </p>

          {/* Form Area */}
          <div className="max-w-xl mx-auto relative group mt-8">
            <form className="relative flex flex-col sm:flex-row items-center bg-gray-50 dark:bg-[#0A0A0A] p-1.5 rounded-full border border-black/10 dark:border-white/10 shadow-[0_0_30px_rgba(0,194,255,0.05)] focus-within:border-cyan/50 focus-within:shadow-[0_0_30px_rgba(0,194,255,0.1)] transition-all duration-300">
              <input 
                type="text" 
                placeholder="Enter your company domain (e.g. yourcompany.com)" 
                className="flex-1 bg-transparent text-black dark:text-white px-6 py-3 outline-none placeholder:text-neutral-600 w-full rounded-full"
                required
                aria-label="Enter your company domain"
              />
              <button type="submit" className="bg-red hover:bg-red/90 text-black dark:text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 glow-red whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 focus:ring-offset-black w-full sm:w-auto mt-2 sm:mt-0">
                Scan Now
              </button>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-sm text-neutral-500 dark:text-neutral-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-cyan" /> No account required
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-cyan" /> Results in under 60 seconds
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-cyan" /> Used by security teams across MENA
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-600 mt-8">
            By submitting, you agree to our Privacy Policy. We will never share your data.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-[#050505] pt-20 pb-8 border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Column 1 - Brand */}
            <div className="space-y-6 lg:col-span-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-cyan" />
                <span className="text-xl font-bold tracking-tight text-black dark:text-white">
                  EGY <span className="text-blue-600 dark:text-cyan">SAFE</span>
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-500 text-sm leading-relaxed">
                Protecting Egyptian and MENA businesses from the threats they can't see.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-neutral-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 dark:text-neutral-500 hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors" aria-label="Telegram">
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 2 - Services */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 text-black dark:text-white">Services</h4>
              <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-500">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Dark Web Monitoring</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Attack Surface Discovery</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Security Assessment</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Red Teaming & Adversary Simulation</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Network Penetration Testing</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Web & Mobile App Testing</a></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 text-black dark:text-white">Company</h4>
              <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-500">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 - Contact Form */}
            <div className="lg:col-span-4">
              <h4 className="font-bold mb-6 text-black dark:text-white">Send an Inquiry</h4>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 rounded-lg px-4 py-2.5 text-sm text-black dark:text-white outline-none placeholder:text-neutral-600 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all"
                  required
                  aria-label="Your Email Address"
                />
                <textarea 
                  placeholder="How can we help you?" 
                  rows={3}
                  aria-label="How can we help you?"
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 rounded-lg px-4 py-2.5 text-sm text-black dark:text-white outline-none placeholder:text-neutral-600 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all resize-none"
                  required
                ></textarea>
                <button type="submit" className="w-full px-6 py-2.5 bg-cyan text-black hover:bg-cyan/90 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-black/5 dark:border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-600">
            <div>© 2025 Egy Safe. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-black dark:text-white focus:outline-none focus:text-black dark:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-black dark:text-white focus:outline-none focus:text-black dark:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 p-3 rounded-full bg-gray-200 dark:bg-[#111] text-black dark:text-white border border-black/10 dark:border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 z-40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
      
      <Chatbot />
      <SecurityAssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)} 
      />
      <SpeedInsights />
    </div>
  );
}
