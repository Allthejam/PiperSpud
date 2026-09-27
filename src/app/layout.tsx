import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { generatePageMetadata, getLivePageSeo } from '@/lib/serverSeo';

export const viewport: Viewport = {
  themeColor: '#0C1B33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export async function generateMetadata(): Promise<Metadata> {
  return await generatePageMetadata('home');
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const liveSeo = await getLivePageSeo('home');
  const ogImageUrl = liveSeo.ogImage || 'https://www.spudthepiper.com/og-image.png';

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content={ogImageUrl} />
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
