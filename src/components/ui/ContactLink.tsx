'use client'

import type { Icon } from '@phosphor-icons/react'
import { ArrowSquareOutIcon } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

interface ContactLinkProps {
  label: string
  url: string
  icon: Icon
  className?: string
}

export function ContactLink({ label, url, icon: Icon, className }: ContactLinkProps) {
  const isExternal = url.startsWith('http')

  return (
    <a
      href={url}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      data-cursor="button"
      className={cn(
        'group glass-button contact-link-item relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition-[background-color,box-shadow] duration-300 hover:bg-emerald-500/10 active:scale-95 sm:p-6',
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-500/0 to-emerald-500/0 transition-all duration-500 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10" />

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-600 sm:h-14 sm:w-14 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-400">
        <Icon weight="duotone" className="size-6 sm:size-7" />
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="truncate font-serif text-base text-neutral-800 sm:text-lg md:text-xl dark:text-neutral-100">
          {url.replace('mailto:', '').replace('https://', '').replace('www.', '')}
        </span>
      </div>

      {isExternal && (
        <ArrowSquareOutIcon
          weight="bold"
          className="ml-auto hidden size-5 shrink-0 text-neutral-400 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-emerald-500 sm:block"
        />
      )}
    </a>
  )
}
