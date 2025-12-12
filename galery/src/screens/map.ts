import {initialMapPositions, points} from '../data'
import {rerender} from '../navigation'
import {state, viewedPoints} from '../state'
import floorPlanFirst from '../assets/floor-1.svg?raw'
import floorPlanSecond from '../assets/floor-2.svg?raw'
import floorPlanThird from '../assets/floor-3.svg?raw'
import {RoutePoint} from '../types'

type RenderMapOptions = {
    onClose?: () => void
    onFloorChange?: () => void
    onMarkerSelect?: (index: number) => void
}

const MAP_OVERLAY_CLASS = 'map-overlay-open'
const MAP_VIEWBOXES: Record<number, {width: number; height: number}> = {
    1: {width: 224, height: 653},
    2: {width: 254, height: 643},
    3: {width: 257, height: 643},
}

const resolveVisiblePoints = (): RoutePoint[] =>
    points.filter((item, index) => viewedPoints.has(item.id) || index === state.currentPointIndex)

const createPreviewMarkup = (point: RoutePoint, originalIndex: number, isComplete: boolean, isActive: boolean) => {
    if (isComplete && !isActive) {
        console.log(point.map.htmlY);
        return `
      <aside class="map__preview" aria-label="Точка ${originalIndex + 1} пройдена" style="top:${point.map.htmlDone}px">
        <div class="map__preview-info done">
        <div class="map__preview-label">Точка ${originalIndex + 1}</div>
          <div class="map__preview-title">Пройдена</div>
        </div>
      </aside>
    `
    }

    return `
    <aside class="map__preview${isActive ? ' is-active' : ''}" aria-label="Фото точки ${originalIndex + 1}" style="top:${point.map.htmlY}px">
      <div class="map__preview-media">
        <img src="${point.photo}" alt="${point.photoAlt || point.title}" loading="lazy" />
      </div>
      <div class="map__preview-info">
        <span class="map__preview-label">Точка ${originalIndex + 1}</span>
        <p class="map__preview-title">${point.title}</p>
      </div>
    </aside>
  `
}

const createMarkersSvg = (floorPoints: RoutePoint[], viewBox: {width: number; height: number}) => {
    const markerLineEnd = -6

    const markersMarkup = floorPoints
        .map((item) => {
            const originalIndex = points.findIndex((original) => original.id === item.id)
            const isActive = originalIndex === state.currentPointIndex
            const isComplete = viewedPoints.has(item.id)
            const label = originalIndex + 1
            const {x, y} = item.map
            const markerLineStart =  (x - 55 ) * -1;


            return `
        <g class="map__marker${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}" data-index="${originalIndex}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${item.title}">
          <line class="map__marker-line" x1="${markerLineStart}" y1="0" x2="${markerLineEnd}" y2="0" />
          <g filter="url(#map-marker-shadow)">
            <circle class="map__marker-dot" cx="0" cy="0" r="6" />
          </g>
        </g>
      `
        })
        .join('')

    return `
    <svg class="map__markers-layer" viewBox="0 0 ${viewBox.width} ${viewBox.height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <defs>
        <filter id="map-marker-shadow" x="-12" y="-12" width="36" height="36" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#111" flood-opacity="0.35" />
        </filter>
      </defs>
      ${markersMarkup}
    </svg>
  `
}

const removeExistingMap = () => {
    document.body.classList.remove(MAP_OVERLAY_CLASS)
    document.querySelector<HTMLElement>('.map-overlay-host')?.remove()
}

export const renderMap = (options?: RenderMapOptions): HTMLElement => {
    const point = points[state.currentPointIndex]
    const visiblePoints = resolveVisiblePoints()
    const floors = Array.from(new Set(visiblePoints.slice(-2).map((item) => item.map.floor))).sort((a, b) => a - b)
    const shouldShowFloors = floors.length > 1
    const activeFloor = floors.includes(state.currentFloor) ? state.currentFloor : point.map.floor
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

    const previewsMarkup = visiblePoints
        .filter((item) => item.map.floor === state.currentFloor)
        .map((item) => {
            const originalIndex = points.findIndex((original) => original.id === item.id)
            const isActive = originalIndex === state.currentPointIndex
            const isComplete = viewedPoints.has(item.id)

            return createPreviewMarkup(item, originalIndex, isComplete, isActive)
        })
        .join('')

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
        ${previewsMarkup}
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

    const markersContainer = page.querySelector<HTMLDivElement>('.map__markers')
    const viewBox = MAP_VIEWBOXES[state.currentFloor]

    if (markersContainer && viewBox) {
        const visiblePointsOnFloor = visiblePoints.filter((item) => item.map.floor === state.currentFloor)
        markersContainer.innerHTML = createMarkersSvg(visiblePointsOnFloor, viewBox)
    }

    const handleMarkerSelect = (originalIndex: number) => {
        state.currentPointIndex = originalIndex

        if (options?.onMarkerSelect) {
            options.onMarkerSelect(originalIndex)
        } else {
            state.screen = 'nextPoint'
            rerender()
        }
    }

    markersContainer?.querySelectorAll<SVGGElement>('.map__marker').forEach((marker) => {
        marker.addEventListener('click', (event) => {
            event.stopPropagation()
            const originalIndex = Number(marker.dataset.index)
            handleMarkerSelect(originalIndex)
        })

        marker.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                const originalIndex = Number(marker.dataset.index)
                handleMarkerSelect(originalIndex)
            }
        })
    })

    page.querySelectorAll<HTMLButtonElement>('.map__floor').forEach((floorButton) => {
        floorButton.addEventListener('click', () => {
            const floor = Number(floorButton.dataset.floor)
            state.currentFloor = floor
            if (!state.mapPositions[floor]) {
                state.mapPositions[floor] = initialMapPositions[floor] || {x: 0, y: 0}
            }

            if (options?.onFloorChange) {
                options.onFloorChange()
            } else {
                rerender()
            }
        })
    })

    const closeMap = () => {
        if (options?.onClose) {
            options.onClose()
            return
        }

        state.screen = 'nextPoint'
        rerender()
    }

    const mapSheet = page.querySelector<HTMLElement>('.map')
    const mapHandle = page.querySelector<HTMLElement>('.map__handle')

    if (mapSheet && mapHandle) {
        let startY = 0
        let currentY = 0
        let dragging = false

        // Swipe sensitivity: tweak CLOSE_DISTANCE_PX to change how far a finger must travel to dismiss.
        const CLOSE_DISTANCE_PX = 120

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
            // Drag offset is clamped so the sheet doesn't stretch too far during the swipe gesture
            currentY = Math.max(0, y - startY)
            mapSheet.style.transform = `translateY(${Math.min(currentY, 260)}px)`
        }

        const endDrag = () => {
            if (!dragging) return
            dragging = false
            const shouldClose = currentY > CLOSE_DISTANCE_PX
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

        mapHandle.addEventListener(
            'touchstart',
            (event) => {
                // preventDefault stops Chrome pull-to-refresh when the sheet is dragged from the top edge
                event.preventDefault()
                startDrag(event.touches[0]?.clientY || 0)
            },
            {passive: false},
        )

        window.addEventListener(
            'touchmove',
            (event) => {
                if (!dragging) return
                event.preventDefault()
                moveDrag(event.touches[0]?.clientY || 0)
            },
            {passive: false},
        )

        window.addEventListener('touchend', endDrag)
        window.addEventListener('touchcancel', endDrag)

        mapHandle.addEventListener('mousedown', (event) => {
            startDrag(event.clientY)
        })

        window.addEventListener('mousemove', (event) => {
            if (dragging) {
                moveDrag(event.clientY)
            }
        })

        window.addEventListener('mouseup', endDrag)
        window.addEventListener('mouseleave', endDrag)
    }

    return page
}

type MapOverlayOptions = {
    onMarkerSelect?: () => void
}

export const openMapOverlay = (options?: MapOverlayOptions) => {
    const host = document.createElement('div')
    host.className = 'map-overlay-host'

    const removeHost = () => {
        document.body.classList.remove(MAP_OVERLAY_CLASS)
        host.remove()
    }

    const renderOverlay = () => {
        host.innerHTML = ''
        const mapElement = renderMap({
            onClose: removeHost,
            onFloorChange: () => renderOverlay(),
            onMarkerSelect: () => {
                removeHost()
                options?.onMarkerSelect?.()
                rerender()
            },
        })

        host.appendChild(mapElement)
    }

    removeExistingMap()
    document.body.classList.add(MAP_OVERLAY_CLASS)
    host.addEventListener(
        'touchmove',
        (event) => {
            // Prevent touch drags on the overlay from delegating to the browser pull-to-refresh
            event.preventDefault()
        },
        {passive: false},
    )
    renderOverlay()
    document.querySelector('#app')?.appendChild(host)
}
