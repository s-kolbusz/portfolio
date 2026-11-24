import { HowIWorkCase } from './how-i-work-case'
import { HowIWorkEnd } from './how-i-work-end'
import { HowIWorkRelay } from './how-i-work-relay'
import { HowIWorkStock } from './how-i-work-stock'

/**
 * Act 4, "how I work" (owner, 2026-11-21): four pinned scenes, one after another, carried by the
 * same liquid. Line 1: one line, four crafts, with proofs to check. Line 2: the page off the shelf,
 * turning from a template into the site. Line 3: the album a client asked for and the scene he got
 * (piczura.com). The close: the three sentences in front of one full stop, then the door to
 * stronypodhale.pl.
 */
export function HowIWork() {
  return (
    <>
      <HowIWorkRelay />
      <HowIWorkStock />
      <HowIWorkCase />
      <HowIWorkEnd />
    </>
  )
}
