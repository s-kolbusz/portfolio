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
          'flex flex-col gap-1 rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-3 font-mono transition-colors hover:bg-emerald-500/10 dark:border-emerald-400/20 dark:bg-emerald-400/5',
          className
        )}
        aria-label={`${label}: ${value}${unit || ''}`}
      >
        <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400/80">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-light tracking-tighter text-emerald-700 dark:text-emerald-300">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/40">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <span className="mt-1 text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
            {description}
          </span>
        )}
      </div>
    )
  }
)

MetricBadge.displayName = 'MetricBadge'
