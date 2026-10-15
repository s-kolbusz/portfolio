export const SITE_ORIGIN = 'https://kolbusz.xyz'
export const SITE_AUTHOR = 'Sebastian Kolbusz'
export const SITE_NAME = 'Sebastian Kolbusz Portfolio'
/**
 * One professional label for metadata and `jobTitle` (SEB-66), so search engines
 * and AI assistants see a single entity. Local web design for Podhale firms is
 * stronypodhale.pl's market, so nothing here claims it.
 */
export const SITE_ROLE = 'Creative Developer · Full-stack Engineer'
export const SITE_DESCRIPTION =
  'Creative developer and full-stack engineer based in Zakopane, Poland. Animated websites (GSAP, WebGL), Next.js applications and Payload CMS. Founder of stronypodhale.pl.'
export const SITE_TWITTER_HANDLE = '@s_kolbusz'
export const SITE_SOCIAL_IMAGE_PATH = '/og-image'
export const SITE_SOCIAL_IMAGE_ALT = 'Sebastian Kolbusz - High-performance web engineering'

export function toAbsoluteSiteUrl(pathname: string) {
  return `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
