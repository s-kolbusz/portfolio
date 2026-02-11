'use client'

import { cn } from '@/lib/utils'

interface BookPageDotsProps {
  total: number
  current: number
  onSelect: (index: number) => void
}

export function BookPageDots({ total, current, onSelect }: BookPageDotsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Book pages"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Page ${i + 1}`}
          onClick={() => onSelect(i)}
          className={cn(
            'rounded-full transition-all duration-300',
            i === current
              ? 'bg-primary h-3 w-3 scale-125'
              : 'bg-muted-foreground/40 hover:bg-muted-foreground/70 h-2 w-2'
          )}
        />
      ))}
    </nav>
  )
}
