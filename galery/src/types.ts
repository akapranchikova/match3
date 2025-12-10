export type AppScreen =
  | 'loader'
  | 'onboardingPrompt'
  | 'onboardingSlide'
  | 'routeModePrompt'
  | 'guideIntro'
  | 'pointInfo'
  | 'pointContent'
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
  collageImages?: string[]
  backgroundImage?: string
  backgroundConfig?: {
    color?: string
    position?: string
    size?: string
    filter?: string
    transform?: string
    opacity?: string
  }
}

export interface AppState {
  screen: AppScreen
  slideIndex: number
  currentPointIndex: number
  currentFloor: number
  mapPositions: Record<number, MapPosition>
  currentContentIndex: number
  soundEnabled: boolean
  onboardingCompleted: boolean
  deepLinkPointIndex: number | null
  scannerExpectedPointIndex: number | null
  scannerOrigin: AppScreen | null
}

export type PointContentKind = 'video' | 'cards' | 'audio'

export interface VideoContent {
  type: 'video'
  src: string
  poster?: string
  subtitles?: string[]
  heading: string
}

export interface CardsContent {
  type: 'cards'
  heading: string
  cards: {
    title: string
    text: string
    image: string
    alt?: string
  }[]
}

export interface AudioContent {
  type: 'audio'
  src: string
  artwork: string
  background: string
  subtitles?: string[]
  heading: string
}

export type PointContentSection = VideoContent | CardsContent | AudioContent

export interface PointContentConfig {
  heading: string
  body: string
  sections: PointContentSection[]
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
