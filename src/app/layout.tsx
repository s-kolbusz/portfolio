import type { Metadata, Viewport } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { JsonLd } from '@/components/seo/JsonLd'
import { routing } from '@/i18n/routing'
import { SITE_ORIGIN } from '@/lib/site'

import './globals.css'

const satoshi = localFont({
  src: [
    {
      path: '../fonts/Satoshi-Variable.woff2',
      style: 'normal',
      weight: '300 900',
    },
    {
      path: '../fonts/Satoshi-VariableItalic.woff2',
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
    default: 'Sebastian Kolbusz | Full-stack Developer',
    template: '%s | Sebastian Kolbusz',
  },
  description:
    'Portfolio of Sebastian Kolbusz - Full-stack developer and 3D printing enthusiast specializing in cinematic web experiences.',
  keywords: [
    'Sebastian Kolbusz',
    'Full-stack Developer',
    'Freelance Frontend Engineer',
    'SaaS Developer',
    'Portfolio',
    '3D Printing',
    'React',
    'Next.js',
    'GSAP',
    'Three.js',
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
    url: `${SITE_ORIGIN}/en`,
    siteName: 'Sebastian Kolbusz Portfolio',
    title: 'Sebastian Kolbusz | Full-stack Developer',
    description:
      'Full-stack developer and 3D printing enthusiast specializing in cinematic web experiences.',
    images: [
      {
        url: '/images/sebastian_kolbusz_caricature.avif',
        width: 1200,
        height: 630,
        alt: 'Sebastian Kolbusz Caricature',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sebastian Kolbusz | Full-stack Developer',
    description:
      'Full-stack developer and 3D printing enthusiast specializing in cinematic web experiences.',
    images: ['/images/sebastian_kolbusz_caricature.avif'],
    creator: '@s-kolbusz',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <JsonLd />
        {children}

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
