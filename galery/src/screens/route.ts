import { points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import timelineImage1 from '../assets/timeline-01.svg'
import timelineImage2 from '../assets/timeline-02.svg'
import timelineImage3 from '../assets/timeline-03.svg'
import timelineImage4 from '../assets/timeline-04.svg'

export const renderRouteList = (): HTMLElement => {
  const timelineImages = [timelineImage1, timelineImage2, timelineImage3, timelineImage4]

  const container = document.createElement('div')
  container.className = 'route route--timeline'

  const collageImages = [timelineImage2, timelineImage1]

  container.innerHTML = `
    <header class="route__hero">
      <h1>Погрузитесь в историю</h1>
      <p class="route__subtitle">Нажмите на карточку, чтобы начать точку маршрута</p>
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
                  <span class="route-card__dot"></span>
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
        <h3>Создайте фото в историческом стиле!</h3>
        <p>В ИИ-фотозоне на 1 этаже, рядом с гардеробом</p>
      </div>
      <div class="route__footer-gallery">
        ${collageImages
          .map(
            (preview, index) =>
              `<div class="route__footer-thumb" aria-label="Фото-пример ${index + 1}">
                <img src="${preview}" alt="Пример фото ${index + 1}">
              </div>`,
          )
          .join('')}
      </div>
      <button class="route__text-button" type="button">Текст</button>
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

  const cta = createButton('Сканировать QR-код')
  cta.addEventListener('click', () => {
    state.screen = 'cameraPermission'
    rerender()
  })
  container.appendChild(cta)

  return container
}
