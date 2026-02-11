export interface Material {
  id: string
  name: string
  density: number // g/cm³
  pricePerGram: number // €
  printSpeed: number // mm³/s
}

const SPEED_STANDARD = 22 // mm³/s
const SPEED_SLOW = 4 // mm³/s

export const BUILD_VOLUME_X = 200 //mm
export const BUILD_VOLUME_Y = 200 //mm
export const BUILD_VOLUME_Z = 220 //mm

export const MATERIALS: Material[] = [
  {
    id: 'pla',
    name: 'PLA (Standard)',
    density: 1.24,
    pricePerGram: 0.025,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'petg',
    name: 'PETG (Durable)',
    density: 1.27,
    pricePerGram: 0.028,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'tpu',
    name: 'TPU (Flexible)',
    density: 1.21,
    pricePerGram: 0.035,
    printSpeed: SPEED_SLOW,
  },
  {
    id: 'abs',
    name: 'ABS (Heat Resistant)',
    density: 1.04,
    pricePerGram: 0.025,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'asa',
    name: 'ASA (UV Resistant)',
    density: 1.07,
    pricePerGram: 0.03,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'petg-cf',
    name: 'PETG-CF (Carbon Fiber)',
    density: 1.29,
    pricePerGram: 0.045,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'abs-cf',
    name: 'ABS-CF (Carbon Fiber)',
    density: 1.06,
    pricePerGram: 0.045,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'asa-cf',
    name: 'ASA-CF (Carbon Fiber)',
    density: 1.09,
    pricePerGram: 0.05,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'abs-gf',
    name: 'ABS-GF (Glass Fiber)',
    density: 1.06,
    pricePerGram: 0.04,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'asa-gf',
    name: 'ASA-GF (Glass Fiber)',
    density: 1.09,
    pricePerGram: 0.045,
    printSpeed: SPEED_STANDARD,
  },
  {
    id: 'nylon',
    name: 'Nylon (PA6/PA12)',
    density: 1.15,
    pricePerGram: 0.06,
    printSpeed: SPEED_STANDARD,
  },
]
