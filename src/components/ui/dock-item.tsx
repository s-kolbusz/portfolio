'use client'

import type { Icon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'

import { DockTooltip } from './dock-tooltip'

type DockItemProps = {
  icon: Icon
  label: string
  href: string
  isActive?: boolean
  isHovered?: boolean
  ariaCurrent?: 'location' | 'page'
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  visualScale?: number
  className?: string
}

export function DockItem({
  icon: Icon,
  label,
  href,
  isActive,
  isHovered = false,
  ariaCurrent,
  onClick,
  visualScale = 1,
  className,
}: DockItemProps) {
  return (
    <Button
      href={href}
      variant="glass"
      size="icon"
      onClick={onClick}
      className={cn(
        'group relative flex items-center justify-center overflow-visible border-transparent bg-transparent transition-none hover:border-transparent hover:bg-transparent active:scale-100 lg:h-12 lg:w-12',
        className
      )}
      aria-label={label}
      aria-current={ariaCurrent}
    >
      <div
        data-cursor="button"
        className="relative flex size-full items-center justify-center transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{ transform: `scale(${visualScale})`, transformOrigin: 'right center' }}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-md transition-colors duration-200',
            isHovered ? 'bg-accent/80' : 'bg-primary/0'
          )}
        />

        <Icon
          weight="duotone"
          className={`relative z-10 h-6 w-6 transition-all duration-200 ${
            isActive
              ? 'text-primary'
              : isHovered
                ? 'text-primary scale-110 opacity-100'
                : 'opacity-60'
          }`}
        />
      </div>

      <DockTooltip label={label} isVisible={isHovered} />
    </Button>
  )
}
