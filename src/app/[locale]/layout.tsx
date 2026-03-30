import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { JsonLd } from '@/components/seo/json-ld'
import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/client-overlays'
import { SkipToMain } from '@/components/ui/skip-to-main'
import { getLocaleFromParams } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import {
  SITE_ORIGIN,
  SITE_SOCIAL_IMAGE_ALT,
  SITE_SOCIAL_IMAGE_PATH,
  SITE_TWITTER_HANDLE,
} from '@/lib/site'

import '../globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const satoshi = localFont({
  src: [
    {
      path: '../../fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '300 900',
    },
    {
      path: '../../fonts/Satoshi-VariableItalic.woff2',
      style: 'italic',
      weight: '300 900',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
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
    default: 'Sebastian Kolbusz | Senior Frontend Engineer',
    template: '%s | Sebastian Kolbusz',
  },
  description:
    'Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.',
  keywords: [
    'Sebastian Kolbusz',
    'Senior Frontend Engineer',
    'Next.js Specialist',
    'Web Architect',
    'Programista Zakopane',
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
    locale: 'en_US',
    url: SITE_ORIGIN,
    siteName: 'Sebastian Kolbusz Portfolio',
    title: 'Sebastian Kolbusz | Senior Frontend Engineer',
    description:
      'Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.',
    images: [
      {
        url: SITE_SOCIAL_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sebastian Kolbusz | Senior Frontend Engineer',
    description:
      'Senior Frontend Engineer in Zakopane building fast Next.js websites, SaaS interfaces, and polished digital experiences for ambitious brands.',
    images: [SITE_SOCIAL_IMAGE_PATH],
    creator: SITE_TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const dynamicParams = false
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await getLocaleFromParams(params)
  const shouldLoadVercelInsights =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'

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
          enableSystem
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

            {shouldLoadVercelInsights ? (
              <>
                <SpeedInsights />
                <Analytics />
              </>
            ) : null}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
