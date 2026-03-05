'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useActiveSection } from '@/hooks/useActiveSection'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useGSAP } from '@/lib/gsap'

import { animateIndicator, syncIndicatorPosition, useWindowResize } from './dock-nav/indicator'
import {
  NAV_ITEMS,
  getActiveItemIndex,
  getDesktopIndicatorOffset,
  getHoverScale,
  getMobileIndicatorOffset,
  isHomeRoute,
  isProjectsRoute,
} from './dock-nav/logic'
import { DockItem } from './DockItem'

export function DockNav() {
  const t = useTranslations('nav')
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null)
  const sectionIds = useMemo(() => NAV_ITEMS.map((item) => item.id), [])
  const activeSection = useActiveSection(sectionIds)
  const pathname = usePathname()
  const router = useRouter()

  const isHome = isHomeRoute(pathname)
  const isProjectsPage = isProjectsRoute(pathname)

  const indicatorRef = useRef<HTMLDivElement>(null)
  const mobileIndicatorRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const mobileDockRef = useRef<HTMLDivElement>(null)

  const activeItemIndex = getActiveItemIndex({
    pathname,
    activeSection: activeSection || null,
  })

  useGSAP(() => {
    animateIndicator({
      activeItemIndex,
      axis: 'y',
      container: dockRef.current,
      indicator: indicatorRef.current,
      getOffset: getDesktopIndicatorOffset,
    })
  }, [activeItemIndex])

  useGSAP(() => {
    animateIndicator({
      activeItemIndex,
      axis: 'x',
      container: mobileDockRef.current,
      indicator: mobileIndicatorRef.current,
      getOffset: getMobileIndicatorOffset,
    })
  }, [activeItemIndex])

  const syncIndicatorOnResize = useCallback(() => {
    syncIndicatorPosition({
      activeItemIndex,
      axis: 'y',
      container: dockRef.current,
      indicator: indicatorRef.current,
      getOffset: getDesktopIndicatorOffset,
    })

    syncIndicatorPosition({
      activeItemIndex,
      axis: 'x',
      container: mobileDockRef.current,
      indicator: mobileIndicatorRef.current,
      getOffset: getMobileIndicatorOffset,
    })
  }, [activeItemIndex])

  useWindowResize(syncIndicatorOnResize)

  const handleNavClick = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.isPage) {
      router.push(item.href)
      return
    }

    if (!isHome) {
      router.push(item.href)
      return
    }

    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isProjectsPage) return null

  return (
    <>
      <nav
        ref={dockRef}
        className="glass fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-3 p-3 lg:flex"
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          ref={indicatorRef}
          className="absolute top-0 -right-1 h-8 w-1 -translate-y-1/2 rounded-full bg-emerald-500 opacity-0 shadow-lg shadow-emerald-500"
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
              scale={getHoverScale(index, hoveredIndex)}
            />
          </div>
        ))}
      </nav>

      <nav
        ref={mobileDockRef}
        className="glass fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 p-2 lg:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div
          ref={mobileIndicatorRef}
          className="absolute -bottom-1 left-0 h-1 w-8 -translate-x-1/2 rounded-full bg-emerald-500 opacity-0 shadow-lg shadow-emerald-500"
        />

        {NAV_ITEMS.map((item, index) => (
          <div key={item.id} className="contents">
            {item.isPage && index > 0 && <div className="bg-border h-8 w-px" />}
            <DockItem
              icon={item.icon}
              isActive={activeItemIndex === index}
              label={t(item.id)}
              onClick={() => handleNavClick(item)}
            />
          </div>
        ))}
      </nav>
    </>
  )
}
