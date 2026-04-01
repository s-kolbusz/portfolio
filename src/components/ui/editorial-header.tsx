import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

interface EditorialHeaderProps {
  title: string
  subtitle?: string
  tagline?: string
  as?: 'h1' | 'h2'
  className?: string
  titleClassName?: string
  subtitleClassName?: string
}

export const EditorialHeader = forwardRef<HTMLDivElement, EditorialHeaderProps>(
  (
    { title, subtitle, tagline, as: TitleTag = 'h2', className, titleClassName, subtitleClassName },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('editorial-header', className)}>
        <div className="flex max-w-2xl flex-col gap-6">
          {tagline && (
            <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              {tagline}
            </span>
          )}
          <TitleTag
            className={cn(
              'text-foreground font-serif text-5xl leading-[1.1] font-normal md:text-6xl lg:text-7xl',
              titleClassName
            )}
          >
            {title}
          </TitleTag>
        </div>
        {subtitle && (
          <p
            className={cn(
              'text-muted-foreground max-w-2xl font-sans text-lg leading-relaxed text-balance md:text-right',
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    )
  }
)

EditorialHeader.displayName = 'EditorialHeader'
