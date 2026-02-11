import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import CustomCursor from '@/components/ui/CustomCursor'
import { DockNav } from '@/components/ui/DockNav'
import { SettingsDock } from '@/components/ui/SettingsDock'
import { SmoothScroller } from '@/components/ui/SmoothScroller'
import { routing } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as 'en' | 'pl')) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for the current locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <CustomCursor />
      <SmoothScroller />
      <SettingsDock />
      <DockNav />
      {children}
    </NextIntlClientProvider>
  )
}
