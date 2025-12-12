import { points } from '../data'
import { rerender } from '../navigation'
import { state } from '../state'
import { resolvePointIndexFromPayloadWithRedirect } from '../qr'
import { openMapOverlay } from './map'
import {
  BarcodeDetectorConstructor,
  BarcodeDetectorResult,
  RenderCleanup,
  RenderResult,
} from '../types'

export const renderScanner = (): RenderResult => {
  const wrapper = document.createElement('div')
  wrapper.className = 'scanner scanner--fullscreen'
  wrapper.innerHTML = `
    <div class="scanner__preview scanner__preview--fullscreen">
      <video class="scanner__video" playsinline muted autoplay></video>
      <div class="scanner__frame" aria-hidden="true">
        <div class="scanner__frame-box">
          <span class="scanner__frame-corner scanner__frame-corner--tl"></span>
          <span class="scanner__frame-corner scanner__frame-corner--tr"></span>
          <span class="scanner__frame-corner scanner__frame-corner--bl"></span>
          <span class="scanner__frame-corner scanner__frame-corner--br"></span>
        </div>
      </div>
      <div class="scanner__hint">
        <p class="scanner__hint-text">Отсканируйте QR-код для активации контента</p>
      </div>
      <div class="scanner__alert" role="alert" hidden>
        <div class="scanner__alert-content">
          <p class="scanner__alert-message"></p>
          <div class="scanner__alert-actions" hidden>
            <button class="button primary scanner__alert-map" type="button">Открыть карту</button>
          </div>
        </div>
      </div>
      <button class="scanner__close button icon-button" type="button" aria-label="Закрыть сканер">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#E2E2E2"/>
</svg>

</button>
    </div>
  `

  const video = wrapper.querySelector<HTMLVideoElement>('.scanner__video')
  const preview = wrapper.querySelector<HTMLDivElement>('.scanner__preview')
  const alert = wrapper.querySelector<HTMLDivElement>('.scanner__alert')
  const alertMessage = wrapper.querySelector<HTMLParagraphElement>('.scanner__alert-message')
  const alertActions = wrapper.querySelector<HTMLDivElement>('.scanner__alert-actions')
  const alertMapButton = wrapper.querySelector<HTMLButtonElement>('.scanner__alert-map')
  const hint = wrapper.querySelector<HTMLDivElement>('.scanner__hint')

  let active = true
  let stream: MediaStream | null = null
  let rafId: number | null = null
  let alertHideTimeout: number | null = null
  let lastProcessedPayload: string | null = null
  let lastProcessedAt = 0
  let qrScanner: { stop: () => void; destroy?: () => void } | null = null

  const expectedPointIndex = state.scannerExpectedPointIndex ?? state.currentPointIndex

  const stopScanner: RenderCleanup = () => {
    active = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy?.()
      qrScanner = null
    }
    if (alertHideTimeout) {
      window.clearTimeout(alertHideTimeout)
      alertHideTimeout = null
    }
  }

  const setLoading = (value: boolean) => {
    if (!preview) return

    preview.classList.toggle('scanner__preview--loading', value)
  }

  const hideAlert = () => {
    if (!alert) return
    alert.hidden = true
    alert.classList.remove('scanner__alert--visible')
    alert.classList.remove('scanner__alert--animate')
    alertHideTimeout = null
    if (hint) hint.hidden = false
  }

  const showAlert = (
    message: string,
    options: { showMapButton?: boolean; autoHide?: boolean } = {}
  ) => {
    if (!alert || !alertMessage) return
    const { showMapButton = false, autoHide = !showMapButton } = options

    alertMessage.textContent = message
    alert.hidden = false
    alert.classList.remove('scanner__alert--animate')
    // Force reflow to restart animation
    void alert.offsetWidth
    alert.classList.add('scanner__alert--visible')
    alert.classList.add('scanner__alert--animate')
    if (hint) hint.hidden = true
    if (alertActions) alertActions.hidden = !showMapButton
    if (alertMapButton) alertMapButton.hidden = !showMapButton
    console.log('[scanner] show alert:', message)

    if (alertHideTimeout) {
      window.clearTimeout(alertHideTimeout)
    }

    alertHideTimeout = autoHide ? window.setTimeout(() => hideAlert(), 3200) : null
  }

  const handleScan = async (payload: string): Promise<boolean> => {
    const now = Date.now()
    if (payload === lastProcessedPayload && now - lastProcessedAt < 1200) return

    lastProcessedPayload = payload
    lastProcessedAt = now
    console.log('[scanner] detected payload:', payload)

    const { index: matchedIndex, finalUrl } = await resolvePointIndexFromPayloadWithRedirect(payload)
    if (finalUrl && finalUrl !== payload) {
      console.log('[scanner] payload resolved redirect:', finalUrl)
    }

    if (matchedIndex === null) {
      showAlert('Этот QR-код не относится к маршруту', { showMapButton: true, autoHide: false })
      console.log('[scanner] payload rejected: not part of route')
      return false
    }

    if (expectedPointIndex !== null && matchedIndex < expectedPointIndex) {
      showAlert('Эта часть маршрута уже пройдена', { showMapButton: true, autoHide: false })
      console.log('[scanner] payload rejected: point already completed')
      return false
    }

    if (expectedPointIndex !== null && matchedIndex > expectedPointIndex) {
      showAlert(
        'Это не текущая точка маршрута. Нужная расположена в другом месте',
        { showMapButton: true, autoHide: false }
      )
      return false
    }

    stopScanner()

    state.currentPointIndex = matchedIndex
    state.scannerExpectedPointIndex = null
    state.scannerOrigin = null
    state.screen = 'pointContent'
    state.currentContentIndex = 0
    console.log('[scanner] payload accepted, opening point', matchedIndex)
    rerender()

    return true
  }

  const startScan = async () => {
    try {
      setLoading(true)

      const detectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
      const detectorFormats = (await detectorClass?.getSupportedFormats?.()) || []
      const supportsQr = detectorFormats.includes('qr_code')

      if (!detectorClass || !supportsQr) {
        console.warn('[scanner] BarcodeDetector missing or QR not supported', detectorFormats)

        const qrScannerModule = await import(
          /* @vite-ignore */ 'https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js'
        ).catch((error) => {
          console.error('[scanner] failed to load fallback scanner', error)
          return null
        })

        const QrScanner =
          qrScannerModule?.default ?? (qrScannerModule as { QrScanner?: unknown })?.QrScanner ?? qrScannerModule

        if (!QrScanner || !video) {
          setLoading(false)
          return
        }

        ;(QrScanner as { WORKER_PATH?: string }).WORKER_PATH =
          'https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js'

        qrScanner = new (QrScanner as new (
          video: HTMLVideoElement,
          onDecode: (result: { data?: string } | string) => void,
          options?: unknown
        ) => { start: () => Promise<void>; stop: () => void; destroy?: () => void })(
          video,
          async (result) => {
            if (!active) return

            const payload = typeof result === 'string' ? result : result?.data
            if (!payload) return
          },
          {
            preferredCamera: 'environment',
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )

        await qrScanner.start()
        stream = (video.srcObject as MediaStream | null) ?? null

        setLoading(false)
        return
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      console.log('[scanner] camera stream started')
      video.srcObject = stream

      const detector = new detectorClass({ formats: ['qr_code'] })

      const scanFrame = async () => {
        if (!active) return

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const codes: BarcodeDetectorResult[] = await detector.detect(video)
            if (codes.length > 0) {
              const accepted = await handleScan(codes[0].rawValue)
              if (accepted) return
            }

          } catch (err) {
            console.error('Ошибка распознавания', err)
          }
        }

        rafId = requestAnimationFrame(scanFrame)
      }

      await video.play()
      setLoading(false)
      scanFrame()
    } catch (error) {
      setLoading(false)
    }
  }

  alertMapButton?.addEventListener('click', () => {
    const targetPoint = points[expectedPointIndex] ?? points[state.currentPointIndex]

    if (targetPoint) {
      state.currentFloor = targetPoint.map.floor
    }

    state.scannerExpectedPointIndex = null
    state.scannerOrigin = null

    console.log('[scanner] map opened from alert for point', targetPoint?.id ?? 'unknown')
    openMapOverlay({
      onMarkerSelect: () => {
        state.screen = 'nextPoint'
      },
    })
  })

  wrapper.querySelector<HTMLButtonElement>('.scanner__close')?.addEventListener('click', () => {
    const returnScreen = state.scannerOrigin ?? 'nextPoint'
    state.scannerExpectedPointIndex = null
    state.scannerOrigin = null
    state.screen = returnScreen
    console.log('[scanner] closed; returning to screen', returnScreen)
    rerender()
  })

  startScan()

  return { element: wrapper, cleanup: stopScanner }
}
