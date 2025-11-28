import { onboardingSlides } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { createButton } from '../ui'
import { RenderResult } from '../types'

// Card shared between onboarding steps to keep layout consistent
const renderCard = ({
  title,
  body,
  showProgress,
}: {
  title: string
  body: string
  showProgress?: boolean
}): HTMLElement => {
  const container = document.createElement('section')
  container.className = 'card'

  if (showProgress) {
    container.classList.add('card--onboarding')

    const progress = document.createElement('div')
    progress.className = 'progress'
    progress.innerHTML = '<span class="progress__bar"></span>'
    progress.style.setProperty('--step', (state.slideIndex + 1).toString())
    progress.style.setProperty('--total', onboardingSlides.length.toString())
    container.appendChild(progress)
  }

  const content = document.createElement('div')
  content.className = 'card__content'

  const header = document.createElement('header')
  header.className = 'card__header'
  header.innerHTML = '<span class="card__meta">Пермская галерея × Сбер × GigaChat</span>'
  content.appendChild(header)

  const h1 = document.createElement('h1')
  h1.textContent = title
  content.appendChild(h1)

  const p = document.createElement('p')
  p.textContent = body
  content.appendChild(p)

  const preview = document.createElement('div')
  preview.className = 'card__preview'
  preview.innerHTML = '<div class="preview__placeholder"></div>'
  content.appendChild(preview)

  container.appendChild(content)

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

  const footer = document.createElement('div')
  footer.className = 'card__footer'
  footer.appendChild(action)
  container.appendChild(footer)

  return container
}

export const renderOnboardingSlide = (): HTMLElement => {
  const slide = onboardingSlides[state.slideIndex]
  return renderCard({
    title: slide.title,
    body: slide.body,
    showProgress: true,
  })
}

export const renderHeadphonesPrompt = (): RenderResult => {
  const overlay = document.createElement('div')
  overlay.className = 'overlay'

  const modal = document.createElement('div')
  modal.className = 'modal'

  const title = document.createElement('h2')
  title.textContent = 'Будете ли использовать наушники?'
  modal.appendChild(title)

  const description = document.createElement('p')
  description.textContent = 'Рекомендуем слушать гид, но если нет возможности — будут субтитры.'
  modal.appendChild(description)

  const goNext = () => {
    state.screen = 'pointInfo'
    rerender()
  }

  const yes = createButton('Да, уже подключил')
  yes.addEventListener('click', goNext)

  const no = createButton('Нет, буду читать субтитры', 'secondary')
  no.addEventListener('click', goNext)

  modal.appendChild(yes)
  modal.appendChild(no)
  overlay.appendChild(modal)
  return overlay
}
