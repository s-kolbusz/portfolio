interface ItemBounds {
  top: number
  bottom: number
}

export function isItemOutsideViewport(
  bounds: ItemBounds,
  viewportHeight: number,
  topThreshold: number
) {
  return bounds.bottom > viewportHeight || bounds.top < topThreshold
}
