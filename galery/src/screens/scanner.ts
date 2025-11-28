import { points } from '../data'
import { rerender } from '../navigation'
import { saveViewed } from '../storage'
import { state, viewedPoints } from '../state'
import { createButton } from '../ui'
import {
  BarcodeDetectorConstructor,
  BarcodeDetectorResult,
  RenderCleanup,
  RenderResult,
} from '../types'

export const renderScanner = (): RenderResult => {
  const wrapper = document.createElement('div')
  wrapper.className = 'scanner'

  const title = document.createElement('h1')
  title.textContent = 'Сканер QR-кода'
  wrapper.appendChild(title)

  const text = document.createElement('p')
  text.textContent =
    'Откройте камеру и наведите её на QR-код точки маршрута. Распознавание запустится автоматически.'
  wrapper.appendChild(text)

  const preview = document.createElement('div')
  preview.className = 'scanner__preview'

  const video = document.createElement('video')
  video.className = 'scanner__video'
  video.setAttribute('playsinline', 'true')
  video.muted = true
  video.autoplay = true
  preview.appendChild(video)

  const overlay = document.createElement('div')
  overlay.className = 'scanner__frame'
  preview.appendChild(overlay)

  wrapper.appendChild(preview)

  const status = document.createElement('p')
  status.className = 'scanner__status'
  status.textContent = 'Запрашиваем доступ к камере…'
  wrapper.appendChild(status)

  const tip = document.createElement('p')
  tip.className = 'muted'
  tip.textContent = 'Если распознавание не начинается, включите освещение и подержите камеру неподвижно.'
  wrapper.appendChild(tip)

  const actions = document.createElement('div')
  actions.className = 'stack'

  const back = createButton('Вернуться к маршруту', 'secondary')
  back.addEventListener('click', () => {
    state.screen = 'routeList'
    rerender()
  })
  actions.appendChild(back)
  wrapper.appendChild(actions)

  let active = true
  let stream: MediaStream | null = null
  let rafId: number | null = null

  const stopScanner: RenderCleanup = () => {
    active = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
  }

  const showStatus = (message: string) => {
    status.textContent = message
  }

  const handleScan = (payload: string) => {
    const matchedIndex = points.findIndex((point) => point.id === payload)
    stopScanner()

    if (matchedIndex >= 0) {
      viewedPoints.add(points[matchedIndex].id)
      saveViewed(viewedPoints)
      state.currentPointIndex = matchedIndex
      state.screen = 'pointInfo'
      rerender()
    } else {
      showStatus('QR-код считан, но точка маршрута не найдена. Попробуйте другой код.')
    }
  }

  const startScan = async () => {
    try {
      const detectorClass = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
      const detectorFormats = (await detectorClass?.getSupportedFormats?.()) || []
      const supportsQr = detectorFormats.includes('qr_code')

      if (!detectorClass || !supportsQr) {
        showStatus('Распознавание QR-кодов не поддерживается в этом браузере')
        return
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
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
      showStatus('Камера включена. Наведите её на QR-код.')
      scanFrame()
    } catch (error) {
      console.error('Не удалось запустить сканер', error)
      showStatus('Не удалось открыть камеру. Проверьте разрешения браузера и попробуйте ещё раз.')
    }
  }

  startScan()

  return { element: wrapper, cleanup: stopScanner }
}
