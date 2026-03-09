import { describe, expect, it, beforeEach } from 'vitest'

import { useCursorStore } from './cursor'

describe('cursor store', () => {
  beforeEach(() => {
    useCursorStore.setState({
      variant: 'default',
      text: null,
      magneticTarget: null,
    })
  })

  it('updates the variant', () => {
    useCursorStore.getState().setVariant('button')
    expect(useCursorStore.getState().variant).toBe('button')
  })

  it('updates the text', () => {
    useCursorStore.getState().setText('hello')
    expect(useCursorStore.getState().text).toBe('hello')
  })

  it('updates the magnetic target', () => {
    const el = document.createElement('div')
    useCursorStore.getState().setMagneticTarget(el)
    expect(useCursorStore.getState().magneticTarget).toBe(el)
  })
})
