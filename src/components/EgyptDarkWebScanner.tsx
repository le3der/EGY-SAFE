import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, AlertCircle, Activity, Lock, Loader2, Key, Database, FileWarning, Mail, Bomb, Bug, Download, MapPin, DoorOpen, Skull, Zap, Fish, MailWarning } from 'lucide-react';
import { logUserAction } from '../lib/audit';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
type ThreatStatus = 'active' | 'reviewed' | 'dismissed';

interface Threat {
  id: string;
  timestamp: Date | string;
  type: string;
  target: string;
  severity: Severity;
  description: string;
  status: ThreatStatus;
}

const initialThreats: Threat[] = [
  {
    id: 'eg-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'Credential Leak',
    target: 'Cairo Logistics Hub',
    severity: 'HIGH',
    description: 'Employee credentials found in recent infostealer log dump on a Russian forum.',
    status: 'active',
  },
  {
    id: 'eg-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    type: 'Ransomware Mention',
    target: 'Egypt Health Tech',
    severity: 'CRITICAL',
    description: 'Threat actors seeking initial access broker for local healthcare provider.',
    status: 'active',
  },
  {
    id: 'eg-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    type: 'Database Dump',
    target: 'Alexandria Retail Group',
    severity: 'MEDIUM',
    description: 'Alleged customer database listing posted to popular breach forum.',
    status: 'active',
  }
];

const egTargets = ['Bank of Cairo', 'Nile Telecommunications', 'Giza Industrial Corp', 'Suez Maritime', 'EgyPharma Group', 'Luxor Hospitality'];
const egTypes = ['Credential Leak', 'Ransomware Mention', 'Database Dump', 'Source Code Leak', 'Phishing Domain'];

export default function EgyptDarkWebScanner() {
  const [threats, setThreats] = useState<Threat[]>(initialThreats);
  const [isPaused, setIsPaused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | ThreatStatus>('active');

  const { profile } = useAuth();
  const isAnalystOrAdmin = profile?.role === 'Admin' || profile?.role === 'Analyst';

  useEffect(() => {
    if (isPaused) return;

    let timeoutId: NodeJS.Timeout;

    const interval = setInterval(() => {
      // Simulate real-time scanning delay
      setIsScanning(true);
      
      timeoutId = setTimeout(() => {
        setIsScanning(false);
        // 30% chance to find a new threat during this cycle
        if (Math.random() > 0.7) {
          const newThreat: Threat = {
            id: `eg-${Date.now()}`,
            timestamp: new Date(),
            type: egTypes[Math.floor(Math.random() * egTypes.length)],
            target: egTargets[Math.floor(Math.random() * egTargets.length)],
            severity: Math.random() > 0.8 ? 'CRITICAL' : Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
            description: 'Automated Dark Web crawler identified potential compromised assets tied to Egyptian infrastructure.',
            status: 'active',
          };

          setThreats(prev => [newThreat, ...prev].slice(0, 15));
          
          if (newThreat.severity === 'CRITICAL') {
            toast.error(`Critical threat detected for ${newThreat.target}!`);
          }
        }
      }, 2000);
    }, 8000);

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPaused]);

  const markThreatStatus = (id: string, newStatus: ThreatStatus) => {
    if (!isAnalystOrAdmin) {
      toast.error('You must be an Analyst or Admin to modify threat statuses.');
      return;
    }
    setThreats(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Threat marked as ${newStatus}`);
    logUserAction('Data Modification', `Marked regional threat ${id} as ${newStatus}`);
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red bg-red/10 border-red/30';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
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

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert className="w-4 h-4 text-red" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getThreatTypeIcon = (type: string, className: string = "w-3.5 h-3.5 text-neutral-400") => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('credential leak')) return <Key className={className} />;
    if (lowerType.includes('database dump')) return <Database className={className} />;
    if (lowerType.includes('ransomware mention')) return <Skull className={className} />;
    if (lowerType.includes('phishing domain')) return <Fish className={className} />;
    if (lowerType.includes('source code leak')) return <Bug className={className} />;

    // Fallbacks
    if (lowerType.includes('credential')) return <Key className={className} />;
    if (lowerType.includes('database')) return <Database className={className} />;
    if (lowerType.includes('ransomware')) return <Skull className={className} />;
    if (lowerType.includes('phishing')) return <Fish className={className} />;
    if (lowerType.includes('source code')) return <Bug className={className} />;
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
    return matchesSeverity && matchesType && matchesStatus;
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
    link.setAttribute('download', `national_egypt_threats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("National threat feed exported to CSV");
    
    // Log the export action asynchronously
    logUserAction('Data Export', `Exported Regional Threat Data (${filteredThreats.length} records)`);
  };

  return (
    <section id="egypt-dark-web-scanner" className="py-24 bg-[#050505] relative border-b border-white/5">
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row-reverse gap-12 items-start">
        
        {/* Header & Info */}
        <div className="lg:w-1/3 sticky top-32">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red/10 border border-red/20 text-red text-xs font-bold tracking-widest uppercase mb-6">
            <MapPin className="w-3.5 h-3.5" />
            National Intelligence
          </div>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold mb-4 text-black dark:text-white leading-tight">
            Egypt Regional <br /><span className="text-red">Dark Web Scanner</span>
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            Delivering hyper-focused intelligence tracking mentions of Egyptian enterprises, government bodies, and infrastructure across Tor networks, I2P, and unauthorized credential marketplaces.
          </p>
          
          <div className="flex items-center gap-4 border border-black/10 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-[#0A0A0A] shadow-lg">
            <div className="w-12 h-12 rounded-full bg-red/10 flex items-center justify-center relative">
              <span className="absolute inset-0 rounded-full border border-red animate-ping opacity-20"></span>
              <Activity className="w-5 h-5 text-red" />
            </div>
            <div>
              <div className="font-bold text-black dark:text-white flex items-center gap-2">
                Scanner Status
                <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red animate-pulse'}`}></span>
              </div>
              <div className="text-sm text-neutral-500">
                {isPaused ? 'Feed Paused' : 'Monitoring regional threat actors'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button 
              onClick={() => {
                if (!isAnalystOrAdmin) {
                  toast.error('You must be an Analyst or Admin to control the regional scanner.');
                  return;
                }
                setIsPaused(!isPaused);
              }}
              className="text-sm font-medium text-red hover:text-red/80 transition-colors focus:outline-none rounded"
            >
              {isPaused ? '▶ Resume Scanning' : '⏸ Pause Scanning'}
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors focus:outline-none rounded"
            >
              <Download className="w-4 h-4" /> Export Regional Data
            </button>
          </div>
        </div>

        {/* Live Feed Container */}
        <div className="lg:w-2/3 w-full">
          <div className="cyber-glass-card shadow-2xl relative">
            
            {/* Window Controls & Filters */}
            <div className="bg-[#111] border-b border-white/5">
              <div className="px-4 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-center justify-between xl:justify-start gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span className="hidden sm:inline">eg_intel_stream.sh</span>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 w-full xl:w-auto overflow-hidden">
                  {/* Type Filter */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full xl:w-auto pb-1 xl:pb-0 mask-edges-right pr-8">
                    <button
                      onClick={() => setActiveTypeFilter('ALL')}
                      className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border shrink-0 ${
                        activeTypeFilter === 'ALL'
                          ? 'bg-red/10 border-red/30 text-red shadow-[0_0_15px_rgba(255,0,0,0.15)]'
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
                            ? 'bg-red/10 border-red/30 text-red shadow-[0_0_15px_rgba(255,0,0,0.15)]'
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
            <div className="bg-[#0A0A0A] border-b border-white/5 px-4 py-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-red" /> Scan Results
              </h3>
              <span className="text-xs text-neutral-500 font-mono">Real-time mapping</span>
            </div>
            
            <div aria-live="polite" className="p-4 h-[500px] overflow-y-auto no-scrollbar relative flex flex-col gap-3 font-mono">
              <AnimatePresence initial={false}>
                {isScanning && (
                  <motion.div
                    key="scanner-skeleton"
                    initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', scale: 1 }}
                    exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, scale: 0.95, margin: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-red/5 dark:bg-red/10 border border-red/30 rounded-xl px-4 flex flex-col sm:flex-row sm:items-start gap-4 overflow-hidden relative"
                  >
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-red shadow-[0_0_8px_#ff0000] z-10"
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                    />
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1 shrink-0 sm:w-24 pt-1">
                      <div className="text-[10px] text-red font-bold animate-pulse tracking-widest uppercase">
                        Crawling
                      </div>
                      <div className="w-12 h-2 rounded bg-red/20 animate-pulse mt-2"></div>
                    </div>
                    <div className="flex-1 w-full pt-0.5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-20 h-5 rounded-md bg-red/20 animate-pulse"></div>
                        <div className="w-32 h-4 rounded bg-red/10 animate-pulse"></div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="w-full h-3 rounded bg-red/10 animate-pulse"></div>
                        <div className="w-4/5 h-3 rounded bg-red/10 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-xs font-mono text-red/70">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing .eg domains in paste dumps...
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
                    <p className="text-sm font-sans">No regional threats match your filters.</p>
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${getSeverityColor(threat.severity)}`}>
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
                        <span className="opacity-70">Identified Asset:</span> 
                        <span className="text-red font-bold">{threat.target}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Fade Out Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
