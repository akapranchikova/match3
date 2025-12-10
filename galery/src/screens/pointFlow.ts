import { points } from '../data'
import { rerender } from '../navigation'
import { saveCameraPermissionGranted, saveSoundEnabled, saveViewed } from '../storage'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import onboardingVoice from '../assets/onboarding-voice.png'
import routePreview from '../assets/onboarding-photo.svg'
import { loadSrtSubtitles, SubtitleCue } from '../subtitles'
import { hasCameraPermission } from '../permissions'

const pointProgressHeadings = [
  {
    title: 'Пройдено 0 из 6 точек',
    subtitle: 'Перейдём к первой точке',
  },
  {
    title: 'Пройдено 1 из 6 точек',
    subtitle: 'Готовы к следующей?',
  },
  {
    title: 'Пройдено 2 из 6 точек',
    subtitle: 'Следующая точка уже близко',
  },
  {
    title: 'Пройдено 3 из 6 точек',
    subtitle: 'Продолжаем путешествие!',
  },
  {
    title: 'Пройдено 4 из 6 точек',
    subtitle: 'Осталось всего пару шагов',
  },
  {
    title: 'Пройдено 5 из 6 точек',
    subtitle: 'Осталась последняя точка!',
  },
]

const getPointProgressHeading = (completedPoints: number) => {
  const headingIndex = Math.min(completedPoints, pointProgressHeadings.length - 1)
  return pointProgressHeadings[headingIndex] || pointProgressHeadings[0]
}

const transitionAssets: Record<number, { audio: string; subtitles: string }> = {
  1: {
    audio: '../assets/audio/Переход к точке 1..mp3',
    subtitles: '../assets/audio/Переход к точке 1..srt',
  },
  2: {
    audio: '../assets/points/2/Переход между точками 1 и 2..mp3',
    subtitles: '../assets/points/2/Переход между точками 1 и 2..srt',
  },
}

const getTransitionAssetUrl = (pointNumber: number, type: 'audio' | 'subtitles') => {
  const assets = transitionAssets[pointNumber]

  if (assets) {
    const assetPath = type === 'audio' ? assets.audio : assets.subtitles
    return new URL(assetPath, import.meta.url).href
  }

  const extension = type === 'audio' ? 'mp3' : 'srt'

  return new URL(`../assets/audio/Переход к точке ${pointNumber}..${extension}`, import.meta.url).href
}

const markPointAsViewed = () => {
  viewedPoints.add(points[state.currentPointIndex].id)
  saveViewed(viewedPoints)
}

export const handleFinishPoint = () => {
  markPointAsViewed()
  state.screen = 'infoComplete'
}

export const navigateToNextPoint = () => {
  markPointAsViewed()
  const nextIndex = Math.min(state.currentPointIndex + 1, points.length - 1)
  state.currentPointIndex = nextIndex
  state.screen = 'nextPoint'
}

export const renderPointInfo = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const highlightsList = point.highlights?.length
    ? `<p class="text-block__title">Обратите внимание</p>
        <ul class="text-block__list">
          ${point.highlights.map((item) => `<li>${item}</li>`).join('')}
        </ul>`
    : ''

  const textBlock = point.longDescription || highlightsList
    ? `<div class="text-block">
        ${point.longDescription ? `<p class="text-block__lead">${point.longDescription}</p>` : ''}
        ${highlightsList}
      </div>`
    : ''

  const section = document.createElement('section')
  section.className = 'card'
  section.innerHTML = `
    <div class="card__meta card__meta--inline">Маршрут «Голос времени»</div>
    <h1>${point.title}</h1>
    <p>${point.description}</p>
    ${textBlock}
    <div class="card__preview large">
      <img src="${routePreview}" alt="Превью точки «${point.title}»" class="card__image">
    </div>
    <div class="point-layout__actions">
      <button class="button secondary" data-action="intro">Вводный контент точки</button>
    </div>
    <button class="button primary" data-action="finish">Закончить точку</button>
  `

  section.querySelector<HTMLButtonElement>('[data-action="intro"]')?.addEventListener('click', () => {
    state.screen = 'pointContent'
    state.currentContentIndex = 0
    rerender()
  })

  section.querySelector<HTMLButtonElement>('[data-action="finish"]')?.addEventListener('click', () => {
    handleFinishPoint()
    rerender()
  })

  return section
}

export const renderInfoComplete = (): HTMLElement => {
  const completedPoints = viewedPoints.size
  const heading = getPointProgressHeading(completedPoints)
  const remaining = points.length - completedPoints

  document.title = heading.title

  const overlay = document.createElement('div')
  overlay.className = 'overlay'
  overlay.innerHTML = `
    <div class="modal">
      <p class="modal__eyebrow">${heading.title}</p>
      <h2 class="modal__title">${heading.subtitle}</h2>
      <p>${remaining > 0 ? `Впереди ещё ${remaining} истории` : 'Вы посмотрели все точки маршрута.'}</p>
    </div>
  `

  const modal = overlay.querySelector<HTMLDivElement>('.modal')

  const primary = createButton('Да, узнать, где следующая точка')
  primary.addEventListener('click', () => {
    const nextIndex = Math.min(state.currentPointIndex + 1, points.length - 1)
    state.currentPointIndex = nextIndex
    state.screen = 'nextPoint'
    rerender()
  })

  const secondary = createButton('Нет, открыть весь маршрут', 'secondary')
  secondary.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  modal?.appendChild(primary)
  modal?.appendChild(secondary)
  return overlay
}

export const renderNextPoint = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const completedPoints = viewedPoints.size
  const progressHeading = getPointProgressHeading(completedPoints)
  const card = document.createElement('section')
  card.className = 'card card--point card--next'
  card.innerHTML = `
    <div class="point-layout__header">
      <div>
        <p class="point-layout__eyebrow">${progressHeading.title}</p>
        <h1 class="point-layout__title">${progressHeading.subtitle}</h1>
      </div>
      <button class="button icon-button primary route-button" data-action="route" aria-label="Продолжить без гида">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9.49902L19 20L14 20L14 14H10L10 20H5L5 9.49902L12 4.24902L19 9.49902Z" stroke="#E2E2E2" stroke-width="2"/>
        </svg>
      </button>
    </div>
    <article class="point-visual">
      <div class="point-visual__frame">
        <button class="button icon-button primary map-button" data-action="map" aria-label="Открыть карту этажа">
          <span class="icon-button__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.35 20.7C4.01667 20.8333 3.70833 20.7958 3.425 20.5875C3.14167 20.3792 3 20.1 3 19.75L3 5.75C3 5.53333 3.0625 5.34167 3.1875 5.175C3.3125 5.00833 3.48333 4.88333 3.7 4.8L9 3L15 5.1L19.65 3.3C19.9833 3.16667 20.2917 3.20417 20.575 3.4125C20.8583 3.62083 21 3.9 21 4.25V12.675C20.75 12.2917 20.4542 11.9417 20.1125 11.625C19.7708 11.3083 19.4 11.0333 19 10.8V5.7L16 6.85L16 10C15.65 10 15.3083 10.0292 14.975 10.0875C14.6417 10.1458 14.3167 10.2333 14 10.35L14 6.85L10 5.45L10 18.525L4.35 20.7ZM5 18.3L8 17.15L8 5.45L5 6.45L5 18.3ZM16 18C16.5667 18 17.0375 17.8333 17.4125 17.5C17.7875 17.1667 17.9833 16.6667 18 16C18.0167 15.4333 17.8292 14.9583 17.4375 14.575C17.0458 14.1917 16.5667 14 16 14C15.4333 14 14.9583 14.1917 14.575 14.575C14.1917 14.9583 14 15.4333 14 16C14 16.5667 14.1917 17.0417 14.575 17.425C14.9583 17.8083 15.4333 18 16 18ZM16 20C14.9 20 13.9583 19.6083 13.175 18.825C12.3917 18.0417 12 17.1 12 16C12 14.9 12.3917 13.9583 13.175 13.175C13.9583 12.3917 14.9 12 16 12C17.1 12 18.0417 12.3917 18.825 13.175C19.6083 13.9583 20 14.9 20 16C20 16.3833 19.9542 16.7458 19.8625 17.0875C19.7708 17.4292 19.6333 17.75 19.45 18.05L22 20.6L20.6 22L18.05 19.45C17.75 19.6333 17.4292 19.7708 17.0875 19.8625C16.7458 19.9542 16.3833 20 16 20Z" fill="#E2E2E2"/>
            </svg>
          </span>
        </button>

        <div class="point-visual__placeholder" role="img" aria-label="${point.photoAlt || `Превью точки «${point.title}»`}"></div>
        <p class="point-visual__caption">${point.description}</p>
      </div>
    </article>
    <div class="point-layout__actions point-layout__actions--inline">
      <button class="button secondary" data-action="scan">Отсканировать QR код</button>
    </div>
    <p class="point-layout__hint"> Отсканируйте QR-код, чтобы открыть следующую часть маршрута</p>
    <div class="point-layout__route footer">
      <div class="footer__voice">
        <img src="${onboardingVoice}" alt="voice-img" class="footer__voice__image">
        <div class="footer__subtitles" aria-live="polite"></div>
      </div>
      <div class="footer__button"></div>
    </div>
  `

  const pointNumber = state.currentPointIndex + 1
  let footerAudio: HTMLAudioElement | null = null

  const footerVoice = card.querySelector<HTMLDivElement>('.footer__voice')
  if (footerVoice) {
    const subtitleWrapper = footerVoice.querySelector<HTMLDivElement>('.footer__subtitles')
    const subtitleText = document.createElement('p')
    subtitleText.className = 'footer__subtitle-text'
    const defaultSubtitleMessage = ''

    const renderDefaultSubtitle = () => {
      subtitleText.replaceChildren()
      subtitleText.textContent = defaultSubtitleMessage
      subtitleWrapper?.classList.remove('footer__subtitles--visible')
    }

    renderDefaultSubtitle()

    subtitleWrapper?.appendChild(subtitleText)

    const audioSrc = getTransitionAssetUrl(pointNumber, 'audio')
    const subtitlesUrl = getTransitionAssetUrl(pointNumber, 'subtitles')

    footerAudio = document.createElement('audio')
    footerAudio.className = 'footer__audio'
    footerAudio.src = audioSrc
    footerAudio.preload = 'auto'
    footerAudio.autoplay = state.soundEnabled
    footerAudio.muted = !state.soundEnabled

    let footerCues: SubtitleCue[] = []
    let activeCueIndex: number | null = null
    let revealedWordCount = 0

    const findActiveCueIndex = (current: number) =>
      footerCues.findIndex((cue, index) => {
        const isLastCue = index === footerCues.length - 1
        const cueEnd = isLastCue ? cue.end + 0.15 : cue.end
        return current >= cue.start && current < cueEnd
      })

    const renderWords = (words: { text: string }[], visibleCount: number) => {
      subtitleText.replaceChildren()

      if (!words.length) {
        subtitleText.textContent = defaultSubtitleMessage
        return
      }

      words.forEach((word, index) => {
        const span = document.createElement('span')
        span.className = 'footer__subtitle-word'
        span.textContent = `${index > 0 ? ' ' : ''}${word.text}`

        if (index < visibleCount) {
          span.classList.add('footer__subtitle-word--visible')
        }

        subtitleText.appendChild(span)
      })
    }

    const resetSubtitleState = () => {
      activeCueIndex = null
      revealedWordCount = 0
      renderDefaultSubtitle()
    }

    const showFinalCue = () => {
      if (!footerCues.length) return

      const lastCue = footerCues[footerCues.length - 1]
      activeCueIndex = footerCues.length - 1
      revealedWordCount = lastCue.words.length
      renderWords(lastCue.words, lastCue.words.length)
      subtitleWrapper?.classList.add('footer__subtitles--visible')
    }

    const updateSubtitles = () => {
      if (!subtitleWrapper || !footerCues.length) {
        renderDefaultSubtitle()
        return
      }

      const current = footerAudio?.currentTime || 0
      const activeIndexNext = findActiveCueIndex(current)

      if (activeIndexNext !== -1) {
        const activeCue = footerCues[activeIndexNext]
        const cueElapsed = current - activeCue.start
        const visibleWords = activeCue.words.filter((word) => cueElapsed >= word.start).length

        if (activeCueIndex !== activeIndexNext) {
          activeCueIndex = activeIndexNext
          revealedWordCount = visibleWords
          renderWords(activeCue.words, visibleWords)
        } else if (visibleWords !== revealedWordCount) {
          revealedWordCount = visibleWords
          renderWords(activeCue.words, visibleWords)
        }

        subtitleWrapper.classList.add('footer__subtitles--visible')
      } else if (footerAudio?.ended) {
        showFinalCue()
      } else {
        resetSubtitleState()
      }
    }

    footerAudio.addEventListener('timeupdate', updateSubtitles)
    footerAudio.addEventListener('seeked', updateSubtitles)
    footerAudio.addEventListener('play', updateSubtitles)
    footerAudio.addEventListener('ended', showFinalCue)

    loadSrtSubtitles(subtitlesUrl).then((cues) => {
      footerCues = cues
      updateSubtitles()
    })

      footerVoice.appendChild(footerAudio)
      if (state.soundEnabled) {
        footerAudio
          .play()
          .then(() => updateSubtitles())
          .catch(() => {})
      }
    }

  const footerButton = card.querySelector<HTMLDivElement>('.footer__button')
  if (footerButton) {
    let isMuted = !state.soundEnabled

    const updateSoundToggle = () => {
      soundToggle.innerHTML = isMuted
        ? `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.4 16L14 14.6L16.6 12L14 9.4L15.4 8L18 10.6L20.6 8L22 9.4L19.4 12L22 14.6L20.6 16L18 13.4L15.4 16ZM3 15L3 9H7L12 4L12 20L7 15H3ZM10 8.85L7.85 11H5L5 13H7.85L10 15.15L10 8.85Z" fill="#E2E2E2"/>
</svg>
`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20.9141L6.08594 15H2L2 9H6.08594L12 3.08594L12 20.9141ZM14 3.22754C14.4922 3.33984 14.9758 3.49145 15.4443 3.68555C16.5361 4.13784 17.5286 4.8001 18.3643 5.63574C19.1999 6.47139 19.8622 7.46386 20.3145 8.55566C20.7667 9.64759 21 10.8181 21 12L20.9893 12.4424C20.9385 13.4732 20.7102 14.4888 20.3145 15.4443C19.8622 16.5361 19.1999 17.5286 18.3643 18.3643C17.5286 19.1999 16.5361 19.8622 15.4443 20.3145C14.9758 20.5085 14.4921 20.6592 14 20.7715L14 18.7061C14.2296 18.6375 14.4565 18.5588 14.6787 18.4668C15.528 18.115 16.3002 17.6002 16.9502 16.9502C17.6002 16.3002 18.115 15.528 18.4668 14.6787C18.8186 13.8294 19 12.9193 19 12C19 11.0807 18.8186 10.1706 18.4668 9.32129C18.115 8.47204 17.6002 7.6998 16.9502 7.0498C16.3002 6.39981 15.528 5.88499 14.6787 5.5332C14.4564 5.44112 14.2297 5.36151 14 5.29297V3.22754ZM14 7.41895C14.5722 7.66881 15.0932 8.02293 15.5352 8.46484C15.9994 8.92914 16.3679 9.48029 16.6191 10.0869C16.8704 10.6935 17 11.3435 17 12C17 12.6565 16.8704 13.3065 16.6191 13.9131C16.3679 14.5197 15.9994 15.0709 15.5352 15.5352C15.0933 15.977 14.5721 16.3302 14 16.5801V14.2305C14.0405 14.1942 14.0826 14.1596 14.1211 14.1211C14.3996 13.8426 14.6207 13.5123 14.7715 13.1484C14.9222 12.7845 15 12.394 15 12C15 11.606 14.9222 11.2155 14.7715 10.8516C14.6207 10.4877 14.3996 10.1574 14.1211 9.87891C14.0824 9.84023 14.0406 9.80499 14 9.76855L14 7.41895ZM6.91406 11H4L4 13H6.91406L10 16.0859L10 7.91406L6.91406 11Z" fill="#D9D9D9"/>
</svg>
`
      soundToggle.setAttribute('aria-pressed', String(!isMuted))
      soundToggle.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук')
      if (footerAudio) {
        footerAudio.muted = isMuted
        if (!isMuted) {
          footerAudio.play().catch(() => {})
        }
      }
    }

    const soundToggle = document.createElement('button')
    soundToggle.type = 'button'
    soundToggle.className = 'button primary icon-button'
    soundToggle.addEventListener('click', () => {
      isMuted = !isMuted
      state.soundEnabled = !isMuted
      saveSoundEnabled(!isMuted)
      updateSoundToggle()
    })

    updateSoundToggle()
    footerButton.replaceChildren(soundToggle)
  }

  card.querySelector<HTMLButtonElement>('[data-action="map"]')?.addEventListener('click', () => {
    state.currentFloor = point.map.floor
    state.screen = 'map'
    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="scan"]')?.addEventListener('click', async () => {
    state.scannerExpectedPointIndex = state.currentPointIndex
    state.scannerOrigin = state.screen

    const permissionGranted = await hasCameraPermission(state.cameraPermissionGranted)

    if (permissionGranted) {
      state.cameraPermissionGranted = true
      saveCameraPermissionGranted()
      state.screen = 'scanner'
    } else {
      state.screen = 'cameraPermission'
    }

    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="route"]')?.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  return card
}
