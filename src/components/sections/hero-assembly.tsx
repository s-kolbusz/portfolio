'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { ArrowDownIcon } from '@phosphor-icons/react'

import { createMatterRenderer } from '@/components/canvas/hero-samples/matter-renderer'
import { createStory, type StoryLayout } from '@/components/canvas/hero-samples/matter-story'
import { rasterise, rasteriseParts, THINGS } from '@/components/canvas/hero-samples/things'
import { usePrefersReducedMotion } from '@/hooks/use-media'

/**
 * Hero sample "Złożenie" (not production): the matter comes in as drops from
 * beyond the frame; some gather into the blob, some build the letters of the
 * name. Then the blob takes apart the things the owner makes, one by one.
 * docs/design/2026-11-14-otwarcie-diagnoza-telefon.md, section 5.
 *
 * One unit: the name frames the object, almost centred and close to it, so
 * the blob covers and tugs at the letters as it moves. Under it, one block
 * of text on one edge.
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

    const words = Array.from(section.querySelectorAll<HTMLElement>('[data-word]'))
    const chars = Array.from(section.querySelectorAll<HTMLElement>('[data-char]'))
    const rises = Array.from(section.querySelectorAll<HTMLElement>('[data-rise]'))
    const showName = (animated: boolean) => {
      for (const word of words) {
        word.style.transition = animated ? `opacity 0.8s ${SETTLE}` : ''
        word.style.opacity = '1'
      }
    }
    const showText = (animated: boolean) => {
      rises.forEach((element, index) => {
        element.style.transition = animated
          ? `opacity 0.9s ${SETTLE} ${index * 0.09}s, translate 0.9s ${SETTLE} ${index * 0.09}s`
          : ''
        element.style.opacity = '1'
        element.style.translate = 'none'
      })
    }
    const fallback = () => {
      showName(false)
      showText(false)
      caption.textContent = THINGS[0]?.caption ?? ''
      caption.style.opacity = '1'
    }

    const renderer = prefersReducedMotion ? null : createMatterRenderer(canvas)
    if (!renderer) {
      fallback()
      return
    }

    let disposed = false
    let cleanup = () => {}

    const start = () => {
      if (disposed) return
      const layoutOf = (): StoryLayout => {
        const bounds = section.getBoundingClientRect()
        const stage = stageElement.getBoundingClientRect()
        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity
        for (const word of words) {
          const box = word.getBoundingClientRect()
          left = Math.min(left, box.left)
          top = Math.min(top, box.top)
          right = Math.max(right, box.right)
          bottom = Math.max(bottom, box.bottom)
        }
        const pad = 8
        return {
          width: bounds.width,
          height: bounds.height,
          stage: { x: stage.left - bounds.left, y: stage.top - bounds.top, size: stage.width },
          name: {
            x: left - bounds.left - pad,
            y: top - bounds.top - pad,
            width: right - left + pad * 2,
            height: bottom - top + pad * 2,
          },
        }
      }
      let layout = layoutOf()
      const mobile = layout.width < 768
      const count = mobile ? 1700 : 2800

      // The letters, drawn exactly where the real text stands, so the matter
      // can set into them and the text can take over without a shift.
      const letters = (() => {
        const first = chars[0]
        if (!first || !words.length) return null
        const style = getComputedStyle(first)
        const fontSize = parseFloat(style.fontSize)
        const scale = Math.min(2, 1500 / Math.max(layout.name.width, layout.name.height))
        const font = `${style.fontStyle} ${style.fontWeight} ${fontSize * scale}px ${style.fontFamily}`
        const bounds = section.getBoundingClientRect()
        const parts = words.map((word) => (ctx: CanvasRenderingContext2D) => {
          ctx.font = font
          ctx.textBaseline = 'alphabetic'
          ctx.fillStyle = '#ffffff'
          const metrics = ctx.measureText('Hg')
          const ascent = metrics.fontBoundingBoxAscent
          const descent = metrics.fontBoundingBoxDescent
          for (const char of Array.from(word.querySelectorAll<HTMLElement>('[data-char]'))) {
            const box = char.getBoundingClientRect()
            const x = (box.left - bounds.left - layout.name.x) * scale
            const lineTop = (box.top - bounds.top - layout.name.y) * scale
            const baseline = lineTop + (box.height * scale - (ascent + descent)) / 2 + ascent
            ctx.fillText(char.textContent ?? '', x, baseline)
          }
        })
        const raster = rasteriseParts({
          width: Math.max(2, Math.round(layout.name.width * scale)),
          height: Math.max(2, Math.round(layout.name.height * scale)),
          parts,
          count: Math.round(count * 0.34),
        })
        return raster.coverage > 0.001 ? raster : null
      })()

      const things = THINGS.map((thing) => rasterise(thing, count))
      const story = createStory({
        count,
        ballCount: mobile ? 34 : 60,
        things,
        name: letters,
        layout,
      })
      const color = readPrimaryRgb()

      const resize = () => {
        layout = layoutOf()
        renderer.resize(layout.width, layout.height, Math.min(window.devicePixelRatio, 2))
        story.resize(layout)
      }
      resize()
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

      // Where each letter stands (for the blob's pull on it).
      let charPoints: Array<{ x: number; y: number }> = []
      const measureChars = () => {
        const bounds = section.getBoundingClientRect()
        charPoints = chars.map((char) => {
          const moved = char.style.translate
          char.style.translate = ''
          const box = char.getBoundingClientRect()
          char.style.translate = moved
          return {
            x: box.left - bounds.left + box.width / 2,
            y: box.top - bounds.top + box.height / 2,
          }
        })
      }
      measureChars()
      const charObserver = new ResizeObserver(measureChars)
      charObserver.observe(section)
      const fontSize = parseFloat(getComputedStyle(chars[0] ?? section).fontSize) || 60

      let frame = 0
      let last = performance.now()
      let nameShown = false
      let captionThing = -1
      let captionShown = false

      const render = (now: number) => {
        frame = requestAnimationFrame(render)
        const delta = Math.min((now - last) / 1000, 0.05)
        last = now
        if (!onScreen) return
        if (pointer.active && performance.now() > pointer.releaseAt) pointer.active = false

        const step = story.step(delta, pointer, tapped)
        tapped = false
        if (step.changed) {
          renderer.setMask(
            step.drawing === 'name' && letters ? letters.mask : things[step.thing]!.mask
          )
        }
        if (section.dataset.phase !== step.phase) section.dataset.phase = step.phase
        if (section.dataset.thing !== String(step.thing)) section.dataset.thing = String(step.thing)
        renderer.draw({ ...step, stage: step.rect, color })

        // The letters have set in matter: the real text takes over (it dries
        // to ink), and the rest of the text follows it in.
        if (!nameShown && step.inked) {
          nameShown = true
          showName(true)
          showText(true)
        }

        // The blob is the heavy body: letters it reaches lean towards it a little.
        if (nameShown) {
          chars.forEach((char, index) => {
            const point = charPoints[index]
            if (!point) return
            const dx = step.blob.x - point.x
            const dy = step.blob.y - point.y
            const distance = Math.hypot(dx, dy) || 1
            const reach = step.blob.radius * 1.5
            const near = Math.max(0, 1 - distance / reach)
            const pull = near * near * fontSize * 0.07
            char.style.translate =
              pull < 0.05
                ? ''
                : `${((dx / distance) * pull).toFixed(2)}px ${((dy / distance) * pull).toFixed(2)}px`
          })
        }

        // One caption: what the matter is becoming. It stays through the
        // liquid state and is replaced when the next thing starts to form.
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

      cleanup = () => {
        cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        charObserver.disconnect()
        intersection.disconnect()
        section.removeEventListener('mousemove', onMouseMove)
        section.removeEventListener('mouseleave', onMouseLeave)
        section.removeEventListener('touchstart', onTouch)
        section.removeEventListener('touchmove', onTouch)
        section.removeEventListener('touchend', onTouchEnd)
        section.removeEventListener('click', onClick)
      }
    }

    // The letters are drawn with the real font, so wait for it (briefly).
    void Promise.race([
      document.fonts.ready,
      new Promise((resolve) => window.setTimeout(resolve, 1200)),
    ]).then(start)

    return () => {
      disposed = true
      cleanup()
      renderer.dispose()
    }
  }, [prefersReducedMotion])

  // The first word goes above the object, the rest below it.
  const [first = '', ...others] = name.split(' ')
  const rest = others.join(' ')
  const letters = (word: string) =>
    word.split('').map((char, index) => (
      <span key={index} data-char className="inline-block will-change-[translate]">
        {char === ' ' ? ' ' : char}
      </span>
    ))

  return (
    <section
      ref={sectionRef}
      data-hero-sample="zlozenie"
      className="text-foreground relative h-svh w-full touch-pan-y overflow-hidden select-none"
    >
      <noscript>
        <style>{`[data-word], [data-rise] { translate: none !important; opacity: 1 !important; }`}</style>
      </noscript>
      {/* Above the name (the blob covers the letters it moves over), below the text block. */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 size-full"
        aria-hidden="true"
      />

      {/*
        The name and the object are one unit, stacked and almost centred:
        the first word a little to the left above the object, the second a
        little to the right below it, both overlapping its edge. Spacing in
        the text block is on a 4 px scale.
      */}
      <div className="pointer-events-none mx-auto flex h-full w-full max-w-[max(1440px,178svh)] flex-col px-6 pt-[84px] pb-28 md:pt-[max(5rem,8svh)] md:pr-48 md:pb-[max(4rem,7svh)] md:pl-12">
        <div className="flex flex-col items-center md:flex-1 md:justify-center">
          <h1
            aria-label={name}
            className="contents text-[15.5vw] leading-none font-normal tracking-[-0.015em] md:text-[min(8.6vw,15svh)]"
            style={{ fontFamily: 'var(--font-hero-display), var(--font-serif), serif' }}
          >
            <span
              data-word
              aria-hidden="true"
              className="order-1 block -translate-x-[7%] whitespace-nowrap opacity-0"
            >
              {letters(first)}
            </span>
            <span
              data-word
              aria-hidden="true"
              className="order-3 block translate-x-[9%] whitespace-nowrap opacity-0"
            >
              {letters(rest)}
            </span>
          </h1>

          {/* The object: a square on the grid; the matter is drawn into it. */}
          <div
            ref={stageRef}
            className="order-2 -my-[0.6vw] aspect-square w-full max-w-[min(100%,35svh)] md:-my-[min(0.4vw,0.8svh)] md:max-w-[50svh]"
          />
        </div>

        <div className="relative z-20 mt-5 flex flex-col md:absolute md:bottom-[max(4rem,7svh)] md:left-12 md:mt-0 md:w-[min(22vw,38svh)]">
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
