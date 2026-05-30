import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWithCsrf } from '../lib/csrf';

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function ContactForm() {
  const { t } = useLanguage();
  const MAX_LENGTH = 1000;
  const NAME_MAX = 80;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) {
      next.name = t('الرجاء إدخال اسمك.', 'Please enter your name.');
    }
    if (!EMAIL_RE.test(email.trim())) {
      next.email = t('الرجاء إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.');
    }
    if (message.trim().length < 10) {
      next.message = t('الرجاء كتابة رسالة من 10 أحرف على الأقل.', 'Please write a message of at least 10 characters.');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    const toastId = toast.loading(t('جاري الإرسال...', 'Sending your message...'));
    try {
      const res = await fetchWithCsrf('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
        }),
      });
      if (res.ok) {
        toast.success(t('تم الإرسال! سنتواصل معك قريباً.', 'Message sent! We will contact you soon.'), { id: toastId });
        setSubmitted(true);
        setName('');
        setEmail('');
        setCompany('');
        setMessage('');
        setErrors({});
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      toast.error(t('حدث خطأ أثناء الإرسال. الرجاء المحاولة لاحقاً', 'Error sending. Please try again later.'), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="cyber-glass-card rounded-lg p-6 text-center flex flex-col items-center" role="status" aria-live="polite">
        <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
        <h4 className="text-white font-bold mb-1">{t('تم استلام رسالتك', 'Message received')}</h4>
        <p className="text-neutral-400 text-sm mb-4">
          {t('شكراً لتواصلك. سيرد عليك فريقنا في أقرب وقت.', 'Thanks for reaching out. Our team will get back to you shortly.')}
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-semibold text-cyan hover:text-white transition-colors focus:outline-none"
        >
          {t('إرسال رسالة أخرى', 'Send another message')}
        </button>
      </div>
    );
  }

  const fieldBase =
    'w-full bg-[#0A0A0A] border rounded-lg px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 transition-all cyber-glass-card hover:bg-white/5 disabled:opacity-60';
  const ok = 'border-white/5 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50';
  const bad = 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500';

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div>
        <input
          type="text"
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          placeholder={t('اسمك', 'Your Name')}
          className={`${fieldBase} ${errors.name ? bad : ok}`}
          aria-invalid={!!errors.name}
          aria-label={t('اسمك', 'Your Name')}
          disabled={submitting}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.name}</p>}
      </div>

      <div>
        <input
          type="email"
          value={email}
          inputMode="email"
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          onBlur={() => {
            if (email && !EMAIL_RE.test(email.trim())) {
              setErrors((p) => ({ ...p, email: t('الرجاء إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.') }));
            }
          }}
          placeholder={t('بريدك الإلكتروني', 'Your Email Address')}
          className={`${fieldBase} ${errors.email ? bad : ok}`}
          aria-invalid={!!errors.email}
          aria-label={t('بريدك الإلكتروني', 'Your Email Address')}
          disabled={submitting}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.email}</p>}
      </div>

      <div>
        <input
          type="text"
          value={company}
          maxLength={NAME_MAX}
          onChange={(e) => setCompany(e.target.value)}
          placeholder={t('اسم الشركة (اختياري)', 'Company (optional)')}
          className={`${fieldBase} ${ok}`}
          aria-label={t('اسم الشركة (اختياري)', 'Company (optional)')}
          disabled={submitting}
        />
      </div>

      <div className="relative">
        <textarea
          placeholder={t('كيف يمكننا المساعدة؟', 'How can we help you?')}
          rows={3}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
          }}
          maxLength={MAX_LENGTH}
          aria-invalid={!!errors.message}
          aria-label={t('كيف يمكننا المساعدة؟', 'How can we help you?')}
          className={`${fieldBase} resize-none ${errors.message ? bad : ok}`}
          disabled={submitting}
        />
        <div
          className={`absolute bottom-2 ltr:right-3 rtl:left-3 rtl:right-auto text-[10px] ${
            message.length >= MAX_LENGTH ? 'text-red-500 font-bold' : 'text-neutral-500'
          }`}
        >
          {message.length} / {MAX_LENGTH}
        </div>
      </div>
      {errors.message && <p className="text-red-500 text-xs -mt-1 ml-1 font-medium">{errors.message}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-2.5 bg-cyan text-black hover:bg-cyan/90 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('جاري الإرسال...', 'Sending...')}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('إرسال الرسالة', 'Send Message')}
          </>
        )}
      </button>
    </form>
  );
}

export function NewsletterForm() {
  const { t } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!EMAIL_RE.test(newsletterEmail.trim())) {
      setError(t('الرجاء إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.'));
      return;
    }
    setError('');
    setSubmitting(true);

    const toastId = toast.loading(t('جاري الاشتراك...', 'Subscribing...'));
    try {
      const res = await fetchWithCsrf('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      if (res.ok) {
        toast.success(t('تم الاشتراك في النشرة الإخبارية!', 'Successfully subscribed to newsletter!'), { id: toastId });
        setNewsletterEmail('');
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      toast.error(t('حدث خطأ أثناء الاشتراك.', 'Error subscribing.'), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-8 mt-8 border-t border-white/5">
      <h4 className="font-bold mb-3 text-white text-sm">{t('ابقى على إطلاع', 'Stay Updated')}</h4>
      <p className="text-neutral-500 text-xs mb-4">
        {t('احصل على أحدث تقارير التهديدات وأفضل الممارسات الأمنية في بريدك.', 'Get the latest threat intel and security best practices delivered to your inbox.')}
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2" noValidate>
        <div className="flex gap-2">
          <input
            type="email"
            value={newsletterEmail}
            inputMode="email"
            autoComplete="email"
            onChange={(e) => {
              setNewsletterEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
            className={`flex-grow bg-[#0A0A0A] border rounded-lg px-4 py-2 text-xs text-white outline-none placeholder:text-neutral-500 transition-all cyber-glass-card hover:bg-white/5 disabled:opacity-60 ${
              error ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/5 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50'
            }`}
            aria-invalid={!!error}
            aria-label={t('أدخل بريدك الإلكتروني', 'Enter your email')}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan text-white rounded-lg font-bold text-xs transition-all duration-300 active:scale-95 flex items-center justify-center shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('اشتراك', 'Subscribe')}
          </button>
        </div>
        {error && <p className="text-red-500 text-xs ml-1 font-medium">{error}</p>}
      </form>
    </div>
  );
}
