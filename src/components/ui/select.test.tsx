import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Select } from './select'

// Mock useScrollStore
vi.mock('@/lib/stores', () => ({
  useScrollStore: vi.fn((selector) => selector({ lenis: { stop: vi.fn(), start: vi.fn() } })),
}))

describe('Select', () => {
  const options = new Map([
    ['opt1', { label: 'Option 1', value: 'opt1' }],
    ['opt2', { label: 'Option 2', value: 'opt2' }],
  ])

  it('renders the label and default value', () => {
    render(<Select id="test-select" label="Choose one" options={options} onChange={vi.fn()} />)

    expect(screen.getByText('Choose one')).toBeInTheDocument()
    // Default value should be the first key in the map
    expect(screen.getByText('Option 1')).toBeInTheDocument()
  })

  it('calls onChange when a new value is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select id="test-select" label="Choose one" options={options} onChange={onChange} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const option2 = await screen.findByRole('option', { name: 'Option 2' })
    await user.click(option2)

    expect(onChange).toHaveBeenCalledWith('opt2')
  })

  it('associates the label with the trigger via id', () => {
    render(<Select id="my-select" label="Choose one" options={options} onChange={vi.fn()} />)

    const label = screen.getByText('Choose one')
    expect(label).toHaveAttribute('for', 'my-select')
  })
})
