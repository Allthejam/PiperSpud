import { Metadata } from 'next';
import { initialSeoConfig, initialSeoPages, initialTunes } from '@/lib/initialData';
import { SeoPageConfig } from '@/types/spud';

const DEFAULT_OG_IMAGE = 'https://www.spudthepiper.com/og-image.jpg';
const PROJECT_ID = 'piperspud-56c0a';

/**
 * Fetch dynamic SEO configuration from Firestore REST API
 * @param pageId The page identifier (e.g., 'home', 'tunes', 'services')
 */
export async function getLivePageSeo(pageId: string = 'home'): Promise<SeoPageConfig> {
  const fallback = initialSeoPages.find(p => p.pageId === pageId) || initialSeoConfig;

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/seo_pages/${pageId}`;
    const res = await fetch(url, {
      next: { revalidate: 60 } // Revalidate cache every 60s
    });

    if (!res.ok) {
      return fallback;
    }

    const data = await res.json();
    if (!data || !data.fields) {
      return fallback;
    }

    const fields = data.fields;
    return {
      pageId: fields.pageId?.stringValue || fallback.pageId,
      pageName: fields.pageName?.stringValue || fallback.pageName,
      path: fields.path?.stringValue || fallback.path,
      title: fields.title?.stringValue || fallback.title,
      metaDescription: fields.metaDescription?.stringValue || fallback.metaDescription,
      keywords: fields.keywords?.arrayValue?.values?.map((v: any) => v.stringValue) || fallback.keywords,
      h1: fields.h1?.stringValue || fallback.h1,
      canonicalUrl: fields.canonicalUrl?.stringValue || fallback.canonicalUrl,
      ogImage: fields.ogImage?.stringValue || fallback.ogImage || DEFAULT_OG_IMAGE,
      schemaType: (fields.schemaType?.stringValue as any) || fallback.schemaType
    };
  } catch (err) {
    console.warn(`[SEO Server] Failed to fetch live SEO for ${pageId}, using fallback:`, err);
    return fallback;
  }
}

/**
 * Generate Next.js dynamic metadata for any page
 */
export async function generatePageMetadata(pageId: string = 'home'): Promise<Metadata> {
  const seo = await getLivePageSeo(pageId);
  const ogImg = seo.ogImage && seo.ogImage.trim().length > 0 ? seo.ogImage : DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL('https://www.spudthepiper.com'),
    title: seo.title,
    description: seo.metaDescription,
    keywords: seo.keywords,
    authors: [{ name: 'Spud the Piper' }],
    manifest: '/manifest.json',
    alternates: {
      canonical: seo.canonicalUrl || `https://www.spudthepiper.com${seo.path}`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
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
      title: seo.title,
      description: seo.metaDescription,
      url: seo.canonicalUrl || `https://www.spudthepiper.com${seo.path}`,
      siteName: 'Spud the Piper',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${seo.title} - Spud the Piper`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.metaDescription,
      images: [ogImg]
    },
    other: {
      'p:domain_verify': '93359088c9fe7ab17a86170057d2eb7a'
    }
  };
}

/**
 * Generate Next.js dynamic OpenGraph metadata for individual tune sharing
 * @param tuneQuery The tune title, slug, or ID from URL searchParams
 */
export async function generateTuneMetadata(tuneQuery?: string): Promise<Metadata> {
  if (!tuneQuery) {
    return await generatePageMetadata('tunes');
  }

  const cleanQuery = decodeURIComponent(tuneQuery).toLowerCase().trim();
  const matchedTune = initialTunes.find(t => 
    t.title.toLowerCase() === cleanQuery || 
    t.id === cleanQuery || 
    t.title.toLowerCase().includes(cleanQuery)
  );

  if (!matchedTune) {
    return await generatePageMetadata('tunes');
  }

  const title = `🎵 ${matchedTune.title} - Scottish Bagpipes by Spud the Piper`;
  const description = `Listen to "${matchedTune.title}" performed by Spud the Piper: ${matchedTune.description || 'Authentic traditional Scottish Highland bagpipe music for weddings, events, and celebrations.'}`;
  const canonicalUrl = `https://www.spudthepiper.com/tunes?tune=${encodeURIComponent(matchedTune.title)}#tune-${matchedTune.id}`;
  const ogImg = DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL('https://www.spudthepiper.com'),
    title,
    description,
    keywords: [
      matchedTune.title,
      'Scottish Bagpipes',
      'Bagpipe Music',
      'Spud the Piper',
      matchedTune.category,
      matchedTune.weddingMoment || 'Wedding Bagpiper',
      'Scotland',
      'Highland Bagpiper'
    ],
    authors: [{ name: 'Spud the Piper' }],
    manifest: '/manifest.json',
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: `${matchedTune.title} - Spud the Piper`
    },
    applicationName: 'Spud the Piper',
    icons: {
      icon: '/icon-192.png',
      apple: '/apple-touch-icon.png'
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Spud the Piper - Official Scottish Bagpipes',
      locale: 'en_GB',
      type: 'website',
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${matchedTune.title} - Scottish Bagpipes by Spud the Piper`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImg]
    }
  };
}
