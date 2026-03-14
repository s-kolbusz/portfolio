// ---------------------------------------------------------------------------
// Portfolio Entry — Locale-independent shared base
// ---------------------------------------------------------------------------

export type EntryType = 'project' | 'role'

export type Category = 'e-commerce' | 'saas' | 'landing-page' | 'web-app' | 'cms' | 'other'

export interface MediaItem {
  url: string
  alt: string
  type: 'image' | 'video'
}

export interface RolePhase {
  period: string
}

export interface ProjectMetric {
  label: string
  value: string | number
  unit?: string
  description?: string
}

export interface PortfolioEntryBase {
  id: string
  type: EntryType
  year: string
  category: Category
  techStack: readonly string[]
  heroImage: string
  gallery: readonly MediaItem[]
  featured: boolean
  order: number
  liveUrl?: string
  timeline?: readonly RolePhase[]
  metrics?: readonly ProjectMetric[]
}

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

// ---------------------------------------------------------------------------
// Entries — order determines book page sequence
// ---------------------------------------------------------------------------

export const portfolioEntries = [
  {
    id: 'zakofy',
    type: 'project',
    year: '2026',
    category: 'e-commerce',
    techStack: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'TypeScript', 'MongoDB'],
    heroImage: '/images/projects/zakofy.avif',
    gallery: [
      {
        url: '/images/projects/gallery/zakofy-hero.webp',
        alt: 'Zakofy homepage hero with mountain panorama',
        type: 'image',
      },
      {
        url: '/images/projects/gallery/zakofy-tours.webp',
        alt: 'Featured tours grid with cards',
        type: 'image',
      },
      {
        url: '/images/projects/gallery/zakofy-features.webp',
        alt: 'Why Choose Zakofy value proposition',
        type: 'image',
      },
    ],
    featured: true,
    order: 1,
    liveUrl: 'https://zakofy.com',
    metrics: [
      { label: 'Lighthouse', value: 100, description: 'Performance Score' },
      { label: 'LCP', value: 0.8, unit: 's', description: 'Largest Contentful Paint' },
    ],
  },
  {
    id: 'your-krakow-travel',
    type: 'project',
    year: '2025',
    category: 'e-commerce',
    techStack: ['Next.js', 'Payload CMS', 'Tailwind CSS', 'TypeScript', 'MongoDB'],
    heroImage: '/images/projects/yourkrakowtravel.avif',
    gallery: [
      {
        url: '/images/projects/gallery/yourkrakowtravel-hero.webp',
        alt: 'Your Krakow Travel homepage with aerial Krakow view',
        type: 'image',
      },
      {
        url: '/images/projects/gallery/yourkrakowtravel-tours.webp',
        alt: 'Tour catalog grid with category filters',
        type: 'image',
      },
    ],
    featured: true,
    order: 2,
    liveUrl: 'https://yourkrakowtravel.com',
    metrics: [
      { label: 'Lighthouse', value: 100, description: 'Performance Score' },
      { label: 'FID', value: 15, unit: 'ms', description: 'First Input Delay' },
    ],
  },
  {
    id: 'wellezza',
    type: 'project',
    year: '2024',
    category: 'landing-page',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript', 'GSAP'],
    heroImage: '/images/projects/wellezza.avif',
    gallery: [
      {
        url: '/images/projects/gallery/wellezza-hero.webp',
        alt: 'Wellezza salon hero with branding',
        type: 'image',
      },
      {
        url: '/images/projects/gallery/wellezza-services.webp',
        alt: 'Service offerings with pricing tiers',
        type: 'image',
      },
    ],
    featured: true,
    order: 3,
    liveUrl: 'https://wellezza.pl',
    metrics: [
      { label: 'Lighthouse', value: 100, description: 'Performance Score' },
      { label: 'A11y', value: 100, description: 'Accessibility Score' },
    ],
  },
  {
    id: 'billboard-zakopane',
    type: 'project',
    year: '2023',
    category: 'landing-page',
    techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    heroImage: '/images/projects/billboard.avif',
    gallery: [
      {
        url: '/images/projects/gallery/billboard-hero.webp',
        alt: 'Billboard Zakopane company hero',
        type: 'image',
      },
      {
        url: '/images/projects/gallery/billboard-services.webp',
        alt: 'Billboard rental services overview',
        type: 'image',
      },
    ],
    featured: true,
    order: 4,
    liveUrl: 'https://billboardzakopane.pl',
    metrics: [
      { label: 'Lighthouse', value: 100, description: 'Performance Score' },
      { label: 'CLS', value: 0, description: 'Cumulative Layout Shift' },
    ],
  },
  {
    id: 'ready2order',
    type: 'role',
    year: '2019–2025',
    category: 'saas',
    techStack: ['React', 'TypeScript', 'Apollo GraphQL', 'Tailwind CSS', 'Jest', 'Cypress'],
    heroImage: '/images/projects/ready2order.avif',
    gallery: [],
    featured: true,
    order: 5,
    liveUrl: 'https://ready2order.com',
    timeline: [{ period: '2019–2020' }, { period: '2020–2022' }, { period: '2022–2025' }],
    metrics: [
      { label: 'Bundle', value: -50, unit: '%', description: 'Size Reduction' },
      { label: 'Scale', value: '10k+', description: 'Active Merchants' },
    ],
  },
] as const satisfies readonly PortfolioEntryBase[]

export type PortfolioEntryId = (typeof portfolioEntries)[number]['id']
