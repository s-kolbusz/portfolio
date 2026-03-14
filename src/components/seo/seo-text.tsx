'use client'

import { useState, useRef } from 'react'

import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/cn'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

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
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current) return

    if (isOpen) {
      const height = contentRef.current.offsetHeight || 0
      gsap.to(containerRef.current, {
        height,
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.out,
        onComplete: () => {
          ScrollTrigger.refresh()
        },
      })
    } else {
      gsap.to(containerRef.current, {
        height: 0,
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.inOut,
        onComplete: () => {
          ScrollTrigger.refresh()
        },
      })
    }
  }, [isOpen])

  return (
    <section className={cn('border-border/40 flex flex-col gap-4 border-t py-8', className)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-xl font-light tracking-tight sm:text-2xl">{title}</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group text-primary hover:text-primary/80 flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors"
          aria-expanded={isOpen}
          aria-controls={`seo-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
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

      <div
        ref={containerRef}
        id={`seo-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="h-0 overflow-hidden"
      >
        <div ref={contentRef} className="pt-4 pb-8">
          <div className="prose prose-sm prose-neutral dark:prose-invert text-muted-foreground max-w-none font-sans text-base leading-relaxed sm:text-lg">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
