import type { CSSProperties, ReactNode } from 'react'

import { Contact } from '@/components/sections/contact'

import { Door, type DoorTarget } from './door'
import { Reveal } from './reveal'
import { Words } from './words'

import './subpage.css'

/**
 * The shared frame of every subpage of the redesign (owner, 2026-11-26): only the first screen's grammar
 * and the ending are shared. Everything between them is the page's own, designed from its own material,
 * so pages must not grow into copies of one another (ready2order's frame is not the template).
 *
 * `name` is what the bar shows next to its scale; every element marked `data-sp-stop` is a tick on it.
 * `theme` sets the page's own paper and ink (--sp-bg, --sp-fg …); the ending is always on paper.
 */
export function SubpageFrame({
  name,
  theme,
  className,
  children,
}: {
  name: string
  theme?: CSSProperties
  /** the page's own class, for styles that reach into the shared first screen */
  className?: string
  children: ReactNode
}) {
  return (
    <main
      id="main-content"
      className={className ? `sp ${className}` : 'sp'}
      data-subpage
      data-name={name}
      style={theme}
    >
      <Reveal>{children}</Reveal>
    </main>
  )
}

export interface Fact {
  key: string
  value: ReactNode
  note?: ReactNode
}

/**
 * The first screen: label, the Mattone title (a statement or a question), one short line, four facts at
 * the bottom left; the page's own object on the right. It grows in on entry: the title rises word by
 * word, the object swells from its centre, the facts follow one by one.
 */
export function SubpageOpen({
  label,
  title,
  line,
  facts,
  object,
}: {
  label: string
  title: string
  line: ReactNode
  facts: Fact[]
  object: ReactNode
}) {
  return (
    <section className="sp-open" data-sp-stop>
      <div className="sp-open__text">
        <p className="sp-label sp-in" style={{ '--i': 0 } as CSSProperties}>
          {label}
        </p>
        <h1 className="sp-title">
          <Words text={title} from={1} />
        </h1>
        <p className="sp-line sp-in" style={{ '--i': 4 } as CSSProperties}>
          {line}
        </p>
      </div>
      <div className="sp-open__obj">{object}</div>
      <dl className="sp-facts">
        {facts.map((fact, i) => (
          <div key={fact.key} className="sp-in" style={{ '--i': 6 + i } as CSSProperties}>
            <dt>{fact.key}</dt>
            <dd>
              {fact.value}
              {fact.note && <small>{fact.note}</small>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * The ending, identical on every subpage: the home page's contact block, then the door to the next page.
 */
export function SubpageEnd({ next, peek }: { next: DoorTarget | null; peek?: ReactNode }) {
  return (
    <div className="sp-end" data-sp-stop>
      <Contact />
      {next && <Door next={next} peek={peek} />}
    </div>
  )
}
