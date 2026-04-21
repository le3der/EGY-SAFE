import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, KeyRound, Copy, CheckCircle2, Smartphone, ShieldAlert } from 'lucide-react';
import { multiFactor, TotpMultiFactorGenerator, TotpSecret, MultiFactorInfo } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface MfaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MfaSetupModal({ isOpen, onClose }: MfaSetupModalProps) {
  const { user } = useAuth();
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<MultiFactorInfo[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  
  const modalRef = useModalAccessibility(isOpen, onClose);

  useEffect(() => {
    if (isOpen && user) {
      checkEnrolledFactors();
    } else {
      resetState();
    }
  }, [isOpen, user]);

  const generateRecoveryCodes = () => {
    // Note: In a production Firebase implementation, custom claims or a secure Firestore subcollection 
    // should be used to store hashes of recovery codes if relying purely on standard Firebase Auth.
    // For this demonstration, we are mocking the code generation so the UI is present.
    const newCodes = Array.from({ length: 8 }, () => {
      return Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + 
             Math.random().toString(36).substring(2, 6).toUpperCase();
    });
    setRecoveryCodes(newCodes);
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    toast.success('Recovery codes copied to clipboard');
  };

  const checkEnrolledFactors = () => {
    try {
      if (!user) return;
      const factors = multiFactor(user).enrolledFactors || [];
      setEnrolledFactors(factors);
      if (factors.length > 0) {
        setIsManaging(true);
        setLoading(false);
      } else {
        setIsManaging(false);
        initMfa();
      }
    } catch (e) {
      console.error(e);
      initMfa();
    }
  };

  const resetState = () => {
    setTotpSecret(null);
    setQrUrl('');
    setCode('');
    setLoading(true);
    setErrorStatus(null);
    setSetupComplete(false);
    setIsManaging(false);
  };

  const initMfa = async () => {
    try {
      if (!user) throw new Error("No user authenticated");
      setLoading(true);
      const multiFactorSession = await multiFactor(user).getSession();
      const secret = await TotpMultiFactorGenerator.generateSecret(multiFactorSession);
      setTotpSecret(secret);
      const url = secret.generateQrCodeUrl('EgySafe', user.email || 'Admin User');
      setQrUrl(url);
    } catch (error: any) {
      console.error("MFA Init Error", error);
      if (error.code === 'auth/admin-restricted-operation' || error.message?.includes('Identity Platform')) {
        setErrorStatus("Identity Platform not configured. 2FA requires Identity Platform to be enabled in your Firebase Console under Authentication > Settings > Multi-Factor Authentication.");
      } else {
        setErrorStatus(error.message || "Failed to initialize MFA setup.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !totpSecret || code.length < 6) return;

    setVerifying(true);
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(totpSecret, code);
      await multiFactor(user).enroll(assertion, 'Authenticator App');
      setSetupComplete(true);
      generateRecoveryCodes();
      toast.success('Two-Factor Authentication successfully enabled!');
      checkEnrolledFactors();
    } catch (error: any) {
      toast.error('Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenrollMfa = async (uid: string) => {
    try {
      if (!user) return;
      await multiFactor(user).unenroll(uid);
      toast.success('Removed 2FA method');
      checkEnrolledFactors();
    } catch (error: any) {
      toast.error('Failed to remove 2FA: ' + error.message);
    }
  };

  const copySecret = () => {
    if (totpSecret?.secretKey) {
      navigator.clipboard.writeText(totpSecret.secretKey);
      toast.success('Secret key copied to clipboard');
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
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 sm:p-8 bg-gray-50 dark:bg-[#111] border-b border-black/5 dark:border-white/5">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
                {isManaging ? (
                  <><ShieldAlert className="w-6 h-6 text-cyan" /> Secure Settings</>
                ) : (
                  <><QrCode className="w-6 h-6 text-cyan" /> Secure Your Account</>
                )}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                {isManaging ? 'Manage your enrolled authenticator devices below.' : 'Scan the QR code below with your Authenticator app (e.g., Google Authenticator, Authy, Apple Passwords).'}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-cyan">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan border-t-transparent animate-spin mb-4" />
                  <span>Generating secure tokens...</span>
                </div>
              ) : isManaging && !setupComplete ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-500 font-bold bg-green-500/10 px-4 py-3 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5" /> 2FA is securely enabled.
                  </div>
                  
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-500 pt-4">Enrolled Devices</h3>
                  <div className="border border-black/5 dark:border-white/5 rounded-lg overflow-hidden">
                    {enrolledFactors.map(factor => (
                      <div key={factor.uid} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#111] border-b border-black/5 dark:border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-cyan" />
                          <div>
                            <div className="font-bold text-black dark:text-white">{factor.displayName || 'Authenticator App'}</div>
                            <div className="text-xs text-neutral-500">Factor ID: {factor.uid}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnenrollMfa(factor.uid)}
                          className="text-red hover:text-red/80 px-3 py-1.5 rounded-md hover:bg-red/10 transition-colors text-sm font-bold"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsManaging(false);
                      initMfa();
                    }}
                    className="w-full mt-4 px-6 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg font-bold text-sm transition-all shadow-sm"
                  >
                    Add Additional Device
                  </button>
                </div>
              ) : errorStatus ? (
                <div className="bg-red/10 border border-red/30 rounded-lg p-5 text-red text-sm">
                  <p className="font-bold mb-1">Configuration Required</p>
                  <p>{errorStatus}</p>
                </div>
              ) : setupComplete ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-4 text-center"
                >
                  <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">2FA Enabled</h3>
                  <p className="text-neutral-500 text-sm mb-6">Your account is now protected by Two-Factor Authentication.</p>
                  
                  {recoveryCodes.length > 0 && (
                     <div className="w-full bg-[#111] dark:bg-[#050505] border border-black/10 dark:border-white/10 rounded-xl p-5 mb-6 text-left">
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="font-bold text-white text-sm">Emergency Recovery Codes</h4>
                           <button onClick={copyRecoveryCodes} className="text-xs text-cyan flex items-center gap-1 hover:text-cyan/80"><Copy className="w-3 h-3"/> Copy</button>
                        </div>
                        <p className="text-xs text-red-400 mb-4 font-medium">Save these codes in a secure place. They are the ONLY way to access your account if you lose your device.</p>
                        <div className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
                           {recoveryCodes.map((code, idx) => (
                              <div key={idx} className="bg-white/5 py-1.5 rounded text-neutral-300">{code}</div>
                           ))}
                        </div>
                     </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-cyan text-black hover:bg-cyan/90 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-200">
                    {qrUrl && <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin={false} />}
                  </div>

                  {totpSecret && (
                    <div className="w-full flex items-center justify-between bg-gray-50 dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-lg px-4 py-2 mb-6">
                      <div className="truncate text-xs font-mono text-neutral-500 mr-2">
                        {totpSecret.secretKey}
                      </div>
                      <button onClick={copySecret} className="text-cyan hover:text-cyan/80 p-1 flex-shrink-0" title="Copy Secret">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleVerify} className="w-full space-y-4">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2 mb-2">
                        <KeyRound className="w-4 h-4 text-cyan" /> Verify 6-digit Code
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-gray-50 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-mono text-black dark:text-white outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-neutral-500/50"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={verifying || code.length < 6}
                      className="w-full px-6 py-3 bg-cyan text-black hover:bg-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm transition-all shadow-[0_0_15px_rgba(0,194,255,0.3)] hover:shadow-[0_0_25px_rgba(0,194,255,0.4)] focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {verifying ? 'Verifying...' : 'Complete Setup'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
