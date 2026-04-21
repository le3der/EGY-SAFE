import { useEffect, useRef, useCallback } from 'react';

export function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, input[type="password"], input[type="email"], input[type="tel"]'
        ) as NodeListOf<HTMLElement>;
        
        const focusable = Array.from(focusableElements).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
        
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus
    setTimeout(() => {
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="password"], input[type="email"], input[type="tel"]'
        ) as NodeListOf<HTMLElement>;
        if (focusableElements.length > 0 && focusableElements[0] !== document.activeElement) {
            const firstInput = Array.from(focusableElements).find(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
            if (firstInput) firstInput.focus();
            else focusableElements[0].focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return modalRef;
}
