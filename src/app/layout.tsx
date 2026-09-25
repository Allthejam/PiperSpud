import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';

export const viewport: Viewport = {
  themeColor: '#0C1B33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export const metadata: Metadata = {
  title: 'Spud the Piper | Award-Winning Scottish Highland Bagpiper for Hire',
  description: 'Spud the Piper - Scotland\'s premier award-winning Highland Bagpiper for weddings, funerals, castle events, corporate banquets & tuition. Check live availability and book online.',
  keywords: ['Spud the Piper', 'Scottish Bagpiper', 'Wedding Piper Scotland', 'Edinburgh Castle Bagpiper', 'Funeral Bagpiper Scotland', 'Highland Bagpipe Music', 'Scottish Piper For Hire', 'PWA App'],
  authors: [{ name: 'Spud the Piper' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spud the Piper'
  },
  applicationName: 'Spud the Piper',
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'Spud the Piper | Award-Winning Scottish Highland Bagpiper for Hire',
    description: 'Scotland\'s premier award-winning Highland Bagpiper for weddings, castle galas, elopements, and private experiences. Piper to the stars.',
    url: 'https://www.spudthepiper.co.uk',
    siteName: 'Spud the Piper',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://www.spudthepiper.co.uk/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Spud the Piper - Award-Winning Scottish Highland Bagpiper for Hire'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spud the Piper | Scottish Highland Bagpiper for Hire',
    description: 'Scotland\'s premier award-winning Highland Bagpiper for weddings, castle galas, elopements, and private experiences.',
    images: ['https://www.spudthepiper.co.uk/og-image.png']
  }
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
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta property="og:image" content="https://www.spudthepiper.co.uk/og-image.png" />
        <meta property="og:image:secure_url" content="https://www.spudthepiper.co.uk/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta name="twitter:image" content="https://www.spudthepiper.co.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Spud the Piper" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Spud the Piper PWA Service Worker Registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('PWA Service Worker registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-tartan-gold selection:text-tartan-dark">
        <AppProvider>
          {children}
          <PwaInstallBanner />
          <CookieConsentBanner />
        </AppProvider>
      </body>
    </html>
  );
}
