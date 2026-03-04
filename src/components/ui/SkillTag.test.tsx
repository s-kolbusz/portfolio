import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SkillTag } from './SkillTag'

describe('SkillTag', () => {
  it('renders the skill label', () => {
    render(<SkillTag name="TypeScript" />)

    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
