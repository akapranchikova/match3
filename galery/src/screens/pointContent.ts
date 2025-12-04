import { pointContentConfigs, points } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { AudioContent, CardsContent, PointContentSection, VideoContent } from '../types'

const SWIPE_THRESHOLD = 48

const renderSubtitles = (subtitles?: string[]) => {
  if (!subtitles?.length) {
    return null
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'content-subtitles'
  wrapper.innerHTML = subtitles.map((line) => `<p>${line}</p>`).join('')
  return wrapper
}

const renderVideoSection = (section: VideoContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--video'

  const video = document.createElement('video')
  video.className = 'content-video'
  video.controls = true
  video.playsInline = true
  video.src = section.src
  video.poster = section.poster || ''

  container.appendChild(video)

  const subtitles = renderSubtitles(section.subtitles)
  if (subtitles) {
    container.appendChild(subtitles)
  }

  return container
}

const renderCardsSection = (section: CardsContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--cards'

  const viewport = document.createElement('div')
  viewport.className = 'content-cards'

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

  const update = () => {
    track.style.transform = `translateX(-${activeIndex * 100}%)`
    Array.from(dots.children).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex)
    })
  }

  section.cards.forEach((_, index) => {
    const dot = document.createElement('span')
    dot.className = 'content-cards__dot'
    dots.appendChild(dot)
    dot.addEventListener('click', () => {
      activeIndex = index
      update()
    })
  })

  prev.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + section.cards.length) % section.cards.length
    update()
  })

  next.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % section.cards.length
    update()
  })

  update()

  controls.appendChild(prev)
  controls.appendChild(next)

  viewport.appendChild(track)
  viewport.appendChild(controls)

  container.appendChild(viewport)
  container.appendChild(dots)

  return container
}

const renderAudioSection = (section: AudioContent) => {
  const container = document.createElement('div')
  container.className = 'content-panel content-panel--guide card--guide'

  const background = document.createElement('div')
  background.className = 'guide__background'
  background.style.backgroundImage = `linear-gradient(180deg, rgba(12, 20, 16, 0.86) 0%, rgba(11, 12, 11, 0.94) 100%), url(${section.background})`
  container.appendChild(background)

  const content = document.createElement('div')
  content.className = 'guide__content'

  const hero = document.createElement('div')
  hero.className = 'guide__hero'

  const img = document.createElement('img')
  img.className = 'guide__hero-image'
  img.src = section.artwork
  img.alt = 'Голос времени'
  hero.appendChild(img)

  const subtitle = document.createElement('p')
  subtitle.className = 'guide__intro guide__subtitle guide__subtitle--current guide__subtitle--visible'
  subtitle.innerHTML = section.subtitles?.join('<br>') || ''

  const audio = document.createElement('audio')
  audio.className = 'guide__audio'
  audio.controls = false
  audio.preload = 'auto'
  audio.src = section.src

  content.appendChild(hero)
  content.appendChild(subtitle)
  content.appendChild(audio)

  container.appendChild(content)

  return container
}

const renderSection = (section: PointContentSection) => {
  if (section.type === 'video') return renderVideoSection(section)
  if (section.type === 'cards') return renderCardsSection(section)
  return renderAudioSection(section)
}

export const renderPointContent = () => {
  const point = points[state.currentPointIndex]
  const config = pointContentConfigs[point.id] || pointContentConfigs.history
  state.currentContentIndex = Math.min(state.currentContentIndex, config.sections.length - 1)
  const container = document.createElement('section')
  container.className = 'card card--content'

  const header = document.createElement('header')
  header.className = 'content-header'
  header.innerHTML = `
    <p class="content-header__eyebrow">${config.body}</p>
    <h1 class="content-header__title">${config.heading}</h1>
    <p class="content-header__lead">${point.title}</p>
  `

  const slider = document.createElement('div')
  slider.className = 'content-slider'

  const stack = document.createElement('div')
  stack.className = 'content-stack'

  const cleanupCallbacks: (() => void)[] = []

  const updateActive = () => {
    Array.from(stack.children).forEach((child, index) => {
      const isActive = index === state.currentContentIndex
      child.classList.toggle('is-active', isActive)
      child.toggleAttribute('hidden', !isActive)
    })
    Array.from(slider.querySelectorAll('[data-dot]')).forEach((dot, index) => {
      dot.classList.toggle('is-active', index === state.currentContentIndex)
    })
  }

  config.sections.forEach((section, index) => {
    const panel = renderSection(section)
    panel.classList.add('content-stack__item')
    stack.appendChild(panel)
  })


  const hint = document.createElement('div')
  hint.className = 'content-hint'
  hint.innerHTML = `
    <span class="content-hint__icon">↑</span>
    <div>
      <p class="content-hint__title">Листайте снизу вверх, чтобы перейти к следующему сюжету</p>
      <p class="content-hint__text">${state.currentContentIndex + 1} / ${config.sections.length}</p>
    </div>
  `

  let startY = 0
  let isTouching = false

  const onTouchStart = (event: TouchEvent) => {
    startY = event.touches[0].clientY
    isTouching = true
  }

  const onTouchEnd = (event: TouchEvent) => {
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

  slider.appendChild(stack)
  slider.appendChild(dots)

  updateActive()

  container.appendChild(header)
  container.appendChild(slider)
  container.appendChild(hint)

  const cleanup = () => {
    cleanupCallbacks.forEach((fn) => fn())
  }

  return { element: container, cleanup }
}
