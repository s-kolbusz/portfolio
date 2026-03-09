import { useRef } from 'react'

import { render, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFocusTrap } from './use-focus-trap'

function TestComponent({ isActive }: { isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, isActive)

  return (
    <div ref={ref}>
      <button data-testid="first">First</button>
      <button data-testid="second">Second</button>
      <button data-testid="last">Last</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  it('wraps focus from last to first on Tab', () => {
    render(<TestComponent isActive={true} />)
    const first = screen.getByTestId('first')
    const last = screen.getByTestId('last')

    last.focus()
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('wraps focus from first to last on Shift+Tab', () => {
    render(<TestComponent isActive={true} />)
    const first = screen.getByTestId('first')
    const last = screen.getByTestId('last')

    first.focus()
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('does not wrap when focusing middle element', () => {
    render(<TestComponent isActive={true} />)
    const second = screen.getByTestId('second')
    second.focus()

    fireEvent.keyDown(window, { key: 'Tab' })
    // In a real browser, focus would move to 'last'.
    // Our mock trap only handles the wrap cases, so it should do nothing (let browser handle it).
    expect(document.activeElement).toBe(second)
  })

  it('does nothing for non-Tab keys', () => {
    render(<TestComponent isActive={true} />)
    const last = screen.getByTestId('last')
    last.focus()

    fireEvent.keyDown(window, { key: 'Enter' })
    expect(document.activeElement).toBe(last)
  })

  it('does nothing when inactive', () => {
    render(<TestComponent isActive={false} />)
    const last = screen.getByTestId('last')

    last.focus()
    fireEvent.keyDown(window, { key: 'Tab' })

    // In a real browser, focus would move to next element outside.
    // Here we just check it didn't wrap to "first" because our mock window listener shouldn't be active
    expect(document.activeElement).not.toBe(screen.getByTestId('first'))
  })
})
