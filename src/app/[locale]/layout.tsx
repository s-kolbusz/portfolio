import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/ClientOverlays'
import { HtmlLangSync } from '@/components/ui/HtmlLangSync'
import { SkipToMain } from '@/components/ui/SkipToMain'
import { getLocaleFromParams } from '@/i18n/locale'
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
        <SkipToMain locale={locale} />
        <div id="page-content-start" tabIndex={-1} className="outline-none" />
        <ClientOverlays />
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
