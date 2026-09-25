import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import type { Locale } from '@/i18n/routing'

/**
 * First scene after the hero: the frame the hero blob pours into.
 *
 * Server-rendered so the content is in the HTML whatever the animation does.
 * The image stays fully visible unless the blob canvas takes over and drives
 * `--signature-reveal` (see `ViscousPuddle`); without WebGL, JS or with
 * reduced motion nothing hides it.
 */
export async function SignatureScene({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'signature' })

  return (
    <section
      id="work"
      aria-labelledby="signature-scene-title"
      className="relative w-full px-6 py-24 md:py-32"
    >
      <div className="container mx-auto flex flex-col gap-6 md:gap-8">
        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          <span className="sr-only">{t('label')}: </span>
          {t('meta')}
        </p>

        <div
          data-signature-frame
          className="relative aspect-16/10 w-full overflow-hidden rounded-2xl md:aspect-video"
        >
          <Image
            src="/images/projects/stronypodhale.avif"
            alt={t('alt')}
            fill
            sizes="(min-width: 1536px) 1536px, 100vw"
            className="object-cover object-top-left"
            style={{ opacity: 'var(--signature-reveal, 1)' }}
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2
              id="signature-scene-title"
              className="font-serif text-4xl font-semibold tracking-tight md:text-6xl"
            >
              {t('title')}
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">{t('description')}</p>
          </div>
          <a
            href="https://stronypodhale.pl"
            target="_blank"
            rel="noopener"
            className="text-foreground hover:text-primary shrink-0 font-mono text-sm tracking-widest uppercase transition-colors"
          >
            {t('link')} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}
