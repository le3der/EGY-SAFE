import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ShieldAlert, CheckCircle, AlertTriangle, Key, Globe, FileWarning } from 'lucide-react';

export default function FreeScanSection() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const steps = [
    "Initializing connection...",
    "Scanning surface web footprints...",
    "Querying breach databases (HaveIBeenPwned, etc)...",
    "Crawling dark web marketplaces...",
    "Analyzing credential dumps...",
    "Compiling threat report..."
  ];

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;
    
    setIsScanning(true);
    setScanComplete(false);
    setScanStep(0);

    // Simulate scanning process
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setScanComplete(true);
        }, 500);
      } else {
        setScanStep(currentStep);
      }
    }, 1200);
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
                disabled={isScanning || !target.trim()}
                className="bg-cyan hover:bg-white text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap glow-cyan flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    Run Scan
                  </>
                )}
              </button>
            </div>
          </form>

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
              >
                <div className="bg-red/5 border border-red/20 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <ShieldAlert className="w-8 h-8 text-red flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Exposure Detected for {target}</h3>
                      <p className="text-neutral-400 text-sm mb-4">
                        We found records matching your domain in recent dark web databases. This is a partial preview. A full authenticated scan is required for complete details.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red font-mono mb-2">
                            <Key className="w-4 h-4" /> 
                            <span className="text-xl font-bold">14</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Leaked Credentials</div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-orange-500 font-mono mb-2">
                            <FileWarning className="w-4 h-4" /> 
                            <span className="text-xl font-bold">2</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Data Breaches</div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-500 font-mono mb-2">
                            <AlertTriangle className="w-4 h-4" /> 
                            <span className="text-xl font-bold">1</span>
                          </div>
                          <div className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Open Vulnerability</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button onClick={() => window.dispatchEvent(new CustomEvent('open-consultation'))} className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-lg font-bold transition-colors inline-block focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
                    Request Comprehensive Report
                  </button>
                  <p className="text-xs text-neutral-500 mt-4">
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
