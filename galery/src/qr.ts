import { points } from './data'

const ALLOWED_HOSTS = new Set(['permgal.4app.pro', 'localhost', '127.0.0.1', '0.0.0.0'])

const isAllowedHost = (hostname: string) => {
  const normalized = hostname.toLowerCase()
  return ALLOWED_HOSTS.has(normalized) || normalized === window.location.hostname.toLowerCase()
}

const extractIndexFromPeriod = (value: string | null): number | null => {
  if (!value) return null
  const periodNumber = Number.parseInt(value, 10)
  if (!Number.isInteger(periodNumber)) return null

  const zeroBasedIndex = periodNumber - 1
  return zeroBasedIndex >= 0 && zeroBasedIndex < points.length ? zeroBasedIndex : null
}

const parseIndexFromUrl = (payload: string): number | null => {
  try {
    const url = new URL(payload, window.location.href)
    if (!isAllowedHost(url.hostname)) return null

    return extractIndexFromPeriod(url.searchParams.get('period'))
  } catch (err) {
    return null
  }
}

export const resolvePointIndexFromPayload = (payload: string): number | null => {
  const trimmed = payload.trim()
  if (!trimmed) return null

  const fromUrl = parseIndexFromUrl(trimmed)
  if (fromUrl !== null) return fromUrl

  const fromNumber = extractIndexFromPeriod(trimmed)
  if (fromNumber !== null) return fromNumber

  const fromId = points.findIndex((point) => point.id === trimmed)
  return fromId >= 0 ? fromId : null
}

export const resolvePointIndexFromLocation = (location: Location): number | null => {
  return resolvePointIndexFromPayload(location.href)
}
