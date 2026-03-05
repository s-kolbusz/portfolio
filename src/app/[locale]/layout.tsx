import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { ThemeProvider } from '@/components/ThemeProvider'
import { ClientOverlays } from '@/features/navigation/overlays/ClientOverlays'
import { getLocaleFromParams } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { HtmlLangSync } from '@/shared/ui/HtmlLangSync'
import { SkipToMain } from '@/shared/ui/SkipToMain'

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
