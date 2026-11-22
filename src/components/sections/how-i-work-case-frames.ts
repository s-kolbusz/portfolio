/**
 * A scroll-driven image sequence drawn into a canvas: the frames of a real page, taken one scroll
 * step apart, so the visitor's own scroll moves the page inside the frame. The compressed frames are
 * all fetched (coarse ones first, so a fast scroll has something near to show at once), but only a
 * few around the one on show are kept decoded: 1600 x 1000 bitmaps are 6.4 MB each.
 */
export class FrameSequence {
  private readonly blobs: (Blob | undefined)[]
  private readonly bitmaps = new Map<number, ImageBitmap>()
  private readonly decoding = new Set<number>()
  private want = 0
  private drawn = -1
  private started = false
  private disposed = false

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly count: number,
    private readonly url: (i: number) => string
  ) {
    this.blobs = new Array<Blob | undefined>(count)
  }

  /** start fetching: the first frame, then every 16th, 8th, 4th, 2nd and the rest */
  load() {
    if (this.started) return
    this.started = true
    const order: number[] = [0]
    const seen = new Set(order)
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < this.count; i += stride) {
        if (!seen.has(i)) {
          seen.add(i)
          order.push(i)
        }
      }
    }
    let next = 0
    const worker = async () => {
      while (next < order.length && !this.disposed) {
        const i = order[next++]!
        try {
          const res = await fetch(this.url(i))
          this.blobs[i] = await res.blob()
          this.ensure()
        } catch {
          // a missing frame is skipped: the nearest one is shown instead
        }
      }
    }
    for (let k = 0; k < 6; k++) void worker()
  }

  /** show the frame at this position, 0..count-1 (fractions round to the nearest) */
  show(position: number) {
    this.want = Math.min(this.count - 1, Math.max(0, Math.round(position)))
    this.ensure()
    this.paint()
  }

  dispose() {
    this.disposed = true
    this.bitmaps.forEach((b) => b.close())
    this.bitmaps.clear()
  }

  /** frames kept decoded on each side of the one on show */
  private static readonly AHEAD = 4

  private ensure() {
    const lo = this.want - FrameSequence.AHEAD
    const hi = this.want + FrameSequence.AHEAD
    // drop what scrolled out of reach
    this.bitmaps.forEach((b, i) => {
      if ((i < lo - 2 || i > hi + 2) && i !== this.drawn) {
        b.close()
        this.bitmaps.delete(i)
      }
    })
    // decode the wanted one first, then outwards
    const targets = [this.want]
    for (let d = 1; d <= FrameSequence.AHEAD; d++) targets.push(this.want + d, this.want - d)
    // when the wanted frame is not fetched yet, the nearest fetched one stands in
    if (!this.blobs[this.want]) {
      const near = this.nearestFetched()
      if (near >= 0) targets.unshift(near)
    }
    for (const i of targets) {
      if (i < 0 || i >= this.count) continue
      const blob = this.blobs[i]
      if (!blob || this.bitmaps.has(i) || this.decoding.has(i)) continue
      this.decoding.add(i)
      createImageBitmap(blob)
        .then((bmp) => {
          this.decoding.delete(i)
          if (this.disposed) return bmp.close()
          this.bitmaps.set(i, bmp)
          this.paint()
        })
        .catch(() => this.decoding.delete(i))
    }
  }

  private nearestFetched() {
    for (let d = 0; d < this.count; d++) {
      if (this.blobs[this.want - d]) return this.want - d
      if (this.blobs[this.want + d]) return this.want + d
    }
    return -1
  }

  private nearestReady() {
    for (let d = 0; d < this.count; d++) {
      if (this.bitmaps.has(this.want - d)) return this.want - d
      if (this.bitmaps.has(this.want + d)) return this.want + d
    }
    return -1
  }

  private paint() {
    const i = this.nearestReady()
    if (i < 0 || i === this.drawn) return
    const bmp = this.bitmaps.get(i)!
    const c = this.canvas
    if (c.width !== bmp.width || c.height !== bmp.height) {
      c.width = bmp.width
      c.height = bmp.height
    }
    c.getContext('2d')?.drawImage(bmp, 0, 0)
    this.drawn = i
  }
}
