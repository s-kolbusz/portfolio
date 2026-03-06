'use client'

import { useRef, useState } from 'react'

import type { Icon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { gsap, useGSAP } from '@/lib/gsap'
import { cn } from '@/lib/utils'

import { DockTooltip } from './dock-tooltip'

type DockItemProps = {
  icon: Icon
  label: string
  isActive?: boolean
  ariaCurrent?: 'location' | 'page'
  onClick?: () => void
  scale?: number
  onHover?: (isHovering: boolean) => void
  className?: string
}

export function DockItem({
  icon: Icon,
  label,
  isActive,
  ariaCurrent,
  onClick,
  scale = 1,
  onHover,
  className,
}: DockItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const itemRef = useRef<HTMLButtonElement>(null)

  useGSAP(() => {
    gsap.to(itemRef.current, {
      scale: scale,
      duration: 0.2,
      ease: 'power2.out',
      overwrite: true,
    })
  }, [scale])

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(false)
  }

  return (
    <Button
      ref={itemRef}
      variant="glass"
      size="icon"
      type="button"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative flex origin-right items-center justify-center lg:h-12 lg:w-12',
        className
      )}
      aria-label={label}
      aria-current={ariaCurrent}
    >
      {/* Background hover effect */}
      <div className="absolute inset-0 rounded-md bg-emerald-500/0 transition-colors duration-300 group-hover:bg-emerald-500/10" />

      <Icon
        weight="duotone"
        className={`relative z-10 h-6 w-6 transition-all duration-300 ${
          isActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'opacity-60 group-hover:scale-110 group-hover:text-emerald-600 group-hover:opacity-100 dark:group-hover:text-emerald-400'
        }`}
      />

      <DockTooltip label={label} isVisible={isHovered} />
    </Button>
  )
}
