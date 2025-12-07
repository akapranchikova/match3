import {initialMapPositions, points} from '../data'
import {rerender} from '../navigation'
import {state, viewedPoints} from '../state'
import floorPlanFirst from '../assets/floor-1.svg?raw'
import floorPlanSecond from '../assets/floor-2.svg?raw'
import floorPlanThird from '../assets/floor-3.svg?raw'

export const renderMap = (): HTMLElement => {
    const point = points[state.currentPointIndex]
    const floors = Array.from(new Set(points.map((item) => item.map.floor))).sort((a, b) => a - b)
    const activeFloor = floors.includes(state.currentFloor) ? state.currentFloor : point.map.floor
    const shouldShowFloors = floors.length > 1
    state.currentFloor = activeFloor

    if (!state.mapPositions[state.currentFloor]) {
        state.mapPositions[state.currentFloor] = initialMapPositions[state.currentFloor] || {x: 0, y: 0}
    }

    const defaultPosition = initialMapPositions[state.currentFloor] || {x: 0, y: 0}
    const mapPosition = state.mapPositions[state.currentFloor] || defaultPosition

    const floorPlanSvgs: Record<number, string> = {
        // Вставьте SVG плана первого этажа вместо содержимого файла floor-1.svg
        1: floorPlanFirst,
        // При необходимости замените второй этаж на свой SVG в файле floor-2.svg
        2: floorPlanSecond,
        3: floorPlanThird,
    }

    const createPlanMarkup = (floor: number) => `
    <div class="map__plan map__plan--${floor}${floor === state.currentFloor ? ' is-active' : ''}">
      <div class="map__plan-svg">${floorPlanSvgs[floor] || ''}</div>
    </div>
  `

    const floorsMarkup = shouldShowFloors
        ? `<div class="map__floors">${floors
            .map(
                (floor) =>
                    `<button class="map__floor${floor === state.currentFloor ? ' is-active' : ''}" type="button" data-floor="${floor}">Этаж ${floor}</button>`,
            )
            .join('')}</div>`
        : `<span class="map__floor-label">Этаж ${state.currentFloor}</span>`

    const page = document.createElement('div')
    page.className = 'map-screen'
    page.innerHTML = `
    <div class="map-screen__backdrop"></div>
    <section class="map map--sheet" role="dialog" aria-label="Карта галереи">
      <div class="map__handle" aria-hidden="true"></div>
      <div class="map__body">
      <div class="map__header">
        <div class="map__title-group">
          <h1>Карта</h1>
        </div>
      </div>
      <div class="map__viewport">
        <div class="map__floor-toggle">${floorsMarkup}</div>
        <div class="map__inner">
          <div class="map__grid"></div>
          ${floors.map((floor) => createPlanMarkup(floor)).join('')}
          <div class="map__markers"></div>
        </div>
      </div>
</div>   
    </section>
  `

    const inner = page.querySelector<HTMLDivElement>('.map__markers')

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
                state.mapPositions[floor] = initialMapPositions[floor] || {x: 0, y: 0}
            }
            rerender()
        })
    })

    const closeMap = () => {
        state.screen = 'nextPoint'
        rerender()
    }

    const mapSheet = page.querySelector<HTMLElement>('.map')
    if (mapSheet) {
        let startY = 0
        let currentY = 0
        let dragging = false

        const resetTransform = () => {
            mapSheet.style.transition = ''
            mapSheet.style.transform = ''
        }

        const startDrag = (y: number) => {
            dragging = true
            startY = y
            mapSheet.style.transition = 'none'
        }

        const moveDrag = (y: number) => {
            if (!dragging) return
            currentY = Math.max(0, y - startY)
            mapSheet.style.transform = `translateY(${Math.min(currentY, 260)}px)`
        }

        const endDrag = () => {
            if (!dragging) return
            dragging = false
            const shouldClose = currentY > 120
            mapSheet.style.transition = 'transform 0.25s ease'

            if (shouldClose) {
                mapSheet.style.transform = 'translateY(110%)'
                mapSheet.addEventListener('transitionend', closeMap, {once: true})
            } else {
                mapSheet.style.transform = 'translateY(0)'
                setTimeout(() => {
                    resetTransform()
                    currentY = 0
                }, 250)
            }
        }

        mapSheet.addEventListener('touchstart', (event) => {
            startDrag(event.touches[0]?.clientY || 0)
        })

        mapSheet.addEventListener('touchmove', (event) => {
            moveDrag(event.touches[0]?.clientY || 0)
        })

        mapSheet.addEventListener('touchend', endDrag)
        mapSheet.addEventListener('touchcancel', endDrag)

        mapSheet.addEventListener('mousedown', (event) => {
            startDrag(event.clientY)
        })

        mapSheet.addEventListener('mousemove', (event) => {
            if (dragging) {
                moveDrag(event.clientY)
            }
        })

        mapSheet.addEventListener('mouseup', endDrag)
        mapSheet.addEventListener('mouseleave', endDrag)
    }

    return page
}
