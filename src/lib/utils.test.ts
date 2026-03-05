import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('merges utility classes from multiple inputs', () => {
    expect(cn('p-2', 'p-4', 'font-medium')).toBe('p-4 font-medium')
  })
})
