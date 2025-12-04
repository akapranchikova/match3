import { initialMapPositions, points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'

export const renderMap = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const previousPoint = state.currentPointIndex > 0 ? points[state.currentPointIndex - 1] : null
  const shouldShowFloors = previousPoint ? previousPoint.map.floor !== point.map.floor : false
  const activeFloor = shouldShowFloors ? state.currentFloor || point.map.floor : point.map.floor
  state.currentFloor = activeFloor

  if (!state.mapPositions[state.currentFloor]) {
    state.mapPositions[state.currentFloor] = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }
  }

  const defaultPosition = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }

  const createSegments = (floor: number) =>
    (floor === 1
      ? [
          { top: '6%', left: '32%', width: '22%', height: '34%' },
          { top: '34%', left: '10%', width: '48%', height: '26%' },
          { top: '48%', left: '30%', width: '30%', height: '36%' },
          { top: '62%', left: '8%', width: '30%', height: '26%' },
        ]
      : [
          { top: '10%', left: '38%', width: '22%', height: '28%' },
          { top: '34%', left: '30%', width: '26%', height: '26%' },
          { top: '52%', left: '14%', width: '42%', height: '24%' },
        ]
    )
      .map(
        (style) =>
          `<div class="map__segment" style="top:${style.top};left:${style.left};width:${style.width};height:${style.height};"></div>`,
      )
      .join('')

  const createPlanMarkup = (floor: number) => `
    <div class="map__plan map__plan--${floor}${floor === state.currentFloor ? ' is-active' : ''}">
      <div class="map__outline"></div>
      ${createSegments(floor)}
      <div class="map__path"></div>
    </div>
  `

  const floorsMarkup = shouldShowFloors
    ? `<div class="map__floors">${[1, 2]
        .map(
          (floor) =>
            `<button class="map__floor${floor === state.currentFloor ? ' is-active' : ''}" type="button" data-floor="${floor}">Этаж ${floor}</button>`,
        )
        .join('')}</div>`
    : `<span class="map__floor-label">Этаж ${state.currentFloor}</span>`

  const page = document.createElement('div')
  page.className = 'map-screen'
  page.innerHTML = `
    <section class="map map--sheet">
      <div class="map__handle"></div>
      <div class="map__header">
        <h1>Карта</h1>
        ${floorsMarkup}
      </div>
      <p class="map__subtitle">Фиксированный план этажа с отмеченными точками маршрута.</p>
      <div class="map__viewport">
  
      </div>
    </section>
  `

  const inner = page.querySelector<HTMLDivElement>('.map__inner')

  points
    .filter((item) => item.map.floor === state.currentFloor)
    .forEach((item) => {
      const originalIndex = points.findIndex((original) => original.id === item.id)
      const isActive = item.id === point.id
      const isComplete = viewedPoints.has(item.id)

      const statusMarkup = isComplete ? '<span class="map__marker-status">Пройдена</span>' : ''

      inner?.insertAdjacentHTML(
        'beforeend',
        `
        <button class="map__marker${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}" style="left:${item.map.x}%;top:${item.map.y}%;" title="${item.title}" data-index="${originalIndex}">
          <span class="map__marker-dot"></span>
          <span class="map__marker-label">${originalIndex + 1}</span>
          ${statusMarkup}
        </button>
      `,
      )
    })

  page.querySelectorAll<HTMLButtonElement>('.map__marker').forEach((marker) => {
    marker.addEventListener('click', (event) => {
      event.stopPropagation()
      const originalIndex = Number(marker.dataset.index)
      state.currentPointIndex = originalIndex
      state.screen = 'nextPoint'
      rerender()
    })
  })

  page.querySelectorAll<HTMLButtonElement>('.map__floor').forEach((floorButton) => {
    floorButton.addEventListener('click', () => {
      const floor = Number(floorButton.dataset.floor)
      state.currentFloor = floor
      if (!state.mapPositions[floor]) {
        state.mapPositions[floor] = initialMapPositions[floor] || { x: 0, y: 0 }
      }
      rerender()
    })
  })

  page.querySelector<HTMLButtonElement>('[data-action="focus"]')?.addEventListener('click', () => {
    state.screen = 'nextPoint'
    rerender()
  })

  page.querySelector<HTMLButtonElement>('[data-action="route"]')?.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })

  return page
}
