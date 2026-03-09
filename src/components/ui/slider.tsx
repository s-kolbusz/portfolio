import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  valueDisplay?: ReactNode
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center justify-between">
          <label htmlFor={props.id} className="text-muted-foreground text-sm font-medium">
            {label}
          </label>
          {valueDisplay !== undefined && (
            <span className="text-foreground font-mono text-sm font-medium">{valueDisplay}</span>
          )}
        </div>
        <input
          type="range"
          ref={ref}
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
