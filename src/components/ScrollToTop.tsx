'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsVisible(window.scrollY > 320);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Return to top of page"
      title="Return to top"
      className="fixed bottom-6 right-4 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-tartan-card hover:bg-gold-gradient text-tartan-gold hover:text-tartan-dark border-2 border-tartan-gold/70 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group ring-4 ring-black/30 backdrop-blur-md animate-in fade-in zoom-in-90"
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
      <span className="sr-only">Scroll to Top</span>
    </button>
  );
};
