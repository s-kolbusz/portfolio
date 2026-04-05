'use client'

import { useEffect, useRef, useState } from 'react'

import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/cn'
import { ScrollTrigger } from '@/lib/gsap-scroll'

interface SEOTextProps {
  title: string
  children: React.ReactNode
  className?: string
  /** Label for the toggle button */
  buttonLabel?: string
  /** Whether the section should be open by default */
  defaultOpen?: boolean
}

/**
 * SEOText — A progressive disclosure component for long-form, keyword-rich content.
 * Allows including 300-500 words for SEO without cluttering the cinematic UI.
 */
export function SEOText({
  title,
  children,
  className,
  buttonLabel = 'Read Strategy Details',
  defaultOpen = false,
}: SEOTextProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const containerRef = useRef<HTMLDivElement>(null)
  const seoContentId = `seo-content-${title.replace(/\s+/g, '-').toLowerCase()}`

  // Refresh ScrollTrigger after the CSS transition ends so scroll-triggered
  // animations below this section recalculate their offsets correctly.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = () => ScrollTrigger.refresh()
    el.addEventListener('transitionend', handler)
    return () => el.removeEventListener('transitionend', handler)
  }, [])

  return (
    <section className={cn('border-border/40 flex flex-col gap-4 border-t py-8', className)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-xl font-light tracking-tight sm:text-2xl">{title}</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group text-primary hover:text-primary/80 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
          aria-expanded={isOpen}
          aria-controls={seoContentId}
        >
          {buttonLabel}
          <CaretDownIcon
            weight="bold"
            className={cn('size-3 transition-transform duration-300', {
              'rotate-180': isOpen,
            })}
          />
        </button>
      </div>

      {/* CSS grid-template-rows transition — no JS animation on every frame */}
      <div
        ref={containerRef}
        id={seoContentId}
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        className="grid overflow-hidden transition-[grid-template-rows] duration-600 ease-in-out"
      >
        <div className="min-h-0">
          <div className="prose prose-sm prose-neutral dark:prose-invert text-muted-foreground max-w-none font-sans text-base leading-relaxed sm:text-lg">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
