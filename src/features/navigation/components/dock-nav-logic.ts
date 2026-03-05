import type { Icon } from '@phosphor-icons/react'
import {
  BriefcaseIcon,
  CubeIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  FileTextIcon,
  HouseIcon,
  UserIcon,
} from '@phosphor-icons/react'

import { isCvRoute, isHomeRoute, isProjectsRoute } from '@/lib/route-predicates'

export { isCvRoute, isHomeRoute, isProjectsRoute }

export interface NavItem {
  href: string
  icon: Icon
  id: 'hero' | 'about' | 'projects' | 'services' | 'calculator' | 'contact' | 'cv'
  isPage?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/#hero', icon: HouseIcon, id: 'hero' },
  { href: '/#about', icon: UserIcon, id: 'about' },
  { href: '/#projects', icon: BriefcaseIcon, id: 'projects' },
  { href: '/#services', icon: CurrencyDollarIcon, id: 'services' },
  { href: '/#calculator', icon: CubeIcon, id: 'calculator' },
  { href: '/#contact', icon: EnvelopeIcon, id: 'contact' },
  { href: '/cv', icon: FileTextIcon, id: 'cv', isPage: true },
]

const DESKTOP_LAYOUT = {
  itemSize: 48,
  gap: 12,
  padding: 12,
  centerOffset: 24,
  separatorSize: 1,
  separatorGap: 12,
}

const MOBILE_LAYOUT = {
  itemSize: 40,
  gap: 8,
  padding: 8,
  centerOffset: 20,
  separatorSize: 1,
  separatorGap: 8,
}

interface ActiveItemIndexArgs {
  pathname: string
  activeSection: string | null
  items?: NavItem[]
}

function getSeparatorOffset(
  index: number,
  separatorGap: number,
  separatorSize: number,
  items: NavItem[]
) {
  return items.reduce((total, item, itemIndex) => {
    if (itemIndex <= index && item.isPage && itemIndex > 0) {
      return total + separatorGap + separatorSize
    }

    return total
  }, 0)
}

export function getActiveItemIndex({
  pathname,
  activeSection,
  items = NAV_ITEMS,
}: ActiveItemIndexArgs) {
  const isHome = isHomeRoute(pathname)
  const isCvPage = isCvRoute(pathname)

  return items.findIndex((item) => {
    if (item.isPage) {
      if (item.id === 'cv') return isCvPage
      return pathname === item.href
    }

    if (!isHome) return false
    if (!activeSection && item.id === 'hero') return true

    return activeSection === item.id
  })
}

export function getDesktopIndicatorOffset(index: number, items = NAV_ITEMS) {
  const baseOffset =
    DESKTOP_LAYOUT.padding +
    index * (DESKTOP_LAYOUT.itemSize + DESKTOP_LAYOUT.gap) +
    DESKTOP_LAYOUT.centerOffset

  return (
    baseOffset +
    getSeparatorOffset(index, DESKTOP_LAYOUT.separatorGap, DESKTOP_LAYOUT.separatorSize, items)
  )
}

export function getMobileIndicatorOffset(index: number, items = NAV_ITEMS) {
  const baseOffset =
    MOBILE_LAYOUT.padding +
    index * (MOBILE_LAYOUT.itemSize + MOBILE_LAYOUT.gap) +
    MOBILE_LAYOUT.centerOffset

  return (
    baseOffset +
    getSeparatorOffset(index, MOBILE_LAYOUT.separatorGap, MOBILE_LAYOUT.separatorSize, items)
  )
}

export function getHoverScale(index: number, hoveredIndex: number | null) {
  if (hoveredIndex === null) return 1

  const distance = Math.abs(index - hoveredIndex)
  if (distance === 0) return 1.2
  if (distance === 1) return 1.1
  if (distance === 2) return 1.05

  return 1
}
