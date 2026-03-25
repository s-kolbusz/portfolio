'use client'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { ArrowRightIcon, ArrowSquareOutIcon } from '@phosphor-icons/react'

import type { PortfolioEntry } from '@/data/projects'
import { Link } from '@/i18n/navigation'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap'

interface BookSpreadProps {
  entry: PortfolioEntry
  index: number
}

export function BookSpread({ entry, index }: BookSpreadProps) {
  const t = useTranslations('projectsBook')
  const panelRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!panelRef.current) return
      const tl = gsap.timeline({ paused: true })

      tl.fromTo(
        '[data-spread-number]',
        { y: 30, opacity: 0, pointerEvents: 'none' },
        {
          y: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.medium,
          ease: ANIMATION.ease.outStrong,
        }
      )

      tl.fromTo(
        '[data-spread-title]',
        { y: 20, opacity: 0, pointerEvents: 'none' },
        {
          y: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.medium,
          ease: ANIMATION.ease.outStrong,
        },
        '-=0.7'
      )

      tl.fromTo(
        '[data-spread-subtitle]',
        { y: 15, opacity: 0, pointerEvents: 'none' },
        {
          y: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.fast,
          ease: ANIMATION.ease.out,
        },
        '-=0.5'
      )

      tl.fromTo(
        panelRef.current.querySelectorAll('[data-spread-pill]'),
        { opacity: 0, scale: 0.8, pointerEvents: 'none' },
        {
          opacity: 1,
          scale: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.fast,
          ease: ANIMATION.ease.outStrong,
          stagger: ANIMATION.stagger.tight,
        },
        '-=0.4'
      )

      tl.fromTo(
        '[data-spread-quote]',
        { x: -20, opacity: 0, pointerEvents: 'none' },
        {
          x: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.medium,
          ease: ANIMATION.ease.out,
        },
        '-=0.3'
      )

      tl.fromTo(
        panelRef.current.querySelectorAll('[data-spread-link]'),
        { y: 10, opacity: 0, pointerEvents: 'none' },
        {
          y: 0,
          opacity: 1,
          pointerEvents: 'auto',
          duration: ANIMATION.duration.fast,
          ease: ANIMATION.ease.out,
          stagger: ANIMATION.stagger.normal,
        },
        '-=0.6'
      )

      tl.fromTo(
        panelRef.current.querySelector('[data-spread-image]'),
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: ANIMATION.duration.slow,
          ease: ANIMATION.ease.outStrong,
        },
        0
      )

      // Use IntersectionObserver to trigger
      const observer = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            tl.play()
          } else {
            tl.reverse()
          }
        },
        { threshold: 0.5 }
      )

      observer.observe(panelRef.current)

      return () => observer.disconnect()
    },
    { scope: panelRef }
  )

  const displayNumber = String(index + 1).padStart(2, '0')
  const isRole = entry.type === 'role'

  return (
    <section
      ref={panelRef}
      className="flex h-dvh w-screen shrink-0 snap-start snap-always"
      aria-label={entry.title}
    >
      {/* Left column — editorial content */}
      <div className="flex w-[45%] flex-col justify-center gap-6 px-12 xl:px-16 2xl:px-20">
        {/* Number */}
        <span
          data-spread-number
          className="text-muted-foreground font-mono text-sm tracking-widest opacity-0"
        >
          {displayNumber}
        </span>

        {/* Title */}
        <h2
          data-spread-title
          className="font-serif text-4xl leading-tight font-light tracking-tight opacity-0 xl:text-5xl 2xl:text-6xl"
        >
          {entry.title}
        </h2>

        {/* Subtitle + badge */}
        <div data-spread-subtitle className="flex items-center gap-3 opacity-0">
          <p className="text-muted-foreground text-lg">{entry.subtitle}</p>
          {isRole && (
            <span className="bg-accent text-accent-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t('roleLabel')}
            </span>
          )}
        </div>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-2">
          {entry.techStack.map((tech) => (
            <span
              key={tech}
              data-spread-pill
              className="border-border bg-secondary text-secondary-foreground rounded-full border px-3 py-1 text-xs font-medium opacity-0"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Pull quote */}
        {entry.pullQuotes?.[0] && (
          <blockquote
            data-spread-quote
            className="border-primary/40 text-muted-foreground border-l-2 pl-4 font-serif text-base leading-relaxed italic opacity-0"
          >
            &ldquo;{entry.pullQuotes[0]}&rdquo;
          </blockquote>
        )}

        {/* Links */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href={`/projects/${entry.id}`}
            data-spread-link
            className="group text-primary hover:text-primary/80 inline-flex items-center gap-2 text-sm font-medium opacity-0 transition-colors"
          >
            {t('exploreLabel')}
            <ArrowRightIcon
              weight="bold"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>

          {entry.liveUrl && (
            <a
              href={entry.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-spread-link
              className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm opacity-0 transition-colors"
            >
              {t('visitSiteLabel')}
              <ArrowSquareOutIcon weight="duotone" className="size-4" />
            </a>
          )}
        </div>
      </div>

      {/* Right column — hero image */}
      <div className="relative w-[55%] overflow-hidden">
        {/* Book spine shadow — center crease effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-black/25 to-transparent" />
        <div className="bg-border/50 pointer-events-none absolute inset-y-0 left-0 z-10 w-px" />

        <div data-spread-image className="relative h-full w-full opacity-0">
          <Image
            src={entry.heroImage}
            alt={entry.title}
            fill
            sizes="55vw"
            className="object-cover"
            priority={index < 2}
          />

          {/* Category badge */}
          <div className="absolute top-8 right-8">
            <span className="bg-background/80 text-foreground rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {t(`categories.${entry.category}`)}
            </span>
          </div>

          {/* Year badge */}
          <div className="absolute right-8 bottom-8">
            <span className="text-foreground/60 font-mono text-sm">{entry.year}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
