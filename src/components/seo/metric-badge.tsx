'use client'

import { forwardRef } from 'react'

import { cn } from '@/lib/cn'

interface MetricBadgeProps {
  label: string
  value: string | number
  description?: string
  className?: string
  /** Optional icon suffix like '%' or 'ms' */
  unit?: string
}

/**
 * MetricBadge — A small, high-contrast component for displaying absolute performance metrics.
 * Designed for Social Proof and Social Evidence (e.g. Lighthouse 100, LCP < 1s).
 */
export const MetricBadge = forwardRef<HTMLDivElement, MetricBadgeProps>(
  ({ label, value, description, className, unit }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border-primary/20 bg-primary/5 hover:bg-primary/10 flex flex-col gap-1 rounded-sm border p-3 font-mono transition-colors',
          className
        )}
        aria-label={`${label}: ${value}${unit || ''}`}
      >
        <span className="text-primary text-[10px] font-bold tracking-widest uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-primary text-2xl font-light tracking-tighter">{value}</span>
          {unit && <span className="text-primary/60 text-xs font-medium">{unit}</span>}
        </div>
        {description && (
          <span className="text-muted-foreground mt-1 text-[10px] leading-tight">
            {description}
          </span>
        )}
      </div>
    )
  }
)

MetricBadge.displayName = 'MetricBadge'
