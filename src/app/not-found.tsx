import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import Link from 'next/link'

import { ClientOverlays } from '@/components/ui/ClientOverlays'
import enMessages from '@/i18n/en.json'
import { routing } from '@/i18n/routing'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Sebastian Kolbusz',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={enMessages}>
      <ClientOverlays />
      <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans">
        <h1 className="mb-4 font-serif text-6xl">{enMessages.notFound.title}</h1>
        <h2 className="mb-8 font-mono text-2xl">{enMessages.notFound.subtitle}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{enMessages.notFound.description}</p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 font-mono text-sm tracking-widest uppercase transition-colors"
        >
          {enMessages.notFound.returnHome}
        </Link>
      </div>
    </NextIntlClientProvider>
  )
}
