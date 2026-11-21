'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Rise } from '@/components/ui/rise'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useReveal } from '@/hooks/use-reveal'

import './how-i-work-case.css'

const SCENES = ['wybiegi', 'verdi', 'miasto', 'jelenie'] as const
const PHOTOS = [0, 1, 2].map((i) => `/images/act4/piczura-photo-${i}.webp`)
/** how the client's photos are named in the grid: files, the way they arrive */
const FILES = ['DSC_0418.jpg', 'DSC_0731.jpg', 'IMG_2206.jpg']
const PICZURA = 'https://piczura.com'
/** the scroll through the track, 0..1 */
const T = {
  land: [0.06, 0.2], // the photos land in an album's even grid
  step: 0.07, // the sentence steps back to the top as the photos start to fall
  grow: [0.3, 0.46], // the grid breaks: the middle photo grows into the frame, the others go
  play: [0.42, 0.5], // the photo turns into the recorded scene
  gave: 0.5, // what was made instead, the scene names, the link
} as const
/** how long each scene plays before the next one, ms */
const TURN = 5200

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const glide = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}
type Box = { x: number; y: number; w: number; h: number }

/**
 * Act 4, line 3: "I add my own vision" (owner, 2026-11-21; concept by the Fable agent). One move
 * from what a client brought to what he got. Three of Maciek Piczura's photos land in an even
 * album grid, named like files: what such photos usually become. Scrolling, the grid breaks: the
 * middle photo grows into a wide frame and turns into a recording of a real piczura.com scene,
 * and the others leave. The four scene names switch the frame and turn over by themselves; the
 * story is told in three sentences beside it. No liquid here: it would mean nothing.
 */
export function HowIWorkCase() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(0)
  const [auto, setAuto] = useState(true)
  const [playing, setPlaying] = useState(false)
  const names = t.raw('case.scenes') as string[]
  useReveal(trackRef, { at: 0.6 })

  // the scenes turn over by themselves until the visitor picks one
  useEffect(() => {
    if (!playing || !auto || reduced) return
    const id = window.setInterval(() => setScene((s) => (s + 1) % SCENES.length), TURN)
    return () => window.clearInterval(id)
  }, [playing, auto, reduced])

  // only the scene on show plays, and only while the frame is on the screen
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.querySelectorAll<HTMLVideoElement>('video').forEach((v, i) => {
      if (playing && i === scene && !reduced) {
        v.currentTime = 0
        void v.play().catch(() => {})
      } else v.pause()
    })
  }, [scene, playing, reduced])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    const photos = Array.from(stage.querySelectorAll<HTMLElement>('.cs-photo'))
    const frame = stage.querySelector<HTMLElement>('.cs-frame')
    const line = stage.querySelector<HTMLElement>('.cs-line')
    const side = stage.querySelector<HTMLElement>('.cs-side')

    let W = 0
    let H = 0
    let wide = false
    let F: Box = { x: 0, y: 0, w: 0, h: 0 }
    let grid: Box[] = []
    let out: { x: number; y: number } = { x: 0, y: 0 }
    const measure = () => {
      W = stage.clientWidth
      H = stage.clientHeight
      const margin = W * 0.0667
      const inner = W - margin * 2
      wide = W >= 1000 && W / H > 1.15
      stage.toggleAttribute('data-wide', wide)
      // the sentence, once it has stepped back, ends here; the frame starts under it
      const head = line ? line.offsetHeight * (W <= 700 ? 0.62 : 0.56) : 80
      const top = (W <= 700 ? 112 : 144) + head + (W <= 700 ? 24 : 40)
      const room = H - top - (wide ? 72 : W <= 700 ? 250 : 320)
      let fw = wide ? inner * 0.62 : inner
      let fh = fw / 1.6
      if (fh > room) {
        fh = Math.max(160, room)
        fw = fh * 1.6
      }
      F = { x: margin, y: top, w: fw, h: fh }
      stage.style.setProperty('--fx', `${F.x}px`)
      stage.style.setProperty('--fy', `${F.y}px`)
      stage.style.setProperty('--fw', `${F.w}px`)
      stage.style.setProperty('--fh', `${F.h}px`)
      // the album: three even cells across the frame's place, a little lower while the sentence is big
      const gap = W <= 700 ? 8 : 20
      const cw = (F.w - gap * 2) / 3
      const ch = Math.min(cw * 1.25, H * 0.42, F.h)
      // wide: the row sits a little lower, in the middle of the screen; otherwise inside the frame's
      // place, so it never runs into the story under the frame
      const gy = wide ? Math.max(F.y + (F.h - ch) / 2, H * 0.52 - ch / 2) : F.y + (F.h - ch) / 2
      grid = [0, 1, 2].map((i) => ({ x: F.x + i * (cw + gap), y: gy, w: cw, h: ch }))
      stage.style.setProperty('--gy', `${gy}px`)
      // where the other two photos go: into the story beside the frame (or under it)
      const sr = side?.getBoundingClientRect()
      const st = stage.getBoundingClientRect()
      out = sr
        ? { x: sr.left - st.left + 40, y: sr.top - st.top + 40 }
        : { x: F.x + F.w, y: F.y + F.h }
    }

    let p = 0
    const place = () => {
      const land = span(p, T.land)
      const grow = glide(span(p, T.grow))
      photos.forEach((el, i) => {
        const g = grid[i]
        if (!g) return
        // each lands from a little above, one after another, as if dropped on the desk
        const k = glide((land - i * 0.18) / 0.64)
        let b: Box = { x: g.x, y: g.y - (1 - k) * 80, w: g.w, h: g.h }
        let o = k
        if (i === 1)
          b = {
            x: lerp(g.x, F.x, grow),
            y: lerp(g.y, F.y, grow),
            w: lerp(g.w, F.w, grow),
            h: lerp(g.h, F.h, grow),
          }
        else if (grow > 0) {
          const s = lerp(1, 0.2, grow)
          b = { x: lerp(g.x, out.x, grow), y: lerp(g.y, out.y, grow), w: g.w * s, h: g.h * s }
          o = k * (1 - grow)
        }
        el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`
        el.style.width = `${b.w.toFixed(1)}px`
        el.style.height = `${b.h.toFixed(1)}px`
        el.style.opacity = String(o)
        el.style.setProperty('--r', i === 1 ? '0deg' : `${(1 - k) * (i === 0 ? -4 : 4)}deg`)
      })
      if (frame) frame.style.opacity = String(glide(span(p, T.play)))
      stage.dataset.beat = p < T.step ? 'line' : p < T.gave ? 'album' : 'site'
      stage.toggleAttribute('data-landed', land > 0.6)
      stage.toggleAttribute('data-broken', grow > 0.5)
    }

    let frameReq = 0
    let was = false
    const draw = () => {
      frameReq = 0
      const rect = track.getBoundingClientRect()
      p = reduced ? 1 : clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight))
      place()
      const on = p >= T.play[1] && rect.top < window.innerHeight && rect.bottom > 0
      if (on !== was) {
        was = on
        setPlaying(on)
        if (!on) setAuto(true)
      }
    }
    const request = () => {
      if (!frameReq) frameReq = requestAnimationFrame(draw)
    }
    const onResize = () => {
      measure()
      request()
    }
    void document.fonts.ready.then(onResize)
    measure()
    draw()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frameReq)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  const pick = (i: number) => {
    setAuto(false)
    setScene(i)
  }

  return (
    <section ref={trackRef} className="cs" aria-labelledby="cs-title">
      <div ref={stageRef} className="cs-stage" data-beat="line">
        <h3 id="cs-title" className="cs-line">
          <Rise text={t('vision')} />
        </h3>

        <p className="cs-files" aria-hidden="true">
          {t('case.files')}
        </p>
        {PHOTOS.map((src, i) => (
          <figure key={src} className="cs-photo" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- moved and sized every frame */}
            <img src={src} alt="" loading="lazy" decoding="async" />
            <figcaption>{FILES[i]}</figcaption>
          </figure>
        ))}

        <div className="cs-frame">
          {SCENES.map((s, i) => (
            <video
              key={s}
              src={`/video/act4/piczura-${s}.mp4`}
              poster={`/video/act4/piczura-${s}.jpg`}
              muted
              loop
              playsInline
              preload="none"
              aria-label={names[i]}
              data-on={i === scene || undefined}
            />
          ))}
        </div>

        <div className="cs-side">
          <p className="cs-story" data-s="came">
            {t('case.came')}
          </p>
          <p className="cs-story" data-s="asked">
            {t('case.asked')}
          </p>
          <p className="cs-story" data-s="gave">
            {t('case.gave')}
          </p>
          <div className="cs-pick">
            <p className="cs-pick-h">{t('case.pick')}</p>
            <ul>
              {names.map((n, i) => (
                <li key={n}>
                  <button
                    type="button"
                    aria-pressed={i === scene}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && pick(i)}
                    onClick={() => pick(i)}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
            <a className="cs-go" href={PICZURA} target="_blank" rel="noopener">
              {t('case.link')}&nbsp;↗
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
