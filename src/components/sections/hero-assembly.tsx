'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowDownIcon } from '@phosphor-icons/react'

import { createMatterRenderer } from '@/components/canvas/hero-samples/matter-renderer'
import { createStory } from '@/components/canvas/hero-samples/matter-story'
import { rasterise, THINGS } from '@/components/canvas/hero-samples/things'
import { usePrefersReducedMotion } from '@/hooks/use-media'

/**
 * Hero sample "Złożenie" (not production): the matter comes apart into drops
 * and the drops set into the exact parts of a thing the owner makes.
 * docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 *
 * One grid, one object, one block of text. Only the matter is irregular.
 */

function readPrimaryRgb(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim()
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts as [number, number, number]
  }
  return [0.494, 0.773, 0.557]
}

/** The site's curve: a quick start and a long settle. */
const SETTLE = 'cubic-bezier(0.35, 0, 0, 1)'

export function HeroAssembly() {
  const t = useTranslations('hero')
  const name = t('name')
  const prefersReducedMotion = usePrefersReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const cover = coverRef.current
    const stageElement = stageRef.current
    const caption = captionRef.current
    if (!section || !canvas || !cover || !stageElement || !caption) return

    const lines = Array.from(section.querySelectorAll<HTMLElement>('[data-line]'))
    const rises = Array.from(section.querySelectorAll<HTMLElement>('[data-rise]'))
    const showText = (animated: boolean) => {
      lines.forEach((line, index) => {
        // Tailwind's translate utilities set the `translate` property, not `transform`.
        line.style.transition = animated ? `translate 1.1s ${SETTLE} ${index * 0.09}s` : ''
        line.style.translate = 'none'
      })
      rises.forEach((element, index) => {
        element.style.transition = animated
          ? `opacity 0.9s ${SETTLE} ${0.25 + index * 0.08}s, translate 0.9s ${SETTLE} ${0.25 + index * 0.08}s`
          : ''
        element.style.opacity = '1'
        element.style.translate = 'none'
      })
    }
    const fallback = () => {
      cover.style.display = 'none'
      showText(false)
      caption.textContent = THINGS[0]?.caption ?? ''
      caption.style.opacity = '1'
    }

    const renderer = prefersReducedMotion ? null : createMatterRenderer(canvas)
    if (!renderer) {
      fallback()
      return
    }

    const layoutOf = () => {
      const bounds = section.getBoundingClientRect()
      const stage = stageElement.getBoundingClientRect()
      return {
        width: bounds.width,
        height: bounds.height,
        stage: { x: stage.left - bounds.left, y: stage.top - bounds.top, size: stage.width },
      }
    }
    let layout = layoutOf()
    const mobile = layout.width < 768
    const count = mobile ? 1500 : 2600
    const things = THINGS.map((thing) => rasterise(thing, count))
    const story = createStory({ count, ballCount: mobile ? 34 : 60, things, layout })
    const color = readPrimaryRgb()

    const resize = () => {
      layout = layoutOf()
      renderer.resize(layout.width, layout.height, Math.min(window.devicePixelRatio, 2))
      story.resize(layout)
    }
    resize()
    renderer.setMask(things[0]!.mask)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(section)

    const pointer = { x: 0, y: 0, active: false, releaseAt: 0 }
    const place = (clientX: number, clientY: number) => {
      const bounds = section.getBoundingClientRect()
      pointer.x = clientX - bounds.left
      pointer.y = clientY - bounds.top
      pointer.active = true
      pointer.releaseAt = Infinity
    }
    const onMouseMove = (event: MouseEvent) => place(event.clientX, event.clientY)
    const onMouseLeave = () => {
      pointer.releaseAt = 0
    }
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) place(touch.clientX, touch.clientY)
    }
    const onTouchEnd = () => {
      pointer.releaseAt = performance.now() + 700
    }
    let tapped = false
    const onClick = () => {
      tapped = true
    }
    section.addEventListener('mousemove', onMouseMove, { passive: true })
    section.addEventListener('mouseleave', onMouseLeave)
    section.addEventListener('touchstart', onTouch, { passive: true })
    section.addEventListener('touchmove', onTouch, { passive: true })
    section.addEventListener('touchend', onTouchEnd)
    section.addEventListener('click', onClick)

    let onScreen = true
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
    })
    intersection.observe(section)

    let frame = 0
    let last = performance.now()
    let time = 0
    let textShown = false
    let captionThing = -1
    let captionShown = false

    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!onScreen) return
      time += delta
      if (pointer.active && performance.now() > pointer.releaseAt) pointer.active = false

      const step = story.step(delta, pointer, tapped)
      tapped = false
      if (step.changed) renderer.setMask(things[step.thing]!.mask)
      if (section.dataset.phase !== step.phase) section.dataset.phase = step.phase
      if (section.dataset.thing !== String(step.thing)) section.dataset.thing = String(step.thing)
      renderer.draw({ ...step, stage: layout.stage, color })
      if (cover.style.display !== 'none') cover.style.display = 'none'

      // The text is uncovered as the sheet drains past it; after that it does not move.
      if (!textShown && time > 0.95) {
        textShown = true
        showText(true)
      }
      // One caption: what the matter has become. It changes while the matter is liquid.
      // It stays through the liquid state and is replaced when the next thing starts to form.
      const named = step.phase === 'forming' || step.phase === 'hold'
      if (named && captionThing !== step.thing) {
        captionThing = step.thing
        const next = THINGS[step.thing]?.caption ?? ''
        caption.style.transition = `opacity 0.25s ${SETTLE}`
        caption.style.opacity = '0'
        window.setTimeout(
          () => {
            caption.textContent = next
            caption.style.transition = `opacity 0.7s ${SETTLE}`
            caption.style.opacity = '1'
          },
          captionShown ? 260 : 0
        )
        captionShown = true
      }
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      section.removeEventListener('mousemove', onMouseMove)
      section.removeEventListener('mouseleave', onMouseLeave)
      section.removeEventListener('touchstart', onTouch)
      section.removeEventListener('touchmove', onTouch)
      section.removeEventListener('touchend', onTouchEnd)
      section.removeEventListener('click', onClick)
      renderer.dispose()
    }
  }, [prefersReducedMotion])

  const words = name.split(' ')

  return (
    <section
      ref={sectionRef}
      data-hero-sample="zlozenie"
      className="text-foreground relative h-svh w-full touch-pan-y overflow-hidden select-none"
    >
      <noscript>
        <style>{`[data-hero-sample-cover] { display: none; } [data-line], [data-rise] { translate: none !important; opacity: 1 !important; }`}</style>
      </noscript>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      />

      <div className="pointer-events-none relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-cols-1 grid-rows-[auto_1fr_auto] px-6 pt-24 pb-28 md:grid-cols-12 md:grid-rows-1 md:gap-x-6 md:pt-24 md:pr-48 md:pb-24 md:pl-12">
        {/* The object: a square on the grid; the matter is drawn into it. */}
        <div className="md:col-span-6 md:col-start-7 md:row-start-1 md:flex md:flex-col md:justify-end">
          <div
            ref={stageRef}
            className="mx-auto aspect-square w-full max-w-[38svh] md:mr-0 md:max-w-[64svh]"
          />
          <div
            data-rise
            className="border-foreground/20 mx-auto mt-5 flex w-full max-w-[38svh] translate-y-3 items-center justify-between border-t pt-3 text-[15px] leading-none opacity-0 md:mr-0 md:max-w-[64svh] md:text-lg"
          >
            <span ref={captionRef} className="opacity-0" />
            <ArrowDownIcon aria-hidden="true" className="text-foreground/50 size-4" />
          </div>
        </div>

        <div className="hidden md:block" />

        {/* One block of text on one edge. */}
        <div className="row-start-3 flex flex-col md:col-span-6 md:col-start-1 md:row-start-1 md:justify-end">
          <h1
            aria-label={name}
            className="text-[15.5vw] leading-[0.95] font-normal tracking-[-0.015em] md:text-[min(9.4vw,8.6rem)]"
            style={{ fontFamily: 'var(--font-hero-display), var(--font-serif), serif' }}
          >
            {words.map((word) => (
              <span key={word} aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
                <span data-line className="block translate-y-[115%] will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <div className="mt-4 flex max-w-[36ch] flex-col gap-1.5 md:mt-6 md:gap-2">
            <p data-rise className="translate-y-3 text-base font-medium opacity-0 md:text-lg">
              {t('role')}
            </p>
            <p
              data-rise
              className="text-muted-foreground translate-y-3 text-base leading-snug opacity-0 md:text-lg"
            >
              {t('tagline')}
            </p>
          </div>
        </div>
      </div>

      {/* Server-rendered sheet: the page starts as matter, before any script runs. */}
      <div
        ref={coverRef}
        data-hero-sample-cover
        aria-hidden="true"
        className="absolute inset-0 z-20 motion-reduce:hidden"
        style={{ background: 'color(srgb var(--primary-rgb))' }}
      />
    </section>
  )
}
