// Terrain heights behind the hero's contour lines: a 512×512 cut (AWS Terrain Tiles, Mapzen, z12,
// x2273–2274, y1401–1402); `start` is a cut with an even density of contour lines (x, y, w, h).
// About 1.2 MB, loaded with real progress, which the loader shows by filling the initials.

export interface Terrain {
  w: number
  h: number
  start: [number, number, number, number]
  data: number[]
}

export const TERRAIN_URL = '/hero/terrain.json'

export async function loadTerrain(
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<Terrain> {
  const res = await fetch(TERRAIN_URL, { signal })
  if (!res.ok || !res.body) throw new Error(`terrain: HTTP ${res.status}`)
  const total = +(res.headers.get('content-length') ?? 0) || 1.25e6
  const reader = res.body.getReader()
  const parts: Uint8Array[] = []
  let got = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parts.push(value)
    got += value.length
    onProgress(Math.min(got / total, 0.98))
  }
  const text = await new Blob(parts as BlobPart[]).text()
  const terrain = JSON.parse(text) as Terrain
  onProgress(1)
  return terrain
}
