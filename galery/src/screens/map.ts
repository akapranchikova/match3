
import { initialMapPositions, points } from '../data'
import { rerender } from '../navigation'
import { state, viewedPoints } from '../state'
import floorPlanFirst from '../assets/floor-1.svg?raw'
import floorPlanSecond from '../assets/floor-2.svg?raw'
import floorPlanThird from '../assets/floor-3.svg?raw'
import { RoutePoint } from '../types'

type MapDataOptions = {
    pointsOverride?: RoutePoint[]
    currentPointIndex?: number
    initialFloor?: number
}

type RenderMapOptions = MapDataOptions & {
    onClose?: () => void
    onFloorChange?: () => void
    onMarkerSelect?: (index: number) => void
}

const MAP_OVERLAY_CLASS = 'map-overlay-open'

/**
 * Single-SVG implementation:
 * Floor plan SVG + marker layer live inside ONE <svg viewBox="...">, so they never drift.
 */
const MAP_VIEWBOXES: Record<number, { width: number; height: number }> = {
    1: { width: 258, height: 652 },
    2: { width: 248, height: 642 },
    3: { width: 248, height: 642 },
}

const resolveVisiblePoints = (
    mapPoints: RoutePoint[],
    currentPointIndex: number,
    isDefaultPoints: boolean,
): RoutePoint[] => {
    if (!isDefaultPoints) return mapPoints
    return mapPoints.filter((item, index) => viewedPoints.has(item.id) || index === currentPointIndex)
}

const resolvePreviewTop = (point: RoutePoint, target: 'htmlY' | 'htmlDone') => {
    const viewBox = MAP_VIEWBOXES[point.map.floor]
    if (!viewBox) return `${point.map[target]}px`
    const percent = (point.map[target] / viewBox.height) * 100
    return `calc(${percent}% + var(--map-vertical-offset, 0px))`
}

const createPreviewMarkup = (point: RoutePoint, originalIndex: number, isComplete: boolean, isActive: boolean) => {
    const previewTop = resolvePreviewTop(point, 'htmlY')
    const donePreviewTop = resolvePreviewTop(point, 'htmlDone')

    if (isComplete && !isActive) {
        return `
      <aside class="map__preview" aria-label="Точка ${originalIndex + 1} пройдена" style="top:${donePreviewTop}">
        <div class="map__preview-info done">
          <div class="map__preview-label">Точка ${originalIndex + 1}</div>
          <div class="map__preview-title">Пройдена</div>
        </div>
      </aside>
    `
    }

    return `
    <aside class="map__preview${isActive ? ' is-active' : ''}" aria-label="Фото точки ${originalIndex + 1}" style="top:${previewTop}">
      <div class="map__preview-media">
        <img src="${point.photo}" alt="${point.photoAlt || point.title}" loading="lazy" />
      </div>
      <div class="map__preview-info">
        <span class="map__preview-label">${point.id === 'photo-zone' ? point.photoAlt : 'Точка ' + (originalIndex + 1)}</span>
        <p class="map__preview-title">${point.title}</p>
      </div>
    </aside>
  `
}

const extractSvgInner = (svgRaw: string) => {
    try {
        const doc = new DOMParser().parseFromString(svgRaw, 'image/svg+xml')
        const svg = doc.querySelector('svg')
        if (!svg) return svgRaw
        return svg.innerHTML || ''
    } catch {
        const m = svgRaw.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i)
        return m ? m[1] : svgRaw
    }
}

const createMarkersMarkup = (floorPoints: RoutePoint[], mapPoints: RoutePoint[], activeIndex: number) => {
    return floorPoints
        .map((item) => {
            const originalIndex = mapPoints.findIndex((original) => original.id === item.id)
            const isActive = originalIndex === activeIndex
            const isComplete = viewedPoints.has(item.id)
            const { x, y } = item.map
            const markerLineStart =  (x - 80 ) * -1;

            return `
        <g class="map__marker${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}"
           data-index="${originalIndex}"
           transform="translate(${x} ${y})"
           role="button"
           tabindex="0"
           aria-label="${item.title}">
          <g ${isActive ? 'filter="url(#map-marker-light)"' : ''}>
          <line class="map__marker-line" x1="${markerLineStart}" y1="0" x2="-6" y2="0" />
            <circle cx="0" cy="0" r="6" fill="#E2E2E2" />
          </g>
        </g>
      `
        })
        .join('')
}

const createCombinedSvgMarkup = (args: {
    floorSvgRaw: string
    viewBox: { width: number; height: number }
    markersMarkup: string
}) => {
    const planInner = extractSvgInner(args.floorSvgRaw)

    return `
    <svg class="map__svg"
         viewBox="0 0 ${args.viewBox.width} ${args.viewBox.height}"
         preserveAspectRatio="xMidYMid meet"
         xmlns="http://www.w3.org/2000/svg"
         role="presentation">
      <defs>
        <filter id="map-marker-light" x="-22" y="-22" width="44" height="44" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect1_dropShadow"/>
          <feOffset/>
          <feGaussianBlur stdDeviation="6"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0.623529 0 0 0 0 0.988235 0 0 0 0 0.788235 0 0 0 1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>

      <g class="map__plan-layer">${planInner}</g>
      <g class="map__markers-layer">${args.markersMarkup}</g>
    </svg>
  `
}

let mapResizeCleanup: (() => void) | null = null

const removeExistingMap = () => {
    document.body.classList.remove(MAP_OVERLAY_CLASS)
    mapResizeCleanup?.()
    mapResizeCleanup = null
    document.querySelector<HTMLElement>('.map-overlay-host')?.remove()
}

export const renderMap = (options?: RenderMapOptions): HTMLElement => {
    const mapPoints = options?.pointsOverride ?? points
    const isDefaultPoints = !options?.pointsOverride

    const currentPointIndex = Math.max(
        0,
        Math.min(options?.currentPointIndex ?? state.currentPointIndex, Math.max(mapPoints.length - 1, 0)),
    )

    const point = mapPoints[currentPointIndex]
    const visiblePoints = resolveVisiblePoints(mapPoints, currentPointIndex, isDefaultPoints)

    const floors = Array.from(
        new Set((isDefaultPoints ? visiblePoints.slice(-2) : visiblePoints).map((item) => item.map.floor)),
    ).sort((a, b) => a - b)

    const shouldShowFloors = floors.length > 1
    const preferredFloor = options?.initialFloor ?? point?.map.floor ?? floors[0]
    const fallbackFloor = preferredFloor ?? state.currentFloor ?? 1

    const activeFloor =
        floors.includes(state.currentFloor) && isDefaultPoints
            ? state.currentFloor
            : floors.includes(fallbackFloor)
                ? fallbackFloor
                : floors[0] ?? 1

    state.currentFloor = activeFloor

    if (!state.mapPositions[state.currentFloor]) {
        state.mapPositions[state.currentFloor] = initialMapPositions[state.currentFloor] || { x: 0, y: 0 }
    }

    const floorPlanSvgs: Record<number, string> = {
        1: floorPlanFirst,
        2: floorPlanSecond,
        3: floorPlanThird,
    }

    const floorsMarkup = shouldShowFloors
        ? `<div class="map__floors">${floors
            .map(
                (floor) =>
                    `<button class="map__floor${floor === state.currentFloor ? ' is-active' : ''}" type="button" data-floor="${floor}">Этаж ${floor}</button>`,
            )
            .join('')}</div>`
        : `<span class="map__floor-label">Этаж ${state.currentFloor}</span>`

    mapResizeCleanup?.()
    mapResizeCleanup = null

    const previewsMarkup = visiblePoints
        .filter((item) => item.map.floor === state.currentFloor)
        .map((item) => {
            const originalIndex = mapPoints.findIndex((original) => original.id === item.id)
            const isActive = originalIndex === currentPointIndex
            const isComplete = viewedPoints.has(item.id)
            return createPreviewMarkup(item, originalIndex, isComplete, isActive)
        })
        .join('')

    const viewBox = MAP_VIEWBOXES[state.currentFloor]
    const floorSvgRaw = floorPlanSvgs[state.currentFloor] || ''
    const visiblePointsOnFloor = visiblePoints.filter((item) => item.map.floor === state.currentFloor)
    const markersMarkup = createMarkersMarkup(visiblePointsOnFloor, mapPoints, currentPointIndex)
    const combinedSvgMarkup = viewBox
        ? createCombinedSvgMarkup({ floorSvgRaw, viewBox, markersMarkup })
        : floorSvgRaw

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
          <div class="map__hint" role="note">
            <span class="map__hint-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.125 10C5.275 11.0667 4.625 12.2417 4.175 13.525C3.725 14.8083 3.5 16.1333 3.5 17.5C3.5 17.95 3.525 18.4 3.575 18.85C3.625 19.3 3.7 19.75 3.8 20.2L2.05 18.45L1 19.5L4.5 23L8 19.5L6.95 18.45L5.325 20.05C5.20833 19.6333 5.125 19.2125 5.075 18.7875C5.025 18.3625 5 17.9333 5 17.5C5 16.3333 5.1875 15.2042 5.5625 14.1125C5.9375 13.0208 6.48333 12.0083 7.2 11.075L6.125 10ZM16.45 3.175C16.0667 3.04167 15.6792 2.97917 15.2875 2.9875C14.8958 2.99583 14.5167 3.09167 14.15 3.275L7.6 6.325L8.05 7.325C8.21667 7.65833 8.45 7.92917 8.75 8.1375C9.05 8.34583 9.38333 8.46667 9.75 8.5L11.45 8.625L8.65 16.3C8.55 16.5667 8.55833 16.8208 8.675 17.0625C8.79167 17.3042 8.98333 17.475 9.25 17.575C9.51667 17.675 9.77083 17.6667 10.0125 17.55C10.2542 17.4333 10.425 17.2417 10.525 16.975L14.225 6.8L11.725 6.625L15 5.1C15.1167 5.05 15.2417 5.02084 15.375 5.0125C15.5083 5.00417 15.6333 5.01667 15.75 5.05L19.675 6.475C20.1917 6.65833 20.5667 7.00417 20.8 7.5125C21.0333 8.02083 21.0583 8.53333 20.875 9.05L19.5 12.8C19.4 13.0667 19.4083 13.3208 19.525 13.5625C19.6417 13.8042 19.8333 13.975 20.1 14.075C20.3667 14.175 20.6208 14.1667 20.8625 14.05C21.1042 13.9333 21.275 13.7417 21.375 13.475L22.75 9.725C23.1333 8.675 23.0958 7.65417 22.6375 6.6625C22.1792 5.67084 21.425 4.98334 20.375 4.6L16.45 3.175ZM14.2 9.8L12.85 13.575C12.75 13.8417 12.7583 14.0958 12.875 14.3375C12.9917 14.5792 13.1833 14.75 13.45 14.85C13.7167 14.95 13.9708 14.9417 14.2125 14.825C14.4542 14.7083 14.625 14.5167 14.725 14.25L16.1 10.5L14.2 9.8ZM17.025 10.825L16 13.65C15.9 13.9167 15.9083 14.1708 16.025 14.4125C16.1417 14.6542 16.3333 14.825 16.6 14.925C16.8667 15.025 17.1208 15.0167 17.3625 14.9C17.6042 14.7833 17.775 14.5917 17.875 14.325L18.9 11.525L17.025 10.825Z" fill="#E2E2E2"/>
              </svg>
            </span>
            <span class="map__hint-text">Смахните вниз</span>
          </div>
        </div>

        <div class="map__viewport">
          ${previewsMarkup}
          <div class="map__floor-toggle">${floorsMarkup}</div>

          <div class="map__inner">
            <div class="map__grid"></div>
            <div class="map__scene">
              ${combinedSvgMarkup}
            </div>
          </div>
        </div>
      </div>
    </section>
  `

    const viewport = page.querySelector<HTMLElement>('.map__viewport')

    const updateViewportOffsets = () => {
        if (!viewBox || !viewport) return
        const scale = Math.min(viewport.clientWidth / viewBox.width, viewport.clientHeight / viewBox.height)
        const scaledHeight = viewBox.height * scale
        const verticalOffset = (viewport.clientHeight - scaledHeight) / 2
        viewport.style.setProperty('--map-vertical-offset', `${verticalOffset}px`)
    }

    updateViewportOffsets()
    window.addEventListener('resize', updateViewportOffsets, { passive: true })
    mapResizeCleanup = () => window.removeEventListener('resize', updateViewportOffsets)

    const handleMarkerSelect = (originalIndex: number) => {
        if (isDefaultPoints) {
            state.currentPointIndex = originalIndex

            if (options?.onMarkerSelect) {
                options.onMarkerSelect(originalIndex)
            } else {
                state.screen = 'nextPoint'
                rerender()
            }
        } else if (options?.onMarkerSelect) {
            options.onMarkerSelect(originalIndex)
        }
    }

    if (isDefaultPoints || options?.onMarkerSelect) {
        page.querySelectorAll<SVGGElement>('.map__marker').forEach((marker) => {
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
    }

    page.querySelectorAll<HTMLButtonElement>('.map__floor').forEach((floorButton) => {
        floorButton.addEventListener('click', () => {
            const floor = Number(floorButton.dataset.floor)
            state.currentFloor = floor

            if (!state.mapPositions[floor]) {
                state.mapPositions[floor] = initialMapPositions[floor] || { x: 0, y: 0 }
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
                mapSheet.addEventListener('transitionend', closeMap, { once: true })
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
                event.preventDefault()
                startDrag(event.touches[0]?.clientY || 0)
            },
            { passive: false },
        )

        window.addEventListener(
            'touchmove',
            (event) => {
                if (!dragging) return
                event.preventDefault()
                moveDrag(event.touches[0]?.clientY || 0)
            },
            { passive: false },
        )

        window.addEventListener('touchend', endDrag)
        window.addEventListener('touchcancel', endDrag)

        mapHandle.addEventListener('mousedown', (event) => {
            startDrag(event.clientY)
        })

        window.addEventListener('mousemove', (event) => {
            if (dragging) moveDrag(event.clientY)
        })

        window.addEventListener('mouseup', endDrag)
        window.addEventListener('mouseleave', endDrag)
    }

    return page
}

type MapOverlayOptions = {
    onMarkerSelect?: () => void
} & MapDataOptions

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
            pointsOverride: options?.pointsOverride,
            currentPointIndex: options?.currentPointIndex,
            initialFloor: options?.initialFloor,
        })

        host.appendChild(mapElement)
    }

    removeExistingMap()
    document.body.classList.add(MAP_OVERLAY_CLASS)

    host.addEventListener(
        'touchmove',
        (event) => {
            event.preventDefault()
        },
        { passive: false },
    )

    renderOverlay()
    document.querySelector('#app')?.appendChild(host)
}
