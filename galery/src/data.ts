import { MapPosition, OnboardingSlide, PointContentConfig, RoutePoint } from './types'
import historyIllustration from './assets/onboarding-history.png'
import voiceIllustration from './assets/onboarding-voice.png'
import qrIllustration from './assets/onboarding-qr.svg'
import pointPlaceholder from './assets/point-placeholder.svg'
import guideBackground from './assets/guide-background.png'
import guideIntroAudio from './assets/guide-intro.wav'
import onboardingGolosLogo from './assets/onboarding-golos-logo.svg'
import boardingPhoto1 from './assets/boarding-1/photo-1.png'
import boardingPhoto2 from './assets/boarding-1/photo-2.png'
import boardingPhoto3 from './assets/boarding-1/photo-3.png'
import point1Video from './assets/points/1/point-1.mp4'
import pipeModel from './assets/points/5/Out_smoke-tube.glb?url'
import tileModel from './assets/points/5/Out_stove-pile.glb?url'
import potModel from './assets/points/5/Out_ceramic-pot.glb?url'

export const STORAGE_KEY = 'gallery-viewed-points'

export const points: RoutePoint[] = [
  {
    id: 'history',
    title: 'Создание и история галереи',
    description: 'На 1 этаже около гардероба',
    period: '21 век',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Новая галерея выросла на месте, где промышленная история встречается с культурой. Здесь сохранились следы дореволюционного комплекса и его трансформации в современное общественное пространство.',
    highlights: [
      'первые чертежи здания и идея построить общественное место вокруг искусства',
      'кто финансировал строительство и какие архитекторы задали стиль',
      'как галерея открывалась для горожан и какие традиции сохранились до сегодня',
    ],
    map: { floor: 1, x: 28, y: 80 },
  },
  {
    id: 'perm-period',
    title: 'Пермское море, пермский период,  и геология',
    description: 'История пермского периода и артефакты, которые нашли неподалёку.',
    period: '298 млн лет назад',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Маршрут начинается с древностей: миллионы лет назад на этом месте плескалось море. Экспозиция рассказывает, как оно сформировало ландшафт, а археологи находят здесь следы вымерших существ.',
    highlights: [
      'какие ископаемые помогают представить климат того времени',
      'как пермский период повлиял на название региона и символику выставки',
      'почему образ «моря» стал главной метафорой вступления',
    ],
    map: { floor: 1, x: 56, y: 62 },
  },
  {
    id: 'metal-plant',
    title: 'Медеплавильный завод и история посёлка',
    description: 'Как промышленность повлияла на развитие территории и людей.',
    period: '18 век',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Индустриальная линия маршрута посвящена медеплавильному заводу, вокруг которого вырос посёлок. Здесь рассказывают о первых рабочих артели, их быте и том, как производство меняло экономику края.',
    highlights: [
      'что производили на заводе и куда отправляли готовую продукцию',
      'как менялась жизнь посёлка после появления предприятия',
      'какие детали интерьера напоминают о промышленном прошлом',
    ],
    map: { floor: 2, x: 74, y: 34 },
  },
  {
    id: 'excavation',
    title: 'Железная дорога — будущий завод Шпагина',
    description: 'Находки и открытия, которые легли в основу экспозиции.',
    period: '19 век',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Экспозиция показывает, как археологи шаг за шагом собирали фрагменты истории. Это и полевые дневники, и инструменты, и редкие находки, которые помогли восстановить картину жизни ранних жителей.',
    highlights: [
      'ключевые экспедиции, благодаря которым пополнилась коллекция',
      'что археологи искали в первую очередь и почему',
      'как находки влияют на современные представления об истории Перми',
    ],
    map: { floor: 2, x: 68, y: 38 },
  },
  {
    id: 'railway',
    title: 'История археологических раскопок',
    description: 'Как железная дорога изменила экономику места и городскую ткань.',
    period: '21 век',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Отдельный зал посвящён железной дороге: она связала город с новыми рынками и задала ритм будущему заводу Шпагина. Истории пассажиров и работников железной дороги создают живое ощущение пути.',
    highlights: [
      'какие маршруты проходили через станцию и чем они были важны',
      'как железная дорога помогла появиться заводу Шпагина и новым профессиям',
      'почему железнодорожные мотивы стали визуальным кодом современного пространства',
    ],
    map: { floor: 3, x: 38, y: 54 },
  },
  {
    id: 'final',
    title: 'Финальная точка',
    description: 'Завершение маршрута и приглашение поделиться впечатлениями.',
    period: '21 век',
    photo: pointPlaceholder,
    photoAlt: 'Предварительный снимок точки маршрута',
    longDescription:
      'Финал маршрута — пространство для обратной связи и вдохновения. Здесь можно поделиться впечатлениями, узнать о будущих выставках и почувствовать, что история продолжается уже с вашим участием.',
    highlights: [
      'как оставить отзыв и помочь команде улучшить маршрут',
      'где узнать о ближайших событиях и новых выставках',
      'какие зоны отдыха и фото-точки стоит посетить перед уходом',
    ],
    map: { floor: 3, x: 46, y: 72 },
  },
]

const sampleVideoSrc = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const sampleSubtitle = [
  'Это место для субтитров, где будет текст Голоса.',
  'Листайте снизу вверх, чтобы перейти к следующему сюжету.',
]

export const pointContentConfigs: Record<string, PointContentConfig> = {
  history: {
    heading: 'Заголовок',
    body: 'Текст',
    sections: [
      {
        heading: 'Создание и история галереи',
        type: 'video',
        src: sampleVideoSrc,
        subtitles: [],
      },
    ],
  },
  'perm-period': {
    heading: 'Заголовок',
    body: 'Текст',
    sections: [
      {
        heading: 'Вступление о пермском море',
        type: 'video',
        src: sampleVideoSrc,
        poster: pointPlaceholder,
        subtitles: sampleSubtitle,
      },
      {
        heading: 'Карточки с фактами',
        type: 'cards',
        cards: [
          {
            title: 'Пермское море',
            text: 'История древнего моря и рельефов, которые сформировали ландшафт.',
            image:
              'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
            alt: 'Скалы у воды',
          },
          {
            title: 'Следы эпохи',
            text: 'Кадры находок археологов и интерпретации научной группы.',
            image:
              'https://images.unsplash.com/photo-1517824748781-84db05733291?auto=format&fit=crop&w=1200&q=80',
            alt: 'Каменные слои',
          },
          {
            title: 'Современность',
            text: 'Как образ моря стал метафорой всей экспозиции и визуального кода.',
            image:
              'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
            alt: 'Береговая линия',
          },
        ],
      },
      {
        heading: 'Истории моря',
        type: 'audio',
        src: guideIntroAudio,
        artwork: voiceIllustration,
        background: guideBackground,
        subtitles: sampleSubtitle,
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
        hint: 'Коснитесь и проведите, чтобы вращать объект',
        models: [
          {
            title: 'Чаша от курительной трубки',
            src: pipeModel,
            alt: '3D-модель фрагмента трубки',
          },
          {
            title: 'Печной изразец',
            src: tileModel,
            alt: '3D-модель печного изразца',
          },
          {
            title: 'Керамический горшок',
            src: potModel,
            alt: '3D-модель глиняного горшка',
          },
        ],
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
    image: voiceIllustration,
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
