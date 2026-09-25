'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowUpRightIcon } from '@phosphor-icons/react'

import { BaseSection } from '@/components/ui/base-section'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { useTimeline } from '@/hooks/timeline'

/**
 * First scene after the hero: the mould the hero blob pours into.
 *
 * The frame is an empty hairline outline until the blob fills it; then the
 * real image fades in over the set shape. The image stays fully visible
 * unless the blob canvas takes over and drives `--signature-reveal` (see
 * `ViscousPuddle`), so without WebGL or with reduced motion nothing hides it.
 * The frame itself is never transformed: the blob measures it to land on it.
 */
export function SignatureScene() {
  const t = useTranslations('signature')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useTimeline(sectionRef, { id: 'work' }, (reveal) => {
    reveal(headerRef)
    reveal(frameRef, { self: true, y: 0 })
    reveal(footerRef, { self: true })
  })

  return (
    <BaseSection
      id="work"
      ref={sectionRef}
      className="bg-transparent"
      containerClassName="gap-10 lg:gap-16"
    >
      <EditorialHeader
        ref={headerRef}
        tagline={t('tagline')}
        title={t('title')}
        subtitle={t('description')}
        titleClassName="text-4xl sm:text-5xl"
      />

      <div
        ref={frameRef}
        data-signature-frame
        className="border-border relative aspect-16/10 w-full overflow-hidden rounded-2xl border md:aspect-video"
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

      <div ref={footerRef} className="flex justify-center md:justify-end">
        <Button
          href="https://stronypodhale.pl"
          target="_blank"
          variant="ghost"
          className="group font-mono text-sm tracking-widest uppercase hover:bg-transparent"
          rightIcon={
            <ArrowUpRightIcon className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          }
        >
          {t('link')}
        </Button>
      </div>
    </BaseSection>
  )
}
