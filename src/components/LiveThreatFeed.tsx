import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, AlertCircle, Activity, Globe, Lock, Loader2, Key, Database, FileWarning, Mail, Bomb, Bug } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';

interface Threat {
  id: string;
  timestamp: Date | string; // Handle serialized dates
  type: string;
  target: string;
  severity: Severity;
  description: string;
}

const initialThreats: Threat[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    type: 'Credential Leak',
    target: 'Telecom Provider',
    severity: 'HIGH',
    description: 'Compromised credentials verified matching corporate domain patterns.',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'Ransomware Sighting',
    target: 'Healthcare Org',
    severity: 'CRITICAL',
    description: 'Threat actors seeking partners for imminent ransomware deployment.',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'Database Dump',
    target: 'E-Commerce Platform',
    severity: 'MEDIUM',
    description: 'Large database dump allegedly containing millions of user records published.',
  }
];

export default function LiveThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>(initialThreats);
  const [isPaused, setIsPaused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server running on same origin
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to Threat Feed WebSocket stream');
    });

    socket.on('scanning_threat', () => {
      if (isPaused) return;
      setIsScanning(true);
    });

    socket.on('new_threat', (threat: Threat) => {
      if (isPaused) return;
      
      const parsedThreat = { ...threat, timestamp: new Date(threat.timestamp) };
      
      setThreats(prev => {
        const newThreats = [parsedThreat, ...prev];
        return newThreats.slice(0, 15); // Keep last 15
      });
      
      setIsScanning(false);

      // Trigger realtime toast notification
      const isCritical = threat.severity === 'CRITICAL';
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-[#050505] shadow-lg rounded-lg pointer-events-auto flex ring-1 ${isCritical ? 'ring-red-500/50' : 'ring-cyan/30'}`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {isCritical ? <ShieldAlert className="h-6 w-6 text-red-500" /> : <Activity className="h-6 w-6 text-cyan" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    New {threat.severity} Threat Detected
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {threat.type} impacting <span className="text-white">{threat.target}</span>.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/10">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-cyan hover:text-cyan/80 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isPaused]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red bg-red/10 border-red/30';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-4 h-4 text-red" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getThreatTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('credential') || lowerType.includes('password')) return <Key className="w-3.5 h-3.5 text-neutral-400" />;
    if (lowerType.includes('database') || lowerType.includes('dump')) return <Database className="w-3.5 h-3.5 text-neutral-400" />;
    if (lowerType.includes('ransomware') || lowerType.includes('malware')) return <Bomb className="w-3.5 h-3.5 text-neutral-400" />;
    if (lowerType.includes('phishing') || lowerType.includes('domain')) return <Mail className="w-3.5 h-3.5 text-neutral-400" />;
    if (lowerType.includes('vulnerability') || lowerType.includes('cve') || lowerType.includes('exploit')) return <Bug className="w-3.5 h-3.5 text-neutral-400" />;
    return <FileWarning className="w-3.5 h-3.5 text-neutral-400" />;
  };

  const formatTime = (dateStrOrDate: string | Date) => {
    const date = new Date(dateStrOrDate);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  // Re-render times every second to update "Xs ago" text
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-black relative border-b border-black/5 dark:border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Header & Info */}
        <div className="lg:w-1/3 sticky top-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-bold tracking-widest uppercase mb-6">
            <Activity className="w-3.5 h-3.5" />
            Live Intelligence
          </div>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-black dark:text-white leading-tight">
            Global Dark Web <br /><span className="text-cyan">Threat Feed</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            Our automated crawlers are constantly indexing hacker forums, Telegram channels, and zero-day marketplaces. Watch live as our AI detects and categorizes new external risks in real-time.
          </p>
          
          <div className="flex items-center gap-4 border border-black/10 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-[#0A0A0A]">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
              <span className="absolute inset-0 rounded-full border border-cyan animate-ping opacity-20"></span>
              <Globe className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <div className="font-bold text-black dark:text-white flex items-center gap-2">
                Scanner Status
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
              </div>
              <div className="text-sm text-neutral-500">
                {isPaused ? 'Feed Paused' : 'Monitoring 12,450+ sources alive'}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
            aria-pressed={isPaused}
            className="mt-6 text-sm font-medium text-cyan hover:text-cyan/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan rounded"
          >
            {isPaused ? '▶ Resume Live Feed' : '⏸ Pause Live Feed'}
          </button>
        </div>

        {/* Live Feed Container */}
        <div className="lg:w-2/3 w-full">
          <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Window Controls */}
            <div className="bg-gray-200 dark:bg-[#111] px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 text-xs font-mono text-neutral-500 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                terminal.egysafe.darkweb_monitor
              </div>
            </div>

            {/* Feed List */}
            <div aria-live="polite" aria-atomic="false" className="p-4 h-[500px] overflow-y-auto no-scrollbar relative flex flex-col gap-3 font-mono">
              <AnimatePresence initial={false}>
                {isScanning && (
                  <motion.div
                    key="scanner-skeleton"
                    initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', scale: 1 }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95, margin: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-cyan/5 dark:bg-cyan/10 border border-cyan/30 rounded-xl px-4 flex flex-col sm:flex-row sm:items-start gap-4 overflow-hidden relative"
                  >
                    {/* Scanning Laser Effect border */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-cyan shadow-[0_0_8px_#00c2ff] z-10"
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
                    />

                    {/* Icon Date Skeleton */}
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0 sm:w-24 pt-1">
                      <div className="text-[10px] text-cyan font-bold animate-pulse tracking-widest uppercase">
                        Scanning
                      </div>
                      <div className="w-12 h-2 rounded bg-cyan/20 animate-pulse mt-2"></div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="flex-1 w-full pt-0.5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-20 h-5 rounded-md bg-cyan/20 animate-pulse"></div>
                        <div className="w-32 h-4 rounded bg-cyan/10 animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="w-full h-3 rounded bg-cyan/10 animate-pulse"></div>
                        <div className="w-4/5 h-3 rounded bg-cyan/10 animate-pulse"></div>
                        <div className="w-1/2 h-3 rounded bg-cyan/10 animate-pulse"></div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 text-xs font-mono text-cyan/70">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Decrypting target patterns...
                      </div>
                    </div>
                  </motion.div>
                )}

                {threats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', scale: 1 }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.9, margin: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-xl px-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-black/20 dark:hover:border-white/20 transition-all hover:bg-gray-50 dark:hover:bg-white/5 cursor-default"
                  >
                    {/* Timestamp & Icon */}
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0 sm:w-24">
                      {getSeverityIcon(threat.severity)}
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {formatTime(threat.timestamp)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </span>
                        <div className="flex items-center gap-1.5 text-black dark:text-offwhite">
                          {getThreatTypeIcon(threat.type)}
                          <span className="text-sm font-bold truncate">
                            {threat.type}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-sans">
                        {threat.description}
                      </p>
                      
                      <div className="text-xs text-neutral-500 flex items-center gap-1">
                        <span className="opacity-70">Target Pattern:</span> 
                        <span className="text-cyan">{threat.target}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Fade Out Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-[#0A0A0A] to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
