const PROJECT_ID = 'piperspud-56c0a';
const SITE_URL = 'https://www.spudthepiper.com';

export interface RssFeedItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string;
  category?: string;
  author?: string;
}

const DEFAULT_ITEMS: RssFeedItem[] = [
  {
    id: 'spud-showcase-1',
    title: 'Scottish Castle Weddings & Ceremony Pipe-In',
    link: `${SITE_URL}/services/castle-weddings`,
    description: 'Highland Cathedral entrance, bridal party pipe-in, and grand castle banquet ceremonies across Scotland with World-Class Highland Bagpiper Spud the Piper.',
    pubDate: new Date('2026-09-28T12:00:00Z').toUTCString(),
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
    category: 'Scottish Weddings',
    author: 'Spud the Piper'
  },
  {
    id: 'spud-showcase-2',
    title: 'Full No. 1 Highland Dress with Feather Bonnet & Plaid',
    link: `${SITE_URL}/attire`,
    description: 'Explore authentic Scottish Highland regalia, Royal Stewart & Modern Tartans, feather bonnet, and ceremonial piper dress for luxury events.',
    pubDate: new Date('2026-09-26T14:30:00Z').toUTCString(),
    imageUrl: 'https://images.unsplash.com/photo-1546707012-c518410e5e7e?w=1200&auto=format&fit=crop&q=85',
    category: 'Highland Attire',
    author: 'Spud the Piper'
  },
  {
    id: 'spud-showcase-3',
    title: 'Spud the Piper - Highland Cathedral & Scotland the Brave Jukebox',
    link: `${SITE_URL}/tunes`,
    description: 'Listen to Spud the Piper perform Scotland\'s most beloved traditional tunes including Highland Cathedral, Scotland the Brave, and Flower of Scotland.',
    pubDate: new Date('2026-09-24T10:00:00Z').toUTCString(),
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=85',
    category: 'Bagpipe Tunes',
    author: 'Spud the Piper'
  }
];

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateRssFeedXml(): Promise<string> {
  const items: RssFeedItem[] = [];

  // 1. Fetch live social posts from Firestore REST API
  try {
    const socialUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/social_posts`;
    const res = await fetch(socialUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          const f = doc.fields || {};
          const id = doc.name.split('/').pop() || 'post';
          const content = f.content?.stringValue || '';
          const title = f.title?.stringValue || (content.length > 60 ? `${content.slice(0, 57)}...` : content) || 'Spud the Piper Live Update';
          const imageUrl = f.imageUrl?.stringValue || f.mediaUrl?.stringValue || '';
          const location = f.eventLocation?.stringValue || '';
          const tune = f.tunePlayed?.stringValue || '';
          const timestamp = f.timestamp?.stringValue || new Date().toISOString();
          
          let fullDesc = content;
          if (location) fullDesc += ` (📍 Venue: ${location})`;
          if (tune) fullDesc += ` (🎶 Tune: ${tune})`;

          let parsedDate = new Date();
          try {
            const d = new Date(timestamp);
            if (!isNaN(d.getTime())) parsedDate = d;
          } catch {}

          items.push({
            id: `social-${id}`,
            title,
            link: `${SITE_URL}/social#${id}`,
            description: fullDesc,
            pubDate: parsedDate.toUTCString(),
            imageUrl: imageUrl || undefined,
            category: 'Highland Social Wall',
            author: f.authorName?.stringValue || 'Spud the Piper'
          });
        }
      }
    }
  } catch (err) {
    console.warn('[RSS] Failed fetching social_posts from Firestore:', err);
  }

  // 2. Fetch live gallery items from Firestore REST API
  try {
    const galleryUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/gallery`;
    const res = await fetch(galleryUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data.documents && Array.isArray(data.documents)) {
        for (const doc of data.documents) {
          const f = doc.fields || {};
          const id = doc.name.split('/').pop() || 'gallery';
          const title = f.title?.stringValue || f.caption?.stringValue || 'Highland Piping Performance';
          const imageUrl = f.imageUrl?.stringValue || f.url?.stringValue || '';
          const location = f.location?.stringValue || 'Scotland';
          const category = f.category?.stringValue || 'Gallery';

          items.push({
            id: `gallery-${id}`,
            title: `${title} - ${location}`,
            link: `${SITE_URL}/gallery`,
            description: `Live photograph from Spud the Piper's Scottish Highland performance at ${location}. Category: ${category}.`,
            pubDate: new Date().toUTCString(),
            imageUrl: imageUrl || undefined,
            category: `Gallery: ${category}`,
            author: 'Spud the Piper'
          });
        }
      }
    }
  } catch (err) {
    console.warn('[RSS] Failed fetching gallery from Firestore:', err);
  }

  // Combine with fallback showcase items
  const allItems = items.length > 0 ? [...items, ...DEFAULT_ITEMS] : DEFAULT_ITEMS;

  // Build RSS 2.0 XML
  const itemsXml = allItems.map(item => {
    const itemTitle = escapeXml(item.title);
    const itemLink = escapeXml(item.link);
    const itemCategory = escapeXml(item.category || 'General');
    const itemAuthor = escapeXml(item.author || 'Spud the Piper');
    const imageTag = item.imageUrl ? `
      <enclosure url="${escapeXml(item.imageUrl)}" type="image/jpeg" length="0" />
      <media:content url="${escapeXml(item.imageUrl)}" medium="image" type="image/jpeg" />
      <media:title>${itemTitle}</media:title>
      <media:description><![CDATA[${item.description}]]></media:description>
    ` : '';

    return `
    <item>
      <title>${itemTitle}</title>
      <link>${itemLink}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <category>${itemCategory}</category>
      <author>${itemAuthor}</author>
      <description><![CDATA[${item.description}]]></description>
      ${imageTag}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Spud the Piper | Scottish Highland Bagpiper &amp; Wedding Entertainment</title>
    <link>${SITE_URL}</link>
    <description>Live updates, Scottish castle wedding photos, Highland bagpipe performance stories, and tunes from Spud the Piper.</description>
    <language>en-gb</language>
    <copyright>Copyright ${new Date().getFullYear()} Spud the Piper</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icon-512.png</url>
      <title>Spud the Piper</title>
      <link>${SITE_URL}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;
}
