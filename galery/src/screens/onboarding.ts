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
import onboardingVoice from '../assets/onboarding-voice.png'
import onboardingHistory from '../assets/onboarding-history.png'

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

type OptionVariant = 'primary' | 'secondary'

interface OptionCardConfig {
    title: string
    image: string
    imageAlt?: string
    variant?: OptionVariant
    onSelect: () => void
}

const renderOptionPrompt = ({
                               title,
                               subtitle,
                               options,
                               className,
                           }: {
    title: string
    subtitle: string
    options: OptionCardConfig[]
    className?: string
}) => {
    const container = document.createElement('section')
    container.className = ['card', 'card--options', className].filter(Boolean).join(' ')

    container.innerHTML = `
    <div class="card__glow" aria-hidden="true"></div>
    <div class="card__content card__content--options">
    <div class="header">
     <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>

      <div class="option-grid">
        ${options
            .map(
                (option, index) => `
        <button class="option-card ${option.variant ? `option-card--${option.variant}` : ''}" type="button" data-index="${index}">
          <div class="option-card__image-wrap">
            <img src="${option.image}" alt="${option.imageAlt ?? option.title}" class="option-card__image">
          </div>
          <span class="option-card__title">${option.title}</span>
        </button>
      `,
            )
            .join('')}
      </div>
    </div>
  `

    container.querySelectorAll<HTMLButtonElement>('.option-card').forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index)
            options[index]?.onSelect()
        })
    })

    return container
}

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
    const goNext = () => {
        saveOnboardingCompleted()
        state.screen = 'routeModePrompt'
        rerender()
    }

    return renderOptionPrompt({
        title: 'Будете ли использовать наушники?',
        subtitle: 'Вы сможете поменять выбор позже',
        className: 'card--headphones',
        options: [
            {
                title: 'Да, буду слушать в наушниках',
                image: headphonesIllustration,
                imageAlt: 'Наушники',
                variant: 'primary',
                onSelect: goNext,
            },
            {
                title: 'Нет, буду читать субтитры',
                image: headphonesIllustration,
                imageAlt: 'Наушники',
                variant: 'secondary',
                onSelect: goNext,
            },
        ],
    })
}

export const renderRouteModePrompt = (): RenderResult => {
    return renderOptionPrompt({
        title: 'Выберите режим просмотра маршрута',
        subtitle: 'Пройдите маршрут вместе с виртуальным гидом или изучайте материалы самостоятельно',
        className: 'card--route-mode',
        options: [
            {
                title: 'С гидом Голос времени',
                image: onboardingVoice,
                imageAlt: 'Голос времени',
                variant: 'primary',
                onSelect: () => {
                    state.screen = 'guideIntro'
                    rerender()
                },
            },
            {
                title: 'Самостоятельно',
                image: onboardingHistory,
                imageAlt: 'Самостоятельное прохождение',
                variant: 'secondary',
                onSelect: () => {
                    state.screen = 'map'
                    rerender()
                },
            },
        ],
    })
}

export const renderGuideIntro = (): RenderResult => {
    const container = document.createElement('section')
    container.className = 'card card--guide'

    const background = document.createElement('div')
    background.className = 'guide__background'
    background.style.backgroundImage = `linear-gradient(180deg, rgba(12, 20, 16, 0.86) 0%, rgba(11, 12, 11, 0.94) 100%), url(${guideBackground})`
    container.appendChild(background)

    const content = document.createElement('div')
    content.className = 'guide__content'

    const hero = document.createElement('div')
    hero.className = 'guide__hero'
    const heroImage = document.createElement('img')
    heroImage.src = onboardingVoice
    heroImage.alt = 'Голос времени'
    heroImage.className = 'guide__hero-image'
    hero.appendChild(heroImage)
    content.appendChild(hero)

    const intro = document.createElement('p')
    intro.className = 'guide__intro guide__subtitle guide__subtitle--current'
    content.appendChild(intro)

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

    const controls = document.createElement('div')
    controls.className = 'guide__controls'

    const muteButton = document.createElement('button')
    muteButton.className = 'guide__icon'
    muteButton.type = 'button'
    muteButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M15.4 16L14 14.6L16.6 12L14 9.4L15.4 8L18 10.6L20.6 8L22 9.4L19.4 12L22 14.6L20.6 16L18 13.4L15.4 16ZM3 15L3 9H7L12 4L12 20L7 15H3ZM10 8.85L7.85 11H5L5 13H7.85L10 15.15L10 8.85Z" fill="#E2E2E2"/>
      </svg>
    `

    muteButton.addEventListener('click', () => {
        audio.muted = !audio.muted
        muteButton.classList.toggle('is-muted', audio.muted)
    })

    controls.appendChild(muteButton)

    const footer = document.createElement('div')
    footer.className = 'guide__footer'
    footer.appendChild(controls)

    const start = createButton('Начать маршрут')
    start.addEventListener('click', () => {
        state.currentPointIndex = 0
        state.screen = 'nextPoint'
        rerender()
    })

    footer.appendChild(start)

    container.appendChild(content)
    container.appendChild(media)
    container.appendChild(footer)

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
