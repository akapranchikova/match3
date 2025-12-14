import cameraImage from '../assets/camera-permission.png'
import { rerender } from '../navigation'
import { state } from '../state'
import { createButton } from '../ui'
import { RenderResult } from '../types'
import { hasCameraPermission } from '../permissions'
import { saveCameraPermissionGranted } from '../storage'

export const renderCameraPermission = (): RenderResult => {
    const section = document.createElement('section')
    section.className = 'card camera-permission'
    section.innerHTML = `
    <div class="camera-permission__hero">
      <img src="${cameraImage}" alt="Фотокамера" class="camera-permission__image" />
    </div>
    <div class="camera-permission__content">
      <div class="camera-permission__text">
        <h1>Разрешите доступ к&nbsp;камере</h1>
        <p>Камера нужна, чтобы сканировать QR-коды в галерее и переходить к следующей истории маршрута</p>
        <p class="camera-permission__status" aria-live="polite"></p>
      </div>
      <div class="camera-permission__actions">
      </div>
    </div>
  `

    const status = section.querySelector<HTMLParagraphElement>('.camera-permission__status')
    const actions = section.querySelector<HTMLDivElement>('.camera-permission__actions')

    if (!actions) return section

    const button = createButton('Разрешить', 'primary')
    actions.prepend(button)

    const showStatus = (message: string) => {
        if (status) status.textContent = message
    }

    const goToScanner = () => {
        state.screen = 'scanner'
        rerender()
    }

    const isPermissionDeniedError = (error: unknown) => {
        if (!(error instanceof DOMException)) return false
        return (
            error.name === 'NotAllowedError' ||
            error.name === 'SecurityError' ||
            error.name === 'PermissionDeniedError'
        )
    }

    const withTimeout = <T,>(promise: Promise<T>, ms: number) => {
        let t: number | undefined
        const timeout = new Promise<never>((_, reject) => {
            t = window.setTimeout(() => reject(new Error('CAMERA_REQUEST_TIMEOUT')), ms)
        })
        return Promise.race([promise, timeout]).finally(() => {
            if (t) window.clearTimeout(t)
        }) as Promise<T>
    }

    const requestCamera = async (): Promise<MediaStream> => {
        const isConstraintFallbackError = (error: unknown) => {
            if (!(error instanceof DOMException)) return false
            return error.name === 'OverconstrainedError' || error.name === 'NotFoundError'
        }

        try {
            return await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            })
        } catch (error) {
            console.warn('Primary camera request failed, retrying with defaults', error)
            if (!isConstraintFallbackError(error)) {
                throw error
            }

            return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        }
    }

    hasCameraPermission(state.cameraPermissionGranted).then((granted) => {
        if (!granted) return

        state.cameraPermissionGranted = true
        saveCameraPermissionGranted()
        state.screen = 'scanner'
        rerender()
    })

    button.addEventListener('click', async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            showStatus('Ваш браузер не поддерживает запрос камеры. Открываем сканер…')
            goToScanner()
            return
        }

        button.disabled = true
        showStatus('Запрашиваем доступ к камере…')

        try {
            // если prompt “не появляется/не происходит ничего” — уходим на сканер
            const stream = await withTimeout(requestCamera(), 1200)

            stream.getTracks().forEach((track) => track.stop())

            state.cameraPermissionGranted = true
            saveCameraPermissionGranted()
            state.screen = 'scanner'
            rerender()
        } catch (error) {
            console.error('Camera permission request failed', error)

            // если прям запретили доступ — остаёмся тут и просим включить в настройках
            if (isPermissionDeniedError(error)) {
                showStatus(
                    'Доступ к камере запрещён. Разрешите камеру в настройках браузера и попробуйте снова.'
                )
                return
            }

            // всё остальное (таймаут/баги/NotFound и т.п.) — ведём на сканер
            showStatus('Не удалось запросить камеру. Открываем сканер…')
            goToScanner()
        } finally {
            button.disabled = false
        }
    })

    return section
}
