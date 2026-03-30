import process from 'node:process'

import {
  buildIndexNowPayload,
  collectSiteUrls,
  INDEXNOW_ENDPOINT,
  readIndexNowKey,
} from './lib/indexnow.mjs'

function parseCliArgs(argv) {
  const options = {
    dryRun: false,
    origin: 'https://www.kolbusz.xyz',
  }

  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg.startsWith('--origin=')) {
      options.origin = arg.slice('--origin='.length)
    }
  }

  return options
}

async function submitIndexNow({ dryRun, origin }) {
  const [{ key }, siteUrls] = await Promise.all([
    readIndexNowKey({ cwd: process.cwd() }),
    collectSiteUrls({ origin }),
  ])

  const payload = buildIndexNowPayload({
    key,
    origin,
    urlList: siteUrls,
  })

  if (dryRun) {
    console.log(`Collected ${payload.urlList.length} sitemap URLs for ${payload.host}.`)

    payload.urlList.forEach((url) => {
      console.log(url)
    })

    return
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()

  if (!response.ok) {
    throw new Error(
      `IndexNow submission failed with ${response.status} ${response.statusText}\n${responseText}`
    )
  }

  console.log(`Submitted ${payload.urlList.length} URLs to IndexNow for ${payload.host}.`)
  console.log(responseText || response.statusText)
}

const options = parseCliArgs(process.argv.slice(2))

submitIndexNow(options).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
