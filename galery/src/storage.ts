import { STORAGE_KEY } from './data'

const SOUND_ENABLED_KEY = 'gallery-sound-enabled'
const LOADER_KEY = 'gallery-loader-complete'

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

export const loadSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(SOUND_ENABLED_KEY)
  return stored === null ? true : stored === 'true'
}

export const saveSoundEnabled = (enabled: boolean) => {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
}

export const loadLoaderCompleted = (): boolean => {
  return localStorage.getItem(LOADER_KEY) === 'true'
}

export const saveLoaderCompleted = () => {
  localStorage.setItem(LOADER_KEY, 'true')
}
