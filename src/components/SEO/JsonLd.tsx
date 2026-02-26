export const JsonLd = () => {
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sebastian Kolbusz',
    url: 'https://www.kolbusz.xyz',
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
    name: 'Sebastian Kolbusz Portfolio',
    url: 'https://www.kolbusz.xyz',
    author: {
      '@type': 'Person',
      name: 'Sebastian Kolbusz',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
