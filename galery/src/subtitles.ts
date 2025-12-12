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

const parseTimecode = (value: string): number => {
    const match = value.trim().match(/(\d{2}):(\d{2}):(\d{2}),?(\d{3})?/) || []
    const hours = Number(match[1] || 0)
    const minutes = Number(match[2] || 0)
    const seconds = Number(match[3] || 0)
    const milliseconds = Number(match[4] || 0)

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
}

const createWordsFromText = (text: string, start: number, end: number): SubtitleWord[] => {
    const parts = text
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean)

    if (!parts.length) return []

    const duration = Math.max(0.1, end - start)
    const step = duration / parts.length

    return parts.map((word, index) => ({
        text: word,
        start: index * step,
    }))
}

const parseSrtBlock = (block: string): SubtitleCue | null => {
    const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

    if (!lines.length) return null

    const timeLineIndex = lines.findIndex((line) => line.includes('-->'))
    if (timeLineIndex === -1) return null

    const timeLine = lines[timeLineIndex]
    const [startRaw, endRaw] = timeLine.split('-->').map((part) => part.trim())
    if (!startRaw || !endRaw) return null

    const start = parseTimecode(startRaw)
    const end = parseTimecode(endRaw)
    const text = lines.slice(timeLineIndex + 1).join('\n')

    return {
        start,
        end,
        text,
        words: createWordsFromText(text, start, end),
    }
}

export const parseSrt = (content: string): SubtitleCue[] =>
    content
        .split(/\r?\n\r?\n/)
        .map((block) => parseSrtBlock(block))
        .filter((cue): cue is SubtitleCue => Boolean(cue))

export const loadSrtSubtitles = async (url: string, fallback: SubtitleCue[] = []): Promise<SubtitleCue[]> => {
    try {
        const response = await fetch(url)
        if (!response.ok) return fallback

        const content = await response.text()
        const parsed = parseSrt(content)

        return parsed.length ? parsed : fallback
    } catch (error) {
        console.error('Failed to load subtitles', error)
        return fallback
    }
}

export const createCueFromText = (text: string, start: number, end: number): SubtitleCue => ({
    start,
    end,
    text,
    words: createWordsFromText(text, start, end),
})
