import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

/**
 * Each part's sign in the desktop menu (owner, 2026-11-22): one fact or one element of that part, set in the
 * site's own type and rules, never a screenshot and never a drawing. The texts are placeholders from facts
 * until the menu copy goes through Codex.
 */
export function NavSign({ id, wordmark }: { id: string; wordmark: ReactNode }) {
  const t = useTranslations('navSigns')

  switch (id) {
    case 'hero':
      return <span className="sign sign--name">Sebastian Kolbusz</span>
    case 'work':
      return (
        <span className="sign sign--brand">
          <span className="sign__mark">{wordmark}</span>
          <span className="sign__note">{t('work')}</span>
        </span>
      )
    case 'aspect-preview':
      return (
        <span className="sign sign--crops">
          {['16:9', '4:5', '1:1'].map((ratio) => (
            <span key={ratio} className="sign__crop" data-ratio={ratio}>
              <span className="sign__note">{ratio}</span>
            </span>
          ))}
        </span>
      )
    case 'ready2order':
      return (
        <span className="sign sign--half">
          <span className="sign__big">−50%</span>
          <span className="sign__bars">
            <i data-before />
            <b>{t('before')}</b>
            <i data-after />
            <b>{t('after')}</b>
          </span>
        </span>
      )
    case 'how-i-work':
      return (
        <span className="sign sign--crafts">
          {(t.raw('crafts') as string[]).map((craft) => (
            <span key={craft}>{craft}</span>
          ))}
        </span>
      )
    case 'piczura':
      return (
        <span className="sign sign--names">
          {(t.raw('piczura') as string[]).map((scene) => (
            <span key={scene}>{scene}</span>
          ))}
        </span>
      )
    case 'prices':
      return (
        <span className="sign sign--prices">
          {(t.raw('prices') as [string, string][]).map(([value, what]) => (
            <span key={what}>
              <span className="sign__value">{value}</span>
              <span className="sign__note">{what}</span>
            </span>
          ))}
        </span>
      )
    case 'about':
      return (
        <span className="sign sign--year">
          <span className="sign__big">2016</span>
          <span className="sign__note">{t('about')}</span>
        </span>
      )
    case 'projects':
      return (
        <span className="sign sign--names">
          {['Zakofy', 'Your Krakow Travel', 'Wellezza', 'Billboard Zakopane', 'ready2order'].map(
            (name) => (
              <span key={name}>{name}</span>
            )
          )}
        </span>
      )
    case 'services':
      return <span className="sign sign--line">{t('services')}</span>
    case 'calculator':
      return (
        <span className="sign sign--year">
          <span className="sign__big">K1</span>
          <span className="sign__note">{t('calculator')}</span>
        </span>
      )
    case 'contact':
      return (
        <span className="sign sign--contact">
          <span className="sign__value">office@kolbusz.xyz</span>
          <span className="sign__note">{t('contact')}</span>
        </span>
      )
    default:
      return null
  }
}
