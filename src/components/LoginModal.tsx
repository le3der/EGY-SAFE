import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, ArrowRight, Lock, UserPlus, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setMode('login');
      } else if (mode === 'login') {
        if (!password) { toast.error('Please enter a password'); return; }
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!password) { toast.error('Please enter a password'); return; }
        await signUpWithEmail(email, password);
        setMode('login');
      }
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsSubmitting(false);
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
                  {mode === 'login' ? <LogIn className="w-8 h-8" /> : mode === 'signup' ? <UserPlus className="w-8 h-8" /> : <Key className="w-8 h-8"/>}
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  {mode === 'login' ? 'Secure Access' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  {mode === 'login' ? 'Log in to your account to continue.' : mode === 'signup' ? 'Sign up to protect your enterprise.' : 'Enter your email to receive a reset link.'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2 mb-2">
                    Email Address
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

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        Password
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-xs text-cyan hover:underline transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-neutral-500" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg pl-10 pr-4 py-3 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500/50"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || !email || (mode !== 'forgot' && !password)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan"
                >
                  {isSubmitting ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>

                {mode === 'login' && (
                  <p className="text-center text-sm text-neutral-500 mt-4">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setMode('signup')} className="text-cyan hover:underline">Sign up</button>
                  </p>
                )}
                {mode === 'signup' && (
                  <p className="text-center text-sm text-neutral-500 mt-4">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-cyan hover:underline">Log in</button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <p className="text-center text-sm text-neutral-500 mt-4">
                    Remembered your password?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-cyan hover:underline">Log in</button>
                  </p>
                )}
              </form>

              {mode !== 'forgot' && (
                <>
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
