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
  const stageRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const stageElement = stageRef.current
    const caption = captionRef.current
    if (!section || !canvas || !stageElement || !caption) return

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

      // The text is uncovered as the sheet drains past it; after that it does not move.
      if (!textShown && time > 0.2) {
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

  // The first word goes above the object, the rest below it.
  const [first, ...others] = name.split(' ')
  const rest = others.join(' ')

  return (
    <section
      ref={sectionRef}
      data-hero-sample="zlozenie"
      className="text-foreground relative h-svh w-full touch-pan-y overflow-hidden select-none"
    >
      <noscript>
        <style>{`[data-line], [data-rise] { translate: none !important; opacity: 1 !important; }`}</style>
      </noscript>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      />

      {/*
        One unit: the name frames the object (first word above it, second
        below), so the two never compete. Under it, one block on one edge:
        a rule, role and what the matter is now, the sentence, the action.
        Spacing is on a 4 px scale: 12 around the object, 20 to the rule,
        12 between lines, 16 to the action.
      */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-[max(1440px,178svh)] flex-col px-6 pt-[88px] pb-28 md:grid md:grid-cols-12 md:grid-rows-[auto_1fr_auto] md:gap-x-6 md:pt-24 md:pr-48 md:pb-20 md:pl-12">
        <h1
          aria-label={name}
          className="contents text-[15.5vw] leading-none font-normal tracking-[-0.015em] md:text-[min(8.6vw,16svh)]"
          style={{ fontFamily: 'var(--font-hero-display), var(--font-serif), serif' }}
        >
          <span
            aria-hidden="true"
            className="order-1 block overflow-hidden pb-[0.1em] md:col-span-7 md:col-start-1 md:row-start-1"
          >
            <span data-line className="block translate-y-[115%] will-change-transform">
              {first}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="order-3 block overflow-hidden pb-[0.1em] text-right md:col-span-5 md:col-start-8 md:row-start-3 md:self-end"
          >
            <span data-line className="block translate-y-[115%] will-change-transform">
              {rest}
            </span>
          </span>
        </h1>

        {/* The object: a square on the grid; the matter is drawn into it. */}
        <div
          ref={stageRef}
          className="order-2 mx-auto my-3 aspect-square w-full max-w-[min(100%,34svh)] md:col-span-5 md:col-start-5 md:row-span-3 md:row-start-1 md:my-0 md:max-w-[52svh] md:self-center"
        />

        <div className="order-4 mt-5 flex flex-col md:col-span-4 md:col-start-1 md:row-start-3 md:mt-0 md:self-end">
          <div
            data-rise
            className="border-foreground/20 flex translate-y-3 items-baseline justify-between gap-4 border-t pt-3 text-[15px] leading-tight opacity-0 md:text-[clamp(1rem,1.9svh,1.5rem)]"
          >
            <p className="font-medium">{t('role')}</p>
            <span ref={captionRef} className="text-right opacity-0" />
          </div>
          <p
            data-rise
            className="text-muted-foreground mt-3 max-w-[38ch] translate-y-3 text-[15px] leading-snug opacity-0 md:text-[clamp(1rem,1.9svh,1.5rem)]"
          >
            {t('tagline')}
          </p>
          <a
            data-rise
            href="#probki-hero"
            className="border-foreground/25 hover:bg-foreground hover:text-background pointer-events-auto mt-4 inline-flex h-11 translate-y-3 items-center gap-2 self-start rounded-full border px-5 text-[15px] font-medium opacity-0 transition-colors md:mt-[clamp(1rem,2.2svh,1.75rem)] md:h-[clamp(2.75rem,5svh,3.75rem)] md:px-[clamp(1.25rem,2.4svh,2rem)] md:text-[clamp(0.95rem,1.8svh,1.4rem)]"
          >
            {t('cta')}
            <ArrowDownIcon aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
