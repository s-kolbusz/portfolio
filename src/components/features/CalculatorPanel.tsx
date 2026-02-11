'use client'

import { ReactNode, useMemo, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import {
  DropIcon,
  FireIcon,
  HexagonIcon,
  LeafIcon,
  LinkIcon,
  SunIcon,
  WavesIcon,
} from '@phosphor-icons/react'
import gsap from 'gsap'

import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { BUILD_VOLUME_X, BUILD_VOLUME_Y, BUILD_VOLUME_Z, MATERIALS } from '@/data/materials'
import { calculatePrintCost } from '@/lib/calculate-print'

// Helper for animating numbers
const AnimatedValue = ({
  value,
  formatter = (v) => v.toString(),
  className,
}: {
  value: number
  formatter?: (v: number) => string | number
  className?: string
}) => {
  const ref = useRef<HTMLSpanElement>(null)
  const valueRef = useRef(value)

  useGSAP(() => {
    gsap.to(valueRef, {
      current: value,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = formatter(valueRef.current).toString()
        }
      },
    })
  }, [value])

  return (
    <span ref={ref} className={className}>
      {formatter(value)}
    </span>
  )
}

const MATERIAL_ICONS: Record<string, ReactNode> = {
  pla: <LeafIcon weight="duotone" className="size-4" />,
  petg: <DropIcon weight="duotone" className="size-4" />,
  tpu: <WavesIcon weight="duotone" className="size-4" />,
  abs: <FireIcon weight="duotone" className="size-4" />,
  asa: <SunIcon weight="duotone" className="size-4" />,
  nylon: <LinkIcon weight="duotone" className="size-4" />,
  'petg-cf': <HexagonIcon weight="duotone" className="size-4" />,
  'abs-cf': <HexagonIcon weight="duotone" className="size-4" />,
  'asa-cf': <HexagonIcon weight="duotone" className="size-4" />,
  'abs-gf': <HexagonIcon weight="duotone" className="size-4" />,
  'asa-gf': <HexagonIcon weight="duotone" className="size-4" />,
}

export const CalculatorPanel = () => {
  const t = useTranslations('calculator')

  // State
  const [dimensions, setDimensions] = useState({ x: 10, y: 10, z: 10 })
  const [infill, setInfill] = useState(20)
  const [materialId, setMaterialId] = useState(MATERIALS[0].id)

  // Derived
  const selectedMaterial = useMemo(
    () => MATERIALS.find((m) => m.id === materialId) || MATERIALS[0],
    [materialId]
  )

  const result = useMemo(
    () =>
      calculatePrintCost({
        width: dimensions.x,
        depth: dimensions.y,
        height: dimensions.z,
        infill,
        material: selectedMaterial,
      }),
    [dimensions, infill, selectedMaterial]
  )

  // Handlers
  const handleDimensionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    setDimensions((prev) => ({ ...prev, [axis]: value }))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value)
  }

  const formatTime = (hours: number) => {
    const totalMinutes = Math.round(hours * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60

    if (h === 0) return `${m}m`
    return `${h}h ${m > 0 ? `${m}m` : ''}`
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      {/* Control Panel (Inputs) */}
      <div className="flex flex-col justify-center space-y-10">
        <div className="space-y-8">
          <div className="border-border flex items-center justify-between border-b pb-2">
            <h3 className="text-primary font-mono text-sm tracking-widest uppercase">
              {t('dimensions')}
            </h3>
            <span className="text-muted-foreground font-mono text-xs">{t('unit_cm')}</span>
          </div>

          <Slider
            id="width"
            label={t('width')}
            min={1}
            max={BUILD_VOLUME_X / 10}
            step={0.5}
            value={dimensions.x}
            valueDisplay={
              <span className="font-mono">
                <AnimatedValue value={dimensions.x} formatter={(v) => v.toFixed(1)} /> cm
              </span>
            }
            onChange={(e) => handleDimensionChange('x', parseFloat(e.target.value))}
          />

          <Slider
            id="depth"
            label={t('depth')}
            min={1}
            max={BUILD_VOLUME_Y / 10}
            step={0.5}
            value={dimensions.y}
            valueDisplay={
              <span className="font-mono">
                <AnimatedValue value={dimensions.y} formatter={(v) => v.toFixed(1)} /> cm
              </span>
            }
            onChange={(e) => handleDimensionChange('y', parseFloat(e.target.value))}
          />

          <Slider
            id="height"
            label={t('height')}
            min={1}
            max={BUILD_VOLUME_Z / 10}
            step={0.5}
            value={dimensions.z}
            valueDisplay={
              <span className="font-mono">
                <AnimatedValue value={dimensions.z} formatter={(v) => v.toFixed(1)} /> cm
              </span>
            }
            onChange={(e) => handleDimensionChange('z', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-8">
          <div className="border-border flex items-center justify-between border-b pb-2">
            <h3 className="text-primary font-mono text-sm tracking-widest uppercase">
              {t('configuration')}
            </h3>
          </div>

          <Select
            id="material"
            label={t('material')}
            onChange={(value) => value && setMaterialId(value)}
            options={
              new Map(
                MATERIALS.map((m) => [
                  m.id,
                  { label: m.name, icon: MATERIAL_ICONS[m.id], value: m.id },
                ])
              )
            }
            className="w-full"
          />

          <Slider
            id="infill"
            label={t('infill')}
            min={0}
            max={100}
            step={5}
            value={infill}
            valueDisplay={
              <span className="font-mono">
                <AnimatedValue value={infill} formatter={(v) => Math.round(v)} />%
              </span>
            }
            onChange={(e) => setInfill(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Readout Panel (Output) */}
      <div className="bg-foreground/90 dark:bg-foreground/70 text-background relative flex flex-col justify-between overflow-hidden p-8 lg:aspect-square">
        {/* Decorative Grid Lines */}
        <div className="grid-lines absolute inset-0 opacity-75" />

        <div className="relative z-10 flex flex-col gap-8">
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest uppercase opacity-60">
              {t('output.material_cost')}
            </span>
            <div className="font-mono text-4xl font-light tracking-tight tabular-nums">
              <AnimatedValue value={result.materialCost} formatter={formatCurrency} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest uppercase opacity-60">
              {t('output.time_cost')}
            </span>
            <div className="font-mono text-4xl font-light tracking-tight tabular-nums">
              <AnimatedValue value={result.timeEstimate} formatter={formatTime} />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto border-t border-white/20 pt-8">
          <div className="space-y-2">
            <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              {t('output.total')}
            </span>
            <div className="font-serif text-6xl font-light tracking-tight tabular-nums">
              <AnimatedValue value={result.totalCost} formatter={formatCurrency} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
