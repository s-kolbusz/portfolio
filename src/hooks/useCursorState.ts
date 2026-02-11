import { useCursorStore, CursorVariant } from '@/lib/cursor-store'

export const useCursorState = () => {
  const { variant, text, magneticTarget, setVariant, setText, setMagneticTarget } = useCursorStore(
    (state) => ({
      variant: state.variant,
      text: state.text,
      magneticTarget: state.magneticTarget,
      setVariant: state.setVariant,
      setText: state.setText,
      setMagneticTarget: state.setMagneticTarget,
    })
    // shallow comparison is good if we were selecting multiple things,
    // but here we are selecting almost everything.
    // 'shallow' import might need 'zustand/shallow' which is deprecated in v5?
    // Let's just return the state directly from the store hook in the component
    // or use the store directly.
  )

  return {
    variant,
    text,
    magneticTarget,
    setVariant,
    setText,
    setMagneticTarget,
  }
}

// Helper for components that want to trigger cursor changes
export const useCursorHandlers = (variant: CursorVariant = 'default', magnetic = false) => {
  const setVariant = useCursorStore((state) => state.setVariant)
  const setMagneticTarget = useCursorStore((state) => state.setMagneticTarget)

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    setVariant(variant)
    if (magnetic) {
      setMagneticTarget(e.currentTarget)
    }
  }

  const onMouseLeave = () => {
    setVariant('default')
    if (magnetic) {
      setMagneticTarget(null)
    }
  }

  return { onMouseEnter, onMouseLeave }
}
