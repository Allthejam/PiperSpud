import { MetadataRoute } from 'next';
import { initialServices } from '@/lib/initialData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.spudthepiper.com';
  const now = new Date();

  // Core static pages with priority and change frequency
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.90
    },
    {
      url: `${baseUrl}/tunes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.90
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${baseUrl}/attire`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.80
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75
    },
    {
      url: `${baseUrl}/social`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.70
    },
    {
      url: `${baseUrl}/install`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.60
    },
    {
      url: `${baseUrl}/booking-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.50
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.40
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.40
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.40
    }
  ];

  // Dynamic service detail pages
  const servicePages: MetadataRoute.Sitemap = initialServices.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85
  }));

  return [...staticPages, ...servicePages];
}
