import './style.css'
import { setRenderer } from './navigation'
import { resetTeardown, setTeardown, state } from './state'
import { AppScreen, RenderResult } from './types'
import {
  renderGuideIntro,
  renderHeadphonesPrompt,
  renderOnboardingSlide,
  renderRouteModePrompt,
} from './screens/onboarding'
import { renderInfoComplete, renderNextPoint, renderPointInfo } from './screens/pointFlow'
import { renderMap } from './screens/map'
import { renderRouteList } from './screens/route'
import { renderScanner } from './screens/scanner'
import { renderCameraPermission } from './screens/cameraPermission'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Root container #app was not found')
}

// Map app screens to renderers to keep navigation logic centralized
const screenRenderers: Record<AppScreen, () => RenderResult> = {
  onboardingPrompt: renderHeadphonesPrompt,
  onboardingSlide: renderOnboardingSlide,
  routeModePrompt: renderRouteModePrompt,
  guideIntro: renderGuideIntro,
  pointInfo: renderPointInfo,
  infoComplete: renderInfoComplete,
  nextPoint: renderNextPoint,
  routeList: renderRouteList,
  cameraPermission: renderCameraPermission,
  scanner: renderScanner,
  map: renderMap,
}

const render = () => {
  resetTeardown()

  const screen = screenRenderers[state.screen]

  if (screen) {
    app.innerHTML = ''
    const result = screen()
    if (result instanceof HTMLElement) {
      app.appendChild(result)
    } else if (result?.element instanceof HTMLElement) {
      app.appendChild(result.element)
      if (typeof result.cleanup === 'function') {
        setTeardown(result.cleanup)
      }
    }
  }
}

setRenderer(render)
render()
