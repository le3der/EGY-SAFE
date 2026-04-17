import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, AlertCircle, Activity, Globe, Lock, Loader2, Key, Database, FileWarning, Mail, Bomb, Bug, Download, Play, Pause, RotateCcw } from 'lucide-react';
import { io } from 'socket.io-client';
import { logUserAction } from '../lib/audit';
import { useAuth } from '../context/AuthContext';
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
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');

  const { profile } = useAuth();
  const isAnalystOrAdmin = profile?.role === 'Admin' || profile?.role === 'Analyst';

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

  const uniqueThreatTypes = Array.from(new Set(threats.map(t => t.type)));

  const filteredThreats = threats.filter(threat => {
    const matchesSeverity = activeSeverityFilter === 'ALL' || threat.severity === activeSeverityFilter;
    const matchesType = activeTypeFilter === 'ALL' || threat.type === activeTypeFilter;
    return matchesSeverity && matchesType;
  });

  const exportToCSV = () => {
    if (!isAnalystOrAdmin) {
      toast.error("You must be an Analyst or Admin to export data.");
      return;
    }

    if (filteredThreats.length === 0) {
      toast.error("No data to export.");
      return;
    }

    const headers = ['Timestamp', 'Severity', 'Type', 'Target', 'Description'];
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(','),
      ...filteredThreats.map(threat => {
        const dateStr = typeof threat.timestamp === 'string' ? threat.timestamp : threat.timestamp.toISOString();
        return [
          escapeCsv(dateStr),
          escapeCsv(threat.severity),
          escapeCsv(threat.type),
          escapeCsv(threat.target),
          escapeCsv(threat.description)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `egysafe_threat_feed_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Threat feed exported to CSV");
    
    // Log the export action asynchronously
    logUserAction('Data Export', `Exported Global Threat Feed Data (${filteredThreats.length} records)`);
  };

  return (
    <section id="live-threat-feed" className="py-24 bg-black relative border-b border-white/5">
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

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button 
              onClick={() => {
                if (!isAnalystOrAdmin) {
                  toast.error('You must be an Analyst or Admin to control the live scanner.');
                  return;
                }
                setIsPaused(!isPaused);
              }}
              aria-label={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
              aria-pressed={isPaused}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors focus:outline-none ${isPaused ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20' : 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20'}`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume Feed' : 'Pause Feed'}
            </button>
            <button 
              onClick={() => {
                if (!isAnalystOrAdmin) {
                  toast.error('You must be an Analyst or Admin to reset the feed.');
                  return;
                }
                setThreats([]);
                toast.success("Threat feed reset.");
                logUserAction('Data Modification', 'Reset Global Threat Feed');
              }}
              aria-label="Reset Live Feed"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Feed
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Live Feed Container */}
        <div className="lg:w-2/3 w-full">
          <div className="cyber-glass-card shadow-2xl">
            
            {/* Window Controls & Filters */}
            <div className="bg-[#111] border-b border-white/5">
              <div className="px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center justify-between xl:justify-start gap-4 w-full xl:w-auto">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-xs font-mono text-neutral-500 hidden sm:flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>terminal.egysafe.darkweb_monitor</span>
                  </div>

                  {/* Terminal Controls */}
                  <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-auto xl:ml-2">
                    <button 
                      onClick={() => {
                        if (!isAnalystOrAdmin) {
                          toast.error('You must be an Analyst or Admin to control the live scanner.');
                          return;
                        }
                        setIsPaused(!isPaused);
                      }}
                      className={`p-1.5 rounded-md transition-colors focus:outline-none ${isPaused ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
                      title={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => {
                        if (!isAnalystOrAdmin) {
                          toast.error('You must be an Analyst or Admin to reset the feed.');
                          return;
                        }
                        setThreats([]);
                        toast.success("Threat feed reset.");
                        logUserAction('Data Modification', 'Reset Global Threat Feed');
                      }}
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                      title="Reset Feed"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 w-full xl:w-auto overflow-hidden">
                  {/* Type Filter */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1 xl:pb-0 mask-edges-right pr-8">
                    <button
                      onClick={() => setActiveTypeFilter('ALL')}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border shrink-0 ${
                        activeTypeFilter === 'ALL'
                          ? 'bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,194,255,0.15)]'
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      All Types
                    </button>
                    {uniqueThreatTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setActiveTypeFilter(type)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border shrink-0 ${
                          activeTypeFilter === type
                            ? 'bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,194,255,0.15)]'
                            : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  
                  {/* Divider hidden on mobile */}
                  <div className="hidden lg:block w-px h-6 bg-white/10 shrink-0"></div>
                  
                  {/* Severity Filter */}
                  <div className="flex items-center gap-1.5 bg-[#050505] border border-white/5 rounded-full p-1 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setActiveSeverityFilter(sev as 'ALL' | Severity)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 ${
                          activeSeverityFilter === sev 
                            ? sev === 'CRITICAL' ? 'bg-red/20 text-red shadow-[0_0_15px_rgba(255,59,87,0.2)]'
                              : sev === 'HIGH' ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                              : sev === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                              : 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
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

                {filteredThreats.length === 0 && !isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3"
                  >
                    <Activity className="w-8 h-8 opacity-50" />
                    <p className="text-sm font-sans">No recent threats match your filters.</p>
                  </motion.div>
                )}

                {filteredThreats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, y: 20, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', scale: 1 }}
                    exit={{ opacity: 0, y: -20, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.9, margin: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
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
