import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

export const viewport: Viewport = {
  themeColor: '#0C1B33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Spud the Piper | Award-Winning Scottish Highland Bagpiper for Hire',
  description: 'Spud the Piper - Scotland\'s premier award-winning Highland Bagpiper for weddings, funerals, castle events, corporate banquets & tuition. Check live availability and book online.',
  keywords: ['Spud the Piper', 'Scottish Bagpiper', 'Wedding Piper Scotland', 'Edinburgh Castle Bagpiper', 'Funeral Bagpiper Scotland', 'Highland Bagpipe Music', 'Scottish Piper For Hire'],
  authors: [{ name: 'Spud the Piper' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Spud the Piper | Award-Winning Scottish Highland Bagpiper',
    description: 'Renowned worldwide for Scottish wedding ceremonies, castle galas, and memorial laments. Piper to the stars.',
    url: 'https://www.spudthepiper.co.uk',
    siteName: 'Spud the Piper',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                // If running on localhost or dev, unregister existing service workers to avoid stale cache chunk errors
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (let name of names) caches.delete(name);
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-tartan-gold selection:text-tartan-dark">
        <AppProvider>
          {children}
          <CookieConsentBanner />
        </AppProvider>
      </body>
    </html>
  );
}
