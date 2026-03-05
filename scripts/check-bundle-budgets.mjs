#!/usr/bin/env node

import {
  collectRouteBudgets,
  evaluateRouteBudgets,
  formatRouteBudgetReport,
} from './bundle-budgets.mjs'

const routeReports = collectRouteBudgets(process.cwd())
const violations = evaluateRouteBudgets(routeReports)

console.log('Bundle budgets:')
for (const line of formatRouteBudgetReport(routeReports)) {
  console.log(`- ${line}`)
}

if (violations.length > 0) {
  console.error(`check:bundle-budgets failed with ${violations.length} issue(s):`)
  for (const violation of violations) {
    console.error(`- ${violation}`)
  }
  process.exit(1)
}

console.log('check:bundle-budgets passed')
