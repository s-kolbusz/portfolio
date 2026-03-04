import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

import { ThemeProvider } from '@/components/theme-provider'
import { ClientOverlays } from '@/components/ui/ClientOverlays'
import { SkipToMain } from '@/components/ui/SkipToMain'
import { routing } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children }: Props) {
  const messages = await getMessages()

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider messages={messages}>
        <SkipToMain />
        <ClientOverlays />
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
