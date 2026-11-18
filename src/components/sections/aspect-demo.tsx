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
  { src: '/images/demo/pleso.jpg', name: 'strbske-pleso.jpg', x: 58.5, y: 66 },
  { src: '/images/demo/giewont.jpg', name: 'giewont.jpg', x: 62, y: 28 },
  { src: '/images/demo/bacowka.jpg', name: 'bacowka.jpg', x: 50, y: 55 },
  { src: '/images/demo/pleso-2.jpg', name: 'pleso-evening.jpg', x: 50, y: 50 },
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
  const [own, setOwn] = useState<{ url: string; name: string } | null>(null)
  const ownUrl = own?.url ?? null
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
        {/* A wireframe of the Payload admin's media view around the plugin: everything but the
            plugin's field is a drawing, out of the tab order and the accessibility tree. */}
        <div className="apd-admin">
          <aside className="apd-admin__nav" inert aria-hidden="true">
            <span className="apd-admin__logo" />
            <span className="apd-admin__group">Collections</span>
            <span>Users</span>
            <span className="is-on">Media</span>
          </aside>
          <div className="apd-admin__main">
            <div className="apd-admin__bar" inert aria-hidden="true">
              <span>
                Media <i>/</i> {fileName}
              </span>
              <span className="apd-admin__save">Save</span>
            </div>
            <div className="apd-admin__doc">
              <div inert aria-hidden="true">
                <p className="apd-admin__title">{fileName}</p>
                <div className="apd-admin__upload">
                  <span className="apd-admin__thumb" style={{ backgroundImage: `url("${src}")` }} />
                  <span>
                    {fileName}
                    <br />
                    <i>{size ? `${size.w}×${size.h}` : ''} · image/jpeg</i>
                  </span>
                </div>
                <span className="apd-admin__label">Alt</span>
                <span className="apd-admin__input">{t('alt')}</span>
              </div>
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
