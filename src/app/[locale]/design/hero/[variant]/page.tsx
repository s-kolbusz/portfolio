import { setRequestLocale } from 'next-intl/server'
import { Bona_Nova } from 'next/font/google'
import { notFound } from 'next/navigation'

import {
  HERO_SAMPLE_VARIANTS,
  type HeroSampleVariant,
  isHeroFrameVariant,
} from '@/components/canvas/hero-samples/variants'
import { HeroAssembly } from '@/components/sections/hero-assembly'
import { HeroBlobLab } from '@/components/sections/hero-blob-lab'
import { HeroFrame } from '@/components/sections/hero-frame'
import { HeroSample } from '@/components/sections/hero-sample'
import { requireRoutingLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

// Candidate display face for the hero (the owner's pick to try); loaded only on this route.
const bonaNova = Bona_Nova({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-hero-display',
  display: 'swap',
})

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
  blob: 'Blob z produkcji: strojenie',
  zlozenie: 'Złożenie: materia rozbiera rzeczy na części',
  materia: 'Materia próbuje kształtów',
  okno: 'Pod powierzchnią',
  czynniki: 'Rozkładam na czynniki',
  'kadr-imie': 'Kadr 1: największe jest imię',
  'kadr-slowa': 'Kadr 2: największe są słowa',
  'kadr-materia': 'Kadr 3: największa jest materia',
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
    <main id="main-content" className={`flex min-h-screen flex-col ${bonaNova.variable}`}>
      {variant === 'blob' ? (
        <HeroBlobLab />
      ) : variant === 'zlozenie' ? (
        <HeroAssembly />
      ) : isHeroFrameVariant(variant) ? (
        <HeroFrame variant={variant} />
      ) : (
        <HeroSample key={variant} variant={variant} />
      )}
      <nav
        id="probki-hero"
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
