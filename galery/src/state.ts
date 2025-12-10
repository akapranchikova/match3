import { initialMapPositions } from './data'
import {
  loadCameraPermissionGranted,
  loadOnboardingCompleted,
  loadNextPointHintsCompleted,
  loadSoundEnabled,
  loadViewed,
} from './storage'
import { AppState, RenderCleanup } from './types'
import { resolvePointIndexFromLocation } from './qr'

// Centralized app state used across all screens
const soundEnabled = loadSoundEnabled()
const onboardingCompleted = loadOnboardingCompleted()
const deepLinkPointIndex = resolvePointIndexFromLocation(window.location)
const cameraPermissionGranted = loadCameraPermissionGranted()
const nextPointHintsCompleted = loadNextPointHintsCompleted()

const isExternalReferrer = (): boolean => {
  if (!document.referrer) return true

  try {
    const referrerUrl = new URL(document.referrer)
    return referrerUrl.origin !== window.location.origin
  } catch (error) {
    console.warn('[state] failed to parse referrer URL', error)
    return true
  }
}

const deepLinkRequiresHeadphones = deepLinkPointIndex !== null && isExternalReferrer()

export const state: AppState = {
  screen: 'loader',
  routeMode: 'guide',
  slideIndex: 0,
  currentPointIndex: deepLinkPointIndex ?? 0,
  currentFloor: 1,
  mapPositions: { ...initialMapPositions },
  currentContentIndex: 0,
  soundEnabled,
  onboardingCompleted,
  deepLinkPointIndex,
  deepLinkRequiresHeadphones,
  scannerExpectedPointIndex: null,
  scannerOrigin: null,
  cameraPermissionGranted,
  nextPointHintsCompleted,
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
