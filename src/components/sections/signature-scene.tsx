'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowUpRightIcon } from '@phosphor-icons/react'

import {
  mixColour,
  readoutOpacity,
  toHex,
  type ReadoutKey,
} from '@/components/canvas/viscous-puddle/choreography'
import { subscribeSignature } from '@/components/canvas/viscous-puddle/signature-bus'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { useTimeline } from '@/hooks/timeline'
import { useIsMobile } from '@/hooks/use-media'

// Right-hand readouts in the order they retire (leftmost first), so one
// leaving never shifts the ones still showing.
const READOUTS: ReadoutKey[] = ['target', 'aspect', 'viscosity', 'colour', 'solidified']

/**
 * First scene after the hero, where the hero blob sets into stronypodhale.pl.
 * Script: docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
 *
 * A tall track pins the stage for 2.5 screens (1.5 on phones) while the blob
 * canvas (`ViscousPuddle`) plays the transformation and reports its state for
 * the mono readouts. The frame here holds the real image; it stays fully
 * visible unless the canvas drives `--signature-reveal`. With reduced motion
 * or without WebGL the pin collapses and the scene is a plain section.
 * The heading enters after the pin with the site's usual reveal.
 */
export function SignatureScene() {
  const t = useTranslations('signature')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLDivElement>(null)
  const readoutRefs = useRef<Partial<Record<ReadoutKey, HTMLSpanElement | null>>>({})
  const isMobile = useIsMobile()

  useTimeline(sectionRef, { id: 'work' }, (reveal) => {
    reveal(headerRef)
    reveal(linkRef, { self: true })
  })

  // Readouts are written straight to the DOM every frame, not through React.
  useEffect(() => {
    const labels: Record<Exclude<ReadoutKey, 'target'>, string> = {
      viscosity: t('readouts.viscosity'),
      aspect: t('readouts.aspect'),
      colour: t('readouts.colour'),
      solidified: t('readouts.solidified'),
    }

    return subscribeSignature((frame) => {
      const elements = readoutRefs.current
      if (!frame) {
        for (const key of READOUTS) {
          const element = elements[key]
          if (!element) continue
          element.style.opacity = '0'
          if (key !== 'target') element.style.display = 'none'
        }
        return
      }

      const { step, startColour, targetColour } = frame
      const opacity = readoutOpacity(step.progress, isMobile)
      const values: Record<Exclude<ReadoutKey, 'target'>, string> = {
        viscosity: step.viscosity.toFixed(2),
        aspect: `${(step.halfWidth / step.halfHeight).toFixed(2)}:1`,
        colour: toHex(mixColour(startColour, targetColour, step.solid)),
        solidified: `${Math.round(step.front * 100)}%`,
      }

      for (const key of READOUTS) {
        const element = elements[key]
        if (!element) continue
        element.style.opacity = opacity[key].toFixed(3)
        if (key === 'target') continue
        element.style.display = opacity[key] > 0 ? '' : 'none'
        element.textContent = `${labels[key]} ${values[key]}`
      }
    })
  }, [t, isMobile])

  return (
    <section ref={sectionRef} id="work" className="w-full">
      <div
        data-signature-track
        className="relative h-[350svh] data-signature-static:h-auto motion-reduce:h-auto max-md:h-[250svh]"
      >
        {/* Where the pin ends: the hero CTA scrolls here so the whole transformation plays. */}
        <div
          id="work-formed"
          aria-hidden="true"
          className="pointer-events-none absolute left-0 h-px w-px"
          style={{ top: 'calc(100% - 100svh)' }}
        />

        <div
          data-signature-stage
          className="sticky top-0 flex h-svh w-full items-center justify-center px-6 in-data-signature-static:static in-data-signature-static:h-auto in-data-signature-static:pt-24 motion-reduce:static motion-reduce:h-auto motion-reduce:pt-24 lg:px-24"
        >
          <div className="relative w-full max-w-[min(96rem,calc(70svh*16/9))]">
            <div
              aria-hidden="true"
              className="absolute bottom-full left-0 mb-4 flex w-full items-end justify-between gap-6 font-mono text-xs tracking-widest uppercase md:mb-6"
            >
              <span
                ref={(element) => {
                  readoutRefs.current.target = element
                }}
                className="text-primary whitespace-nowrap"
                style={{ opacity: 0 }}
              >
                01 — {t('title')}
              </span>
              <span className="text-muted-foreground flex flex-col items-end gap-1 tabular-nums md:flex-row md:gap-8">
                {READOUTS.filter((key) => key !== 'target').map((key) => (
                  <span
                    key={key}
                    ref={(element) => {
                      readoutRefs.current[key] = element
                    }}
                    className="whitespace-nowrap"
                    style={{ opacity: 0, display: 'none' }}
                  />
                ))}
              </span>
            </div>

            <div
              data-signature-frame
              className="relative aspect-video w-full overflow-hidden rounded-2xl"
            >
              <Image
                src="/images/projects/stronypodhale.avif"
                alt={t('alt')}
                fill
                sizes="(min-width: 1536px) 1536px, 100vw"
                className="object-cover"
                style={{ opacity: 'var(--signature-reveal, 1)' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-col gap-10 px-6 pt-16 pb-24 lg:gap-16 lg:px-24 lg:pb-32">
        <EditorialHeader
          ref={headerRef}
          tagline={t('tagline')}
          title={t('title')}
          subtitle={t('description')}
          titleClassName="text-4xl sm:text-5xl"
        />
        <div ref={linkRef} className="flex justify-center md:justify-end">
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
      </div>
    </section>
  )
}
