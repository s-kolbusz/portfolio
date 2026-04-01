'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

interface BookPageDotsProps {
  total: number
  current: number
  onSelect: (index: number) => void
}

export function BookPageDots({ total, current, onSelect }: BookPageDotsProps) {
  return (
    <nav
      aria-label="Book pages"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
    >
      <div role="tablist" className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <Button
            key={i}
            id={`book-tab-${i}`}
            role="tab"
            variant="ghost"
            aria-selected={i === current}
            aria-label={`Page ${i + 1}`}
            aria-controls={`book-panel-${i}`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => onSelect(i)}
            className={cn(
              'hover:bg-primary/20 h-3 w-3 rounded-full p-0 transition-colors duration-300',
              i === current ? 'bg-primary scale-125' : 'bg-muted-foreground/40 h-2 w-2'
            )}
          />
        ))}
      </div>
    </nav>
  )
}
