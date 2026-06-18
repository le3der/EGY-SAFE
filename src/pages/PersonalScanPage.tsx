import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, Mail, Phone,
  Lock, Eye, Database, CheckCircle, Fingerprint, ServerCrash
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithCsrf } from '../lib/csrf';
import { trackEvent } from '../lib/analytics';

type IdType = 'email' | 'phone';

interface Breach {
  name: string;
  year: number | null;
  types: string[];
}

interface ScanResult {
  success: boolean;
  source: 'hibp' | 'indicative';
  identifier: string;
  type: IdType;
  found: boolean;
  breachCount: number;
  breaches: Breach[];
  dataTypes: string[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,18}[0-9]$/;
const COOLDOWN_SECONDS = 20;

export default function PersonalScanPage() {
  const { lang, t } = useLanguage();

  const [idType, setIdType] = useState<IdType>('email');
  const [value, setValue] = useState('');
  const [consent, setConsent] = useState(false);
  const [inputError, setInputError] = useState('');
  const [consentError, setConsentError] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const validate = () => {
    let ok = true;
    const v = value.trim();
    if (!v) {
      setInputError(t('هذا الحقل مطلوب.', 'This field is required.'));
      ok = false;
    } else if (idType === 'email' && !EMAIL_RE.test(v)) {
      setInputError(t('الرجاء إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.'));
      ok = false;
    } else if (idType === 'phone' && !PHONE_RE.test(v)) {
      setInputError(t('الرجاء إدخال رقم هاتف صحيح.', 'Please enter a valid phone number.'));
      ok = false;
    } else {
      setInputError('');
    }

    if (!consent) {
      setConsentError(t('يجب الموافقة للمتابعة.', 'You must confirm consent to continue.'));
      ok = false;
    } else {
      setConsentError('');
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || cooldown > 0) return;
    if (!validate()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    trackEvent('personal_scan_submitted', { type: idType });

    try {
      const res = await fetchWithCsrf('/api/personal/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: value.trim(), type: idType, consent }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || t('تعذّر إكمال الفحص. حاول مرة أخرى.', 'We could not complete the scan. Please try again.'));
        setStatus('error');
        return;
      }

      setResult(data as ScanResult);
      setStatus('done');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setErrorMsg(t('تعذّر الاتصال بالخادم. تأكد من اتصالك وحاول مجدداً.', 'Could not reach the server. Check your connection and try again.'));
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const riskStyles: Record<string, { ring: string; text: string; bg: string; label: string }> = {
    HIGH: { ring: 'border-red/30', text: 'text-red', bg: 'bg-red/5', label: t('خطر مرتفع', 'High Risk') },
    MEDIUM: { ring: 'border-orange-500/30', text: 'text-orange-500', bg: 'bg-orange-500/5', label: t('خطر متوسط', 'Medium Risk') },
    LOW: { ring: 'border-green-500/30', text: 'text-green-500', bg: 'bg-green-500/5', label: t('خطر منخفض', 'Low Risk') },
  };

  return (
    <>
      <SEO
        title={t('فحص البيانات الشخصية', 'Personal Data Scan')}
        description={t(
          'تحقق مما إذا كان بريدك الإلكتروني أو رقم هاتفك قد ظهر في تسريبات بيانات معروفة.',
          'Check whether your email address or phone number has appeared in known data breaches.'
        )}
      />

      <main className="pt-32 pb-24 relative z-10 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,194,255,0.15)]">
              <Fingerprint className="w-3.5 h-3.5" />
              {t('للأفراد', 'For Individuals')}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white text-balance">
              {t('هل تم تسريب بياناتك الشخصية؟', 'Has your personal data been exposed?')}
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto text-pretty">
              {t(
                'افحص بريدك الإلكتروني أو رقم هاتفك مقابل تسريبات البيانات المعروفة. نتحقق فقط من البيانات التي تملكها.',
                'Scan your own email address or phone number against known data breaches. We only check data that belongs to you.'
              )}
            </p>
          </div>

          {/* Scan card */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

            <div aria-live="polite" className="sr-only">
              {status === 'loading'
                ? t('جاري الفحص', 'Scanning in progress')
                : status === 'done' && result
                ? t('اكتمل الفحص', `Scan complete. ${result.breachCount} exposures found.`)
                : ''}
            </div>

            <form onSubmit={handleSubmit} className="relative z-10">
              {/* Type toggle */}
              <div
                role="tablist"
                aria-label={t('نوع المعرّف', 'Identifier type')}
                className="inline-flex p-1 rounded-xl bg-black border border-white/10 mb-6"
              >
                {(['email', 'phone'] as IdType[]).map((typ) => (
                  <button
                    key={typ}
                    type="button"
                    role="tab"
                    aria-selected={idType === typ}
                    onClick={() => {
                      setIdType(typ);
                      setInputError('');
                      setValue('');
                    }}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-cyan ${
                      idType === typ ? 'bg-cyan text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {typ === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {typ === 'email' ? t('بريد إلكتروني', 'Email') : t('رقم هاتف', 'Phone')}
                  </button>
                ))}
              </div>

              <label htmlFor="scan-input" className="block text-sm font-medium text-neutral-300 mb-2">
                {idType === 'email'
                  ? t('بريدك الإلكتروني', 'Your email address')
                  : t('رقم هاتفك', 'Your phone number')}
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  {idType === 'email' ? (
                    <Mail className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  ) : (
                    <Phone className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  )}
                  <input
                    id="scan-input"
                    type={idType === 'email' ? 'email' : 'tel'}
                    inputMode={idType === 'email' ? 'email' : 'tel'}
                    autoComplete={idType === 'email' ? 'email' : 'tel'}
                    dir="ltr"
                    placeholder={idType === 'email' ? 'name@example.com' : '+20 10 1234 5678'}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (inputError) setInputError('');
                    }}
                    disabled={status === 'loading'}
                    aria-invalid={!!inputError}
                    aria-describedby={inputError ? 'scan-input-error' : undefined}
                    className={`w-full bg-black border rounded-xl py-4 ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4 text-white outline-none transition-colors placeholder:text-neutral-500 disabled:opacity-60 ${
                      inputError
                        ? 'border-red/50 focus:border-red focus:ring-1 focus:ring-red'
                        : 'border-white/10 focus:border-cyan focus:ring-1 focus:ring-cyan'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading' || cooldown > 0}
                  className="bg-cyan hover:bg-white text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap glow-cyan flex items-center justify-center gap-2 min-w-[160px]"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('جاري الفحص', 'Scanning')}
                    </>
                  ) : cooldown > 0 ? (
                    t(`انتظر ${cooldown}ث`, `Wait ${cooldown}s`)
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      {t('افحص الآن', 'Scan Now')}
                    </>
                  )}
                </button>
              </div>
              {inputError && (
                <p id="scan-input-error" className="text-red text-xs mt-2 font-medium">
                  {inputError}
                </p>
              )}

              {/* Consent */}
              <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (consentError) setConsentError('');
                  }}
                  className="mt-0.5 w-4 h-4 accent-cyan shrink-0"
                  aria-describedby={consentError ? 'consent-error' : undefined}
                />
                <span className="text-xs text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  {t(
                    'أؤكد أن هذه البيانات تخصّني أو أنني مخوّل بفحصها، وأوافق على سياسة الخصوصية.',
                    'I confirm this data belongs to me or that I am authorized to check it, and I agree to the Privacy Policy.'
                  )}
                </span>
              </label>
              {consentError && (
                <p id="consent-error" className="text-red text-xs mt-2 font-medium ltr:ml-7 rtl:mr-7">
                  {consentError}
                </p>
              )}
            </form>

            {/* States */}
            <div className="mt-8">
              <AnimatePresence mode="wait">
                {status === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-black border border-white/5 rounded-xl p-8 flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-cyan/20 border-t-cyan animate-spin mb-4" />
                    <p className="text-white font-medium">
                      {t('نقارن معرّفك بقواعد بيانات التسريبات...', 'Comparing your identifier against breach databases...')}
                    </p>
                    <p className="text-neutral-500 text-sm mt-1">
                      {t('قد يستغرق هذا بضع ثوانٍ.', 'This may take a few seconds.')}
                    </p>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="bg-red/5 border border-red/20 rounded-xl p-6 flex items-start gap-4"
                  >
                    <ServerCrash className="w-7 h-7 text-red shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{t('حدث خطأ', 'Something went wrong')}</h3>
                      <p className="text-neutral-400 text-sm mb-4">{errorMsg}</p>
                      <button
                        onClick={reset}
                        className="text-sm font-semibold text-cyan hover:text-white transition-colors focus:outline-none"
                      >
                        {t('حاول مرة أخرى', 'Try again')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {status === 'done' && result && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Risk banner */}
                    <div className={`rounded-xl p-6 border ${riskStyles[result.riskLevel].ring} ${riskStyles[result.riskLevel].bg}`}>
                      <div className="flex items-start gap-4">
                        {result.found ? (
                          <ShieldAlert className={`w-8 h-8 shrink-0 mt-1 ${riskStyles[result.riskLevel].text}`} />
                        ) : (
                          <ShieldCheck className="w-8 h-8 text-green-500 shrink-0 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {t('نتيجة الفحص', 'Scan Result')}
                            </h3>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${riskStyles[result.riskLevel].ring} ${riskStyles[result.riskLevel].text}`}>
                              {riskStyles[result.riskLevel].label}
                            </span>
                          </div>
                          <p className="text-neutral-300 text-sm mb-1">
                            <span className="font-mono text-white" dir="ltr">{result.identifier}</span>
                          </p>
                          <p className="text-neutral-400 text-sm">{result.summary}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className={`text-2xl font-bold ${riskStyles[result.riskLevel].text}`}>{result.breachCount}</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
                            {t('تسريبات', 'Breaches')}
                          </div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4">
                          <div className="text-2xl font-bold text-white">{result.dataTypes.length}</div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
                            {t('أنواع بيانات', 'Data Types')}
                          </div>
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-lg p-4 col-span-2 sm:col-span-1">
                          <div className="text-2xl font-bold text-white uppercase">
                            {result.source === 'hibp' ? t('مؤكد', 'Verified') : t('مؤشّر', 'Indicative')}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
                            {t('مصدر البيانات', 'Data Source')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Breach details OR empty state */}
                    {result.found ? (
                      <div className="mt-6 space-y-3">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          {t('التسريبات المكتشفة', 'Detected Breaches')}
                        </h4>
                        {result.breaches.map((b, i) => (
                          <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                            <Database className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white">{b.name}</span>
                                {b.year && <span className="text-xs text-neutral-500">{b.year}</span>}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {b.types.map((typ, j) => (
                                  <span key={j} className="text-[10px] bg-white/5 border border-white/10 text-neutral-300 px-2 py-0.5 rounded-full">
                                    {typ}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 bg-black/40 border border-white/5 rounded-xl p-8 flex flex-col items-center text-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                        <h4 className="text-white font-bold mb-1">{t('لا توجد تسريبات مطابقة', 'No matching breaches found')}</h4>
                        <p className="text-neutral-500 text-sm max-w-sm">
                          {t(
                            'لم نعثر على هذا المعرّف في المصادر التي فحصناها. تابع المراقبة المستمرة للبقاء محمياً.',
                            'We did not find this identifier in the sources we checked. Stay protected with continuous monitoring.'
                          )}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-consultation'))}
                        className="bg-white hover:bg-neutral-200 text-black px-6 py-3 rounded-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                      >
                        {t('احصل على تقرير معمّق', 'Get a Deep Report')}
                      </button>
                      <button
                        onClick={reset}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-bold transition-colors focus:outline-none"
                      >
                        {t('فحص جديد', 'New Scan')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Trust / privacy assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              {
                icon: <Lock className="w-5 h-5 text-cyan" />,
                title: t('لا نخزّن استعلامك', 'We never store your query'),
                body: t('يتم فحص معرّفك في الذاكرة فقط ولا يُحفظ على خوادمنا.', 'Your identifier is checked in memory and is never saved to our servers.'),
              },
              {
                icon: <Eye className="w-5 h-5 text-cyan" />,
                title: t('نتائج محجوبة جزئياً', 'Results are masked'),
                body: t('نعرض معرّفك مخفياً جزئياً لحماية خصوصيتك في النتائج.', 'We display your identifier partially masked to protect your privacy.'),
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-cyan" />,
                title: t('استخدام مسؤول', 'Responsible use'),
                body: t('الفحوصات محدودة المعدّل وتتطلب موافقتك على ملكية البيانات.', 'Scans are rate-limited and require you to confirm data ownership.'),
              },
            ].map((card, i) => (
              <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-3">
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{card.title}</h3>
                <p className="text-neutral-500 text-xs leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          {/* Misuse notice */}
          <div className="mt-8 flex items-start gap-3 text-xs text-neutral-600 max-w-2xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-neutral-600" />
            <p className="leading-relaxed">
              {t(
                'هذه الأداة مخصّصة لفحص بياناتك الشخصية فقط. يُحظر استخدامها لفحص بيانات أشخاص آخرين دون إذن، وقد تُسجَّل عمليات الاستخدام المسيء.',
                'This tool is intended for scanning your own personal data only. Using it to check other people\u2019s data without authorization is prohibited and abusive usage may be logged.'
              )}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
