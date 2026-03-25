'use client'

import { useRef, useState } from 'react'

import type { Icon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { gsap, useGSAP } from '@/lib/gsap'

import { DockTooltip } from './dock-tooltip'

type DockItemProps = {
  icon: Icon
  label: string
  href: string
  isActive?: boolean
  ariaCurrent?: 'location' | 'page'
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  scale?: number
  onHover?: (isHovering: boolean) => void
  className?: string
}

export function DockItem({
  icon: Icon,
  label,
  href,
  isActive,
  ariaCurrent,
  onClick,
  scale = 1,
  onHover,
  className,
}: DockItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const itemRef = useRef<HTMLAnchorElement>(null)

  useGSAP(() => {
    if (!itemRef.current) return
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
      href={href}
      variant="glass"
      size="icon"
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
      <div className="bg-primary/0 group-hover:bg-primary/10 absolute inset-0 rounded-md transition-colors duration-300" />

      <Icon
        weight="duotone"
        className={`relative z-10 h-6 w-6 transition-all duration-300 ${
          isActive
            ? 'text-primary'
            : 'group-hover:text-primary opacity-60 group-hover:scale-110 group-hover:opacity-100'
        }`}
      />

      <DockTooltip label={label} isVisible={isHovered} />
    </Button>
  )
}
