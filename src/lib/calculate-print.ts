import { type Material } from '@/data/materials'

interface CalculationInput {
  width: number // cm
  depth: number // cm
  height: number // cm
  infill: number // 0-100
  material: Material
}

interface CalculationResult {
  volume: number // cm³
  materialCost: number // €
  timeEstimate: number // hours
  timeCost: number // €
  totalCost: number // €
}

const CONSTANTS = {
  SHELL_FACTOR: 0.15, // 15% of volume is solid shell
  HOURLY_RATE: 0.75, // € per printing hour
  MARGIN: 0.3, // 30% margin
}

export function calculatePrintCost(input: CalculationInput): CalculationResult {
  const { width, depth, height, infill, material } = input

  // Calculate raw volume of the bounding box
  const rawVolume = width * depth * height

  // Calculate effective printed volume
  // Solid shell (always printed) + Infill volume
  const infillDecimal = infill / 100
  const effectiveVolume =
    rawVolume * (CONSTANTS.SHELL_FACTOR + (1 - CONSTANTS.SHELL_FACTOR) * infillDecimal)

  // Material Cost
  const materialCost = effectiveVolume * material.density * material.pricePerGram

  // Time Estimation
  // Convert mm³/s to cm³/h: speed * 3600 / 1000 = speed * 3.6
  const printSpeedCm3H = material.printSpeed * 3.6
  const timeEstimate = effectiveVolume / printSpeedCm3H
  const timeCost = timeEstimate * CONSTANTS.HOURLY_RATE

  // Total Cost with Margin
  const totalCost = (materialCost + timeCost) * (1 + CONSTANTS.MARGIN)

  return {
    volume: effectiveVolume,
    materialCost,
    timeEstimate,
    timeCost,
    totalCost,
  }
}
