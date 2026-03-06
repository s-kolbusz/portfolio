'use client'

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

interface BookEdgeNavProps {
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

export function BookEdgeNav({ onPrev, onNext, hasPrev, hasNext }: BookEdgeNavProps) {
  return (
    <>
      {/* Left edge */}
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="Previous page"
        className={cn(
          'group fixed top-0 left-0 z-40 flex h-dvh w-20 items-center justify-center',
          'opacity-0 transition-opacity duration-300 hover:opacity-100',
          'focus-visible:opacity-100',
          !hasPrev && 'pointer-events-none'
        )}
      >
        <CaretLeftIcon
          weight="bold"
          className="text-foreground/50 group-hover:text-foreground size-8 transition-transform group-hover:-translate-x-1"
        />
      </button>

      {/* Right edge */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next page"
        className={cn(
          'group fixed top-0 right-0 z-40 flex h-dvh w-20 items-center justify-center',
          'opacity-0 transition-opacity duration-300 hover:opacity-100',
          'focus-visible:opacity-100',
          !hasNext && 'pointer-events-none'
        )}
      >
        <CaretRightIcon
          weight="bold"
          className="text-foreground/50 group-hover:text-foreground size-8 transition-transform group-hover:translate-x-1"
        />
      </button>
    </>
  )
}
