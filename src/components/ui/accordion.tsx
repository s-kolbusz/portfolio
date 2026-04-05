'use client'

import type { ReactNode } from 'react'
import { useRef, useState } from 'react'

import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/cn'
import { ANIMATION } from '@/lib/constants/animations'
import { gsap, useGSAP } from '@/lib/gsap-core'
import { ScrollTrigger } from '@/lib/gsap-scroll'

interface AccordionProps {
  id: string
  trigger: ReactNode
  children: ReactNode
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  onAnimationComplete?: () => void
  className?: string
  triggerClassName?: string
  contentClassName?: string
  hideIcon?: boolean
  ariaLabel?: string
}

export function Accordion({
  id,
  trigger,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  onAnimationComplete,
  className,
  triggerClassName,
  contentClassName,
  hideIcon = false,
  ariaLabel,
}: AccordionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<SVGSVGElement>(null)

  // Track initial render to prevent animation on mount
  const isFirstRender = useRef(true)

  const handleToggle = () => {
    const newState = !isOpen
    if (!isControlled) {
      setInternalIsOpen(newState)
    }
    onToggle?.(newState)
  }

  useGSAP(() => {
    if (!containerRef.current || !contentRef.current) return

    if (isOpen) {
      const tl = gsap.timeline()

      // Disable pointer events on the whole container during animation
      gsap.set(containerRef.current, { pointerEvents: 'none' })

      tl.to(containerRef.current, {
        gridTemplateRows: '1fr',
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.out,
      })

      // Only animate content if it's not the first render to avoid flashing
      if (!isFirstRender.current) {
        tl.fromTo(
          contentRef.current.children,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION.duration.medium,
            ease: ANIMATION.ease.out,
            stagger: ANIMATION.stagger.tight,
          },
          '<0.1'
        )
      } else {
        gsap.set(contentRef.current.children, { y: 0, opacity: 1 })
      }

      if (iconRef.current) {
        tl.to(
          iconRef.current,
          {
            rotate: 180,
            duration: ANIMATION.duration.fast,
            ease: ANIMATION.ease.out,
          },
          '<'
        )
      }

      tl.call(() => {
        if (containerRef.current) {
          containerRef.current.style.pointerEvents = 'auto'
        }
        ScrollTrigger.refresh()
        onAnimationComplete?.()
      })
    } else {
      // Disable pointer events during close
      gsap.set(containerRef.current, { pointerEvents: 'none' })

      const tl = gsap.timeline()

      tl.to(containerRef.current, {
        gridTemplateRows: '0fr',
        duration: ANIMATION.duration.fast,
        ease: ANIMATION.ease.inOut,
      })

      if (!isFirstRender.current) {
        tl.to(
          contentRef.current.children,
          {
            opacity: 0,
            y: -10,
            duration: ANIMATION.duration.fast,
            ease: ANIMATION.ease.inOut,
          },
          '<'
        )
      }

      if (iconRef.current) {
        tl.to(
          iconRef.current,
          {
            rotate: 0,
            duration: ANIMATION.duration.fast,
            ease: ANIMATION.ease.inOut,
          },
          '<'
        )
      }

      tl.call(() => {
        if (containerRef.current) {
          containerRef.current.style.pointerEvents = 'auto'
        }
        ScrollTrigger.refresh()
        onAnimationComplete?.()
      })
    }

    isFirstRender.current = false
  }, [isOpen, onAnimationComplete])

  return (
    <div className={cn('group flex flex-col', className)}>
      <button
        id={`accordion-trigger-${id}`}
        aria-controls={`accordion-content-${id}`}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        data-cursor="button"
        onClick={handleToggle}
        className={cn(
          'focus-visible:ring-primary flex cursor-pointer items-center justify-between gap-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-8',
          triggerClassName
        )}
      >
        <div className="flex-1">{trigger}</div>
        {!hideIcon && (
          <CaretDownIcon
            ref={iconRef}
            className="text-muted-foreground group-hover:text-primary size-6 shrink-0 transition-colors"
            weight="bold"
          />
        )}
      </button>

      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${id}`}
        ref={containerRef}
        className={cn('grid overflow-hidden', isOpen ? 'grid-rows-1' : 'grid-rows-0')}
      >
        <div ref={contentRef} className={cn('min-h-0', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}
