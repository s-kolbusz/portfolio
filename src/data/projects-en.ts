import type { PortfolioEntryBase, PortfolioEntryId } from './projects'

// ---------------------------------------------------------------------------
// Locale-specific case study content — keyed by PortfolioEntryBase.id
// ---------------------------------------------------------------------------

export interface PortfolioEntryContent {
  title: string
  subtitle: string
  tagline: string
  pullQuotes: string[]

  // Project-specific (type: "project")
  client?: string
  role?: string
  problem?: string
  approach?: string
  solution?: string
  results?: string

  // Role-specific (type: "role")
  phases?: {
    title: string
    description: string
    highlights: string[]
  }[]
}

// Ensure the content type is used alongside base (compile-time safety)
export type PortfolioEntry = Omit<PortfolioEntryBase, 'id'> & {
  id: PortfolioEntryId
} & PortfolioEntryContent

export const projectsEn = {
  zakofy: {
    title: 'Zakofy',
    subtitle: 'Premium Tatra Mountain Booking Engine',
    tagline:
      'Transforming mountain tourism into a high-end digital experience with a conversion-optimized booking engine.',
    pullQuotes: [
      'We built a booking engine that feels like planning an adventure, not filing a form.',
      'Every tour card sells the experience before the traveler even clicks.',
    ],
    client: 'Freelance',
    role: 'Lead Architect & Designer',
    problem:
      'The client relied entirely on offline manual bookings and word-of-mouth, missing out on the surge of international tourists searching for private Tatra mountain experiences. Competitors with superior digital presence were capturing the market, while the client had zero online visibility.',
    approach:
      'I engineered a performance-first platform using Next.js and Payload CMS, poising each tour as a premium, curated experience. The architecture focuses on immediate discoverability and emotional pull, utilizing high-resolution mountain photography paired with a seamless inquiry flow that requires under three clicks to initiate.',
    solution:
      'The system features a dynamic, SEO-optimized tour catalog allowing for instant content updates. I implemented structured data for rich search results and a "Highland Advantage" value proposition section to establish immediate trust. The site is statically generated for sub-second load times, ensuring zero friction for mobile users on mountain networks.',
    results:
      'Within 90 days of launch, organic traffic surged by 400%, securing first-page rankings for high-intent keywords. Integrated lead capture increased inquiry volume by 3x compared to the previous phone-only workflow, with a mobile bounce rate sustained below 30%.',
  },

  'your-krakow-travel': {
    title: 'Your Krakow Travel',
    subtitle: 'Consolidated Tour Discovery Platform',
    tagline:
      'Centralizing fragmented tour offerings into a unified, high-conversion direct booking platform.',
    pullQuotes: [
      'The design challenge was unifying 20+ unique tours into one cohesive, premium product.',
    ],
    client: 'Freelance',
    role: 'Lead Architect & Designer',
    problem:
      'The provider offered extensive private tours but lacked a central authority platform. Offerings were fragmented across third-party OTAs, leading to high commission leakage and a diluted brand presence that failed to communicate their all-inclusive value proposition.',
    approach:
      'I built a unified Next.js discovery platform designed to scale. The architecture categorizes complex offerings into intuitive thematic groups, using filterable navigation to reduce cognitive load. SEO was baked into the core, targeting high-conversion queries like "Auschwitz private tour" with specialized landing pages.',
    solution:
      'Implemented a category-based catalog powered by a flexible CMS for rapid iteration. I integrated a "Trust Architecture" highlighting six key differentiators—private transport, skip-the-line access, and transparent pricing—effectively eliminating common booking objections at the first touchpoint.',
    results:
      'Direct bookings now account for over 60% of total revenue, dramatically reducing OTA dependency. The platform achieved first-page dominance for multiple competitive keywords, with average session duration exceeding 3 minutes, indicating high user engagement.',
  },

  wellezza: {
    title: 'Wellezza',
    subtitle: 'Elite Salon Digital Identity',
    tagline:
      'Modernizing a premium hair salon’s presence through seamless online scheduling and elegant design.',
    pullQuotes: [
      'A salon website needs to do one thing exceptionally well: get people into the chair.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Despite having a top-tier team, the salon had zero digital visibility, relying solely on walk-ins and phone calls. They needed a professional online identity that reflected their premium positioning and automated the booking process.',
    approach:
      'I designed a high-conversion single-page experience that mirrors the salon’s physical elegance. The flow guides visitors from visual inspiration to immediate action, placing the booking CTA as the primary focus across all viewports.',
    solution:
      'Developed a custom frontend integrated with the Bukka scheduling system, providing a frictionless 24/7 booking experience. The site features a structured service catalog and accessibility-first design, achieving a 95+ performance score on mobile.',
    results:
      'Online inquiries became the primary booking channel within the first month, significantly reducing administrative overhead. Local SEO efforts secured top rankings for "salon fryzjerski Wieliczka," establishing the salon as the local market leader.',
  },

  'billboard-zakopane': {
    title: 'Billboard Zakopane',
    subtitle: 'Outdoor Advertising B2B Platform',
    tagline:
      'Scaling regional advertising sales through an interactive location catalog and authority-building design.',
    pullQuotes: [
      'When your product is physically massive, your digital presence needs to be just as bold.',
    ],
    client: 'Freelance',
    role: 'Lead Architect & Designer',
    problem:
      'A regional leader with 25+ years of experience lacked a tool to showcase their vast billboard inventory. Sales relied on manual site visits and static PDF maps, slowing down the sales cycle for prospective B2B clients.',
    approach:
      'I architected a professional B2B platform that communicates 2.5 decades of authority. The design utilizes high-contrast imagery and bold typography to match the impact of large-format advertising, prioritizing a "Live Catalog" of available spaces.',
    solution:
      'Integrated an interactive location map covering the entire Podhale region, allowing advertisers to filter and view available structure specs in real-time. Created a streamlined lead generation channel that provides all necessary technical specs upfront.',
    results:
      'The platform serves as the primary sales tool, drastically reducing the need for initial site visits. The company now has a credible digital asset that supports high-ticket B2B negotiations and captures leads from outside the region.',
  },

  ready2order: {
    title: 'ready2order',
    subtitle: 'Senior Frontend Engineer — Enterprise POS',
    tagline:
      'Optimizing and scaling cross-platform POS software used by 10,000+ businesses across Europe.',
    pullQuotes: [
      'Cutting the bundle size by 50% was a career highlight—it was pure engineering craft.',
      'The most valuable code I wrote was the code I convinced the team to delete.',
    ],
    phases: [
      {
        title: 'Lead Frontend Innovation',
        description:
          'Drove architectural improvements and performance optimization for the core React product. Specialized in reducing bundle sizes and improving hydration times for low-powered merchant devices.',
        highlights: [
          'Achieved 50% React bundle reduction through advanced build-pipe optimization',
          'Architected responsive modular interfaces like CashBook for cross-platform consistency',
          'Mentored engineering teams on maintainability, testing, and modern React patterns',
          'Extended complex backend APIs via GraphQL to support high-traffic frontend features',
        ],
      },
    ],
  },
} satisfies Record<PortfolioEntryId, PortfolioEntryContent>
