import { STORAGE_KEY } from './data'

const ONBOARDING_KEY = 'gallery-onboarding-complete'
const SOUND_ENABLED_KEY = 'gallery-sound-enabled'
const CAMERA_PERMISSION_KEY = 'gallery-camera-permission-granted'
const NEXT_POINT_HINTS_KEY = 'gallery-next-point-hints'

// Responsible for persisting which points were already viewed by the visitor
export const loadViewed = (): Set<string> => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return new Set()
  try {
    const parsed = JSON.parse(stored)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch (err) {
    console.warn('Не удалось прочитать просмотренные точки', err)
    return new Set()
  }
}

export const saveViewed = (set: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
}

export const loadOnboardingCompleted = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export const saveOnboardingCompleted = () => {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

export const loadSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY)
  return stored === null ? false : stored === 'true'
}

export const saveSoundEnabled = (enabled: boolean) => {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
}

export const loadCameraPermissionGranted = (): boolean => {
  return localStorage.getItem(CAMERA_PERMISSION_KEY) === 'true'
}

export const saveCameraPermissionGranted = () => {
  localStorage.setItem(CAMERA_PERMISSION_KEY, 'true')
}

export const loadNextPointHintsCompleted = (): boolean => {
  return localStorage.getItem(NEXT_POINT_HINTS_KEY) === 'true'
}

export const saveNextPointHintsCompleted = () => {
  localStorage.setItem(NEXT_POINT_HINTS_KEY, 'true')
}

