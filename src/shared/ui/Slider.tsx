import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef, useId } from 'react'

import { cn } from '@/lib/utils'

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  valueDisplay?: ReactNode
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = props.id ?? `slider-${generatedId.replace(/:/g, '')}`

    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className="text-muted-foreground text-sm font-medium">
            {label}
          </label>
          {valueDisplay !== undefined && (
            <span className="text-foreground font-mono text-sm font-medium">{valueDisplay}</span>
          )}
        </div>
        <input
          type="range"
          ref={ref}
          id={fieldId}
          className={cn(
            'bg-secondary accent-primary h-2 w-full appearance-none rounded-full',
            'focus-visible:ring-primary focus-visible:ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-offset-8 focus-visible:outline-none'
          )}
          {...props}
        />
      </div>
    )
  }
)

Slider.displayName = 'Slider'
