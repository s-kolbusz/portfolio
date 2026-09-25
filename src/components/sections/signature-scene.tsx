'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowUpRightIcon } from '@phosphor-icons/react'

import {
  HEADING_AT,
  mixColour,
  readoutOpacity,
  toHex,
  type ReadoutKey,
} from '@/components/canvas/viscous-puddle/choreography'
import { subscribeSignature } from '@/components/canvas/viscous-puddle/signature-bus'
import { Button } from '@/components/ui/button'
import { EditorialHeader } from '@/components/ui/editorial-header'
import { REVEAL } from '@/hooks/timeline/reveal-engine'
import { useIsMobile } from '@/hooks/use-media'
import { gsap } from '@/lib/gsap-core'

// Right-hand readouts in the order they retire (leftmost first), so one
// leaving never shifts the ones still showing.
const READOUTS: ReadoutKey[] = ['target', 'aspect', 'viscosity', 'colour', 'clarity']

/**
 * First scene after the hero, where the hero blob sets into stronypodhale.pl.
 * Script: docs/design/2026-09-25-przejscie-sygnaturowe-scenariusz.md
 *
 * A tall track pins the stage for 2.5 screens (1.5 on phones) while the blob
 * canvas (`ViscousPuddle`) plays the transformation and reports its state for
 * the mono readouts. Heading, image and link are one frame: once the page
 * has formed, the readouts give way and the heading enters in their place
 * with the site's usual reveal, still inside the pin.
 *
 * The image stays fully visible unless the canvas drives
 * `--signature-reveal`, and the heading is visible unless the canvas is
 * running, so with reduced motion or without WebGL (where the pin also
 * collapses) the scene is a plain section.
 */
export function SignatureScene() {
  const t = useTranslations('signature')
  const headerRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLDivElement>(null)
  const readoutRefs = useRef<Partial<Record<ReadoutKey, HTMLSpanElement | null>>>({})
  const isMobile = useIsMobile()

  // The heading's entrance: the same motion as every section reveal on the
  // site, but played when the pin reaches the heading beat instead of on a
  // scroll position, and reversed when scrolling back.
  useEffect(() => {
    const header = headerRef.current
    const link = linkRef.current
    if (!header || !link) return

    const heading = gsap.timeline({ paused: true }).fromTo(
      [...Array.from(header.children), link],
      { y: REVEAL.y, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        // Stay visible until the canvas reports in: reduced motion and
        // no-WebGL visitors never get a frame and must still see the heading.
        immediateRender: false,
        duration: REVEAL.duration,
        ease: REVEAL.ease,
        stagger: REVEAL.stagger,
      }
    )
    let shown: boolean | null = null

    const unsubscribe = subscribeSignature((frame) => {
      const show = !frame || frame.step.progress >= HEADING_AT
      if (show === shown) return
      // First frame: jump straight to the right state instead of animating.
      if (shown === null || !frame) heading.progress(show ? 1 : 0).pause()
      else if (show) heading.play()
      else heading.reverse()
      shown = show
    })

    return () => {
      unsubscribe()
      heading.kill()
      gsap.set([...Array.from(header.children), link], { clearProps: 'transform,opacity' })
    }
  }, [])

  // Readouts are written straight to the DOM every frame, not through React.
  useEffect(() => {
    const labels: Record<Exclude<ReadoutKey, 'target'>, string> = {
      viscosity: t('readouts.viscosity'),
      aspect: t('readouts.aspect'),
      colour: t('readouts.colour'),
      clarity: t('readouts.clarity'),
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
        clarity: `${Math.round(step.clarity * 100)}%`,
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
    <section id="work" className="w-full">
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
          className="sticky top-0 flex h-svh w-full flex-col justify-center px-6 pt-20 pb-10 in-data-signature-static:static in-data-signature-static:h-auto in-data-signature-static:py-24 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24 lg:px-24"
        >
          <div className="mx-auto flex w-full max-w-[min(96rem,calc((100svh-22rem)*16/9))] flex-col gap-6 md:gap-8">
            <div className="relative">
              {/* Readouts narrate the forming in the spot the heading will take. */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 font-mono text-xs tracking-widest uppercase"
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

              <EditorialHeader
                ref={headerRef}
                tagline={t('tagline')}
                title={t('title')}
                subtitle={t('description')}
                className="gap-4 md:flex-col md:items-start md:justify-start md:gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-8"
                titleClassName="text-4xl sm:text-5xl"
                subtitleClassName="text-base md:text-left md:text-lg xl:text-right"
              />
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

            {/* Left on phones: the droplet rests below the image's right corner there. */}
            <div ref={linkRef} className="flex md:justify-end">
              <Button
                href="https://stronypodhale.pl"
                target="_blank"
                variant="ghost"
                className="group -ml-4 font-mono text-sm tracking-widest uppercase hover:bg-transparent md:-mr-4 md:ml-0"
                rightIcon={
                  <ArrowUpRightIcon className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                }
              >
                {t('link')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
