import fs from 'node:fs/promises'
import path from 'node:path'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
export const INDEXNOW_MAX_URLS_PER_REQUEST = 10_000

const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/u
const INDEXNOW_KEY_FILE_PATTERN = /^[A-Za-z0-9-]{8,128}\.txt$/u
const LOC_TAG_PATTERN = /<loc>(.*?)<\/loc>/giu
const SITEMAP_INDEX_PATTERN = /<sitemapindex[\s>]/iu
const URLSET_PATTERN = /<urlset[\s>]/iu

function uniqueUrls(urls) {
  return [...new Set(urls)]
}

function normalizeUrl(url) {
  return typeof url === 'string' ? url.trim() : ''
}

function assertSiteUrl(originUrl, url) {
  const parsed = new URL(url)

  if (parsed.host !== originUrl.host) {
    throw new Error(`IndexNow only accepts URLs for ${originUrl.host}. Received ${parsed.host}.`)
  }

  return parsed.toString()
}

export function extractLocUrls(xml) {
  return [...xml.matchAll(LOC_TAG_PATTERN)].map((match) => normalizeUrl(match[1])).filter(Boolean)
}

export function buildIndexNowPayload({ key, origin, urlList }) {
  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    throw new Error('IndexNow key must be 8-128 characters using letters, numbers, or hyphens.')
  }

  const originUrl = new URL(origin)
  const normalizedUrlList = uniqueUrls(urlList.map((url) => assertSiteUrl(originUrl, url)))

  if (normalizedUrlList.length === 0) {
    throw new Error('IndexNow submission requires at least one URL.')
  }

  if (normalizedUrlList.length > INDEXNOW_MAX_URLS_PER_REQUEST) {
    throw new Error(`IndexNow submissions are limited to ${INDEXNOW_MAX_URLS_PER_REQUEST} URLs.`)
  }

  return {
    host: originUrl.host,
    key,
    urlList: normalizedUrlList,
  }
}

async function fetchText(fetchImpl, url) {
  const response = await fetchImpl(url)

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}\n${responseText}`
    )
  }

  return response.text()
}

export async function collectSiteUrls({ origin, fetchImpl = fetch }) {
  const sitemapIndexUrl = new URL('/sitemap.xml', origin).toString()
  const sitemapIndexXml = await fetchText(fetchImpl, sitemapIndexUrl)

  if (URLSET_PATTERN.test(sitemapIndexXml)) {
    return uniqueUrls(extractLocUrls(sitemapIndexXml))
  }

  if (!SITEMAP_INDEX_PATTERN.test(sitemapIndexXml)) {
    throw new Error(`${sitemapIndexUrl} is not a sitemap index or URL set.`)
  }

  const sitemapUrls = extractLocUrls(sitemapIndexXml)
  const sitemapXmlDocuments = await Promise.all(
    sitemapUrls.map((sitemapUrl) => fetchText(fetchImpl, sitemapUrl))
  )

  return uniqueUrls(sitemapXmlDocuments.flatMap((xml) => extractLocUrls(xml)))
}

export async function readIndexNowKey({ cwd }) {
  const publicDirectory = path.join(cwd, 'public')
  const entries = await fs.readdir(publicDirectory)

  const candidates = entries.filter((entry) => INDEXNOW_KEY_FILE_PATTERN.test(entry))

  if (candidates.length !== 1) {
    throw new Error(
      `Expected exactly one IndexNow key file in ${publicDirectory}, found ${candidates.length}.`
    )
  }

  const filename = candidates[0]
  const key = (await fs.readFile(path.join(publicDirectory, filename), 'utf8')).trim()
  const basename = path.basename(filename, '.txt')

  if (basename !== key) {
    throw new Error(`IndexNow key file ${filename} must contain the same key as its filename.`)
  }

  return {
    key,
    filename,
  }
}
