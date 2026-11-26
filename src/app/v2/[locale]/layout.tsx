import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import { RybbitAnalytics } from '@/components/analytics/rybbit'
import { JsonLd } from '@/components/seo/json-ld'
import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/client-overlays'
import { SkipToMain } from '@/components/ui/skip-to-main'
import { getLocaleFromParams } from '@/i18n/locale'
import { Link } from '@/i18n/navigation-v2'
import { routing } from '@/i18n/routing'
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_ROLE, SITE_TWITTER_HANDLE } from '@/lib/site'

import '../../globals.css'
import '../../system.css'

/** The redesign's own root layout: its shell (site nav, cursor, system.css) never loads on the old site. */
type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const satoshi = localFont({
  src: [
    {
      path: '../../../fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '300 900',
    },
    {
      path: '../../../fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '300 900',
    },
  ],
  variable: '--font-sans',
  display: 'optional',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'optional',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'optional',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#161616' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: `Sebastian Kolbusz | ${SITE_ROLE}`,
    template: '%s | Sebastian Kolbusz',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Sebastian Kolbusz',
    'Creative Developer',
    'Full-stack Engineer',
    'Next.js Specialist',
    'Payload CMS Developer',
    'Frontend Developer Poland',
    'Cinematic Web Experiences',
    'High-End Web Development',
    'Performance Optimization',
  ],
  authors: [{ name: 'Sebastian Kolbusz' }],
  creator: 'Sebastian Kolbusz',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    url: SITE_ORIGIN,
    siteName: 'Sebastian Kolbusz Portfolio',
    title: `Sebastian Kolbusz | ${SITE_ROLE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Sebastian Kolbusz | ${SITE_ROLE}`,
    description: SITE_DESCRIPTION,
    creator: SITE_TWITTER_HANDLE,
  },
  // the redesign is public at /v2 while it is finished, but kept out of search until it replaces the
  // old site at the root (owner, 2026-11-26)
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export const dynamicParams = false
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function V2Layout({ children, params }: Props) {
  const locale = await getLocaleFromParams(params)

  setRequestLocale(locale)
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SkipToMain />
            <nav className="sr-only" aria-label="Site navigation">
              <Link href="/" locale={locale}>
                Home
              </Link>
              <Link href="/projects" locale={locale}>
                Projects
              </Link>
              <Link href="/cv" locale={locale}>
                CV
              </Link>
              <Link href="/services" locale={locale}>
                Services
              </Link>
            </nav>
            <div id="page-content-start" tabIndex={-1} className="outline-none" />
            <ClientOverlays />
            {children}

            <RybbitAnalytics />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
