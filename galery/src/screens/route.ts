import { points } from '../data'
import { rerender } from '../navigation'
import { getFirstUnviewedPointIndex, isRouteCompleted, resetProgress, state, viewedPoints } from '../state'
import { createButton } from '../ui'
import routeImage1 from '../assets/boarding-1/photo-1.jpg'
import routeImage2 from '../assets/boarding-1/photo-3.jpg'
import routeImage3 from '../assets/route/route-3.jpg'
import routeImage4 from '../assets/boarding-1/photo-2.jpg'
import routeImage5 from '../assets/route/route-5.jpg'
import routeImage6 from '../assets/route/route-6.jpg'
export const renderRouteList = (): HTMLElement => {
  const timelineImages = [routeImage1, routeImage2, routeImage3, routeImage4, routeImage5, routeImage6]

  const container = document.createElement('div')
  container.className = 'route route--timeline'

  const collageImages = [routeImage1, routeImage2]

  container.innerHTML = `
    <header class="route__hero">
      <h1>Погрузитесь в историю</h1>
      <p class="route__subtitle">Нажмите на карточку, чтобы погрузиться в эпоху</p>
    </header>
    <div class="route__timeline">
      <div class="route__items">
        ${points
          .map((point, index) => {
            const image = timelineImages[index % timelineImages.length]
            const viewed = viewedPoints.has(point.id)

            return `
              <article class="route-card" data-index="${index}">
                <div class="route-card__indicator">
                  <span class="route-card__period">${point.period || '21 век'}</span>
                     <div class="route-card__info">
                    <h3 class="route-card__title">${point.title}</h3>
                    ${viewed ? '<span class="route-card__status">Просмотрено</span>' : ''}
                  </div>
                </div>
                <div class="route-card__body">
                  <div class="route-card__media">
                    <img src="${image}" alt="${point.photoAlt || `Маршрутная точка ${index + 1}`}" class="route-card__image" width="175" height="200">
                  </div>
                </div>
              </article>
            `
          })
          .join('')}
      </div>
    </div>
    <div class="route__footer">
      <div class="route__footer-text">
        <h3>Создайте фото в историческом стиле!</h3>
        <p>В ИИ-фотозоне на 1 этаже, рядом с гардеробом</p>
      </div>
      <div class="route__footer-gallery">
        ${collageImages
          .map(
            (preview, index) =>
              `<div class="route__footer-thumb ${index ? 'second' : ''}" aria-label="Фото-пример ${index + 1}">
                <img src="${preview}" alt="Пример фото ${index + 1}">
              </div>`,
          )
          .join('')}
      </div>
    </div>
  `

  container.querySelectorAll<HTMLElement>('.route-card').forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.index)
      state.currentPointIndex = index
      state.screen = 'pointContent'
      state.currentContentIndex = 0
      rerender()
    })
  })

  const cta = createButton('Пройти маршрут с Гидом')
  cta.addEventListener('click', () => {
    state.routeMode = 'guide'

    if (isRouteCompleted()) {
      resetProgress()
    }

    const nextPointIndex = getFirstUnviewedPointIndex()
    state.currentPointIndex = nextPointIndex
    state.screen = 'nextPoint'
    rerender()
  })
  container.appendChild(cta)

  return container
}
