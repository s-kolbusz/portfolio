import { describe, expect, it } from 'vitest'

import {
  collectInvalidKeyPaths,
  EXPECTED_TOP_LEVEL_NAMESPACES,
  getLeafPathParity,
  getTopLevelNamespaceDiff,
} from './message-contract'
import enMessages from './messages/en.json'
import plMessages from './messages/pl.json'

describe('i18n message contract', () => {
  it('keeps the normalized top-level namespaces only', () => {
    expect(getTopLevelNamespaceDiff(enMessages)).toEqual({
      extra: [],
      missing: [],
    })
    expect(getTopLevelNamespaceDiff(plMessages)).toEqual({
      extra: [],
      missing: [],
    })
    expect(Object.keys(enMessages).sort()).toEqual([...EXPECTED_TOP_LEVEL_NAMESPACES].sort())
  })

  it('keeps locale message leaf paths in parity', () => {
    expect(getLeafPathParity(enMessages, plMessages)).toEqual({
      extra: [],
      missing: [],
    })
  })

  it('uses dot-namespaced camelCase keys', () => {
    expect(collectInvalidKeyPaths(enMessages)).toEqual([])
    expect(collectInvalidKeyPaths(plMessages)).toEqual([])
  })
})
