import { useEffect, useRef } from 'react'

import { useCursorStore, CursorVariant } from '@/features/navigation/lib/cursor-store'

export function useCursorInteractions() {
  const setVariant = useCursorStore((state) => state.setVariant)
  const setMagneticTarget = useCursorStore((state) => state.setMagneticTarget)
  const activeSliderRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorEl = target.closest('[data-cursor]') as HTMLElement

      // Check if element is visible enough to interact with
      const isVisible = (el: HTMLElement) => {
        const style = window.getComputedStyle(el)
        return parseFloat(style.opacity) > 0.9 && style.visibility !== 'hidden'
      }

      if (cursorEl && isVisible(cursorEl)) {
        const type = cursorEl.getAttribute('data-cursor')
        if (type) {
          setVariant(type as CursorVariant)
          if (type === 'button' || type === 'card' || type === 'project') {
            setMagneticTarget(cursorEl)
          }
        }
      } else if ((target.tagName === 'A' || target.tagName === 'BUTTON') && isVisible(target)) {
        setVariant('button')
        setMagneticTarget(target)
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

      // Don't reset if we're actively dragging a slider
      if (activeSliderRef.current) return

      if (cursorEl && !relatedCursorEl) {
        setVariant('default')
        setMagneticTarget(null)
      } else if (
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'range')) &&
        !related?.closest('a, button, input[type="range"]')
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

    window.addEventListener('mouseover', onMouseOver)
    window.addEventListener('mouseout', onMouseOut)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mouseover', onMouseOver)
      window.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [setVariant, setMagneticTarget])
}
