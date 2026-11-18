'use client'

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  AspectPreviewEditor,
  type AspectPreviewValue,
  type AspectRatioConfig,
  DEFAULT_ASPECT_RATIOS,
} from 'payload-plugin-aspect-preview/playground'

import './aspect-demo.css'

/**
 * Photos from Unsplash (via Lorem Picsum, Unsplash licence), each with its subject off the middle,
 * and the subject as the starting focal point (percent of the photo). One is picked at random.
 */
const PHOTOS = [
  { src: '/images/demo/street.jpg', name: 'street-crossing.jpg', x: 58, y: 52 },
  { src: '/images/demo/pug.jpg', name: 'pug-in-a-blanket.jpg', x: 49, y: 20 },
  { src: '/images/demo/walruses.jpg', name: 'walruses.jpg', x: 82, y: 40 },
  { src: '/images/demo/waterfall.jpg', name: 'waterfall.jpg', x: 50, y: 85 },
  { src: '/images/demo/sunglasses.jpg', name: 'meadow-portrait.jpg', x: 55, y: 40 },
  { src: '/images/demo/lioness.jpg', name: 'lioness.jpg', x: 49, y: 42 },
] as const

const REPO_URL = 'https://github.com/s-kolbusz/payload-plugin-aspect-preview'
const NPM_COMMAND = 'npm i payload-plugin-aspect-preview'

/**
 * The plugin's default ratios with its `overlays` turned on, so the demo also shows where a
 * site lays text over the photo: bands fixed to the frame while the image moves under them.
 * Values as in the plugin's own dev app and README.
 */
const RATIOS: AspectRatioConfig[] = DEFAULT_ASPECT_RATIOS.map((ratio) => {
  if (ratio.ratio === '4:3')
    return {
      ...ratio,
      overlays: [
        { label: 'Chips', edge: 'top', min: 0.12 },
        { label: 'Title + price', edge: 'bottom', min: 0.22, max: 0.4 },
      ],
    }
  if (ratio.ratio === '16:9')
    return { ...ratio, overlays: [{ label: 'Headline', edge: 'left', min: 0.35, max: 0.5 }] }
  if (ratio.ratio === '9:16')
    return { ...ratio, overlays: [{ label: 'Caption', edge: 'bottom', min: 0.15, max: 0.3 }] }
  return ratio
})

const startValue = (index: number): AspectPreviewValue => ({
  focal: { x: PHOTOS[index].x, y: PHOTOS[index].y },
})

/**
 * Act 3, first scene: the aspect-preview plugin itself, running here without Payload.
 * The editor is the published package (`payload-plugin-aspect-preview/playground`), only
 * themed in the site's paper and ink; nothing about its behaviour is reimplemented here.
 * It mounts when the scene comes near, so its photo does not load with the hero.
 */
export function AspectDemo() {
  const t = useTranslations('aspectDemo')
  const sectionRef = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  const [photo, setPhoto] = useState(0)
  const [own, setOwn] = useState<{ url: string; name: string } | null>(null)
  const ownUrl = own?.url ?? null
  const [value, setValue] = useState<AspectPreviewValue>(() => startValue(0))

  useEffect(() => {
    const el = sectionRef.current
    if (!el || near) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        const first = Math.floor(Math.random() * PHOTOS.length)
        setPhoto(first)
        setValue(startValue(first))
        setNear(true)
      },
      { rootMargin: '100% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  // a picked photo never leaves the browser: shown through a blob: URL, revoked when replaced
  useEffect(() => {
    if (!ownUrl) return
    return () => URL.revokeObjectURL(ownUrl)
  }, [ownUrl])

  const nextPhoto = () => {
    const next = ownUrl ? photo : (photo + 1) % PHOTOS.length
    setOwn(null)
    setPhoto(next)
    setValue(startValue(next))
  }

  const src = ownUrl ?? PHOTOS[photo].src
  const fileName = own?.name ?? PHOTOS[photo].name

  // the photo's size: its shape caps the editor's width (a portrait photo stays on screen)
  // and the upload row of the admin wireframe shows it, as Payload does
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const ratio = size ? size.w / size.h : null
  useEffect(() => {
    if (!near) return
    let live = true
    const img = new Image()
    img.onload = () => live && setSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = src
    return () => {
      live = false
    }
  }, [near, src])

  // On a desktop the whole admin window is shown at most 90% of the screen's height: it is drawn at
  // its natural size and zoomed down to fit, like a preview of the real thing. CSS zoom (not a
  // transform) so the plugin's pointer maths stays right.
  const adminRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = adminRef.current
    if (!el) return
    const fit = () => {
      if (window.innerWidth <= 900) {
        el.style.zoom = ''
        el.style.width = ''
        return
      }
      // a fixed layout width: under zoom an auto width would grow to fill the column and the
      // window's height would no longer shrink with it
      el.style.width = ''
      el.style.zoom = ''
      el.style.width = `${el.parentElement?.clientWidth ?? el.clientWidth}px`
      // the photo's cap in px (not screen units), so the whole window scales evenly with the zoom
      el.style.setProperty('--apd-cap', `${Math.round(window.innerHeight * 0.62)}px`)
      let z = 1
      for (let k = 0; k < 3; k++) {
        el.style.zoom = String(z)
        const h = el.getBoundingClientRect().height
        z = Math.min(1, z * ((window.innerHeight * 0.9) / h))
      }
      el.style.zoom = String(z)
    }
    fit()
    const img = el.querySelector('.focal-editor img')
    img?.addEventListener('load', fit)
    window.addEventListener('resize', fit)
    return () => {
      img?.removeEventListener('load', fit)
      window.removeEventListener('resize', fit)
    }
  }, [near, size])

  return (
    <section ref={sectionRef} id="aspect-preview" className="apd" aria-labelledby="apd-title">
      <header className="apd-head">
        <p className="apd-label">{t('label')}</p>
        <h2 id="apd-title" className="apd-lead">
          {t('question')}
        </h2>
        <p className="apd-how">{t('how')}</p>
      </header>

      <div
        className="apd-editor"
        style={ratio ? ({ '--apd-ratio': ratio } as CSSProperties) : undefined}
      >
        {/* A wireframe of the Payload admin's media edit view around the plugin, laid out as
            Payload 3 lays it out: everything but the plugin's field is a drawing, out of the tab
            order and the accessibility tree. */}
        <div ref={adminRef} className="apd-admin">
          <aside className="apd-admin__nav" inert aria-hidden="true">
            <span className="apd-admin__group">Collections</span>
            <span>Users</span>
            <span className="is-on">Media</span>
            <span>Pages</span>
            <span>Posts</span>
            <span className="apd-admin__group">Globals</span>
            <span>Header</span>
            <span>Footer</span>
            <span className="apd-admin__logout">Log out</span>
          </aside>
          <div className="apd-admin__main">
            <div className="apd-admin__bar" inert aria-hidden="true">
              <span className="apd-admin__crumbs">
                <span className="apd-admin__mark" />
                <i>/</i> Media <i>/</i> {fileName}
              </span>
              <span className="apd-admin__avatar" />
            </div>
            <div className="apd-admin__doc">
              <div className="apd-admin__head" inert aria-hidden="true">
                <p className="apd-admin__title">{fileName}</p>
                <div className="apd-admin__tabs">
                  <span className="is-on">Edit</span>
                  <span>API</span>
                </div>
                <div className="apd-admin__controls">
                  <span>
                    Last modified <b>just now</b> · Created <b>just now</b>
                  </span>
                  <span className="apd-admin__save">Save</span>
                </div>
              </div>
              <div className="apd-admin__fields">
                <div inert aria-hidden="true">
                  <div className="apd-admin__upload">
                    <span
                      className="apd-admin__thumb"
                      style={{ backgroundImage: `url("${src}")` }}
                    />
                    <span>
                      {fileName}
                      <br />
                      <i>{size ? `${size.w}x${size.h}` : ''} · image/jpeg</i>
                    </span>
                    <span className="apd-admin__chip">Preview Sizes</span>
                  </div>
                  <span className="apd-admin__label">Alt</span>
                  <span className="apd-admin__input">{t('alt')}</span>
                </div>
                {near ? (
                  <AspectPreviewEditor
                    src={src}
                    alt={t('alt')}
                    aspectRatios={RATIOS}
                    value={value}
                    onChange={setValue}
                    className="apd-theme"
                  />
                ) : (
                  <div className="apd-wait" aria-hidden="true" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="apd-tools">
        <button type="button" className="apd-door" onClick={nextPhoto}>
          {t('another')} <span aria-hidden="true">↻</span>
        </button>
        <label className="apd-door">
          {t('own')}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              setOwn({ url: URL.createObjectURL(file), name: file.name })
              setValue({ focal: { x: 50, y: 50 } })
            }}
          />
        </label>
        <span className="apd-note">{t('stays')}</span>
        <span className="apd-get">
          <code>{NPM_COMMAND}</code>
          <a href={REPO_URL} target="_blank" rel="noopener" className="apd-door">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </span>
      </div>
    </section>
  )
}
