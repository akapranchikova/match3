import { points } from '../data'
import { rerender } from '../navigation'
import { saveViewed } from '../storage'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import onboardingVoice from '../assets/onboarding-voice.png'
import routePreview from '../assets/onboarding-photo.svg'

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
  const remaining = points.length - viewedPoints.size
  const overlay = document.createElement('div')
  overlay.className = 'overlay'
  overlay.innerHTML = `
    <div class="modal">
      <h2>Хотите ли продолжить экскурсию от Голоса времени?</h2>
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
  const card = document.createElement('section')
  card.className = 'card card--point card--next'
  card.innerHTML = `
    <div class="point-layout__header">
    <div>   
    <p class="point-layout__eyebrow">Маршрут «Голос времени»</p>
      <h1 class="point-layout__title">Где находится точка ${state.currentPointIndex + 1}?</h1>
    </div>
          <button class="button icon-button primary route-button" data-action="route" aria-label="Продолжить без гида">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9.49902L19 20L14 20L14 14H10L10 20H5L5 9.49902L12 4.24902L19 9.49902Z" stroke="#E2E2E2" stroke-width="2"/>
           </svg>

        </span>
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
            <div>
            тут будут субтитры
</div>
   
</div>
    <div class="footer__button">
    
  todo здесь будет кнопка включения и выключения звука
</div>
</div>
  `

  card.querySelector<HTMLButtonElement>('[data-action="map"]')?.addEventListener('click', () => {
    state.currentFloor = point.map.floor
    state.screen = 'map'
    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="scan"]')?.addEventListener('click', () => {
    state.screen = 'cameraPermission'
    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="route"]')?.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  return card
}
