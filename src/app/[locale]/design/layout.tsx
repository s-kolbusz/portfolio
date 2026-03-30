import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { getLocaleFromParams } from '@/i18n/locale'
import { buildStaticPageMetadata } from '@/lib/page-metadata'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = await getLocaleFromParams(props.params)

  const title = locale === 'pl' ? 'System projektowy' : 'Design System'
  const description =
    locale === 'pl'
      ? 'Wewnętrzny podgląd systemu projektowego dla portfolio Sebastiana Kolbusza.'
      : 'Internal design-system preview for the Sebastian Kolbusz portfolio.'

  return {
    ...buildStaticPageMetadata({
      locale,
      title,
      description,
      path: '/design',
    }),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }
}

export default function DesignLayout({ children }: { children: ReactNode }) {
  return children
}
