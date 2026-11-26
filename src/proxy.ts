import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { routing } from './i18n/routing'

const intl = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  // The redesign lives at /v2/<locale> with its own root layout (owner, 2026-11-26): its locale is
  // the second segment, so next-intl's prefix handling must not touch it.
  if (/^\/v2(\/|$)/.test(request.nextUrl.pathname)) return NextResponse.next()
  return intl(request)
}

export const config = {
  // Match only internationalized pathnames
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
