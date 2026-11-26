import type { CSSProperties, ReactNode } from 'react'

import './rise.css'

/** seconds between two words of one line of text rising in (the stronypodhale wordmark uses 0.035 per letter) */
export const WORD_STEP = 0.04

/** A delay for an element that rises as a block, in seconds from the scene's start. */
export const riseAt = (at: number): CSSProperties => ({ '--d': at }) as CSSProperties

/**
 * Text that rises word by word from under its own line, as the stronypodhale.pl scene's wordmark
 * does. Each word sits in a mask clipped only along the bottom edge it rises from. The scene that
 * holds it (useReveal) decides when it plays.
 */
export function Rise({ text, at = 0 }: { text: string; at?: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  const out: ReactNode[] = []
  words.forEach((word, index) => {
    if (index) out.push(' ')
    out.push(
      <span key={index} className="rv-m">
        <span className="rv-i" style={riseAt(at + index * WORD_STEP)}>
          {word}
        </span>
      </span>
    )
  })
  return <>{out}</>
}
