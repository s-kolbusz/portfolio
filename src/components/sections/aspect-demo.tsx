'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  AspectPreviewEditor,
  type AspectPreviewValue,
} from 'payload-plugin-aspect-preview/playground'

import './aspect-demo.css'

/**
 * Placeholder photos with the main subject as the starting focal point (percent of the photo).
 * They come from Zakofy, the client the plugin was first built for: before this reaches main,
 * either the client agrees or they are swapped for the owner's own photos.
 */
const PHOTOS = [
  { src: '/images/demo/pleso.jpg', x: 58.5, y: 66 },
  { src: '/images/demo/giewont.jpg', x: 62, y: 28 },
  { src: '/images/demo/bacowka.jpg', x: 50, y: 55 },
  { src: '/images/demo/pleso-2.jpg', x: 50, y: 50 },
] as const

const REPO_URL = 'https://github.com/s-kolbusz/payload-plugin-aspect-preview'
const NPM_COMMAND = 'npm i payload-plugin-aspect-preview'

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
  const [ownUrl, setOwnUrl] = useState<string | null>(null)
  const [value, setValue] = useState<AspectPreviewValue>(() => startValue(0))

  useEffect(() => {
    const el = sectionRef.current
    if (!el || near) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true)
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
    setOwnUrl(null)
    setPhoto(next)
    setValue(startValue(next))
  }

  const src = ownUrl ?? PHOTOS[photo].src

  // the photo's shape caps the editor's width, so a portrait photo stays within the screen
  const [ratio, setRatio] = useState<number | null>(null)
  useEffect(() => {
    if (!near) return
    let live = true
    const img = new Image()
    img.onload = () => live && setRatio(img.naturalWidth / img.naturalHeight)
    img.src = src
    return () => {
      live = false
    }
  }, [near, src])

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
        {near ? (
          <AspectPreviewEditor
            src={src}
            alt={t('alt')}
            value={value}
            onChange={setValue}
            className="apd-theme"
          />
        ) : (
          <div className="apd-wait" aria-hidden="true" />
        )}
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
              setOwnUrl(URL.createObjectURL(file))
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
