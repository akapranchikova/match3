import { initialMapPositions } from './data'
import { loadOnboardingCompleted, loadSoundEnabled, loadViewed } from './storage'
import { AppState, RenderCleanup } from './types'
import { resolvePointIndexFromLocation } from './qr'

// Centralized app state used across all screens
const soundEnabled = loadSoundEnabled()
const onboardingCompleted = loadOnboardingCompleted()
const deepLinkPointIndex = resolvePointIndexFromLocation(window.location)

export const state: AppState = {
  screen: 'loader',
  slideIndex: 0,
  currentPointIndex: deepLinkPointIndex ?? 0,
  currentFloor: 1,
  mapPositions: { ...initialMapPositions },
  currentContentIndex: 0,
  soundEnabled,
  onboardingCompleted,
  deepLinkPointIndex,
  scannerExpectedPointIndex: null,
  scannerOrigin: null,
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
