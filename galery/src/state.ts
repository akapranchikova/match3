import { initialMapPositions } from './data'
import { loadOnboardingCompleted, loadViewed } from './storage'
import { AppState, RenderCleanup } from './types'

// Centralized app state used across all screens
const onboardingCompleted = loadOnboardingCompleted()

export const state: AppState = {
  screen: onboardingCompleted ? 'routeModePrompt' : 'onboardingSlide',
  slideIndex: 0,
  currentPointIndex: 0,
  currentFloor: 1,
  mapPositions: { ...initialMapPositions },
  currentContentIndex: 0,
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
