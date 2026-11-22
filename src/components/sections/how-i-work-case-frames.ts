/**
 * A scroll-driven image sequence drawn into a canvas: the frames of a real page, taken one scroll
 * step apart, so the visitor's own scroll moves the page inside the frame. The compressed frames are
 * all fetched (coarse ones first, so a fast scroll has something near to show at once), but only a
 * few around the one on show are kept decoded: 1600 x 1000 bitmaps are 6.4 MB each.
 *
 * Between two frames the page is drawn moved by the fraction of a step (the frames differ by a
 * plain scroll of `step` px), the next frame filling in from below, so slow scrolling and the
 * scroll's ease-out glide instead of stepping. The site's bar (`top` px) is always drawn from one
 * frame (`bar`): it is translucent, so the page showed through it in steps, and its sound icon
 * changed from frame to frame.
 */
export type FrameOptions = {
  /** px the page scrolls from one frame to the next, in frame pixels */
  step: number
  /** the height of the fixed bar at the top, in frame pixels */
  top: number
  /** the frame whose bar is drawn on every frame (one with nothing showing through it) */
  bar: number
}

export class FrameSequence {
  private readonly blobs: (Blob | undefined)[]
  private readonly bitmaps = new Map<number, ImageBitmap>()
  private readonly decoding = new Set<number>()
  private want = 0
  private at = 0
  private drawn = ''
  private bar: HTMLCanvasElement | null = null
  private started = false
  private disposed = false

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly count: number,
    private readonly url: (i: number) => string,
    private readonly opts: FrameOptions
  ) {
    this.blobs = new Array<Blob | undefined>(count)
  }

  /** start fetching: the first frame and the bar's, then every 16th, 8th, 4th, 2nd and the rest */
  load() {
    if (this.started) return
    this.started = true
    const order: number[] = [0, this.opts.bar]
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
          if (i === this.opts.bar) void this.keepBar(this.blobs[i]!)
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
    this.at = Math.min(this.count - 1, Math.max(0, position))
    this.want = Math.floor(this.at)
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
      if (i < lo - 2 || i > hi + 2) {
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

  /** the bar, cut once from its frame */
  private async keepBar(blob: Blob) {
    const { top } = this.opts
    const bmp = await createImageBitmap(blob)
    const c = document.createElement('canvas')
    c.width = bmp.width
    c.height = top
    c.getContext('2d')?.drawImage(bmp, 0, 0)
    bmp.close()
    this.bar = c
    this.drawn = ''
    this.paint()
  }

  private paint() {
    const exact = this.bitmaps.get(this.want)
    // the frame on show and how far towards the next one; without it, the nearest ready frame
    const i = exact ? this.want : this.nearestReady()
    if (i < 0) return
    const b0 = this.bitmaps.get(i)!
    const b1 = exact ? this.bitmaps.get(i + 1) : undefined
    const { step, top } = this.opts
    // whole frame pixels keep the type crisp; the canvas is drawn larger than its pixels anyway
    const shift = b1 ? Math.round((this.at - i) * step) : 0
    const key = `${i}:${shift}`
    if (key === this.drawn) return
    const c = this.canvas
    if (c.width !== b0.width || c.height !== b0.height) {
      c.width = b0.width
      c.height = b0.height
    }
    const ctx = c.getContext('2d')
    if (!ctx) return
    const { width: w, height: h } = c
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, top, w, h - top)
    ctx.clip()
    // the next frame is the page one step further: drawn a step lower, it fills in under this one
    if (b1 && shift > 0) ctx.drawImage(b1, 0, step - shift)
    ctx.drawImage(b0, 0, -shift)
    ctx.restore()
    if (this.bar) ctx.drawImage(this.bar, 0, 0)
    else ctx.drawImage(b0, 0, 0, w, top, 0, 0, w, top)
    this.drawn = key
  }
}
