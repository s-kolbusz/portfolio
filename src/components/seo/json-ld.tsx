import { SITE_AUTHOR, SITE_NAME, SITE_ORIGIN } from '@/lib/site'

import { StructuredData } from './structured-data'

export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}/#person`,
    name: SITE_AUTHOR,
    url: SITE_ORIGIN,
    jobTitle: 'Senior Frontend Engineer',
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
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance',
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
    '@id': `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    author: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/#person`,
    },
  }

  return (
    <StructuredData
      entries={[
        { id: 'person', data: personSchema },
        { id: 'website', data: websiteSchema },
      ]}
    />
  )
}
