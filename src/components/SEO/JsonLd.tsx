import { serializeJsonLd } from '@/lib/json-ld'
import { SITE_AUTHOR, SITE_NAME, SITE_ORIGIN } from '@/lib/site'

export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_AUTHOR,
    url: SITE_ORIGIN,
    jobTitle: 'Full-stack Developer',
    sameAs: [
      'https://github.com/skolbusz',
      'https://linkedin.com/in/sebastian-kolbusz',
      'https://twitter.com/skolbusz',
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
    name: SITE_NAME,
    url: SITE_ORIGIN,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
      />
    </>
  )
}
