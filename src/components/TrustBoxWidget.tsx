'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, forceReload?: boolean) => void;
    };
  }
}

interface TrustBoxWidgetProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export const TrustBoxWidget: React.FC<TrustBoxWidgetProps> = ({ 
  className = '',
  theme = 'dark'
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Trustpilot script is already loaded on the page, initialize the widget element
    if (typeof window !== 'undefined' && window.Trustpilot && widgetRef.current) {
      try {
        window.Trustpilot.loadFromElement(widgetRef.current, true);
      } catch (err) {
        console.warn('Trustpilot widget load error:', err);
      }
    }
  }, []);

  return (
    <div className={`trustpilot-widget-container ${className}`}>
      <div
        ref={widgetRef}
        className="trustpilot-widget flex items-center justify-center min-h-[52px]"
        data-locale="en-GB"
        data-template-id="56278e9abfbbba0bdcd568bc"
        data-businessunit-id="6ac25de9595e4942d3e33d89"
        data-style-height="52px"
        data-style-width="100%"
        data-theme={theme}
        data-token="94444060-bdba-4e66-a169-5f2bf999744a"
      >
        <a
          href="https://www.trustpilot.com/review/spudthepiper.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-tartan-gold hover:text-white flex items-center gap-2 p-2 bg-tartan-card rounded-xl border border-tartan-border shadow-sm hover:border-tartan-gold transition-all"
        >
          <svg className="w-4 h-4 fill-[#00b67a]" viewBox="0 0 24 24">
            <path d="M12 0l3.708 7.514 8.292 1.206-6 5.849 1.416 8.257L12 18.927l-7.416 3.9 1.416-8.257-6-5.849 8.292-1.206z"/>
          </svg>
          <span>Read Verified Reviews on Trustpilot (5.0 ★)</span>
        </a>
      </div>
    </div>
  );
};
