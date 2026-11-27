'use client'

import { type PointerEvent, type ReactNode, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { BUILD_VOLUME_X, BUILD_VOLUME_Y, BUILD_VOLUME_Z, MATERIALS } from '@/data/materials'
import { calculatePrintCost } from '@/lib/calculate-print'

/** the short name a person says: "PLA", "PETG", "ASA-GF" */
const short = (name: string) => name.split(' ')[0]

interface Range {
  min: number
  max: number
  step: number
}

/**
 * One underlined number inside the sentence: type into it, use the arrow keys, or (with a mouse) drag
 * it up and down. It stays text-sized; no boxes, no sliders (owner, 2026-11-27).
 */
function Value({
  value,
  onChange,
  range,
  label,
  suffix,
}: {
  value: number
  onChange: (value: number) => void
  range: Range
  label: string
  suffix?: string
}) {
  const clamp = (n: number) =>
    Math.min(range.max, Math.max(range.min, Math.round(n / range.step) * range.step))

  const drag = (e: PointerEvent<HTMLInputElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const startY = e.clientY
    const start = value
    let moved = false
    const move = (ev: globalThis.PointerEvent) => {
      const steps = Math.round((startY - ev.clientY) / 10)
      if (steps !== 0) moved = true
      onChange(clamp(start + steps * range.step))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      if (moved) (e.target as HTMLInputElement).blur()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <span className="ab-u">
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={range.min}
        max={range.max}
        step={range.step}
        style={{ width: `${String(value).length * 0.78 + 0.1}em` }}
        onPointerDown={drag}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (e.target.value !== '' && Number.isFinite(n)) onChange(clamp(n))
        }}
      />
      {suffix}
    </span>
  )
}

/** The print calculator as one sentence: change an underlined value and the price is counted again. */
export function PrintSentence() {
  const t = useTranslations('aboutPage.printer')
  const locale = useLocale()
  const [w, setW] = useState(8)
  const [d, setD] = useState(6)
  const [h, setH] = useState(5)
  const [infill, setInfill] = useState(20)
  const [materialId, setMaterialId] = useState('pla')
  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0]

  const result = calculatePrintCost({ width: w, depth: d, height: h, infill, material })
  const hours = Math.max(1, Math.round(result.timeEstimate))
  const price = new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(result.totalCost)

  const cm = (max: number): Range => ({ min: 1, max: max / 10, step: 1 })

  return (
    <div className="ab-calc" data-rv="print">
      <p className="ab-quote">
        {t.rich('quote', {
          hours,
          nw: (chunks: ReactNode) => <span className="ab-nw">{chunks}</span>,
          w: () => (
            <Value value={w} onChange={setW} range={cm(BUILD_VOLUME_X)} label={t('width')} />
          ),
          d: () => (
            <Value value={d} onChange={setD} range={cm(BUILD_VOLUME_Y)} label={t('depth')} />
          ),
          h: () => (
            <Value value={h} onChange={setH} range={cm(BUILD_VOLUME_Z)} label={t('height')} />
          ),
          m: () => (
            <span className="ab-u ab-u--select">
              <select
                aria-label={t('material')}
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
              >
                {MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {short(m.name)}
                  </option>
                ))}
              </select>
            </span>
          ),
          f: () => (
            <Value
              value={infill}
              onChange={setInfill}
              range={{ min: 0, max: 100, step: 5 }}
              label={t('infill')}
              suffix="%"
            />
          ),
          price: () => (
            <mark key={price} className="ab-price" aria-live="polite">
              {price}
            </mark>
          ),
        })}
      </p>
      <p className="ab-hint">{t('hint')}</p>
    </div>
  )
}
