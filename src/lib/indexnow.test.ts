import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildIndexNowPayload,
  collectSiteUrls,
  extractLocUrls,
  INDEXNOW_MAX_URLS_PER_REQUEST,
  readIndexNowKey,
} from '../../scripts/lib/indexnow.mjs'

describe('indexnow', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('extracts loc URLs from sitemap XML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kolbusz.xyz/en</loc></url>
  <url><loc>https://kolbusz.xyz/pl</loc></url>
</urlset>`

    expect(extractLocUrls(xml)).toEqual(['https://kolbusz.xyz/en', 'https://kolbusz.xyz/pl'])
  })

  it('builds an IndexNow payload with a deduplicated URL list', () => {
    const payload = buildIndexNowPayload({
      key: '03FD1F23-71A6-49A0-97B4-5233F1351B67',
      origin: 'https://kolbusz.xyz',
      urlList: ['https://kolbusz.xyz/en', 'https://kolbusz.xyz/pl', 'https://kolbusz.xyz/en'],
    })

    expect(payload).toEqual({
      host: 'kolbusz.xyz',
      key: '03FD1F23-71A6-49A0-97B4-5233F1351B67',
      urlList: ['https://kolbusz.xyz/en', 'https://kolbusz.xyz/pl'],
    })
  })

  it('rejects URLs outside the verified host', () => {
    expect(() =>
      buildIndexNowPayload({
        key: '03FD1F23-71A6-49A0-97B4-5233F1351B67',
        origin: 'https://kolbusz.xyz',
        urlList: ['https://example.com/en'],
      })
    ).toThrow('IndexNow only accepts URLs for kolbusz.xyz')
  })

  it('rejects payloads larger than the IndexNow limit', () => {
    const urlList = Array.from({ length: INDEXNOW_MAX_URLS_PER_REQUEST + 1 }, (_, index) => {
      return `https://kolbusz.xyz/en/page-${index}`
    })

    expect(() =>
      buildIndexNowPayload({
        key: '03FD1F23-71A6-49A0-97B4-5233F1351B67',
        origin: 'https://kolbusz.xyz',
        urlList,
      })
    ).toThrow(`IndexNow submissions are limited to ${INDEXNOW_MAX_URLS_PER_REQUEST} URLs.`)
  })

  it('collects localized page URLs from a sitemap index', async () => {
    const responses = new Map<string, string>([
      [
        'https://kolbusz.xyz/sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://kolbusz.xyz/en/sitemap.xml</loc></sitemap>
  <sitemap><loc>https://kolbusz.xyz/pl/sitemap.xml</loc></sitemap>
</sitemapindex>`,
      ],
      [
        'https://kolbusz.xyz/en/sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kolbusz.xyz/en</loc></url>
  <url><loc>https://kolbusz.xyz/en/projects</loc></url>
</urlset>`,
      ],
      [
        'https://kolbusz.xyz/pl/sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kolbusz.xyz/pl</loc></url>
  <url><loc>https://kolbusz.xyz/pl/projects</loc></url>
</urlset>`,
      ],
    ])

    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const body = responses.get(url)

      if (!body) {
        return new Response('Not found', { status: 404 })
      }

      return new Response(body, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
        },
      })
    })

    const urls = await collectSiteUrls({
      origin: 'https://kolbusz.xyz',
      fetchImpl: fetchImpl as typeof fetch,
    })

    expect(urls).toEqual([
      'https://kolbusz.xyz/en',
      'https://kolbusz.xyz/en/projects',
      'https://kolbusz.xyz/pl',
      'https://kolbusz.xyz/pl/projects',
    ])
  })

  it('reads the root IndexNow key file from public/', async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'indexnow-'))
    const publicDirectory = path.join(cwd, 'public')
    const key = '03FD1F23-71A6-49A0-97B4-5233F1351B67'

    await fs.mkdir(publicDirectory)
    await fs.writeFile(path.join(publicDirectory, `${key}.txt`), key)

    await expect(readIndexNowKey({ cwd })).resolves.toEqual({
      key,
      filename: `${key}.txt`,
    })
  })
})
