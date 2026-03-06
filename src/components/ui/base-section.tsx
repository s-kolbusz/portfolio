import React, { forwardRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface BaseSectionProps {
  id: string
  children: ReactNode
  className?: string
  containerClassName?: string
  variant?: 'default' | 'secondary'
}

export const BaseSection = forwardRef<HTMLElement, BaseSectionProps>(
  ({ id, children, className, containerClassName, variant = 'default' }, ref) => {
    return (
      <section
        id={id}
        ref={ref}
        className={cn(
          'section-container',
          variant === 'secondary' ? 'bg-secondary/20' : 'bg-background',
          className
        )}
      >
        <div className={cn('container mx-auto flex flex-col', containerClassName)}>{children}</div>
      </section>
    )
  }
)

BaseSection.displayName = 'BaseSection'
