#!/usr/bin/env node

import { scanProjectCodeSplitting } from './code-splitting-policy.mjs'

const errors = scanProjectCodeSplitting(process.cwd())

if (errors.length > 0) {
  console.error(`check:code-splitting failed with ${errors.length} issue(s):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('check:code-splitting passed')
