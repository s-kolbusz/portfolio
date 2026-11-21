'use client'

import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap-core'
import { useCursorStore, type CursorVariant } from '@/lib/stores'

const interactive = (el: HTMLElement | null) => el?.closest<HTMLElement>('a[href], button') ?? null

export function useCursorInteractions(enabled = true) {
  const setVariant = useCursorStore((state) => state.setVariant)
  const setMagneticTarget = useCursorStore((state) => state.setMagneticTarget)
  const activeSliderRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!enabled) return
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorEl = target.closest('[data-cursor]') as HTMLElement

      // Check if element is visible enough to interact with
      const isVisible = (el: HTMLElement) => window.getComputedStyle(el).visibility !== 'hidden'

      if (cursorEl && isVisible(cursorEl)) {
        const type = cursorEl.getAttribute('data-cursor')
        if (type) {
          setVariant(type as CursorVariant)
          if (type === 'button' || type === 'card' || type === 'project') {
            setMagneticTarget(cursorEl)
          }
        }
      } else if (interactive(target) && isVisible(interactive(target)!)) {
        // anything inside a link or a button counts (letters, spans), not only the element itself
        setVariant('button')
        setMagneticTarget(interactive(target))
      } else if (
        target.tagName === 'INPUT' &&
        (target as HTMLInputElement).type === 'range' &&
        isVisible(target)
      ) {
        setVariant('button')
        setMagneticTarget(target)
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const related = e.relatedTarget as HTMLElement
      const cursorEl = target.closest('[data-cursor]')
      const relatedCursorEl = related?.closest?.('[data-cursor]')
      const relatedDefaultCursorEl = related?.closest?.('[data-cursor="default"]')

      // Don't reset if we're actively dragging a slider
      if (activeSliderRef.current) return

      if ((cursorEl && !relatedCursorEl) || relatedDefaultCursorEl) {
        setVariant('default')
        setMagneticTarget(null)
      } else if (
        (interactive(target) ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range')) &&
        !related?.closest?.('a, button, input[type="range"]')
      ) {
        setVariant('default')
        setMagneticTarget(null)
      }
    }

    // Slider drag: switch to 'slider' variant (hides dot) on mousedown
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range') {
        activeSliderRef.current = target as HTMLInputElement
        setVariant('slider')
        setMagneticTarget(target)
      }
    }

    // Slider release
    const onMouseUp = () => {
      if (!activeSliderRef.current) return
      activeSliderRef.current = null
      setVariant('default')
      setMagneticTarget(null)
    }

    // Global click interceptor: block any click if the target or its ancestors are actively animating via GSAP
    // Uses event.composedPath() which is O(1) native vs manual DOM tree walking
    const onClick = (e: MouseEvent) => {
      const path = e.composedPath()
      for (let i = 0; i < path.length; i++) {
        const el = path[i]
        if (el === window || el === document || el === document.documentElement) break
        if (el instanceof HTMLElement && gsap.isTweening(el)) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
      }
    }

    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mouseout', onMouseOut)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('click', onClick, true)
    }
  }, [setVariant, setMagneticTarget, enabled])
}
