import mapFloor1 from '../assets/map-floor-1.svg'
import mapPhotoPlaceholder from '../assets/map-photo-placeholder.svg'
import { points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'

export const renderMap = (): HTMLElement => {
  const point = points[state.currentPointIndex]
  const previousPoint = state.currentPointIndex > 0 ? points[state.currentPointIndex - 1] : null
  const shouldShowFloors = previousPoint ? previousPoint.map.floor !== point.map.floor : false
  const activeFloor = shouldShowFloors ? state.currentFloor || point.map.floor : point.map.floor
  state.currentFloor = activeFloor

  const floorsMarkup = shouldShowFloors
    ? `<div class="map__floors">${[1, 2]
        .map(
          (floor) =>
            `<button class="map__floor${floor === state.currentFloor ? ' is-active' : ''}" type="button" data-floor="${floor}">Этаж ${floor}</button>`,
        )
        .join('')}</div>`
    : `<span class="map__floor-label">Этаж ${state.currentFloor}</span>`

  const planImages: Record<number, string | null> = {
    1: mapFloor1,
    2: null,
  }

  const page = document.createElement('div')
  page.className = 'map-sheet'
  page.innerHTML = `
    <div class="map-sheet__backdrop"></div>
    <section class="map map--sheet" data-drag-sheet>
      <div class="map__handle" data-drag-handle></div>
      <div class="map__header">
        <div>
          <p class="map__eyebrow">Карта</p>
          <h1>Этаж ${state.currentFloor}</h1>
        </div>
        ${floorsMarkup}
      </div>
      <p class="map__subtitle">План галереи с отмеченными точками маршрута.</p>
      <div class="map__content">
        <article class="map__info-card">
          <div class="map__photo">
            <img src="${mapPhotoPlaceholder}" alt="Фотография точки маршрута" />
          </div>
          <p class="map__point-label">Точка ${state.currentPointIndex + 1}</p>
          <h2 class="map__info-title">${point.title}</h2>
          <p class="map__info-desc">${point.description}</p>
          <div class="map__actions">
            <button class="button primary" data-action="focus">Перейти к точке</button>
            <button class="button secondary" data-action="route">Весь маршрут</button>
          </div>
        </article>
        <div class="map__viewport map__viewport--sheet">
          <div class="map__plan-image">
            ${planImages[activeFloor]
              ? `<img src="${planImages[activeFloor]}" alt="План ${activeFloor} этажа" />`
              : '<div class="map__plan-placeholder">План этажа скоро будет</div>'}
            <div class="map__marker-layer"></div>
          </div>
        </div>
      </div>
    </section>
  `

  const markerLayer = page.querySelector<HTMLDivElement>('.map__marker-layer')

  points
    .filter((item) => item.map.floor === state.currentFloor)
    .forEach((item) => {
      const originalIndex = points.findIndex((original) => original.id === item.id)
      const isActive = item.id === point.id
      const isComplete = viewedPoints.has(item.id)

      const statusMarkup = isComplete ? '<span class="map__marker-status">Пройдена</span>' : ''

      markerLayer?.insertAdjacentHTML(
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
      rerender()
    })
  })

  const closeMap = () => {
    state.screen = 'nextPoint'
    rerender()
  }

  const sheet = page.querySelector<HTMLElement>('[data-drag-sheet]')
  const handle = page.querySelector<HTMLElement>('[data-drag-handle]')

  let startY = 0
  let currentDelta = 0
  let isDragging = false

  const resetPosition = () => {
    if (sheet) {
      sheet.style.transition = 'transform 0.22s ease'
      sheet.style.transform = 'translateY(0)'
      window.setTimeout(() => {
        if (sheet) {
          sheet.style.transition = ''
        }
      }, 220)
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging || !sheet) return
    currentDelta = event.clientY - startY
    if (currentDelta < 0) {
      currentDelta = 0
    }
    sheet.style.transform = `translateY(${Math.min(currentDelta, 140)}px)`
  }

  const stopDragging = () => {
    if (!isDragging) return
    isDragging = false
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', stopDragging)

    if (currentDelta > 100) {
      closeMap()
    } else {
      resetPosition()
    }
  }

  const startDragging = (event: PointerEvent) => {
    if (!sheet) return
    isDragging = true
    startY = event.clientY
    currentDelta = 0
    sheet.style.transition = ''
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
  }

  handle?.addEventListener('pointerdown', startDragging)
  page.querySelector<HTMLDivElement>('.map-sheet__backdrop')?.addEventListener('click', closeMap)

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
