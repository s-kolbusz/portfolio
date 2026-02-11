'use client'

import { useTranslations } from 'next-intl'

import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react'

import { Button } from '@/components/ui/Button'
import { Service } from '@/data/services'
import { cn } from '@/lib/utils'

interface PricingCardProps {
  service: Service
}

export function PricingCard({ service }: PricingCardProps) {
  const t = useTranslations(`services.${service.id}`)
  const tCommon = useTranslations('services')

  // We assume 5 features max for now as per data
  const featureKeys = ['0', '1', '2', '3', '4']

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        service.popular
          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/10'
          : 'border-stone-200/60 bg-white/50 hover:border-emerald-500/20 dark:border-stone-800/60 dark:bg-stone-900/50 dark:hover:border-emerald-500/20'
      )}
    >
      {service.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 backdrop-blur-md dark:bg-emerald-950/30 dark:text-emerald-400">
          {tCommon('popular_badge')}
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
          {t('title')}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {t('price')}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('unit')}</p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {featureKeys.map((key) => (
          <li
            key={key}
            className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300"
          >
            <CheckIcon weight="bold" className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span className="leading-tight">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(`features.${key}` as any)}
            </span>
          </li>
        ))}
      </ul>

      <Button
        href="#contact"
        variant={service.popular ? 'primary' : 'secondary'}
        rightIcon={<ArrowRightIcon weight="bold" className="size-4" />}
      >
        {t('cta')}
      </Button>
    </div>
  )
}
