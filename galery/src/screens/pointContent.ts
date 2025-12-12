import { pointContentConfigs, points } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { saveSoundEnabled } from '../storage'
import { loadSrtSubtitles, SubtitleCue, createCueFromText } from '../subtitles'
import { AudioContent, CardsContent, ModelsContent, PointContentSection, VideoContent } from '../types'
import { navigateToNextPoint } from './pointFlow'
import onboardingVoice from '../assets/onboarding-voice.png'

const SWIPE_THRESHOLD = 48
const MODEL_GESTURE_CLASS = 'model-gesture-active'

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

  const video = document.createElement('video')
  video.className = 'content-video'
  video.controls = false
  video.playsInline = true
  video.src = section.src
  video.poster = section.poster || ''
  video.muted = true
  video.defaultMuted = true

  container.appendChild(video)

  if (section.audio) {
    const audio = document.createElement('audio')
    audio.className = 'content-video__audio'
    audio.controls = false
    audio.preload = 'auto'
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

  const content = document.createElement('div')
  content.className = 'guide__content'

  const hero = document.createElement('div')
  hero.className = 'guide__hero'

  const img = document.createElement('img')
  img.className = 'guide__hero-image'
  img.src = section.artwork
  img.alt = 'Голос времени'
  hero.appendChild(img)

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
  const container = document.createElement('section')
  container.className = 'card card--content'

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
  const isLastContent = state.currentContentIndex >= config.sections.length - 1

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

    mediaElements.forEach((media) => {
      const isActive = !!activePanel?.contains(media)
      if (media instanceof HTMLVideoElement) {
        media.muted = true
        media.defaultMuted = true
      } else {
        media.muted = isMuted
      }
      if (!isActive) {
        media.pause()
      }
    })

    const activeVideo = activePanel?.querySelector('video') as HTMLVideoElement | null
    const activeAudio = activePanel?.querySelector('audio') as HTMLAudioElement | null

    if (activeVideo) {
      autoplayTimeoutId = window.setTimeout(() => {
        activeVideo.play().catch(() => {})
          // поменять, если хотим задержу
      }, 1)
    }

    if (activeAudio) {
      activeAudio.play().catch(() => {})
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

    syncMediaState()
  }

  config.sections.forEach((section, index) => {
    const panel = renderSection(section)
    panel.classList.add('content-stack__item')
    mediaElements.push(...Array.from(panel.querySelectorAll('video, audio')))
    stack.appendChild(panel)
  })

  const hint = document.createElement('div')
  hint.className = 'content-hint'

  soundToggle = document.createElement('button')
  soundToggle.type = 'button'
  soundToggle.className = 'button primary icon-button'
  soundToggle.addEventListener('click', () => setMuted(!isMuted))

  if (isLastContent) {
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
      <path d="M6.125 14C5.275 12.9333 4.625 11.7583 4.175 10.475C3.725 9.19167 3.5 7.86667 3.5 6.5C3.5 6.05 3.525 5.6 3.575 5.15C3.625 4.7 3.7 4.25 3.8 3.8L2.05 5.55L1 4.5L4.5 1L8 4.5L6.95 5.55L5.325 3.95C5.20833 4.36667 5.125 4.7875 5.075 5.2125C5.025 5.6375 5 6.06667 5 6.5C5 7.66667 5.1875 8.79583 5.5625 9.8875C5.9375 10.9792 6.48333 11.9917 7.2 12.925L6.125 14ZM16.45 20.825C16.0667 20.9583 15.6792 21.0208 15.2875 21.0125C14.8958 21.0042 14.5167 20.9083 14.15 20.725L7.6 17.675L8.05 16.675C8.21667 16.3417 8.45 16.0708 8.75 15.8625C9.05 15.6542 9.38333 15.5333 9.75 15.5L11.45 15.375L8.65 7.7C8.55 7.43333 8.55833 7.17917 8.675 6.9375C8.79167 6.69583 8.98333 6.525 9.25 6.425C9.51667 6.325 9.77083 6.33333 10.0125 6.45C10.2542 6.56667 10.425 6.75833 10.525 7.025L14.225 17.2L11.725 17.375L15 18.9C15.1167 18.95 15.2417 18.9792 15.375 18.9875C15.5083 18.9958 15.6333 18.9833 15.75 18.95L19.675 17.525C20.1917 17.3417 20.5667 16.9958 20.8 16.4875C21.0333 15.9792 21.0583 15.4667 20.875 14.95L19.5 11.2C19.4 10.9333 19.4083 10.6792 19.525 10.4375C19.6417 10.1958 19.8333 10.025 20.1 9.925C20.3667 9.825 20.6208 9.83333 20.8625 9.95C21.1042 10.0667 21.275 10.2583 21.375 10.525L22.75 14.275C23.1333 15.325 23.0958 16.3458 22.6375 17.3375C22.1792 18.3292 21.425 19.0167 20.375 19.4L16.45 20.825ZM14.2 14.2L12.85 10.425C12.75 10.1583 12.7583 9.90417 12.875 9.6625C12.9917 9.42083 13.1833 9.25 13.45 9.15C13.7167 9.05 13.9708 9.05833 14.2125 9.175C14.4542 9.29167 14.625 9.48333 14.725 9.75L16.1 13.5L14.2 14.2ZM17.025 13.175L16 10.35C15.9 10.0833 15.9083 9.82917 16.025 9.5875C16.1417 9.34583 16.3333 9.175 16.6 9.075C16.8667 8.975 17.1208 8.98333 17.3625 9.1C17.6042 9.21667 17.775 9.40833 17.875 9.675L18.9 12.475L17.025 13.175Z" fill="#E2E2E2"/>
    </svg>
  `

    const hintText = document.createElement('div')
    hintText.innerHTML = '<p class="content-hint__title">Листайте снизу вверх, чтобы перейти к следующему сюжету</p>'

    const hintActions = document.createElement('div')
    hintActions.className = 'content-hint__actions'
    hintActions.appendChild(soundToggle)

    hint.appendChild(hintIcon)
    hint.appendChild(hintText)
    hint.appendChild(hintActions)
  }

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

    startY = event.touches[0].clientY
    isTouching = true
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (gestureFromModel) {
      gestureFromModel = false
      return
    }

    if (!isTouching) return
    const deltaY = event.changedTouches[0].clientY - startY
    isTouching = false

    if (deltaY < -SWIPE_THRESHOLD && state.currentContentIndex < config.sections.length - 1) {
      state.currentContentIndex += 1
      rerender()
    } else if (deltaY > SWIPE_THRESHOLD && state.currentContentIndex > 0) {
      state.currentContentIndex -= 1
      rerender()
    }
  }

  container.addEventListener('touchstart', onTouchStart)
  container.addEventListener('touchend', onTouchEnd)

  cleanupCallbacks.push(() => {
    container.removeEventListener('touchstart', onTouchStart)
    container.removeEventListener('touchend', onTouchEnd)
  })

  cleanupCallbacks.push(clearAutoplay)

  slider.appendChild(stack)

  setMuted(!state.soundEnabled)
  updateActive()

  container.appendChild(header)
  container.appendChild(slider)

  if (currentSection.subtitles?.length) {
    const subtitleLayout = document.createElement('div')
    subtitleLayout.className = 'content-subtitles content-subtitles--voice'

    const subtitleImage = document.createElement('img')
    subtitleImage.src = onboardingVoice
    subtitleImage.alt = 'Голос времени'
    subtitleImage.className = 'content-subtitles__image'
    subtitleLayout.appendChild(subtitleImage)

    const subtitleText = document.createElement('div')
    subtitleText.className = 'content-subtitles__text'

    subtitleLayout.appendChild(subtitleText)
    container.appendChild(subtitleLayout)

    const subtitleAudio = (stack.children[state.currentContentIndex] as HTMLElement | undefined)?.querySelector(
      'audio',
    ) as HTMLAudioElement | null

    const subtitleAnimationClasses = ['subtitle-animate-in', 'subtitle-animate-out'] as const
    const subtitleFallbackCues: SubtitleCue[] = currentSection.subtitles.map((line, index) =>
      createCueFromText(line, index * 3, index * 3 + 2.75),
    )

    let subtitleCues: SubtitleCue[] = []
    let activeCueIndex: number | null = null
    let isSubtitleVisible = false
    let isSubtitleAnimatingOut = false

    const playSubtitleAnimation = (className: (typeof subtitleAnimationClasses)[number]) => {
      subtitleAnimationClasses.forEach((animationClass) => subtitleText.classList.remove(animationClass))

      void subtitleText.offsetWidth
      subtitleText.classList.add(className)
    }

    const animateSubtitleIn = () => {
      isSubtitleAnimatingOut = false
      isSubtitleVisible = true
      playSubtitleAnimation('subtitle-animate-in')
    }

    const animateSubtitleOut = (onFinish?: () => void) => {
      if (isSubtitleAnimatingOut || !isSubtitleVisible) {
        if (onFinish) onFinish()
        return
      }

      isSubtitleAnimatingOut = true
      playSubtitleAnimation('subtitle-animate-out')

      if (!onFinish) return

      const handleAnimationEnd = () => {
        subtitleText.removeEventListener('animationend', handleAnimationEnd)
        isSubtitleAnimatingOut = false
        onFinish()
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
    }

    const hideSubtitle = () => {
      if (!subtitleText.childElementCount) {
        clearSubtitleContent()
        return
      }

      animateSubtitleOut(clearSubtitleContent)
    }

    const findActiveCueIndex = (current: number) =>
      subtitleCues.findIndex((cue, index) => {
        const isLastCue = index === subtitleCues.length - 1
        const cueEnd = isLastCue ? cue.end + 0.15 : cue.end
        return current >= cue.start && current < cueEnd
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
          renderCueLines(activeCue)
          animateSubtitleIn()
        }
      } else if (subtitleAudio.ended) {
        showFinalCue()
      } else {
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

      renderCueLines(subtitleCues[0])
      animateSubtitleIn()
      updateSubtitles()
    }

    if (currentSection.subtitlesUrl) {
      loadSrtSubtitles(currentSection.subtitlesUrl, subtitleFallbackCues).then(setSubtitles)
    } else {
      setSubtitles(subtitleFallbackCues)
    }

    subtitleAudio?.addEventListener('timeupdate', updateSubtitles)
    subtitleAudio?.addEventListener('seeked', updateSubtitles)
    subtitleAudio?.addEventListener('play', updateSubtitles)
    subtitleAudio?.addEventListener('ended', showFinalCue)

    cleanupCallbacks.push(() => {
      subtitleAudio?.removeEventListener('timeupdate', updateSubtitles)
      subtitleAudio?.removeEventListener('seeked', updateSubtitles)
      subtitleAudio?.removeEventListener('play', updateSubtitles)
      subtitleAudio?.removeEventListener('ended', showFinalCue)
    })
  }
  container.appendChild(hint)

  const cleanup = () => {
    cleanupCallbacks.forEach((fn) => fn())
  }

  return { element: container, cleanup }
}
