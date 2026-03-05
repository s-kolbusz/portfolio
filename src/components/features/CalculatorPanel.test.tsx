import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import enMessages from '@/i18n/messages/en.json'

const calculatorMessages = enMessages.calculator

function getMessage(path: string) {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
      calculatorMessages
    )
}

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const value = getMessage(key)
    return typeof value === 'string' ? value : key
  },
}))

vi.mock('@/shared/hooks/useMedia', () => ({
  usePrefersReducedMotion: () => true,
}))

vi.mock('@/lib/gsap', () => ({
  gsap: {
    to: vi.fn(),
  },
  useGSAP: (callback?: () => void) => {
    callback?.()
  },
}))

import { MATERIALS } from '@/data/materials'
import { calculatePrintCost } from '@/lib/calculate-print'

import { CalculatorPanel } from './CalculatorPanel'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatTime(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  if (h === 0) return `${m}m`
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

describe('CalculatorPanel', () => {
  it('renders deterministic default output formatting for the baseline inputs', () => {
    render(<CalculatorPanel />)

    const baseline = calculatePrintCost({
      width: 10,
      depth: 10,
      height: 10,
      infill: 20,
      material: MATERIALS[0],
    })

    expect(screen.getByText(formatCurrency(baseline.materialCost))).toBeInTheDocument()
    expect(screen.getByText(formatTime(baseline.timeEstimate))).toBeInTheDocument()
    expect(screen.getByText(formatCurrency(baseline.totalCost))).toBeInTheDocument()
  })

  it('recomputes and formats outputs deterministically after slider interactions', () => {
    render(<CalculatorPanel />)

    fireEvent.change(screen.getByLabelText('Width (X)'), { target: { value: '18' } })
    fireEvent.change(screen.getByLabelText('Depth (Y)'), { target: { value: '14' } })
    fireEvent.change(screen.getByLabelText('Height (Z)'), { target: { value: '12.5' } })
    fireEvent.change(screen.getByLabelText('Infill Density (%)'), { target: { value: '65' } })

    const updated = calculatePrintCost({
      width: 18,
      depth: 14,
      height: 12.5,
      infill: 65,
      material: MATERIALS[0],
    })

    expect(screen.getByText(formatCurrency(updated.materialCost))).toBeInTheDocument()
    expect(screen.getByText(formatTime(updated.timeEstimate))).toBeInTheDocument()
    expect(screen.getByText(formatCurrency(updated.totalCost))).toBeInTheDocument()
  })
})
