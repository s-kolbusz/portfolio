import { STUDIO } from '@/data/studio'
import { SITE_AUTHOR, SITE_NAME, SITE_ORIGIN, SITE_ROLE } from '@/lib/site'

import { StructuredData } from './structured-data'

export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}/#about`,
    name: SITE_AUTHOR,
    url: SITE_ORIGIN,
    jobTitle: SITE_ROLE,
    image: {
      '@type': 'ImageObject',
      url: `${SITE_ORIGIN}/images/sebastian_kolbusz_caricature.avif`,
      width: 800,
      height: 800,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zakopane',
      addressCountry: 'PL',
    },
    // The web studio the owner runs. Same @id stronypodhale.pl declares for itself,
    // whose `founder` points back here — one entity graph across both domains.
    worksFor: {
      '@type': 'ProfessionalService',
      '@id': STUDIO.id,
      name: STUDIO.name,
      url: STUDIO.url,
    },
    sameAs: [
      'https://github.com/s-kolbusz',
      'https://linkedin.com/in/skolbusz',
      'https://x.com/s_kolbusz',
    ],
    knowsAbout: [
      'Web Development',
      'React',
      'Next.js',
      'TypeScript',
      'Three.js',
      '3D Printing',
      'UI/UX Design',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ORIGIN,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    author: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#about`,
    },
  }

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_ORIGIN}/#service`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    image: `${SITE_ORIGIN}/images/sebastian_kolbusz_caricature.avif`,
    // Local websites for Podhale firms are stronypodhale.pl's market (SEB-66).
    // A street-level address, coordinates and the same towns here made this read
    // as a local business and the two sites compete for one query; where the
    // owner lives stays on the Person.
    areaServed: [{ '@type': 'Country', name: 'Poland' }],
    priceRange: '$$$',
    founder: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#about`,
    },
  }

  return (
    <StructuredData
      entries={[
        { id: 'person', data: personSchema },
        { id: 'website', data: websiteSchema },
        { id: 'professionalservice', data: professionalServiceSchema },
      ]}
    />
  )
}
