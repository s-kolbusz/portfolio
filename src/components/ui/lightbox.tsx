'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import type { MediaItem } from '@/data/projects'
import { gsap, useGSAP } from '@/lib/gsap-core'
import { useScrollStore } from '@/lib/stores'

interface LightboxProps {
  images: readonly MediaItem[]
  initialIndex: number
  onClose: () => void
}

const subscribe = () => () => {}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(() => initialIndex)
  const [direction, setDirection] = useState(0) // -1 for prev, 1 for next, 0 for initial
  const overlayRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('lightbox')

  // Ref to store the element that had focus before opening the lightbox
  const previousFocus = useRef<HTMLElement | null>(null)

  // Access Lenis instance to lock scroll
  const lenis = useScrollStore((state) => state.lenis)
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  const showPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const showNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') showPrev()
      if (event.key === 'ArrowRight') showNext()
      if (event.key === 'Escape') onClose()
    },
    [showPrev, showNext, onClose]
  )

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement
    lenis?.stop()

    return () => {
      // Return focus asynchronously to prevent quick scroll jumps
      setTimeout(() => previousFocus.current?.focus(), 0)
      lenis?.start()
    }
  }, [lenis])

  // GSAP Animation for Open
  useGSAP(
    () => {
      if (!overlayRef.current) return

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
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
        '-=0.3'
      )
    },
    { dependencies: [] }
  )

  // GSAP Animation for Slide Change
  useGSAP(
    () => {
      if (direction === 0 || !imageRef.current) return

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
          overwrite: true,
        }
      )
    },
    { dependencies: [currentIndex] }
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  if (!mounted) return null

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('title')}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 outline-none sm:p-8"
    >
      <button
        type="button"
        data-cursor="default"
        data-testid="lightbox-backdrop"
        className="absolute inset-0 -z-10 h-full w-full cursor-default border-none bg-black/80"
        aria-label={t('close')}
        onClick={onClose}
      />

      {/* Top Bar */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <span className="font-mono text-xs tracking-widest text-white/70">
          {currentIndex + 1} / {images.length}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label={t('close')}
          className="rounded-full border-neutral-800 bg-neutral-900 text-white hover:bg-black hover:text-white focus-visible:rounded-full! focus-visible:ring-offset-0!"
        >
          <XIcon weight="bold" className="size-5" />
        </Button>
      </div>

      {/* Nav Buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          showPrev()
        }}
        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full border-neutral-800 bg-neutral-900 text-white hover:bg-black hover:text-white focus-visible:rounded-full! focus-visible:ring-offset-0! sm:left-8"
        aria-label={t('previous')}
      >
        <ArrowLeftIcon weight="bold" className="size-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          showNext()
        }}
        className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full border-neutral-800 bg-neutral-900 text-white hover:bg-black hover:text-white focus-visible:rounded-full! focus-visible:ring-offset-0! sm:right-8"
        aria-label={t('next')}
      >
        <ArrowRightIcon weight="bold" className="size-6" />
      </Button>

      {/* Image Container */}
      <div
        ref={imageRef}
        role="presentation"
        className="relative flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={currentIndex}
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          width={1920}
          height={1080}
          quality={90}
          className="max-h-[85vh] w-auto max-w-[90vw] object-contain shadow-2xl ring-1 ring-white/10 sm:max-w-7xl"
          loading="eager"
        />

        {/* Caption */}
        <div className="absolute right-0 -bottom-14 left-0 text-center">
          <p className="inline-block rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1.5 text-sm text-white">
            {images[currentIndex].alt}
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
