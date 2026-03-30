export const SITE_ORIGIN = 'https://www.kolbusz.xyz'
export const SITE_AUTHOR = 'Sebastian Kolbusz'
export const SITE_NAME = 'Sebastian Kolbusz Portfolio'
export const SITE_TWITTER_HANDLE = '@s-kolbusz'
export const SITE_SOCIAL_IMAGE_PATH = '/images/sebastian_kolbusz_caricature.avif'
export const SITE_SOCIAL_IMAGE_ALT = 'Sebastian Kolbusz - High-performance web engineering'

export function toAbsoluteSiteUrl(pathname: string) {
  return `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
