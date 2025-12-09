export interface SubtitleWord {
    start: number
    text: string
}

export interface SubtitleCue {
    start: number
    end: number
    text: string
    words: SubtitleWord[]
}

const timeToSeconds = (time: string) => {
    const [hours, minutes, rest] = time.split(':')
    const [seconds, milliseconds] = rest.split(',')
    return (
        Number(hours) * 3600 +
        Number(minutes) * 60 +
        Number(seconds) +
        Number(milliseconds) / 1000
    )
}

const buildWordTimings = (text: string, duration: number): SubtitleWord[] => {
    const words = text
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean)

    if (!words.length) return []

    const step = duration / words.length

    return words.map((word, index) => ({
        text: word,
        start: index * step,
    }))
}

export const parseSrt = (srt: string): SubtitleCue[] => {
    const blocks = srt
        .replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .trim()
        .split(/\n\n+/)

    return blocks
        .map((block) => {
            const [indexLine, timeLine, ...textLines] = block.split('\n')
            if (!indexLine || !timeLine || !textLines.length) return null

            const [startStr, endStr] = timeLine.split('-->').map((part) => part.trim())
            if (!startStr || !endStr) return null

            const start = timeToSeconds(startStr)
            const end = timeToSeconds(endStr)
            const text = textLines.join(' ').trim()
            const words = buildWordTimings(text, end - start)

            return { start, end, text, words }
        })
        .filter((cue): cue is SubtitleCue => cue !== null)
        .sort((a, b) => a.start - b.start)
}

export const loadSrt = async (url: string): Promise<SubtitleCue[]> => {
    const response = await fetch(url)
    const text = await response.text()
    return parseSrt(text)
}
