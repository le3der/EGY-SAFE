import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, User, Mail, Phone, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { trackEvent } from '../lib/analytics';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const toastId = toast.loading('Submitting consultation request...');
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Request received successfully!', { id: toastId });
      
      // Track analytics event
      trackEvent('consultation_requested', {
        feature: 'ConsultationModal',
        type: 'Service Inquiry'
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1500);
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
            className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden overflow-y-auto max-h-[90vh] no-scrollbar"
          >
            {/* Header */}
            <div className="relative p-6 sm:p-8 bg-gray-50 dark:bg-[#111] border-b border-black/5 dark:border-white/5">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-white">Enterprise Consultation</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Connect with our security architects to discuss your attack surface and threat landscape.
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Request Received</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-sm">
                    Thank you. A senior security analyst will contact you within 24 hours to schedule your consultation.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-8 px-6 py-2.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-black dark:text-white rounded-lg font-medium transition-colors"
                  >
                    Close Window
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-neutral-500" /> Full Name
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-500" /> Company Name
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-500" /> Work Email
                      </label>
                      <input 
                        type="email" 
                        required
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-500" /> Phone Number (Optional)
                      </label>
                      <input 
                        type="tel" 
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-neutral-500" /> Primary Security Concern
                    </label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500 resize-none"
                      placeholder="Please describe your current security challenges or what services you are interested in..."
                    ></textarea>
                  </div>

                  <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-cyan hover:bg-cyan/90 text-navy py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 glow-cyan flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          Request Consultation <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-neutral-500 mt-4">
                      By submitting this form, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
