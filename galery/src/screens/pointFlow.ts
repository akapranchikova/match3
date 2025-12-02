import { points } from '../data'
import { rerender } from '../navigation'
import { saveViewed } from '../storage'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import routePreview from '../assets/onboarding-photo.svg'

export const handleFinishPoint = () => {
  viewedPoints.add(points[state.currentPointIndex].id)
  saveViewed(viewedPoints)
  state.screen = 'infoComplete'
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
    <button class="button primary" data-action="finish">Закончить точку</button>
  `

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
  card.className = 'card card--point'
  card.innerHTML = `
    <p class="caption">Пройдено ${viewedPoints.size} из ${points.length} точек</p>
    <h1>Где находится точка ${state.currentPointIndex + 1}?</h1>
    <p class="point__description">${point.description}</p>
    <a href="#" class="link point__map" data-action="map">Показать на карте</a>
    <div class="photo photo--placeholder">
      <span class="photo__placeholder-icon" aria-hidden="true"></span>
    </div>
    <div class="stack">
      <button class="button primary" data-action="scan">Отсканировать точку</button>
      <button class="button secondary" data-action="route">Открыть весь маршрут</button>
    </div>
  `

  card.querySelector<HTMLAnchorElement>('[data-action="map"]')?.addEventListener('click', (event) => {
    event.preventDefault()
    state.currentFloor = point.map.floor
    state.screen = 'map'
    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="scan"]')?.addEventListener('click', () => {
    state.screen = 'scanner'
    rerender()
  })

  card.querySelector<HTMLButtonElement>('[data-action="route"]')?.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  return card
}
