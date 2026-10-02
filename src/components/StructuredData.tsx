import React from 'react';

export const StructuredData: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'EntertainmentBusiness', 'MusicGroup', 'ProfessionalService'],
        '@id': 'https://www.spudthepiper.com/#business',
        name: 'Spud the Piper',
        alternateName: 'Spud The Piper - Scotland\'s Premier Wedding & Event Bagpiper',
        url: 'https://www.spudthepiper.com',
        logo: 'https://www.spudthepiper.com/icon-512.png',
        image: 'https://www.spudthepiper.com/og-image.jpg',
        description: 'Scotland\'s premier wedding, corporate, and Highland bagpiper for castle weddings, Burns suppers, elopements, and interactive Highland bagpipe experiences across Scotland and worldwide.',
        telephone: '+447368412083',
        email: 'piperspud@gmail.com',
        priceRange: '££',
        currenciesAccepted: 'GBP',
        paymentAccepted: 'Cash, Credit Card, PayPal, Bank Transfer',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'High Burnside',
          addressLocality: 'Aviemore',
          addressRegion: 'Highlands',
          postalCode: 'PH22 1UJ',
          addressCountry: 'GB'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 57.1955,
          longitude: -3.8350
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '22:00'
          }
        ],
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Highlands' },
          { '@type': 'AdministrativeArea', name: 'Scotland' },
          { '@type': 'AdministrativeArea', name: 'United Kingdom' },
          { '@type': 'City', name: 'Aviemore' },
          { '@type': 'City', name: 'Inverness' },
          { '@type': 'City', name: 'Edinburgh' },
          { '@type': 'City', name: 'Glasgow' },
          { '@type': 'City', name: 'Aberdeen' },
          { '@type': 'City', name: 'Perth' },
          { '@type': 'City', name: 'Stirling' },
          { '@type': 'City', name: 'Dundee' },
          { '@type': 'City', name: 'Glencoe' },
          { '@type': 'City', name: 'Isle of Skye' }
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5.0',
          reviewCount: '138',
          bestRating: '5',
          worstRating: '1'
        },
        sameAs: [
          'https://facebook.com/spudthepiper',
          'https://instagram.com/spudthepiper',
          'https://youtube.com/@spudthepiper',
          'https://pinterest.com/spudthepiper',
          'https://tiktok.com/@spudthepiper'
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Scottish Bagpipe Performance Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Scottish Castle & Highland Wedding Bagpiper',
                description: 'Full ceremonial No. 1 Highland dress, guest arrival greeting, bridal aisle processional, drinks reception, and dinner top-table pipe-in.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'The Ultimate Highland Bagpipe Experience',
                description: 'Interactive hands-on bagpipe masterclass, practice chanter workshop, and private Scottish storytelling performance.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Highland Elopements & Intimate Vows',
                description: 'Romantic glen, lochside, and castle cliffside elopement bagpiper across Glencoe, Isle of Skye, and Cairngorms.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Burns Suppers & Hogmanay Celebrations',
                description: 'Piping in the Haggis with full ceremonial fanfare, speeches, dinner reels, and midnight Auld Lang Syne.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Corporate Banquets & Castle VIP Galas',
                description: 'Grand Scottish musical entertainment and red-carpet fanfare for international VIP delegates, summits, and castle dinners.'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Funerals, Memorials & Graveside Laments',
                description: 'Compassionate, dignified graveside laments including Amazing Grace, Going Home, and Flowers of the Forest.'
              }
            }
          ]
        }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.spudthepiper.com/#website',
        url: 'https://www.spudthepiper.com',
        name: 'Spud the Piper',
        publisher: {
          '@id': 'https://www.spudthepiper.com/#business'
        },
        inLanguage: 'en-GB'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
