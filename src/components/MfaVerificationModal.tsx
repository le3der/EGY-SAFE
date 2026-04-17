import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MfaVerificationModal() {
  const { mfaResolver, cancelMfaLogin, verifyMfa } = useAuth();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const isOpen = !!mfaResolver;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyMfa(code);
    } catch (error: any) {
      toast.error('Verification failed: ' + error.message);
    } finally {
      setIsVerifying(false);
      setCode('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 p-safe">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelMfaLogin}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 sm:p-8 bg-gray-50 dark:bg-[#111] border-b border-black/5 dark:border-white/5">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={cancelMfaLogin}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-black dark:text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Enter the 6-digit code from your authenticator app to continue.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4 text-cyan" /> Authenticator Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-mono text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500/50"
                    required
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isVerifying || code.length < 6}
                  className="w-full px-6 py-3 bg-cyan text-black hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Login'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
