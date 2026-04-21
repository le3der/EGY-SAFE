import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Network, ScanSearch, Lock, Terminal, Globe, ChevronRight, Activity, AlertTriangle, Database, Shield, Eye, Radar, ShieldCheck, Bug, ShoppingCart, Server, Filter, BellRing, Plus, Zap, Linkedin, Twitter, Send, Check, ArrowUp, Sun, Moon, ChevronLeft, ArrowRight, Share2, LogIn, LogOut, Settings, Mail, X, Menu, Loader2 } from 'lucide-react';
import DataFlowBackground from './components/DataFlowBackground';
import LazyImage from './components/LazyImage';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { trackEvent } from './lib/analytics';
import { ContactForm, NewsletterForm } from './components/Forms';

const whyEgySafeItems = [
  { title: "Comprehensive Coverage", body: "Our monitoring engine covers dark web markets, hacking forums, source code repositories, paste sites, private clouds, Telegram, Discord, Tor sites, and more — leaving no blind spots." },
  { title: "Hybrid AI + Human Intelligence", body: "We combine artificial intelligence with human analyst expertise to eliminate false positives and ensure every alert is verified, classified, and actionable." },
  { title: "Always Up-to-Date", body: "Our team and tools run around the clock — meaning every single day is a new opportunity to protect your business from an emerging breach." },
  { title: "Post-Alert Mitigation Plans", body: "Unlike other vendors, we don't just notify you. We provide a detailed action plan and a unified dashboard to track and manage every mitigation activity." },
  { title: "Continuous Monitoring", body: "Our deep presence across dark, deep, and surface web communities means we track not just known breaches, but threat actors who may be targeting you next." },
  { title: "API Integration", body: "Integrate Egy Safe's intelligence directly into your existing security stack via our REST API — compatible with SIEMs, SOAR platforms, and custom workflows." }
];

// Lazy loaded heavy components
const Chatbot = React.lazy(() => import('./components/Chatbot'));
const SecurityAssessmentModal = React.lazy(() => import('./components/SecurityAssessmentModal'));
const ConsultationModal = React.lazy(() => import('./components/ConsultationModal'));
const InteractiveTimeline = React.lazy(() => import('./components/InteractiveTimeline'));
const MfaVerificationModal = React.lazy(() => import('./components/MfaVerificationModal'));
const LoginModal = React.lazy(() => import('./components/LoginModal'));
const FreeScanSection = React.lazy(() => import('./components/FreeScanSection'));

const LiveThreatFeed = React.lazy(() => import('./components/LiveThreatFeed'));
const EgyptDarkWebScanner = React.lazy(() => import('./components/EgyptDarkWebScanner'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const ClientDashboard = React.lazy(() => import('./components/ClientDashboard'));

// Fallback component for lazy loading boundaries
const SkeletonLoader = ({ type = 'panel' }: { type?: 'modal' | 'panel' | 'widget' }) => {
  if (type === 'modal') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#050505] shadow-2xl shadow-cyan/5 border border-white/10 rounded-2xl w-[90%] max-w-lg p-8 animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/10 mb-6"></div>
          <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-white/5 rounded w-3/4 mb-10"></div>
          <div className="w-full space-y-3 mt-4">
            <div className="h-12 bg-white/5 rounded w-full"></div>
            <div className="h-12 bg-white/5 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'widget') {
    return (
      <div className="fixed bottom-24 right-6 w-14 h-14 bg-white/10 rounded-2xl border border-white/20 animate-pulse z-40 flex items-center justify-center shadow-[0_0_15px_rgba(0,194,255,0.1)]">
        <div className="w-6 h-6 bg-white/20 rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 p-6 sm:p-8 cyber-glass-card rounded-2xl animate-pulse min-h-[300px] border border-white/5">
      <div className="flex gap-4 items-center border-b border-white/5 pb-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10 shrink-0"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 bg-white/10 rounded w-1/3"></div>
          <div className="h-3 bg-white/5 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-3 flex-1 mb-8">
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-5/6"></div>
        <div className="h-4 bg-white/5 rounded w-4/6"></div>
      </div>
      <div className="h-32 bg-white/5 rounded-xl w-full border border-white/5 mt-auto"></div>
    </div>
  );
};

const StatCounter = ({ end, prefix = '', suffix = '', duration = 2000, delay = 0 }: { end: number, prefix?: string, suffix?: string, duration?: number, delay?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isCounting, setIsCounting] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (hasAnimated) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        setIsCounting(true);
        
        if (observerRef.current) {
          observerRef.current.disconnect();
        }

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
              setIsCounting(false);
            }
          };
          requestAnimationFrame(animate);
        }, delay);
      }
    }, { threshold: 0.5 });

    if (ref.current) observerRef.current.observe(ref.current);
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [end, duration, delay, hasAnimated]);

  return (
    <span 
      ref={ref}
      className={`inline-block transition-all duration-300 ${isCounting ? 'opacity-80 animate-pulse text-cyan drop-shadow-[0_0_10px_rgba(0,194,255,0.6)]' : 'drop-shadow-none'}`}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default function App() {
  const { user, profile, loading: authLoading, signInWithGoogle, logout } = useAuth();
  const { lang, toggleLang, t, dir } = useLanguage();
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  
  // Services filtering & carousel state
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance required for a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setActiveServiceIndex(prev => (prev + 1) % 3);
    }
    if (isRightSwipe) {
      setActiveServiceIndex(prev => (prev - 1 + 3) % 3);
    }
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  // Track active section for Chatbot
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      let currentSection = activeSectionRef.current;
      let maxRatio = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          const sectionId = entry.target.id || entry.target.getAttribute('data-section-id') || 'hero';
          if (sectionId) currentSection = sectionId;
        }
      });
      if (maxRatio > 0 && currentSection !== activeSectionRef.current) {
        setActiveSection(currentSection);
      }
    }, { threshold: [0.1, 0.5, 0.9] });

    const sections = document.querySelectorAll('section, main, header');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Initialize theme to be always dark
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

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

    // Custom listener for FreeScan CTA
    const handleOpenConsultation = () => setIsConsultationModalOpen(true);
    window.addEventListener('open-consultation', handleOpenConsultation as EventListener);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-consultation', handleOpenConsultation as EventListener);
      stepObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-400 font-sans text-base leading-[1.7] selection:bg-cyan selection:text-black overflow-x-hidden relative">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(0,194,255,0.3)' } }} />
      <Suspense fallback={<SkeletonLoader type="modal" />}>
        <MfaVerificationModal />
      </Suspense>
      {/* Global Noise Overlay */}
      <div className="fixed inset-0 bg-noise z-50 mix-blend-overlay pointer-events-none"></div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={scrollToTop}>
            <div className="relative flex items-center justify-center w-10 h-10 group-hover:scale-110 transition-transform duration-300">
              <ScanSearch className="w-9 h-9 text-cyan absolute opacity-90" strokeWidth={1.5} />
              <div className="w-2 h-2 rounded-full bg-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan transition-colors duration-300">
              EgySafe
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
            <a href="#services" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">{t('الخدمات', 'Services')}</a>
            <a href="#how-it-works" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">{t('كيف نعمل', 'How It Works')}</a>
            <a href="#why" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">{t('لماذا Egy Safe', 'Why Egy Safe')}</a>
            <a href="#pricing" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">{t('الأسعار', 'Pricing')}</a>
            <a href="#contact" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">{t('اتصل بنا', 'Contact')}</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="text-xs font-bold text-neutral-400 hover:text-cyan focus:outline-none px-2 py-1 uppercase tracking-widest transition-colors"
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            
            {!authLoading && user ? (
              <div className="flex items-center gap-2">
                {profile?.role === 'Admin' && (
                  <a href="#admin" className="p-2 text-neutral-400 hover:text-cyan transition-colors" title="Admin Panel">
                    <Settings className="w-5 h-5" />
                  </a>
                )}
                {profile?.role === 'Viewer' && (
                  <a href="#dashboard" className="p-2 text-neutral-400 hover:text-cyan transition-colors" title="Client Dashboard">
                    <Activity className="w-5 h-5" />
                  </a>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </div>
                <button 
                  onClick={logout} 
                  className="p-2 text-neutral-500 hover:text-red transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)} 
                className="flex items-center gap-2 text-sm font-medium hover:text-cyan transition-colors text-white"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button 
              onClick={() => {
                trackEvent('demo_requested', { source: 'Navbar' });
                setIsConsultationModalOpen(true);
              }}
              className="bg-cyan hover:bg-cyan/90 text-black px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan hidden md:block focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
            >
              Request Demo
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-cyan transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-4 text-center">
                <a onClick={() => setIsMobileMenuOpen(false)} href="#services" className="text-white hover:text-cyan py-2 transition-colors font-medium">Services</a>
                <a onClick={() => setIsMobileMenuOpen(false)} href="#how-it-works" className="text-white hover:text-cyan py-2 transition-colors font-medium">How It Works</a>
                <a onClick={() => setIsMobileMenuOpen(false)} href="#why" className="text-white hover:text-cyan py-2 transition-colors font-medium">Why Egy Safe</a>
                <a onClick={() => setIsMobileMenuOpen(false)} href="#pricing" className="text-white hover:text-cyan py-2 transition-colors font-medium">Pricing</a>
                <a onClick={() => setIsMobileMenuOpen(false)} href="#contact" className="text-white hover:text-cyan py-2 transition-colors font-medium">Contact</a>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsConsultationModalOpen(true);
                  }}
                  className="bg-cyan hover:bg-cyan/90 text-black px-6 py-3 rounded-md font-semibold transition-all duration-300 w-full"
                >
                  Request Demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <Suspense fallback={<SkeletonLoader type="modal" />}>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </Suspense>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[90vh] flex flex-col justify-center overflow-hidden bg-black text-white">
        {/* Animated Cyber Background */}
        <Suspense fallback={<SkeletonLoader type="panel" />}>
          <DataFlowBackground />
        </Suspense>
        
        {/* Subtle top/bottom fade to blend with standard sections */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent pointer-events-none z-0"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-0"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center fade-in-section pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <span className="w-2 h-2 rounded-full bg-red animate-ping absolute opacity-75"></span>
              <span className="w-2 h-2 rounded-full bg-red relative"></span>
              {t('مراقبة حية — طوال أيام الأسبوع', 'Live Monitoring — 24/7')}
            </div>
            
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1.05] tracking-tighter mb-6">
              <span className="text-gradient-shimmer">{t('بياناتك مسربة بالفعل.', 'Your Data is Already Out There.')}</span><br />
              <span className="text-cyan-shimmer">{t('هل تعلم ما هو مكشوف؟', 'Do You Know What\'s Exposed?')}</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed max-w-3xl font-medium"
            >
              {t('تقوم منصة إيجي سيف بمراقبة الويب السطحي والعميق والمظلم على مدار الساعة — لتنبيهك لحظة ظهور أصول شركتك أو بيانات مسؤوليها أو بياناتها في الأيدي الخطأ.', 'Egy Safe monitors the surface, deep & dark web 24/7 — alerting you the moment your company\'s assets, credentials, or data appear in the wrong hands.')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <button 
                onClick={() => {
                  trackEvent('scan_started', { source: 'Hero Button' });
                  document.getElementById('free-scan')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-cyan hover:bg-white text-black px-8 py-4 rounded-md font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
              >
                {t('ابدأ الفحص المجاني', 'Start Free Scan')}
              </button>
              <button 
                onClick={() => {
                  trackEvent('see_how_it_works_clicked', { source: 'Hero Button' });
                  setIsConsultationModalOpen(true);
                }}
                className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-md font-bold text-base transition-all duration-300 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                {t('انظر كيف يعمل', 'See How It Works')}
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Global Trusted By Section - Showcasing Lazy Loading */}
        <div className="w-full relative z-10 pt-16 mt-8 border-t border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mb-8">Trusted by SecOps Teams at Forward-Thinking Enterprise</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <LazyImage 
                src="https://picsum.photos/seed/tech1/200/60" 
                alt="Partner Logo 1" 
                className="w-32 h-8 md:h-10 dark:invert"
              />
              <LazyImage 
                src="https://picsum.photos/seed/tech2/200/60" 
                alt="Partner Logo 2" 
                className="w-32 h-8 md:h-10 dark:invert"
              />
              <LazyImage 
                src="https://picsum.photos/seed/tech3/200/60" 
                alt="Partner Logo 3" 
                className="w-32 h-8 md:h-10 dark:invert"
              />
              <LazyImage 
                src="https://picsum.photos/seed/tech4/200/60" 
                alt="Partner Logo 4" 
                className="w-32 h-8 md:h-10 dark:invert hidden sm:flex"
              />
              <LazyImage 
                src="https://picsum.photos/seed/tech5/200/60" 
                alt="Partner Logo 5" 
                className="w-32 h-8 md:h-10 dark:invert hidden lg:flex"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Bar */}
      <div className="w-full overflow-hidden border-y border-white/5 bg-black py-4 flex whitespace-nowrap relative z-20 mask-edges">
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

      {/* Free Scan Section */}
      <Suspense fallback={<SkeletonLoader type="panel" />}>
        <FreeScanSection />
      </Suspense>

      {/* Live Threat Feed Section */}
      <Suspense fallback={<SkeletonLoader type="panel" />}>
        <LiveThreatFeed />
      </Suspense>

      {/* Egypt Regional Scanner Section */}
      <Suspense fallback={<SkeletonLoader type="panel" />}>
        <EgyptDarkWebScanner />
      </Suspense>

      {/* Trusted By Section */}
      <div className="border-y border-white/5 bg-black/50 py-10 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-8">
            Protecting the infrastructure of industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 transition-all hover:text-cyan cursor-default">
              <Globe className="w-5 h-5 text-neutral-400 inherit-text" />
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase inherit-text">Global Tech</span>
            </div>
            <div className="flex items-center gap-2 transition-all hover:text-cyan cursor-default">
              <Lock className="w-5 h-5 text-neutral-400 inherit-text" />
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase inherit-text">Fintech</span>
            </div>
            <div className="flex items-center gap-2 transition-all hover:text-cyan cursor-default">
              <Shield className="w-5 h-5 text-neutral-400 inherit-text" />
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase inherit-text">Healthcare</span>
            </div>
            <div className="flex items-center gap-2 transition-all hover:text-cyan cursor-default hidden md:flex">
              <Activity className="w-5 h-5 text-neutral-400 inherit-text" />
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase inherit-text">E-Commerce</span>
            </div>
            <div className="flex items-center gap-2 transition-all hover:text-cyan cursor-default hidden lg:flex">
              <Database className="w-5 h-5 text-neutral-400 inherit-text" />
              <span className="text-sm font-bold tracking-widest text-neutral-400 uppercase inherit-text">Telecom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#020202] dark:bg-[#020202] relative fade-in-section overflow-hidden">
        {/* Subtle Horizontal glowing line running across the section */}
        <div className="absolute top-[65%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-12 text-white">What We Protect You From</h2>
            
            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-6 mb-16 relative z-20">
              <button 
                onClick={() => setActiveServiceIndex(prev => (prev - 1 + 3) % 3)}
                className="w-12 h-12 rounded-full border border-white/10 bg-black/50 hover:bg-white/5 hover:border-cyan/50 hover:text-cyan flex items-center justify-center transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-[#020202]"
                aria-label="Previous Service"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-3">
                {[0, 1, 2].map(idx => (
                  <button 
                    key={idx}
                    onClick={() => setActiveServiceIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeServiceIndex === idx ? 'w-8 bg-cyan glow-cyan' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveServiceIndex(prev => (prev + 1) % 3)}
                className="w-12 h-12 rounded-full border border-white/10 bg-black/50 hover:bg-white/5 hover:border-cyan/50 hover:text-cyan flex items-center justify-center transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-[#020202]"
                aria-label="Next Service"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div 
            className="max-w-2xl mx-auto relative z-10 w-full min-h-[450px] outline-none rounded-2xl touch-pan-y"
            tabIndex={0}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                setActiveServiceIndex(prev => (prev - 1 + 3) % 3);
              } else if (e.key === 'ArrowRight') {
                setActiveServiceIndex(prev => (prev + 1) % 3);
              }
            }}
          >
            <AnimatePresence mode="wait">
            {/* Card 1 */}
            {activeServiceIndex === 0 && (
            <motion.div 
              key="monitoring"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1.02, 
                boxShadow: "0 0 40px rgba(0, 194, 255, 0.15)",
                y: 0
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
              whileHover="hover"
              className="cyber-glass-card p-8 group flex flex-col relative ring-1 ring-cyan/20 rounded-2xl"
            >
              <div className="cyber-glass-card-glow"></div>
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                01
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-cyan/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(0,194,255,0.4)] group-hover:bg-cyan/10 z-10">
                {/* Background Rotating Element */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                  variants={{ hover: { rotate: 360, transition: { duration: 4, ease: "linear", repeat: Infinity } } }}
                  className="absolute"
                >
                  <Network className="w-8 h-8 text-cyan/20" />
                </motion.div>
                {/* Primary Icon - Gentle Pulse */}
                <motion.div 
                  className="relative z-10"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                >
                  <Eye className="w-6 h-6 text-cyan" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white relative z-10">Dark Web Monitoring</h3>
              <div className="text-[9px] font-bold tracking-widest text-cyan uppercase mb-6 relative z-10">Real-Time Threat Intelligence Feed</div>
              
              <p className="text-neutral-400 leading-relaxed text-sm mb-6 flex-grow relative z-10">
                With our automated monitoring of the surface, deep & dark web, your company assets are tracked 24/7 for data-leaks, stolen credentials, and exposed records.
              </p>

              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/20 flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              >
                <Activity className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-[9px] font-bold text-red-500 tracking-widest uppercase leading-snug">Real-Time Threat Intelligence Feed</span>
              </motion.div>

              <a href="#" className="inline-flex items-center gap-2 text-cyan font-bold text-[11px] tracking-widest uppercase hover:text-cyan/80 mt-auto transition-colors relative z-10">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
            )}

            {/* Card 2 */}
            {activeServiceIndex === 1 && (
            <motion.div 
              key="discovery"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1.02, 
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
                y: 0
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
              whileHover="hover"
              className="cyber-glass-card p-8 group flex flex-col relative ring-1 ring-blue-500/20 rounded-2xl"
            >
              <div className="cyber-glass-card-glow text-blue-500/20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)'}}></div>
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                02
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-blue-500/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] group-hover:bg-blue-500/10 z-10">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                  variants={{ hover: { rotate: 360, transition: { duration: 3, ease: "linear", repeat: Infinity } } }}
                  className="relative z-10"
                >
                  <Radar className="w-6 h-6 text-blue-500" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-6 text-white relative z-10">Attack Surface Discovery</h3>
              <p className="text-neutral-400 leading-relaxed text-sm mb-6 flex-grow relative z-10">
                Automated security scanning for vulnerabilities, CVEs, and misconfigurations — periodically scanning all your external-facing assets before attackers do.
              </p>
              
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
              >
                <ScanSearch className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase leading-snug">Continuous Asset Discovery</span>
              </motion.div>

              <a href="#" className="inline-flex items-center gap-2 text-blue-500 font-bold text-[11px] tracking-widest uppercase hover:text-blue-400 mt-auto transition-colors relative z-10">
                Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
            )}

            {/* Card 3 */}
            {activeServiceIndex === 2 && (
            <motion.div 
              key="assessment"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1.02, 
                boxShadow: "0 0 40px rgba(168, 85, 247, 0.15)",
                y: 0
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
              whileHover="hover"
              className="cyber-glass-card p-8 group flex flex-col relative ring-1 ring-purple-500/20 rounded-2xl"
            >
              <div className="cyber-glass-card-glow text-purple-500/20" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)'}}></div>
              {/* Subtle Parallax Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -bottom-6 -right-2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none leading-none z-0">
                03
              </div>

              <div className="w-14 h-14 bg-[#0A0A0A] border border-purple-500/20 rounded-xl flex items-center justify-center mb-8 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] group-hover:bg-purple-500/10 z-10">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                  variants={{ hover: { scale: 1.15, transition: { duration: 0.4 } } }}
                  className="relative z-10"
                >
                  <ShieldCheck className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>
              <h3 className="text-xl font-bold mb-6 text-white relative z-10">Security Assessment</h3>
              <p className="text-neutral-400 leading-relaxed text-sm mb-6 flex-grow relative z-10">
                Information security assessments, penetration testing, red & purple teaming, SAP hacking, and scenario-based security exercises tailored to your threat model.
              </p>

              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay: 1 }}
                className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center gap-3 relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                <Share2 className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-[9px] font-bold text-purple-400 tracking-widest uppercase leading-snug">Enterprise API Ready</span>
              </motion.div>

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
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 relative border-t border-white/5 fade-in-section bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-white">How Egy Safe Works</h2>
            <p className="text-neutral-400 text-lg">From stolen device to real-time alert — here's our end-to-end process.</p>
          </div>

          <Suspense fallback={<SkeletonLoader type="panel" />}>
            <InteractiveTimeline />
          </Suspense>
        </div>
      </section>

      {/* Why Egy Safe Section */}
      <section id="why" className="py-24 relative bg-[#050505] fade-in-section text-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-white">Why Security Teams Choose Egy Safe</h2>
            <p className="text-neutral-400 text-lg">Our feeds are updated across the hour. We capture and contextualize as much leaked data as possible — helping you prevent breaches before they escalate.</p>
          </div>

          <div className="space-y-4">
            {whyEgySafeItems.map((item, index) => {
              const isOpen = openAccordion === index;
              return (
                <div key={index} className="cyber-glass-card rounded-lg overflow-hidden transition-all duration-300">
                  <div className="cyber-glass-card-glow text-cyan/10"></div>
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : index)}
                    className="group w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:ring-inset relative z-10"
                    aria-expanded={isOpen}
                    aria-controls={`faq-content-${index}`}
                    id={`faq-button-${index}`}
                  >
                    <span className="text-lg font-bold text-white pr-8">{item.title}</span>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen ? 'rotate-45 bg-white text-black border-white' : 'border-white/20 text-white bg-transparent'}`}>
                      <Plus className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                  </button>
                  <div 
                    className={`grid transition-all duration-300 ease-in-out relative z-10 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="p-6 pt-0 text-neutral-400 leading-relaxed">
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
      <section className="py-24 bg-black border-y border-white/5 fade-in-section text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-6 text-white">Intelligence-Driven Defense</h2>
            <p className="text-neutral-400 text-lg mb-6 leading-relaxed">
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
              className="cyber-glass-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <div className="bg-[#0A0A0A]/80 px-4 py-3 border-b border-white/10 flex items-center gap-2 relative z-10 backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-red/80 shadow-[0_0_10px_rgba(255,59,87,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="ml-4 text-xs font-mono text-neutral-500">egysafe-intel-engine ~ root</span>
              </div>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.3 } },
                  hidden: {}
                }}
                className="p-6 font-mono text-sm text-cyan/90 leading-relaxed overflow-x-auto relative z-10"
              >
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-neutral-500 mb-2">$ ./scan_surface --target enterprise.com.eg</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Initializing reconnaissance module...</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Discovering subdomains (passive + active)</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1">[+] Found 42 subdomains.</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-4">[+] Scanning for exposed services...</motion.p>
                
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-red mb-1">! CRITICAL: Exposed database port detected on dev.enterprise.com.eg:5432</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-yellow-500 mb-4">! WARNING: Outdated TLS certificate on mail.enterprise.com.eg</motion.p>
                
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.5 } } }} className="text-neutral-500 mb-2">$ ./check_darkweb --domain enterprise.com.eg</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.6 } } }} className="mb-1">[+] Querying deep web indices and forum dumps...</motion.p>
                <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { delay: 0.8 } } }} className="text-red mb-1 font-bold">! ALERT: 3 compromised credentials found in recent 'Citadel' dump.</motion.p>
                <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1 } } }} className="text-cyan animate-pulse mt-4">_</motion.p>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-black relative fade-in-section border-t border-white/5 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-white">Transparent Pricing for Every Scale</h2>
            <p className="text-neutral-400 text-lg">Choose the right level of protection for your organization.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto z-10 relative"
          >
            {/* Basic Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } },
                hover: { y: -10, transition: { duration: 0.3 } }
              }}
              whileHover="hover"
              className="cyber-glass-card p-8 flex flex-col relative group"
            >
              <div className="cyber-glass-card-glow"></div>
              {/* Parallax Hover Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="w-12 h-12 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:bg-white/5 z-10">
                 <Shield className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
                <p className="text-neutral-500 text-sm mb-6">For small businesses and startups.</p>
                <div className="text-3xl font-bold text-white mb-2">Contact Sales</div>
                <p className="text-neutral-500 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow relative z-10">
                {[
                  {text: 'Up to 2 Monitored Domains', type: 'feature'}, 
                  {text: 'Surface Web Monitoring', type: 'feature'}, 
                  {text: 'Basic Vulnerability Scanning', type: 'feature'}, 
                  {text: 'Weekly Security Reports', type: 'feature'}, 
                  {text: 'Email Alerts Only', type: 'limit'},
                  {text: 'No Deep/Dark Web Coverage', type: 'limit'}
                  ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${item.type === 'limit' ? 'text-neutral-500' : 'text-neutral-300'}`}>
                    {item.type === 'feature' ? (
                      <Check className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full inline-flex justify-center relative z-10 py-3 px-6 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </a>
            </motion.div>

            {/* Professional Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } },
                hover: { y: -10, transition: { duration: 0.3 } }
              }}
              whileHover="hover"
              className="cyber-glass-card border border-cyan/30 hover:border-cyan/60 p-8 flex flex-col relative group shadow-[0_0_30px_rgba(0,194,255,0.05)] hover:shadow-[0_0_40px_rgba(0,194,255,0.15)] transition-all"
              style={{ background: 'rgba(10, 15, 20, 0.4)' }}
            >
              <div className="cyber-glass-card-glow text-cyan/20"></div>
              {/* Parallax Hover Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 bg-[#0A0A0A] border border-cyan/20 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(0,194,255,0.3)] group-hover:bg-cyan/10">
                   <Activity className="w-5 h-5 text-cyan" />
                </div>
                <div className="bg-cyan/10 border border-cyan/20 text-cyan px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
                  Most Popular
                </div>
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                <p className="text-neutral-500 text-sm mb-6">For mid-market and growing enterprises.</p>
                <div className="text-3xl font-bold text-white mb-2">Contact Sales</div>
                <p className="text-neutral-500 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow relative z-10">
                {[
                  {text: 'Up to 10 Monitored Domains', type: 'feature'},
                  {text: 'Deep & Dark Web Monitoring', type: 'feature'}, 
                  {text: 'Attack Surface Discovery', type: 'feature'}, 
                  {text: 'Real-time SMS & Email Alerts', type: 'feature'}, 
                  {text: 'Monthly Security Assessment', type: 'feature'},
                  {text: 'No Dedicated Security Analyst', type: 'limit'}
                  ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${item.type === 'limit' ? 'text-neutral-500' : 'text-neutral-300'}`}>
                    {item.type === 'feature' ? (
                      <Check className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <span className="group-hover:text-white transition-colors">{item.text}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full inline-flex justify-center relative z-10 py-3 px-6 rounded-lg bg-cyan text-black font-bold hover:bg-cyan/90 transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </a>
            </motion.div>

            {/* Enterprise Tier */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", stiffness: 100, damping: 20 } },
                hover: { y: -10, transition: { duration: 0.3 } }
              }}
              whileHover="hover"
              className="cyber-glass-card p-8 flex flex-col relative group"
            >
              <div className="cyber-glass-card-glow"></div>
              {/* Parallax Hover Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 group-hover:-translate-y-4 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="w-12 h-12 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:bg-white/5 z-10">
                 <Globe className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-neutral-500 text-sm mb-6">For large enterprises and government.</p>
                <div className="text-3xl font-bold text-white mb-2">Contact Sales</div>
                <p className="text-neutral-500 text-sm">Customized to your asset size</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow relative z-10">
                {[
                  {text: 'Unlimited Assets & Domains', type: 'feature'}, 
                  {text: 'Full Red Teaming Operations', type: 'feature'}, 
                  {text: 'Dedicated Security Analyst', type: 'feature'}, 
                  {text: 'Zero-day Vulnerability Alerts', type: 'feature'}, 
                  {text: 'Takedown & Mitigation Services', type: 'feature'},
                  {text: 'Custom Integrations & Webhooks', type: 'feature'}
                ].map((item, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${item.type === 'limit' ? 'text-neutral-500' : 'text-neutral-300'}`}>
                    {item.type === 'feature' ? (
                      <Check className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full inline-flex justify-center relative z-10 py-3 px-6 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black mt-auto">
                Request Quote
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <section className="py-16 bg-black border-y border-white/5 fade-in-section text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center border-b border-r border-white/5 lg:border-b-0">
              <div className="text-4xl md:text-5xl font-bold text-cyan mb-2">
                <StatCounter end={50} suffix="M+" delay={0} duration={1500} />
              </div>
              <div className="text-neutral-400 text-sm font-medium">Compromised credentials in database</div>
            </div>
            <div className="p-6 text-center border-b border-white/5 lg:border-b-0 lg:border-r">
              <div className="text-4xl md:text-5xl font-bold text-cyan mb-2">
                <StatCounter end={10000} suffix="+" delay={1000} duration={1500} />
              </div>
              <div className="text-neutral-400 text-sm font-medium">Dark web sources monitored</div>
            </div>
            <div className="p-6 text-center border-r border-white/5">
              <div className="text-4xl md:text-5xl font-bold text-cyan mb-2">
                <StatCounter end={15} prefix="<" suffix="min" delay={2000} duration={1500} />
              </div>
              <div className="text-neutral-400 text-sm font-medium">Average alert delivery time</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl md:text-5xl font-bold text-cyan mb-2">
                <StatCounter end={24} suffix="/7" delay={3000} duration={1500} />
              </div>
              <div className="text-neutral-400 text-sm font-medium">Live monitoring coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-black fade-in-section text-white border-b border-white/5">
        
        {/* Subtle static gradient fallback underneath */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-cyan/5 blur-[120px] pointer-events-none z-0"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {/* Live Scan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
            </span>
            {t('مسح حي متوفر', 'Live Scan Available')}
          </div>

          <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-6 text-white">{t('هل بياناتك موجوة على الويب المظلم؟', 'Is Your Data Already on the Dark Web?')}</h2>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
            {t('قم بإجراء فحص مجاني واكتشف خلال دقائق. لا يلزمك أي التزام.', 'Run a free exposure scan and find out in minutes. No commitment required.')}
          </p>

          {/* Form Area */}
          <div className="max-w-xl mx-auto relative group mt-8">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const domain = (form.elements[0] as HTMLInputElement).value;
                
                trackEvent('scan_submitted', { target_domain: domain, source: 'Footer CTA' });
                
                const toastId = toast.loading('Initiating deep scan for ' + domain + '...');
                setTimeout(() => {
                  toast.success('Scan complete. No recent breaches found for ' + domain, { id: toastId, duration: 4000 });
                  form.reset();
                }, 2500);
              }}
              className="relative flex flex-col sm:flex-row items-center cyber-glass-card p-1.5 rounded-full border border-white/10 focus-within:border-cyan/50 focus-within:shadow-[0_0_30px_rgba(0,194,255,0.1)] transition-all duration-300"
            >
              <div className="cyber-glass-card-glow text-cyan/20"></div>
              <input 
                type="text" 
                placeholder={t('أدخل نطاق شركتك (مثل company.com)', 'Enter your company domain (e.g. company.com)')}
                className="flex-1 bg-transparent text-white px-6 py-3 outline-none placeholder:text-neutral-500 w-full rounded-full relative z-10"
                required
                aria-label="Enter your company domain"
              />
              <button type="submit" className="bg-red hover:bg-red/90 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 glow-red whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 focus:ring-offset-black w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
                {t('افحص الآن', 'Scan Now')}
              </button>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan" /> No account required
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan" /> Results in under 60 seconds
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan" /> Used by security teams across MENA
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-600 mt-8">
            By submitting, you agree to our Privacy Policy. We will never share your data.
          </p>
        </div>
      </section>

      {/* Admin Panel Section */}
      {user && profile?.role === 'Admin' && (
        <section id="admin" className="py-24 relative bg-black border-t border-white/5 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <Suspense fallback={<SkeletonLoader type="panel" />}>
              <AdminPanel />
            </Suspense>
          </div>
        </section>
      )}

      {/* Client Dashboard Section */}
      {user && profile?.role === 'Viewer' && (
        <section id="dashboard" className="py-24 relative bg-black border-t border-white/5 text-white">
          <div className="max-w-7xl mx-auto px-6">
             <Suspense fallback={<SkeletonLoader type="panel" />}>
               <ClientDashboard />
             </Suspense>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-[#050505] pt-20 pb-8 border-t border-white/5 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Column 1 - Brand */}
            <div className="space-y-6 lg:col-span-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-cyan" />
                <span className="text-xl font-bold tracking-tight text-white">
                  EGY <span className="text-cyan">SAFE</span>
                </span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Protecting Egyptian and MENA businesses from the threats they can't see.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-neutral-500 hover:text-cyan focus:outline-none focus:text-cyan transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 hover:text-cyan focus:outline-none focus:text-cyan transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-neutral-500 hover:text-cyan focus:outline-none focus:text-cyan transition-colors" aria-label="Telegram">
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Column 2 - Services */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 text-white">Services</h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Dark Web Monitoring</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Attack Surface Discovery</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Security Assessment</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Red Teaming & Adversary Simulation</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Network Penetration Testing</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-cyan focus:outline-none focus:text-blue-600 dark:focus:text-blue-600 dark:text-cyan transition-colors">Web & Mobile App Testing</a></li>
              </ul>
            </div>

            {/* Column 3 - Company */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-cyan focus:outline-none focus:text-cyan transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4 - Contact Info & Form */}
            <div className="lg:col-span-4">
              <h4 className="font-bold mb-4 text-white">Contact Us</h4>
              
              <div className="mb-6 space-y-2 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan" />
                  <a href="mailto:contact@egysafe.com" className="hover:text-cyan transition-colors">contact@egysafe.com</a>
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <div className="w-4 h-4 rounded-full border border-cyan/50 flex items-center justify-center shrink-0">
                     <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse"></div>
                   </div>
                   <span>Cairo, Egypt HQ / Remote MENA</span>
                </div>
              </div>

              <ContactForm />

              {/* Newsletter Signup */}
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <div>© 2025 Egy Safe. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white focus:outline-none focus:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white focus:outline-none focus:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 p-3 rounded-full bg-[#111] text-white border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all duration-300 z-40 hover:bg-white/10 hover:border-cyan/50 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 text-cyan" />
      </button>
      
      <Suspense fallback={<SkeletonLoader type="widget" />}>
        <Chatbot activeSection={activeSection} />
      </Suspense>
      <Suspense fallback={<SkeletonLoader type="modal" />}>
        <SecurityAssessmentModal 
          isOpen={isAssessmentModalOpen} 
          onClose={() => setIsAssessmentModalOpen(false)} 
        />
        <ConsultationModal 
          isOpen={isConsultationModalOpen}
          onClose={() => setIsConsultationModalOpen(false)}
        />
      </Suspense>

      {/* Sticky Enterprise Consultation Pill */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button 
           onClick={() => setIsConsultationModalOpen(true)}
           className="bg-[#111]/90 backdrop-blur-md border border-cyan/30 shadow-[0_0_20px_rgba(0,194,255,0.2)] rounded-full px-5 py-2.5 sm:px-6 sm:py-3 flex items-center gap-3 group hover:border-cyan hover:shadow-[0_0_30px_rgba(0,194,255,0.4)] hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-cyan"
           aria-label="Request Enterprise Consultation"
        >
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
          <span className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan transition-colors whitespace-nowrap">Request Enterprise Consultation</span>
          <ArrowRight className="w-4 h-4 text-cyan/70 group-hover:text-cyan group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}

