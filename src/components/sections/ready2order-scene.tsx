'use client'

import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { startDropsStage, supportsDrops } from '@/components/canvas/liquid-hero/drops-stage'
import { usePrefersReducedMotion } from '@/hooks/use-media'
import { Link } from '@/i18n/navigation'

import './ready2order-scene.css'

/**
 * The four causes, as drops: where each sits (fractions of the stage), its width (px at a
 * 1440-wide stage, scaled with it), rotation and image. Bodies cut from the hero liquid's
 * real frames (cook/akt3/drops); the big ones share the clean body, turned and flipped.
 */
const DROPS = {
  wide: [
    { key: 'webpack', x: 0.52, y: 0.3, w: 250, r: -112, flip: false, src: 'body' },
    { key: 'bundle', x: 0.76, y: 0.4, w: 150, r: 18, flip: true, src: 'body' },
    { key: 'redux', x: 0.6, y: 0.66, w: 190, r: 160, flip: true, src: 'body' },
    { key: 'deps', x: 0.86, y: 0.74, w: 66, r: 0, flip: false, src: 'drop-s' },
  ],
  phone: [
    { key: 'webpack', x: 0.24, y: 0.32, w: 120, r: -112, flip: false, src: 'body' },
    { key: 'bundle', x: 0.3, y: 0.48, w: 80, r: 18, flip: true, src: 'body' },
    { key: 'redux', x: 0.22, y: 0.63, w: 100, r: 160, flip: true, src: 'body' },
    { key: 'deps', x: 0.3, y: 0.76, w: 40, r: 0, flip: false, src: 'drop-s' },
  ],
} as const

const CHANGES = ['webpack', 'split', 'redux', 'deps'] as const

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/**
 * Act 3, second scene: ready2order. Four separate drops (the causes of a slow start) run
 * together into one body as the page scrolls, and the result stands next to it: the
 * production bundle halved. Liquid in motion, solid when done. With reduced motion it is
 * the finished frame, as a plain section.
 */
export function Ready2orderScene() {
  const t = useTranslations('ready2order')
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const liquidRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return
    const drops = Array.from(stage.querySelectorAll<HTMLElement>('[data-drop]'))
    const tags = Array.from(stage.querySelectorAll<HTMLElement>('[data-tag]'))
    const rows = Array.from(stage.querySelectorAll<HTMLElement>('[data-row]'))
    const body = stage.querySelector<HTMLElement>('[data-body]')
    let frame = 0
    let last = -1
    let mergeNow = 0

    // where everything stands at the current stage size (CSS px)
    const geometry = () => {
      const W = stage.clientWidth
      const H = stage.clientHeight
      const phone = W <= 700
      const set = phone ? DROPS.phone : DROPS.wide
      const u = phone ? W / 390 : W / 1440
      return {
        W,
        H,
        phone,
        set,
        u,
        // where the body stands when the drops have run together
        bx: (phone ? 0.26 : 0.66) * W,
        by: (phone ? 0.52 : 0.4) * H,
      }
    }

    // the real liquid: the hero's simulation, the drops as groups of particles the scroll pulls together.
    // Without WebGL2 the cut-out drops below stay and do the same with images.
    let stopLiquid = () => {}
    const canvas = liquidRef.current
    if (canvas && supportsDrops()) {
      stage.dataset.liquid = '1'
      stopLiquid = startDropsStage({
        canvas,
        layout: () => {
          const g = geometry()
          return {
            drops: g.set.map((d) => ({
              x: d.x * g.W,
              y: d.y * g.H,
              r: Math.max(d.w * g.u * 0.34, 0.024 * g.H),
            })),
            body: { x: g.bx, y: g.by },
          }
        },
        merge: () => mergeNow,
        onFail: () => delete stage.dataset.liquid,
      })
    }

    const draw = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const p = travel > 0 ? clamp01(-rect.top / travel) : 1
      if (Math.abs(p - last) < 0.0005) return
      last = p
      const { W, H, phone, set, u, bx, by } = geometry()
      const merge = ease(span(p, 0.22, 0.5))
      // the liquid follows a target that arrives a little earlier, so it has time to settle into one body
      mergeNow = ease(span(p, 0.16, 0.42))
      drops.forEach((el, i) => {
        const d = set[i]
        const x = d.x * W + (bx - d.x * W) * merge
        const y = d.y * H + (by - d.y * H) * merge
        // they shrink as they meet: the body is what they make together
        const s = 1 - 0.3 * merge
        el.style.width = `${d.w * u}px`
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${d.r}deg) scale(${(d.flip ? -1 : 1) * s}, ${s})`
        // the small one is taken in first, so it never sits on top as a separate dot
        el.style.opacity = String(
          1 - span(p, d.src === 'drop-s' ? 0.36 : 0.46, d.src === 'drop-s' ? 0.44 : 0.54)
        )
        const tag = tags[i]
        const tx = d.x * W + d.w * u * 0.62
        const right = !phone && tx + 260 > W * (1 - 0.0667)
        tag.style.transform = `translate(${right ? d.x * W - d.w * u * 0.62 : tx}px, ${d.y * H - 6}px) translateX(${right ? '-100%' : '0'})`
        tag.style.textAlign = right ? 'right' : 'left'
        tag.style.opacity = String(1 - span(p, 0.18, 0.28))
      })
      if (body) {
        const bw = phone ? W * 0.32 : Math.min(W * 0.19, H * 0.4)
        const grow = ease(span(p, 0.42, 0.58))
        body.style.width = `${bw}px`
        body.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) rotate(-8deg) scale(${0.8 + 0.2 * grow})`
        body.style.opacity = String(span(p, 0.42, 0.52))
      }
      stage.style.setProperty('--ask', String(1 - span(p, 0.36, 0.46)))
      stage.style.setProperty('--done', String(ease(span(p, 0.46, 0.62))))
      rows.forEach((row, i) => {
        const a = ease(span(p, 0.48 + i * 0.04, 0.6 + i * 0.04))
        row.style.opacity = String(a)
        row.style.transform = `translateY(${(1 - a) * 16}px)`
      })
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      stopLiquid()
      delete stage.dataset.liquid
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [reduced])

  const list = (
    <div className="r2o-list">
      <p className="r2o-label">{t('listLabel')}</p>
      <ol>
        {CHANGES.map((key, i) => (
          <li key={key} data-row>
            <span className="r2o-micro">{String(i + 1).padStart(2, '0')}</span>
            {t(`changes.${key}`)}
          </li>
        ))}
      </ol>
    </div>
  )
  const result = (
    <div className="r2o-result">
      <p className="r2o-micro">{t('resultLabel')}</p>
      <p className="r2o-big">{t('result')}</p>
    </div>
  )
  const say = (
    <p className="r2o-say">
      {t('say')}
      <br />
      <Link href="/projects/ready2order" className="r2o-door">
        {t('door')} <span aria-hidden="true">→</span>
      </Link>
    </p>
  )

  if (reduced) {
    return (
      <section id="ready2order" className="r2o r2o--still" aria-labelledby="r2o-title">
        <p className="r2o-ask">
          <span className="r2o-label">{t('label')}</span>
          <span id="r2o-title">{t('question')}</span>
        </p>
        {list}
        {result}
        {say}
      </section>
    )
  }

  return (
    <section ref={trackRef} id="ready2order" className="r2o" aria-labelledby="r2o-title">
      <div ref={stageRef} className="r2o-stage">
        <p className="r2o-ask">
          <span className="r2o-label">{t('label')}</span>
          <span id="r2o-title">{t('question')}</span>
        </p>
        <p className="r2o-name" aria-hidden="true">
          ready2order
        </p>
        {/* goo: the drops' edges run together where they meet; the originals stay sharp on top */}
        <svg className="r2o-defs" aria-hidden="true">
          <filter id="r2o-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </svg>
        <canvas ref={liquidRef} className="r2o-liquid" aria-hidden="true" />
        <div className="r2o-drops" aria-hidden="true">
          {DROPS.wide.map((d) => (
            // eslint-disable-next-line @next/next/no-img-element -- transformed every frame; next/image adds nothing here
            <img key={d.key} data-drop src={`/images/r2o/${d.src}.png`} alt="" draggable={false} />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
          <img data-body src="/images/r2o/body.png" alt="" draggable={false} />
        </div>
        <ul className="r2o-tags">
          {DROPS.wide.map((d) => (
            <li key={d.key} data-tag>
              {t(`causes.${d.key}.name`)}
              <b>{t(`causes.${d.key}.why`)}</b>
            </li>
          ))}
        </ul>
        <div className="r2o-done">
          {list}
          {say}
          {result}
        </div>
      </div>
    </section>
  )
}
