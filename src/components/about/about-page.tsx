import type { CSSProperties, ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'

import { SubpageEnd, SubpageFrame } from '@/components/subpage/subpage-frame'
import { Words } from '@/components/subpage/words'
import { nextSubpage } from '@/data/subpages'

import { PrintSentence } from './print-sentence'

import './about.css'

/** a stand-in for a real photo or screenshot, captioned with what goes there (owner sends them) */
function Stand({ caption, className }: { caption: string; className: string }) {
  return (
    <div className={`ab-stand ${className}`} role="img" aria-label={caption}>
      <span>{caption}</span>
    </div>
  )
}

/** the plugin on npm (the same address the menu links to) */
const ASPECT_NPM = 'https://www.npmjs.com/package/payload-plugin-aspect-preview'

const n = (i: number) => ({ '--n': i }) as CSSProperties

/** a photo capsule inside a heading; until the photos come, a hatched stand-in that says what goes there */
function Pill({ children, tilt = 'l' }: { children: ReactNode; tilt?: 'l' | 'r' }) {
  return <span className="ab-pill" data-tilt={tilt} role="img" aria-label={String(children)} />
}

/** a fact's old label and note, set small beside its last word */
function Note({ label, note }: { label: string; note: string }) {
  return (
    <span className="ab-note">
      <b>{label}</b> {note}
    </span>
  )
}

/** the last word of a phrase, kept on one line with what follows it (a pill, a note, a comma) */
function Tail({ text, children }: { text: string; children?: ReactNode }) {
  const at = text.lastIndexOf(' ')
  return (
    <>
      {at > 0 && `${text.slice(0, at)} `}
      <span className="ab-nw">
        {at > 0 ? text.slice(at + 1) : text}
        {children}
      </span>
    </>
  )
}

/**
 * The first screen (owner, 2026-11-27, Fable's board B "one paragraph"): no object beside the title and
 * no empty half. The title runs straight on into the four facts as one Mattone paragraph, the title in
 * ink and the facts in grey; each fact's old label hangs small beside it, and pills in the sentence
 * stand for the parts below (fence and the Home Assistant tiles, the printer, the readout, the plugin),
 * the same grammar as the parts' own headings. The line and the label sit at the bottom.
 */
function AboutOpen({
  title,
  line,
  label,
  facts,
  words: w,
  apps,
  read,
}: {
  title: string
  line: string
  label: string
  facts: { label: string; note: string }[]
  words: Record<
    'from' | 'job' | 'home' | 'printer' | 'cars' | 'plugin' | 'airchos' | 'fence' | 'k1',
    string
  >
  apps: string[]
  read: string[]
}) {
  const [from, job, off, work] = facts
  const tile = ['#f2a53a', '#3d6fd6', '#fbf9f4', '#e04f3e', '#2f9e8f']
  return (
    <section className="ab-open" data-sp-stop>
      <div className="ab-para">
        <h1 className="ab-para__t">
          <Words text={title} />
        </h1>{' '}
        <p className="ab-para__f">
          <Tail text={`${w.from}.`}>
            <Note {...from} />
          </Tail>{' '}
          <Tail text={`${w.job}.`}>
            <Note {...job} />
          </Tail>{' '}
          <span className="ab-nw">
            {w.home}{' '}
            <span className="ab-pp" role="img" aria-label={w.fence} style={n(0)}>
              <span aria-hidden="true">{w.fence}</span>
            </span>
            <span className="ab-pha" role="img" aria-label={apps.join(', ')} style={n(1)}>
              {tile.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
            ,
          </span>{' '}
          <span className="ab-nw">
            {w.printer}{' '}
            <span className="ab-pp" data-tilt="r" role="img" aria-label={w.k1} style={n(2)}>
              <span aria-hidden="true">{w.k1}</span>
            </span>
            ,
          </span>{' '}
          <span className="ab-nw">
            {w.cars}{' '}
            <span className="ab-prd" aria-hidden="true" style={n(3)}>
              <span>
                {read.map((row, i) => (
                  <span key={i} data-row={i}>
                    {row.trim()}
                  </span>
                ))}
              </span>
            </span>
            .<Note {...off} />
          </span>{' '}
          <span className="ab-nw">
            {w.plugin}{' '}
            <a
              href={ASPECT_NPM}
              className="ab-pn"
              target="_blank"
              rel="noopener noreferrer"
              style={n(4)}
            >
              aspect-preview
            </a>
            ,
          </span>{' '}
          <Tail text={`${w.airchos}.`}>
            <Note {...work} />
          </Tail>
        </p>
      </div>
      <div className="ab-open__foot">
        <p className="ab-open__line">{line}</p>
        <p className="sp-label ab-open__label">{label}</p>
      </div>
    </section>
  )
}

/**
 * About ("Kim jestem"), scenario 2, approved 2026-11-27: how I learn. Every path is a question, the
 * path itself with its own proof, and a decision in one plain sentence. The four decisions are four
 * different endings: it stayed, it was set aside, no answer yet, the same with a client. Each path
 * moves the way its own thing works (the hardware and the screen at two speeds, the printer printed in,
 * names coming in as doors); the motion runs on the scroll in CSS, with no script per frame. The
 * liquid lives on the first screen only and is never a full stop.
 */
export async function AboutPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'aboutPage' })
  const ts = await getTranslations({ locale, namespace: 'subpages' })

  const next = nextSubpage('about')
  const rich = { b: (chunks: ReactNode) => <b>{chunks}</b> }
  // the long headings with photo capsules inside the sentence (owner, 2026-11-27: keep them)
  const say = {
    nw: (chunks: ReactNode) => <span className="ab-nw">{chunks}</span>,
    pill: (chunks: ReactNode) => <Pill>{chunks}</Pill>,
  }
  const sayR = { ...say, pill: (chunks: ReactNode) => <Pill tilt="r">{chunks}</Pill> }
  const apps = t('home.apps').split('|')
  const read = t('cars.read').split('|')

  return (
    <SubpageFrame name={t('name')} className="ab">
      <AboutOpen
        title={t('title')}
        line={t('line')}
        label={t('label')}
        facts={(['from', 'job', 'off', 'work'] as const).map((k) => ({
          label: t(`facts.${k}`),
          note: t(`facts.${k}_n`),
        }))}
        words={{
          from: t('facts.from_v'),
          job: t('facts.job_v'),
          home: t('open.home'),
          printer: t('open.printer'),
          cars: t('open.cars'),
          plugin: t('open.plugin'),
          airchos: t('open.airchos'),
          fence: t('open.fence'),
          k1: t('open.k1'),
        }}
        apps={apps}
        read={read.slice(0, 4)}
      />

      {/* home: the vendors' apps run together into one Home Assistant dashboard */}
      <section className="ab-path ab-home" data-sp-stop data-sp-name={t('parts.home')}>
        <h2 className="ab-q ab-say" data-rv="up">
          {t.rich('home.say', say)}
        </h2>
        <div className="ab-home__body">
          <div className="ab-home__text">
            <p className="ab-tx">{t.rich('home.p1', rich)}</p>
            <p className="ab-tx">{t.rich('home.p2', rich)}</p>
          </div>
          <div className="ab-merge">
            <Stand className="ab-fence" caption={t('home.photo1')} />
            <div className="ab-screen">
              <Stand className="ab-screen__shot" caption={t('home.photo2')} />
              <ul className="ab-apps" aria-hidden="true">
                {apps.map((app, i) => (
                  <li key={app} style={n(i)}>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="ab-dec ab-dec--home" data-rv="dec">
          {t('home.dec')}
        </p>
      </section>

      {/* the printer: its photo printed in from the bottom up */}
      <section className="ab-path ab-prn" data-sp-stop data-sp-name={t('parts.printer')}>
        <div className="ab-prn__text">
          <h2 className="ab-q ab-say" data-rv="up">
            {t.rich('printer.say', sayR)}
          </h2>
          <p className="ab-tx">{t.rich('printer.p1', rich)}</p>
          <p className="ab-tx">{t.rich('printer.p2', rich)}</p>
        </div>
        <div className="ab-prn__layers">
          <Stand className="ab-prn__photo" caption={t('printer.photo')} />
        </div>
        <p className="ab-dec ab-dec--prn" data-rv="dec">
          {t('printer.dec')}
        </p>
        <PrintSentence />
      </section>

      {/* cars: a diagnostic readout scrolling by as the cable reads it */}
      <section className="ab-path ab-cars" data-sp-stop data-sp-name={t('parts.cars')}>
        <h2 className="ab-q ab-say" data-rv="up">
          {t.rich('cars.say', say)}
        </h2>
        <div className="ab-cars__body">
          <p className="ab-tx">{t.rich('cars.p1', rich)}</p>
          <figure className="ab-read" aria-label={t('cars.read_label')}>
            <div className="ab-read__win">
              <ol className="ab-read__rows">
                {read.map((row, i) => (
                  <li key={i} data-head={/^(Adres|Address)/.test(row) || undefined}>
                    {row}
                  </li>
                ))}
              </ol>
            </div>
            <figcaption>{t('cars.read_label')}</figcaption>
          </figure>
        </div>
        <p className="ab-dec ab-dec--cars" data-rv="dec">
          {t('cars.dec')}
        </p>
      </section>

      {/* projects: my own, the same approach; the names come in as doors to their pages */}
      <section className="ab-path ab-work" data-sp-stop data-sp-name={t('parts.work')}>
        <h2 className="ab-q ab-say" data-rv="up">
          {t.rich('work.say', sayR)}
        </h2>
        <ul className="ab-jobs">
          <li className="ab-job">
            <a
              href={ASPECT_NPM}
              className="ab-job__n ab-job__n--code"
              target="_blank"
              rel="noopener noreferrer"
            >
              aspect-preview
            </a>
            <p className="ab-tx">{t('work.aspect')}</p>
            <p className="ab-job__s">{t('work.aspect_s')}</p>
          </li>
          <li className="ab-job ab-job--open">
            <p className="ab-job__n">Airchos</p>
            <p className="ab-tx">{t('work.airchos')}</p>
            <p className="ab-job__s">{t('work.airchos_s')}</p>
          </li>
        </ul>
        <p className="ab-dec ab-dec--work" data-rv="dec">
          {t('work.dec')}
        </p>
      </section>

      <SubpageEnd
        next={
          next && {
            href: next.href,
            built: next.built,
            title: ts(`${next.key}.title`),
            tail: ts(`${next.key}.tail`),
            line: ts(`${next.key}.line`),
          }
        }
        peek={
          next && (
            <div className="ab-peek">
              <p className="sp-label">
                {ts(`${next.key}.title`)}
                {ts(`${next.key}.tail`)}
              </p>
              <p className="ab-peek__q">{ts(`${next.key}.peek`)}</p>
            </div>
          )
        }
      />
    </SubpageFrame>
  )
}
