import cameraImage from '../assets/camera-permission.png'
import { rerender } from '../navigation'
import { state } from '../state'
import { createButton } from '../ui'
import { RenderResult } from '../types'

export const renderCameraPermission = (): RenderResult => {
  const section = document.createElement('section')
  section.className = 'card camera-permission'
  section.innerHTML = `
    <div class="camera-permission__hero">
      <img src="${cameraImage}" alt="Фотокамера" class="camera-permission__image" />
    </div>
    <div class="camera-permission__content">
      <div class="camera-permission__text">
        <h1>Разрешите доступ к камере</h1>
        <p>Камера нужна, чтобы сканировать QR-коды в галерее и открывать точки маршрута</p>
      </div>
      <div class="camera-permission__actions">
        <p class="camera-permission__status" aria-live="polite"></p>
      </div>
    </div>
  `

  const status = section.querySelector<HTMLParagraphElement>('.camera-permission__status')
  const actions = section.querySelector<HTMLDivElement>('.camera-permission__actions')

  if (!actions) return section

  const button = createButton('Разрешить доступ', 'primary')
  actions.prepend(button)

  const showStatus = (message: string) => {
    if (status) {
      status.textContent = message
    }
  }

  button.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showStatus('Ваш браузер не поддерживает запрос камеры')
      return
    }

    button.disabled = true
    showStatus('Запрашиваем доступ к камере…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })

      stream.getTracks().forEach((track) => track.stop())

      state.screen = 'scanner'
      rerender()
    } catch (error) {
      console.error('Camera permission was denied', error)
      showStatus('Не удалось получить доступ к камере. Проверьте разрешения и попробуйте снова.')
    } finally {
      button.disabled = false
    }
  })

  return section
}
