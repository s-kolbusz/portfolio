'use client'

import { Button } from '@/components/ui/Button'
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
        <Button
          key={i}
          role="tab"
          variant="ghost"
          aria-selected={i === current}
          aria-label={`Page ${i + 1}`}
          aria-controls={`book-panel-${i}`}
          onClick={() => onSelect(i)}
          className={cn(
            'h-3 w-3 rounded-full p-0 transition-all duration-300 hover:bg-primary/20',
            i === current
              ? 'bg-primary scale-125'
              : 'bg-muted-foreground/40 h-2 w-2'
          )}
        />
      ))}
    </nav>
  )
}
