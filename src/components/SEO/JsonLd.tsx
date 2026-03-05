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
      'https://github.com/s-kolbusz',
      'https://linkedin.com/in/skolbusz',
      'https://twitter.com/s_kolbusz',
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
