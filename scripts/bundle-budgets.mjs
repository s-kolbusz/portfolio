import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const BUNDLE_BUDGETS_PATH = path.join(process.cwd(), 'scripts', 'bundle-budgets.json')

export const ROUTE_BUNDLE_BUDGETS = JSON.parse(readFileSync(BUNDLE_BUDGETS_PATH, 'utf8'))

export function parseClientReferenceManifest(source) {
  const context = { globalThis: {} }
  vm.runInNewContext(source, context)

  const manifests = Object.values(context.globalThis.__RSC_MANIFEST ?? {})
  if (manifests.length === 0) {
    throw new Error('Client reference manifest did not register any routes.')
  }

  return manifests[0]
}

export function evaluateRouteBudgets(routeReports) {
  return routeReports
    .filter((routeReport) => routeReport.totalBytes > routeReport.budgetBytes)
    .map(
      (routeReport) =>
        `Route ${routeReport.route} (${routeReport.label}) exceeds bundle budget: ${routeReport.totalBytes} B > ${routeReport.budgetBytes} B.`
    )
}

function readRouteManifest(projectRoot, manifestPath) {
  const absoluteManifestPath = path.join(projectRoot, manifestPath)

  try {
    return readFileSync(absoluteManifestPath, 'utf8')
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(
        `Missing build artifact at ${manifestPath}. Run pnpm build before pnpm check:bundle-budgets.`
      )
    }

    throw error
  }
}

export function collectRouteBudgets(projectRoot, routeBudgets = ROUTE_BUNDLE_BUDGETS) {
  return routeBudgets.map((routeBudget) => {
    const manifestSource = readRouteManifest(projectRoot, routeBudget.manifestPath)
    const manifest = parseClientReferenceManifest(manifestSource)
    const files = manifest.entryJSFiles?.[routeBudget.entryKey]

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error(
        `Could not find entryJSFiles for ${routeBudget.entryKey} in ${routeBudget.manifestPath}.`
      )
    }

    const totalBytes = files.reduce(
      (sum, file) => sum + statSync(path.join(projectRoot, '.next', file)).size,
      0
    )

    return {
      ...routeBudget,
      files,
      totalBytes,
    }
  })
}

function formatRouteStatus(routeReport) {
  const status = routeReport.totalBytes > routeReport.budgetBytes ? 'FAIL' : 'PASS'
  return `${status} ${routeReport.route} (${routeReport.label}) ${routeReport.totalBytes} B / ${routeReport.budgetBytes} B`
}

export function formatRouteBudgetReport(routeReports) {
  return routeReports.map(formatRouteStatus)
}
