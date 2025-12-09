export const introSubtitles = [
  {
    text: `1
00:00:00,040 --> 00:00:03,960
Приветствую вас на выставке «Образ Москвы в русском искусстве»,

2
00:00:04,219 --> 00:00:04,839
на ВДНХ.

3
00:00:05,939 --> 00:00:08,538
Приглашаю вас пройти вместе со мной по выставке

4
00:00:08,538 --> 00:00:11,538
и увидеть, как менялся облик столицы.

5
00:00:12,400 --> 00:00:17,199
Я профессиональный архитектор и меня всегда вдохновляла архитектура прошлого.

6
00:00:18,039 --> 00:00:20,620
Многие здания не сохранились до нашего времени,

7
00:00:21,239 --> 00:00:26,420
но работы художников запечатлели облик Москвы в разные исторические периоды.

8
00:00:27,260 --> 00:00:29,800
Эти произведения искусства бесценны -

9
00:00:30,100 --> 00:00:33,380
они показывали не только исторические изменения города,

10
00:00:34,079 --> 00:00:35,939
но и помогали его восстанавливать.

11
00:00:36,740 --> 00:00:39,700
Только благодаря им можно увидеть облик города,

12
00:00:40,000 --> 00:00:41,640
который существовал в прошлом.

13
00:00:42,719 --> 00:00:46,259
Приглашаю вас отправиться в увлекательное путешествие по выставке.

14
00:00:47,020 --> 00:00:50,399
Надеюсь, что оно подарит вам новые впечатления и

15
00:00:50,399 --> 00:00:52,600
поможет взглянуть по новому на Москву.
`,
  },
]

interface SubtitleBlock {
  id: number
  startTime: number
  endTime: number
  text: string
  words: string[]
  duration: number
}

interface WordState {
  opacity: number
  color: string
  blur: number
}

// Parse SRT time format to milliseconds
const parseTime = (timeStr: string): number => {
  const [time, ms] = timeStr.split(",")
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + Number(ms)
}

// Parse SRT content into structured data
const parseSRT = (srtText: string): SubtitleBlock[] => {
  const blocks = srtText.trim().split(/\n\s*\n/)
  return blocks.map((block) => {
    const lines = block.trim().split("\n")
    const id = parseInt(lines[0])
    const [startTime, endTime] = lines[1].split(" --> ").map(parseTime)
    const text = lines.slice(2).join(" ")
    const words = text.split(/\s+/)

    return {
      id,
      startTime,
      endTime,
      text,
      words,
      duration: endTime - startTime,
    }
  })
}

// Get word timing within a subtitle block using linear interpolation
const getWordTime = (subtitle: SubtitleBlock, wordIndex: number): number => {
  const wordDuration = subtitle.duration / subtitle.words.length
  return subtitle.startTime + wordIndex * wordDuration
}

// Easing function for smooth transitions
//const easeInOut = (t: number): number => {
//  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
//};

// Calculate smooth state with wider transition ranges
const calculateSmoothState = (
  wordTime: number,
  wordDuration: number,
  currentTime: number
): WordState => {
  // Extend the transition range to be smoother
  const transitionRange = wordDuration * 1.5
  const timeUntilWord = wordTime - currentTime
  const timeSinceWordStart = currentTime - wordTime

  // Calculate a normalized position in the transition (-1 to 1)
  let position = 0
  if (timeUntilWord > 0) {
    // Word is in the future
    position = -Math.min(1, timeUntilWord / transitionRange)
  } else if (timeSinceWordStart < wordDuration) {
    // Word is currently active
    position = timeSinceWordStart / wordDuration
  } else {
    // Word is in the past
    position = 1 + (timeSinceWordStart - wordDuration) / transitionRange
  }

  // Apply easing to the position
  //  const easedPosition = easeInOut(Math.min(1, Math.max(0, Math.abs(position))));

  if (position < -0.8) {
    // Far future - barely visible
    const factor = (position + 0.8) / 0.2 // Normalize from -1 to -0.8 to 0-1
    return {
      opacity: 0.8 + 0.2 * factor,
      color: `rgb(${78 + Math.floor(34 * factor)}, ${78 + Math.floor(34 * factor)}, ${78 + Math.floor(34 * factor)})`,
      blur: 2 - 2 * factor,
    }
  } else if (position < 0) {
    // Near future - becoming visible
    const factor = (position + 0.8) / 0.8 // Normalize from -0.8 to 0 to 0-1
    return {
      opacity: 0.9 + 0.1 * (1 - Math.abs(factor - 0.5) * 2),
      color: `rgb(${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))})`,
      blur: 0,
    }
  } else if (position < 1) {
    // Active word
    const factor = position // Already 0-1
    return {
      opacity: 0.9 + 0.1 * (1 - Math.abs(factor - 0.5) * 2),
      color: `rgb(${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))})`,
      blur: 0,
    }
  } else if (position < 1.8) {
    // Recent past
    const factor = (position - 1) / 0.8 // Normalize from 1 to 1.8 to 0-1
    return {
      opacity: 0.9 + 0.1 * (1 - Math.abs(factor - 0.5) * 2),
      color: `rgb(${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))})`,
      blur: 0 + 1.5 * Math.abs(factor - 0.5) * 2,
    }
  } else {
    // Distant past
    const factor = Math.min(1, (position - 1.8) / 0.7) // Normalize from 1.8 to 2.5 to 0-1
    return {
      opacity: 0.9 + 0.1 * (1 - Math.abs(factor - 0.5) * 2),
      color: `rgb(${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))}, ${178 + Math.floor(77 * (1 - Math.abs(factor - 0.5) * 2))})`,
      blur: 0 + 1.5 * Math.abs(factor - 0.5) * 2,
    }
  }
}

// Create HTML span for a word with appropriate styling
const createWordSpan = (word: string, state: WordState): string => {
  return `<span class="_word" style="display:inline-block;opacity: ${state.opacity}; filter: blur(${state.blur / 3}px)">${word}</span>`
}

// Find active subtitles around current time
const getActiveSubtitles = (
  subtitles: SubtitleBlock[],
  currentTime: number
): SubtitleBlock[] => {
  const currentIndex = subtitles.findIndex(
    (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
  )

  if (currentIndex === -1) {
    // Find closest subtitle
    const closest = subtitles.reduce((prev, curr) => {
      const prevDiff = Math.abs(prev.startTime - currentTime)
      const currDiff = Math.abs(curr.startTime - currentTime)
      return currDiff < prevDiff ? curr : prev
    })
    const closestIndex = subtitles.indexOf(closest)
    // return subtitles.slice(Math.max(0, closestIndex - 1), closestIndex + 2)
    return [subtitles[closestIndex]]
  }

  // Return current subtitle plus one before and one after
  // const start = Math.max(0, currentIndex - 1)
  // const end = Math.min(subtitles.length, currentIndex + 2)
  // return subtitles.slice(start, end)
  return [subtitles[currentIndex]]
}

// Main function: get subtitles HTML for current time
export const getSubtitles = (srt: string, time: number): string => {
  const currentTimeMs = time * 1000 // Convert seconds to milliseconds
  const subtitles = parseSRT(srt)
  const activeSubtitles = getActiveSubtitles(subtitles, currentTimeMs)

  return activeSubtitles
    .map((subtitle) => {
      const wordDuration = subtitle.duration / subtitle.words.length

      const wordsHTML = subtitle.words
        .map((word, index) => {
          const wordTime = getWordTime(subtitle, index)
          const state = calculateSmoothState(
            wordTime,
            wordDuration,
            currentTimeMs
          )
          return createWordSpan(word, state)
        })
        .join(" ")

      return `<div class="subtitle-block">${wordsHTML}</div>`
    })
    .join("")
}
