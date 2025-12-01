import { initialMapPositions, points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'

export const renderMap = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const activeFloor = point.map.floor
  state.currentFloor = state.currentFloor || activeFloor

  if (!state.mapPositions[state.currentFloor]) {
    state.mapPositions[state.currentFloor] = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }
  }

  const container = document.createElement('section')
  container.className = 'map'

  const header = document.createElement('div')
  header.className = 'map__header'

  const title = document.createElement('h1')
  title.textContent = 'Карта музея'
  header.appendChild(title)

  const floorSwitcher = document.createElement('div')
  floorSwitcher.className = 'map__floors'

  ;[1, 2].forEach((floor) => {
    const floorButton = document.createElement('button')
    floorButton.type = 'button'
    floorButton.className = 'map__floor'
    if (floor === state.currentFloor) floorButton.classList.add('is-active')
    floorButton.textContent = `Этаж ${floor}`
    floorButton.addEventListener('click', () => {
      state.currentFloor = floor
      if (!state.mapPositions[floor]) {
        state.mapPositions[floor] = initialMapPositions[floor] || { x: 0, y: 0 }
      }
      rerender()
    })
    floorSwitcher.appendChild(floorButton)
  })

  header.appendChild(floorSwitcher)
  container.appendChild(header)

  const subtitle = document.createElement('p')
  subtitle.className = 'muted'
  subtitle.textContent = 'Передвигайте карту, чтобы найти нужную точку и нажмите на неё.'
  container.appendChild(subtitle)

  const viewport = document.createElement('div')
  viewport.className = 'map__viewport'

  const inner = document.createElement('div')
  inner.className = 'map__inner'
  const applyTransform = () => {
    const position = state.mapPositions[state.currentFloor] || { x: 0, y: 0 }
    inner.style.transform = `translate(${position.x}px, ${position.y}px)`
  }
  applyTransform()

  const grid = document.createElement('div')
  grid.className = 'map__grid'
  inner.appendChild(grid)

  const createPlan = (floor: number) => {
    const plan = document.createElement('div')
    plan.className = `map__plan map__plan--${floor}`
    if (floor === state.currentFloor) plan.classList.add('is-active')

    const outline = document.createElement('div')
    outline.className = 'map__outline'
    plan.appendChild(outline)

    const segments: Array<{ className: string; style: Partial<CSSStyleDeclaration> }> =
      floor === 1
        ? [
            { className: 'map__segment', style: { top: '6%', left: '32%', width: '22%', height: '34%' } },
            { className: 'map__segment', style: { top: '34%', left: '10%', width: '48%', height: '26%' } },
            { className: 'map__segment', style: { top: '48%', left: '30%', width: '30%', height: '36%' } },
            { className: 'map__segment', style: { top: '62%', left: '8%', width: '30%', height: '26%' } },
          ]
        : [
            { className: 'map__segment', style: { top: '10%', left: '38%', width: '22%', height: '28%' } },
            { className: 'map__segment', style: { top: '34%', left: '30%', width: '26%', height: '26%' } },
            { className: 'map__segment', style: { top: '52%', left: '14%', width: '42%', height: '24%' } },
          ]

    segments.forEach(({ className, style }) => {
      const segment = document.createElement('div')
      segment.className = className
      Object.assign(segment.style, style)
      plan.appendChild(segment)
    })

    const path = document.createElement('div')
    path.className = 'map__path'
    plan.appendChild(path)

    return plan
  }

  const plans = [createPlan(1), createPlan(2)]
  plans.forEach((plan) => inner.appendChild(plan))

  points
    .filter((item) => item.map.floor === state.currentFloor)
    .forEach((item) => {
      const marker = document.createElement('button')
      marker.className = 'map__marker'
      marker.style.left = `${item.map.x}%`
      marker.style.top = `${item.map.y}%`
      marker.title = item.title
      const originalIndex = points.findIndex((original) => original.id === item.id)
      marker.innerHTML = `<span class="map__marker-dot"></span><span class="map__marker-label">${originalIndex + 1}</span>`

      marker.addEventListener('click', (event) => {
        event.stopPropagation()
        state.currentPointIndex = originalIndex
        state.screen = 'nextPoint'
        rerender()
      })

      if (item.id === point.id) {
        marker.classList.add('is-active')
      }

      if (viewedPoints.has(item.id)) {
        marker.classList.add('is-complete')
        const status = document.createElement('span')
        status.className = 'map__marker-status'
        status.textContent = 'Пройдена'
        marker.appendChild(status)
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
    dragState.origin = { ...(state.mapPositions[state.currentFloor] || { x: 0, y: 0 }) }
    viewport.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent) => {
    if (!dragState.active) return
    const deltaX = event.clientX - dragState.start.x
    const deltaY = event.clientY - dragState.start.y
    state.mapPositions[state.currentFloor] = { x: dragState.origin.x + deltaX, y: dragState.origin.y + deltaY }
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
