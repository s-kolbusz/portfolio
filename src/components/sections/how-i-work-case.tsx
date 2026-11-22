'use client'

import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Rise } from '@/components/ui/rise'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { useReveal } from '@/hooks/use-reveal'

import './how-i-work-case.css'

const SCENES = ['wybiegi', 'verdi', 'miasto', 'jelenie'] as const
/** each scene's recording, /video/act4/<name>.mp4 and .jpg (a new cut gets a new name, so no
 * browser keeps showing the old one from its cache) */
const CLIPS = ['piczura-wybiegi-60', 'piczura-verdi', 'piczura-miasto', 'piczura-jelenie']
/** three photos from the Dubai Fashion Week show, the ones the Runways scene of piczura.com is built from */
const PHOTOS = [0, 1, 2].map((i) => `/images/act4/piczura-dubai-${i}.webp`)
/** the files' own names, the way they arrived */
const FILES = ['55dee365.jpg', 'DSC08230.jpg', 'DSC08233.jpg']
/** width / height of each photo */
const RATIO = [0.563, 0.624, 0.647]
const PICZURA = 'https://piczura.com'
/** the words of piczura.com's bar and where they start, in scene units */
const BAR: [string, number, boolean?][] = [
  ['Maciek', 67.5],
  ['Piczura', 99],
  ['Wybiegi ▾', 145, true],
  ['Kontakt', 777],
  ['Projekty', 827],
  ['Karta', 938],
]
/** the track's height without the scenes' scroll, svh (the stage is 100svh and sticks) */
const TRACK = 440
/**
 * Once the frame has grown the stage holds still and the scroll turns the scenes over, DRIVE svh
 * for all four: each one's recording plays once, at its own speed, and stops on its last frame
 * (the Runways one is 60 fps, taken from the live site at a steady scroll with its bar held still).
 */
const DRIVE = 200

/**
 * The scene is laid out in a 1000 x 625 space (the recordings' 16:10) and scaled to its box, so the
 * album, the film strip and the title keep their places while the box grows. The strip and the
 * title sit where the first Runways frame has them, so the live page takes over unseen.
 */
const SW = 1000
const SH = 625
const ALBUM = { w: 300, h: 500, gap: 50, y: 40 }
const KH = 212 // the strip's height (piczura.com: frame 0.76, padding 0.12, gap 0.06 of it)
const STRIP = { x: 204, y: 379 }

/** the scroll through the track, 0..1 */
const T = {
  step: 0.06, // the sentence steps back; the photos start to fall
  land: [0.06, 0.18], // they land in an album's even grid
  strike: [0.22, 0.29], // "a photo gallery" is crossed out
  strip: [0.29, 0.45], // the album closes into a film strip
  paper: [0.4, 0.5], // the strip lies on piczura.com's paper, under its bar
  title: [0.44, 0.56], // the show's name is written above it
  ring: [0.54, 0.6], // and one frame is circled, the way the site picks one
  grow: [0.6, 0.72], // the frame grows to the screen
  play: [0.69, 0.73], // the recording takes over; from here the scroll turns the scenes (DRIVE)
  gave: 0.6, // the answer replaces the struck sentence
} as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const span = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const glide = (t: number) => {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}
type Box = { x: number; y: number; w: number; h: number }
const mix = (a: Box, b: Box, t: number): Box => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
})

/** the album's cells and the strip's frames, in scene units */
const CELLS: Box[] = [0, 1, 2].map((i) => ({
  x: i * (ALBUM.w + ALBUM.gap),
  y: ALBUM.y,
  w: ALBUM.w,
  h: ALBUM.h,
}))
const FRAMES: Box[] = (() => {
  const fh = KH * 0.76
  let x = STRIP.x + KH * 0.06
  return RATIO.map((r) => {
    const b = { x, y: STRIP.y + KH * 0.12, w: fh * r, h: fh }
    x += b.w + KH * 0.06
    return b
  })
})()
const STRIP_W = FRAMES[2]!.x + FRAMES[2]!.w + KH * 0.06 - STRIP.x

/**
 * Act 4, line 3: "I add my own vision" (owner, 2026-11-21). Maciek Piczura came with photos and
 * expected a gallery. Three of his runway photos land in an even album under their file names, and
 * the expectation is written under them. Scrolling, the album closes into a strip of film on
 * piczura.com's paper, the show's name is written above it in the site's italic, and the frame
 * grows to the screen and turns into the recording of that very scene. The stage then holds still
 * while the scroll turns the scenes over (the close covers it after); the struck-out gallery is
 * replaced by what was made instead, and the scene names pick a scene by hand.
 */
export function HowIWorkCase() {
  const t = useTranslations('howIWork')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(0)
  const [playing, setPlaying] = useState(false)
  const names = t.raw('case.scenes') as string[]
  useReveal(trackRef, { at: 0.6 })

  // the scene on show plays once from its start, and only while the frame is on the screen. A
  // recording that is left goes back to its first frame, so the next time it comes up (the
  // Runways one crossfades over the assembled photos, which match that frame) it starts clean
  // instead of showing where it stopped and then jumping
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const timers: number[] = []
    stage.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      const i = Number(v.dataset.i)
      if (playing && i === scene && !reduced) {
        if (v.currentTime > 0.05) v.currentTime = 0
        v.removeAttribute('data-rewind')
        void v.play().catch(() => {})
        return
      }
      v.pause()
      if (v.currentTime < 0.05) return
      if (i === 0 && scene === 0) {
        // the scroll went back over the hand-off while Runways was on show: it dissolves into the
        // photos underneath (the same frame), rewinds unseen and comes back
        v.setAttribute('data-rewind', '')
        timers.push(
          window.setTimeout(() => {
            const back = () => v.removeAttribute('data-rewind')
            v.addEventListener('seeked', back, { once: true })
            v.currentTime = 0
          }, 220)
        )
      } else {
        // a scene the scroll left fades out first (0.6 s), then rewinds
        timers.push(
          window.setTimeout(() => {
            if (!v.hasAttribute('data-on')) v.currentTime = 0
          }, 700)
        )
      }
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [scene, playing, reduced])

  useEffect(() => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    const q = <E extends Element>(s: string) => stage.querySelector<E>(s)
    const photos = Array.from(stage.querySelectorAll<HTMLElement>('.cs-photo'))
    const box = q<HTMLElement>('.cs-box')
    const inner = q<HTMLElement>('.cs-scene')
    const film = q<HTMLElement>('.cs-film')
    const title = q<HTMLElement>('.cs-title')
    const ring = q<SVGSVGElement>('.cs-ring')
    const line = q<HTMLElement>('.cs-line')
    const came = q<HTMLElement>('.cs-came')
    const foot = q<HTMLElement>('.cs-foot')
    const videos = q<HTMLElement>('.cs-rec')
    // the recordings load only once the section is near
    const clips = Array.from(stage.querySelectorAll<HTMLVideoElement>('video'))
    let near = false

    let W = 0
    let H = 0
    let narrow = false
    let wide = false
    let B0: Box = { x: 0, y: 0, w: 0, h: 0 }
    let B1: Box = { x: 0, y: 0, w: 0, h: 0 }
    // the caption's place while the album is on show, and its width under the grown frame
    let F0: Box = { x: 0, y: 0, w: 0, h: 0 }
    let gap = 24
    const measure = () => {
      W = stage.clientWidth
      H = stage.clientHeight
      narrow = W <= 700
      wide = W >= 1000 && W / H > 1.15
      const margin = W * 0.0667
      const inner0 = W - margin * 2
      stage.toggleAttribute('data-wide', wide)
      // the sentence, once it has stepped back, ends here
      const head = line ? line.offsetHeight * (narrow ? 0.62 : 0.56) : 80
      const headTop = narrow ? 104 : 144
      gap = narrow ? 16 : 24
      // the caption as it stands under the grown frame: the sentence and the scenes beside it (wide)
      // or under it
      const sayH = foot?.querySelector<HTMLElement>('.cs-say')?.offsetHeight ?? 60
      const pickH = foot?.querySelector<HTMLElement>('.cs-pick')?.offsetHeight ?? 80
      const footH = wide ? Math.max(sayH, pickH) : sayH + 16 + pickH
      if (wide) {
        // wide: the album on the right, what he came with and what he expected on the left of it,
        // one at its top and one at its foot
        const top0 = headTop + head + gap * 2
        const room0 = H - top0 - gap * 3
        const w0 = Math.min(inner0 * 0.64, room0 * 1.6)
        B0 = { x: W - margin - w0, y: top0, w: w0, h: w0 / 1.6 }
        const col = Math.min(B0.x - margin - gap * 2, 420)
        stage.style.setProperty('--came-x', `${margin}px`)
        stage.style.setProperty('--came-y', `${top0 + (w0 / 1.6) * 0.06}px`)
        stage.style.setProperty('--came-w', `${col}px`)
        const askedH = stage.querySelector<HTMLElement>('.cs-asked')?.offsetHeight ?? 60
        F0 = { x: margin, y: top0 + (w0 / 1.6) * 0.9 - askedH, w: col, h: 0 }
      } else {
        const cameH = came?.offsetHeight ?? 40
        const top0 = headTop + head + gap + cameH + gap
        const room0 = H - top0 - footH - gap * 2
        let w0 = inner0
        if (w0 / 1.6 > room0) w0 = Math.max(200, room0 * 1.6)
        B0 = { x: margin, y: top0, w: w0, h: w0 / 1.6 }
        stage.style.setProperty('--came-x', `${margin}px`)
        stage.style.setProperty('--came-y', `${top0 - gap - cameH}px`)
        stage.style.setProperty('--came-w', `${inner0}px`)
        F0 = { x: margin, y: top0 + w0 / 1.6 + gap, w: inner0, h: 0 }
      }
      // the grown frame: as wide as the screen lets it, the sentence gone above it
      const min1 = narrow ? 88 : 96
      const room1 = H - min1 - footH - gap * 2
      const w1 = Math.min(W, Math.max(260, room1) * 1.6)
      // the frame and its caption sit in the middle of the screen when there is room to spare
      const top1 = Math.max(min1, (H - (w1 / 1.6 + gap + footH)) / 2)
      B1 = { x: (W - w1) / 2, y: top1, w: w1, h: w1 / 1.6 }
      // the show's name: its ink from x 41 to x 866, baseline at y 349, as on the recording
      if (title) {
        title.style.fontSize = '100px'
        const natural = title.scrollWidth || 1
        const size = (100 * 827) / natural
        title.style.fontSize = `${size}px`
        title.style.top = `${344 - size * 0.8}px`
      }
    }

    let p = 0
    let placed = -1
    const place = () => {
      const land = span(p, T.land)
      const strip = glide(span(p, T.strip))
      const grow = glide(span(p, T.grow))
      const b = mix(B0, B1, grow)
      const s = b.w / SW
      if (box) {
        box.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`
        box.style.width = `${b.w.toFixed(1)}px`
        box.style.height = `${b.h.toFixed(1)}px`
      }
      if (inner) {
        inner.style.transform = `scale(${s.toFixed(4)})`
        inner.style.setProperty('--s', s.toFixed(4))
      }
      photos.forEach((el, i) => {
        // each lands from a little above, one after another, as if dropped on the desk
        const k = glide((land - i * 0.18) / 0.64)
        const c = CELLS[i]!
        const f = FRAMES[i]!
        // the frames close in one after another, the last one first: the strip pulls them in
        const ki = glide((strip - (2 - i) * 0.08) / 0.84)
        const at = mix({ ...c, y: c.y - (1 - k) * 90 }, f, ki)
        el.style.transform = `translate(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px) rotate(${((1 - k) * (i === 1 ? 3 : -3)).toFixed(2)}deg)`
        el.style.width = `${at.w.toFixed(2)}px`
        el.style.height = `${at.h.toFixed(2)}px`
        el.style.opacity = String(k)
      })
      if (film) {
        // the strip opens from its middle as the frames arrive
        const o = glide(span(p, [T.strip[0] + 0.05, T.strip[1]]))
        const cut = ((1 - o) * 50).toFixed(2)
        film.style.clipPath = `inset(0 ${cut}% 0 ${cut}% round 1px)`
      }
      stage.style.setProperty('--paper', String(glide(span(p, T.paper))))
      stage.style.setProperty('--title', String(glide(span(p, T.title))))
      stage.style.setProperty('--strike', String(glide(span(p, T.strike))))
      ring?.style.setProperty('--draw', String(glide(span(p, T.ring))))
      if (videos) videos.style.opacity = String(glide(span(p, T.play)))
      stage.dataset.beat = p < T.step ? 'line' : p < T.gave ? 'album' : 'site'
      stage.toggleAttribute('data-landed', land > 0.6)
      stage.toggleAttribute('data-closed', strip > 0.3)
      stage.toggleAttribute('data-grown', grow > 0.35)
      stage.toggleAttribute('data-growing', grow > 0.02 && grow < 0.98)
      // the caption moves from beside (or under) the album to under the grown frame
      const f1 = wide
        ? { x: b.x, y: b.y + b.h + gap, w: b.w, h: 0 }
        : { x: W * 0.0667, y: b.y + b.h + gap, w: W * (1 - 0.1334), h: 0 }
      // it is hidden while the frame grows and jumps there unseen
      const fb = grow < 0.5 ? F0 : f1
      stage.style.setProperty('--foot-x', `${fb.x.toFixed(1)}px`)
      stage.style.setProperty('--foot-y', `${fb.y.toFixed(1)}px`)
      stage.style.setProperty('--foot-w', `${fb.w.toFixed(1)}px`)
    }

    let frameReq = 0
    let was = false
    let shown = 0
    const draw = () => {
      frameReq = 0
      const rect = track.getBoundingClientRect()
      // the scroll through the track: the beats take TRACK - 100 svh of it, and once the recording
      // has taken over (T.play), DRIVE svh more turn the scenes over before the rest
      const unit = Math.max(1, rect.height - window.innerHeight) / (TRACK - 100 + DRIVE)
      const beats = (TRACK - 100) * unit
      const drive = DRIVE * unit
      const s = -rect.top
      const at = T.play[1] * beats
      const sb = s < at ? s : s < at + drive ? at : s - drive
      p = reduced ? 1 : clamp01(sb / beats)
      // while the scenes turn, nothing in the scene moves: leave the page alone so the recording
      // plays without the style work of every scroll frame
      if (p !== placed) {
        placed = p
        place()
      }
      if (!near && rect.top < window.innerHeight * 2.5 && rect.bottom > -window.innerHeight) {
        near = true
        clips.forEach((v) => {
          v.preload = 'auto'
          v.load()
        })
      }
      // which scene the scroll is on; it switches only when the scroll crosses into another one, so
      // a name picked by hand holds until then
      const turned = Math.min(
        SCENES.length - 1,
        Math.floor(clamp01((s - at) / drive) * SCENES.length)
      )
      if (turned !== shown) {
        shown = turned
        setScene(turned)
      }
      // a little slack below the hand-off, so a scroll resting on it does not flicker on and off
      const on =
        !reduced && s >= at - (was ? 24 : 0) && rect.top < window.innerHeight && rect.bottom > 0
      if (on !== was) {
        was = on
        setPlaying(on)
      }
    }
    const request = () => {
      if (!frameReq) frameReq = requestAnimationFrame(draw)
    }
    const onResize = () => {
      measure()
      placed = -1
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

  const pick = (i: number) => setScene(i)

  return (
    <section
      ref={trackRef}
      className="cs"
      style={{ height: `${TRACK + DRIVE}svh` }}
      aria-labelledby="cs-title"
    >
      <div ref={stageRef} className="cs-stage" data-beat="line">
        <h3 id="cs-title" className="cs-line">
          <Rise text={t('vision')} />
        </h3>

        <p className="cs-came">{t('case.came')}</p>

        <div className="cs-box">
          <div className="cs-scene" style={{ width: SW, height: SH }}>
            <div className="cs-paper" aria-hidden="true">
              {/* the site's bar and the show's credit, where the recording has them */}
              <b className="cs-bar" style={{ left: 40 }}>
                mp
              </b>
              {BAR.map(([word, x, faint]) => (
                <span
                  key={word}
                  className="cs-bar"
                  style={{ left: x }}
                  data-faint={faint || undefined}
                >
                  {word}
                </span>
              ))}
              <span className="cs-bar cs-credit">11.2025 · Fot. —</span>
            </div>
            <p className="cs-title" aria-hidden="true">
              Dubai Fashion Week
            </p>
            <div
              className="cs-film"
              aria-hidden="true"
              style={{ left: STRIP.x, top: STRIP.y, width: STRIP_W, height: KH }}
            />
            {PHOTOS.map((src, i) => (
              <figure key={src} className="cs-photo" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- moved and sized every frame */}
                <img src={src} alt="" loading="lazy" decoding="async" />
                <figcaption>{FILES[i]}</figcaption>
              </figure>
            ))}
            <svg
              className="cs-ring"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{
                left: FRAMES[0]!.x - FRAMES[0]!.w * 0.14,
                top: FRAMES[0]!.y - FRAMES[0]!.h * 0.1,
                width: FRAMES[0]!.w * 1.28,
                height: FRAMES[0]!.h * 1.2,
              }}
            >
              <path
                pathLength="1"
                d="M58 4C84 6 98 24 97 50S80 96 50 96 3 78 4 49 26 3 55 5c8 0 14 2 19 5"
              />
              <path pathLength="1" d="M44 8C20 12 6 30 7 52s19 41 45 41 42-20 41-44S76 7 47 8" />
            </svg>
          </div>

          <div className="cs-rec">
            {SCENES.map((s, i) => (
              <video
                key={s}
                src={`/video/act4/${CLIPS[i]}.mp4`}
                poster={`/video/act4/${CLIPS[i]}.jpg`}
                muted
                playsInline
                preload="none"
                aria-label={names[i]}
                data-i={i}
                data-on={i === scene || undefined}
              />
            ))}
          </div>
        </div>

        <div className="cs-foot">
          <div className="cs-say">
            <p className="cs-asked">
              {t.rich('case.asked', {
                x: (chunks) => (
                  <span className="cs-x">
                    {chunks}
                    <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                      <path pathLength="1" d="M1 6.5C22 4 41 7.5 63 5.2S90 4.6 99 3.4" />
                    </svg>
                  </span>
                ),
              })}
            </p>
            <p className="cs-gave">{t('case.gave')}</p>
          </div>
          <div className="cs-pick">
            <ul aria-label={t('case.pick')}>
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
