'use client'

import { useEffect } from 'react'

import { useServerInsertedHTML } from 'next/navigation'

import { serializeJsonLd } from '@/lib/serialize-json-ld'

type StructuredDataEntry = {
  id: string
  data: unknown
}

type StructuredDataProps = {
  entries: StructuredDataEntry[]
}

function createStructuredDataMarkup(entry: StructuredDataEntry) {
  return {
    __html: serializeJsonLd(entry.data),
  }
}

function removeStructuredDataScript(id: string) {
  document.querySelectorAll(`script[data-json-ld-id="${id}"]`).forEach((script) => script.remove())
}

function upsertStructuredDataScript(entry: StructuredDataEntry) {
  const selector = `script[data-json-ld-id="${entry.id}"]`
  const existing =
    document.head.querySelector<HTMLScriptElement>(selector) ??
    document.body.querySelector<HTMLScriptElement>(selector)

  if (existing) {
    const html = createStructuredDataMarkup(entry).__html

    if (existing.text !== html) {
      existing.text = html
    }

    if (existing.parentElement !== document.head) {
      document.head.append(existing)
    }

    return
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.dataset.jsonLdId = entry.id
  script.text = createStructuredDataMarkup(entry).__html
  document.head.append(script)
}

export function StructuredData({ entries }: StructuredDataProps) {
  useServerInsertedHTML(() => (
    <>
      {entries.map((entry) => (
        <script
          key={entry.id}
          data-json-ld-id={entry.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={createStructuredDataMarkup(entry)}
        />
      ))}
    </>
  ))

  useEffect(() => {
    entries.forEach(upsertStructuredDataScript)

    return () => {
      entries.forEach(({ id }) => removeStructuredDataScript(id))
    }
  }, [entries])

  return null
}
