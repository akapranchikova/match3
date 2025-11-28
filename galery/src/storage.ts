import { STORAGE_KEY } from './data'

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
