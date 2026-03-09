import type Lenis from 'lenis'
import { describe, expect, it, beforeEach } from 'vitest'

import { useScrollStore } from './scroll'

describe('scroll store', () => {
  beforeEach(() => {
    useScrollStore.setState({
      lenis: null,
    })
  })

  it('updates the lenis instance', () => {
    const mockLenis = { raf: () => {} } as unknown as Lenis
    useScrollStore.getState().setLenis(mockLenis)
    expect(useScrollStore.getState().lenis).toBe(mockLenis)
  })
})
