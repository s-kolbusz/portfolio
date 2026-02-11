'use client'

import { useRef, useState, useEffect, useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import {
  BriefcaseIcon,
  CubeIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  FileTextIcon,
  HouseIcon,
  UserIcon,
} from '@phosphor-icons/react'
import gsap from 'gsap'

import { useActiveSection } from '@/hooks/useActiveSection'
import { usePathname, useRouter } from '@/i18n/navigation'

import { DockItem } from './DockItem'

const NAV_ITEMS = [
  { href: '/#hero', icon: HouseIcon, id: 'hero', label: 'Home' },
  { href: '/#about', icon: UserIcon, id: 'about', label: 'About' },
  { href: '/#projects', icon: BriefcaseIcon, id: 'projects', label: 'Work' },
  { href: '/#services', icon: CurrencyDollarIcon, id: 'services', label: 'Services' },
  { href: '/#calculator', icon: CubeIcon, id: 'calculator', label: '3D Print' },
  { href: '/#contact', icon: EnvelopeIcon, id: 'contact', label: 'Contact' },
  { href: '/cv', icon: FileTextIcon, id: 'cv', isPage: true, label: 'CV' },
]

export function DockNav() {
  const t = useTranslations('nav')
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null)
  const sectionIds = useMemo(() => NAV_ITEMS.map((item) => item.id), [])
  const activeSection = useActiveSection(sectionIds)
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === '/' || pathname === '/en' || pathname === '/pl'
  const isCVPage = pathname.includes('/cv')
  const isProjectsPage = pathname.includes('/projects')

  const indicatorRef = useRef<HTMLDivElement>(null)
  const mobileIndicatorRef = useRef<HTMLDivElement>(null)

  const dockRef = useRef<HTMLDivElement>(null)
  const mobileDockRef = useRef<HTMLDivElement>(null)

  // Determine active item
  const activeItemIndex = NAV_ITEMS.findIndex((item) => {
    if (item.isPage) {
      if (item.id === 'cv') return isCVPage
      return pathname === item.href
    }

    if (isHome) {
      // If we are exactly at the top or section not detected yet, default to hero
      if (!activeSection && item.id === 'hero') return true
      return activeSection === item.id
    }
    return false
  })

  // Calculate top position for desktop indicator
  const getIndicatorTop = (index: number) => {
    // 12px padding + (48px height + 12px gap) * index + 24px (half height)
    let offset = 12 + index * (48 + 12) + 24

    // Account for spacers above items. A spacer adds its height (1px) and an extra gap (12px)
    NAV_ITEMS.forEach((item, i) => {
      if (i <= index && item.isPage && i > 0) {
        offset += 1 + 12
      }
    })

    return offset
  }

  // Calculate left position for mobile indicator
  const getIndicatorLeft = (index: number) => {
    // 8px padding + (40px width + 8px gap) * index + 20px (half width)
    let offset = 8 + index * (40 + 8) + 20

    // Account for spacers. A spacer adds its width (1px) and an extra gap (8px)
    NAV_ITEMS.forEach((item, i) => {
      if (i <= index && item.isPage && i > 0) {
        offset += 1 + 8
      }
    })

    return offset
  }

  // Animate Desktop indicator
  useGSAP(() => {
    if (activeItemIndex !== -1 && dockRef.current && indicatorRef.current) {
      // Check if dock is visible (desktop mode) to avoid wrong calculations
      const style = window.getComputedStyle(dockRef.current)
      if (style.display === 'none') return

      const top = getIndicatorTop(activeItemIndex)

      // If opacity is 0 (initial state), set position immediately
      const currentOpacity = gsap.getProperty(indicatorRef.current, 'opacity')

      if (currentOpacity === 0) {
        gsap.set(indicatorRef.current, { top: top })
        gsap.to(indicatorRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      } else {
        gsap.to(indicatorRef.current, {
          duration: 0.4,
          ease: 'back.out(1.2)',
          opacity: 1,
          top: top,
        })
      }
    } else if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        duration: 0.2,
        opacity: 0,
      })
    }
  }, [activeItemIndex])

  // Animate Mobile Indicator
  useGSAP(() => {
    if (activeItemIndex !== -1 && mobileDockRef.current && mobileIndicatorRef.current) {
      // Check if dock is visible (mobile mode) to avoid wrong calculations
      const style = window.getComputedStyle(mobileDockRef.current)
      if (style.display === 'none') return

      const left = getIndicatorLeft(activeItemIndex)

      const currentOpacity = gsap.getProperty(mobileIndicatorRef.current, 'opacity')

      if (currentOpacity === 0) {
        gsap.set(mobileIndicatorRef.current, { left: left })
        gsap.to(mobileIndicatorRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
      } else {
        gsap.to(mobileIndicatorRef.current, {
          duration: 0.4,
          ease: 'back.out(1.2)',
          opacity: 1,
          left: left,
        })
      }
    } else if (mobileIndicatorRef.current) {
      gsap.to(mobileIndicatorRef.current, {
        duration: 0.2,
        opacity: 0,
      })
    }
  }, [activeItemIndex])

  // Handle window resize to fix position issues when switching viewports
  useEffect(() => {
    const handleResize = () => {
      if (activeItemIndex !== -1) {
        // Desktop
        if (dockRef.current && indicatorRef.current) {
          const style = window.getComputedStyle(dockRef.current)
          if (style.display !== 'none') {
            const top = getIndicatorTop(activeItemIndex)
            gsap.set(indicatorRef.current, { top: top, opacity: 1 })
          } else {
            gsap.set(indicatorRef.current, { opacity: 0 })
          }
        }

        // Mobile
        if (mobileDockRef.current && mobileIndicatorRef.current) {
          const style = window.getComputedStyle(mobileDockRef.current)
          if (style.display !== 'none') {
            const left = getIndicatorLeft(activeItemIndex)
            gsap.set(mobileIndicatorRef.current, { left: left, opacity: 1 })
          } else {
            gsap.set(mobileIndicatorRef.current, { opacity: 0 })
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeItemIndex])

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1
    const dist = Math.abs(index - hoveredIndex)
    if (dist === 0) return 1.2
    if (dist === 1) return 1.1
    if (dist === 2) return 1.05
    return 1
  }

  const handleNavClick = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.isPage) {
      router.push(item.href)
    } else {
      if (pathname !== '/' && pathname !== '/en' && pathname !== '/pl') {
        router.push(item.href)
      } else {
        const element = document.getElementById(item.id)
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Hide dock entirely on the Projects Book page (uses its own BackButton nav)
  if (isProjectsPage) return null

  return (
    <>
      {/* Desktop Dock */}
      <nav
        ref={dockRef}
        className="glass fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-3 p-3 lg:flex"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Active Indicator (Pill next to dock) */}
        <div
          ref={indicatorRef}
          className="absolute -right-1 h-8 w-1 -translate-y-1/2 rounded-full bg-emerald-500 opacity-0 shadow-lg shadow-emerald-500"
          style={{ top: '50%' }}
        />

        {NAV_ITEMS.map((item, index) => (
          <div key={item.id} className="contents">
            {item.isPage && index > 0 && <div className="bg-border mx-auto h-px w-8" />}
            <DockItem
              icon={item.icon}
              isActive={activeItemIndex === index}
              label={t(item.id)}
              onClick={() => handleNavClick(item)}
              onHover={(isHovering) => setHoveredIndex(isHovering ? index : null)}
              scale={getScale(index)}
            />
          </div>
        ))}
      </nav>

      {/* Mobile Dock */}
      <nav
        ref={mobileDockRef}
        className="glass fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 p-2 lg:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Active Indicator (Pill below dock items) */}
        <div
          ref={mobileIndicatorRef}
          className="absolute -bottom-1 h-1 w-8 -translate-x-1/2 rounded-full bg-emerald-500 opacity-0 shadow-lg shadow-emerald-500"
          style={{ left: '50%' }}
        />

        {NAV_ITEMS.map((item, index) => (
          <div key={item.id} className="contents">
            {item.isPage && index > 0 && <div className="bg-border h-8 w-px" />}
            <DockItem
              icon={item.icon}
              isActive={activeItemIndex === index}
              label={t(item.id)}
              onClick={() => handleNavClick(item)}
              // No scale effect on mobile
            />
          </div>
        ))}
      </nav>
    </>
  )
}
