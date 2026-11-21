/** The hero samples: the live blob's bench first, then the combined second round and the first three (shared by the server route and the client component). */
export type HeroFrameVariant = 'kadr-imie' | 'kadr-slowa' | 'kadr-materia'

export type HeroSampleVariant =
  'blob' | 'zlozenie' | 'materia' | 'okno' | 'czynniki' | HeroFrameVariant

/** Still layout frames for the hero: what is biggest is the name, the words or the matter. */
export const HERO_FRAME_VARIANTS: readonly HeroFrameVariant[] = [
  'kadr-imie',
  'kadr-slowa',
  'kadr-materia',
]

export const HERO_SAMPLE_VARIANTS: readonly HeroSampleVariant[] = [
  'blob',
  'zlozenie',
  'materia',
  'okno',
  'czynniki',
  ...HERO_FRAME_VARIANTS,
]

export function isHeroFrameVariant(variant: HeroSampleVariant): variant is HeroFrameVariant {
  return (HERO_FRAME_VARIANTS as readonly HeroSampleVariant[]).includes(variant)
}
