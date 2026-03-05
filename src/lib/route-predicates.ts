const HOME_ROUTES = new Set(['/', '/en', '/pl'])

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

export function isHomeRoute(pathname: string) {
  return HOME_ROUTES.has(normalizePathname(pathname))
}

export function isCvRoute(pathname: string) {
  return normalizePathname(pathname).includes('/cv')
}

export function isProjectsRoute(pathname: string) {
  return normalizePathname(pathname).includes('/projects')
}
