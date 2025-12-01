import { initialMapPositions, points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'

export const renderMap = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const previousPoint = state.currentPointIndex > 0 ? points[state.currentPointIndex - 1] : null
  const shouldShowFloors = previousPoint ? previousPoint.map.floor !== point.map.floor : false
  const activeFloor = shouldShowFloors ? state.currentFloor || point.map.floor : point.map.floor
  state.currentFloor = activeFloor

  if (!state.mapPositions[state.currentFloor]) {
    state.mapPositions[state.currentFloor] = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }
  }

  const page = document.createElement('div')
  page.className = 'map-screen'

  const container = document.createElement('section')
  container.className = 'map map--sheet'

  let dragStartY = 0
  let dragOffsetY = 0
  let isDragging = false

  const resetDragStyles = () => {
    container.style.transition = ''
    container.style.transform = ''
    container.style.opacity = ''
  }

  const closeMap = () => {
    state.screen = 'nextPoint'
    rerender()
  }

  const endDrag = () => {
    if (!isDragging) return

    if (dragOffsetY > 120) {
      closeMap()
    } else {
      container.style.transition = 'transform 0.18s ease, opacity 0.18s ease'
      container.style.transform = 'translateY(0)'
      container.style.opacity = '1'
      setTimeout(resetDragStyles, 200)
    }

    dragStartY = 0
    dragOffsetY = 0
    isDragging = false
  }

  const moveDrag = (clientY: number) => {
    if (!isDragging) return

    dragOffsetY = Math.max(0, clientY - dragStartY)
    container.style.transform = `translateY(${dragOffsetY}px)`
    container.style.opacity = `${Math.max(0.6, 1 - dragOffsetY / 260)}`
  }

  const startDrag = (clientY: number) => {
    isDragging = true
    dragStartY = clientY
  }

  const handle = document.createElement('div')
  handle.className = 'map__handle'
  container.appendChild(handle)

  const onPointerDown = (event: PointerEvent) => {
    startDrag(event.clientY)
  }

  const onPointerMove = (event: PointerEvent) => {
    moveDrag(event.clientY)
  }

  handle.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerup', endDrag)
  container.addEventListener('pointercancel', endDrag)
  handle.addEventListener('pointerup', endDrag)
  handle.addEventListener('pointercancel', endDrag)

  handle.addEventListener('touchstart', (event) => startDrag(event.touches[0].clientY))
  handle.addEventListener('touchmove', (event) => moveDrag(event.touches[0].clientY))
  handle.addEventListener('touchend', endDrag)
  handle.addEventListener('touchcancel', endDrag)

  const header = document.createElement('div')
  header.className = 'map__header'

  const title = document.createElement('h1')
  title.textContent = 'Карта'
  header.appendChild(title)

  if (shouldShowFloors) {
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
  } else {
    const floorLabel = document.createElement('span')
    floorLabel.className = 'map__floor-label'
    floorLabel.textContent = `Этаж ${state.currentFloor}`
    header.appendChild(floorLabel)
  }
  container.appendChild(header)

  const viewport = document.createElement('div')
  viewport.className = 'map__viewport'

  const inner = document.createElement('div')
  inner.className = 'map__inner'
  const defaultPosition = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }
  inner.style.left = '50%'
  inner.style.top = '50%'
  inner.style.transform = `translate(calc(-50% + ${defaultPosition.x}px), calc(-50% + ${defaultPosition.y}px))`

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

  viewport.appendChild(inner)
  container.appendChild(viewport)

  page.appendChild(container)

  return page
}
