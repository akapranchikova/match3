import { points } from '../data'
import { rerender } from '../navigation'
import { saveViewed } from '../storage'
import { state, viewedPoints } from '../state'
import { resolvePointIndexFromPayload } from '../qr'
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
      <div class="scanner__frame"></div>
      <div class="scanner__alert" role="alert" hidden>
        <div class="scanner__alert-content">
          <p class="scanner__alert-title">QR-код не подошёл</p>
          <p class="scanner__alert-message"></p>
        </div>
      </div>
      <button class="scanner__close" type="button" aria-label="Закрыть сканер">×</button>
    </div>
    <p class="scanner__status visually-hidden">Запрашиваем доступ к камере…</p>
  `

  const video = wrapper.querySelector<HTMLVideoElement>('.scanner__video')
  const status = wrapper.querySelector<HTMLParagraphElement>('.scanner__status')
  const alert = wrapper.querySelector<HTMLDivElement>('.scanner__alert')
  const alertMessage = wrapper.querySelector<HTMLParagraphElement>('.scanner__alert-message')

  let active = true
  let stream: MediaStream | null = null
  let rafId: number | null = null
  let alertHideTimeout: number | null = null
  let lastProcessedPayload: string | null = null
  let lastProcessedAt = 0

  const expectedPointIndex = state.scannerExpectedPointIndex ?? state.currentPointIndex

  const stopScanner: RenderCleanup = () => {
    active = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
    if (alertHideTimeout) {
      window.clearTimeout(alertHideTimeout)
      alertHideTimeout = null
    }
  }

  const showStatus = (message: string) => {
    console.log('[scanner] status:', message)
    if (!status) return
    status.textContent = message
    status.classList.remove('visually-hidden')
  }

  const hideAlert = () => {
    if (!alert) return
    alert.hidden = true
    alert.classList.remove('scanner__alert--visible')
    alertHideTimeout = null
  }

  const showAlert = (message: string) => {
    if (!alert || !alertMessage) return
    alertMessage.textContent = message
    alert.hidden = false
    alert.classList.add('scanner__alert--visible')
    console.log('[scanner] show alert:', message)

    if (alertHideTimeout) {
      window.clearTimeout(alertHideTimeout)
    }

    alertHideTimeout = window.setTimeout(() => hideAlert(), 3200)
  }

  const handleScan = (payload: string) => {
    const now = Date.now()
    if (payload === lastProcessedPayload && now - lastProcessedAt < 1200) return

    lastProcessedPayload = payload
    lastProcessedAt = now
    console.log('[scanner] detected payload:', payload)

    const matchedIndex = resolvePointIndexFromPayload(payload)

    if (matchedIndex === null) {
      showAlert('Этот QR-код не из маршрута. Найдите код текущей точки и попробуйте снова.')
      showStatus('QR-код не распознан как точка маршрута')
      console.log('[scanner] payload rejected: not part of route')
      return
    }

    if (expectedPointIndex !== null && matchedIndex !== expectedPointIndex) {
      showAlert(
        `Это QR-код другой точки маршрута. Нужен код точки ${expectedPointIndex + 1}.`
      )
      showStatus('Нужен QR-код следующей точки маршрута')
      console.log('[scanner] payload rejected: expected index', expectedPointIndex, 'received', matchedIndex)
      return
    }

    stopScanner()

    viewedPoints.add(points[matchedIndex].id)
    saveViewed(viewedPoints)
    state.currentPointIndex = matchedIndex
    state.scannerExpectedPointIndex = null
    state.scannerOrigin = null
    state.screen = 'pointContent'
    state.currentContentIndex = 0
    console.log('[scanner] payload accepted, opening point', matchedIndex)
    rerender()
  }

  const startScan = async () => {
    try {
      const detectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
      const detectorFormats = (await detectorClass?.getSupportedFormats?.()) || []
      const supportsQr = detectorFormats.includes('qr_code')

      if (!detectorClass || !supportsQr) {
        showStatus('Распознавание QR-кодов не поддерживается в этом браузере')
        console.warn('[scanner] BarcodeDetector missing or QR not supported', detectorFormats)
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
              showStatus('QR-код найден! Открываем точку маршрута…')
              handleScan(codes[0].rawValue)
              return
            }

            showStatus('Наведите камеру на QR-код')
          } catch (err) {
            console.error('Ошибка распознавания', err)
            showStatus('Не удалось распознать QR-код, попробуйте ещё раз')
          }
        }

        rafId = requestAnimationFrame(scanFrame)
      }

      await video.play()
      console.log('[scanner] video playback started')
      showStatus('Камера включена. Наведите её на QR-код.')
      scanFrame()
    } catch (error) {
      console.error('Не удалось запустить сканер', error)
      showStatus('Не удалось открыть камеру. Проверьте разрешения браузера и попробуйте ещё раз.')
    }
  }

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
