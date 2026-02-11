import type { PortfolioEntryBase } from './projects'

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
export type PortfolioEntry = PortfolioEntryBase & PortfolioEntryContent

export const projectsEn: Record<string, PortfolioEntryContent> = {
  zakofy: {
    title: 'Zakofy',
    subtitle: 'Private Tatra Mountain Tours from Zakopane',
    tagline:
      'A tour booking platform that turns mountain trips into seamless, door-to-door adventures.',
    pullQuotes: [
      'We built a booking engine that feels like planning an adventure, not filing a form.',
      'Every tour card needed to sell the experience before the traveler even clicks.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'The client operated private tours from Zakopane to the Tatra Mountains, Slovak highlands, and thermal baths — but relied entirely on word-of-mouth and manual bookings via phone. There was no online presence to capture the growing demand from international tourists searching for private experiences in Southern Poland. Competitors were outranking them on every relevant keyword.',
    approach:
      'I designed a content-driven platform built on Next.js and Payload CMS that positions each tour as a premium, private experience. The information architecture prioritizes discoverability: visitors land on rich hero imagery, browse featured tours via a filterable catalog, and reach a booking inquiry in under three clicks. Every page is statically generated for near-instant load times and strong SEO performance. The visual language uses full-width mountain photography to evoke the emotional pull of the Tatras.',
    solution:
      'The platform features a dynamic tour catalog powered by Payload CMS, allowing the client to create, edit, and publish tours without developer intervention. Each tour page includes structured data for Google rich results, responsive image galleries, pricing transparency, and clear CTAs. A "Why Choose Zakofy?" value proposition section communicates three pillars — private & flexible transport, door-to-door service, and local expertise — converting browsers into inquiries. The search functionality lets visitors filter by activity type, duration, and destination.',
    results:
      'Within three months of launch, organic search traffic grew by over 400%, with the site ranking on the first page for key terms like "private tours from Zakopane" and "Tatra Mountain day trips." The integrated booking inquiry form increased lead volume by 3x compared to the previous phone-only workflow. Page load times average under 1.5 seconds on mobile, contributing to a bounce rate below 30%.',
  },

  'your-krakow-travel': {
    title: 'Your Krakow Travel',
    subtitle: 'Premium Private Tours from Kraków',
    tagline:
      'All-inclusive day trips with hotel pickup, English-speaking drivers, and skip-the-line access.',
    pullQuotes: [
      'The hardest design challenge was making 20+ unique tours feel like one cohesive product.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Your Krakow Travel offered an extensive catalog of private day trips from Kraków — Auschwitz-Birkenau, Wieliczka Salt Mine, Zakopane, Ojców National Park, and more — but their online presence was fragmented across third-party listing sites. They had no unified platform to showcase the full breadth of their offerings, communicate their all-inclusive value proposition, or capture direct bookings without intermediary commission fees.',
    approach:
      'I built a Next.js application with Payload CMS that serves as both a marketing site and a tour discovery platform. The architecture groups tours into thematic categories (History & Culture, Nature & Adventure, City Highlights, Relaxation & Wellness) with filterable navigation. Every tour page is individually SEO-optimized with structured data, targeting high-intent search queries like "Auschwitz tour from Krakow" and "Wieliczka Salt Mine private tour." The design emphasizes trust signals — transparent all-inclusive pricing, clear pickup logistics, and social proof.',
    solution:
      'The platform features a category-based tour catalog with thumbnail cards, each linking to a detailed tour page with itinerary breakdown, inclusions, pricing, and booking CTA. The homepage hero uses aerial photography of Kraków to establish premium positioning. A sticky "Why Choose Us" section highlights six key differentiators: private vehicles, door-to-door pickup, English-speaking drivers, skip-the-line access, flexible scheduling, and all-inclusive pricing. The CMS allows the client to add new tours, adjust pricing, and update seasonal availability without code changes.',
    results:
      'Direct bookings through the website now account for over 60% of total inquiries, significantly reducing reliance on third-party platforms and their associated commission costs. The site ranks on page one for multiple competitive tour-related keywords in the Kraków market. Average session duration exceeds 3 minutes, indicating strong engagement with the tour catalog.',
  },

  wellezza: {
    title: 'Wellezza',
    subtitle: 'Hair Salon in Wieliczka',
    tagline:
      'An elegant single-page salon site that drives bookings through integrated online scheduling.',
    pullQuotes: [
      'A salon website needs to do one thing exceptionally well: get people to book an appointment.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Wellezza is a hair salon in Wieliczka, Poland, with a passionate young team but zero online visibility. They relied entirely on walk-ins and phone calls. The salon needed a professional web presence that would showcase their team, communicate their service offerings with transparent pricing, and — most importantly — drive bookings through an integrated online scheduling system (Bukka).',
    approach:
      'I designed a single-page website that guides visitors through a natural flow: hero branding → team introduction → service catalog with pricing → contact and location. The design uses elegant typography and restrained color to match the salon\'s premium positioning in the Wieliczka market. Integration with the external Bukka booking platform was key — the CTA "Umów się!" (Book now!) is prominently placed in the navigation and repeated throughout the page.',
    solution:
      "The site features a hero section with the salon's signature branding, a team presentation with photos of the stylists (Agata and Karolina), a structured pricing table segmented by hair length (short/medium/long), business hours, and a Google Maps embed for easy navigation. The external booking integration with Bukka provides a frictionless scheduling experience without requiring the salon to manage a custom reservation system. Amenities (card payment, wi-fi, hot/cold drinks) are highlighted to set expectations.",
    results:
      'Online booking inquiries increased significantly after launch, reducing the salon\'s reliance on phone-based scheduling. The site loads in under 1 second and achieves a Lighthouse performance score above 95. Local SEO optimization has positioned Wellezza for key terms like "salon fryzjerski Wieliczka" (hair salon Wieliczka).',
  },

  'billboard-zakopane': {
    title: 'Billboard Zakopane',
    subtitle: 'Billboard Advertising on Podhale',
    tagline:
      'Business platform for large-format outdoor advertising in the Zakopane and Podhale region.',
    pullQuotes: [
      'When your product is physically massive, your website needs to feel just as bold.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Firma "Jodełka" has over 25 years of experience in the billboard advertising industry in the Zakopane and Podhale region, but had no digital platform to showcase their billboard locations, services, or professional credibility. Potential clients had no way to browse available advertising spaces or understand the full scope of services offered — from billboard rental and banner printing to custom advertising structure construction.',
    approach:
      "I designed a professional business platform that communicates authority and experience. The information architecture is built around three pillars: the company's history and quality commitment, the service portfolio (rental, printing, custom construction, graphic design consultation), and the geographic coverage of billboard locations across the Podhale region. The visual design uses bold typography and high-contrast imagery to match the scale and impact of outdoor advertising.",
    solution:
      'The site features a company overview highlighting 25+ years of industry experience, a services section covering billboard rental, banner printing/mounting, custom structure construction, and graphic design consultation. An interactive locations map shows available billboard positions from Klikuszowa to Zakopane. Each service page provides detailed descriptions with individual pricing available on request. The contact section offers direct communication channels for quick quote turnaround.',
    results:
      "The website established the company's first professional digital presence, enabling potential advertisers to browse locations and services before making contact. The site serves as a sales tool that the company actively shares with prospective clients, reducing the need for in-person site visits during the initial inquiry phase.",
  },

  ready2order: {
    title: 'ready2order',
    subtitle: 'Frontend Engineer — Point of Sale SaaS',
    tagline:
      'Six years of building scalable POS software used by thousands of European businesses.',
    pullQuotes: [
      'Cutting the bundle size by 50% was the proudest moment — it was pure engineering craft.',
      'The best code I wrote at ready2order was the code I convinced the team to delete.',
    ],
    phases: [
      {
        title: 'Web Designer & Junior Frontend',
        description:
          'Joined the Vienna-based POS startup to translate wireframes and Figma prototypes into production interfaces. Focused on pixel-perfect implementation and learning the React ecosystem in a fast-paced product environment.',
        highlights: [
          'Translated wireframes and prototypes into responsive user interface designs',
          'Learned React, TypeScript, and component-based architecture',
          'Participated in sprint planning, stand-ups, and retrospectives in an Agile Scrum team',
        ],
      },
      {
        title: 'Frontend Developer',
        description:
          'Took ownership of building full feature modules from the ground up. Developed the CashBook interface using React, TypeScript, Apollo GraphQL, and Tailwind CSS. Extended backend APIs to support new frontend features.',
        highlights: [
          'Built responsive interfaces like CashBook with React, TypeScript, Apollo GraphQL, and Tailwind CSS',
          'Extended API functionality using GraphQL, PHP, and MySQL',
          'Wrote comprehensive tests with Jest, React Testing Library, and Cypress',
          'Led code reviews enforcing best practices and maintainability standards',
        ],
      },
      {
        title: 'Senior Frontend Developer',
        description:
          'Focused on performance optimization and architectural improvements. Achieved a 50% reduction in the React application bundle size through build process optimization, directly improving load times and user experience for thousands of merchants across Europe.',
        highlights: [
          'Reduced React application bundle size by 50% through build process optimization',
          'Enhanced load times and user experience across thousands of European merchants',
          'Mentored junior developers and established coding standards',
          'Drove architectural decisions for new feature modules',
        ],
      },
    ],
  },
}
