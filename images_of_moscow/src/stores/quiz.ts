export type QuizQuestion = {
  id: number
  text: string
  paint: number
  options: {
    text: string
    valid: boolean
  }[]
}

export type Quiz = {
  questions: QuizQuestion[]
  currentQuestion: number
  score: number
  finished: boolean
  finishAnimated: boolean
  highlightQuizAnswer: {
    num: number
    style: string
  }
}

export const quizContent: QuizQuestion[] = [
  {
    id: 1,
    text: "Какой известный исторический объект изображен на&nbsp;картине?",
    paint: 3,
    options: [
      {
        text: "Храм Воскресения Христова на&nbsp;крови́",
        valid: false,
      },
      {
        text: "Собо́р Покрова́ Пресвято́й Богоро́дицы, что на&nbsp;Рву",
        valid: true,
      },
      {
        text: "Новодевичий монастырь",
        valid: false,
      },
    ],
  },
  {
    id: 2,
    text: "Портрет какого сановника изображён с&nbsp;бескровным лицом, стёртыми чертами и&nbsp;тусклым взглядом?",
    paint: 1,
    options: [
      {
        text: "Победоносцев",
        valid: true,
      },
      {
        text: "Бобринский",
        valid: false,
      },
      {
        text: "Плеве",
        valid: false,
      },
    ],
  },
  {
    id: 3,
    text: "Когда Суриков нашёл настоящее лицо Разина?",
    paint: 2,
    options: [
      {
        text: "До начала работы над картиной",
        valid: false,
      },
      {
        text: "Во время работы над картиной",
        valid: false,
      },
      {
        text: "После продажи картины",
        valid: true,
      },
    ],
  },
  {
    id: 4,
    text: "Какая станция метро изображена на картине?",
    paint: 5,
    options: [
      {
        text: "Курская",
        valid: false,
      },
      {
        text: "Смоленская",
        valid: false,
      },
      {
        text: "Площадь Революции",
        valid: true,
      },
    ],
  },
  {
    id: 5,
    text: "К какому празднику было приурочено Подновинское гулянье?",
    paint: 4,
    options: [
      {
        text: "Пасха",
        valid: true,
      },
      {
        text: "Рождество",
        valid: false,
      },
      {
        text: "Крещение",
        valid: false,
      },
    ],
  },
]
