import { points } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { createButton } from '../ui'

export const renderMap = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const container = document.createElement('section')
  container.className = 'map'

  const title = document.createElement('h1')
  title.textContent = 'Карта музея'
  container.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'muted'
  subtitle.textContent = 'Передвигайте карту, чтобы найти нужную точку и нажмите на неё.'
  container.appendChild(subtitle)

  const viewport = document.createElement('div')
  viewport.className = 'map__viewport'

  const inner = document.createElement('div')
  inner.className = 'map__inner'
  const applyTransform = () => {
    inner.style.transform = `translate(${state.mapPosition.x}px, ${state.mapPosition.y}px)`
  }
  applyTransform()

  const grid = document.createElement('div')
  grid.className = 'map__grid'
  inner.appendChild(grid)

  const mapImage = document.createElement('div')
  mapImage.className = 'map__image'
  inner.appendChild(mapImage)

  points.forEach((item, index) => {
    const marker = document.createElement('button')
    marker.className = 'map__marker'
    marker.style.left = `${item.map.x}%`
    marker.style.top = `${item.map.y}%`
    marker.title = item.title
    marker.innerHTML = `<span class="map__marker-dot"></span><span class="map__marker-label">${index + 1}</span>`

    marker.addEventListener('click', (event) => {
      event.stopPropagation()
      state.currentPointIndex = index
      state.screen = 'nextPoint'
      rerender()
    })

    if (index === state.currentPointIndex) {
      marker.classList.add('is-active')
    }

    inner.appendChild(marker)
  })

  const dragState: { active: boolean; start: { x: number; y: number }; origin: { x: number; y: number } } = {
    active: false,
    start: { x: 0, y: 0 },
    origin: { x: 0, y: 0 },
  }

  const startDrag = (event: PointerEvent) => {
    dragState.active = true
    dragState.start = { x: event.clientX, y: event.clientY }
    dragState.origin = { ...state.mapPosition }
    viewport.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent) => {
    if (!dragState.active) return
    const deltaX = event.clientX - dragState.start.x
    const deltaY = event.clientY - dragState.start.y
    state.mapPosition = { x: dragState.origin.x + deltaX, y: dragState.origin.y + deltaY }
    applyTransform()
  }

  const endDrag = (event: PointerEvent) => {
    if (!dragState.active) return
    dragState.active = false
    viewport.releasePointerCapture(event.pointerId)
  }

  viewport.addEventListener('pointerdown', startDrag)
  viewport.addEventListener('pointermove', moveDrag)
  viewport.addEventListener('pointerup', endDrag)
  viewport.addEventListener('pointercancel', endDrag)

  viewport.appendChild(inner)
  container.appendChild(viewport)

  const hint = document.createElement('div')
  hint.className = 'map__hint'
  hint.innerHTML = '<span class="hint__icon">👆</span> Передвигайте карту и нажмите на точку маршрута'
  container.appendChild(hint)

  const actions = document.createElement('div')
  actions.className = 'stack'

  const focusButton = createButton(`Перейти к точке ${state.currentPointIndex + 1}`, 'primary')
  focusButton.addEventListener('click', () => {
    state.screen = 'nextPoint'
    rerender()
  })

  const routeButton = createButton('Открыть весь маршрут', 'secondary')
  routeButton.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  actions.appendChild(focusButton)
  actions.appendChild(routeButton)
  container.appendChild(actions)

  const caption = document.createElement('p')
  caption.className = 'muted'
  caption.textContent = `Текущая точка: ${point.title}`
  container.appendChild(caption)

  return container
}
