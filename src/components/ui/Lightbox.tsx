'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import Image from 'next/image'

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { MediaItem } from '@/data/projects'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { gsap, useGSAP } from '@/lib/gsap'
import { useScrollStore } from '@/lib/store'

interface LightboxProps {
  images: readonly MediaItem[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next, 0 for initial
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  // Ref to store the element that had focus before opening the lightbox
  const previousFocus = useRef<HTMLElement | null>(null)

  // Access Lenis instance to lock scroll
  const lenis = useScrollStore((state) => state.lenis)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement

      setCurrentIndex(initialIndex)
      setDirection(0)
      lenis?.stop()

      // Move focus to overlay for accessibility
      // Small timeout to ensure DOM is ready and transition has started
      setTimeout(() => {
        overlayRef.current?.focus()
      }, 50)
    } else {
      lenis?.start()
      // Restore focus
      previousFocus.current?.focus()
    }
    return () => {
      lenis?.start() // Ensure we restart scroll on unmount
    }
  }, [isOpen, initialIndex, lenis])

  // GSAP Animation for Open
  useGSAP(
    () => {
      if (!overlayRef.current || !isOpen) return

      const tl = gsap.timeline()

      tl.fromTo(
        overlayRef.current,
        { opacity: 0, backdropFilter: 'blur(0px)' },
        {
          opacity: 1,
          backdropFilter: 'blur(16px)',
          duration: 0.4,
          ease: 'power2.out',
        }
      ).fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' },
        '-=0.3'
      )
    },
    { dependencies: [isOpen], revertOnUpdate: true }
  )

  // GSAP Animation for Slide Change
  useGSAP(
    () => {
      if (!isOpen || direction === 0 || !imageRef.current) return

      const xOffset = direction * 40

      gsap.fromTo(
        imageRef.current,
        { x: xOffset, opacity: 0, scale: 0.98 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true, // Ensure we overwrite any ongoing animation
        }
      )
    },
    { dependencies: [currentIndex] }
  )

  const showPrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const showNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Focus Trap
  useFocusTrap(overlayRef, isOpen)

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]) // Intentionally omitting showPrev/showNext to avoid recreation issues.

  if (!mounted) return null
  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 outline-none sm:p-8"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <span className="font-mono text-xs tracking-widest text-white/70">
          {currentIndex + 1} / {images.length}
        </span>
        <Button
          variant="outline-glass"
          size="icon"
          onClick={onClose}
          aria-label="Close lightbox"
          className="rounded-full border-transparent bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:rounded-full! focus-visible:ring-offset-0!"
        >
          <XIcon weight="bold" className="size-5" />
        </Button>
      </div>

      {/* Nav Buttons */}
      <Button
        variant="outline-glass"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          showPrev()
        }}
        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full border-transparent bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:rounded-full! focus-visible:ring-offset-0! sm:left-8"
        aria-label="Previous image"
      >
        <ArrowLeftIcon weight="bold" className="size-6" />
      </Button>

      <Button
        variant="outline-glass"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          showNext()
        }}
        className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full border-transparent bg-white/10 p-3 text-white hover:bg-white/20 focus-visible:rounded-full! focus-visible:ring-offset-0! sm:right-8"
        aria-label="Next image"
      >
        <ArrowRightIcon weight="bold" className="size-6" />
      </Button>

      {/* Image Container */}
      <div
        ref={imageRef}
        className="relative h-full w-full max-w-7xl select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={currentIndex} // Force re-mount for animation entry targeting
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          quality={90}
        />

        {/* Caption */}
        <div className="absolute right-0 bottom-4 left-0 text-center">
          <p className="inline-block rounded-full bg-black/50 px-4 py-1.5 text-sm text-white/90 backdrop-blur-md">
            {images[currentIndex].alt}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
