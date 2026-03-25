'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useActiveSection } from '@/hooks/use-active-section'
import { usePathname } from '@/i18n/navigation'
import { useGSAP } from '@/lib/gsap'
import { isProjectDetailRoute, isServicesRoute } from '@/lib/route-predicates'

import { DockItem } from './dock-item'
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

export function DockNav() {
  const t = useTranslations('nav')
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null)
  const sectionIds = useMemo(() => NAV_ITEMS.map((item) => item.id), [])
  const activeSection = useActiveSection(sectionIds)
  const pathname = usePathname()

  const isHome = isHomeRoute(pathname)
  const isProjectsPage = isProjectsRoute(pathname)
  const isDetail = isProjectDetailRoute(pathname)
  const isServices = isServicesRoute(pathname)

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

  const handleNavClick = (e: React.MouseEvent, item: (typeof NAV_ITEMS)[0]) => {
    if (item.isPage) {
      return // Let the standard link behavior happen
    }

    if (!isHome) {
      return // Let the standard link behavior happen to navigate to home and scroll
    }

    e.preventDefault()
    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isProjectsPage || isDetail || isServices) return null

  return (
    <>
      <nav
        ref={dockRef}
        className="dock-nav glass fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-3 p-3 lg:flex"
        aria-label={t('main_navigation')}
      >
        <div
          ref={indicatorRef}
          className="bg-primary shadow-primary absolute top-0 -right-1 h-8 w-1 -translate-y-1/2 rounded-full opacity-0 shadow-lg"
        />

        {NAV_ITEMS.map((item, index) => (
          <div key={item.id} className="contents">
            {item.isPage && index > 0 && <div className="bg-border mx-auto h-px w-8" />}
            <DockItem
              icon={item.icon}
              href={item.href}
              isActive={activeItemIndex === index}
              label={t(item.id)}
              ariaCurrent={
                activeItemIndex === index ? (item.isPage ? 'page' : 'location') : undefined
              }
              onClick={(e) => handleNavClick(e, item)}
              onHover={(isHovering) => setHoveredIndex(isHovering ? index : null)}
              scale={getHoverScale(index, hoveredIndex)}
            />
          </div>
        ))}
      </nav>

      <nav
        ref={mobileDockRef}
        className="dock-nav glass fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 p-2 lg:hidden"
        aria-label={t('main_navigation')}
      >
        <div
          ref={mobileIndicatorRef}
          className="bg-primary shadow-primary absolute -bottom-1 left-0 h-1 w-8 -translate-x-1/2 rounded-full opacity-0 shadow-lg"
        />

        {NAV_ITEMS.map((item, index) => (
          <div key={item.id} className="contents">
            {item.isPage && index > 0 && <div className="bg-border h-8 w-px" />}
            <DockItem
              icon={item.icon}
              href={item.href}
              isActive={activeItemIndex === index}
              label={t(item.id)}
              ariaCurrent={
                activeItemIndex === index ? (item.isPage ? 'page' : 'location') : undefined
              }
              onClick={(e) => handleNavClick(e, item)}
            />
          </div>
        ))}
      </nav>
    </>
  )
}
