'use client'

import { useCallback, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { StarIcon } from '@phosphor-icons/react'

import { type PortfolioEntry } from '@/data/projects-en'
import { useTimeline } from '@/hooks/timeline'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

interface BookTableOfContentsProps {
  entries: PortfolioEntry[]
  onNavigate: (index: number) => void
}

export function BookTableOfContents({ entries, onNavigate }: BookTableOfContentsProps) {
  const t = useTranslations('projectsBook')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  useTimeline(containerRef, { id: 'book-toc' }, (reveal) => {
    reveal(titleRef, {
      y: 30,
      duration: ANIMATION.duration.medium,
      ease: ANIMATION.ease.outStrong,
      delay: ANIMATION.delay.short,
    })
    reveal(listRef, {
      x: -20,
      y: 0,
      duration: ANIMATION.duration.fast,
      ease: ANIMATION.ease.out,
      stagger: ANIMATION.stagger.normal,
    })
  })

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id)
    if (previewRef.current) {
      gsap.to(previewRef.current, {
        opacity: id ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [])

  const hoveredEntry = entries.find((e) => e.id === hoveredId)

  return (
    <section
      ref={containerRef}
      className="flex h-dvh w-screen shrink-0 snap-start snap-always"
      aria-label={t('tocTitle')}
    >
      {/* Left — entry list */}
      <div className="flex w-1/2 flex-col justify-center px-12 xl:px-16 2xl:px-20">
        <div ref={titleRef}>
          <h1 className="mb-10 font-serif text-5xl font-light tracking-tight xl:text-6xl">
            {t('title')}
          </h1>

          <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <ol ref={listRef} className="divide-border/50 divide-y">
          {entries.map((entry, i) => (
            <li key={entry.id}>
              <button
                onClick={() => onNavigate(i + 1)}
                onMouseEnter={() => handleHover(entry.id)}
                onMouseLeave={() => handleHover(null)}
                className="group flex w-full items-baseline gap-5 py-4 text-left transition-all"
              >
                {/* Number */}
                <span className="text-muted-foreground/60 w-8 font-mono text-xs tracking-wider">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <span className="group-hover:text-primary flex-1 font-serif text-4xl font-light tracking-tight transition-all group-hover:translate-x-1">
                  {entry.title}
                </span>

                {/* Year */}
                <span className="text-muted-foreground/60 font-mono text-xs tracking-wider">
                  {entry.year}
                </span>

                {/* Category badge */}
                <span className="border-border/60 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                  {t(`categories.${entry.category}`)}
                </span>

                {/* Role icon */}
                {entry.type === 'role' && (
                  <StarIcon weight="duotone" className="text-primary size-4" />
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Right — preview image area */}
      <div className="bg-muted/30 relative flex w-1/2 items-center justify-center overflow-hidden">
        <div ref={previewRef} className="absolute inset-0 opacity-0 transition-opacity">
          {hoveredEntry && (
            <Image
              src={hoveredEntry.heroImage}
              alt={hoveredEntry.title}
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Fallback when nothing is hovered */}
        {!hoveredId && (
          <p className="text-muted-foreground/50 text-center font-serif text-xl italic">
            Hover a project to preview
          </p>
        )}
      </div>
    </section>
  )
}
