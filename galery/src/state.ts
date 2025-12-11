import { initialMapPositions, points } from './data'
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
export let viewedPoints = loadViewed()

export const resolveNextPointIndex = (): number => {
  if (deepLinkPointIndex !== null) return deepLinkPointIndex

  const firstIncompleteIndex = points.findIndex((point) => !viewedPoints.has(point.id))

  if (firstIncompleteIndex !== -1) return firstIncompleteIndex

  return Math.max(points.length - 1, 0)
}

export const getFirstUnviewedPointIndex = (): number => {
  const firstIncompleteIndex = points.findIndex((point) => !viewedPoints.has(point.id))

  if (firstIncompleteIndex !== -1) return firstIncompleteIndex

  return Math.max(points.length - 1, 0)
}

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
  currentPointIndex: resolveNextPointIndex(),
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
