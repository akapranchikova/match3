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
  const section = document.createElement('section')
  section.className = 'card'

  const meta = document.createElement('div')
  meta.className = 'card__meta card__meta--inline'
  meta.textContent = 'Маршрут «Голос времени»'
  section.appendChild(meta)

  const h1 = document.createElement('h1')
  h1.textContent = point.title
  section.appendChild(h1)

  const p = document.createElement('p')
  p.textContent = point.description
  section.appendChild(p)

  const preview = document.createElement('div')
  preview.className = 'card__preview large'

  const image = document.createElement('img')
  image.src = routePreview
  image.alt = `Превью точки «${point.title}»`
  image.className = 'card__image'
  preview.appendChild(image)
  section.appendChild(preview)

  const finish = createButton('Закончить точку')
  finish.addEventListener('click', () => {
    handleFinishPoint()
    rerender()
  })
  section.appendChild(finish)

  return section
}

export const renderInfoComplete = (): HTMLElement => {
  const remaining = points.length - viewedPoints.size
  const overlay = document.createElement('div')
  overlay.className = 'overlay'

  const modal = document.createElement('div')
  modal.className = 'modal'

  const title = document.createElement('h2')
  title.textContent = 'Хотите ли продолжить экскурсию от Голоса времени?'
  modal.appendChild(title)

  const meta = document.createElement('p')
  meta.textContent = remaining > 0 ? `Впереди ещё ${remaining} истории` : 'Вы посмотрели все точки маршрута.'
  modal.appendChild(meta)

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

  modal.appendChild(primary)
  modal.appendChild(secondary)
  overlay.appendChild(modal)
  return overlay
}

export const renderNextPoint = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const card = document.createElement('section')
  card.className = 'card card--point'

  const progress = document.createElement('p')
  progress.className = 'caption'
  progress.textContent = `Пройдено ${viewedPoints.size} из ${points.length} точек`
  card.appendChild(progress)

  const h1 = document.createElement('h1')
  h1.textContent = `Где находится точка ${state.currentPointIndex + 1}?`
  card.appendChild(h1)

  const desc = document.createElement('p')
  desc.className = 'point__description'
  desc.textContent = point.description
  card.appendChild(desc)

  const mapLink = document.createElement('a')
  mapLink.href = '#'
  mapLink.className = 'link point__map'
  mapLink.textContent = 'Показать на карте'
  mapLink.addEventListener('click', (event) => {
    event.preventDefault()
    state.screen = 'map'
    rerender()
  })
  card.appendChild(mapLink)

  const image = document.createElement('div')
  image.className = 'photo photo--placeholder'

  const photoIcon = document.createElement('span')
  photoIcon.className = 'photo__placeholder-icon'
  photoIcon.setAttribute('aria-hidden', 'true')
  image.appendChild(photoIcon)
  card.appendChild(image)

  const actions = document.createElement('div')
  actions.className = 'stack'

  const scan = createButton('Отсканировать точку')
  scan.addEventListener('click', () => {
    state.screen = 'scanner'
    rerender()
  })

  const routeButton = createButton('Открыть весь маршрут', 'secondary')
  routeButton.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })
  actions.appendChild(scan)
  actions.appendChild(routeButton)
  card.appendChild(actions)

  return card
}
