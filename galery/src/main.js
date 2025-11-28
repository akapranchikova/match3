import './style.css'

const app = document.querySelector('#app')

const STORAGE_KEY = 'gallery-viewed-points'

const points = [
  {
    id: 'history',
    title: 'Создание и история галереи',
    description:
      'Коротко рассказываем, как появилось здание и почему оно стало домом новой галереи.',
    map: { x: 18, y: 30 },
  },
  {
    id: 'perm-period',
    title: 'Пермский период, пермское море и геология',
    description: 'История пермского периода и артефакты, которые нашли неподалёку.',
    map: { x: 45, y: 18 },
  },
  {
    id: 'metal-plant',
    title: 'Медеплавильный завод и история посёлка',
    description: 'Как промышленность повлияла на развитие территории и людей.',
    map: { x: 72, y: 22 },
  },
  {
    id: 'excavation',
    title: 'История археологических раскопок',
    description: 'Находки и открытия, которые легли в основу экспозиции.',
    map: { x: 65, y: 54 },
  },
  {
    id: 'railway',
    title: 'Железная дорога — будущий завод Шпагина',
    description: 'Как железная дорога изменила экономику места и городскую ткань.',
    map: { x: 36, y: 60 },
  },
  {
    id: 'final',
    title: 'Финальная точка',
    description: 'Завершение маршрута и приглашение поделиться впечатлениями.',
    map: { x: 50, y: 78 },
  },
]

const onboardingSlides = [
  {
    title: 'История места',
    body:
      'Открывайте исторические «сторис» — видео, панорамы, артефакты и аудиогида.',
  },
  {
    title: 'Голос времени',
    body:
      'Гид — это не человек, а дух самого места. «Голос времени» будет главным проводником в историю Перми и новой галереи. Голос отражает философию места от древнего пермского периода до современного времени.',
  },
  {
    title: 'Используйте наушники',
    body:
      'Большая часть маршрута сопровождается аудио-историями. Чтобы ничего не пропустить — наденьте наушники. Если наушников нет, то всегда будут субтитры.',
  },
]

const loadViewed = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return new Set()
  try {
    const parsed = JSON.parse(stored)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch (err) {
    console.warn('Не удалось прочитать просмотренные точки', err)
    return new Set()
  }
}

const saveViewed = (set) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
}

let viewedPoints = loadViewed()

const state = {
  screen: 'onboardingSlide',
  slideIndex: 0,
  currentPointIndex: 0,
  mapPosition: { x: -140, y: -110 },
}

const render = () => {
  const screen = {
    onboardingPrompt: renderHeadphonesPrompt,
    onboardingSlide: renderOnboardingSlide,
    pointInfo: renderPointInfo,
    infoComplete: renderInfoComplete,
    nextPoint: renderNextPoint,
    routeList: renderRouteList,
    scanner: renderScanner,
    map: renderMap,
  }[state.screen]

  if (screen) {
    app.innerHTML = ''
    app.appendChild(screen())
  }
}

const createButton = (label, variant = 'primary') => {
  const button = document.createElement('button')
  button.textContent = label
  button.className = `button ${variant}`
  return button
}

const renderCard = ({ title, body, showProgress }) => {
  const container = document.createElement('section')
  container.className = 'card'

  if (showProgress) {
    container.classList.add('card--onboarding')

    const progress = document.createElement('div')
    progress.className = 'progress'
    progress.innerHTML = '<span class="progress__bar"></span>'
    progress.style.setProperty('--step', state.slideIndex + 1)
    progress.style.setProperty('--total', onboardingSlides.length)
    container.appendChild(progress)
  }

  const content = document.createElement('div')
  content.className = 'card__content'

  const header = document.createElement('header')
  header.className = 'card__header'
  header.innerHTML = '<span class="card__meta">Пермская галерея × Сбер × GigaChat</span>'
  content.appendChild(header)

  const h1 = document.createElement('h1')
  h1.textContent = title
  content.appendChild(h1)

  const p = document.createElement('p')
  p.textContent = body
  content.appendChild(p)

  const preview = document.createElement('div')
  preview.className = 'card__preview'
  preview.innerHTML = '<div class="preview__placeholder"></div>'
  content.appendChild(preview)

  container.appendChild(content)

  const action = createButton('Далее')
  action.addEventListener('click', () => {
    if (state.screen === 'onboardingSlide') {
      const nextSlide = state.slideIndex + 1
      if (nextSlide >= onboardingSlides.length) {
        state.screen = 'onboardingPrompt'
      } else {
        state.slideIndex = nextSlide
      }
    } else {
      handleFinishPoint()
    }
    render()
  })

  const footer = document.createElement('div')
  footer.className = 'card__footer'
  footer.appendChild(action)
  container.appendChild(footer)

  return container
}

const renderOnboardingSlide = () => {
  const slide = onboardingSlides[state.slideIndex]
  return renderCard({
    title: slide.title,
    body: slide.body,
    showProgress: true,
  })
}

const renderHeadphonesPrompt = () => {
  const overlay = document.createElement('div')
  overlay.className = 'overlay'

  const modal = document.createElement('div')
  modal.className = 'modal'

  const title = document.createElement('h2')
  title.textContent = 'Будете ли использовать наушники?'
  modal.appendChild(title)

  const description = document.createElement('p')
  description.textContent = 'Рекомендуем слушать гид, но если нет возможности — будут субтитры.'
  modal.appendChild(description)

  const yes = createButton('Да, уже подключил')
  yes.addEventListener('click', () => {
    state.screen = 'pointInfo'
    render()
  })

  const no = createButton('Нет, буду читать субтитры', 'secondary')
  no.addEventListener('click', () => {
    state.screen = 'pointInfo'
    render()
  })

  modal.appendChild(yes)
  modal.appendChild(no)
  overlay.appendChild(modal)
  return overlay
}

const renderPointInfo = () => {
  const point = points[state.currentPointIndex]
  const section = document.createElement('section')
  section.className = 'card'

  const meta = document.createElement('div')
  meta.className = 'card__meta card__meta--inline'
  meta.textContent = 'Маршрут «Голос времени»'
  section.appendChild(meta)

  const h1 = document.createElement('h1')
  h1.textContent = point.title
  section.appendChild(h1)

  const p = document.createElement('p')
  p.textContent = point.description
  section.appendChild(p)

  const preview = document.createElement('div')
  preview.className = 'card__preview large'
  preview.innerHTML = '<div class="preview__placeholder"></div>'
  section.appendChild(preview)

  const finish = createButton('Закончить точку')
  finish.addEventListener('click', () => {
    handleFinishPoint()
    render()
  })
  section.appendChild(finish)

  return section
}

const handleFinishPoint = () => {
  viewedPoints.add(points[state.currentPointIndex].id)
  saveViewed(viewedPoints)
  state.screen = 'infoComplete'
}

const renderInfoComplete = () => {
  const remaining = points.length - viewedPoints.size
  const overlay = document.createElement('div')
  overlay.className = 'overlay'

  const modal = document.createElement('div')
  modal.className = 'modal'

  const title = document.createElement('h2')
  title.textContent = 'Хотите ли продолжить экскурсию от Голоса времени?'
  modal.appendChild(title)

  const meta = document.createElement('p')
  meta.textContent = remaining > 0 ? `Впереди ещё ${remaining} истории` : 'Вы посмотрели все точки маршрута.'
  modal.appendChild(meta)

  const primary = createButton('Да, узнать, где следующая точка')
  primary.addEventListener('click', () => {
    const nextIndex = Math.min(state.currentPointIndex + 1, points.length - 1)
    state.currentPointIndex = nextIndex
    state.screen = 'nextPoint'
    render()
  })

  const secondary = createButton('Нет, открыть весь маршрут', 'secondary')
  secondary.addEventListener('click', () => {
    state.screen = 'routeList'
    render()
  })

  modal.appendChild(primary)
  modal.appendChild(secondary)
  overlay.appendChild(modal)
  return overlay
}

const renderNextPoint = () => {
  const point = points[state.currentPointIndex]
  const card = document.createElement('section')
  card.className = 'card card--with-image'

  const location = document.createElement('p')
  location.className = 'accent'
  location.textContent = `Где находится точка ${state.currentPointIndex + 1}?`
  card.appendChild(location)

  const h1 = document.createElement('h1')
  h1.textContent = point.title
  card.appendChild(h1)

  const desc = document.createElement('p')
  desc.textContent = point.description
  card.appendChild(desc)

  const image = document.createElement('div')
  image.className = 'photo'
  image.innerHTML = '<div class="photo__highlight"></div>'
  card.appendChild(image)

  const actions = document.createElement('div')
  actions.className = 'stack'

  const scan = createButton('Отсканировать точку')
  scan.addEventListener('click', () => {
    state.screen = 'scanner'
    render()
  })

  const routeButton = createButton('Открыть весь маршрут', 'secondary')
  routeButton.addEventListener('click', () => {
    state.screen = 'routeList'
    render()
  })

  const mapLink = document.createElement('a')
  mapLink.href = '#'
  mapLink.className = 'link'
  mapLink.textContent = 'Открыть на карте'
  mapLink.addEventListener('click', (e) => {
    e.preventDefault()
    state.screen = 'map'
    render()
  })

  card.appendChild(mapLink)
  actions.appendChild(scan)
  actions.appendChild(routeButton)
  card.appendChild(actions)

  return card
}

const renderRouteList = () => {
  const container = document.createElement('div')
  container.className = 'route'

  const h1 = document.createElement('h1')
  h1.textContent = 'Начнём же маршрут!'
  container.appendChild(h1)

  const subtitle = document.createElement('p')
  subtitle.className = 'muted'
  subtitle.textContent = 'Сканируйте QR-код в зале или выберите точку здесь'
  container.appendChild(subtitle)

  const list = document.createElement('div')
  list.className = 'route__list'

  points.forEach((point, index) => {
    const item = document.createElement('article')
    item.className = 'route__item'

    const thumb = document.createElement('div')
    thumb.className = 'route__thumb'
    thumb.innerHTML = '<div class="preview__placeholder"></div>'

    const info = document.createElement('div')
    info.className = 'route__info'

    const title = document.createElement('h3')
    title.textContent = point.title
    info.appendChild(title)

    if (viewedPoints.has(point.id)) {
      const status = document.createElement('span')
      status.className = 'status status--done'
      status.textContent = 'Просмотрено'
      info.appendChild(status)
    }

    item.appendChild(thumb)
    item.appendChild(info)

    item.addEventListener('click', () => {
      state.currentPointIndex = index
      state.screen = 'pointInfo'
      render()
    })

    list.appendChild(item)
  })

  container.appendChild(list)

  const promo = document.createElement('div')
  promo.className = 'promo'
  promo.innerHTML = `<h3>Создайте фото в историческом стиле!</h3><p>В ИИ-фотозоне на 1 этаже, рядом с гардеробом</p>`
  container.appendChild(promo)

  const cta = createButton('Сканировать QR-код')
  cta.addEventListener('click', () => {
    state.screen = 'scanner'
    render()
  })
  container.appendChild(cta)

  return container
}

const renderMap = () => {
  const point = points[state.currentPointIndex]
  const container = document.createElement('section')
  container.className = 'map'

  const title = document.createElement('h1')
  title.textContent = 'Карта музея'
  container.appendChild(title)

  const subtitle = document.createElement('p')
  subtitle.className = 'muted'
  subtitle.textContent = 'Передвигайте карту, чтобы найти нужную точку и нажмите на неё.'
  container.appendChild(subtitle)

  const viewport = document.createElement('div')
  viewport.className = 'map__viewport'

  const inner = document.createElement('div')
  inner.className = 'map__inner'
  const applyTransform = () => {
    inner.style.transform = `translate(${state.mapPosition.x}px, ${state.mapPosition.y}px)`
  }
  applyTransform()

  const grid = document.createElement('div')
  grid.className = 'map__grid'
  inner.appendChild(grid)

  const mapImage = document.createElement('div')
  mapImage.className = 'map__image'
  inner.appendChild(mapImage)

  points.forEach((item, index) => {
    const marker = document.createElement('button')
    marker.className = 'map__marker'
    marker.style.left = `${item.map.x}%`
    marker.style.top = `${item.map.y}%`
    marker.title = item.title
    marker.innerHTML = `<span class="map__marker-dot"></span><span class="map__marker-label">${index + 1}</span>`

    marker.addEventListener('click', (event) => {
      event.stopPropagation()
      state.currentPointIndex = index
      state.screen = 'nextPoint'
      render()
    })

    if (index === state.currentPointIndex) {
      marker.classList.add('is-active')
    }

    inner.appendChild(marker)
  })

  const dragState = { active: false, start: { x: 0, y: 0 }, origin: { x: 0, y: 0 } }

  const startDrag = (event) => {
    dragState.active = true
    dragState.start = { x: event.clientX, y: event.clientY }
    dragState.origin = { ...state.mapPosition }
    viewport.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event) => {
    if (!dragState.active) return
    const deltaX = event.clientX - dragState.start.x
    const deltaY = event.clientY - dragState.start.y
    state.mapPosition = { x: dragState.origin.x + deltaX, y: dragState.origin.y + deltaY }
    applyTransform()
  }

  const endDrag = (event) => {
    if (!dragState.active) return
    dragState.active = false
    viewport.releasePointerCapture(event.pointerId)
  }

  viewport.addEventListener('pointerdown', startDrag)
  viewport.addEventListener('pointermove', moveDrag)
  viewport.addEventListener('pointerup', endDrag)
  viewport.addEventListener('pointercancel', endDrag)

  viewport.appendChild(inner)
  container.appendChild(viewport)

  const hint = document.createElement('div')
  hint.className = 'map__hint'
  hint.innerHTML = '<span class="hint__icon">👆</span> Передвигайте карту и нажмите на точку маршрута'
  container.appendChild(hint)

  const actions = document.createElement('div')
  actions.className = 'stack'

  const focusButton = createButton(`Перейти к точке ${state.currentPointIndex + 1}`, 'primary')
  focusButton.addEventListener('click', () => {
    state.screen = 'nextPoint'
    render()
  })

  const routeButton = createButton('Открыть весь маршрут', 'secondary')
  routeButton.addEventListener('click', () => {
    state.screen = 'routeList'
    render()
  })

  actions.appendChild(focusButton)
  actions.appendChild(routeButton)
  container.appendChild(actions)

  const caption = document.createElement('p')
  caption.className = 'muted'
  caption.textContent = `Текущая точка: ${point.title}`
  container.appendChild(caption)

  return container
}

const renderScanner = () => {
  const wrapper = document.createElement('div')
  wrapper.className = 'scanner'

  const title = document.createElement('h1')
  title.textContent = 'Сканер QR-кода'
  wrapper.appendChild(title)

  const text = document.createElement('p')
  text.textContent = 'В реальном приложении здесь откроется камера для сканирования следующей точки маршрута.'
  wrapper.appendChild(text)

  const back = createButton('Вернуться к маршруту', 'secondary')
  back.addEventListener('click', () => {
    state.screen = 'routeList'
    render()
  })
  wrapper.appendChild(back)

  return wrapper
}

render()
