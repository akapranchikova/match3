import { points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import routePreview from '../assets/onboarding-photo.svg'

export const renderRouteList = (): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'route'

  container.innerHTML = `
    <h1>Начнём же маршрут!</h1>
    <p class="muted">Сканируйте QR-код в зале или выберите точку здесь</p>
    <div class="route__list">
      ${points
        .map(
          (point, index) => `
            <article class="route__item" data-index="${index}">
              <div class="route__thumb">
                <img src="${routePreview}" alt="Маршрутная точка ${index + 1}" class="route__image">
              </div>
              <div class="route__info">
                <h3>${point.title}</h3>
                ${viewedPoints.has(point.id) ? '<span class="status status--done">Просмотрено</span>' : ''}
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
    <div class="promo"><h3>Создайте фото в историческом стиле!</h3><p>В ИИ-фотозоне на 1 этаже, рядом с гардеробом</p></div>
  `

  container.querySelectorAll<HTMLElement>('.route__item').forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.index)
      state.currentPointIndex = index
      state.screen = 'pointInfo'
      rerender()
    })
  })

  const cta = createButton('Сканировать QR-код')
  cta.addEventListener('click', () => {
    state.screen = 'scanner'
    rerender()
  })
  container.appendChild(cta)

  return container
}
