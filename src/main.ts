interface ArchetypeCard {
    id: number;
    title: string;
    description: string;
    composition: Record<string, number>;
    art: string;
}

interface ArchetypeResult {
    name: string;
    percent: number;
    description: string;
}

const archetypeDescriptions: Record<string, string> = {
    Дитя: 'Твой архетип — Дитя. Ты часто действуешь по первому импульсу, радуешься простым вещам и доверяешь людям. Тянешься к свежему, живому, искреннему.',
    'Славный малый': 'Твой архетип — Славный малый. Ты ценишь простоту и понятность, держишься ближе к своим и поддерживаешь тёплую, дружелюбную атмосферу.',
    Воин: 'Твой архетип — Воин. Тебе ближе собранность и цель: поставил задачу — двигаешься к результату. Уважаешь дисциплину и ясные решения.',
    Опекун: 'Твой архетип — Опекун. Тебе важно, чтобы рядом было безопасно и надёжно. Ты поддерживаешь и защищаешь. С тобой люди чувствуют опору.',
    Искатель: 'Твой архетип — Искатель. Тебя тянет на новое: попробовать, исследовать, выйти за привычные рамки. Опыт и впечатления для тебя — топливо.',
    Бунтарь: 'Твой архетип — Бунтарь. Ты идёшь против скучных правил и "как принято", выбираешь смелые ходы. Твой импульс — менять устоявшееся.',
    Эстет: 'Твой архетип — Эстет. Ты любишь чистую форму и аккуратность, замечаешь детали и наводишь красоту. Тебе важно, чтобы всё выглядело стройно.',
    Творец: 'Твой архетип — Творец. Ты придумываешь нестандартные решения и соединяешь разное в новое. Идеи для тебя — рабочий материал.',
    Правитель: 'Твой архетип — Правитель. Тебе по душе порядок и система: организовать людей, выстроить процесс, видеть целую картину.',
    Маг: 'Твой архетип — Маг. Ты видишь неожиданные ходы и умеешь сделать привычное «работающим по-новому». Любишь эффект небольшого «вау» в обычных вещах.',
    Мудрец: 'Твой архетип — Мудрец. Тебе важно понимать причины и смыслы, разбираться в сложном и объяснять просто. Ты принимаешь взвешенные решения.',
    Шут: 'Твой архетип — Шут. Ты умеешь разряжать напряжение и смотреть на ситуацию с юмором. Помогаешь людям не застревать в серьёзности.'
};

const artPalettes = [
    'linear-gradient(145deg, #8b1c1c 0%, #e2602d 45%, #f7c87c 100%)',
    'linear-gradient(150deg, #10314f 0%, #165d63 45%, #a3d9c9 100%)',
    'linear-gradient(140deg, #241b3d 0%, #683a6e 45%, #f4d8b4 100%)',
    'linear-gradient(150deg, #2b1f27 0%, #7a2d2f 45%, #e26d47 100%)',
    'linear-gradient(140deg, #0f2f3a 0%, #1f5b5a 40%, #c5e6c7 100%)',
    'linear-gradient(145deg, #30213a 0%, #63466a 40%, #d8b6c7 100%)',
    'linear-gradient(150deg, #1c2a3f 0%, #1f4e73 50%, #f0c27b 100%)',
    'linear-gradient(140deg, #341a27 0%, #ba4840 50%, #f7dba7 100%)'
];

const cards: ArchetypeCard[] = [
    {
        id: 1,
        title: 'Дитя 100%',
        description: 'Тебе нравится действовать по первому импульсу и радоваться простым вещам.',
        composition: { Дитя: 1 },
        art: artPalettes[0]
    },
    {
        id: 2,
        title: 'Славный малый 100%',
        description: 'В любой компании тебе близко ощущение “свой человек”.',
        composition: { 'Славный малый': 1 },
        art: artPalettes[1]
    },
    {
        id: 3,
        title: 'Воин 100%',
        description: 'Тебе по духу собраться, поставить цель и идти к результату.',
        composition: { Воин: 1 },
        art: artPalettes[2]
    },
    {
        id: 4,
        title: 'Опекун 100%',
        description: 'Тебе важно, чтобы рядом было спокойно, надёжно и с заботой о людях.',
        composition: { Опекун: 1 },
        art: artPalettes[3]
    },
    {
        id: 5,
        title: 'Искатель 100%',
        description: 'Тебя тянет пробовать новое и выходить за привычные рамки.',
        composition: { Искатель: 1 },
        art: artPalettes[4]
    },
    {
        id: 6,
        title: 'Бунтарь 100%',
        description: 'Тебе откликается ломать устоявшиеся правила и делать всё по-своему.',
        composition: { Бунтарь: 1 },
        art: artPalettes[5]
    },
    {
        id: 7,
        title: 'Эстет 100%',
        description: 'Тебе нравится аккуратность, ясная форма и порядок деталей.',
        composition: { Эстет: 1 },
        art: artPalettes[6]
    },
    {
        id: 8,
        title: 'Творец 100%',
        description: 'Тебе интересно придумывать нестандартные решения и соединять разное.',
        composition: { Творец: 1 },
        art: artPalettes[7]
    },
    {
        id: 9,
        title: 'Правитель 100%',
        description: 'Тебе важно, чтобы всё было организованно и работало как чёткая система.',
        composition: { Правитель: 1 },
        art: artPalettes[0]
    },
    {
        id: 10,
        title: 'Маг 100%',
        description: 'Тебе нравится удивлять, когда привычные вещи вдруг работают по-новому.',
        composition: { Маг: 1 },
        art: artPalettes[1]
    },
    {
        id: 11,
        title: 'Мудрец 100%',
        description: 'Тебе нужно понимать причины и уметь все просто объяснять.',
        composition: { Мудрец: 1 },
        art: artPalettes[2]
    },
    {
        id: 12,
        title: 'Шут 100%',
        description: 'Тебе хочется разряжать напряжение и смотреть на вещи с юмором.',
        composition: { Шут: 1 },
        art: artPalettes[3]
    },
    {
        id: 13,
        title: 'Дитя/Шут 60/40',
        description: 'Тебе свойственны искренность и живой отклик, потом игра и ирония.',
        composition: { Дитя: 0.6, Шут: 0.4 },
        art: artPalettes[4]
    },
    {
        id: 14,
        title: 'Творец/Эстет 60/40',
        description: 'Сначала в тебе рождается смелая идея, потом аккуратная её подача.',
        composition: { Творец: 0.6, Эстет: 0.4 },
        art: artPalettes[5]
    },
    {
        id: 15,
        title: 'Воин/Бунтарь 60/40',
        description: 'Тебе важнее дисциплина и цель, дерзость во втором плане.',
        composition: { Воин: 0.6, Бунтарь: 0.4 },
        art: artPalettes[6]
    },
    {
        id: 16,
        title: 'Опекун/Славный 60/40',
        description: 'В первую очередь поддержка и забота, затем простота общения.',
        composition: { Опекун: 0.6, 'Славный малый': 0.4 },
        art: artPalettes[7]
    },
    {
        id: 17,
        title: 'Искатель/Мудрец 60/40',
        description: 'Сначала опыт и эксперименты, затем глубокое осмысление.',
        composition: { Искатель: 0.6, Мудрец: 0.4 },
        art: artPalettes[0]
    },
    {
        id: 18,
        title: 'Правитель/Творец 60/40',
        description: 'В тебе преобладает порядок и структура, затем творческая энергия.',
        composition: { Правитель: 0.6, Творец: 0.4 },
        art: artPalettes[1]
    },
    {
        id: 19,
        title: 'Дитя/Шут 40/60',
        description: 'Тебе ближе игра и ирония: сначала смотришь на вещь с юмором, но фоном остается прямой детский взгляд.',
        composition: { Дитя: 0.4, Шут: 0.6 },
        art: artPalettes[2]
    },
    {
        id: 20,
        title: 'Творец/Эстет 40/60',
        description: 'На первом месте аккуратная форма и чистый вид. Смелые идеи тебе не чужды, но они поддерживают, а не ведут.',
        composition: { Творец: 0.4, Эстет: 0.6 },
        art: artPalettes[3]
    },
    {
        id: 21,
        title: 'Воин/Бунтарь 40/60',
        description: 'Сначала дерзкий ход и вызов обычному и привычному, при этом цель остаётся четкой и ясной.',
        composition: { Воин: 0.4, Бунтарь: 0.6 },
        art: artPalettes[4]
    },
    {
        id: 22,
        title: 'Правитель/Бунтарь 70/30',
        description: 'В тебе преобладает порядок: тебе важно, чтобы всё было организовано, но иногда ты допускаешь немного свободы для эксперимента.',
        composition: { Правитель: 0.7, Бунтарь: 0.3 },
        art: artPalettes[5]
    },
    {
        id: 23,
        title: 'Правитель/Бунтарь 30/70',
        description: 'На первом плане разрыв шаблонов и смелые решения, но при этом минимальные рамки ты всё же сохраняешь.',
        composition: { Правитель: 0.3, Бунтарь: 0.7 },
        art: artPalettes[6]
    },
    {
        id: 24,
        title: 'Эстет/Воин 70/30',
        description: 'Тебе ближе чёткая, аккуратная форма, а для выразительности можешь добавить немного движения.',
        composition: { Эстет: 0.7, Воин: 0.3 },
        art: artPalettes[7]
    }
];

const archetypes = Object.keys(archetypeDescriptions);

const state = {
    index: 0,
    scores: Object.fromEntries(archetypes.map((a) => [a, 0])),
    exposure: Object.fromEntries(archetypes.map((a) => [a, 0])),
    locked: false
};

const stackEl = document.getElementById('cardStack') as HTMLDivElement;
const progressText = document.getElementById('progress') as HTMLDivElement;
const progressFill = document.getElementById('progressFill') as HTMLDivElement;
const resultsOverlay = document.getElementById('resultsOverlay') as HTMLDivElement;
const mainResult = document.getElementById('mainResult') as HTMLParagraphElement;
const mainDescription = document.getElementById('mainDescription') as HTMLParagraphElement;
const profileList = document.getElementById('profileList') as HTMLDivElement;

const likeBtn = document.getElementById('likeBtn') as HTMLButtonElement;
const dislikeBtn = document.getElementById('dislikeBtn') as HTMLButtonElement;
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function formatProgress() {
    progressText.textContent = `${Math.min(state.index + 1, cards.length)}/${cards.length}`;
    const percent = (state.index / cards.length) * 100;
    progressFill.style.width = `${percent}%`;
}

function resetState() {
    state.index = 0;
    archetypes.forEach((a) => {
        state.scores[a] = 0;
        state.exposure[a] = 0;
    });
    resultsOverlay.classList.add('hidden');
    renderStack();
    formatProgress();
}

function renderStack() {
    stackEl.innerHTML = '';
    const activeCards = cards.slice(state.index, state.index + 2);
    activeCards.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.dataset.state = idx === 0 ? 'front' : 'behind';
        el.dataset.id = card.id.toString();
        el.style.zIndex = (cards.length - state.index - idx).toString();
        const cardNumber = state.index + idx + 1;
        el.style.setProperty('--card-art', card.art);
        el.innerHTML = `
      <div class="indicator like">❤</div>
      <div class="indicator dislike">✕</div>
      <div class="card-counter">${cardNumber}/${cards.length}</div>
      <div class="card-content">
        <div class="card-text">${card.description}</div>
      </div>
    `;
        attachDrag(el, card);
        stackEl.appendChild(el);
    });
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

function swipeAway(cardEl: HTMLDivElement, card: ArchetypeCard, direction: 1 | -1) {
    if (state.locked) return;
    state.locked = true;
    const offset = direction * 650;
    cardEl.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    cardEl.style.transform = `translate(${offset}px, -40px) rotate(${direction * 15}deg)`;
    cardEl.style.opacity = '0';
    cardEl.classList.add(direction > 0 ? 'like' : 'dislike');
    handleVote(card, direction > 0);
    setTimeout(() => {
        state.locked = false;
        renderStack();
    }, 320);
}

function handleVote(card: ArchetypeCard, liked: boolean) {
    const factor = liked ? 1 : -0.7;
    Object.entries(card.composition).forEach(([name, weight]) => {
        state.exposure[name] += weight;
        state.scores[name] += weight * factor;
    });
    state.index += 1;
    formatProgress();

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

    const total = baseValues.reduce((a, b) => a + b, 0) || 1;
    const profile = archetypes.map((name, idx) => ({
        name,
        percent: (baseValues[idx] / total) * 100,
        description: archetypeDescriptions[name]
    }));

    return profile.sort((a, b) => b.percent - a.percent);
}

function showResults() {
    const profile = computeProfile();
    const best = profile[0];
    mainResult.textContent = `Вы — ${best.name}`;
    mainDescription.textContent = best.description;

    profileList.innerHTML = '';
    const top = profile.slice(0, 5);
    top.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.innerHTML = `
      <span class="profile-label">${item.name}</span>
      <span class="profile-value">${item.percent.toFixed(1)}%</span>
    `;
        profileList.appendChild(row);
    });

    const rest = profile.slice(5).reduce((acc, item) => acc + item.percent, 0);
    if (rest > 0) {
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.innerHTML = `
      <span class="profile-label">Остальные</span>
      <span class="profile-value">${rest.toFixed(1)}%</span>
    `;
        profileList.appendChild(row);
    }

    resultsOverlay.classList.remove('hidden');
    sendResults(profile);
}

async function sendResults(profile: ArchetypeResult[]) {
    // Заготовка для отправки результатов на сервер
    // await fetch('/api/results', { method: 'POST', body: JSON.stringify(profile) });
    console.log('Результат готов к отправке', profile.slice(0, 3));
}

function bindControls() {
    likeBtn.addEventListener('click', () => {
        const card = cards[state.index];
        if (!card || state.locked) return;
        const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement | null;
        if (!topCard) return;
        swipeAway(topCard, card, 1);
    });

    dislikeBtn.addEventListener('click', () => {
        const card = cards[state.index];
        if (!card || state.locked) return;
        const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement | null;
        if (!topCard) return;
        swipeAway(topCard, card, -1);
    });

    restartBtn.addEventListener('click', () => resetState());
}

bindControls();
renderStack();
formatProgress();
