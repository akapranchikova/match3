import { initialMapPosition } from './data'
import { loadViewed } from './storage'
import { AppState, RenderCleanup } from './types'

// Centralized app state used across all screens
export const state: AppState = {
  screen: 'onboardingSlide',
  slideIndex: 0,
  currentPointIndex: 0,
  mapPosition: initialMapPosition,
}

export let viewedPoints = loadViewed()

let teardown: RenderCleanup | null = null

export const resetTeardown = () => {
  if (typeof teardown === 'function') {
    teardown()
  }
  teardown = null
}

export const setTeardown = (cleanup: RenderCleanup | null) => {
  teardown = cleanup
}
