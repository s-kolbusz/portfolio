import { useRef } from 'react'

import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Rise, riseAt } from '@/components/ui/rise'

import { reverseDelays, useReveal, wantIn } from './use-reveal'

describe('reverseDelays', () => {
  it('lets the last one in leave first, 1.4x faster', () => {
    expect(reverseDelays([0, 0.7, 1.4])).toEqual([1, 0.5, 0])
  })
  it('handles an empty scene', () => {
    expect(reverseDelays([])).toEqual([])
  })
})

describe('wantIn', () => {
  it('comes in above the line and goes back only below the lower one', () => {
    expect(wantIn(800, 1000, null, { at: 0.75, back: 0.92 })).toBe(false)
    expect(wantIn(700, 1000, false, { at: 0.75, back: 0.92 })).toBe(true)
    expect(wantIn(850, 1000, true, { at: 0.75, back: 0.92 })).toBe(true)
    expect(wantIn(950, 1000, true, { at: 0.75, back: 0.92 })).toBe(false)
  })
})

let topNow = 0

function Scene() {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)
  return (
    <section
      ref={(el) => {
        ref.current = el
        if (el) el.getBoundingClientRect = () => ({ top: topNow, bottom: topNow + 600 }) as DOMRect
      }}
      data-testid="scene"
    >
      <h2>
        <Rise text="Where will it cut" at={0.1} />
      </h2>
      <p className="rv-b" style={riseAt(0.5)}>
        block
      </p>
    </section>
  )
}

const mount = (top: number) => {
  topNow = top
  return render(<Scene />)
}

describe('useReveal', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    vi.stubGlobal('innerHeight', 1000)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('splits text into words that rise one after another', () => {
    const { container } = mount(2000)
    const words = container.querySelectorAll<HTMLElement>('.rv-i')
    expect(words).toHaveLength(4)
    expect(container.querySelector('h2')?.textContent).toBe('Where will it cut')
    expect(words[1].style.getPropertyValue('--d')).toBe('0.14')
  })

  it('arms a scene below the line, hidden, with leaving delays', () => {
    const { getByTestId } = mount(2000)
    const scene = getByTestId('scene')
    expect(scene.hasAttribute('data-rv')).toBe(true)
    expect(scene.hasAttribute('data-in')).toBe(false)
    expect(scene.querySelector<HTMLElement>('.rv-b')?.style.getPropertyValue('--dr')).toBe('0.000')
  })

  it('sets a scene already past the line in place at once', () => {
    const { getByTestId } = mount(100)
    const scene = getByTestId('scene')
    expect(scene.hasAttribute('data-in')).toBe(true)
    expect(scene.hasAttribute('data-rv-now')).toBe(true)
  })

  it('plays in when scrolled up past the line, and goes back below the lower one', () => {
    const { getByTestId } = mount(2000)
    const scene = getByTestId('scene')
    const seen: Array<{ on: boolean; instant: boolean }> = []
    scene.addEventListener('rv', (e) => seen.push((e as CustomEvent).detail))
    topNow = 600
    window.dispatchEvent(new Event('scroll'))
    expect(scene.hasAttribute('data-in')).toBe(true)
    topNow = 960
    window.dispatchEvent(new Event('scroll'))
    expect(scene.hasAttribute('data-in')).toBe(false)
    expect(seen).toEqual([
      { on: true, instant: false },
      { on: false, instant: false },
    ])
  })

  it('sets a scene the page flew past in place without playing', () => {
    const { getByTestId } = mount(2000)
    const scene = getByTestId('scene')
    topNow = -500
    window.dispatchEvent(new Event('scroll'))
    expect(scene.hasAttribute('data-rv-now')).toBe(true)
  })
})
