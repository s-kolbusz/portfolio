'use client'

import { type CSSProperties, useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { CONTACT_EMAIL, contactLinks } from '@/data/contact'

import './contact.css'

/**
 * The page's last part, after the price list (owner, 2026-11-24): one move to write, the other ways in
 * shown as plainly as the e-mail's second line, and the page's footer at the bottom of the same screen.
 * No liquid, no drawings, no step cards: the type carries it.
 */
export function Contact() {
  const t = useTranslations('contact')
  const sectionRef = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [local, domain] = CONTACT_EMAIL.split('@')
  const [name, tld] = domain.split('.')

  // the words come in once, when the line and the address are on screen: not when the section's top edge
  // shows (they sit lower and would play unseen), and not under the liquid that covers a jump from the bar
  useEffect(() => {
    const main = sectionRef.current?.querySelector('.ct-main')
    if (!main) return
    let frame = 0
    const show = () => {
      if (document.querySelector('.site-bar[data-menu]')) frame = requestAnimationFrame(show)
      else setShown(true)
    }
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        seen.disconnect()
        show()
      },
      { threshold: 0.4 }
    )
    seen.observe(main)
    return () => {
      seen.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
    } catch {
      // no clipboard (insecure origin, denied): the address is right there to select by hand
    }
  }

  const say = t('say').split(' ')

  return (
    <section id="contact" ref={sectionRef} className="ct" data-shown={shown || undefined}>
      <div className="ct-main">
        <p className="ct-say">
          {say.map((word, i) => (
            <span key={i}>
              <span className="ct-word">
                <span style={{ '--i': i } as CSSProperties}>{word}</span>
              </span>
              {i < say.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>

        <a className="ct-mail" href={`mailto:${CONTACT_EMAIL}`}>
          <span className="ct-addr">
            {local}
            <span className="ct-at">@</span>
            <span className="ct-dom">
              {name}
              <span className="ct-dot">.</span>
              {tld}
            </span>
          </span>
        </a>

        <div className="ct-row">
          <button type="button" className="ct-copy" data-done={copied || undefined} onClick={copy}>
            {copied ? t('copied') : t('copy')}
          </button>
          <a className="ct-open" href={`mailto:${CONTACT_EMAIL}`}>
            {t('open')} <span aria-hidden="true">↗</span>
          </a>
          <p className="ct-note">{t('reply')}</p>
          <span className="sr-only" aria-live="polite">
            {copied ? t('copied') : ''}
          </span>
        </div>

        <ul className="ct-ways">
          {contactLinks.map((link, i) => (
            <li key={link.id} style={{ '--i': i } as CSSProperties}>
              <a
                className="ct-way"
                href={link.url}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="ct-k">{t(link.labelKey)}</span>
                <span className="ct-v">
                  {link.handle}
                  {link.external && <i aria-hidden="true">↗</i>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="ct-foot">
        <p>{t('location')}</p>
        <p suppressHydrationWarning>{t('rights', { year: new Date().getFullYear() })}</p>
      </footer>
    </section>
  )
}
