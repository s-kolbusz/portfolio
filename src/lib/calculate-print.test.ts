import { describe, expect, it } from 'vitest'

import type { Material } from '@/data/materials'

import { calculatePrintCost } from './calculate-print'

const referenceMaterial: Material = {
  id: 'reference',
  name: 'Reference',
  density: 1,
  pricePerGram: 0.1,
  printSpeed: 10,
}

describe('calculatePrintCost', () => {
  it('calculates deterministic values for a known input', () => {
    const result = calculatePrintCost({
      width: 10,
      depth: 10,
      height: 10,
      infill: 20,
      material: referenceMaterial,
    })

    expect(result.volume).toBeCloseTo(320)
    expect(result.materialCost).toBeCloseTo(32)
    expect(result.timeEstimate).toBeCloseTo(8.8889, 4)
    expect(result.timeCost).toBeCloseTo(6.6667, 4)
    expect(result.totalCost).toBeCloseTo(50.2667, 4)
  })

  it('keeps shell-only volume when infill is zero', () => {
    const result = calculatePrintCost({
      width: 2,
      depth: 5,
      height: 10,
      infill: 0,
      material: referenceMaterial,
    })

    expect(result.volume).toBeCloseTo(15)
    expect(result.materialCost).toBeCloseTo(1.5)
  })

  it('increases volume and total cost when infill rises', () => {
    const lowInfill = calculatePrintCost({
      width: 8,
      depth: 8,
      height: 8,
      infill: 10,
      material: referenceMaterial,
    })
    const highInfill = calculatePrintCost({
      width: 8,
      depth: 8,
      height: 8,
      infill: 80,
      material: referenceMaterial,
    })

    expect(highInfill.volume).toBeGreaterThan(lowInfill.volume)
    expect(highInfill.totalCost).toBeGreaterThan(lowInfill.totalCost)
  })

  it('increases time cost for slower materials with the same geometry', () => {
    const fastMaterial: Material = { ...referenceMaterial, id: 'fast', printSpeed: 20 }
    const slowMaterial: Material = { ...referenceMaterial, id: 'slow', printSpeed: 5 }

    const fastResult = calculatePrintCost({
      width: 6,
      depth: 6,
      height: 6,
      infill: 30,
      material: fastMaterial,
    })
    const slowResult = calculatePrintCost({
      width: 6,
      depth: 6,
      height: 6,
      infill: 30,
      material: slowMaterial,
    })

    expect(slowResult.timeEstimate).toBeGreaterThan(fastResult.timeEstimate)
    expect(slowResult.timeCost).toBeGreaterThan(fastResult.timeCost)
    expect(slowResult.totalCost).toBeGreaterThan(fastResult.totalCost)
  })
})
