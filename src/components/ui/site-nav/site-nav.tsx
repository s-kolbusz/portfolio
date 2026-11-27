'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { STUDIO, STUDIO_LINK_REL } from '@/data/studio'
import { SUBPAGES } from '@/data/subpages'
import { Link, usePathname, useRouter } from '@/i18n/navigation-v2'
import { isV2Page } from '@/i18n/v2-pages'
import { isHomeRoute, isProjectDetailRoute, isServicesRoute } from '@/lib/route-predicates'
import { useScrollStore } from '@/lib/stores'

import { createMenuWater, type MenuWater } from './menu-water'
import { NavSign } from './nav-sign'
import { useSkFlight } from './sk-flight'
import { READING_LINE, STOPS, locate, stopBounds, stopShares } from './stops'

import './site-nav.css'

const EMAIL = 'office@kolbusz.xyz'
const PHONE = '+48 533 542 880'
const LINKS = [
  { href: 'https://linkedin.com/in/skolbusz', label: 'LinkedIn' },
  { href: 'https://github.com/s-kolbusz', label: 'GitHub' },
]
const ELSEWHERE = [
  { href: STUDIO.url, label: 'stronypodhale.pl', rel: STUDIO_LINK_REL },
  {
    href: 'https://www.npmjs.com/package/payload-plugin-aspect-preview',
    label: 'aspect-preview',
    rel: 'noopener noreferrer',
  },
  { href: 'https://piczura.com', label: 'piczura.com', rel: 'noopener noreferrer' },
]

type Phase = 'closed' | 'open' | 'closing' | 'leaving'

/** the subpages built in the new design, listed in the menu under the home page's parts */
const PAGES = SUBPAGES.filter((page) => isV2Page(page.href))

/** the stronypodhale.pl wordmark exactly as its logo */
function Wordmark() {
  return (
    <span className="wm">
      <span className="acc">strony</span>
      <span className="str">podhale</span>
      <span className="acc">.pl</span>
    </span>
  )
}

export function SiteNav() {
  const t = useTranslations('nav')
  const tf = useTranslations('navFacts')
  const tp = useTranslations('subpages')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const lenis = useScrollStore((state) => state.lenis)
  const isHome = isHomeRoute(pathname)
  const backButtonRoute = isProjectDetailRoute(pathname) || isServicesRoute(pathname)

  const [phase, setPhase] = useState<Phase>('closed')
  const [ready, setReady] = useState(!isHome)
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [shares, setShares] = useState<number[]>(() => STOPS.map(() => 1 / STOPS.length))
  const [solid, setSolid] = useState(!isHome)
  const [flat, setFlat] = useState(false)
  // a subpage of the redesign (subpage-frame.tsx): its own name and its own scale in the bar
  const [subpage, setSubpage] = useState<string | null>(null)
  const [subIndex, setSubIndex] = useState(0)
  const [subShares, setSubShares] = useState<number[]>([1])
  // the subpage's current part, named by its data-sp-name (none on the first screen)
  const [subPart, setSubPart] = useState<string | null>(null)

  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const skRef = useRef<HTMLAnchorElement>(null)
  const waterRef = useRef<MenuWater | null>(null)
  const alongRef = useRef(0)
  const openFrom = useRef({ x: 0, y: 0 })

  const open = phase === 'open'
  const label = (i: number) => (STOPS[i].brand ? STOPS[i].label : t(STOPS[i].label))
  // the menu's rows: the home page's parts, a labelled gap, then the subpages
  const pageRow = (j: number) => STOPS.length + 1 + j
  const pageAt = (i: number) => (i >= STOPS.length + 1 ? PAGES[i - STOPS.length - 1] : null)
  const pageHere = PAGES.findIndex((page) => page.href === pathname)
  const hereRow = isHome ? index : pageHere >= 0 ? pageRow(pageHere) : -1
  const active = hover ?? Math.max(hereRow, 0)
  const activePage = pageAt(active)
  const pageTitle = (key: string) => `${tp(`${key}.title`)}${tp(`${key}.tail`)}`

  // --- where we are on the page: the scale (bar and menu) follows the scroll
  useEffect(() => {
    if (!isHome) return
    let raf = 0
    const measure = () => {
      raf = 0
      const vh = window.innerHeight
      const tops = STOPS.slice(2).map((stop) => {
        const el = document.getElementById(stop.id)
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity
      })
      const max = document.documentElement.scrollHeight - vh
      // a section missing from the page gets no length: it starts where the next one does
      for (let i = tops.length - 1; i >= 0; i--) {
        if (!Number.isFinite(tops[i])) tops[i] = i + 1 < tops.length ? tops[i + 1] : max
      }
      const bounds = stopBounds(tops, vh, max)
      const pos = locate(window.scrollY, bounds)
      const next = stopShares(bounds)
      const before = next.slice(0, pos.index).reduce((a, b) => a + b, 0)
      alongRef.current = before + next[pos.index] * pos.progress
      document.querySelectorAll<HTMLElement>('[data-scale]').forEach((scale) => {
        scale.style.setProperty('--pos', alongRef.current.toFixed(4))
      })
      setIndex(pos.index)
      setSolid(window.scrollY + 90 > (Number.isFinite(tops[0]) ? tops[0] : Infinity))
      setShares((prev) => (prev.every((s, i) => Math.abs(s - next[i]) < 0.002) ? prev : next))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const late = window.setInterval(schedule, 1500) // sections load lazily and change the page's length
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.clearInterval(late)
    }
  }, [isHome])

  // --- on a subpage the scale follows that page: one tick per part marked data-sp-stop
  useEffect(() => {
    if (isHome) return
    const page = document.querySelector<HTMLElement>('[data-subpage]')
    if (!page) return
    let raf = 0
    const measure = () => {
      raf = 0
      setSubpage(page.dataset.name ?? null)
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      const parts = Array.from(page.querySelectorAll<HTMLElement>('[data-sp-stop]'))
      const tops = parts.map((el, i) =>
        i === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY - READING_LINE * vh
      )
      if (!tops.length) return
      const bounds = [...tops, Math.max(max, tops[tops.length - 1] + 1)]
      for (let i = 1; i < bounds.length; i++) bounds[i] = Math.max(bounds[i], bounds[i - 1] + 1)
      const pos = locate(window.scrollY, bounds)
      const next = stopShares(bounds)
      const before = next.slice(0, pos.index).reduce((a, b) => a + b, 0)
      page.ownerDocument
        .querySelectorAll<HTMLElement>('.site-bar [data-scale]')
        .forEach((scale) => {
          scale.style.setProperty('--pos', (before + next[pos.index] * pos.progress).toFixed(4))
        })
      setSubIndex(pos.index)
      const part = parts[pos.index]
      setSubPart(part?.dataset.spName ?? (part?.classList.contains('sp-end') ? t('contact') : null))
      setSubShares((prev) =>
        prev.length === next.length && prev.every((s, i) => Math.abs(s - next[i]) < 0.002)
          ? prev
          : next
      )
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const late = window.setInterval(schedule, 1500)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.clearInterval(late)
      setSubpage(null)
      setSubPart(null)
    }
  }, [isHome, pathname, t])

  // --- the bar waits for the loader: nothing sits on the dark loading board
  useEffect(() => {
    if (!isHome) return
    let raf = 0
    const start = performance.now()
    const check = () => {
      const board = document.querySelector<HTMLElement>('.lq-stage canvas.ld')
      // (a page opened further down never shows the board: the hero is not even built there)
      if (
        !board ||
        board.style.display === 'none' ||
        board.getBoundingClientRect().bottom <= 0 ||
        performance.now() - start > 9000
      ) {
        setReady(true)
        return
      }
      raf = requestAnimationFrame(check)
    }
    raf = requestAnimationFrame(check)
    return () => cancelAnimationFrame(raf)
  }, [isHome])

  // --- the liquid: made the first time the menu opens, so a visit that never opens it holds no
  // WebGL for it (only the current scene should cost memory, owner 2026-11-18)
  const waterTried = useRef(false)
  const ensureWater = () => {
    const canvas = canvasRef.current
    if (waterTried.current || !canvas) return waterRef.current
    waterTried.current = true
    const water = createMenuWater(canvas, () => setPhase('closed'))
    if (!water) setFlat(true)
    waterRef.current = water
    return water
  }
  useEffect(
    () => () => {
      waterRef.current?.destroy()
      waterRef.current = null
      waterTried.current = false
    },
    []
  )

  // S and K leave the hero name for the corner: with the scroll, or with the menu opened on the hero
  const sk = useSkFlight({ enabled: isHome, cornerRef: skRef, menuOpen: phase === 'open' })

  const buttonCentre = () => {
    const rect = toggleRef.current?.getBoundingClientRect()
    return rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth, y: 0 }
  }

  const lock = useCallback((on: boolean) => {
    // No overflow lock and no lenis.stop() (it sets overflow: clip on html): either hides the scrollbar,
    // the page jumps sideways and the hero rebuilds itself. Wheel and touch are stopped at the menu instead.
    document.documentElement.classList.toggle('site-menu-open', on)
    document.getElementById('main-content')?.toggleAttribute('inert', on)
  }, [])

  const openMenu = () => {
    const o = buttonCentre()
    openFrom.current = o
    const water = ensureWater()
    // the list of parts may not run into the footer: what is left above it, the list scrolls within
    const route = menuRef.current?.querySelector<HTMLElement>('.site-menu__route')
    const foot = menuRef.current?.querySelector<HTMLElement>('.site-menu__foot')
    if (route && foot) {
      const room = foot.getBoundingClientRect().top - route.getBoundingClientRect().top - 16
      route.style.setProperty('--route-room', `${Math.max(room, 96)}px`)
    }
    // measured while the menu is still closed (laid out, invisible), so the transitions start with these delays:
    // every part surfaces once the liquid has left clean paper over all of it
    menuRef.current?.querySelectorAll<HTMLElement>('[data-surface]').forEach((el) => {
      const rect = el.getBoundingClientRect()
      const far = {
        x: Math.abs(rect.left - o.x) > Math.abs(rect.right - o.x) ? rect.left : rect.right,
        y: Math.abs(rect.top - o.y) > Math.abs(rect.bottom - o.y) ? rect.top : rect.bottom,
      }
      const at = water ? water.arrival(o, far) : 0
      el.style.setProperty('--d', `${(at * 0.85).toFixed(3)}s`)
    })
    setHover(null)
    setPhase('open')
    lock(true)
  }

  // the liquid starts in the same frame the menu opens
  useLayoutEffect(() => {
    if (phase !== 'open') return
    waterRef.current?.open(openFrom.current)
    // focus lands on the part you are on (a selector list would return the first link in the page instead)
    const menu = menuRef.current
    const here = menu?.querySelector<HTMLElement>('a[aria-current]') ?? menu?.querySelector('nav a')
    here?.focus({ preventScroll: true })
    // a list that scrolls opens with the current part in view
    const route = menu?.querySelector<HTMLElement>('.site-menu__route')
    if (route && here && route.scrollHeight > route.clientHeight + 1) {
      const at = here.getBoundingClientRect().top - route.getBoundingClientRect().top
      route.scrollTop += at - (route.clientHeight - here.offsetHeight) / 2
    }
  }, [phase])

  const closeMenu = useCallback(
    (refocus = true) => {
      if (phase !== 'open') return
      setHover(null)
      setPhase(waterRef.current ? 'closing' : 'closed')
      lock(false)
      waterRef.current?.close(buttonCentre())
      if (refocus) toggleRef.current?.focus({ preventScroll: true })
    },
    [phase, lock]
  )

  // the page under the menu does not scroll (wheel and touch stop at the menu)
  useEffect(() => {
    const menu = menuRef.current
    if (phase !== 'open' || !menu) return
    // except inside the list of parts when it is taller than the room above the footer (short phones)
    const route = menu.querySelector<HTMLElement>('.site-menu__route')
    const stop = (e: Event) => {
      const scrolls = route && route.scrollHeight > route.clientHeight + 1
      if (scrolls && route.contains(e.target as Node)) return
      e.preventDefault()
    }
    menu.addEventListener('wheel', stop, { passive: false })
    menu.addEventListener('touchmove', stop, { passive: false })
    return () => {
      menu.removeEventListener('wheel', stop)
      menu.removeEventListener('touchmove', stop)
    }
  }, [phase])

  // Escape closes; Tab stays inside the menu and its button; arrows walk along the scale
  useEffect(() => {
    if (phase !== 'open') return
    const ARROWS = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
      const menu = menuRef.current
      if (!menu || !toggleRef.current) return
      if (ARROWS.includes(e.key)) {
        const stops = Array.from(menu.querySelectorAll<HTMLElement>('[data-stop]'))
        const at = stops.indexOf(document.activeElement as HTMLElement)
        if (at < 0) return
        e.preventDefault()
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
        stops[(at + step + stops.length) % stops.length].focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = [toggleRef.current, ...menu.querySelectorAll<HTMLElement>('a[href], button')]
      const at = items.indexOf(document.activeElement as HTMLElement)
      const next = (at + (e.shiftKey ? -1 : 1) + items.length) % items.length
      e.preventDefault()
      items[next].focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase, closeMenu])

  // the menu never outlives a page change
  useEffect(() => () => lock(false), [lock])

  const scrollTo = (id: string) => {
    const target = id === 'hero' ? 0 : document.getElementById(id)
    if (target === null) return
    // a part laid over the one before it is landed on where it covers the screen
    const offset = (STOPS.find((stop) => stop.id === id)?.land ?? 0) * window.innerHeight
    if (lenis) lenis.scrollTo(target, { immediate: true, force: true, offset })
    else if (target === 0) window.scrollTo(0, 0)
    else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY + offset)
  }

  // choosing: the liquid floods from the chosen tick, the page moves while covered, the flood drains
  const go = (e: React.MouseEvent, i: number) => {
    if (!isHome) {
      // a click on the band beside the link still goes there
      if (!(e.target as HTMLElement).closest('a')) router.push(STOPS[i].href)
      closeMenu(false)
      return
    }
    e.preventDefault()
    const id = STOPS[i].href.split('#')[1]
    const water = waterRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!water || reduce || phase !== 'open') {
      closeMenu(false)
      scrollTo(id)
      return
    }
    // the scale is a list: the flood starts at the chosen row
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const point = { x: rect.left, y: rect.top + rect.height / 2 }
    setHover(null)
    setPhase('leaving')
    water.navigate(
      point,
      () => {
        lock(false)
        scrollTo(id)
      },
      () => setPhase('closed')
    )
  }

  // the short path (owner, 2026-11-23): prices and contact sit in the bar on every screen; the jump floods from
  // the word, the page moves while covered, so no pinned scene has to be scrolled through on the way
  const SHORT = ['prices', 'contact'].map((id) => STOPS.findIndex((stop) => stop.id === id))
  const jump = (e: React.MouseEvent, i: number) => {
    // a subpage that has the part itself (the contact) is not left for the home page
    if (!isHome && !document.getElementById(STOPS[i].id)) return
    e.preventDefault()
    const id = STOPS[i].id
    const water = ensureWater()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!water || reduce) {
      scrollTo(id)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPhase('leaving')
    water.navigate(
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      () => scrollTo(id),
      () => setPhase('closed')
    )
  }

  const toTop = (e: React.MouseEvent) => {
    if (!isHome) return
    e.preventDefault()
    if (phase === 'open') closeMenu(false)
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const starts = shares.map((_, i) => shares.slice(0, i).reduce((a, b) => a + b, 0))
  const barShares = subpage ? subShares : shares
  const barStarts = barShares.map((_, i) => barShares.slice(0, i).reduce((a, b) => a + b, 0))

  return (
    <>
      <header
        className="site-bar"
        data-adapt-theme
        data-ready={ready || undefined}
        data-menu={phase !== 'closed' ? phase : undefined}
        data-sk={sk.landed ? 'landed' : 'away'}
        data-back={backButtonRoute || undefined}
        data-solid={solid || undefined}
      >
        <Link
          href="/"
          ref={skRef}
          className="site-bar__sk"
          onClick={toTop}
          aria-label="Sebastian Kolbusz"
        >
          <span data-sk-letter="s">S</span>
          <span data-sk-letter="k">K</span>
        </Link>
        {sk.node}
        <div className="site-bar__right">
          {(isHome || subpage) && (
            <button
              type="button"
              className="site-bar__where"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => (open ? closeMenu() : openMenu())}
            >
              <span className="site-bar__no">
                {String((subpage ? subIndex : index) + 1).padStart(2, '0')}
              </span>
              <span className="site-bar__name">
                <span
                  key={subpage ? `${subpage}-${subIndex}` : index}
                  className="site-bar__name-in"
                >
                  {subpage && subPart ? (
                    <>
                      <span className="site-bar__page">{subpage}</span> · {subPart}
                    </>
                  ) : subpage ? (
                    subpage
                  ) : (
                    label(index)
                  )}
                </span>
              </span>
              <span className="scale" data-scale aria-hidden="true">
                <span className="scale__line">
                  <span className="scale__done" />
                  {barStarts.map((start, i) => (
                    <span key={i} className="scale__tick" style={{ left: `${start * 100}%` }} />
                  ))}
                  <span className="scale__tick scale__tick--end" />
                  <span className="scale__here" />
                </span>
              </span>
            </button>
          )}
          <nav className="site-bar__short" aria-label={t('short')}>
            {SHORT.map((i) => (
              <Link
                key={STOPS[i].id}
                href={STOPS[i].href}
                className="site-bar__go"
                tabIndex={phase === 'closed' ? undefined : -1}
                onClick={(e) => jump(e, i)}
              >
                {label(i)}
              </Link>
            ))}
          </nav>
          <button
            ref={toggleRef}
            type="button"
            className="site-bar__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            <span className="site-bar__toggle-wrap">
              <span className="site-bar__toggle-a">{t('menu')}</span>
              <span className="site-bar__toggle-b" aria-hidden="true">
                {t('close')}
              </span>
            </span>
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        className="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        data-phase={phase}
        data-home={isHome || undefined}
        data-flat={flat || undefined}
        data-lenis-prevent
        aria-hidden={phase === 'closed' || undefined}
      >
        <canvas ref={canvasRef} className="site-menu__water" aria-hidden="true" />

        {/* the part you are on, or the one you point at: its sign and its sentence (desktop only) */}
        <div className="site-menu__word" aria-hidden="true" data-surface>
          <span key={active} className="site-menu__word-in">
            {activePage ? (
              <>
                <span className="sign sign--name">{pageTitle(activePage.key)}</span>
                <span className="f">{tp(`${activePage.key}.line`)}</span>
              </>
            ) : (
              <>
                <NavSign id={STOPS[active].id} wordmark={<Wordmark />} />
                <span className="f">{tf(STOPS[active].id)}</span>
              </>
            )}
          </span>
        </div>

        <nav className="site-menu__route" aria-label={t('main_navigation')} data-surface>
          <ol
            className="ruler"
            data-scale
            style={
              {
                '--here': index,
                '--to': active,
                '--stops': STOPS.length + (PAGES.length ? 1 + PAGES.length : 0),
              } as React.CSSProperties
            }
          >
            <li className="ruler__done" aria-hidden="true" />
            <li className="ruler__here" aria-hidden="true" />
            {STOPS.map((stop, i) => {
              const here = isHome && i === index
              return (
                // The band around the line only widens the pointer target; the link inside is the keyboard target.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={stop.id}
                  className="ruler__stop"
                  onClick={(e) => go(e, i)}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                  data-here={here || undefined}
                  data-active={i === active || undefined}
                  style={
                    { '--start': starts[i], '--share': shares[i], '--i': i } as React.CSSProperties
                  }
                >
                  <Link
                    href={stop.href}
                    data-stop
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover((h) => (h === i ? null : h))}
                    aria-current={here ? 'location' : undefined}
                  >
                    <span className="ruler__name">
                      {stop.id === 'work' ? <Wordmark /> : label(i)}
                    </span>
                    {here && (
                      <span className="ruler__mark" aria-hidden="true">
                        ← {t('here')}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
            {PAGES.length > 0 && (
              <li
                className="ruler__group"
                aria-hidden="true"
                style={{ '--i': STOPS.length } as React.CSSProperties}
              >
                {t('pages')}
              </li>
            )}
            {PAGES.map((page, j) => {
              const i = pageRow(j)
              const here = j === pageHere
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                <li
                  key={page.key}
                  className="ruler__stop ruler__stop--page"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('a')) router.push(page.href)
                    closeMenu(false)
                  }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                  data-here={here || undefined}
                  data-active={i === active || undefined}
                  style={{ '--start': 0, '--share': 0, '--i': i } as React.CSSProperties}
                >
                  <Link
                    href={page.href}
                    data-stop
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover((h) => (h === i ? null : h))}
                    aria-current={here ? 'page' : undefined}
                  >
                    <span className="ruler__name">{pageTitle(page.key)}</span>
                    {here && (
                      <span className="ruler__mark" aria-hidden="true">
                        ← {t('here')}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>

        <p className="site-menu__fact" aria-hidden="true" data-surface>
          {activePage ? tp(`${activePage.key}.line`) : tf(STOPS[active].id)}
        </p>

        <div className="site-menu__foot" data-surface>
          <ul className="row">
            <li className="muted">{t('elsewhere')}</li>
            {ELSEWHERE.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel={link.rel}>
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li className="muted">Airchos · {t('in_progress')}</li>
          </ul>
          <ul className="row">
            <li>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
            </li>
            <li>
              <Link href="/cv" onClick={() => closeMenu(false)}>
                {t('cv')}
              </Link>
            </li>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
            {(['en', 'pl'] as const).map((l) => (
              <li key={l} className="lang">
                <Link
                  href={pathname}
                  locale={l}
                  lang={l}
                  hrefLang={l}
                  aria-label={l === 'en' ? 'English' : 'Polski'}
                  aria-current={l === locale ? 'true' : undefined}
                >
                  {l.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
