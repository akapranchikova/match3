import { points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import routePreview from '../assets/onboarding-photo.svg'

export const renderRouteList = (): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'route'

  const h1 = document.createElement('h1')
  h1.textContent = 'Начнём же маршрут!'
  container.appendChild(h1)

  const subtitle = document.createElement('p')
  subtitle.className = 'muted'
  subtitle.textContent = 'Сканируйте QR-код в зале или выберите точку здесь'
  container.appendChild(subtitle)

  const list = document.createElement('div')
  list.className = 'route__list'

  points.forEach((point, index) => {
    const item = document.createElement('article')
    item.className = 'route__item'

    const thumb = document.createElement('div')
    thumb.className = 'route__thumb'

    const image = document.createElement('img')
    image.src = routePreview
    image.alt = `Маршрутная точка ${index + 1}`
    image.className = 'route__image'
    thumb.appendChild(image)

    const info = document.createElement('div')
    info.className = 'route__info'

    const title = document.createElement('h3')
    title.textContent = point.title
    info.appendChild(title)

    if (viewedPoints.has(point.id)) {
      const status = document.createElement('span')
      status.className = 'status status--done'
      status.textContent = 'Просмотрено'
      info.appendChild(status)
    }

    item.appendChild(thumb)
    item.appendChild(info)

    item.addEventListener('click', () => {
      state.currentPointIndex = index
      state.screen = 'pointInfo'
      rerender()
    })

    list.appendChild(item)
  })

  container.appendChild(list)

  const promo = document.createElement('div')
  promo.className = 'promo'
  promo.innerHTML = `<h3>Создайте фото в историческом стиле!</h3><p>В ИИ-фотозоне на 1 этаже, рядом с гардеробом</p>`
  container.appendChild(promo)

  const cta = createButton('Сканировать QR-код')
  cta.addEventListener('click', () => {
    state.screen = 'scanner'
    rerender()
  })
  container.appendChild(cta)

  return container
}
