import { initialServices, initialReviews, initialTunes } from '@/lib/initialData';

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

  // 3. Include All Core Services & Wedding Packages
  if (initialServices && Array.isArray(initialServices)) {
    initialServices.forEach(srv => {
      items.push({
        id: `service-${srv.id}`,
        title: srv.title,
        link: `${SITE_URL}/services/${srv.slug}`,
        description: `${srv.description} ${srv.tagline ? '• ' + srv.tagline : ''}`,
        pubDate: new Date('2026-09-28T12:00:00Z').toUTCString(),
        imageUrl: srv.heroImage || srv.galleryImages?.[0] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
        category: 'Piping Services',
        author: 'Spud the Piper'
      });
    });
  }

  // 4. Include Featured Reviews & Real Wedding Stories
  if (initialReviews && Array.isArray(initialReviews)) {
    initialReviews.filter(r => r.photoUrl).forEach(rev => {
      items.push({
        id: `review-${rev.id}`,
        title: `${rev.eventType} - ${rev.authorName} (${rev.location || 'Scotland'})`,
        link: `${SITE_URL}/reviews`,
        description: `"${rev.comment}" — ${rev.authorName}, 5-Star Review for Spud the Piper.`,
        pubDate: new Date('2026-09-25T10:00:00Z').toUTCString(),
        imageUrl: rev.photoUrl,
        category: 'Client Stories & Reviews',
        author: rev.authorName
      });
    });
  }

  // 5. Include Popular Highland Bagpipe Tunes
  if (initialTunes && Array.isArray(initialTunes)) {
    initialTunes.slice(0, 6).forEach(tune => {
      items.push({
        id: `tune-${tune.id}`,
        title: `${tune.title} - Scottish Bagpipe Tune`,
        link: `${SITE_URL}/tunes?tune=${encodeURIComponent(tune.title)}`,
        description: `${tune.description} ${tune.funFact ? '• ' + tune.funFact : ''}`,
        pubDate: new Date('2026-09-20T09:00:00Z').toUTCString(),
        imageUrl: 'https://images.unsplash.com/photo-1546707012-c518410e5e7e?w=1200&auto=format&fit=crop&q=85',
        category: 'Bagpipe Jukebox',
        author: 'Spud the Piper'
      });
    });
  }

  // 6. Include Highland Attire & Regalia Showcases
  const attireShowcases: RssFeedItem[] = [
    {
      id: 'attire-no1-feather-bonnet',
      title: 'Full No. 1 Ceremonial Highland Dress with Feather Bonnet & Plaid',
      link: `${SITE_URL}/attire`,
      description: 'Authentic Scottish Highland regalia featuring traditional feather bonnet, full shoulder plaid with Celtic brooch, horsehair sporran, and ceremonial spats.',
      pubDate: new Date('2026-09-27T15:00:00Z').toUTCString(),
      imageUrl: 'https://images.unsplash.com/photo-1546707012-c518410e5e7e?w=1200&auto=format&fit=crop&q=85',
      category: 'Highland Attire & Tartans',
      author: 'Spud the Piper'
    },
    {
      id: 'attire-royal-stewart',
      title: 'Royal Stewart Red Tartan Highland Wedding Dress',
      link: `${SITE_URL}/attire`,
      description: 'The iconic vibrant Royal Stewart tartan paired with tailored Argyll tweed jacket and silver highland dress accessories.',
      pubDate: new Date('2026-09-26T14:00:00Z').toUTCString(),
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
      category: 'Highland Attire & Tartans',
      author: 'Spud the Piper'
    },
    {
      id: 'attire-black-watch',
      title: 'Black Watch Military Tartan & Day Dress',
      link: `${SITE_URL}/attire`,
      description: 'Historic Black Watch military tartan, classic glengarry cap, and day tweed jacket for lochside ceremonies, banquets, and ceilidh events.',
      pubDate: new Date('2026-09-25T13:00:00Z').toUTCString(),
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=85',
      category: 'Highland Attire & Tartans',
      author: 'Spud the Piper'
    }
  ];

  const allItems = [...items, ...attireShowcases];

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
