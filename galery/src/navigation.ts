let renderFn: (() => void) | null = null

// Register renderer so screens can trigger updates without creating circular imports
export const setRenderer = (fn: () => void) => {
  renderFn = fn
}

// Trigger a rerender from inside screen event handlers
export const rerender = () => {
  renderFn?.()
}
