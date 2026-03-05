// ---------------------------------------------------------------------------
// Work Item — Locale-independent shared base
// ---------------------------------------------------------------------------

export type WorkItemType = 'project' | 'role'

export type WorkCategory = 'eCommerce' | 'saas' | 'landingPage' | 'webApp' | 'cms' | 'other'

export interface WorkItemMedia {
  url: string
  alt: string
  type: 'image' | 'video'
}

export interface WorkPhase {
  period: string
}

export interface WorkItemBase {
  id: string
  type: WorkItemType
  year: string
  category: WorkCategory
  techStack: readonly string[]
  heroImage: string
  gallery: readonly WorkItemMedia[]
  featured: boolean
  order: number
  liveUrl?: string
  timeline?: readonly WorkPhase[]
}

export interface WorkItemContent {
  title: string
  subtitle: string
  tagline: string
  pullQuotes: string[]
  client?: string
  role?: string
  problem?: string
  approach?: string
  solution?: string
  results?: string
  phases?: {
    title: string
    description: string
    highlights: string[]
  }[]
}

// ---------------------------------------------------------------------------
// Entries — order determines book page sequence
// ---------------------------------------------------------------------------

export const workItems = [
  {
    id: 'zakofy',
    type: 'project',
    year: '2026',
    category: 'eCommerce',
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
  },
  {
    id: 'your-krakow-travel',
    type: 'project',
    year: '2025',
    category: 'eCommerce',
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
  },
  {
    id: 'wellezza',
    type: 'project',
    year: '2024',
    category: 'landingPage',
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
  },
  {
    id: 'billboard-zakopane',
    type: 'project',
    year: '2023',
    category: 'landingPage',
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
  },
] as const satisfies readonly WorkItemBase[]

export type WorkItemId = (typeof workItems)[number]['id']

export type WorkItem = Omit<WorkItemBase, 'id'> & {
  id: WorkItemId
} & WorkItemContent
