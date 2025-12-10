import { points } from './data'

const ALLOWED_HOSTS = new Set(['permgal.4app.pro', 'localhost', '127.0.0.1', '0.0.0.0'])

// Map of known aggregator URL suffixes to zero-based point indices.
// Add new entries here when issuing QR links through the aggregator service.
const AGGREGATOR_SUFFIX_TO_POINT = new Map<string, number>([
  ['z604DazV', 0],
  ['nkA6Epda', 1],
  ['eO3JtVwB', 2],
  ['s6K6u2tH', 3],
  ['QsnwmPTq', 4],
  ['MQkDEzW7', 5],
])

const extractAggregatorSuffix = (payload: string): string | null => {
  try {
    const url = new URL(payload, window.location.href)
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return null
    return segments[segments.length - 1]
  } catch (error) {
    const trimmed = payload.trim()
    if (!trimmed) return null

    const fallbackSegments = trimmed.split('/').filter(Boolean)
    if (fallbackSegments.length === 0) return trimmed

    return fallbackSegments[fallbackSegments.length - 1]
  }
}

const extractIndexFromAggregatorSuffix = (payload: string): number | null => {
  const suffix = extractAggregatorSuffix(payload)
  if (!suffix) return null

  const index = AGGREGATOR_SUFFIX_TO_POINT.get(suffix)
  return typeof index === 'number' ? index : null
}

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

const resolveRedirectTarget = async (payloadUrl: string): Promise<string | null> => {
  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    const response = await fetch(payloadUrl, { redirect: 'follow', signal: controller.signal })
    window.clearTimeout(timeout)

    if (!response.url) return payloadUrl

    return response.url
  } catch (error) {
    console.warn('[qr] failed to resolve redirect target', error)
    return null
  }
}

export const resolvePointIndexFromPayload = (payload: string): number | null => {
  const trimmed = payload.trim()
  if (!trimmed) return null

  const fromAggregator = extractIndexFromAggregatorSuffix(trimmed)
  if (fromAggregator !== null) return fromAggregator

  const fromUrl = parseIndexFromUrl(trimmed)
  if (fromUrl !== null) return fromUrl

  const fromNumber = extractIndexFromPeriod(trimmed)
  if (fromNumber !== null) return fromNumber

  const fromId = points.findIndex((point) => point.id === trimmed)
  return fromId >= 0 ? fromId : null
}

export const resolvePointIndexFromPayloadWithRedirect = async (
  payload: string
): Promise<{ index: number | null; finalUrl: string | null }> => {
  const trimmed = payload.trim()
  if (!trimmed) return { index: null, finalUrl: null }

  const directIndex = resolvePointIndexFromPayload(trimmed)
  if (directIndex !== null) return { index: directIndex, finalUrl: null }

  let payloadUrl: URL | null = null

  try {
    payloadUrl = new URL(trimmed, window.location.href)
  } catch (error) {
    return { index: null, finalUrl: null }
  }

  if (!payloadUrl.protocol.startsWith('http')) return { index: null, finalUrl: null }

  const redirectedUrl = await resolveRedirectTarget(payloadUrl.toString())
  if (!redirectedUrl) return { index: null, finalUrl: null }

  const redirectedIndex = resolvePointIndexFromPayload(redirectedUrl)
  return { index: redirectedIndex, finalUrl: redirectedUrl }
}

export const resolvePointIndexFromLocation = (location: Location): number | null => {
  return resolvePointIndexFromPayload(location.href)
}
