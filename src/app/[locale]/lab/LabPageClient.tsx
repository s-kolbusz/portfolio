'use client'

import { useTranslations } from 'next-intl'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CubeIcon,
  EnvelopeIcon,
  HouseIcon,
  MoonIcon,
  SunIcon,
} from '@phosphor-icons/react'

import { ProjectMeta } from '@/features/work/components/ProjectMeta'
import { getPageHref } from '@/i18n/route-map'
import { BaseSection } from '@/shared/ui/BaseSection'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Slider } from '@/shared/ui/Slider'

export function LabPageClient() {
  const resume = useTranslations('resume')
  const colors = [
    { name: 'Background', variable: 'var(--background)' },
    { name: 'Foreground', variable: 'var(--foreground)' },
    { name: 'Primary (Emerald)', variable: 'var(--primary)' },
    { name: 'Secondary', variable: 'var(--secondary)' },
    { name: 'Muted', variable: 'var(--muted)' },
    { name: 'Accent', variable: 'var(--accent)' },
    { name: 'Destructive', variable: 'var(--destructive)' },
    { name: 'Border', variable: 'var(--border)' },
  ]

  const emeralds = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

  return (
    <main id="main-content" className="container mx-auto flex flex-col gap-20 px-6 py-24 lg:px-24">
      <div className="fixed top-6 left-6 z-50">
        <Button
          href={getPageHref('home')}
          variant="outline-glass"
          size="md"
          leftIcon={<ArrowLeftIcon weight="bold" className="size-4" />}
        >
          {resume('backHome')}
        </Button>
      </div>

      <header className="flex flex-col gap-4">
        <h1 className="font-serif text-6xl font-light tracking-tight md:text-8xl">Design System</h1>
        <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
          Sebastian Kolbusz Portfolio — 2026
        </p>
      </header>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          01. Typography
        </h2>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground font-mono text-[10px] uppercase">
              Fraunces — Serif
            </span>
            <h3 className="font-serif text-5xl md:text-7xl">
              Sphinx of black quartz, judge my vow.
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground font-mono text-[10px] uppercase">
              Satoshi — Sans
            </span>
            <p className="font-sans text-2xl md:text-4xl">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground font-mono text-[10px] uppercase">
              JetBrains Mono — Mono
            </span>
            <p className="font-mono text-lg">function initializePortfolio() {'{ ... }'}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          02. Color Palette
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {colors.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className="aspect-square w-full rounded-xl border border-black/5 dark:border-white/10"
                style={{ backgroundColor: color.variable }}
              />
              <span className="font-sans text-xs font-medium">{color.name}</span>
              <span className="text-muted-foreground font-mono text-[10px] opacity-60">
                {color.variable}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-muted-foreground font-mono text-[10px] uppercase">
            Emerald Scale
          </span>
          <div className="flex h-12 w-full overflow-hidden rounded-xl">
            {emeralds.map((level) => (
              <div
                key={level}
                className="h-full flex-1"
                style={{ backgroundColor: `var(--color-emerald-${level})` }}
                title={`emerald-${level}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          03. Buttons
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="outline-glass">Outline Glass</Button>
          <Button variant="ghost" rightIcon={<ArrowRightIcon />}>
            Ghost Button
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg" leftIcon={<EnvelopeIcon />}>
            Large with Icon
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          04. Forms & Components
        </h2>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Slider label="Volume" defaultValue={50} valueDisplay="50%" />
            <Slider label="Opacity" defaultValue={80} valueDisplay="0.8" step={0.1} max={1} />
          </div>

          <div className="flex flex-col gap-8">
            <Select
              label="Choose Material"
              onChange={() => {}}
              options={
                new Map([
                  ['pla', { label: 'PLA Filament', value: 'pla', icon: <CubeIcon /> }],
                  ['abs', { label: 'ABS Polymer', value: 'abs', icon: <CheckIcon /> }],
                ])
              }
            />
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground font-mono text-[10px] uppercase">
                Project Meta
              </span>
              <ProjectMeta year="2026" techStack={['Next.js', 'GSAP', 'Three.js']} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="glass flex aspect-video flex-col items-center justify-center gap-4 rounded-xl p-6">
            <span className="font-mono text-xs uppercase opacity-60">Glass Utility</span>
            <div className="glass-button p-2">
              <SunIcon size={24} weight="duotone" />
            </div>
          </div>
          <div className="grid-lines bg-background/50 flex aspect-video flex-col items-center justify-center rounded-xl border p-6">
            <span className="font-mono text-xs uppercase opacity-60">Grid Lines</span>
          </div>
          <div className="book-paper flex aspect-video flex-col items-center justify-center rounded-xl border p-6">
            <span className="font-mono text-xs uppercase opacity-60">Book Paper</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          05. Section Variants
        </h2>
        <div className="flex flex-col gap-8">
          <BaseSection
            id="preview-default"
            className="min-h-0 rounded-2xl border py-12"
            containerClassName="items-center"
          >
            <p className="font-mono text-sm uppercase opacity-60">Default Variant (Background)</p>
          </BaseSection>
          <BaseSection
            id="preview-secondary"
            variant="secondary"
            className="min-h-0 rounded-2xl border py-12"
            containerClassName="items-center"
          >
            <p className="font-mono text-sm uppercase opacity-60">
              Secondary Variant (Emerald Tint)
            </p>
          </BaseSection>
        </div>
      </section>

      <section className="flex flex-col gap-10">
        <h2 className="border-border border-b pb-4 font-mono text-xs font-bold tracking-[0.2em] uppercase opacity-50">
          05. Navigation Mockup
        </h2>
        <div className="relative h-40 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900">
          <div className="glass absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
            <div className="glass-button flex h-10 w-10 items-center justify-center rounded-md">
              <HouseIcon size={20} weight="duotone" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <CheckIcon size={20} weight="bold" />
            </div>
            <div className="glass-button flex h-10 w-10 items-center justify-center rounded-md">
              <MoonIcon size={20} weight="duotone" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
