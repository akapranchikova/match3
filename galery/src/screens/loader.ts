import logoList from '../assets/logo-list.svg'
import { rerender } from '../navigation'
import { state } from '../state'
import { RenderResult } from '../types'

const LOADER_DURATION_MS = 2600

export const renderLoader = (): RenderResult => {
  const container = document.createElement('section')
  container.className = 'loader-screen'

  container.innerHTML = `
    <header class="loader-screen__header">
      <img src="${logoList}" alt="Лого" class="loader-screen__logo">
    </header>
    <div class="loader-screen__body" role="status" aria-label="Загрузка">
      <div class="loader-showbox">
        <div class="loader">
          <svg class="loader__circular" viewBox="25 25 50 50">
            <circle
              class="loader__path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke-width="2"
              stroke-miterlimit="10"
            ></circle>
          </svg>
        </div>
      </div>
      <p class="loader-screen__status">Загрузка</p>
    </div>
  `

  const timeoutId = window.setTimeout(() => {
    if (state.deepLinkPointIndex !== null && !state.deepLinkRequiresHeadphones) {
      state.screen = 'pointContent'
      state.currentContentIndex = 0
      state.deepLinkPointIndex = null
      state.deepLinkRequiresHeadphones = false
      rerender()
      return
    }

    const shouldSkipIntro = state.onboardingCompleted || state.deepLinkPointIndex !== null
    state.screen = shouldSkipIntro ? 'onboardingPrompt' : 'onboardingSlide'
    rerender()
  }, LOADER_DURATION_MS)

  return {
    element: container,
    cleanup: () => window.clearTimeout(timeoutId),
  }
}
