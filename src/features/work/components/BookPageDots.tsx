'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/Button'

interface BookPageDotsProps {
  total: number
  current: number
  onSelect: (index: number) => void
}

export function BookPageDots({ total, current, onSelect }: BookPageDotsProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [focusedIndex, setFocusedIndex] = useState(current)

  useEffect(() => {
    setFocusedIndex(current)
  }, [current])

  const moveFocus = (index: number) => {
    setFocusedIndex(index)
    buttonRefs.current[index]?.focus()
  }

  return (
    <nav
      role="tablist"
      aria-label="Book pages"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <Button
          key={i}
          ref={(element) => {
            buttonRefs.current[i] = element
          }}
          id={`book-tab-${i}`}
          role="tab"
          variant="ghost"
          aria-selected={i === current}
          aria-label={`Page ${i + 1}`}
          aria-controls={`book-panel-${i}`}
          tabIndex={i === focusedIndex ? 0 : -1}
          onFocus={() => setFocusedIndex(i)}
          onClick={() => onSelect(i)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              moveFocus((i + 1) % total)
              return
            }

            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              moveFocus((i - 1 + total) % total)
              return
            }

            if (event.key === 'Home') {
              event.preventDefault()
              moveFocus(0)
              return
            }

            if (event.key === 'End') {
              event.preventDefault()
              moveFocus(total - 1)
              return
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(i)
            }
          }}
          className={cn(
            'hover:bg-primary/20 h-3 w-3 rounded-full p-0 transition-all duration-300',
            i === current ? 'bg-primary scale-125' : 'bg-muted-foreground/40 h-2 w-2'
          )}
        />
      ))}
    </nav>
  )
}
