interface ArchetypeCard {
    id: number;
    title: string;
    description: string;
    composition: Record<string, number>;
    art: string;
    tutorial?: boolean;
    tutorialLabel?: string;
    icon?: string;
    tutorialSubtext?: string;
    requiredDirection?: 'right' | 'left';
}

interface ArchetypeResult {
    name: string;
    percent: number;
    description: string;
}

const archetypeDescriptions: Record<string, string> = {
    Дитя: 'Вы воплощение искренности, спонтанности и беззаботной радости. Способны видеть мир с доверчивым изумлением, жить эмоциями, творить из удовольствия и находить волшебство в простом.',
    'Славный малый': 'Вы — воплощение стабильности и преданности своему кругу. Ваша сила в верности традициям, умении поддерживать гармонию в коллективе и создавать ту самую крепкую основу, на которой держится доверие и порядок.',
    Воин: 'Вы — человек действия, чья сила и целеустремленность ведут к победам, но иногда граничат с излишней напористостью. Сила духа и железная воля помогают вам преодолевать препятствия и вдохновлять других.',
    Опекун: 'Ваше призвание — создавать уют, заботиться о близких и оберегать семейные ценности. Вы превращаете дом в крепость тепла и поддержки, а ваша мудрость и хозяйственность становятся основой для гармонии.',
    Искатель: 'Вы — вдохновленный исследователь, для которого мир полон тайн, требующих разгадки. Ваша миссия — выйти за рамки обыденного, глубоко познавать суть, постоянно расширять горизонты своего «я».',
    Бунтарь: 'Вы – сила трансформации, вызов скучным и устаревшим правилам. Ваш дерзкий дух помогает идти в новое и менять устоявшееся.',
    Эстет: 'Для вас красота и утончённость — высшие ценности, а стремление к гармонии и изяществу становится образом жизни. Это истинная любовь к себе, где жизнь становится произведением искусства.',
    Творец: 'Вы — генератор идей и воплощённой гармонии. Через принятие себя вы открыли в себе источник изобилия, и теперь с лёгкостью и радостью транслируете свой уникальный взгляд на мир.',
    Правитель: 'Вы — стратег и созидатель. Ваша сила в способности превратить творческий хаос в гармоничный порядок. Вы умеете принимать сложные решения и ведёте других к общей ясной цели.',
    Маг: 'Вы — визионер. Вы не просто следуете трендам — вы создаёте их, очаровывая аудиторию ясностью мысли и силой убеждения. Реальность начинается с идеи, а вы — её главный творец.',
    Мудрец: 'Вы — живая энциклопедия и философ в одном лице. Ваша сила в умении превращать информацию в мудрость и делиться ею, ведя других к пониманию.',
    Шут: 'Вы — мудрый наблюдатель, для которого жизнь — увлекательная игра. Вы видите мир без иллюзий, но с любопытством и добрым юмором. Легко пробуете новое и вдохновляете других своей свободой быть собой.'
};

import likeIconUrl from './assets/elements/like.svg?url'
import dislikeIconUrl from './assets/elements/dislike.svg?url'
import likeHelpIconUrl from './assets/elements/helpLike.svg?url'
import dislikeHelpIconUrl from './assets/elements/helpDislike.svg?url'


const resultImageKeyByArchetype: Record<string, string> = {
    Дитя: 'ditya',
    'Славный малый': 'slavnyy',
    Воин: 'voin',
    Опекун: 'opekun',
    Искатель: 'iskatel',
    Бунтарь: 'buntar',
    Эстет: 'estet',
    Творец: 'tvorec',
    Правитель: 'pravitel',
    Маг: 'mag',
    Мудрец: 'mudrec',
    Шут: 'shut',
}

interface ArchetypeColor {
    bg: string;
    button: string;
}

const resultColorKeyByArchetype: Record<string, ArchetypeColor> = {
    Дитя: {
        bg: '#F0DDDB',
        button: `linear-gradient(180deg, #461C06 0%, #2B0404 100%)`
    },
    'Славный малый':  {
        bg: '#C3DDED',
        button: `linear-gradient(180deg, #062A46 0%, #04172B 100%)`
    },
    Воин:  {
        bg: '#B03C34',
        button: `linear-gradient(180deg, #461C06 0%, #2B0404 100%)`
    },
    Опекун:  {
        bg: '#89663E',
        button: `linear-gradient(180deg, #463106 0%, #2B1A04 100%)`
    },
    Искатель:  {
        bg: '#6D9B70',
        button: `linear-gradient(180deg, #064633 0%, #032A2D 100%)`
    },
    Бунтарь:  {
        bg: '#252722',
        button: `linear-gradient(180deg, #212121 0%, #131313 100%)`
    },
    Эстет:  {
        bg: '#F1F0EE',
        button: `linear-gradient(180deg, #212121 0%, #131313 100%)`
    },
    Творец:  {
        bg: '#F0CC4E',
        button: `linear-gradient(180deg, #463106 0%, #2B1A04 100%)`
    },
    Правитель:  {
        bg: '#842E5D',
        button: `linear-gradient(180deg, #560E35 0%, #1D0612 100%)`
    },
    Маг:  {
        bg: '#563D78',
        button: `linear-gradient(180deg, #2E0E56 0%, #17061D 100%)`
    },
    Мудрец:  {
        bg: '#1C3C7D',
        button: `linear-gradient(180deg, #061946 0%, #04022C 100%)`
    },
    Шут:  {
        bg: '#E49E39',
        button: `linear-gradient(180deg, #463106 0%, #2B1A04 100%)`
    },
}

const cardImages = Array.from({length: 24}, (_, idx) => `src/assets/cards/card-${String(idx + 1).padStart(2, '0')}.jpg?url`);

const preloadCache = new Set<string>();
function preloadImage(src: string) {
    if (!src || preloadCache.has(src)) return;

    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    preloadCache.add(src);
}

const baseCards: ArchetypeCard[] = [
    {
        id: 1,
        title: 'Дитя 100%',
        description: 'Вам нравится действовать по первому импульсу и радоваться простым вещам.',
        composition: {Дитя: 1},
        art: cardImages[0]
    },
    {
        id: 2,
        title: 'Творец 100%',
        description: 'Вам интересно придумывать нестандартные решения и соединять разное.',
        composition: {Творец: 1},
        art: cardImages[1]
    },
    {
        id: 3,
        title: 'Воин 100%',
        description: 'Вам по духу собраться, поставить цель и идти к результату.',
        composition: {Воин: 1},
        art: cardImages[2]
    },
    {
        id: 4,
        title: 'Опекун 100%',
        description: 'Вам важно, чтобы рядом было спокойно, надёжно и с заботой о людях.',
        composition: {Опекун: 1},
        art: cardImages[3]
    },
    {
        id: 5,
        title: 'Искатель 100%',
        description: 'Вас тянет пробовать новое и выходить за привычные рамки.',
        composition: {Искатель: 1},
        art: cardImages[4]
    },
    {
        id: 6,
        title: 'Правитель 100%',
        description: 'Вам важно, чтобы всё было организовано и работало как чёткая система.',
        composition: {Правитель: 1},
        art: cardImages[5]
    },
    {
        id: 7,
        title: 'Дитя/Шут 60/40',
        description: 'Вам свойственна искренность и живой отклик, потом игра и ирония.',
        composition: {Дитя: 0.6, Шут: 0.4},
        art: cardImages[6]
    },
    {
        id: 8,
        title: 'Творец/Эстет 60/40',
        description: 'Сначала в вас рождается смелая идея, потом аккуратная её подача.',
        composition: {Творец: 0.6, Эстет: 0.4},
        art: cardImages[7]
    },
    {
        id: 9,
        title: 'Воин/Бунтарь 60/40',
        description: 'Вам важнее дисциплина и цель, дерзость на втором плане.',
        composition: {Воин: 0.6, Бунтарь: 0.4},
        art: cardImages[8]
    },
    {
        id: 10,
        title: 'Опекун/Славный 60/40',
        description: 'В первую очередь поддержка и забота, затем простота общения.',
        composition: {Опекун: 0.6, 'Славный малый': 0.4},
        art: cardImages[9]
    },
    {
        id: 11,
        title: 'Искатель/Мудрец 60/40',
        description: 'Сначала опыт и эксперименты, затем глубокое осмысление.',
        composition: {Искатель: 0.6, Мудрец: 0.4},
        art: cardImages[10]
    },
    {
        id: 12,
        title: 'Правитель/Маг 60/40',
        description: 'В вас преобладает порядок и структура, затем — аккуратное изменение привычного, как небольшой рабочий «трюк».',
        composition: {Правитель: 0.6, Маг: 0.4},
        art: cardImages[11]
    },
    {
        id: 13,
        title: 'Правитель/Бунтарь 70/30',
        description: 'В вас преобладает порядок: вам важно, чтобы всё было организовано, но иногда вы допускаете немного свободы для эксперимента.',
        composition: {Правитель: 0.7, Бунтарь: 0.3},
        art: cardImages[12]
    },
    {
        id: 14,
        title: 'Правитель/Бунтарь 30/70',
        description: 'На первом плане разрыв шаблонов и смелые решения, но при этом минимальные рамки вы всё же сохраняете.',
        composition: {Правитель: 0.3, Бунтарь: 0.7},
        art: cardImages[13]
    },
    {
        id: 15,
        title: 'Эстет/Воин 70/30',
        description: 'Вам ближе чёткая, аккуратная форма, а для выразительности можете добавить немного движения.',
        composition: {Эстет: 0.7, Воин: 0.3},
        art: cardImages[14]
    }
];

const tutorialStorageKey = 'archetypeTutorialSeen';
const hasSeenTutorial = localStorage.getItem(tutorialStorageKey) === 'true';

const tutorialCards: ArchetypeCard[] = [
    {
        id: -1,
        title: 'Правила — свайп вправо',
        description:
            'Смахните вправо – если утверждение откликается вам.',
        tutorialSubtext: 'Оно частично или полностью отражает Вас и ваши действия в жизни.',
        composition: {},
        art: cardImages[1],
        tutorial: true,
        icon: likeHelpIconUrl,
        tutorialLabel: 'КАК ПОЛЬЗОВАТЬСЯ',
        requiredDirection: 'right'
    },
    {
        id: -2,
        title: 'Правила — свайп влево',
        description:
            'Смахните влево – если утверждение вам не подходит.',
        tutorialSubtext: 'Оно частично или полностью противоположно описанию Вас и ваших действий в жизни.',
        composition: {},
        art: cardImages[0],
        tutorial: true,
        icon: dislikeHelpIconUrl,
        tutorialLabel: 'КАК ПОЛЬЗОВАТЬСЯ',
        requiredDirection: 'left'
    }
];

let tutorialLength = hasSeenTutorial ? 0 : tutorialCards.length;
let cards: ArchetypeCard[] = hasSeenTutorial ? baseCards : [...tutorialCards, ...baseCards];

const archetypes = Object.keys(archetypeDescriptions);

const state = {
    index: 0,
    scores: Object.fromEntries(archetypes.map((a) => [a, 0])),
    exposure: Object.fromEntries(archetypes.map((a) => [a, 0])),
    locked: false
};

function refreshDeckFromStorage() {
    const seenTutorial = localStorage.getItem(tutorialStorageKey) === 'true';
    tutorialLength = seenTutorial ? 0 : tutorialCards.length;
    cards = seenTutorial ? baseCards : [...tutorialCards, ...baseCards];
}

const stackEl = document.getElementById('cardStack') as HTMLDivElement;
const resultsOverlay = document.getElementById('resultsOverlay') as HTMLDivElement;


const resultsPage = document.getElementById('resultsPage') as HTMLDivElement
const resultTitle = document.getElementById('resultTitle') as HTMLHeadingElement
const resultSubtitle = document.getElementById('resultSubtitle') as HTMLParagraphElement
const resultText = document.getElementById('resultText') as HTMLParagraphElement
const resultImgA = document.getElementById('resultImgA') as HTMLImageElement
const resultImgB = document.getElementById('resultImgB') as HTMLImageElement
const closeResultsBtn = document.getElementById('closeResults') as HTMLButtonElement

const appEl = document.querySelector('.app') as HTMLDivElement;

const likeBtn = document.getElementById('likeBtn') as HTMLButtonElement;
const dislikeBtn = document.getElementById('dislikeBtn') as HTMLButtonElement;
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

const onboardingEl = document.getElementById('onboarding') as HTMLDivElement;
const onbSlides = Array.from(onboardingEl?.querySelectorAll('.onboarding__slide') ?? []) as HTMLDivElement[];
const onbNext1 = document.getElementById('onbNext1') as HTMLButtonElement | null;
const onbNext2 = document.getElementById('onbNext2') as HTMLButtonElement | null;
const onbStart = document.getElementById('onbStart') as HTMLButtonElement | null;

const finalPageEl = document.getElementById('finalPage') as HTMLDivElement;
const finalChatBtn = document.getElementById('finalChatBtn') as HTMLButtonElement | null;
const finalTicketBtn = document.getElementById('finalTicketBtn') as HTMLButtonElement | null;
const finalCloseBtn = document.getElementById('finalClose') as HTMLButtonElement | null;

const ONBOARDING_KEY = 'onboardingSeen';

/* ----------------- ИНИЦИАЛИЗАЦИЯ ОНБОРДИНГА ----------------- */
function showOnboardingStep(step: number) {
    onbSlides.forEach((s) => {
        const active = Number(s.dataset.step) === step;
        s.classList.toggle('active', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
}

function startOnboardingIfNeeded(): boolean {
    const seen = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (seen || !onboardingEl) return false;

    onboardingEl.classList.remove('hidden');
    onboardingEl.setAttribute('aria-hidden', 'false');
    (document.querySelector('.app') as HTMLDivElement)?.classList.add('hidden'); // скрываем тест до старта
    showOnboardingStep(1);

    onbNext1?.addEventListener('click', () => showOnboardingStep(2));
    onbNext2?.addEventListener('click', () => showOnboardingStep(3));
    onbStart?.addEventListener('click', () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        onboardingEl.classList.add('hidden');
        onboardingEl.setAttribute('aria-hidden', 'true');
        (document.querySelector('.app') as HTMLDivElement)?.classList.remove('hidden');
        // запускаем вашу существующую логику
        renderStack();
    });

    return true;
}

function showFinalPage() {
    if (!finalPageEl) return;
    finalPageEl.classList.remove('hidden');
    finalPageEl.setAttribute('aria-hidden', 'false');
}

function hideFinalPage() {
    if (!finalPageEl) return;
    finalPageEl.classList.add('hidden');
    finalPageEl.setAttribute('aria-hidden', 'true');
}

finalChatBtn?.addEventListener('click', () => {
    // ВАЖНО: замените на реальную ссылку ГигаЧат/чат-бот
    window.open('https://gigachat.sber.ru/', '_blank'); // почему: чтобы пользователь не терял прогресс
});

finalTicketBtn?.addEventListener('click', () => {
    // ВАЖНО: замените на реальную ссылку на билеты
    window.open('https://www.tretyakovgallery.ru/', '_blank');
});

finalCloseBtn?.addEventListener('click', () => {
    hideFinalPage();
});


function resetState() {
    state.index = 0;
    archetypes.forEach((a) => {
        state.scores[a] = 0;
        state.exposure[a] = 0;
    });
    resultsOverlay.classList.add('hidden');
    refreshDeckFromStorage();
    renderStack();
}

function renderStack() {
    stackEl.innerHTML = '';
    const isTutorial = Boolean(cards[state.index]?.tutorial);
    appEl.classList.toggle('tutorial-mode', isTutorial);
    const activeCards = cards.slice(state.index, state.index + 2);
    activeCards.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = card.tutorial ? 'card tutorial-card' : 'card archetype-card';
        el.dataset.state = idx === 0 ? 'front' : 'behind';
        el.dataset.id = card.id.toString();
        el.style.zIndex = (cards.length - state.index - idx).toString();
        const isTutorialCard = Boolean(card.tutorial);
        const totalQuestions = cards.length - tutorialLength;
        const answeredQuestions = Math.max(0, state.index - tutorialLength);
        const cardNumber = isTutorialCard ? null : answeredQuestions + idx + 1;
        const percent = (answeredQuestions / totalQuestions) * 100;
        const labelMarkup = card.tutorialLabel ? `<div class="card-label">${card.tutorialLabel}</div>` : '';
        const bodyClass = card.tutorial ? 'card-text tutorial-body' : 'card-text';
        const bodyMarkup = card.tutorial
            ? `<div class="${bodyClass}"><div class="card-description">${card.description}</div>
<div><img class="tutorial-icon" src="${card.icon}" alt="" loading="lazy" decoding="async"></div>

</div>`
            : `<div class="${bodyClass}">${card.description}</div>`;
        el.innerHTML = `
      <div class="indicator like">
<img class="indicator-icon" src="${likeIconUrl}" alt="" loading="lazy" decoding="async">
       </div>
      <div class="indicator dislike">
<img class="indicator-icon" src="${dislikeIconUrl}" alt="" loading="lazy" decoding="async">
       </div>
      ${
            isTutorialCard
                ? ''
                : `<div class="card-counter">${cardNumber}/${totalQuestions}</div>
      <div class="progress-bar">
                    <div class="progress-fill" id="progressFill" style="width:${percent}%"></div>
                </div>
`
        }
 
      <div class="card-content">
        ${labelMarkup}
        ${bodyMarkup}
        ${isTutorialCard ? '' : '<div class="created_by">Сгенерировано в ГигаЧат</div>'}
      </div>
    `;
        const backgroundImg = document.createElement('img');
        backgroundImg.className = 'card-bg';
        backgroundImg.src = card.art;
        backgroundImg.alt = '';
        backgroundImg.loading = 'lazy';
        backgroundImg.decoding = 'async';
        backgroundImg.setAttribute('aria-hidden', 'true');
        el.prepend(backgroundImg);
        preloadImage(card.art);
        attachDrag(el, card);
        stackEl.appendChild(el);
    });
    const lookaheadCards = cards.slice(state.index + activeCards.length, state.index + activeCards.length + 3);
    lookaheadCards.forEach((nextCard) => preloadImage(nextCard.art));
    updateControlsState();
}

function attachDrag(cardEl: HTMLDivElement, card: ArchetypeCard) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const onPointerDown = (event: PointerEvent) => {
        if (state.locked) return;
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        cardEl.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
        if (!isDragging) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const rotate = dx / 12;
        cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
        cardEl.classList.toggle('like', dx > 20);
        cardEl.classList.toggle('dislike', dx < -20);
    };

    const onPointerUp = (event: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        cardEl.releasePointerCapture(event.pointerId);
        const dx = event.clientX - startX;
        const like = dx > 100;
        const dislike = dx < -100;
        if (like || dislike) {
            swipeAway(cardEl, card, like ? 1 : -1);
        } else {
            cardEl.style.transform = '';
            cardEl.classList.remove('like', 'dislike');
        }
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
    cardEl.addEventListener('pointermove', onPointerMove);
    cardEl.addEventListener('pointerup', onPointerUp);
}

function updateControlsState() {
    const card = cards[state.index]
    if (!card) return

    const inTutorial = Boolean(card.tutorial)
    const must = card.requiredDirection

    // по макету: в онбординге блокируем "неправильную" кнопку
    if (inTutorial && must) {
        if (must === 'right') {
            likeBtn.disabled = false
            dislikeBtn.disabled = true
        } else {
            likeBtn.disabled = true
            dislikeBtn.disabled = false
        }
    } else {
        likeBtn.disabled = false
        dislikeBtn.disabled = false
    }
}

function swipeAway(cardEl: HTMLDivElement, card: ArchetypeCard, direction: 1 | -1) {
    if (state.locked) return;
    const isRightDirection = direction > 0;
    if (card.requiredDirection) {
        const matches =
            (card.requiredDirection === 'right' && isRightDirection) ||
            (card.requiredDirection === 'left' && !isRightDirection);

        if (!matches) {
            cardEl.style.transform = '';
            cardEl.classList.remove('like', 'dislike');
            updateControlsState();
            return;
        }
    }

    state.locked = true;
    const offset = direction * 650;
    cardEl.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    cardEl.style.transform = `translate(${offset}px, -40px) rotate(${direction * 15}deg)`;
    cardEl.style.opacity = '0';
    cardEl.classList.add(direction > 0 ? 'like' : 'dislike');
    handleVote(card, isRightDirection);
    setTimeout(() => {
        state.locked = false;
        renderStack();
    }, 320);
}

function handleVote(card: ArchetypeCard, liked: boolean) {
    if (card.tutorial) {
        state.index += 1;
        if (!hasSeenTutorial && state.index >= tutorialLength) {
            localStorage.setItem(tutorialStorageKey, 'true');
        }

        if (state.index >= cards.length) {
            showResults();
        }

        return;
    }

    const factor = liked ? 1 : -0.7;
    Object.entries(card.composition).forEach(([name, weight]) => {
        state.exposure[name] += weight;
        state.scores[name] += weight * factor;
    });
    state.index += 1;

    console.log(state);
    if (state.index >= cards.length) {
        showResults();
    }
}

function computeProfile(): ArchetypeResult[] {
    const positiveScores = archetypes.map((name) => Math.max(state.scores[name], 0));
    const sumPositive = positiveScores.reduce((a, b) => a + b, 0);
    const useExposure = sumPositive < 1e-6;
    const baseValues = useExposure
        ? archetypes.map((name) => Math.max(state.exposure[name], 0))
        : positiveScores;

    const normalizedForExposure = baseValues.map((value, idx) => {
        if (useExposure) return value;
        const exposure = state.exposure[archetypes[idx]];
        return exposure > 0 ? value / exposure : value;
    });

    const total = normalizedForExposure.reduce((a, b) => a + b, 0) || 1;
    const profile = archetypes.map((name, idx) => ({
        name,
        percent: (normalizedForExposure[idx] / total) * 100,
        description: archetypeDescriptions[name]
    }));

    return profile.sort((a, b) => b.percent - a.percent);
}

function showResults() {
    const profile = computeProfile()
    const best = profile[0]
    showResultsPage(best.name, best.description)
    sendResults(profile)
}

function showResultsPage(bestName: string, bestDescription: string) {
    appEl.classList.add('show-results')
    resultsPage.classList.remove('hidden')

    resultTitle.textContent = 'Тест завершён'
    resultSubtitle.textContent = `Вы — ${bestName}`
    resultText.textContent = bestDescription

    const key = resultImageKeyByArchetype[bestName] ?? 'default'
    resultImgA.src = `src/assets/result/images/${key}-1.jpg`
    resultImgB.src = `src/assets/result/images/${key}-2.jpg`

    closeResultsBtn?.setAttribute('style', `background: ${resultColorKeyByArchetype[bestName].button}`)
    resultsPage?.setAttribute('style', `background: ${resultColorKeyByArchetype[bestName].bg}`)
}

async function sendResults(profile: ArchetypeResult[]) {
    // Заготовка для отправки результатов на сервер
    // await fetch('/api/results', { method: 'POST', body: JSON.stringify(profile) });
    console.log('Результат готов к отправке', profile.slice(0, 3));
}

function bindControls() {
    likeBtn.addEventListener('click', () => {
        const card = cards[state.index]
        if (!card || state.locked || likeBtn.disabled) return
        const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement | null
        if (!topCard) return
        swipeAway(topCard, card, 1)
    });

    dislikeBtn.addEventListener('click', () => {
        const card = cards[state.index]
        if (!card || state.locked || dislikeBtn.disabled) return
        const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement | null
        if (!topCard) return
        swipeAway(topCard, card, -1)
    });

    restartBtn.addEventListener('click', () => resetState());
}

closeResultsBtn.addEventListener('click', () => {
    resultsPage.classList.add('hidden');
    appEl.classList.remove('show-results');
    showFinalPage(); // почему: по ТЗ финальная страница после результата
});

// ВМЕСТО прежнего «bindControls(); renderStack();» — запускаем онбординг при необходимости
bindControls();
if (!startOnboardingIfNeeded()) {
    // если онбординг уже пройден — стартуем сразу
    renderStack();
}
