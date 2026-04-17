import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSending(true);
    try {
      await sendMagicLink(email);
      setIsSent(true);
      setTimeout(() => {
        onClose();
        setIsSent(false);
        setEmail('');
      }, 3000);
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose(); // Close modal immediately on success
    } catch (error) {
      // Error handled in context
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
            onClick={onClose}
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
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan mb-4">
                  <LogIn className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">Secure Access</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Choose an authentication method to continue to the platform.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSent ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="py-8 text-center"
                >
                  <Mail className="w-12 h-12 text-cyan mx-auto mb-4 opacity-80" />
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2">Check Your Email</h3>
                  <p className="text-sm text-neutral-500">We've sent a magic link to <span className="text-black dark:text-white font-medium">{email}</span>. Click it to log in instantly without a password.</p>
                </motion.div>
              ) : (
                <>
                  <form onSubmit={handleMagicLink} className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2 mb-2">
                        Passwordless Entry
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-neutral-500" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@egysafe.com"
                          className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500/50"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSending || !email}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan"
                    >
                      {isSending ? 'Sending Link...' : 'Send Magic Link'}
                      {!isSending && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>

                  <div className="relative mb-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-black/10 dark:border-white/10"></div>
                    </div>
                    <span className="relative bg-white dark:bg-[#0A0A0A] px-4 text-xs font-medium text-neutral-500 uppercase tracking-widest">
                      Or
                    </span>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
