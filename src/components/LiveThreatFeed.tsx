import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, AlertCircle, Activity, Globe, Lock, Loader2, Key, Database, FileWarning, Mail, Bomb, Bug, Download, Play, Pause, RotateCcw, DoorOpen, Skull, Zap, Fish, MailWarning, Network, Search } from 'lucide-react';
import { io } from 'socket.io-client';
import { logUserAction } from '../lib/audit';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
type ThreatStatus = 'active' | 'reviewed' | 'dismissed';

interface Threat {
  id: string;
  timestamp: Date | string; // Handle serialized dates
  type: string;
  target: string;
  severity: Severity;
  description: string;
  status: ThreatStatus;
}

const THREAT_TYPES = [
  'Credential Leak',
  'Initial Access Broker',
  'Ransomware Sighting',
  'Zero-Day Exploit Chatter',
  'Database Dump',
  'DDoS Planning',
  'Phishing Campaign',
];

const TARGETS = [
  'Financial Sector',
  'Healthcare Org',
  'Government SaaS',
  'E-Commerce Platform',
  'Telecom Provider',
  'Manufacturing Tech',
];

const DESCRIPTIONS = [
  'Active discussion observed on dark web forums regarding sale of access.',
  'Large database dump allegedly containing millions of user records published.',
  'Compromised credentials verified matching corporate domain patterns.',
  'Threat actors seeking partners for imminent ransomware deployment.',
  'Chatter indicates automated scanning for recently disclosed CVEs.',
];

const generateOldThreat = (baseTime: number): Threat => {
  const severities: Severity[] = ['CRITICAL', 'HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'MEDIUM'];
  return {
    id: `hist-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(baseTime),
    type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    target: TARGETS[Math.floor(Math.random() * TARGETS.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    description: DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)],
    status: 'active',
  };
};

const initialThreats: Threat[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    type: 'Credential Leak',
    target: 'Telecom Provider',
    severity: 'HIGH',
    description: 'Compromised credentials verified matching corporate domain patterns.',
    status: 'active',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'Ransomware Sighting',
    target: 'Healthcare Org',
    severity: 'CRITICAL',
    description: 'Threat actors seeking partners for imminent ransomware deployment.',
    status: 'active',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    type: 'Database Dump',
    target: 'E-Commerce Platform',
    severity: 'MEDIUM',
    description: 'Large database dump allegedly containing millions of user records published.',
    status: 'active',
  }
];

export default function LiveThreatFeed() {
  const [threats, setThreats] = useState<Threat[]>(initialThreats);
  const [isPaused, setIsPaused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | ThreatStatus>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  const { profile } = useAuth();
  const isAnalystOrAdmin = profile?.role === 'Admin' || profile?.role === 'Analyst';
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playThreatAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio playback failed', e);
    }
  };

  useEffect(() => {
    // Connect to WebSocket server running on same origin
    const socket = io({
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Connected to Threat Feed WebSocket stream');
      setSocketStatus('connected');
      toast.dismiss('socket-status');
    });

    socket.on('disconnect', (reason) => {
      console.warn('Disconnected from stream:', reason);
      setSocketStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setSocketStatus('reconnecting');
    });

    socket.on('reconnect', () => {
      setSocketStatus('connected');
      toast.success('Reconnected to live stream', { id: 'socket-status' });
    });

    socket.on('scanning_threat', () => {
      if (isPaused) return;
      setIsScanning(true);
    });

    socket.on('new_threat', (threat: Threat) => {
      if (isPaused) return;
      
      const parsedThreat = { ...threat, timestamp: new Date(threat.timestamp) };
      
      setThreats(prev => [parsedThreat, ...prev]);
      
      setIsScanning(false);

      const isCritical = threat.severity === 'CRITICAL';
      
      if (isCritical) {
        playThreatAlarm();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`CRITICAL THREAT: ${threat.type}`, {
            body: `Target: ${threat.target}\n${threat.description}`,
            icon: '/favicon.ico' // Assuming standard favicon
          });
        }
      }

      // Trigger realtime toast notification
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

  // Pause feed automatically when not in view
  useEffect(() => {
    const section = document.getElementById('live-threat-feed');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && !isPaused) {
          setIsPaused(true);
        } else if (entry.isIntersecting && isPaused) {
          setIsPaused(false);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
    return () => observer.disconnect();
  }, [isPaused]);

  const loadMoreThreats = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    
    setTimeout(() => {
      setThreats(prev => {
        const oldestTime = prev.length > 0 
          ? new Date(prev[prev.length - 1].timestamp).getTime() 
          : Date.now();
        
        const newOlderThreats = Array.from({ length: 10 }).map((_, i) => 
          generateOldThreat(oldestTime - (i + 1) * 1000 * 60 * (15 + Math.random() * 30))
        );
        
        return [...prev, ...newOlderThreats];
      });
      setIsLoadingMore(false);
    }, 1500); // Simulate network delay
  }, [isLoadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreThreats();
      }
    }, { threshold: 0.1 });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreThreats]);

  const markThreatStatus = (id: string, newStatus: ThreatStatus) => {
    if (!isAnalystOrAdmin) {
      toast.error('You must be an Analyst or Admin to modify threat statuses.');
      return;
    }
    setThreats(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Threat marked as ${newStatus}`);
    logUserAction('Data Modification', `Marked threat ${id} as ${newStatus}`);
  };

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

  const getCardSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red/5 dark:bg-red/[0.02] hover:bg-red/10 dark:hover:bg-red/[0.05] border-red/20 dark:border-red/10';
      case 'HIGH': return 'bg-orange-500/5 dark:bg-orange-500/[0.02] hover:bg-orange-500/10 dark:hover:bg-orange-500/[0.05] border-orange-500/20 dark:border-orange-500/10';
      case 'MEDIUM': return 'bg-yellow-500/5 dark:bg-yellow-500/[0.02] hover:bg-yellow-500/10 dark:hover:bg-yellow-500/[0.05] border-yellow-500/20 dark:border-yellow-500/10';
      default: return 'bg-white dark:bg-[#111] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5';
    }
  };

  const getThreatTypeIcon = (type: string, className: string = "w-3.5 h-3.5 text-neutral-400") => {
    const lowerType = type.toLowerCase();
    
    // Explicit mappings for our core threat types
    if (lowerType.includes('credential leak')) return <Key className={className} />;
    if (lowerType.includes('database dump')) return <Database className={className} />;
    if (lowerType.includes('ransomware sighting')) return <Skull className={className} />;
    if (lowerType.includes('phishing campaign')) return <Fish className={className} />;
    if (lowerType.includes('ddos planning')) return <Zap className={className} />;
    if (lowerType.includes('initial access broker')) return <DoorOpen className={className} />;
    if (lowerType.includes('zero-day') || lowerType.includes('exploit')) return <Bug className={className} />;

    // Fallbacks
    if (lowerType.includes('credential') || lowerType.includes('password')) return <Key className={className} />;
    if (lowerType.includes('database')) return <Database className={className} />;
    if (lowerType.includes('ransomware') || lowerType.includes('malware')) return <Skull className={className} />;
    if (lowerType.includes('phishing') || lowerType.includes('domain')) return <Fish className={className} />;
    if (lowerType.includes('vulnerability') || lowerType.includes('cve')) return <Bug className={className} />;
    return <FileWarning className={className} />;
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
    const matchesStatus = activeStatusFilter === 'ALL' || threat.status === activeStatusFilter;
    const matchesSearch = searchTerm === '' || 
      threat.target.toLowerCase().includes(searchTerm.toLowerCase()) || 
      threat.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      threat.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesType && matchesStatus && matchesSearch;
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
    <section id="live-threat-feed" className="py-24 bg-black/20 backdrop-blur-sm relative border-b border-white/5">
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
              <div className="px-4 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full lg:w-auto overflow-hidden">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-xs font-mono text-neutral-500 hidden sm:flex items-center gap-2 truncate">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span className="truncate">terminal.egysafe.darkweb_monitor</span>
                  </div>

                  {/* Terminal Controls */}
                  <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-auto">
                    <button 
                      onClick={() => {
                        if (!isAnalystOrAdmin) {
                          toast.error('You must be an Analyst or Admin to control the live scanner.');
                          return;
                        }
                        setIsPaused(!isPaused);
                      }}
                      className={`p-1.5 rounded-md transition-colors focus:outline-none shrink-0 ${isPaused ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
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
                      className="p-1.5 rounded-md text-neutral-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none shrink-0"
                      title="Reset Feed"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4 w-full">
                  <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0 sm:min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search threats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
                    />
                  </div>
                  {/* Type Filter */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveTypeFilter('ALL')}
                      className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border shrink-0 ${
                        activeTypeFilter === 'ALL'
                          ? 'bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,194,255,0.15)]'
                          : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      All Types
                    </button>
                    {uniqueThreatTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setActiveTypeFilter(type)}
                        className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border shrink-0 ${
                          activeTypeFilter === type
                            ? 'bg-cyan/10 border-cyan/30 text-cyan shadow-[0_0_15px_rgba(0,194,255,0.15)]'
                            : 'border-white/5 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {getThreatTypeIcon(type, "w-3 h-3")}
                        {type}
                      </button>
                    ))}
                  </div>
                  
                  {/* Divider hidden on mobile */}
                  <div className="hidden lg:block w-px h-6 bg-white/10 shrink-0"></div>
                  
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-[#050505] border border-white/5 rounded-full p-1 shrink-0 w-full lg:w-auto overflow-x-auto no-scrollbar">
                    {[{value: 'ALL', label: 'ALL'}, {value: 'active', label: 'ACTIVE'}, {value: 'reviewed', label: 'REVIEWED'}, {value: 'dismissed', label: 'DISMISSED'}].map((statusObj) => (
                      <button
                        key={statusObj.value}
                        onClick={() => setActiveStatusFilter(statusObj.value as 'ALL' | ThreatStatus)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 ${
                          activeStatusFilter === statusObj.value 
                            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'text-neutral-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {statusObj.label}
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
                    className={`rounded-xl px-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-all cursor-default border backdrop-blur-sm ${getCardSeverityColor(threat.severity)} ${threat.status === 'reviewed' ? 'opacity-80 border-green-500/30' : ''} ${threat.status === 'dismissed' ? 'opacity-40 grayscale' : ''}`}
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
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getSeverityColor(threat.severity)}`}>
                            {threat.severity === 'CRITICAL' && <ShieldAlert className="w-3 h-3" />}
                            {threat.severity === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                            {threat.severity === 'MEDIUM' && <AlertCircle className="w-3 h-3" />}
                            {threat.severity}
                          </span>
                          <div className="flex items-center gap-1.5 text-black dark:text-offwhite">
                            {getThreatTypeIcon(threat.type)}
                            <span className="text-sm font-bold truncate">
                              {threat.type}
                            </span>
                          </div>
                          {threat.status === 'reviewed' && (
                            <span className="ml-2 px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold tracking-widest uppercase rounded">
                              Reviewed
                            </span>
                          )}
                          {threat.status === 'dismissed' && (
                            <span className="ml-2 px-2 py-0.5 bg-white/5 text-neutral-400 border border-white/10 text-[9px] font-bold tracking-widest uppercase rounded">
                              Dismissed
                            </span>
                          )}
                        </div>

                        {/* Status Actions */}
                        {isAnalystOrAdmin && (
                          <div className="flex items-center gap-1 ml-auto">
                            {threat.status !== 'reviewed' && (
                              <button
                                onClick={() => markThreatStatus(threat.id, 'reviewed')}
                                className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                              >
                                Review
                              </button>
                            )}
                            {threat.status !== 'dismissed' && (
                              <button
                                onClick={() => markThreatStatus(threat.id, 'dismissed')}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        )}
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
                
                {/* Infinite Scroll Intersection Target */}
                {filteredThreats.length > 0 && (
                  <div 
                    ref={observerTarget}
                    className="flex justify-center items-center py-6 pb-24 mt-4"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-cyan/70 text-xs font-mono">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching historical threat data...
                      </div>
                    ) : (
                      <div className="h-4 w-full" />
                    )}
                  </div>
                )}
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
