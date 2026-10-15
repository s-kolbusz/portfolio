import { describe, expect, it } from 'vitest'

import { getFaqKeys } from './faq-keys'

describe('getFaqKeys', () => {
  it('returns the keys of well-formed entries, in order', () => {
    const raw = {
      '0': { question: 'How long?', answer: 'Two weeks.' },
      '1': { question: 'Hosting?', answer: 'Yes.' },
    }

    expect(getFaqKeys(raw)).toEqual(['0', '1'])
  })

  it('drops entries without a question and an answer', () => {
    const raw = {
      '0': { question: 'How long?', answer: 'Two weeks.' },
      '1': { question: 'Missing answer' },
      '2': 'not an entry',
      '3': null,
    }

    expect(getFaqKeys(raw)).toEqual(['0'])
  })

  it('returns nothing for messages that are not an object', () => {
    expect(getFaqKeys(undefined)).toEqual([])
    expect(getFaqKeys(null)).toEqual([])
    expect(getFaqKeys('faq')).toEqual([])
  })
})
