export type AppScreen =
  | 'onboardingPrompt'
  | 'onboardingSlide'
  | 'routeModePrompt'
  | 'guideIntro'
  | 'pointInfo'
  | 'infoComplete'
  | 'nextPoint'
  | 'routeList'
  | 'scanner'
  | 'map'

export interface MapPosition {
  x: number
  y: number
}

export interface RoutePoint {
  id: string
  title: string
  description: string
  map: MapPosition
}

export interface OnboardingSlide {
  title: string
  body: string
}

export interface AppState {
  screen: AppScreen
  slideIndex: number
  currentPointIndex: number
  mapPosition: MapPosition
}

export type RenderCleanup = () => void

export type RenderResult = HTMLElement | { element: HTMLElement; cleanup?: RenderCleanup }

// BarcodeDetector is still an experimental API, so declare minimal typings for it
export type BarcodeFormat = 'qr_code'

export interface BarcodeDetectorResult {
  rawValue: string
}

export interface BarcodeDetectorConstructor {
  new (options: { formats: BarcodeFormat[] }): BarcodeDetectorInstance
  getSupportedFormats?: () => Promise<BarcodeFormat[]>
}

export interface BarcodeDetectorInstance {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>
}
