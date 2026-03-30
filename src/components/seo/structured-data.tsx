import { serializeJsonLd } from '@/lib/serialize-json-ld'

type StructuredDataEntry = {
  id: string
  data: unknown
}

type StructuredDataProps = {
  entries: StructuredDataEntry[]
}

export function StructuredData({ entries }: StructuredDataProps) {
  return (
    <>
      {entries.map((entry) => (
        <script
          key={entry.id}
          data-json-ld-id={entry.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(entry.data),
          }}
        />
      ))}
    </>
  )
}
