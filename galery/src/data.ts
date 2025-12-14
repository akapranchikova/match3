import { parseSrt } from './subtitles'
import { MapPoint, MapPosition, OnboardingSlide, PointContentConfig, RoutePoint } from './types'
import historyIllustration from './assets/onboarding-history.png'
import voiceIllustration from './assets/onboarding-voice.png'
import qrIllustration from './assets/onboarding-qr.png'
import voiceNewIllustration from './assets/gigachat-guide.svg'
import onboardingGolosLogo from './assets/onboarding-golos-logo.svg'
import logoList from './assets/logo-list.svg'
import boardingPhoto1 from './assets/boarding-1/photo-1.jpg'
import boardingPhoto2 from './assets/boarding-1/photo-2.jpg'
import boardingPhoto3 from './assets/boarding-1/photo-3.jpg'
import historySubtitlesRaw from './assets/points/1. Создание и история галереи/2. Создание и история галереи.txt?raw'
import permSeaSubtitlesRaw from './assets/points/2.1 Пермское море, пермский период и геология/3. Пермское море.txt?raw'
import permPeriodSubtitlesRaw from './assets/points/2.1 Пермское море, пермский период и геология/4. Пермский период.txt?raw'
import metalPlantLocationSubtitlesRaw from './assets/points/3.1 Медеплавильный завод и история посёлка/6. Выбор места для завода.txt?raw'
import metalPlantConstructionSubtitlesRaw from './assets/points/3.1 Медеплавильный завод и история посёлка/7. Строительство медеплавильного завода.txt?raw'
import metalPlantVillageSubtitlesRaw from './assets/points/3.1 Медеплавильный завод и история посёлка/8. Заводской посёлок.txt?raw'
import workshopSubtitlesRaw from './assets/points/4.1 Железная дорога — будущий завод Шпагина/9. Железнодорожные мастерские.txt?raw'
import armoredTrainSubtitlesRaw from './assets/points/4.1 Железная дорога — будущий завод Шпагина/10. Бронепоезда.txt?raw'
import solikamskyTrackSubtitlesRaw from './assets/points/5. История археологических раскопок/15. Соликамский тракт.txt?raw'
import villagesSubtitlesRaw from './assets/points/5. История археологических раскопок/16. Деревни вдоль дороги.txt?raw'
import finalSubtitlesRaw from './assets/points/6. Финал/17. Финал.txt?raw'
import pipeModelSubtitlesRaw from './assets/points/5. История археологических раскопок/12. Чаша от курительной трубки.txt?raw'
import tileModelSubtitlesRaw from './assets/points/5. История археологических раскопок/13. Печной изразец.txt?raw'
import potModelSubtitlesRaw from './assets/points/5. История археологических раскопок/14. Керамический горшок.txt?raw'
import routeImage1 from './assets/boarding-1/photo-1.jpg'
import routeImage2 from './assets/boarding-1/photo-3.jpg'
import routeImage3 from './assets/route/route-3.jpg'
import routeImage4 from './assets/boarding-1/photo-2.jpg'
import routeImage5 from './assets/route/route-5.jpg'
import routeImage6 from './assets/route/route-6.jpg'
import image1 from './assets/points-position/point1.jpg'
import image2 from './assets/points-position/point2.jpg'
import image3 from './assets/points-position/point3.jpg'
import image4 from './assets/points-position/point4.jpg'
import image5 from './assets/points-position/point5.jpg'
import image6 from './assets/points-position/point6.jpg'
import image7 from './assets/points-position/point7.png'
import preview1 from './assets/video-preview/T1_crop.jpg'
import preview2 from './assets/video-preview/Т2-Пермское море Квадрат.jpg'
import preview3 from './assets/video-preview/Т2-Perm-period.jpg'
import preview4 from './assets/video-preview/T3-1_crop.jpg'
import preview5 from './assets/video-preview/T3-2_crop.jpg'
import preview6 from './assets/video-preview/T3-3_crop.jpg'
import preview7 from './assets/video-preview/T5-1_crop.jpg'
import preview8 from './assets/video-preview/T5-2_crop.jpg'
import preview9 from './assets/video-preview/Т4-Деревня Квадрат.jpg'
import preview10 from './assets/video-preview/Т4-trakt.jpg'

export const STORAGE_KEY = 'gallery-viewed-points'

const splitSubtitleLines = (content: string) =>
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const parseSubtitleLines = (content: string) => {
  const parsed = parseSrt(content)
    .flatMap((cue) => splitSubtitleLines(cue.text))
    .filter(Boolean)

  if (parsed.length) return parsed

  return splitSubtitleLines(content)
}

const formatTimecode = (value: number) => {
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = Math.floor(value % 60)

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')
    .concat(',000')
}

const createSubtitlesUrlFromText = (content: string) => {
  const parsed = parseSrt(content)
  if (parsed.length) {
    return URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  }

  const lines = splitSubtitleLines(content)
  if (!lines.length) return undefined

  const srtContent = lines
    .map(
      (line, index) => `${index + 1}\n${formatTimecode(index * 4)} --> ${formatTimecode(index * 4 + 3)}\n${line}`,
    )
    .join('\n\n')

  return URL.createObjectURL(new Blob([srtContent], { type: 'text/plain' }))
}

export const guideVoiceAssets: Record<
  string,
  { audio?: string; subtitles?: string }
> = {
  history: {
    audio: new URL(
      './assets/points/0. Интро - приветствие/1.1-переход-к-точке-1.mp3',
      import.meta.url,
    ).href,
    subtitles:new URL(
        './assets/points/0. Интро - приветствие/1.1 переход к точке 1.txt',
        import.meta.url,
    ).href,
  },
  'perm-period': {
    audio: new URL(
      './assets/points/1. Создание и история галереи/2.1-переход-к-точке-2.mp3',
      import.meta.url,
    ).href,
    subtitles: new URL(
      './assets/points/1. Создание и история галереи/2.1 переход к точке 2.txt',
      import.meta.url,
    ).href,
  },
  'metal-plant': {
    audio: new URL(
      './assets/points/2.1 Пермское море, пермский период и геология/5.1-переход-к-точке-3.mp3',
      import.meta.url,
    ).href,
    subtitles: new URL(
      './assets/points/2.1 Пермское море, пермский период и геология/5.1 переход к точке 3.txt',
      import.meta.url,
    ).href,
  },
  excavation: {
    audio: new URL(
      './assets/points/3.1 Медеплавильный завод и история посёлка/8.1 переход к точке 4.mp3',
      import.meta.url,
    ).href,
    subtitles: new URL(
        './assets/points/3.1 Медеплавильный завод и история посёлка/8.1 переход к точке 4.txt',
        import.meta.url,
    ).href,
  },
  railway: {
    audio: new URL(
      './assets/points/4.1 Железная дорога — будущий завод Шпагина/10.1 переход к точке 5.wav',
      import.meta.url,
    ).href,
    subtitles: new URL(
        './assets/points/4.1 Железная дорога — будущий завод Шпагина/10.1 переход к точке 5.txt',
        import.meta.url,
    ).href,
  },
  final: {
    audio: new URL(
      './assets/points/5. История археологических раскопок/16.1 переход к точке 6 .mp3',
      import.meta.url,
    ).href,
    subtitles: new URL(
        './assets/points/5. История археологических раскопок/16.1 переход к точке 6.txt',
        import.meta.url,
    ).href,
  },
    photo: {
        audio: new URL(
            './assets/points/6. Финал/17.1 переход к фотозоне.mp3',
            import.meta.url,
        ).href,
        subtitles: new URL(
            './assets/points/6. Финал/17.1 переход к фотозоне.txt',
            import.meta.url,
        ).href,
    }
}

const historyVideoSrc = new URL(
  './assets/points/1. Создание и история галереи/2. Создание и история галереи.mp4',
  import.meta.url,
).href
const historyAudioSrc = new URL(
  './assets/points/1. Создание и история галереи/2.-Создание-и-история-галереи.mp3',
  import.meta.url,
).href
const geologyCardImages = [
  new URL(
    './assets/points/2.1 Пермское море, пермский период и геология/5. Геология card.png',
    import.meta.url,
  ).href,
  new URL(
    './assets/points/2.1 Пермское море, пермский период и геология/5. Геология card-1.png',
    import.meta.url,
  ).href,
  new URL(
    './assets/points/2.1 Пермское море, пермский период и геология/5. Геология card-2.png',
    import.meta.url,
  ).href,
  new URL(
    './assets/points/2.1 Пермское море, пермский период и геология/5. Геология card-3.png',
    import.meta.url,
  ).href,
]
const permSeaVideoSrc = new URL(
  './assets/points/2.1 Пермское море, пермский период и геология/3. Пермское море.mp4',
  import.meta.url,
).href
const permSeaAudioSrc = new URL(
  './assets/points/2.1 Пермское море, пермский период и геология/3.Perm-sea.mp3',
  import.meta.url,
).href
const permPeriodVideoSrc = new URL(
  './assets/points/2.1 Пермское море, пермский период и геология/4. Пермский период.mp4',
  import.meta.url,
).href
const permPeriodAudioSrc = new URL(
  './assets/points/2.1 Пермское море, пермский период и геология/4.Perm-period.mp3',
  import.meta.url,
).href
const metalPlantLocationVideoSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/6. Выбор места для завода.mp4',
  import.meta.url,
).href
const metalPlantLocationAudioSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/6. Выбор места для завода.mp3',
  import.meta.url,
).href
const metalPlantConstructionVideoSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/7. Строительство медеплавильного завода.mp4',
  import.meta.url,
).href
const metalPlantConstructionAudioSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/7. Строительство медеплавильного завода.mp3',
  import.meta.url,
).href
const metalPlantVillageVideoSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/8. Заводской посёлок.mp4',
  import.meta.url,
).href
const metalPlantVillageAudioSrc = new URL(
  './assets/points/3.1 Медеплавильный завод и история посёлка/8. Заводской посёлок.mp3',
  import.meta.url,
).href
const workshopVideoSrc = new URL(
  './assets/points/4.1 Железная дорога — будущий завод Шпагина/9. Железнодорожные мастерские.mp4',
  import.meta.url,
).href
const workshopAudioSrc = new URL(
  './assets/points/4.1 Железная дорога — будущий завод Шпагина/9. Железнодорожные мастерские.mp3',
  import.meta.url,
).href
const armoredTrainsVideoSrc = new URL(
  './assets/points/4.1 Железная дорога — будущий завод Шпагина/10. Бронепоезда.mp4',
  import.meta.url,
).href
const armoredTrainsAudioSrc = new URL(
  './assets/points/4.1 Железная дорога — будущий завод Шпагина/10. Бронепоезда.mp3',
  import.meta.url,
).href
const pipeModel = new URL(
  './assets/points/5. История археологических раскопок/12. Чаша от курительной трубки.glb',
  import.meta.url,
).href
const tileModel = new URL(
  './assets/points/5. История археологических раскопок/13. Печной изразец.glb',
  import.meta.url,
).href
const potModel = new URL(
  './assets/points/5. История археологических раскопок/14. Керамический горшок.glb',
  import.meta.url,
).href
const pipeModelAudioSrc = new URL(
  './assets/points/5. История археологических раскопок/12. Чаша от курительной трубки.mp3',
  import.meta.url,
).href
const tileModelAudioSrc = new URL(
  './assets/points/5. История археологических раскопок/13. Печной изразец.mp3',
  import.meta.url,
).href
const potModelAudioSrc = new URL(
  './assets/points/5. История археологических раскопок/14. Керамический горшок.mp3',
  import.meta.url,
).href
const solikamskyTrackVideoSrc = new URL(
  './assets/points/5. История археологических раскопок/15. Соликамский тракт.mp4',
  import.meta.url,
).href
const solikamskyTrackAudioSrc = new URL(
  './assets/points/5. История археологических раскопок/15. Соликамский тракт.mp3',
  import.meta.url,
).href
const villagesVideoSrc = new URL(
  './assets/points/5. История археологических раскопок/16. Деревни вдоль дороги.mp4',
  import.meta.url,
).href
const villagesAudioSrc = new URL(
  './assets/points/5. История археологических раскопок/16. Деревни вдоль дороги.mp3',
  import.meta.url,
).href
const finalAudioSrc = new URL('./assets/points/6. Финал/17. Финал.mp3', import.meta.url).href
const historySubtitles = parseSubtitleLines(historySubtitlesRaw)
const historySubtitlesUrl = createSubtitlesUrlFromText(historySubtitlesRaw)
const permSeaSubtitles = parseSubtitleLines(permSeaSubtitlesRaw)
const permSeaSubtitlesUrl = createSubtitlesUrlFromText(permSeaSubtitlesRaw)
const permPeriodSubtitles = parseSubtitleLines(permPeriodSubtitlesRaw)
const permPeriodSubtitlesUrl = createSubtitlesUrlFromText(permPeriodSubtitlesRaw)
const metalPlantLocationSubtitles = parseSubtitleLines(metalPlantLocationSubtitlesRaw)
const metalPlantLocationSubtitlesUrl = createSubtitlesUrlFromText(metalPlantLocationSubtitlesRaw)
const metalPlantConstructionSubtitles = parseSubtitleLines(metalPlantConstructionSubtitlesRaw)
const metalPlantConstructionSubtitlesUrl = createSubtitlesUrlFromText(metalPlantConstructionSubtitlesRaw)
const metalPlantVillageSubtitles = parseSubtitleLines(metalPlantVillageSubtitlesRaw)
const metalPlantVillageSubtitlesUrl = createSubtitlesUrlFromText(metalPlantVillageSubtitlesRaw)
const workshopSubtitles = parseSubtitleLines(workshopSubtitlesRaw)
const workshopSubtitlesUrl = createSubtitlesUrlFromText(workshopSubtitlesRaw)
const armoredTrainSubtitles = parseSubtitleLines(armoredTrainSubtitlesRaw)
const armoredTrainSubtitlesUrl = createSubtitlesUrlFromText(armoredTrainSubtitlesRaw)
const solikamskyTrackSubtitles = parseSubtitleLines(solikamskyTrackSubtitlesRaw)
const solikamskyTrackSubtitlesUrl = createSubtitlesUrlFromText(solikamskyTrackSubtitlesRaw)
const villagesSubtitles = parseSubtitleLines(villagesSubtitlesRaw)
const villagesSubtitlesUrl = createSubtitlesUrlFromText(villagesSubtitlesRaw)
const finalSubtitles = parseSubtitleLines(finalSubtitlesRaw)
const pipeModelSubtitles = parseSubtitleLines(pipeModelSubtitlesRaw)
const pipeModelSubtitlesUrl = createSubtitlesUrlFromText(pipeModelSubtitlesRaw)
const tileModelSubtitles = parseSubtitleLines(tileModelSubtitlesRaw)
const tileModelSubtitlesUrl = createSubtitlesUrlFromText(tileModelSubtitlesRaw)
const potModelSubtitles = parseSubtitleLines(potModelSubtitlesRaw)
const potModelSubtitlesUrl = createSubtitlesUrlFromText(potModelSubtitlesRaw)

const mapPoints: Record<RoutePoint['id'], MapPoint> = {
    history: {floor: 1, x: 118.72, y: 530.4, htmlY: 350, htmlDone: 463},
    'perm-period': {floor: 1, x: 135.44, y: 264.86, htmlY: 100, htmlDone: 222},
    'metal-plant': {floor: 2, x: 105.96, y: 555.62, htmlY: 317, htmlDone: 503},
    excavation: {floor: 2, x: 75.72, y: 434.34, htmlY: 263, htmlDone: 389},
    railway: {floor: 3, x: 120.66, y: 398.22, htmlY: 230,  htmlDone: 350},
    final: {floor: 3, x: 194.22, y: 192.96, htmlY: 40,  htmlDone: 130},
}

export const photoZonePoint: RoutePoint = {
  id: 'photo-zone',
    photoAlt: 'ИИ-фотостенд',
  title: 'Сделайте фото в одном из исторических мест',
  description: 'На 1 этаже рядом с гардеробом',
  period: '21 век',
  photo: image7,
    photoWhere: image7,
  map: {
    floor: 1,
    x: 124 ,
    y: 418,
    htmlY: 360,
    htmlDone: 470,
  },
}

export const points: RoutePoint[] = [
  {
    id: 'history',
    title: 'Создание и история галереи',
    description: 'На 1 этаже около гардероба',
    period: '21 век',
    photo: routeImage1,
    photoWhere: image1,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Новая галерея выросла на месте, где промышленная история встречается с культурой. Здесь сохранились следы дореволюционного комплекса и его трансформации в современное общественное пространство.',
    highlights: [
      'первые чертежи здания и идея построить общественное место вокруг искусства',
      'кто финансировал строительство и какие архитекторы задали стиль',
      'как галерея открывалась для горожан и какие традиции сохранились до сегодня',
    ],
    guide: {
      heading: 'Точка 1. Создание и история галереи',
      subtitle: 'Старт маршрута у гардероба',
      caption: 'На 1 этаже около гардероба',
      audio: guideVoiceAssets.history.audio,
      subtitles: guideVoiceAssets.history.subtitles,
    },
    qrSuffix: 'z604DazV',
    map: mapPoints.history,
  },
  {
    id: 'perm-period',
    title: 'Пермское море, пермский период,  и геология',
    description: 'История пермского периода и артефакты, которые нашли неподалёку.',
    period: '298 млн лет назад',
    photo: routeImage2,
      photoWhere: image2,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Маршрут начинается с древностей: миллионы лет назад на этом месте плескалось море. Экспозиция рассказывает, как оно сформировало ландшафт, а археологи находят здесь следы вымерших существ.',
    highlights: [
      'какие ископаемые помогают представить климат того времени',
      'как пермский период повлиял на название региона и символику выставки',
      'почему образ «моря» стал главной метафорой вступления',
    ],
    guide: {
      heading: 'Точка 2. Пермское море и геология',
      subtitle: 'Продолжайте маршрут в экспозиции о пермском периоде',
      caption: 'История пермского периода и артефакты, которые нашли неподалёку.',
      audio: guideVoiceAssets['perm-period'].audio,
      subtitles: guideVoiceAssets['perm-period'].subtitles,
    },
    qrSuffix: 'nkA6Epda',
    map: mapPoints['perm-period'],
  },
  {
    id: 'metal-plant',
    title: 'Медеплавильный завод и история посёлка',
    description: 'Как промышленность повлияла на развитие территории и людей.',
    period: '18 век',
    photo: routeImage3,
      photoWhere: image3,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Индустриальная линия маршрута посвящена медеплавильному заводу, вокруг которого вырос посёлок. Здесь рассказывают о первых рабочих артели, их быте и том, как производство меняло экономику края.',
    highlights: [
      'что производили на заводе и куда отправляли готовую продукцию',
      'как менялась жизнь посёлка после появления предприятия',
      'какие детали интерьера напоминают о промышленном прошлом',
    ],
    guide: {
      heading: 'Точка 3. Медеплавильный завод',
      subtitle: 'Поднимитесь на второй этаж к индустриальной истории',
      caption: 'Как промышленность повлияла на развитие территории и людей.',
      audio: guideVoiceAssets['metal-plant'].audio,
      subtitles: guideVoiceAssets['metal-plant'].subtitles,
    },
    qrSuffix: 'eO3JtVwB',
    map: mapPoints['metal-plant'],
  },
  {
    id: 'excavation',
    title: 'Железная дорога — будущий завод Шпагина',
    description: 'Находки и открытия, которые легли в основу экспозиции.',
    period: '19 век',
    photo: routeImage4,
      photoWhere: image4,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Экспозиция показывает, как археологи шаг за шагом собирали фрагменты истории. Это и полевые дневники, и инструменты, и редкие находки, которые помогли восстановить картину жизни ранних жителей.',
    highlights: [
      'ключевые экспедиции, благодаря которым пополнилась коллекция',
      'что археологи искали в первую очередь и почему',
      'как находки влияют на современные представления об истории Перми',
    ],
    guide: {
      heading: 'Точка 4. Железная дорога — будущий завод Шпагина',
      subtitle: 'Исследуйте историю транспортного узла на втором этаже',
      caption: 'Находки и открытия, которые легли в основу экспозиции.',
      audio: guideVoiceAssets.excavation.audio,
      subtitles: guideVoiceAssets.excavation.subtitles,
    },
    qrSuffix: 's6K6u2tH',
    map: mapPoints.excavation,
  },
  {
    id: 'railway',
    title: 'История археологических раскопок',
    description: 'Как железная дорога изменила экономику места и городскую ткань.',
    period: '21 век',
    photo: routeImage5,
      photoWhere: image5,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Отдельный зал посвящён железной дороге: она связала город с новыми рынками и задала ритм будущему заводу Шпагина. Истории пассажиров и работников железной дороги создают живое ощущение пути.',
    highlights: [
      'какие маршруты проходили через станцию и чем они были важны',
      'как железная дорога помогла появиться заводу Шпагина и новым профессиям',
      'почему железнодорожные мотивы стали визуальным кодом современного пространства',
    ],
    guide: {
      heading: 'Точка 5. История археологических раскопок',
      subtitle: 'Откройте третью точку на верхнем уровне маршрута',
      caption: 'Как железная дорога изменила экономику места и городскую ткань.',
      audio: guideVoiceAssets.railway.audio,
      subtitles: guideVoiceAssets.railway.subtitles,
    },
    qrSuffix: 'QsnwmPTq',
    map: mapPoints.railway,
  },
  {
    id: 'final',
    title: 'Финальная точка',
    description: 'Завершение маршрута и приглашение поделиться впечатлениями.',
    period: '21 век',
    photo: routeImage6,
      photoWhere: image6,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Финал маршрута — пространство для обратной связи и вдохновения. Здесь можно поделиться впечатлениями, узнать о будущих выставках и почувствовать, что история продолжается уже с вашим участием.',
    highlights: [
      'как оставить отзыв и помочь команде улучшить маршрут',
      'где узнать о ближайших событиях и новых выставках',
      'какие зоны отдыха и фото-точки стоит посетить перед уходом',
    ],
    guide: {
      heading: 'Точка 6. Финал маршрута',
      subtitle: 'Завершение путешествия и сбор впечатлений',
      caption: 'Завершение маршрута и приглашение поделиться впечатлениями.',
      audio: guideVoiceAssets.final.audio,
      subtitles: guideVoiceAssets.final.subtitles,
    },
    qrSuffix: 'MQkDEzW7',
    map: mapPoints.final,
  },
]

export const pointContentConfigs: Record<string, PointContentConfig> = {
  history: {
    heading: 'Создание и история галереи',
    body: 'Знакомство с пространством и основной идеей галереи.',
    sections: [
      {
        heading: 'Создание и история галереи',
        type: 'video',
        src: historyVideoSrc,
          poster: preview1,
        audio: historyAudioSrc,
        subtitlesUrl: historySubtitlesUrl,
        subtitles: historySubtitles,
      },
    ],
  },
  'perm-period': {
    heading: 'Заголовок',
    body: 'Текст',
    sections: [
      {
        heading: 'Пермское море',
        type: 'video',
        src: permSeaVideoSrc,
        audio: permSeaAudioSrc,
        poster: preview2,
        subtitlesUrl: permSeaSubtitlesUrl,
        subtitles: permSeaSubtitles,
      },
      {
        heading: 'Пермский период',
        type: 'video',
        src: permPeriodVideoSrc,
        audio: permPeriodAudioSrc,
          poster: preview3,
        subtitlesUrl: permPeriodSubtitlesUrl,
        subtitles: permPeriodSubtitles,
      },
      {
        heading: 'Геология',
        type: 'cards',
        cards: [
          {
            title: 'Скалы на Чусовой',
            text: 'Это бывшие рифы Пермского моря. Сегодня их каменный рельеф напоминает, что когда-то весь этот край скрывала вода',
            image: geologyCardImages[0],
            alt: 'Скалы Пермского моря',
          },
          {
            title: 'Калийная шахта (сильвинит)',
            text: 'Здесь добывают соли, которые появились ещё во времена Пермского моря. Эти пласты — след исчезнувшего водоёма',
            image: geologyCardImages[1],
            alt: 'Слои породы пермского периода',
          },
          {
            title: 'Гипсы (Чумкасский карьер)',
            text: 'Формировались при испарении древних морей. В разрезах Прикамья заметны как светлые прослои рядом с соленосными пластами.',
            image: geologyCardImages[2],
            alt: 'Современное переосмысление моря',
          },
          {
            title: 'Известняки (Шавринский карьер)',
            text: 'Сформированы из древних морских отложений. Их добыча в Александровске оставила после себя известковый карьер, который со временем превратился в «голубые озера».',
            image: geologyCardImages[3],
            alt: 'Современное переосмысление моря',
          },
        ],
      },
    ],
  },
  'metal-plant': {
    heading: 'Заголовок',
    body: 'Текст',
    sections: [
      {
        heading: 'Выбор места для завода',
        type: 'video',
        src: metalPlantLocationVideoSrc,
        audio: metalPlantLocationAudioSrc,
          poster: preview4,
        subtitlesUrl: metalPlantLocationSubtitlesUrl,
        subtitles: metalPlantLocationSubtitles,
      },
      {
        heading: 'Строительство медеплавильного завода',
        type: 'video',
        src: metalPlantConstructionVideoSrc,
        audio: metalPlantConstructionAudioSrc,
          poster: preview5,
        subtitlesUrl: metalPlantConstructionSubtitlesUrl,
        subtitles: metalPlantConstructionSubtitles,
      },
      {
        heading: 'Заводской посёлок',
        type: 'video',
        src: metalPlantVillageVideoSrc,
        audio: metalPlantVillageAudioSrc,
          poster: preview6,
        subtitlesUrl: metalPlantVillageSubtitlesUrl,
        subtitles: metalPlantVillageSubtitles,
      },
    ],
  },
  excavation: {
    heading: 'Заголовок',
    body: 'Текст',
    sections: [
      {
        heading: 'Железнодорожные мастерские',
        type: 'video',
        src: workshopVideoSrc,
        audio: workshopAudioSrc,
          poster: preview7,
        subtitlesUrl: workshopSubtitlesUrl,
        subtitles: workshopSubtitles,
      },
      {
        heading: 'Бронепоезда',
        type: 'video',
        src: armoredTrainsVideoSrc,
          poster: preview8,
        audio: armoredTrainsAudioSrc,
        subtitlesUrl: armoredTrainSubtitlesUrl,
        subtitles: armoredTrainSubtitles,
      },
    ],
  },
  railway: {
    heading: 'Археологические находки',
    body: 'Небольшая подборка 3D-моделей артефактов из раскопок.',
    sections: [
      {
        heading: 'Археологические находки',
        type: 'models',
        hint: 'Коснитесь и проведите,<br> чтобы вращать объект',
        models: [
          {
            title: 'Чаша от курительной трубки',
            src: pipeModel,
            alt: '3D-модель фрагмента трубки',
            audio: pipeModelAudioSrc,
            subtitles: pipeModelSubtitles,
            subtitlesUrl: pipeModelSubtitlesUrl,
          },
          {
            title: 'Печной изразец',
            src: tileModel,
            alt: '3D-модель печного изразца',
            audio: tileModelAudioSrc,
            subtitles: tileModelSubtitles,
            subtitlesUrl: tileModelSubtitlesUrl,
          },
          {
            title: 'Керамический горшок',
            src: potModel,
            alt: '3D-модель глиняного горшка',
            audio: potModelAudioSrc,
            subtitles: potModelSubtitles,
            subtitlesUrl: potModelSubtitlesUrl,
          },
        ],
      },
      {
        heading: 'Соликамский тракт',
        type: 'video',
        src: solikamskyTrackVideoSrc,
        audio: solikamskyTrackAudioSrc,
          poster: preview10,
        subtitlesUrl: solikamskyTrackSubtitlesUrl,
        subtitles: solikamskyTrackSubtitles,
      },
      {
        heading: 'Деревни вдоль дороги',
        type: 'video',
        src: villagesVideoSrc,
        audio: villagesAudioSrc,
          poster: preview9,
        subtitlesUrl: villagesSubtitlesUrl,
        subtitles: villagesSubtitles,
      },
    ],
  },
  final: {
    heading: 'Финал маршрута',
    body: 'Завершение истории и приглашение к финальным активностям.',
    sections: [
      {
        heading: 'Голос финала',
        type: 'audio',
        src: finalAudioSrc,
        artwork: voiceIllustration,
        background: onboardingGolosLogo,
        backgroundOverlay: onboardingGolosLogo,
        logo: logoList,
        subtitles: finalSubtitles,
      },
    ],
  },
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: 'История места',
    body: 'Открывайте исторические «сторис» — видео, панорамы, артефакты и аудиогида',
    image: historyIllustration,
    imageAlt: 'Фотографии исторических зданий и экспозиции',
    collagePlaceholder: true,
    collageImages: [boardingPhoto1, boardingPhoto2, boardingPhoto3],
  },
  {
    title: 'Голос времени',
    body:
      'Ваш гид, который проведёт через историю Перми от пермского периода до сегодняшнего дня. Его рассказ создан с помощью нейросети ГИГАЧАТ от Сбера',
    image: voiceNewIllustration,
    backgroundImage: onboardingGolosLogo,
    backgroundConfig: {
      position: 'center 83px',
      size: '88%',
      filter: 'none',
      transform: 'none',
    },
    classStr: 'golos',
    imageAlt: 'Абстрактный шар Голоса времени',
  },
  {
    title: 'Находите QR-коды для активации',
    body:
      'Находите QR-коды в галерее и сканируйте их, чтобы получить доступ к новым частям исторического маршрута',
    image: qrIllustration,
    classStr: 'qr',
    imageAlt: 'QR-код для активации маршрута',
  },
]

export const initialMapPositions: Record<number, MapPosition> = {
  1: { x: -120, y: -90 },
  2: { x: -100, y: -120 },
  3: { x: -110, y: -110 },
}
