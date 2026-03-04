'use client'

import { useEffect, useState } from 'react'

import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'

import { MoonIcon, SunIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { usePathname, useRouter } from '@/i18n/navigation'

export function SettingsDock() {
  const { setTheme, resolvedTheme } = useTheme()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'pl' : 'en'
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="settings-dock glass fixed top-6 right-6 z-50 flex items-center gap-1 p-1.5">
      {/* Theme Toggle */}
      <Button variant="glass" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
        {resolvedTheme === 'dark' ? (
          <MoonIcon weight="duotone" className="h-5 w-5" />
        ) : (
          <SunIcon weight="duotone" className="h-5 w-5" />
        )}
      </Button>

      <div className="bg-border h-4 w-px" />

      {/* Language Switcher */}
      <Button variant="glass" size="icon" onClick={toggleLocale} aria-label="Switch language">
        {locale.toUpperCase()}
      </Button>
    </div>
  )
}
