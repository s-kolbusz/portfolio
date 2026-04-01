export const SITE_ORIGIN = 'https://www.kolbusz.xyz'
export const SITE_AUTHOR = 'Sebastian Kolbusz'
export const SITE_NAME = 'Sebastian Kolbusz Portfolio'
export const SITE_TWITTER_HANDLE = '@s_kolbusz'
// NOTE: OG image must be JPEG or PNG — AVIF is not supported by social crawlers (Twitter, LinkedIn, etc.)
// Export a 1200×630 JPEG from the caricature and place it at this path before deploying.
export const SITE_SOCIAL_IMAGE_PATH = '/images/og-image.png'
export const SITE_SOCIAL_IMAGE_ALT = 'Sebastian Kolbusz - High-performance web engineering'

export function toAbsoluteSiteUrl(pathname: string) {
  return `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
