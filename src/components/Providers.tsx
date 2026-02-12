'use client'

import { type IntlConfig, NextIntlClientProvider } from 'next-intl'

import { ThemeProvider } from '@/components/theme-provider'

interface ProvidersProps {
  children: React.ReactNode
  messages: IntlConfig['messages']
  locale: string
}

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
