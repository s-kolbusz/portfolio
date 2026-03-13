import type { PortfolioEntryContent, PortfolioEntryId } from './projects'

export const projectsEn: Record<PortfolioEntryId, PortfolioEntryContent> = {
  zakofy: {
    title: 'Zakofy',
    subtitle: 'Custom Tatra Mountain Offer Platform',
    tagline:
      'Providing a modern digital appearance for mountain tourism with a custom-built offer presentation system.',
    pullQuotes: [
      'We focused on building a technically sound environment where the photography and UI work together.',
      'The architecture ensures that the offer presentation is intuitive and reliable on all devices.',
    ],
    client: 'Freelance',
    role: 'Senior Frontend Engineer',
    problem:
      'The client needed a professional online presence to showcase private Tatra mountain tours. Their existing workflow lacked a cohesive digital identity to compete in the modern tourism market.',
    approach:
      'I engineered a performance-focused platform using Next.js. The strategy was to build a clean, accessible interface that prioritizes visual storytelling while maintaining world-class engineering standards for speed and reliability.',
    solution:
      'The system features a custom-built tour catalog with optimized image handling and a professional layout. I implemented a robust technical foundation using Static Site Generation (SSG) to ensure near-instant load times, even on mobile networks in mountain regions.',
    results:
      'The project delivered a significantly improved digital presence with high Lighthouse performance scores. The new architecture provides a reliable foundation for future scaling and has established a professional brand image for the client.',
  },

  'your-krakow-travel': {
    title: 'Your Krakow Travel',
    subtitle: 'Consolidated Tour Discovery Platform',
    tagline:
      'Building a professional and cohesive digital identity for a premier private tour provider.',
    pullQuotes: [
      'Centralizing complex service offerings into a cohesive, high-performance platform.',
    ],
    client: 'Freelance',
    role: 'Senior Frontend Engineer',
    problem:
      'The service provider lacked a central, professional platform to showcase their wide range of private tours. Their digital appearance was fragmented, making it difficult for prospective clients to understand their full value proposition.',
    approach:
      'I architected a unified discovery platform using Next.js. The focus was on building a scalable system that could handle a large catalog of services while maintaining a refined user experience and clear navigation.',
    solution:
      'Developed a category-based discovery system with a modern technical stack. I integrated structured data for better search visibility and focused on accessibility-first design to ensure the platform is usable by everyone.',
    results:
      'The platform successfully consolidated the client’s offerings into a professional digital asset. It provides a high-performance, accessible environment that has improved brand perception and streamlined the user journey.',
  },

  wellezza: {
    title: 'Wellezza',
    subtitle: 'Professional Salon Digital Presence',
    tagline:
      'Modernizing a local hair salon’s presence through a high-performance website and booking integration.',
    pullQuotes: [
      'Building a digital storefront that reflects the professionalism of the physical space.',
    ],
    client: 'Freelance',
    role: 'Senior Frontend Engineer',
    problem:
      'The salon needed a professional digital presence to complement their high-quality service. They required an online platform that could reflect their modern brand identity and integrate with their existing scheduling workflow.',
    approach:
      'I designed and developed a high-performance web presence that focuses on clarity and ease of use. The engineering goal was to create a flawless technical foundation that ensures a smooth experience for all visitors.',
    solution:
      'Created a custom frontend integrated with a third-party scheduling system. The site achieves a 100/100 Lighthouse performance score and features an accessibility-first design, ensuring a professional appearance on all devices.',
    results:
      'The salon now has a professional and reliable digital presence. The technical excellence of the new site has established them as a local leader in their industry and provided a streamlined path for their clients.',
  },

  'billboard-zakopane': {
    title: 'Billboard Zakopane',
    subtitle: 'B2B Outdoor Advertising Platform',
    tagline:
      'Streamlining regional advertising presentation through a professional, interactive location catalog.',
    pullQuotes: [
      'Providing a professional digital tool for B2B technical specifications and mapping.',
    ],
    client: 'Freelance',
    role: 'Senior Frontend Engineer',
    problem:
      'A regional leader in outdoor advertising lacked a professional tool to showcase their billboard inventory. They needed a digital platform to present their catalog and provide technical specifications to B2B clients.',
    approach:
      'I architected a professional B2B platform focused on clarity and technical utility. The design prioritizes a "Live Catalog" of available spaces, using a modern tech stack to ensure reliability and performance.',
    solution:
      'Integrated an interactive mapping system allowing clients to view and filter available structure specs. I built a streamlined technical foundation that provides all necessary data upfront, ensuring a professional appearance.',
    results:
      'The platform serves as a credible digital asset for the company, supporting their professional brand narrative and providing a reliable tool for regional B2B presentation.',
  },

  ready2order: {
    title: 'ready2order',
    subtitle: 'Senior Frontend Engineer — Enterprise POS',
    tagline:
      'Optimizing and scaling cross-platform POS software used by thousands of businesses across Europe.',
    pullQuotes: [
      'Focusing on engineering craft to improve performance and maintainability at scale.',
      'Building robust frontend architectures for high-traffic merchant devices.',
    ],
    phases: [
      {
        title: 'Frontend Architecture & Performance',
        description:
          'Drove architectural improvements and performance optimization for the core React product. Specialized in reducing bundle sizes and improving hydration times for merchant devices.',
        highlights: [
          'Achieved significant React bundle reduction through advanced build-pipe optimization',
          'Architected responsive modular interfaces for cross-platform consistency',
          'Mentored engineering teams on modern React patterns and technical maintainability',
          'Extended complex backend APIs via GraphQL to support high-traffic frontend features',
        ],
      },
    ],
  },
} satisfies Record<PortfolioEntryId, PortfolioEntryContent>
