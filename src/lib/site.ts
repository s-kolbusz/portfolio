export const SITE_ORIGIN = 'https://www.kolbusz.xyz'
export const SITE_AUTHOR = 'Sebastian Kolbusz'
export const SITE_NAME = 'Sebastian Kolbusz Portfolio'

export function toAbsoluteSiteUrl(pathname: string) {
  return `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}
