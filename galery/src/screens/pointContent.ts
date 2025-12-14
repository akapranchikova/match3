import { pointContentConfigs, points } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { saveContentGestureHintCompleted, saveSoundEnabled } from '../storage'
import { loadSrtSubtitles, SubtitleCue, createCueFromText } from '../subtitles'
import { AudioContent, CardsContent, ModelsContent, PointContentSection, VideoContent } from '../types'
import { navigateToNextPoint } from './pointFlow'
import onboardingVoiceVideoWebm from '../assets/speaking-voice.webm'
import onboardingVoiceVideoMov from '../assets/speaking-voice.mov'

const SWIPE_THRESHOLD = 48
const MODEL_GESTURE_CLASS = 'model-gesture-active'

type GestureHintStep = {
  text: string
    icon: string
  direction: 'up' | 'down'
}

let audioAutoplayUnlocked = false

const unlockAudioPlaybackOnce = (root: HTMLElement) => {
    if (audioAutoplayUnlocked) return

    // Берём любое текущее аудио на экране (подойдёт хоть гайд, хоть model audio)
    const audio = root.querySelector('audio') as HTMLAudioElement | null
    if (!audio) {
        audioAutoplayUnlocked = true
        return
    }

    const prevMuted = audio.muted
    audio.muted = true

    const p = audio.play()
    if (p && typeof (p as Promise<void>).then === 'function') {
        ;(p as Promise<void>)
            .then(() => {
                audio.pause()
                audio.currentTime = 0
                audio.muted = prevMuted
                audioAutoplayUnlocked = true
            })
            .catch(() => {
                // не разлочилось — попробуем снова при следующем жесте
                audio.muted = prevMuted
            })
    } else {
        audio.muted = prevMuted
        audioAutoplayUnlocked = true
    }
}

const playWhenReady = (media: HTMLMediaElement) => {
    const tryPlay = () => media.play().catch(() => {})

    if (media.readyState >= 2) {
        tryPlay()
        return
    }

    const onCanPlay = () => {
        media.removeEventListener('canplay', onCanPlay)
        tryPlay()
    }

    media.addEventListener('canplay', onCanPlay)
    try {
        media.load()
    } catch {}
}

const playAudioWithIOSAutoplayHack = (audio: HTMLAudioElement, wantSound: boolean) => {
    // 1) стартуем тихо (так Safari чаще разрешает autoplay)
    const prevMuted = audio.muted
    const prevVolume = audio.volume

    audio.muted = true
    audio.volume = 0

    // 2) пробуем запустить когда готово
    playWhenReady(audio)

    // 3) когда реально "playing" — возвращаем звук (если нужно)
    const restore = () => {
        audio.removeEventListener('playing', restore)
        audio.muted = !wantSound
        audio.volume = wantSound ? prevVolume || 1 : 0
    }

    audio.addEventListener('playing', restore)

    // Fallback: если playing не прилетит (некоторые девайсы), всё равно попробуем вернуть
    window.setTimeout(() => {
        audio.removeEventListener('playing', restore)
        audio.muted = !wantSound
        audio.volume = wantSound ? prevVolume || 1 : 0
    }, 250)
}


const gestureHintSteps: GestureHintStep[] = [
  {
    text: 'Листайте снизу вверх, чтобы перейти к следующему сюжету',
    direction: 'up',
      icon: `<svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.125 13C4.275 11.9333 3.625 10.7583 3.175 9.475C2.725 8.19167 2.5 6.86667 2.5 5.5C2.5 5.05 2.525 4.6 2.575 4.15C2.625 3.7 2.7 3.25 2.8 2.8L1.05 4.55L0 3.5L3.5 0L7 3.5L5.95 4.55L4.325 2.95C4.20833 3.36667 4.125 3.7875 4.075 4.2125C4.025 4.6375 4 5.06667 4 5.5C4 6.66667 4.1875 7.79583 4.5625 8.8875C4.9375 9.97917 5.48333 10.9917 6.2 11.925L5.125 13ZM15.45 19.825C15.0667 19.9583 14.6792 20.0208 14.2875 20.0125C13.8958 20.0042 13.5167 19.9083 13.15 19.725L6.6 16.675L7.05 15.675C7.21667 15.3417 7.45 15.0708 7.75 14.8625C8.05 14.6542 8.38333 14.5333 8.75 14.5L10.45 14.375L7.65 6.7C7.55 6.43333 7.55833 6.17917 7.675 5.9375C7.79167 5.69583 7.98333 5.525 8.25 5.425C8.51667 5.325 8.77083 5.33333 9.0125 5.45C9.25417 5.56667 9.425 5.75833 9.525 6.025L13.225 16.2L10.725 16.375L14 17.9C14.1167 17.95 14.2417 17.9792 14.375 17.9875C14.5083 17.9958 14.6333 17.9833 14.75 17.95L18.675 16.525C19.1917 16.3417 19.5667 15.9958 19.8 15.4875C20.0333 14.9792 20.0583 14.4667 19.875 13.95L18.5 10.2C18.4 9.93333 18.4083 9.67917 18.525 9.4375C18.6417 9.19583 18.8333 9.025 19.1 8.925C19.3667 8.825 19.6208 8.83333 19.8625 8.95C20.1042 9.06667 20.275 9.25833 20.375 9.525L21.75 13.275C22.1333 14.325 22.0958 15.3458 21.6375 16.3375C21.1792 17.3292 20.425 18.0167 19.375 18.4L15.45 19.825ZM13.2 13.2L11.85 9.425C11.75 9.15833 11.7583 8.90417 11.875 8.6625C11.9917 8.42083 12.1833 8.25 12.45 8.15C12.7167 8.05 12.9708 8.05833 13.2125 8.175C13.4542 8.29167 13.625 8.48333 13.725 8.75L15.1 12.5L13.2 13.2ZM16.025 12.175L15 9.35C14.9 9.08333 14.9083 8.82917 15.025 8.5875C15.1417 8.34583 15.3333 8.175 15.6 8.075C15.8667 7.975 16.1208 7.98333 16.3625 8.1C16.6042 8.21667 16.775 8.40833 16.875 8.675L17.9 11.475L16.025 12.175Z" fill="#E2E2E2"/>
          </svg>`
  },
  {
    text: 'Листайте сверху вниз, чтобы вернуться к предыдущему сюжету',
    direction: 'down',
      icon: `<svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.5 13L0 9.5L1.05 8.45L2.8 10.2C2.7 9.75 2.625 9.3 2.575 8.85C2.525 8.4 2.5 7.95 2.5 7.5C2.5 6.13333 2.725 4.80833 3.175 3.525C3.625 2.24167 4.275 1.06667 5.125 0L6.2 1.075C5.48333 2.00833 4.9375 3.02083 4.5625 4.1125C4.1875 5.20417 4 6.33333 4 7.5C4 7.93333 4.025 8.3625 4.075 8.7875C4.125 9.2125 4.20833 9.63333 4.325 10.05L5.95 8.45L7 9.5L3.5 13ZM15.45 18.825C15.0667 18.9583 14.6792 19.0208 14.2875 19.0125C13.8958 19.0042 13.5167 18.9083 13.15 18.725L6.6 15.675L7.05 14.675C7.21667 14.3417 7.45 14.0708 7.75 13.8625C8.05 13.6542 8.38333 13.5333 8.75 13.5L10.45 13.375L7.65 5.7C7.55 5.43333 7.55833 5.17917 7.675 4.9375C7.79167 4.69583 7.98333 4.525 8.25 4.425C8.51667 4.325 8.77083 4.33333 9.0125 4.45C9.25417 4.56667 9.425 4.75833 9.525 5.025L13.225 15.2L10.725 15.375L14 16.9C14.1167 16.95 14.2417 16.9792 14.375 16.9875C14.5083 16.9958 14.6333 16.9833 14.75 16.95L18.675 15.525C19.1917 15.3417 19.5667 14.9958 19.8 14.4875C20.0333 13.9792 20.0583 13.4667 19.875 12.95L18.5 9.2C18.4 8.93333 18.4083 8.67917 18.525 8.4375C18.6417 8.19583 18.8333 8.025 19.1 7.925C19.3667 7.825 19.6208 7.83333 19.8625 7.95C20.1042 8.06667 20.275 8.25833 20.375 8.525L21.75 12.275C22.1333 13.325 22.0958 14.3458 21.6375 15.3375C21.1792 16.3292 20.425 17.0167 19.375 17.4L15.45 18.825ZM13.2 12.2L11.85 8.425C11.75 8.15833 11.7583 7.90417 11.875 7.6625C11.9917 7.42083 12.1833 7.25 12.45 7.15C12.7167 7.05 12.9708 7.05833 13.2125 7.175C13.4542 7.29167 13.625 7.48333 13.725 7.75L15.1 11.5L13.2 12.2ZM16.025 11.175L15 8.35C14.9 8.08333 14.9083 7.82917 15.025 7.5875C15.1417 7.34583 15.3333 7.175 15.6 7.075C15.8667 6.975 16.1208 6.98333 16.3625 7.1C16.6042 7.21667 16.775 7.40833 16.875 7.675L17.9 10.475L16.025 11.175Z" fill="#E2E2E2"/>
</svg>
`
  },
]

const maybeShowGestureHint = (host: HTMLElement): (() => void) | null => {
  if (state.contentGestureHintCompleted) return null

  const overlay = document.createElement('div')
  overlay.className = 'content-gesture-overlay'

  const panel = document.createElement('div')
  panel.className = 'content-gesture-overlay__panel'


  const icon = document.createElement('div')
  icon.className = 'content-gesture-overlay__icon'
  icon.innerHTML = `
    <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.125 13C4.275 11.9333 3.625 10.7583 3.175 9.475C2.725 8.19167 2.5 6.86667 2.5 5.5C2.5 5.05 2.525 4.6 2.575 4.15C2.625 3.7 2.7 3.25 2.8 2.8L1.05 4.55L0 3.5L3.5 0L7 3.5L5.95 4.55L4.325 2.95C4.20833 3.36667 4.125 3.7875 4.075 4.2125C4.025 4.6375 4 5.06667 4 5.5C4 6.66667 4.1875 7.79583 4.5625 8.8875C4.9375 9.97917 5.48333 10.9917 6.2 11.925L5.125 13ZM15.45 19.825C15.0667 19.9583 14.6792 20.0208 14.2875 20.0125C13.8958 20.0042 13.5167 19.9083 13.15 19.725L6.6 16.675L7.05 15.675C7.21667 15.3417 7.45 15.0708 7.75 14.8625C8.05 14.6542 8.38333 14.5333 8.75 14.5L10.45 14.375L7.65 6.7C7.55 6.43333 7.55833 6.17917 7.675 5.9375C7.79167 5.69583 7.98333 5.525 8.25 5.425C8.51667 5.325 8.77083 5.33333 9.0125 5.45C9.25417 5.56667 9.425 5.75833 9.525 6.025L13.225 16.2L10.725 16.375L14 17.9C14.1167 17.95 14.2417 17.9792 14.375 17.9875C14.5083 17.9958 14.6333 17.9833 14.75 17.95L18.675 16.525C19.1917 16.3417 19.5667 15.9958 19.8 15.4875C20.0333 14.9792 20.0583 14.4667 19.875 13.95L18.5 10.2C18.4 9.93333 18.4083 9.67917 18.525 9.4375C18.6417 9.19583 18.8333 9.025 19.1 8.925C19.3667 8.825 19.6208 8.83333 19.8625 8.95C20.1042 9.06667 20.275 9.25833 20.375 9.525L21.75 13.275C22.1333 14.325 22.0958 15.3458 21.6375 16.3375C21.1792 17.3292 20.425 18.0167 19.375 18.4L15.45 19.825ZM13.2 13.2L11.85 9.425C11.75 9.15833 11.7583 8.90417 11.875 8.6625C11.9917 8.42083 12.1833 8.25 12.45 8.15C12.7167 8.05 12.9708 8.05833 13.2125 8.175C13.4542 8.29167 13.625 8.48333 13.725 8.75L15.1 12.5L13.2 13.2ZM16.025 12.175L15 9.35C14.9 9.08333 14.9083 8.82917 15.025 8.5875C15.1417 8.34583 15.3333 8.175 15.6 8.075C15.8667 7.975 16.1208 7.98333 16.3625 8.1C16.6042 8.21667 16.775 8.40833 16.875 8.675L17.9 11.475L16.025 12.175Z" fill="#E2E2E2"/>
</svg>

  `

  const text = document.createElement('p')
  text.className = 'content-gesture-overlay__text'

  panel.appendChild(icon)
  panel.appendChild(text)
  overlay.appendChild(panel)
  host.appendChild(overlay)

  let stepTimerId: number | null = null
  let dismissTimerId: number | null = null
  let isDismissed = false

  const applyStep = (stepIndex: number) => {
    const step = gestureHintSteps[Math.min(stepIndex, gestureHintSteps.length - 1)]
    text.textContent = step.text
    icon.innerHTML = step.icon
  }

  const cleanupTimers = () => {
    if (stepTimerId !== null) {
      window.clearTimeout(stepTimerId)
      stepTimerId = null
    }

    if (dismissTimerId !== null) {
      window.clearTimeout(dismissTimerId)
      dismissTimerId = null
    }
  }

  const dismissOverlay = () => {
    if (isDismissed) return
    isDismissed = true
    cleanupTimers()
    state.contentGestureHintCompleted = true
    saveContentGestureHintCompleted()
    overlay.classList.add('content-gesture-overlay--hidden')

    const removeOnAnimationEnd = () => overlay.remove()
    overlay.addEventListener('animationend', removeOnAnimationEnd, { once: true })
    // Fallback in case animation events are not supported
    window.setTimeout(removeOnAnimationEnd, 240)
  }

  overlay.addEventListener('click', dismissOverlay)

  applyStep(0)
  stepTimerId = window.setTimeout(() => applyStep(1), 3000)
  dismissTimerId = window.setTimeout(dismissOverlay, 6000)

  return () => {
    cleanupTimers()
    overlay.removeEventListener('click', dismissOverlay)
    overlay.remove()
  }
}

let activeModelGestures = 0

const lockModelGestureScroll = () => {
  activeModelGestures += 1
  document.body.classList.add(MODEL_GESTURE_CLASS)
}

const releaseModelGestureScroll = () => {
  activeModelGestures = Math.max(0, activeModelGestures - 1)
  if (activeModelGestures === 0) {
    document.body.classList.remove(MODEL_GESTURE_CLASS)
  }
}

const renderVideoSection = (section: VideoContent) => {
    const container = document.createElement('div')
    container.className = 'content-panel content-panel--video'

    // Лоадер поверх видео (чтобы не было “черного экрана”)
    const loading = document.createElement('div')
    loading.className = 'content-video__loading'
    loading.innerHTML = `<span class="content-video__spinner" aria-hidden="true"></span>`
    container.appendChild(loading)

    const video = document.createElement('video')
    video.className = 'content-video'
    video.controls = false
    video.playsInline = true
    video.src = section.src
    video.poster = section.poster || ''
    video.muted = true
    video.defaultMuted = true

    // Важно: не грузим “всё видео” для НЕактивных панелей
    video.preload = 'metadata'
    video.setAttribute('preload', 'metadata')

    // Скрываем видео до первого кадра (иначе будет черный фрейм)
    video.classList.add('is-loading')

    const reveal = () => {
        video.classList.remove('is-loading')
        loading.classList.add('is-hidden')
    }
    const showLoading = () => {
        video.classList.add('is-loading')
        loading.classList.remove('is-hidden')
    }

    // loadeddata/canplay = первый кадр готов
    video.addEventListener('loadeddata', reveal, { once: true })
    video.addEventListener('canplay', reveal, { once: true })

    // waiting/stalled = сеть/декодер не успевает — показываем лоадер
    video.addEventListener('waiting', showLoading)
    video.addEventListener('stalled', showLoading)

    container.appendChild(video)

    if (section.audio) {
        const audio = document.createElement('audio')
        audio.className = 'content-video__audio'
        audio.controls = false
        audio.preload = 'metadata'
        audio.src = section.audio

        if (section.subtitlesUrl) {
            const track = document.createElement('track')
            track.kind = 'subtitles'
            track.src = section.subtitlesUrl
            track.default = true
            audio.appendChild(track)
        }

        container.appendChild(audio)
    }

    return container
}

const warmupMediaInPanel = (panel?: HTMLElement | null) => {
    if (!panel) return

    const videos = Array.from(panel.querySelectorAll('video')) as HTMLVideoElement[]
    const audios = Array.from(panel.querySelectorAll('audio')) as HTMLAudioElement[]

    videos.forEach((v) => {
        try {
            v.preload = 'metadata'
            if (v.readyState === 0) v.load()
        } catch {}
    })

    audios.forEach((a) => {
        try {
            a.preload = 'metadata'
            if (a.readyState === 0) a.load()
        } catch {}
    })
}

const renderCardsSection = (section: CardsContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--cards'

  const viewport = document.createElement('div')
  viewport.className = 'content-cards content-cards--stacked'

  const track = document.createElement('div')
  track.className = 'content-cards__track'

  section.cards.forEach((card) => {
    const cardEl = document.createElement('article')
    cardEl.className = 'content-card'
    cardEl.innerHTML = `
      <div class="content-card__image-wrapper">
        <img class="content-card__image" src="${card.image}" alt="${card.alt || card.title}">
      </div>
       <div class="content-card__body">
        <h3 class="content-card__title">${card.title}</h3>
        <p class="content-card__text">${card.text}</p>
      </div>
    `
    track.appendChild(cardEl)
  })

  let activeIndex = 0
  let startX = 0
  let isTouching = false

  const controls = document.createElement('div')
  controls.className = 'content-cards__controls'

  const prev = document.createElement('button')
  prev.className = 'content-cards__nav content-cards__nav--prev'
  prev.setAttribute('aria-label', 'Предыдущая карточка')
  prev.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11L20 11V13L7.825 13Z" fill="#E2E2E2"/>
    </svg>
  `

  const next = document.createElement('button')
  next.className = 'content-cards__nav content-cards__nav--next'
  next.setAttribute('aria-label', 'Следующая карточка')
  next.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11L20 11V13L7.825 13Z" fill="#E2E2E2"/>
    </svg>
  `

  const dots = document.createElement('div')
  dots.className = 'content-cards__dots'

  const stackStyles = [
    {
      translateY: 0,
      scale: 1,
      opacity: 1,
      rotate: 0,
      shadow: '0px 18px 48px rgba(0, 0, 0, 0.35)',
      blur: 0,
    },
    {
      translateY: 0,
      translateX: -25,
      scale: 0.97,
      opacity: 0.92,
      rotate: -7,
      shadow: '0px 12px 32px rgba(0, 0, 0, 0.26)',
      blur: 1.5,
    },
    {
      translateY: 0,
      translateX: 25,
      scale: 0.94,
      opacity: 0.84,
      rotate: 7,
      shadow: '0px 10px 24px rgba(0, 0, 0, 0.22)',
      blur: 3,
    },
    {
      translateY: 46,
      scale: 0.9,
      opacity: 0.78,
      rotate: -0.85,
      shadow: '0px 6px 16px rgba(0, 0, 0, 0.18)',
      blur: 4,
    },
  ]

  const applyStack = () => {
    const total = section.cards.length
    const cards = Array.from(track.children) as HTMLElement[]

    cards.forEach((card, index) => {
      const relativePosition = (index - activeIndex + total) % total
      const style = stackStyles[relativePosition]

      card.classList.toggle('is-active', relativePosition === 0)
      card.classList.toggle('is-hidden', relativePosition >= stackStyles.length)

      if (style) {
        card.style.setProperty('--stack-translate', `${style.translateY}px`)
        card.style.setProperty('--drag-translate', `${style.translateX}px`)
        card.style.setProperty('--stack-scale', `${style.scale}`)
        card.style.setProperty('--stack-rotate', `${style.rotate}deg`)
        card.style.setProperty('--stack-shadow', style.shadow)
        card.style.setProperty('--stack-blur', `${style.blur || 0}px`)
        card.style.opacity = `${style.opacity}`
        card.style.zIndex = String(stackStyles.length - relativePosition)
      } else {
        card.style.setProperty('--stack-translate', '32px')
        card.style.setProperty('--stack-scale', '0.9')
        card.style.setProperty('--stack-rotate', '0deg')
        card.style.setProperty('--stack-shadow', 'none')
        card.style.setProperty('--stack-blur', '0px')
        card.style.opacity = '0'
        card.style.zIndex = '0'
      }
    })

    Array.from(dots.children).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex)
    })
  }

  const goToIndex = (index: number) => {
    activeIndex = (index + section.cards.length) % section.cards.length
    applyStack()
  }

  const goPrev = () => goToIndex(activeIndex - 1)
  const goNext = () => goToIndex(activeIndex + 1)

  section.cards.forEach((_, index) => {
    const dot = document.createElement('span')
    dot.className = 'content-cards__dot'
    dots.appendChild(dot)
    dot.addEventListener('click', () => {
      goToIndex(index)
    })
  })

  prev.addEventListener('click', goPrev)
  next.addEventListener('click', goNext)

  const getActiveCard = () => track.children[activeIndex] as HTMLElement | undefined

  const animateSwipeAway = (direction: 'next' | 'prev') => {
    const activeCard = getActiveCard()
    const translateSign = direction === 'next' ? -1 : 1

    if (!activeCard) {
      direction === 'next' ? goNext() : goPrev()
      return
    }

    activeCard.style.transition = 'transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease'
    activeCard.style.setProperty('--drag-translate', `${translateSign * 420}px`)
    activeCard.style.setProperty('--drag-rotate', `${translateSign * 16}deg`)
    activeCard.style.opacity = '0'
    activeCard.style.filter = 'blur(3px)'

    window.setTimeout(() => {
      direction === 'next' ? goNext() : goPrev()

      activeCard.style.transition = ''
      activeCard.style.setProperty('--drag-translate', '0px')
      activeCard.style.setProperty('--drag-rotate', '0deg')
      activeCard.style.opacity = ''
      activeCard.style.filter = ''
    }, 220)
  }

  const onTouchStart = (event: TouchEvent) => {
    startX = event.touches[0].clientX
    isTouching = true

    const activeCard = getActiveCard()
    if (activeCard) {
      activeCard.style.transition = 'none'
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    if (!isTouching) return

    const dragDeltaX = event.touches[0].clientX - startX
    const activeCard = getActiveCard()
    if (!activeCard) return

    activeCard.style.setProperty('--drag-translate', `${dragDeltaX}px`)
    const rotateDelta = Math.max(-12, Math.min(12, dragDeltaX / 14))
    activeCard.style.setProperty('--drag-rotate', `${rotateDelta}deg`)
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (!isTouching) return
    const deltaX = event.changedTouches[0].clientX - startX
    isTouching = false

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      const activeCard = getActiveCard()
      if (activeCard) {
        activeCard.style.transition = ''
        activeCard.style.setProperty('--drag-translate', '0px')
        activeCard.style.setProperty('--drag-rotate', '0deg')
      }
      applyStack()
      return
    }

    if (deltaX < -SWIPE_THRESHOLD) {
      animateSwipeAway('next')
    } else if (deltaX > SWIPE_THRESHOLD) {
      animateSwipeAway('prev')
    }
  }

  viewport.addEventListener('touchstart', onTouchStart)
  viewport.addEventListener('touchmove', onTouchMove)
  viewport.addEventListener('touchend', onTouchEnd)

  applyStack()

  controls.appendChild(prev)
  controls.appendChild(next)

  viewport.appendChild(track)
  viewport.appendChild(controls)

  container.appendChild(viewport)
  container.appendChild(dots)

  return container
}

type ModelChangeDetail = {
  audio: HTMLAudioElement | null
  subtitles?: string[]
  subtitlesUrl?: string
}

const renderModelsSection = (section: ModelsContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--models'


  if (section.hint) {
    const hint = document.createElement('div')
    hint.className = 'content-models__hint'
    hint.innerHTML = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.466 7.5C15.643 4.237 13.952 2 12 2C9.239 2 7 6.477 7 12C7 17.523 9.239 22 12 22C12.3427 21.9987 12.676 21.932 13 21.8M15.194 13.707L19.008 15.567L17.148 19.381" stroke="#E2E2E2" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M19 15.57C17.196 16.455 14.726 17 12 17C6.477 17 2 14.761 2 12C2 9.239 6.477 7 12 7C16.838 7 20.873 8.718 21.8 11" stroke="#E2E2E2" stroke-width="1.5" stroke-linejoin="round"/>
</svg>

<span>${section.hint}</span>`
    container.appendChild(hint)
  }

  const viewport = document.createElement('div')
  viewport.className = 'content-models'

  const track = document.createElement('div')
  track.className = 'content-models__track'

  const controls = document.createElement('div')
  controls.className = 'content-models__controls'

  const prev = document.createElement('button')
  prev.className = 'content-cards__nav content-cards__nav--prev'
  prev.setAttribute('aria-label', 'Предыдущая модель')
  prev.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11L20 11V13L7.825 13Z" fill="#E2E2E2"/>
    </svg>
  `

  const next = document.createElement('button')
  next.className = 'content-cards__nav content-cards__nav--next'
  next.setAttribute('aria-label', 'Следующая модель')
  next.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11L20 11V13L7.825 13Z" fill="#E2E2E2"/>
    </svg>
  `

  const dots = document.createElement('div')
  dots.className = 'content-cards__dots content-models__dots'

  let activeIndex = 0
  const modelCards: { card: HTMLElement; audio: HTMLAudioElement | null }[] = []

  const dispatchActiveModelChange = () => {
    const activeModel = section.models[activeIndex]
    const activeAudio = modelCards[activeIndex]?.audio ?? null

    container.dispatchEvent(
      new CustomEvent<ModelChangeDetail>('modelchange', {
        detail: {
          audio: activeAudio,
          subtitles: activeModel?.subtitles,
          subtitlesUrl: activeModel?.subtitlesUrl,
        },
      }),
    )
  }

  container.addEventListener('request-modelstate', () => {
    dispatchActiveModelChange()
  })

  const updateActive = () => {
    const cards = Array.from(track.children) as HTMLElement[]
    cards.forEach((card, index) => {
      const isActive = index === activeIndex
      card.classList.toggle('is-active', isActive)
      card.classList.toggle('is-hidden', !isActive)
    })

    Array.from(dots.children).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex)
    })

    modelCards.forEach(({ card, audio }) => {
      if (!audio) return
      const isCardActive = card.classList.contains('is-active')

      if (!isCardActive) {
        audio.pause()
        audio.currentTime = 0
      }
    })

    const activeModelAudio = modelCards.find(({ card }) => card.classList.contains('is-active'))?.audio
    const isPanelActive = container.closest('.content-stack__item')?.classList.contains('is-active')

    if (activeModelAudio && isPanelActive) {
        // тут нет доступа к isMuted из родителя, поэтому считаем:
        // если пользователь потом включит звук — setMuted() всё синхронизирует
        playAudioWithIOSAutoplayHack(activeModelAudio, true)
    }

    dispatchActiveModelChange()
  }

  const goToIndex = (index: number) => {
    activeIndex = (index + section.models.length) % section.models.length
    updateActive()
  }

  const goPrev = () => goToIndex(activeIndex - 1)
  const goNext = () => goToIndex(activeIndex + 1)

  section.models.forEach((model) => {
    const card = document.createElement('article')
    card.className = 'content-model'

    const viewer = document.createElement('model-viewer') as HTMLElement
    viewer.className = 'content-model__viewer'
    viewer.setAttribute('src', model.src)
    viewer.setAttribute('camera-controls', '')
    viewer.setAttribute('interaction-prompt', 'none')
    viewer.setAttribute('disable-zoom', '')
    viewer.setAttribute('shadow-intensity', '0.65')
    viewer.setAttribute('alt', model.alt || model.title)
    viewer.style.touchAction = 'none'

    let activeTouches = 0

    const lockIfFirstTouch = () => {
      if (activeTouches === 0) {
        lockModelGestureScroll()
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      lockIfFirstTouch()
      activeTouches = event.touches.length

      if (event.cancelable) {
        event.preventDefault()
      }

      event.stopPropagation()
    }

    const onTouchMove = (event: TouchEvent) => {
      if (event.cancelable) {
        event.preventDefault()
      }

      event.stopPropagation()
    }

    const onTouchEnd = (event: TouchEvent) => {
      activeTouches = event.touches.length

      if (activeTouches === 0) {
        releaseModelGestureScroll()
      }

      event.stopPropagation()
    }

    viewer.addEventListener('touchstart', onTouchStart, { passive: false })
    viewer.addEventListener('touchmove', onTouchMove, { passive: false })
    viewer.addEventListener('touchend', onTouchEnd)
    viewer.addEventListener('touchcancel', onTouchEnd)

    const info = document.createElement('div')
    info.className = 'content-model__info'
    info.innerHTML = `
      <h3 class="content-model__title">${model.title}</h3>
    `

    if (model.audio) {
      const audio = document.createElement('audio')
      audio.className = 'guide__audio guide__audio--inline content-model__audio'
      audio.controls = false
      audio.preload = 'auto'
      audio.src = model.audio
      audio.hidden = true
      audio.setAttribute('aria-hidden', 'true')

      if (model.subtitlesUrl) {
        const track = document.createElement('track')
        track.kind = 'subtitles'
        track.src = model.subtitlesUrl
        track.default = true
        audio.appendChild(track)
      }

      info.appendChild(audio)
      modelCards.push({ card, audio })
    } else {
      modelCards.push({ card, audio: null })
    }

    card.appendChild(viewer)
    card.appendChild(info)
    track.appendChild(card)
  })

  section.models.forEach((_, index) => {
    const dot = document.createElement('span')
    dot.className = 'content-cards__dot'
    dots.appendChild(dot)
    dot.addEventListener('click', () => goToIndex(index))
  })

  prev.addEventListener('click', goPrev)
  next.addEventListener('click', goNext)

  controls.appendChild(prev)
  controls.appendChild(next)

  viewport.appendChild(track)
  viewport.appendChild(controls)

  container.appendChild(viewport)

  if (section.description) {
    const description = document.createElement('p')
    description.className = 'content-models__description'
    description.textContent = section.description
    container.appendChild(description)
  }

  container.appendChild(dots)

  updateActive()

  return container
}

const renderAudioSection = (section: AudioContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--guide card--guide'

  if (section.backgroundOverlay) {
    const backgroundOverlay = document.createElement('div')
    backgroundOverlay.className = 'guide__background-logo'
    backgroundOverlay.style.backgroundImage = `url(${section.backgroundOverlay})`
    container.appendChild(backgroundOverlay)
  }

  const content = document.createElement('div')
  content.className = 'guide__content'

  if (section.logo) {
    const logo = document.createElement('img')
    logo.className = 'guide__logo'
    logo.src = section.logo
    logo.alt = 'Логотип галереи'
    content.appendChild(logo)
  }

  const hero = document.createElement('div')
  hero.className = 'guide__hero'

    const hero2 = document.createElement('div')
    hero2.className = 'guide__wrap-video'

    const voiceVideo = document.createElement('video')
    voiceVideo.className = 'guide__hero-image'
    voiceVideo.muted = true
    voiceVideo.defaultMuted = true
    voiceVideo.loop = true
    voiceVideo.playsInline = true
    voiceVideo.autoplay = false
    voiceVideo.preload = 'metadata'
    voiceVideo.setAttribute('playsinline', '')
    voiceVideo.setAttribute('muted', '')
    voiceVideo.setAttribute('aria-hidden', 'true')

    const srcWebm = document.createElement('source')
    srcWebm.src = onboardingVoiceVideoWebm
    srcWebm.type = 'video/webm; codecs="vp9"'

    const srcMov = document.createElement('source')
    srcMov.src = onboardingVoiceVideoMov
    srcMov.type = 'video/quicktime'

    voiceVideo.appendChild(srcMov)
    voiceVideo.appendChild(srcWebm)

    hero2.appendChild(voiceVideo)
    hero.appendChild(hero2)
    content.appendChild(hero)

    const startVoiceVideo = () => {
        voiceVideo?.play().catch(() => {})
    }

    const stopVoiceVideo = () => {
        if (!voiceVideo) return
        voiceVideo.pause()
        try { voiceVideo.currentTime = 0 } catch {}
    }


    const audio = document.createElement('audio')
  audio.className = 'guide__audio'
  audio.controls = false
  audio.preload = 'auto'
  audio.src = section.src

  content.appendChild(hero)
  content.appendChild(audio)

  container.appendChild(content)

  return container
}

const renderSection = (section: PointContentSection) => {
  if (section.type === 'video') return renderVideoSection(section)
  if (section.type === 'cards') return renderCardsSection(section)
  if (section.type === 'models') return renderModelsSection(section)
  return renderAudioSection(section)
}

export const renderPointContent = () => {
  const point = points[state.currentPointIndex]
  const config = pointContentConfigs[point.id] || pointContentConfigs.history
  state.currentContentIndex = Math.min(state.currentContentIndex, config.sections.length - 1)
  const currentSection = config.sections[state.currentContentIndex]
  const isFinalPoint = point.id === 'final'
  const container = document.createElement('section')
  container.className = isFinalPoint ? 'card card--guide' : 'card card--content'


    const contentPositionLabel = `Сюжет ${state.currentContentIndex + 1} из ${config.sections.length}`

  const header = document.createElement('header')
  header.className = 'content-header'
  header.innerHTML = `
    <p class="content-header__eyebrow">${contentPositionLabel}</p>
    <h1 class="content-header__title">${currentSection?.heading || config.heading}</h1>
  `

  if (state.routeMode === 'solo') {
    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.className = 'content-header__close'
    closeButton.setAttribute('aria-label', 'Закрыть контент и вернуться к маршруту')
    closeButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#E2E2E2"/>
      </svg>
    `
    closeButton.addEventListener('click', () => {
      state.screen = 'routeList'
      state.currentContentIndex = 0
      rerender()
    })

    header.appendChild(closeButton)
  }

  const slider = document.createElement('div')
  slider.className = 'content-slider'

  const stack = document.createElement('div')
  stack.className = 'content-stack'

  const cleanupCallbacks: (() => void)[] = []

  const mediaElements: HTMLMediaElement[] = []
  let isMuted = true
  let autoplayTimeoutId: number | undefined
  let soundToggle: HTMLButtonElement | null = null

  const clearAutoplay = () => {
    if (autoplayTimeoutId !== undefined) {
      window.clearTimeout(autoplayTimeoutId)
      autoplayTimeoutId = undefined
    }
  }

  const updateSoundToggle = () => {
    if (!soundToggle) return
    soundToggle.innerHTML = isMuted ? `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.4 16L14 14.6L16.6 12L14 9.4L15.4 8L18 10.6L20.6 8L22 9.4L19.4 12L22 14.6L20.6 16L18 13.4L15.4 16ZM3 15L3 9H7L12 4L12 20L7 15H3ZM10 8.85L7.85 11H5L5 13H7.85L10 15.15L10 8.85Z" fill="#E2E2E2"/>
</svg>
` : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 20.9141L6.08594 15H2L2 9H6.08594L12 3.08594L12 20.9141ZM14 3.22754C14.4922 3.33984 14.9758 3.49145 15.4443 3.68555C16.5361 4.13784 17.5286 4.8001 18.3643 5.63574C19.1999 6.47139 19.8622 7.46386 20.3145 8.55566C20.7667 9.64759 21 10.8181 21 12L20.9893 12.4424C20.9385 13.4732 20.7102 14.4888 20.3145 15.4443C19.8622 16.5361 19.1999 17.5286 18.3643 18.3643C17.5286 19.1999 16.5361 19.8622 15.4443 20.3145C14.9758 20.5085 14.4921 20.6592 14 20.7715L14 18.7061C14.2296 18.6375 14.4565 18.5588 14.6787 18.4668C15.528 18.115 16.3002 17.6002 16.9502 16.9502C17.6002 16.3002 18.115 15.528 18.4668 14.6787C18.8186 13.8294 19 12.9193 19 12C19 11.0807 18.8186 10.1706 18.4668 9.32129C18.115 8.47204 17.6002 7.6998 16.9502 7.0498C16.3002 6.39981 15.528 5.88499 14.6787 5.5332C14.4564 5.44112 14.2297 5.36151 14 5.29297V3.22754ZM14 7.41895C14.5722 7.66881 15.0932 8.02293 15.5352 8.46484C15.9994 8.92914 16.3679 9.48029 16.6191 10.0869C16.8704 10.6935 17 11.3435 17 12C17 12.6565 16.8704 13.3065 16.6191 13.9131C16.3679 14.5197 15.9994 15.0709 15.5352 15.5352C15.0933 15.977 14.5721 16.3302 14 16.5801V14.2305C14.0405 14.1942 14.0826 14.1596 14.1211 14.1211C14.3996 13.8426 14.6207 13.5123 14.7715 13.1484C14.9222 12.7845 15 12.394 15 12C15 11.606 14.9222 11.2155 14.7715 10.8516C14.6207 10.4877 14.3996 10.1574 14.1211 9.87891C14.0824 9.84023 14.0406 9.80499 14 9.76855L14 7.41895ZM6.91406 11H4L4 13H6.91406L10 16.0859L10 7.91406L6.91406 11Z" fill="#D9D9D9"/>
</svg>
`
    soundToggle.setAttribute('aria-pressed', String(!isMuted))
  }

  const setMuted = (muted: boolean) => {
    isMuted = muted
    state.soundEnabled = !muted
    saveSoundEnabled(!muted)
    mediaElements.forEach((media) => {
      if (media instanceof HTMLVideoElement) {
        media.muted = true
        media.defaultMuted = true
        return
      }

      media.muted = muted
    })
    updateSoundToggle()
    syncMediaState()
  }

  const syncMediaState = () => {
    clearAutoplay()
    const activePanel = stack.children[state.currentContentIndex] as HTMLElement | undefined
    const isModelPanel = activePanel?.classList.contains('content-panel--models')

    mediaElements.forEach((media) => {
        const isWithinActivePanel = !!activePanel?.contains(media)
        const activeModelCard = media.closest('.content-model')
        const isActive =
            isWithinActivePanel && (!isModelPanel || activeModelCard?.classList.contains('is-active'))

        if (media instanceof HTMLVideoElement) {
            media.muted = true
            media.defaultMuted = true
            media.preload = isActive ? 'auto' : 'metadata'
        } else {
            media.muted = isMuted
            media.preload = isActive ? 'auto' : 'metadata'
        }

        if (!isActive) {
            media.pause()
            // ✅ чтобы при “скачках” всегда стартовало заново
            if (media instanceof HTMLAudioElement) {
                try {
                    media.currentTime = 0
                } catch {}
            }
        }
    })

    const activeVideo = activePanel?.querySelector('video') as HTMLVideoElement | null
    const activeAudio = (isModelPanel
      ? activePanel?.querySelector('.content-model.is-active audio')
      : activePanel?.querySelector('audio')) as HTMLAudioElement | null

    if (activeVideo) {
      autoplayTimeoutId = window.setTimeout(() => {
        activeVideo.play().catch(() => {})
          // поменять, если хотим задержу
      }, 1)
    }

      if (activeAudio) {
          // wantSound = true, если пользователь включил звук
          playAudioWithIOSAutoplayHack(activeAudio, !isMuted)
      }
  }

  const updateActive = () => {
    Array.from(stack.children).forEach((child, index) => {
      const isActive = index === state.currentContentIndex
      child.classList.toggle('is-active', isActive)
      child.toggleAttribute('hidden', !isActive)
    })
    Array.from(slider.querySelectorAll('[data-dot]')).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === state.currentContentIndex)
    })

      warmupMediaInPanel(stack.children[state.currentContentIndex + 1] as HTMLElement | undefined)

      syncMediaState()
  }
    const clampIndex = (i: number) => Math.max(0, Math.min(i, config.sections.length - 1))

    let setSubtitleSourceFn: ((source: ModelChangeDetail) => void) | null = null
    let disableSubtitlesFn: (() => void) | null = null

    const syncSubtitlesForActivePanel = () => {
        if (!setSubtitleSourceFn) return

        const activePanel = stack.children[state.currentContentIndex] as HTMLElement | undefined
        const activeSection = config.sections[state.currentContentIndex]
        if (!activePanel || !activeSection) return

        // ✅ если на этом сюжете субтитров нет — полностью выключаем отображение
        const hasSubs =
            (activeSection.type === 'models' && activeSection.models.some((m) => !!m.subtitlesUrl || (m.subtitles?.length ?? 0) > 0)) ||
            (!!activeSection.subtitlesUrl || (activeSection.subtitles?.length ?? 0) > 0)

        if (!hasSubs) {
            disableSubtitlesFn?.()
            return
        }

        if (activeSection.type === 'models') {
            const firstModel = activeSection.models[0]
            setSubtitleSourceFn({
                audio: (activePanel.querySelector('.content-model audio') as HTMLAudioElement | null) ?? null,
                subtitles: firstModel?.subtitles,
                subtitlesUrl: firstModel?.subtitlesUrl,
            })
            activePanel.dispatchEvent(new Event('request-modelstate'))
            return
        }

        setSubtitleSourceFn({
            audio: (activePanel.querySelector('audio') as HTMLAudioElement | null) ?? null,
            subtitles: activeSection.subtitles,
            subtitlesUrl: activeSection.subtitlesUrl,
        })
    }


    const updateHeaderForIndex = (index: number) => {
        const section = config.sections[index]
        const eyebrow = header.querySelector('.content-header__eyebrow')
        const title = header.querySelector('.content-header__title')

        if (eyebrow) eyebrow.textContent = `Сюжет ${index + 1} из ${config.sections.length}`
        if (title) title.textContent = section?.heading || config.heading
    }

    const goToContentIndex = (nextIndex: number) => {
        state.currentContentIndex = clampIndex(nextIndex)
        updateHeaderForIndex(state.currentContentIndex)
        updateActive()
        renderHint()
        syncSubtitlesForActivePanel()
    }


    config.sections.forEach((section, index) => {
    const panel = renderSection(section)
    panel.classList.add('content-stack__item')
    const panelAudios = Array.from(panel.querySelectorAll('audio'))
    mediaElements.push(...Array.from(panel.querySelectorAll('video, audio')))

    panelAudios.forEach((audioElement) => {
      const handleAudioEnd = () => {
        const isActive = stack.children[state.currentContentIndex]?.contains(audioElement)

        if (!isActive || state.currentContentIndex >= config.sections.length - 1) return

          goToContentIndex(state.currentContentIndex + 1)
      }

      audioElement.addEventListener('ended', handleAudioEnd)
      cleanupCallbacks.push(() => audioElement.removeEventListener('ended', handleAudioEnd))
    })
    stack.appendChild(panel)
  })

    const hint = document.createElement('div')
    hint.className = 'content-hint'

// Рендерим нижний hint в зависимости от текущего индекса
    const renderHint = () => {
        hint.replaceChildren()
        hint.classList.remove('content-hint--final')

        // создаём кнопку звука заново (проще, чем переносить DOM-узел)
        soundToggle = document.createElement('button')
        soundToggle.type = 'button'
        soundToggle.className = 'button primary icon-button'
        soundToggle.addEventListener('click', () => setMuted(!isMuted))

        const isLast = state.currentContentIndex >= config.sections.length - 1

        if (isLast) {
            hint.classList.add('content-hint--final')
            soundToggle.classList.add('content-hint__sound')

            const finishButton = document.createElement('button')
            finishButton.type = 'button'
            finishButton.className = 'button primary content-hint__finish'
            finishButton.textContent = 'Завершить точку'
            finishButton.addEventListener('click', () => {
                navigateToNextPoint()
                rerender()
            })

            hint.appendChild(finishButton)
            hint.appendChild(soundToggle)
        } else {
            const hintIcon = document.createElement('span')
            hintIcon.className = 'content-hint__icon'
            hintIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.125 14C5.275 12.9333 4.625 11.7583 4.175 10.475C3.725 9.19167 3.5 7.86667 3.5 6.5C3.5 6.05 3.525 5.6 3.575 5.15C3.625 4.7 3.7 4.25 3.8 3.8L2.05 5.55L1 4.5L4.5 1L8 4.5L6.95 5.55L5.325 3.95C5.20833 4.36667 5.125 4.7875 5.075 5.2125C5.025 5.6375 5 6.06667 5 6.5C5 7.66667 5.1875 8.79583 5.5625 9.8875C5.9375 10.9792 6.48333 11.9917 7.2 12.925L6.125 14ZM16.45 20.825C16.0667 20.9583 15.6792 21.0208 15.2875 21.0125C14.8958 21.0042 14.5167 20.9083 14.15 20.725L7.6 17.675L8.05 16.675C8.21667 16.3417 8.45 16.0708 8.75 15.8625C9.05 15.6542 9.38333 15.5333 9.75 15.5L11.45 15.375L8.65 7.7C8.55 7.43333 8.55833 7.17917 8.675 6.9375C8.79167 6.69583 8.98333 6.525 9.25 6.425C9.51667 6.325 9.77083 6.33333 10.0125 6.45C10.2542 6.56667 10.425 6.75833 10.525 7.025L14.225 17.2L11.725 17.375L15 18.9C15.1167 18.95 15.2417 18.9792 15.375 18.9875C15.5083 18.9958 15.6333 18.9833 15.75 18.95L19.675 17.525C20.1917 17.3417 20.5667 16.9958 20.8 16.4875C21.0333 15.9792 21.0583 15.4667 20.875 14.95L19.5 11.2C19.4 10.9333 19.4083 10.6792 19.525 10.4375C19.6417 10.1958 19.8333 10.025 20.1 9.925C20.3667 9.825 20.6208 9.83333 20.8625 9.95C21.1042 10.0667 21.275 10.2583 21.375 10.525L22.75 14.275C23.1333 15.325 23.0958 16.3458 22.6375 17.3375C22.1792 18.3292 21.425 19.0167 20.375 19.4L16.45 20.825ZM14.2 14.2L12.85 10.425C12.75 10.1583 12.7583 9.90417 12.875 9.6625C12.9917 9.42083 13.1833 9.25 13.45 9.15C13.7167 9.05 13.9708 9.05833 14.2125 9.175C14.4542 9.29167 14.625 9.48333 14.725 9.75L16.1 13.5L14.2 14.2ZM17.025 13.175L16 10.35C15.9 10.0833 15.9083 9.82917 16.025 9.5875C16.1417 9.34583 16.3333 9.175 16.6 9.075C16.8667 8.975 17.1208 8.9833 17.3625 9.1C17.6042 9.2167 17.775 9.4083 17.875 9.675L18.9 12.475L17.025 13.175Z" fill="#E2E2E2"/>
      </svg>
    `

            const hintText = document.createElement('div')
            hintText.innerHTML =
                '<p class="content-hint__title">Листайте снизу вверх, чтобы перейти к следующему сюжету</p>'

            const hintActions = document.createElement('div')
            hintActions.className = 'content-hint__actions'
            hintActions.appendChild(soundToggle)

            hint.appendChild(hintIcon)
            hint.appendChild(hintText)
            hint.appendChild(hintActions)
        }

        // синхронизируем иконку mute/unmute на новой кнопке
        updateSoundToggle()
    }


    let startX = 0
  let startY = 0
  let isTouching = false
  let gestureFromModel = false

  const isFromModelViewer = (event: TouchEvent) => {
    const target = event.target as HTMLElement | null
    return !!target?.closest('.content-model__viewer')
  }

  const onTouchStart = (event: TouchEvent) => {
    gestureFromModel = isFromModelViewer(event)
    if (gestureFromModel) return

    startX = event.touches[0].clientX
    startY = event.touches[0].clientY
    isTouching = true
  }

  const onTouchMove = (event: TouchEvent) => {
    if (gestureFromModel || !isTouching) return

    const touch = event.touches[0]
    const deltaY = touch.clientY - startY
    const deltaX = touch.clientX - startX

    if (Math.abs(deltaY) > Math.abs(deltaX) && event.cancelable) {
      event.preventDefault()
    }
  }

    const onTouchEnd = (event: TouchEvent) => {
        if (gestureFromModel) {
            gestureFromModel = false
            return
        }

        if (!isTouching) return

        // ✅ разлочим аудио в момент пользовательского жеста
        unlockAudioPlaybackOnce(container)

        const deltaY = event.changedTouches[0].clientY - startY
        isTouching = false

        if (deltaY < -SWIPE_THRESHOLD && state.currentContentIndex < config.sections.length - 1) {
            goToContentIndex(state.currentContentIndex + 1)
        } else if (deltaY > SWIPE_THRESHOLD && state.currentContentIndex > 0) {
            goToContentIndex(state.currentContentIndex - 1)
        }
    }

  container.addEventListener('touchstart', onTouchStart)
  container.addEventListener('touchmove', onTouchMove, { passive: false })
  container.addEventListener('touchend', onTouchEnd)

  cleanupCallbacks.push(() => {
    container.removeEventListener('touchstart', onTouchStart)
    container.removeEventListener('touchmove', onTouchMove)
    container.removeEventListener('touchend', onTouchEnd)
  })

  cleanupCallbacks.push(clearAutoplay)

  slider.appendChild(stack)

  setMuted(!state.soundEnabled)
    updateHeaderForIndex(state.currentContentIndex)
  updateActive()
    syncSubtitlesForActivePanel()

  if (!isFinalPoint) {
    container.appendChild(header)
  }
  container.appendChild(slider)

  const hasModelSubtitles =
    currentSection.type === 'models' && currentSection.models.some((model) => model.subtitles?.length)
    const hasAnySubtitles = config.sections.some((s) =>
        (s.type === 'models' && s.models.some((m) => !!m.subtitlesUrl || (m.subtitles?.length ?? 0) > 0)) ||
        (!!(s as any).subtitlesUrl || ((s as any).subtitles?.length ?? 0) > 0)
    )


    if (hasAnySubtitles) {
    const subtitleLayout = document.createElement('div')
    subtitleLayout.className = 'content-subtitles content-subtitles--voice'

      const voiceVideo = document.createElement('video')
      voiceVideo.className = 'content-subtitles__image content-subtitles__video'
      voiceVideo.muted = true
      voiceVideo.loop = true
      voiceVideo.playsInline = true
      voiceVideo.autoplay = false
      voiceVideo.preload = 'metadata'
      voiceVideo.setAttribute('playsinline', '')
      voiceVideo.setAttribute('muted', '')
      voiceVideo.setAttribute('aria-hidden', 'true')

      const srcWebm = document.createElement('source')
      srcWebm.src = onboardingVoiceVideoWebm
      srcWebm.type = 'video/webm; codecs="vp9"'

      const srcMov = document.createElement('source')
      srcMov.src = onboardingVoiceVideoMov
      srcMov.type = 'video/quicktime'

      voiceVideo.appendChild(srcWebm)
      voiceVideo.appendChild(srcMov)

      subtitleLayout.appendChild(voiceVideo)

    const subtitleText = document.createElement('div')
    subtitleText.className = 'content-subtitles__text'


    subtitleLayout.appendChild(subtitleText)
    container.appendChild(subtitleLayout)

      const setSubtitlesVisible = (visible: boolean) => {
          subtitleLayout.style.display = visible ? '' : 'none'
      }

      const startSubtitleVideo = () => {
          // iOS: autoplay видео (muted + playsInline) обычно проходит
          voiceVideo.play().catch(() => {})
      }

      const stopSubtitleVideo = () => {
          voiceVideo.pause()
          voiceVideo.currentTime = 0
      }

// по умолчанию показываем только если реально есть сабы у текущего сюжета
      setSubtitlesVisible(true)

    const activePanel = stack.children[state.currentContentIndex] as HTMLElement | undefined
    const initialModel = currentSection.type === 'models' ? currentSection.models[0] : null
    const initialSubtitleSource: ModelChangeDetail =
      currentSection.type === 'models'
        ? {
            audio: (activePanel?.querySelector('.content-model audio') as HTMLAudioElement | null) ?? null,
            subtitles: initialModel?.subtitles,
            subtitlesUrl: initialModel?.subtitlesUrl,
          }
        : {
            audio: (activePanel?.querySelector('audio') as HTMLAudioElement | null) ?? null,
            subtitles: currentSection.subtitles,
            subtitlesUrl: currentSection.subtitlesUrl,
          }

    const subtitleAnimationClasses = ['subtitle-animate-in', 'subtitle-animate-out'] as const
    const buildFallbackCues = (lines?: string[]) =>
      (lines || []).map((line, index) => createCueFromText(line, index * 3, index * 3 + 2.75))

      let subtitleAudio: HTMLAudioElement | null = null
    let subtitleFallbackCues: SubtitleCue[] = buildFallbackCues(initialSubtitleSource.subtitles)
    let currentSubtitlesUrl = initialSubtitleSource.subtitlesUrl
    let subtitleCues: SubtitleCue[] = []
    let activeCueIndex: number | null = null
    let isSubtitleVisible = false
    let isSubtitleAnimatingOut = false
      let cancelPendingHide: (() => void) | null = null

    const playSubtitleAnimation = (className: (typeof subtitleAnimationClasses)[number]) => {
      subtitleAnimationClasses.forEach((animationClass) => subtitleText.classList.remove(animationClass))

      void subtitleText.offsetWidth
      subtitleText.classList.add(className)
    }

    const animateSubtitleIn = () => {
      isSubtitleAnimatingOut = false
      isSubtitleVisible = true
      playSubtitleAnimation('subtitle-animate-in')
        startSubtitleVideo()
    }

    const animateSubtitleOut = (onFinish?: () => void) => {
        if (isSubtitleAnimatingOut || !isSubtitleVisible) {
            onFinish?.()
            return
        }

        isSubtitleAnimatingOut = true
        playSubtitleAnimation('subtitle-animate-out')

        let cancelled = false
        cancelPendingHide = () => {
            cancelled = true
            cancelPendingHide = null
        }

        const handleAnimationEnd = () => {
            subtitleText.removeEventListener('animationend', handleAnimationEnd)
            if (cancelled) return
            isSubtitleAnimatingOut = false
            cancelPendingHide = null
            onFinish?.()
        }

        subtitleText.addEventListener('animationend', handleAnimationEnd)
    }

    const renderCueLines = (cue: SubtitleCue | null) => {
      subtitleText.replaceChildren()

      if (!cue) return

      cue.text.split(/\r?\n/).forEach((line) => {
        const paragraph = document.createElement('p')
        paragraph.textContent = line
        subtitleText.appendChild(paragraph)
      })
    }

    const clearSubtitleContent = () => {
      subtitleText.replaceChildren()
      isSubtitleVisible = false
      isSubtitleAnimatingOut = false
        stopSubtitleVideo()
    }

    const hideSubtitle = () => {
      if (!subtitleText.childElementCount) {
        clearSubtitleContent()
        return
      }

      animateSubtitleOut(clearSubtitleContent)
    }

    const subtitleTimeTolerance = 0.15

    const findActiveCueIndex = (current: number) =>
      subtitleCues.findIndex((cue) => {
        const cueStart = Math.max(0, cue.start - subtitleTimeTolerance)
        const cueEnd = cue.end + subtitleTimeTolerance

        return current >= cueStart && current < cueEnd
      })

    const showFinalCue = () => {
      if (!subtitleCues.length) return

      const lastCueIndex = subtitleCues.length - 1
      const lastCue = subtitleCues[lastCueIndex]
      const isAlreadyShowingLastCue =
        activeCueIndex === lastCueIndex && subtitleText.childElementCount > 0 && isSubtitleVisible

      if (isAlreadyShowingLastCue) {
        return
      }

      activeCueIndex = lastCueIndex
        cancelPendingHide?.()
        cancelPendingHide = null
      renderCueLines(lastCue)
      animateSubtitleIn()
    }

    const updateSubtitles = () => {
      if (!subtitleAudio) {
        return
      }

      if (!subtitleCues.length) {
        hideSubtitle()
        return
      }

      const current = subtitleAudio.currentTime
      const activeIndexNext = findActiveCueIndex(current)

      if (activeIndexNext !== -1) {
        const activeCue = subtitleCues[activeIndexNext]
        const cueChanged = activeCueIndex !== activeIndexNext

        if (cueChanged) {
          activeCueIndex = activeIndexNext
            cancelPendingHide?.()
            cancelPendingHide = null
          renderCueLines(activeCue)
          animateSubtitleIn()
        }
      } else if (subtitleAudio.ended) {
        showFinalCue()
      } else {
          if (isSubtitleVisible) return
        hideSubtitle()
      }
    }

    const setSubtitles = (cues: SubtitleCue[]) => {
      subtitleCues = cues.length ? cues : subtitleFallbackCues
      activeCueIndex = null

      if (!subtitleCues.length) {
        clearSubtitleContent()
        return
      }

        cancelPendingHide?.()
        cancelPendingHide = null
      renderCueLines(subtitleCues[0])
      animateSubtitleIn()
      updateSubtitles()
    }

    const detachSubtitleListeners = () => {
      subtitleAudio?.removeEventListener('timeupdate', updateSubtitles)
      subtitleAudio?.removeEventListener('seeked', updateSubtitles)
      subtitleAudio?.removeEventListener('play', updateSubtitles)
      subtitleAudio?.removeEventListener('ended', showFinalCue)
    }

    const attachSubtitleListeners = () => {
      subtitleAudio?.addEventListener('timeupdate', updateSubtitles)
      subtitleAudio?.addEventListener('seeked', updateSubtitles)
      subtitleAudio?.addEventListener('play', updateSubtitles)
      subtitleAudio?.addEventListener('ended', showFinalCue)
    }

    const syncSubtitleAudio = (nextAudio: HTMLAudioElement | null) => {
      if (subtitleAudio === nextAudio) {
        return
      }

      detachSubtitleListeners()
      subtitleAudio = nextAudio
      attachSubtitleListeners()
      updateSubtitles()
    }

    const setSubtitleSource = (source: ModelChangeDetail) => {
      subtitleFallbackCues = buildFallbackCues(source.subtitles)
      currentSubtitlesUrl = source.subtitlesUrl
      subtitleCues = []
      activeCueIndex = null

      syncSubtitleAudio(source.audio ?? null)

      if (currentSubtitlesUrl) {
        loadSrtSubtitles(currentSubtitlesUrl, subtitleFallbackCues).then(setSubtitles)
      } else {
        setSubtitles(subtitleFallbackCues)
      }
    }

    setSubtitleSource(initialSubtitleSource)

      const disableSubtitles = () => {
          // спрятать UI
          setSubtitlesVisible(false)

          // отцепить слушатели
          syncSubtitleAudio(null) // оно само detach/attach сделает
          subtitleText.replaceChildren()
          stopSubtitleVideo()
          setSubtitlesVisible(false)
      }

      setSubtitleSourceFn = (source: ModelChangeDetail) => {
          setSubtitlesVisible(true)
          setSubtitleSource(source)
      }

      disableSubtitlesFn = disableSubtitles

      if (currentSection.type === 'models') {
      const modelPanel = stack.children[state.currentContentIndex] as HTMLElement | undefined

      const handleModelChange = (event: Event) => {
        const detail = (event as CustomEvent<ModelChangeDetail>).detail
        if (!detail) return
        setSubtitleSource(detail)
      }

      modelPanel?.addEventListener('modelchange', handleModelChange)
      modelPanel?.dispatchEvent(new Event('request-modelstate'))

      cleanupCallbacks.push(() => {
        modelPanel?.removeEventListener('modelchange', handleModelChange)
      })
    }

    cleanupCallbacks.push(() => {
      detachSubtitleListeners()
    })
  }
    renderHint()
  container.appendChild(hint)

  const gestureHintCleanup = maybeShowGestureHint(container)
  if (gestureHintCleanup) {
    cleanupCallbacks.push(gestureHintCleanup)
  }

  const cleanup = () => {
    cleanupCallbacks.forEach((fn) => fn())
  }

  return { element: container, cleanup }
}
