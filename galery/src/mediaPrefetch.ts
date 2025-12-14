// mediaPrefetch.ts
type MediaKind = 'video' | 'audio' | 'subs'

const cache = new Map<string, Promise<string>>() // url -> Promise<objectUrl>
const controllers = new Map<string, AbortController>()

const MAX_IN_FLIGHT = 3
let inFlight = 0
const queue: Array<() => void> = []

const run = (job: () => void) => {
    if (inFlight < MAX_IN_FLIGHT) {
        inFlight++
        job()
        return
    }
    queue.push(job)
}

const done = () => {
    inFlight = Math.max(0, inFlight - 1)
    const next = queue.shift()
    if (next) run(next)
}

export const abortPrefetch = (url: string) => {
    controllers.get(url)?.abort()
    controllers.delete(url)
}

export const prefetchToObjectUrl = (url: string, kind: MediaKind) => {
    if (!url) return Promise.resolve(url)
    if (cache.has(url)) return cache.get(url)!

    const ctrl = new AbortController()
    controllers.set(url, ctrl)

    const p = new Promise<string>((resolve, reject) => {
        run(async () => {
            try {
                // subs обычно маленькие — можно просто text() (но blob тоже ок)
                const res = await fetch(url, {
                    signal: ctrl.signal,
                    // credentials: 'same-origin', // включи если нужно
                    cache: 'force-cache',
                })

                if (!res.ok) throw new Error(`prefetch failed ${res.status}`)

                const blob = await res.blob()
                const objUrl = URL.createObjectURL(blob)
                resolve(objUrl)
            } catch (e) {
                // если префетч не вышел — вернём оригинальный url, чтобы видео всё равно попыталось загрузиться
                resolve(url)
            } finally {
                controllers.delete(url)
                done()
            }
        })
    })

    cache.set(url, p)
    return p
}

// Можно звать при уходе со страницы, чтобы не держать blob-URLs в памяти:
export const revokeObjectUrlIfAny = async (originalUrl: string) => {
    const v = cache.get(originalUrl)
    if (!v) return
    const resolved = await v
    if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved)
    cache.delete(originalUrl)
}
