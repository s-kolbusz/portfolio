import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { HtmlLangSync } from '@/components/seo/html-lang-sync'
import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/client-overlays'
import { SkipToMain } from '@/components/ui/skip-to-main'
import { getLocaleFromParams } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const dynamicParams = false
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = await getLocaleFromParams(params)

  setRequestLocale(locale)
  const messages = await getMessages({ locale })

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HtmlLangSync />
        <SkipToMain />
        <nav className="sr-only" aria-label="Site navigation">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/cv">CV</Link>
          <Link href="/services">Services</Link>
        </nav>
        <div id="page-content-start" tabIndex={-1} className="outline-none" />
        <ClientOverlays />
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
