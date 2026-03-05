import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/ClientOverlays'
import { SkipToMain } from '@/components/ui/SkipToMain'
import enMessages from '@/i18n/messages/en.json'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

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

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${satoshi.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={routing.defaultLocale} messages={enMessages}>
            <SkipToMain locale="en" />
            <div id="page-content-start" tabIndex={-1} className="outline-none" />
            <ClientOverlays />
            <main
              id="main-content"
              className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans"
            >
              <h1 className="mb-4 font-serif text-6xl">{enMessages.notFound.title}</h1>
              <h2 className="mb-8 font-mono text-2xl">{enMessages.notFound.subtitle}</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                {enMessages.notFound.description}
              </p>
              <Link
                href="/"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors"
              >
                {enMessages.notFound.returnHome}
              </Link>
            </main>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
