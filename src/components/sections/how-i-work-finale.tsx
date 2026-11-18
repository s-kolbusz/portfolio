'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  type DropsStage,
  startDropsStage,
  supportsDrops,
} from '@/components/canvas/liquid-hero/drops-stage'
import { usePrefersReducedMotion } from '@/hooks/use-media'

import './how-i-work-finale.css'

const KEYS = ['alone', 'shelf', 'vision', 'fixed'] as const
const SITE = 'https://stronypodhale.pl'

type Kind = 'head' | 'body' | 'mark'
interface Word {
  text: string
  kind: Kind
  w: number
}
interface Line {
  words: Word[]
  x: number
  y: number
  /** extra px between words, so a full line touches both edges of its slot */
  gap: number
}

/** "Need a proven website…? That's what <mark>stronypodhale.pl</mark> is for." → words with kinds */
function words(head: string, body: string): { text: string; kind: Kind }[] {
  const out: { text: string; kind: Kind }[] = []
  const m = /^(.*?)<mark>(.*?)<\/mark>(.*)$/.exec(head)
  const pushHead = (s: string) =>
    s
      .split(/\s+/)
      .filter(Boolean)
      .forEach((t) => out.push({ text: t, kind: 'head' }))
  if (m) {
    pushHead(m[1])
    // the wordmark keeps the punctuation that follows it on the same word
    const tail = /^\S*/.exec(m[3])?.[0] ?? ''
    out.push({ text: m[2], kind: 'mark' })
    if (tail) out.push({ text: tail, kind: 'head' })
    pushHead(m[3].slice(tail.length))
  } else pushHead(head)
  body
    .split(/\s+/)
    .filter(Boolean)
    .forEach((t) => out.push({ text: t, kind: 'body' }))
  return out
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const markHtml = (text: string) => {
  const m = /^(strony)(podhale)(\.pl)$/.exec(text)
  const inner = m
    ? `<span class="acc">${m[1]}</span><span class="str">${m[2]}</span><span class="acc">${m[3]}</span>`
    : esc(text)
  return `<a class="hwf-mark" href="${SITE}" target="_blank" rel="noopener">${inner}</a>`
}

/**
 * Act 4's finale: everything said in the act, set as one text that flows around one big drop of
 * the hero's liquid. The drop is live: the pointer pushes it, a click splashes it, and the lines
 * re-wrap around its new shape as it moves, justified to its edge. The words are always real text
 * in the page (the paragraphs below are the ones search engines and language models read); the
 * liquid only changes where each line stands. While text is selected the layout holds still.
 */
export function HowIWorkFinale() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const stageRef = useRef<HTMLElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const stage = stageRef.current
    const holder = liquidRef.current
    const box = textRef.current
    if (!stage || !holder || !box || !supportsDrops()) return
    const paras = Array.from(box.querySelectorAll<HTMLElement>('[data-p]'))
    const source = paras.map((p) => words(p.dataset.head ?? '', ''))
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return

    // --- sizes, measured once per size of the screen
    let W = 0,
      H = 0,
      fs = 0,
      lh = 0,
      top = 0,
      left = 0,
      right = 0,
      rows = 0,
      R = 0,
      space = 0
    const BIN = 6
    let bins = 0
    let occ = new Float32Array(0)
    let hit = new Uint8Array(0)
    let extLo = new Float32Array(0)
    let extHi = new Float32Array(0)
    let flow: Word[][] = []
    const font = (k: Kind, size: number) =>
      k === 'head'
        ? `700 ${size}px Mattone, system-ui, sans-serif`
        : k === 'mark'
          ? `500 ${size * 1.12}px "Cabinet Grotesk", system-ui, sans-serif`
          : `500 ${size}px "Cabinet Grotesk", system-ui, sans-serif`
    const measure = () => {
      const r = stage.getBoundingClientRect()
      W = r.width
      H = r.height
      const phone = W <= 700
      const pad = parseFloat(getComputedStyle(stage).paddingLeft) || 24
      left = pad
      right = W - pad
      top = parseFloat(getComputedStyle(stage).paddingTop) || 64
      R = phone ? Math.min(W * 0.15, 64) : Math.max(70, Math.min(H * 0.2, W * 0.13, 190))
      // every word measured once at 100px; sizes below scale from it
      ctx.font = font('body', 100)
      const space100 = ctx.measureText(' ').width
      const at100 = source.map((ws) =>
        ws.map((w) => {
          ctx.font = font(w.kind, 100)
          const width = ctx.measureText(w.text).width
          // the wordmark's letters are set tighter (-0.035em), as in its logo
          return { ...w, w: w.kind === 'mark' ? width - 0.035 * 112 * w.text.length : width }
        })
      )
      const ink100 = at100.reduce((s, ws) => s + ws.reduce((t, w) => t + w.w + space100, 0), 0)
      // the largest size at which the four lines fill the stage around the drop, with an empty row
      // between them: few words, big and heavy, so each one carries weight
      const width = right - left
      const availH = H - top * 2
      fs = phone ? 18 : 22
      for (let size = phone ? 34 : 84; size >= (phone ? 18 : 22); size -= 0.5) {
        const lineH = size * 1.16
        const area = Math.floor(availH / lineH) * lineH * width
        const drop = (2 * R + 2 * size * 0.9) * (2 * R + lineH)
        const need = (ink100 * (size / 100) * 1.25 + at100.length * width * 1.5) * lineH
        if (need <= area - drop) {
          fs = size
          break
        }
      }
      lh = fs * 1.16
      box.style.fontSize = `${fs}px`
      box.style.lineHeight = `${lh}px`
      rows = Math.max(1, Math.floor(availH / lh))
      // the text block stands in the middle of the stage
      top += (availH - rows * lh) / 2
      bins = Math.ceil(W / BIN)
      occ = new Float32Array(rows * bins)
      hit = new Uint8Array(rows * bins)
      extLo = new Float32Array(rows).fill(-1)
      extHi = new Float32Array(rows).fill(-1)
      space = space100 * (fs / 100)
      flow = at100.map((ws) => ws.map((w) => ({ ...w, w: w.w * (fs / 100) })))
    }

    // --- where the liquid stands, row by row; eased so a line does not flicker at the drop's edge
    let xy: Float32Array | null = null
    let n = 0
    const sense = () => {
      hit.fill(0)
      if (!xy) return false
      const padX = fs * 0.9
      const padY = fs * 0.35
      for (let i = 0; i < n; i++) {
        const x = xy[i * 2],
          y = xy[i * 2 + 1]
        if (y < top - lh || y > top + rows * lh + lh) continue
        const r0 = Math.max(0, Math.floor((y - padY - top) / lh))
        const r1 = Math.min(rows - 1, Math.floor((y + padY - top) / lh))
        const b0 = Math.max(0, Math.floor((x - padX) / BIN))
        const b1 = Math.min(bins - 1, Math.floor((x + padX) / BIN))
        for (let r = r0; r <= r1; r++) hit.fill(1, r * bins + b0, r * bins + b1 + 1)
      }
      for (let i = 0; i < occ.length; i++) occ[i] += (hit[i] - occ[i]) * 0.3
      // what the text wraps around: the liquid's extent on each row, changed only when it moved
      // far enough to matter, so the liquid's own quiver never shifts a word
      let moved = false
      for (let r = 0; r < rows; r++) {
        let lo = -1,
          hi = -1
        for (let b = 0; b < bins; b++)
          if (occ[r * bins + b] >= 0.5) {
            if (lo < 0) lo = b * BIN
            hi = (b + 1) * BIN
          }
        const was = lo < 0 !== extLo[r] < 0
        if (was || Math.abs(lo - extLo[r]) > fs * 0.6 || Math.abs(hi - extHi[r]) > fs * 0.6) {
          extLo[r] = lo
          extHi[r] = hi
          moved = true
        }
      }
      return moved
    }

    // --- the layout: free slots on each row, filled with words left to right, top to bottom
    const lines: Line[][] = []
    const layout = () => {
      lines.length = 0
      paras.forEach(() => lines.push([]))
      const minSlot = fs * (W <= 700 ? 6 : 2.6)
      let row = 0
      let slots: [number, number][] = []
      let si = 0
      // one slot a row, on the wider side of the liquid: a big line never jumps across the drop
      // (read as a zigzag, it fell apart), it steps aside and goes on
      const slotsOf = (r: number) => {
        const lo = extLo[r],
          hi = extHi[r]
        if (lo < 0) return [[left, right]] as [number, number][]
        const l = lo - left,
          rr = right - hi
        const best: [number, number] = l >= rr ? [left, lo] : [hi, right]
        return Math.max(l, rr) >= minSlot ? [best] : []
      }
      const nextSlot = () => {
        si++
        while (si >= slots.length) {
          row++
          if (row >= rows + 6) return false
          slots = row < rows ? slotsOf(row) : [[left, right]]
          si = 0
        }
        return true
      }
      slots = slotsOf(0)
      si = -1
      nextSlot()
      for (let p = 0; p < flow.length; p++) {
        const ws = flow[p]
        let i = 0
        while (i < ws.length) {
          const [a, b] = slots[si]
          const width = b - a
          const line: Word[] = []
          let used = 0
          while (i < ws.length) {
            const add = (line.length ? space : 0) + ws[i].w
            if (used + add > width && line.length) break
            if (used + add > width && !line.length) break
            line.push(ws[i])
            used += add
            i++
          }
          if (!line.length) {
            // a word too wide for this slot waits for the next one
            if (!nextSlot()) return
            continue
          }
          // ragged, not justified: big words with stretched gaps read worse
          lines[p].push({ words: line, x: a, y: top + row * lh, gap: 0 })
          if (!nextSlot()) return
        }
        // a new thought starts after an empty row
        if (si !== 0) {
          si = slots.length - 1
          if (!nextSlot()) return
        }
        si = slots.length - 1
        if (!nextSlot()) return
      }
    }

    // --- the lines into the page, touching only what changed
    const shown: string[][] = paras.map(() => [])
    const pools: HTMLSpanElement[][] = paras.map(() => [])
    let laid = false
    const render = () => {
      paras.forEach((p, pi) => {
        if (!laid) p.replaceChildren()
        const ls = lines[pi]
        const pool = pools[pi]
        while (pool.length < ls.length) {
          const s = document.createElement('span')
          s.className = 'hwf-line'
          p.append(s)
          pool.push(s)
        }
        pool.forEach((s, i) => {
          const l = ls[i]
          if (!l) {
            if (shown[pi][i] !== '') {
              s.innerHTML = ''
              s.hidden = true
              shown[pi][i] = ''
            }
            return
          }
          // a trailing space keeps the words apart when the paragraph is read as text
          const html =
            l.words
              .map((w) =>
                w.kind === 'mark'
                  ? markHtml(w.text)
                  : w.kind === 'head'
                    ? `<b>${esc(w.text)}</b>`
                    : esc(w.text)
              )
              .join(' ') + ' '
          if (shown[pi][i] !== html) {
            s.innerHTML = html
            shown[pi][i] = html
          }
          s.hidden = false
          s.style.transform = `translate(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px)`
          s.style.wordSpacing = `${l.gap.toFixed(2)}px`
        })
      })
      if (!laid) {
        box.dataset.live = ''
        laid = true
      }
    }

    const selecting = () => {
      const s = document.getSelection()
      return !!s && !s.isCollapsed && !!s.anchorNode && box.contains(s.anchorNode)
    }

    let liquid: DropsStage | null = null
    const free = () => {
      liquid?.stop()
      liquid = null
      holder.replaceChildren()
    }
    const start = () => {
      free()
      measure()
      const canvas = document.createElement('canvas')
      canvas.className = 'hwf-liquid'
      canvas.setAttribute('aria-hidden', 'true')
      holder.replaceChildren(canvas)
      const home = () => ({ x: W * (W <= 700 ? 0.76 : 0.55), y: top + (rows * lh) / 2 })
      liquid = startDropsStage({
        canvas,
        groups: [R],
        start: home(),
        paper: true,
        frame: () => ({ targets: [home()], rects: [] }),
        shape: (p, count) => {
          xy = p
          n = count
          const moved = sense()
          if (laid && !moved) return
          if (selecting()) return
          layout()
          render()
        },
        onFail: free,
      })
    }

    // only near the screen: the scene gives its WebGL context back when the page is elsewhere
    let near = false
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting === near) return
        near = e.isIntersecting
        if (near) start()
        else free()
      },
      { rootMargin: '100% 0px' }
    )
    io.observe(stage)
    let again = 0
    const onResize = () => {
      clearTimeout(again)
      again = window.setTimeout(() => {
        if (!near) return
        xy = null
        start()
      }, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      clearTimeout(again)
      window.removeEventListener('resize', onResize)
      free()
    }
  }, [reduced])

  return (
    <section ref={stageRef} id="how-i-work" className="hwf" aria-labelledby="hwf-title">
      <div ref={liquidRef} className="hwf-drop" aria-hidden="true" />
      <h2 id="hwf-title" className="sr-only">
        {t('title')}
      </h2>
      <div ref={textRef} className="hwf-text">
        {KEYS.map((key) => {
          const head = t.raw(key) as string
          const m = /^(.*?)<mark>(.*?)<\/mark>(.*)$/.exec(head)
          return (
            <p key={key} className="hwf-p" data-p={key} data-head={head}>
              <b>
                {m ? (
                  <>
                    {m[1]}
                    <a className="hwf-mark" href={SITE} target="_blank" rel="noopener">
                      <span className="acc">strony</span>
                      <span className="str">podhale</span>
                      <span className="acc">.pl</span>
                    </a>
                    {m[3]}
                  </>
                ) : (
                  head
                )}
              </b>
            </p>
          )
        })}
      </div>
    </section>
  )
}
