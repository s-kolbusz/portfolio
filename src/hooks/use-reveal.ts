import { type RefObject, useEffect } from 'react'

/** the length of one rise (rise.css), and how much faster everything leaves when the page goes back up */
const RISE = 0.8
const BACK = 1.4

export interface RevealOptions {
  /** the scene plays once its top is above this fraction of the screen's height */
  at?: number
  /** it goes back once its top falls below this fraction again (higher than `at`: no flicker at the line) */
  back?: number
}

export interface RevealDetail {
  on: boolean
  /** set in place without playing: on load, after a jump, or a scene the page flew past */
  instant: boolean
}

/** Delays for leaving: the last to come in is the first to go, 1.4x faster. */
export function reverseDelays(delays: number[]): number[] {
  const max = Math.max(0, ...delays)
  return delays.map((d) => (max - d) / BACK)
}

/** Whether a scene at this place should be in, given where it was (null: not known yet). */
export function wantIn(top: number, vh: number, was: boolean | null, { at = 0.75, back = 0.92 }) {
  return was ? top < vh * back : top < vh * at
}

/**
 * The site's reveal for a scene: when its top comes up past a line on the screen, everything in it
 * marked to rise (rise.tsx: .rv-i words, .rv-b blocks and .rv-l lines, with their --d delays) plays in, in time,
 * not tied to the scroll, so it never stops halfway; going back up it leaves. A scene that is already
 * past the line when the page loads, or that the page flies past, is set in place without playing:
 * effects must not fire after a reload or a fast scroll (owner, 2026-11-18).
 * The scene gets a `rv` event with {on, instant} for anything it moves itself.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, options: RevealOptions = {}) {
  const { at = 0.75, back = 0.92 } = options
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = Array.from(root.querySelectorAll<HTMLElement>('.rv-i, .rv-b, .rv-l'))
    const delays = items.map((el) => parseFloat(el.style.getPropertyValue('--d')) || 0)
    reverseDelays(delays).forEach((d, i) => items[i].style.setProperty('--dr', d.toFixed(3)))
    const total = (Math.max(0, ...delays) + RISE) * 1000

    let state: boolean | null = null
    let doneTimer = 0
    let nowFrame = 0
    const set = (on: boolean, instant: boolean) => {
      state = on
      window.clearTimeout(doneTimer)
      cancelAnimationFrame(nowFrame)
      if (instant) root.setAttribute('data-rv-now', '')
      root.toggleAttribute('data-in', on)
      root.removeAttribute('data-rv-done')
      if (on)
        doneTimer = window.setTimeout(
          () => root.setAttribute('data-rv-done', ''),
          instant ? 0 : total
        )
      if (instant) {
        // two frames: the new state is drawn without transitions before they come back
        nowFrame = requestAnimationFrame(() => {
          nowFrame = requestAnimationFrame(() => root.removeAttribute('data-rv-now'))
        })
      }
      root.dispatchEvent(new CustomEvent<RevealDetail>('rv', { detail: { on, instant } }))
    }
    const check = () => {
      const r = root.getBoundingClientRect()
      const vh = window.innerHeight
      const want = wantIn(r.top, vh, state, { at, back })
      if (want === state) return
      // flown past: the scene is already mostly gone above the screen
      const past = want && r.bottom < vh * 0.35
      set(want, state === null || reduced || past)
    }
    root.setAttribute('data-rv', '')
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearTimeout(doneTimer)
      cancelAnimationFrame(nowFrame)
      root.removeAttribute('data-rv')
      root.removeAttribute('data-in')
      root.removeAttribute('data-rv-done')
    }
  }, [ref, at, back])
}
