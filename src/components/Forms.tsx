import React, { useState } from 'react';
import toast from 'react-hot-toast';

export function ContactForm() {
  const [contactEmail, setContactEmail] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');
  const [message, setMessage] = useState('');
  const MAX_LENGTH = 1000;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contactEmail)) {
      setContactEmailError('Please enter a valid email address.');
      return;
    }

    setContactEmailError('');

    const toastId = toast.loading('Sending your message...');
    setTimeout(() => {
      toast.success('Message sent! We will contact you soon.', { id: toastId });
      form.reset();
      setContactEmail('');
    }, 1000);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => {
            setContactEmail(e.target.value);
            if (contactEmailError) setContactEmailError('');
          }}
          onBlur={() => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (contactEmail && !emailRegex.test(contactEmail)) {
              setContactEmailError('Please enter a valid email address.');
            }
          }}
          pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
          placeholder="Your Email Address"
          className={`w-full bg-[#0A0A0A] border rounded-lg px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 transition-all cyber-glass-card hover:bg-white/5 ${
            contactEmailError
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-white/5 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50'
          }`}
          required
          aria-label="Your Email Address"
        />
        {contactEmailError && (
          <p className="text-red-500 text-xs mt-1.5 ml-1">{contactEmailError}</p>
        )}
      </div>
      <div className="relative">
        <textarea
          placeholder="How can we help you?"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_LENGTH}
          aria-label="How can we help you?"
          className="w-full bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all resize-none cyber-glass-card hover:bg-white/5"
          required
        ></textarea>
        <div className={`absolute bottom-2 right-3 text-[10px] ${message.length >= MAX_LENGTH ? 'text-red-500 font-bold' : 'text-neutral-500'}`}>
          {message.length} / {MAX_LENGTH}
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-6 py-2.5 bg-cyan text-black hover:bg-cyan/90 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 focus:ring-offset-black"
      >
        Send Message
      </button>
    </form>
  );
}

export function NewsletterForm() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Please enter a valid newsletter email.');
      return;
    }

    const toastId = toast.loading('Subscribing...');
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!', { id: toastId });
      setNewsletterEmail('');
    }, 1000);
  };

  return (
    <div className="pt-8 mt-8 border-t border-white/5">
      <h4 className="font-bold mb-3 text-white text-sm">Stay Updated</h4>
      <p className="text-neutral-500 text-xs mb-4">
        Get the latest threat intel and security best practices delivered to your inbox.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
            placeholder="Enter your email"
            className="flex-grow bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all cyber-glass-card hover:bg-white/5"
            required
            aria-label="Newsletter email address"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/5 border border-white/10 hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan text-white rounded-lg font-bold text-xs transition-all duration-300 active:scale-95 flex items-center justify-center shrink-0"
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}
