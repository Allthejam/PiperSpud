import { generateRssFeedXml } from '@/lib/rssGenerator';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60 seconds

export async function GET() {
  try {
    const xml = await generateRssFeedXml();
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[Feed XML Error]', err);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
