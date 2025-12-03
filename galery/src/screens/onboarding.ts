import {onboardingSlides} from '../data'
import {rerender} from '../navigation'
import {state} from '../state'
import {saveOnboardingCompleted} from '../storage'
import {createButton} from '../ui'
import {RenderResult} from '../types'
import headphonesIllustration from '../assets/onboarding-headphones.png'
import logoList from '../assets/logo-list.svg'
import guideIntroAudio from '../assets/guide-intro.wav'
import guideBackground from '../assets/guide-background.png'

const introSubtitles = [
    {
        start: 0,
        end: 1.4,
        words: [
            {start: 0, text: 'Это'},
            {start: 0.3, text: 'начало'},
            {start: 0.55, text: 'моего'},
            {start: 0.75, text: 'вступительного'},
            {start: 1.05, text: 'слова...'},
        ],
    },
    {
        start: 1.4,
        end: 2.9,
        words: [
            {start: 0, text: 'Где'},
            {start: 0.25, text: 'я'},
            {start: 0.35, text: 'знакомлю'},
            {start: 0.7, text: 'вас'},
            {start: 0.9, text: 'с'},
            {start: 1.0, text: 'маршрутом'},
            {start: 1.35, text: 'по'},
            {start: 1.45, text: 'галерее.'},
        ],
    },
    {
        start: 2.9,
        end: 4.6,
        words: [
            {start: 0, text: 'Слушайте'},
            {start: 0.4, text: 'аудио'},
            {start: 0.8, text: 'и'},
            {start: 0.9, text: 'следите'},
            {start: 1.3, text: 'за'},
            {start: 1.45, text: 'субтитрами.'},
        ],
    },
]

// Card shared between onboarding steps to keep layout consistent
const renderCard = ({
                        title,
                        body,
                        showProgress,
                        imageSrc,
                        classStr,
                        imageAlt,
                        collagePlaceholder,
                        backgroundImage,
                    }: {
    title: string
    body: string
    showProgress?: boolean
    imageSrc: string
    classStr?: string
    imageAlt?: string
    collagePlaceholder?: boolean
    backgroundImage?: string
}): HTMLElement => {
    const container = document.createElement('section')
    container.className = 'card'
    if (showProgress) {
        container.classList.add('card--onboarding')
    }

    const progressSegments = showProgress
        ? onboardingSlides
            .map((_, index) => {
                const segmentClasses = ['progress__segment']
                if (index < state.slideIndex) {
                    segmentClasses.push('is-complete')
                }
                if (index === state.slideIndex) {
                    segmentClasses.push('is-active')
                }

                return `<span class="${segmentClasses.join(' ')}"></span>`
            })
            .join('')
        : ''

    const headerClasses = ['card__header']
    const footerClasses = ['card__footer']

    if (showProgress) {
        headerClasses.push('card__header--onboarding')
        footerClasses.push('card__footer--onboarding')
    }

    const headerContent = showProgress
        ? `<img src="${logoList}" alt="Лого" class="logo-list">`
        : '';

    const previewContent = collagePlaceholder
        ? `
        <div class="photo-collage" aria-hidden="true">
          <div class="photo-collage__card photo-collage__card--back-left"></div>
          <div class="photo-collage__card photo-collage__card--back-right"></div>
          <div class="photo-collage__card photo-collage__card--front"></div>
        </div>
      `
        : `<img src="${imageSrc}" alt="${imageAlt ?? 'Превью экспозиции галереи'}" class="card__image ${classStr}">`

    container.innerHTML = `
    <div class="card__content">
      <header class="${headerClasses.join(' ')}">${headerContent}</header>
      <div class="card__preview">
        ${previewContent}
      </div>
      <h1>${title}</h1>
      <p>${body}</p>
    </div>
    <div class="${footerClasses.join(' ')}">
      ${progressSegments ? `<div class="progress progress--segments">${progressSegments}</div>` : ''}
    </div>
  `

    if (backgroundImage) {
        const background = document.createElement('div')
        background.className = 'card__background'
        background.style.backgroundImage = `url(${backgroundImage})`
        container.prepend(background)
    }

    const action = createButton('Далее')
    action.addEventListener('click', () => {
        const nextSlide = state.slideIndex + 1
        if (nextSlide >= onboardingSlides.length) {
            state.screen = 'onboardingPrompt'
        } else {
            state.slideIndex = nextSlide
        }
        rerender()
    })

    container.querySelector('.card__footer')?.appendChild(action)

    return container
}

export const renderOnboardingSlide = (): HTMLElement => {
    const slide = onboardingSlides[state.slideIndex]
    return renderCard({
        title: slide.title,
        body: slide.body,
        imageSrc: slide.image,
        imageAlt: slide.imageAlt,
        classStr: slide.classStr,
        showProgress: true,
        collagePlaceholder: slide.collagePlaceholder,
        backgroundImage: slide.backgroundImage,
    })
}

export const renderHeadphonesPrompt = (): RenderResult => {
    const container = document.createElement('section')
    container.className = 'card card--headphones'

    container.innerHTML = `
    <div class="card__glow" aria-hidden="true"></div>
    <div class="card__content card__content--headphones">
      <h1>Будете ли использовать наушники?</h1>
      <p>Вы сможете поменять выбор позже</p>
      <div class="headphones-options">
        <button class="option-card option-card--primary" type="button">
          <div class="option-card__image-wrap">
            <img src="${headphonesIllustration}" alt="Наушники" class="option-card__image">
          </div>
          <span class="option-card__title">Заголовок</span>
        </button>
        <button class="option-card option-card--secondary" type="button">
          <div class="option-card__image-wrap">
            <img src="${headphonesIllustration}" alt="Наушники" class="option-card__image">
          </div>
          <span class="option-card__title">Нет, буду читать субтитры</span>
        </button>
      </div>
    </div>
  `

    const goNext = () => {
        saveOnboardingCompleted()
        state.screen = 'routeModePrompt'
        rerender()
    }

    container.querySelectorAll<HTMLButtonElement>('.headphones-options .option-card').forEach((button) => {
        button.addEventListener('click', goNext)
    })

    return container
}

export const renderRouteModePrompt = (): RenderResult => {
    const overlay = document.createElement('div')
    overlay.className = 'overlay'
    overlay.innerHTML = `
    <div class="modal">
      <h2>Выберите режим просмотра маршрута</h2>
      <p>Вы можете пройти маршрут вместе с виртуальным гидом или изучать материалы самостоятельно</p>
    </div>
  `

    const modal = overlay.querySelector<HTMLDivElement>('.modal')

    const withGuide = createButton('С гидом Голос времени')
    withGuide.addEventListener('click', () => {
        state.screen = 'guideIntro'
        rerender()
    })

    const selfGuided = createButton('Самостоятельно', 'secondary')
    selfGuided.addEventListener('click', () => {
        state.screen = 'map'
        rerender()
    })

    modal?.appendChild(withGuide)
    modal?.appendChild(selfGuided)
    return overlay
}

export const renderGuideIntro = (): RenderResult => {
    const container = document.createElement('section')
    container.className = 'card card--guide'

    const topBar = document.createElement('div')
    topBar.className = 'guide__top'

    const avatar = document.createElement('div')
    avatar.className = 'guide__avatar'
    topBar.appendChild(avatar)

    const controls = document.createElement('div')
    controls.className = 'guide__controls'
    controls.innerHTML = '<button class="guide__icon" aria-label="mute">🔇</button>'
    topBar.appendChild(controls)

    container.appendChild(topBar)

    const label = document.createElement('p')
    label.className = 'guide__label'
    label.textContent = 'Голос времени'
    container.appendChild(label)

    const intro = document.createElement('p')
    intro.className = 'guide__intro guide__subtitle guide__subtitle--current'
    container.appendChild(intro)

    const media = document.createElement('div')
    media.className = 'guide__media'

    const audio = document.createElement('audio')
    audio.className = 'guide__audio'
    audio.controls = false
    audio.autoplay = true
    audio.src = guideIntroAudio
    audio.preload = 'auto'
    media.appendChild(audio)

    const subtitleFill = document.createElement('span')
    subtitleFill.className = 'guide__subtitle-fill'
    subtitleFill.style.setProperty('--progress', '0%')

    const subtitleText = document.createElement('span')
    subtitleText.className = 'guide__subtitle-text'
    subtitleText.textContent = '—'

    intro.appendChild(subtitleFill)
    intro.appendChild(subtitleText)
    const subtitleCurrent = intro

    let activeCueIndex: number | null = null
    let revealedWordCount = 0

    const findActiveCueIndex = (current: number) =>
        introSubtitles.findIndex((cue, index) => {
            const isLastCue = index === introSubtitles.length - 1
            const cueEnd = isLastCue ? cue.end + 0.15 : cue.end
            return current >= cue.start && current < cueEnd
        })

    const showFinalCue = () => {
        const lastCue = introSubtitles[introSubtitles.length - 1]
        activeCueIndex = introSubtitles.length - 1
        revealedWordCount = lastCue.words.length
        renderWords(lastCue.words, lastCue.words.length)
        subtitleFill.style.setProperty('--progress', '100%')
        subtitleCurrent.classList.add('guide__subtitle--visible')
    }

    const renderWords = (words: { text: string }[], visibleCount: number) => {
        subtitleText.replaceChildren()

        words.forEach((word, index) => {
            const span = document.createElement('span')
            span.className = 'guide__subtitle-word'
            span.textContent = `${index > 0 ? ' ' : ''}${word.text}`

            if (index < visibleCount) {
                span.classList.add('guide__subtitle-word--visible')
            }

            subtitleText.appendChild(span)
        })
    }

    renderWords(introSubtitles[0].words, 0)

    const updateSubtitles = () => {
        const current = audio.currentTime
        const activeCueIndexNext = findActiveCueIndex(current)

        if (activeCueIndexNext !== -1) {
            const activeCue = introSubtitles[activeCueIndexNext]
            const cueElapsed = current - activeCue.start
            const visibleWords = activeCue.words.filter((word) => cueElapsed >= word.start).length

            if (activeCueIndex !== activeCueIndexNext) {
                activeCueIndex = activeCueIndexNext
                revealedWordCount = visibleWords
                renderWords(activeCue.words, visibleWords)
                subtitleCurrent.classList.add('guide__subtitle--visible')
            } else if (visibleWords !== revealedWordCount) {
                revealedWordCount = visibleWords
                renderWords(activeCue.words, visibleWords)
            }

            const progress = Math.min(1, Math.max(0, cueElapsed / (activeCue.end - activeCue.start)))
            subtitleFill.style.setProperty('--progress', `${progress * 100}%`)
        } else if (audio.ended) {
            showFinalCue()
        } else {
            subtitleFill.style.setProperty('--progress', '0%')
            subtitleText.textContent = '—'
            subtitleCurrent.classList.remove('guide__subtitle--visible')
            activeCueIndex = null
            revealedWordCount = 0
        }
    }

    let hasStarted = false
    const tryPlay = () => {
        if (hasStarted) return
        audio
            .play()
            .then(() => {
                hasStarted = true
            })
            .catch(() => {
            })
    }

    const handlePlay = () => {
        hasStarted = true
        updateSubtitles()
    }

    const handleLoadedMetadata = () => {
        updateSubtitles()
        tryPlay()
    }

    audio.addEventListener('timeupdate', updateSubtitles)
    audio.addEventListener('seeked', updateSubtitles)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', tryPlay)
    audio.addEventListener('ended', showFinalCue)

    requestAnimationFrame(tryPlay)

    controls.querySelector('.guide__icon')?.addEventListener('click', () => {
        audio.muted = !audio.muted
        controls.querySelector('.guide__icon')!.textContent = audio.muted ? '🔇' : '🔊'
    })

    container.appendChild(media)

    const start = createButton('Начать маршрут')
    start.addEventListener('click', () => {
        state.currentPointIndex = 0
        state.screen = 'nextPoint'
        rerender()
    })

    container.appendChild(start)

    return {
        element: container,
        cleanup: () => {
            audio.pause()
            audio.currentTime = 0
            audio.removeEventListener('timeupdate', updateSubtitles)
            audio.removeEventListener('seeked', updateSubtitles)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('canplay', tryPlay)
            audio.removeEventListener('ended', showFinalCue)
        },
    }
}
