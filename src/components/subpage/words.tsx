import type { CSSProperties } from 'react'

/**
 * A line that rises word by word out of its own mask, as the home page's sentences do (contact, act 4).
 * The words are numbered with --i for the stagger; the motion itself lives in subpage.css.
 */
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  const words = text.split(' ')
  return words.map((word, i) => (
    <span key={i}>
      <span className="sp-word">
        <span style={{ '--i': from + i } as CSSProperties}>{word}</span>
      </span>
      {i < words.length - 1 ? ' ' : ''}
    </span>
  ))
}
