import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import {
  HERO_SAMPLE_VARIANTS,
  type HeroSampleVariant,
} from '@/components/canvas/hero-samples/variants'
import { HeroAssembly } from '@/components/sections/hero-assembly'
import { HeroSample } from '@/components/sections/hero-sample'
import { requireRoutingLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ locale: string; variant: string }>
}

export const dynamicParams = false
export const dynamic = 'force-static'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    HERO_SAMPLE_VARIANTS.map((variant) => ({ locale, variant }))
  )
}

const TITLES: Record<HeroSampleVariant, string> = {
  zlozenie: 'Złożenie: materia rozbiera rzeczy na części',
  materia: 'Materia próbuje kształtów',
  okno: 'Pod powierzchnią',
  czynniki: 'Rozkładam na czynniki',
}

/**
 * Hero story samples for the owner to choose between (noindex via the design
 * layout). See docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 */
export default async function HeroSamplePage({ params }: Props) {
  const { locale: localeParam, variant: variantParam } = await params
  const locale = requireRoutingLocale(localeParam)
  setRequestLocale(locale)
  const variant = HERO_SAMPLE_VARIANTS.find((candidate) => candidate === variantParam)
  if (!variant) notFound()

  return (
    <main id="main-content" className="flex min-h-screen flex-col">
      {variant === 'zlozenie' ? <HeroAssembly /> : <HeroSample key={variant} variant={variant} />}
      <nav
        aria-label="Próbki hero"
        className="flex flex-col gap-3 px-6 py-16 font-mono text-xs tracking-widest uppercase md:px-12"
      >
        <p className="text-muted-foreground">Próbki hero</p>
        {HERO_SAMPLE_VARIANTS.map((candidate, index) => (
          <Link
            key={candidate}
            href={`/design/hero/${candidate}`}
            aria-current={candidate === variant ? 'page' : undefined}
            className="aria-[current=page]:text-primary underline-offset-4 hover:underline"
          >
            {index + 1}. {TITLES[candidate]}
          </Link>
        ))}
      </nav>
    </main>
  )
}
