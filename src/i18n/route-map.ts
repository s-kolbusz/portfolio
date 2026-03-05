export const ROUTE_SEGMENTS = {
  lab: 'lab',
  resume: 'resume',
  work: 'work',
} as const

export type AppPage = keyof typeof ROUTE_SEGMENTS | 'home'
export type HomeSection = 'hero' | 'about' | 'projects' | 'services' | 'calculator' | 'contact'

export function getPageHref(page: AppPage) {
  if (page === 'home') {
    return '/'
  }

  return `/${ROUTE_SEGMENTS[page]}`
}

export function getWorkDetailHref(slug: string) {
  return `${getPageHref('work')}/${slug}`
}

export function getHomeSectionHref(section: HomeSection) {
  if (section === 'hero') {
    return getPageHref('home')
  }

  return `${getPageHref('home')}#${section}`
}

export function getLocalizedHref(locale: string, href: string) {
  const normalizedHref = href === '/' ? '' : href.startsWith('/') ? href : `/${href}`

  return `/${locale}${normalizedHref}`
}

export function getLocalizedPageHref(locale: string, page: AppPage) {
  return getLocalizedHref(locale, getPageHref(page))
}

export function getLocalizedWorkDetailHref(locale: string, slug: string) {
  return getLocalizedHref(locale, getWorkDetailHref(slug))
}

export function getHrefPathSegment(href: string) {
  const [pathname] = href.split('#')
  const firstSegment = pathname.split('/').filter(Boolean)[0]

  return firstSegment ?? null
}
