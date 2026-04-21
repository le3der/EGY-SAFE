import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ShieldAlert, CheckCircle, AlertTriangle, Key, Globe, FileWarning, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ScanReport {
  domain: string;
  scanDate: string | Date;
  error?: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  engines?: {
    alienVault?: {
      connected: boolean;
      pulses?: number;
      malwareCount?: number;
    };
    darkWebScraper?: {
      status: string;
      mentions: number;
    };
    shodan?: {
      connected: boolean;
      message: string;
    };
  };
}

export default function FreeScanSection() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [scanHistory, setScanHistory] = useState<ScanReport[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  React.useEffect(() => {
    // Load history from localStorage
    try {
      const stored = localStorage.getItem('egysec_scan_history');
      if (stored) {
        setScanHistory(JSON.parse(stored));
      }
    } catch(e) {}
  }, []);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownRemaining]);

  const saveToHistory = (report: ScanReport) => {
    setScanHistory(prev => {
      const newHistory = [report, ...prev.filter(r => r.domain !== report.domain)].slice(0, 5); // Keep last 5
      try {
        localStorage.setItem('egysec_scan_history', JSON.stringify(newHistory));
      } catch(e) {}
      return newHistory;
    });
  };

  const steps = [
    "Initializing connection...",
    "Scanning surface web footprints...",
    "Querying breach databases (HaveIBeenPwned, etc)...",
    "Crawling dark web marketplaces...",
    "Analyzing credential dumps...",
    "Compiling threat report..."
  ];

  const handleExportPDF = async () => {
    if (!scanReport) return;
    try {
      toast.loading("Generating PDF...", { id: "pdf-toast" });
      const element = document.getElementById("scan-result-card");
      if (!element) throw new Error("Result element not found");
      
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0a0a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`EgySafe_Report_${scanReport.domain}.pdf`);
      toast.success("PDF Downloaded successfully", { id: "pdf-toast" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF", { id: "pdf-toast" });
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const domainToScan = target.trim();
    if (!domainToScan) return;

    // Client-side Rate Limiting (Cooldown: 30 seconds)
    const now = Date.now();
    if (now - lastScanTime < 30000) {
      const remainingSeconds = Math.ceil((30000 - (now - lastScanTime)) / 1000);
      toast.error(`Please wait ${remainingSeconds}s before scanning again to prevent flooding.`);
      return;
    }

    // Domain Validation and Sanitization
    // A robust regex for common domain matching
    const domainRegex = /^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+\.?)$/i;
    if (!domainRegex.test(domainToScan)) {
       toast.error("Invalid domain format. Please enter a valid domain (e.g., example.com)");
       return;
    }

    setLastScanTime(now);
    setCooldownRemaining(30);
    setIsScanning(true);
    setScanComplete(false);
    setScanStep(0);
    setScanReport(null);

    // Simulate scanning steps UI progression (while backend does real lookup)
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length - 1) {
        setScanStep(currentStep);
      }
    }, 800);

    try {
      const response = await fetch(`/api/intel/scan?domain=${encodeURIComponent(domainToScan)}`);
      const report = await response.json();
      
      clearInterval(interval);
      setScanStep(steps.length - 1);
      
      if (report.error && response.status === 400) {
         toast.error(report.error);
         setIsScanning(false);
         setScanComplete(false);
         return;
      }
      
      setScanReport(report);
      saveToHistory(report);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
      }, 500);
      
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setScanStep(steps.length - 1);
      setScanReport({ 
        domain: domainToScan,
        scanDate: new Date(),
        riskLevel: 'LOW', 
        summary: 'Connection failed. Ensure backend services are running.' 
      });
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  return (
    <section id="free-scan" className="py-24 bg-[#050505] relative border-b border-white/5 scroll-mt-20">
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,194,255,0.15)]">
            <Search className="w-3.5 h-3.5" />
            Instant Exposure Check
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            What hackers already know <br/> about <span className="text-cyan">your company</span>
          </h2>
          <p className="text-neutral-400">
            Enter your domain to run a passive scan against known ransomware leaks, <br className="hidden md:block" /> botnet logs, and dark web credential dumps.
          </p>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent"></div>
          
          <form onSubmit={handleScan} className="relative z-10 mb-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Enter domain (e.g., yourcompany.com.eg)"
                  className="w-full bg-black border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan transition-colors"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isScanning}
                />
              </div>
              <button
                type="submit"
                disabled={isScanning || !target.trim() || cooldownRemaining > 0}
                className="bg-cyan hover:bg-white text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap glow-cyan flex items-center justify-center gap-2 min-w-[160px]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>
                    Wait {cooldownRemaining}s
                  </>
                ) : (
                  <>
                    Run Scan
                  </>
                )}
              </button>
            </div>
          </form>

          {!isScanning && !scanComplete && scanHistory.length > 0 && (
            <div className="max-w-2xl mx-auto mb-8 relative z-10 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-neutral-500 mr-2 mt-1">Recent Scans:</span>
              {scanHistory.map((report, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTarget(report.domain);
                    setScanReport(report);
                    setScanComplete(true);
                  }}
                  className="bg-white/5 border border-white/10 hover:border-cyan/50 hover:text-cyan text-neutral-400 px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <Search className="w-3 h-3" />
                  {report.domain}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isScanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-2xl mx-auto bg-black border border-white/5 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin flex-shrink-0"></div>
                  <div>
                    <div className="text-cyan font-mono text-sm mb-1 uppercase tracking-wider">Phase {scanStep + 1} of {steps.length}</div>
                    <div className="text-white font-medium">{steps[scanStep]}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className={`flex items-center gap-3 text-sm font-mono transition-opacity duration-300 ${idx < scanStep ? 'text-neutral-500' : idx === scanStep ? 'text-white' : 'text-neutral-700'}`}>
                      {idx < scanStep ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : idx === scanStep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-700 flex-shrink-0"></div>
                      )}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {scanComplete && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto"
                id="scan-result-card"
              >
                <div className={`bg-${scanReport?.riskLevel === 'HIGH' ? 'red' : 'green-500'}/5 border border-${scanReport?.riskLevel === 'HIGH' ? 'red' : 'green-500'}/20 rounded-xl p-6 mb-6`}>
                  <div className="flex items-start gap-4">
                    {scanReport?.riskLevel === 'HIGH' ? (
                      <ShieldAlert className="w-8 h-8 text-red flex-shrink-0 mt-1" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Exposure Scan for {target}</h3>
                      <p className="text-neutral-400 text-sm mb-4">
                        {scanReport?.summary || "We found records matching your domain in recent dark web databases. This is a partial preview."}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className={`flex items-center gap-2 text-${scanReport?.riskLevel === 'HIGH' ? 'red' : 'cyan'} font-mono mb-2`}>
                            {scanReport?.engines?.alienVault?.connected ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            <span className="text-sm font-bold uppercase">{scanReport?.engines?.alienVault?.connected ? 'OTX Online' : 'OTX Offline'}</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Alien Vault Node</div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className={`flex items-center gap-2 text-${scanReport?.engines?.alienVault?.malwareCount ? 'orange-500' : 'green-500'} font-mono mb-2`}>
                            <AlertTriangle className="w-4 h-4" /> 
                            <span className="text-xl font-bold">{scanReport?.engines?.alienVault?.malwareCount || 0}</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Malware Indicators</div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className={`flex items-center gap-2 text-${scanReport?.engines?.alienVault?.pulses ? 'red' : 'green-500'} font-mono mb-2`}>
                            <Globe className="w-4 h-4" /> 
                            <span className="text-xl font-bold">{scanReport?.engines?.alienVault?.pulses || 0}</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Threat Pulses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-consultation'))} className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-lg font-bold transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                    Request Comprehensive Report
                  </button>
                  <button onClick={handleExportPDF} className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-bold transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-2 focus:ring-offset-black">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>
                <div className="text-center mt-4">
                  <p className="text-xs text-neutral-500">
                    This is a passive reconnaissance scan. No aggressive probing was performed.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
