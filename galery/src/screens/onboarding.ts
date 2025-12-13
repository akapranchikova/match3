import { onboardingSlides } from '../data'
import { rerender } from '../navigation'
import { getFirstUnviewedPointIndex, isRouteCompleted, resetProgress, state } from '../state'
import { saveOnboardingCompleted, saveSoundEnabled } from '../storage'
import { createButton } from '../ui'
import { RenderResult } from '../types'
import headphonesIllustration from '../assets/onboarding-headphones.png'
import bookIllustration from '../assets/book.png'
import logoList from '../assets/logo-list.svg'
import guideBackground from '../assets/guide-background.png'
import onboardingVoice from '../assets/onboarding-voice.png'
import onboardingHistory from '../assets/onboarding-history.png'
import guideGreetingAudio from '../assets/points/0. Интро - приветствие/1.Интро-приветствие.mp3'
import guideGreetingSubtitlesUrl from '../assets/points/0. Интро - приветствие/1. Интро - приветствие.txt?url'
import { createCueFromText, loadSrtSubtitles, SubtitleCue } from '../subtitles'

const ONBOARDING_SLIDE_DURATION_MS = 6000

const introSubtitlesFallback: SubtitleCue[] = [
    createCueFromText('Добро пожаловать в цифровой маршрут по истории Перми', 0, 3.298),
    createCueFromText('созданные технологиями Сбера.', 3.298, 5.299),
    createCueFromText(
        'Весь контент сгенерирован искусственным интеллектом Гигачат на основе исторических материалов.',
        6.139,
        12.24,
    ),
    createCueFromText('Следуйте по разным точкам в пространстве и вам', 13.019, 15.859),
    createCueFromText(
        'откроется история места, в котором расположилась первонская художественная галерея.',
        15.859,
        20.6,
    ),
]

let cachedIntroSubtitles: SubtitleCue[] | null = null

const getIntroSubtitles = async () => {
    if (cachedIntroSubtitles) return cachedIntroSubtitles

    cachedIntroSubtitles = await loadSrtSubtitles(guideGreetingSubtitlesUrl, introSubtitlesFallback)
    return cachedIntroSubtitles
}

type OptionVariant = 'primary' | 'secondary'

interface OptionCardConfig {
    title: string
    image: string
    imageAlt?: string
    className?: string
    imageClassName?: string
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
          <div class="option-card__image-wrap ${option.imageClassName ?? ''}">
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
                        collageImages,
                        backgroundImage,
                        backgroundConfig,
                        onAdvance,
                        progressDurationMs,
                    }: {
    title: string
    body: string
    showProgress?: boolean
    imageSrc: string
    classStr?: string
    imageAlt?: string
    collagePlaceholder?: boolean
    collageImages?: string[]
    backgroundImage?: string
    backgroundConfig?: {
        color?: string
        position?: string
        size?: string
        filter?: string
        transform?: string
        opacity?: string
    }
    onAdvance?: () => void
    progressDurationMs?: number
}): HTMLElement => {
    const container = document.createElement('section')
    container.className = 'card'
    if (showProgress) {
        container.classList.add('card--onboarding')
    }

    if (backgroundImage) {
        container.classList.add('card--with-background')
    }

    const progressSegments = showProgress
        ? onboardingSlides
            .map((_, index) => {
                const segmentClasses = ['progress__segment']
                const segmentStyle =
                    index === state.slideIndex && progressDurationMs
                        ? ` style="--progress-duration:${progressDurationMs}ms"`
                        : ''
                if (index < state.slideIndex) {
                    segmentClasses.push('is-complete')
                }
                if (index === state.slideIndex) {
                    segmentClasses.push('is-active')
                }

                return `<span class="${segmentClasses.join(' ')}"${segmentStyle}></span>`
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

    const collageContent = collageImages
        ?.slice(0, 3)
        .map(
            (src, index) => `
          <div class="photo-collage__card photo-collage__card--${['back-left', 'back-right', 'front'][index]}">
            <img src="${src}" alt="Историческая фотография ${index + 1}" class="photo-collage__image">
          </div>
        `,
        )
        .join('')

    const previewContent = collageContent
        ? `
        <div class="photo-collage" aria-hidden="true">
          ${collageContent}
        </div>
      `
        : collagePlaceholder
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

        if (backgroundConfig?.color) {
            background.style.backgroundColor = backgroundConfig.color
        }
        if (backgroundConfig?.position) {
            background.style.backgroundPosition = backgroundConfig.position
        }
        if (backgroundConfig?.size) {
            background.style.backgroundSize = backgroundConfig.size
        }
        if (backgroundConfig?.filter) {
            background.style.filter = backgroundConfig.filter
        }
        if (backgroundConfig?.transform) {
            background.style.transform = backgroundConfig.transform
        }
        if (backgroundConfig?.opacity) {
            background.style.opacity = backgroundConfig.opacity
        }
        container.prepend(background)
    }

    const action = createButton('Далее')
    const handleAdvance = () => {
        if (onAdvance) {
            onAdvance()
            return
        }

        const nextSlide = state.slideIndex + 1
        if (nextSlide >= onboardingSlides.length) {
            state.screen = 'onboardingPrompt'
        } else {
            state.slideIndex = nextSlide
        }
        rerender()
    }

    action.addEventListener('click', handleAdvance)

    container.querySelector('.card__footer')?.appendChild(action)

    return container
}

export const renderOnboardingSlide = (): RenderResult => {
    const slide = onboardingSlides[state.slideIndex]
    const completeOnboarding = () => {
        if (!state.onboardingCompleted) {
            state.onboardingCompleted = true
            saveOnboardingCompleted()
        }
        state.screen = 'onboardingPrompt'
    }
    const handleAdvance = () => {
        const nextSlide = state.slideIndex + 1
        if (nextSlide >= onboardingSlides.length) {
            completeOnboarding()
        } else {
            state.slideIndex = nextSlide
        }
        rerender()
    }

    const element = renderCard({
        title: slide.title,
        body: slide.body,
        imageSrc: slide.image,
        imageAlt: slide.imageAlt,
        classStr: slide.classStr,
        showProgress: true,
        collagePlaceholder: slide.collagePlaceholder,
        collageImages: slide.collageImages,
        backgroundImage: slide.backgroundImage,
        backgroundConfig: slide.backgroundConfig,
        onAdvance: handleAdvance,
        progressDurationMs: ONBOARDING_SLIDE_DURATION_MS,
    })

    const autoAdvanceTimeout = window.setTimeout(handleAdvance, ONBOARDING_SLIDE_DURATION_MS)

    return {
        element,
        cleanup: () => window.clearTimeout(autoAdvanceTimeout),
    }
}

export const renderHeadphonesPrompt = (): RenderResult => {
    const goNext = () => {
        if (state.deepLinkPointIndex !== null) {
            state.screen = 'pointContent'
            state.currentContentIndex = 0
            state.deepLinkPointIndex = null
            state.deepLinkRequiresHeadphones = false
            rerender()
            return
        }

        state.screen = 'routeModePrompt'
        rerender()
    }

    const selectHeadphones = (enabled: boolean) => {
        state.soundEnabled = enabled
        saveSoundEnabled(enabled)
        goNext()
    }

    return renderOptionPrompt({
        title: 'Будете ли использовать наушники?',
        subtitle: 'На маршруте звучат аудио-истории. Наденьте наушники, чтобы ничего не пропустить. Изменить режим можно в любой момент',
        className: 'card--headphones',
        options: [
            {
                title: 'Да, буду слушать в наушниках',
                image: headphonesIllustration,
                imageAlt: 'Наушники',
                variant: 'primary',
                onSelect: () => selectHeadphones(true),
            },
            {
                title: 'Нет, буду читать субтитры',
                image: bookIllustration,
                imageAlt: 'Наушники',
                variant: 'secondary',
                onSelect: () => selectHeadphones(false),
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
                imageClassName: 'option-card__image-wrap--voice',
                variant: 'primary',
                onSelect: () => {
                    state.routeMode = 'guide'
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
                    state.routeMode = 'solo'
                    state.screen = 'routeList'
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

    const header = document.createElement('header')
    header.className = 'card__header card__header--onboarding guide__header'

    const logo = document.createElement('img')
    logo.src = logoList
    logo.alt = 'Логотип Сбера'
    logo.className = 'logo-list'
    header.appendChild(logo)

    container.appendChild(header)

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
    audio.src = guideGreetingAudio
    audio.preload = 'auto'
    media.appendChild(audio)

    const subtitleFill = document.createElement('span')
    subtitleFill.className = 'guide__subtitle-fill'
    subtitleFill.style.setProperty('--progress', '0%')

    const subtitleText = document.createElement('span')
    subtitleText.className = 'guide__subtitle-text'
    subtitleText.textContent = ''

    const subtitleAnimationClasses = ['subtitle-animate-in', 'subtitle-animate-out'] as const

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

    intro.appendChild(subtitleFill)
    intro.appendChild(subtitleText)
    const subtitleCurrent = intro

    let introSubtitles = cachedIntroSubtitles || introSubtitlesFallback
    let activeCueIndex: number | null = null
    let hasStarted = false

    const clearSubtitleContent = () => {
        subtitleText.replaceChildren()
        subtitleText.textContent = ''
        subtitleCurrent.classList.remove('guide__subtitle--visible')
        isSubtitleVisible = false
        isSubtitleAnimatingOut = false
    }

    const hideSubtitle = () => {
        if (!(subtitleText.textContent || '').trim().length) {
            console.log('clear')
            clearSubtitleContent()
            return
        }

        animateSubtitleOut(clearSubtitleContent)
    }

    const resetSubtitleState = () => {
        subtitleFill.style.setProperty('--progress', '0%')
        hideSubtitle()
        activeCueIndex = null
    }

    const renderWords = (words: { text: string }[]) => {
        subtitleText.replaceChildren()

        if (!words.length) {
            console.log('reset')
            resetSubtitleState()
            return
        }

        words.forEach((word, index) => {
            const span = document.createElement('span')
            span.className = 'guide__subtitle-word'
            span.textContent = `${index > 0 ? ' ' : ''}${word.text}`
            span.classList.add('guide__subtitle-word--visible')

            console.log(word.text)
            subtitleText.appendChild(span)
        })
    }

    const subtitleTimeTolerance = 0.15

    const findActiveCueIndex = (current: number) =>
        introSubtitles.findIndex((cue) => {
            const cueStart = Math.max(0, cue.start - subtitleTimeTolerance)
            const cueEnd = cue.end + subtitleTimeTolerance

            return current >= cueStart && current < cueEnd
        })

    const showFinalCue = () => {
        if (!introSubtitles.length) return

        const lastCueIndex = introSubtitles.length - 1
        const lastCue = introSubtitles[lastCueIndex]
        const isAlreadyShowingLastCue =
            activeCueIndex === lastCueIndex &&
            subtitleText.childElementCount === lastCue.words.length &&
            isSubtitleVisible

        if (isAlreadyShowingLastCue) {
            subtitleFill.style.setProperty('--progress', '100%')
            subtitleCurrent.classList.add('guide__subtitle--visible')
            return
        }

        activeCueIndex = lastCueIndex
        renderWords(lastCue.words)
        subtitleFill.style.setProperty('--progress', '100%')
        subtitleCurrent.classList.add('guide__subtitle--visible')
        animateSubtitleIn()
    }

    const areCuesEqual = (a: SubtitleCue[], b: SubtitleCue[]) => {
        if (a.length !== b.length) return false

        return a.every((cue, index) => {
            const other = b[index]
            if (!other) return false

            const hasDifferentTiming = cue.start !== other.start || cue.end !== other.end

            if (hasDifferentTiming) {
                return false
            }

            return cue.words.every((word, wordIndex) => {
                const otherWord = other.words[wordIndex]
                return otherWord?.text === word.text && otherWord?.start === word.start
            })
        })
    }

    const setSubtitles = (subtitles: SubtitleCue[]) => {
        if (areCuesEqual(introSubtitles, subtitles)) return

        const wasShowingActiveCue = hasStarted && isSubtitleVisible && activeCueIndex !== null

        introSubtitles = subtitles

        if (!introSubtitles.length) {
            console.log('reset 2')
            resetSubtitleState()
            return
        }

        if (wasShowingActiveCue && activeCueIndex !== null) {
            const activeCue = introSubtitles[activeCueIndex]
            if (activeCue) {
                console.log(activeCue.words)
                renderWords(activeCue.words)
                const activeCueDuration = Math.max(0.001, activeCue.end - activeCue.start)
                const progress = Math.min(1, Math.max(0, (audio.currentTime - activeCue.start) / activeCueDuration))
                subtitleFill.style.setProperty('--progress', `${progress * 100}%`)
                subtitleCurrent.classList.add('guide__subtitle--visible')
                isSubtitleAnimatingOut = false
                isSubtitleVisible = true
                return
            }
        }

        resetSubtitleState()

        if (introSubtitles.length) {
            console.log('render')
            renderWords(introSubtitles[0].words)
        }
    }

    setSubtitles(introSubtitles)

    const startRoute = () => {
        if (isRouteCompleted()) {
            resetProgress()
        }
        state.currentPointIndex = getFirstUnviewedPointIndex()
        state.screen = 'nextPoint'
        rerender()
    }

    const handleEnded = () => {
        showFinalCue()
        startRoute()
    }

    const updateSubtitles = () => {
        if (!introSubtitles.length) {
            resetSubtitleState()
            return
        }

        const current = audio.currentTime
        const activeCueIndexNext = findActiveCueIndex(current)

        if (activeCueIndexNext !== -1) {
            const activeCue = introSubtitles[activeCueIndexNext]
            const cueElapsed = current - activeCue.start

            if (activeCueIndex !== activeCueIndexNext) {
                activeCueIndex = activeCueIndexNext
                renderWords(activeCue.words)
                subtitleCurrent.classList.add('guide__subtitle--visible')
                animateSubtitleIn()
            }

            const progress = Math.min(1, Math.max(0, cueElapsed / (activeCue.end - activeCue.start)))
            subtitleFill.style.setProperty('--progress', `${progress * 100}%`)
        } else if (audio.ended) {
            handleEnded()
        } else {
            resetSubtitleState()
        }
    }

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
    audio.addEventListener('ended', handleEnded)

    getIntroSubtitles()
        .then((subtitles) => {
            setSubtitles(subtitles)
            updateSubtitles()
        })
        .catch(() => {
        })

    requestAnimationFrame(tryPlay)

    const controls = document.createElement('div')
    controls.className = 'guide__controls'

    let isMuted = !state.soundEnabled

    const muteButton = document.createElement('button')
    muteButton.className = 'button icon-button primary'
    muteButton.type = 'button'

    const updateMuteButton = () => {
        muteButton.innerHTML = isMuted
            ? `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M15.4 16L14 14.6L16.6 12L14 9.4L15.4 8L18 10.6L20.6 8L22 9.4L19.4 12L22 14.6L20.6 16L18 13.4L15.4 16ZM3 15L3 9H7L12 4L12 20L7 15H3ZM10 8.85L7.85 11H5L5 13H7.85L10 15.15L10 8.85Z" fill="#E2E2E2"/>
      </svg>
    `
            : `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M12 20.9141L6.08594 15H2L2 9H6.08594L12 3.08594L12 20.9141ZM14 3.22754C14.4922 3.33984 14.9758 3.49145 15.4443 3.68555C16.5361 4.13784 17.5286 4.8001 18.3643 5.63574C19.1999 6.47139 19.8622 7.46386 20.3145 8.55566C20.7667 9.64759 21 10.8181 21 12L20.9893 12.4424C20.9385 13.4732 20.7102 14.4888 20.3145 15.4443C19.8622 16.5361 19.1999 17.5286 18.3643 18.3643C17.5286 19.1999 16.5361 19.8622 15.4443 20.3145C14.9758 20.5085 14.4921 20.6592 14 20.7715L14 18.7061C14.2296 18.6375 14.4565 18.5588 14.6787 18.4668C15.528 18.115 16.3002 17.6002 16.9502 16.9502C17.6002 16.3002 18.115 15.528 18.4668 14.6787C18.8186 13.8294 19 12.9193 19 12C19 11.0807 18.8186 10.1706 18.4668 9.32129C18.115 8.47204 17.6002 7.6998 16.9502 7.0498C16.3002 6.39981 15.528 5.88499 14.6787 5.5332C14.4564 5.44112 14.2297 5.36151 14 5.29297V3.22754ZM14 7.41895C14.5722 7.66881 15.0932 8.02293 15.5352 8.46484C15.9994 8.92914 16.3679 9.48029 16.6191 10.0869C16.8704 10.6935 17 11.3435 17 12C17 12.6565 16.8704 13.3065 16.6191 13.9131C16.3679 14.5197 15.9994 15.0709 15.5352 15.5352C15.0933 15.977 14.5721 16.3302 14 16.5801V14.2305C14.0405 14.1942 14.0826 14.1596 14.1211 14.1211C14.3996 13.8426 14.6207 13.5123 14.7715 13.1484C14.9222 12.7845 15 12.394 15 12C15 11.606 14.9222 11.2155 14.7715 10.8516C14.6207 10.4877 14.3996 10.1574 14.1211 9.87891C14.0824 9.84023 14.0406 9.80499 14 9.76855L14 7.41895ZM6.91406 11H4L4 13H6.91406L10 16.0859L10 7.91406L6.91406 11Z" fill="#D9D9D9"/>
      </svg>
    `
        muteButton.setAttribute('aria-pressed', String(!isMuted))
        muteButton.classList.toggle('is-muted', isMuted)
    }

    const setMuted = (muted: boolean) => {
        isMuted = muted
        state.soundEnabled = !muted
        saveSoundEnabled(!muted)
        audio.muted = muted
        updateMuteButton()
    }

    muteButton.addEventListener('click', () => setMuted(!isMuted))
    setMuted(isMuted)

    controls.appendChild(muteButton)

    const footer = document.createElement('div')
    footer.className = 'guide__footer'
    footer.appendChild(controls)

    const start = createButton('Начать маршрут')
    start.addEventListener('click', startRoute)

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
            audio.removeEventListener('ended', handleEnded)
        },
    }
}
