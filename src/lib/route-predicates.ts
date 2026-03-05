const HOME_ROUTES = new Set(['/', '/en', '/pl'])

export function isHomeRoute(pathname: string) {
  return HOME_ROUTES.has(pathname)
}

export function isCvRoute(pathname: string) {
  return pathname.includes('/cv')
}

export function isProjectsRoute(pathname: string) {
  return pathname.includes('/projects')
}
