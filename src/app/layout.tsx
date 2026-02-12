import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import { JsonLd } from '@/components/SEO/JsonLd'
import { ThemeProvider } from '@/components/theme-provider'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://kolbusz.xyz'),
  title: {
    default: 'Sebastian Kolbusz | Full-stack Developer',
    template: '%s | Sebastian Kolbusz',
  },
  description:
    'Portfolio of Sebastian Kolbusz - Full-stack developer and 3D printing enthusiast specializing in cinematic web experiences.',
  keywords: [
    'Sebastian Kolbusz',
    'Full-stack Developer',
    'Portfolio',
    '3D Printing',
    'React',
    'Next.js',
    'GSAP',
    'Three.js',
  ],
  authors: [{ name: 'Sebastian Kolbusz' }],
  creator: 'Sebastian Kolbusz',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kolbusz.xyz',
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
    creator: '@skolbusz',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <JsonLd />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
