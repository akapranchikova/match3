export type AppScreen =
  | 'onboardingPrompt'
  | 'onboardingSlide'
  | 'routeModePrompt'
  | 'guideIntro'
  | 'pointInfo'
  | 'infoComplete'
  | 'nextPoint'
  | 'routeList'
  | 'cameraPermission'
  | 'scanner'
  | 'map'

export interface MapPosition {
  x: number
  y: number
}

export interface MapPoint extends MapPosition {
  floor: number
}

export interface RoutePoint {
  id: string
  title: string
  description: string
  period?: string
  photo?: string
  photoAlt?: string
  longDescription?: string
  highlights?: string[]
  map: MapPoint
}

export interface OnboardingSlide {
  title: string
  body: string
  image: string
  imageAlt?: string
  classStr?: string
  collagePlaceholder?: boolean
  backgroundImage?: string
}

export interface AppState {
  screen: AppScreen
  slideIndex: number
  currentPointIndex: number
  currentFloor: number
  mapPositions: Record<number, MapPosition>
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
