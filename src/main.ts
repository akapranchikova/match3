interface ArchetypeCard {
  id: number;
  title: string;
  description: string;
  composition: Record<string, number>;
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

const cards: ArchetypeCard[] = [
  {
    id: 1,
    title: 'Творец 100%',
    description: 'Ты свободно сочетаешь несочетаемое и создаёшь новое, не оглядываясь на чужие ожидания.',
    composition: { Творец: 1 }
  },
  {
    id: 2,
    title: 'Бунтарь 100%',
    description: 'Ты не миришься с устоявшимся порядком и готов переворачивать правила, если чувствуешь в этом правду.',
    composition: { Бунтарь: 1 }
  },
  {
    id: 3,
    title: 'Правитель 100%',
    description: 'Ты наводишь порядок, строишь систему и видишь, как части складываются в целое под твоим руководством.',
    composition: { Правитель: 1 }
  },
  {
    id: 4,
    title: 'Опекун 100%',
    description: 'Ты создаёшь вокруг себя ощущение тепла и безопасности, берёшь ответственность и поддерживаешь других.',
    composition: { Опекун: 1 }
  },
  {
    id: 5,
    title: 'Творец/Эстет 60/40',
    description: 'Ты сначала изобретаешь и пробуешь новое, а затем наводишь изящество и чистоту формы.',
    composition: { Творец: 0.6, Эстет: 0.4 }
  },
  {
    id: 6,
    title: 'Творец/Эстет 40/60',
    description: 'Ты прежде всего выбираешь безупречную форму, впуская в неё творческую искру.',
    composition: { Творец: 0.4, Эстет: 0.6 }
  },
  {
    id: 7,
    title: 'Воин/Бунтарь 60/40',
    description: 'Ты действуешь дисциплинированно и целенаправленно, позволяя себе резкость, когда это действительно нужно.',
    composition: { Воин: 0.6, Бунтарь: 0.4 }
  },
  {
    id: 8,
    title: 'Воин/Бунтарь 40/60',
    description: 'Ты бросаешь вызов и идёшь на пролом, но держишь курс и не теряешь цель из виду.',
    composition: { Воин: 0.4, Бунтарь: 0.6 }
  },
  {
    id: 9,
    title: 'Правитель/Творец 60/40',
    description: 'Ты наводишь порядок, опираясь на живую творческую энергию, и оформляешь её в работающую систему.',
    composition: { Правитель: 0.6, Творец: 0.4 }
  },
  {
    id: 10,
    title: 'Правитель/Творец 40/60',
    description: 'Ты создаёшь новое и смело экспериментируешь, быстро собирая результаты в понятную структуру.',
    composition: { Правитель: 0.4, Творец: 0.6 }
  },
  {
    id: 11,
    title: 'Правитель/Бунтарь 70/30',
    description: 'Ты держишься структуры и правил, но готов слегка сдвинуть рамки, если это оживляет процесс.',
    composition: { Правитель: 0.7, Бунтарь: 0.3 }
  },
  {
    id: 12,
    title: 'Правитель/Бунтарь 30/70',
    description: 'Ты выбираешь смелый разрыв шаблона, оставляя минимальные границы, чтобы не расплескать результат.',
    composition: { Правитель: 0.3, Бунтарь: 0.7 }
  },
  {
    id: 13,
    title: 'Опекун/Бунтарь 70/30',
    description: 'Ты прежде всего создаёшь опору и чувство безопасности, позволяя себе небольшое несогласие, чтобы не застыть.',
    composition: { Опекун: 0.7, Бунтарь: 0.3 }
  },
  {
    id: 14,
    title: 'Опекун/Бунтарь 30/70',
    description: 'Ты стремишься выйти из рамок и встряхнуть привычное, но держишь рядом заботу, чтобы не ушибить живое.',
    composition: { Опекун: 0.3, Бунтарь: 0.7 }
  },
  {
    id: 15,
    title: 'Дитя/Шут 60/40',
    description: 'Ты прежде всего позволишь себе искреннюю, детскую реакцию, но не забудешь подмигнуть и пошутить над ситуацией.',
    composition: { Дитя: 0.6, Шут: 0.4 }
  },
  {
    id: 16,
    title: 'Дитя/Шут 40/60',
    description: 'Ты в первую очередь играешь и иронизируешь, оставаясь при этом открытым и доверчивым к миру.',
    composition: { Дитя: 0.4, Шут: 0.6 }
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
const tutorialOverlay = document.getElementById('tutorial') as HTMLDivElement;
const mainResult = document.getElementById('mainResult') as HTMLParagraphElement;
const mainDescription = document.getElementById('mainDescription') as HTMLParagraphElement;
const profileList = document.getElementById('profileList') as HTMLDivElement;

const likeBtn = document.getElementById('likeBtn') as HTMLButtonElement;
const dislikeBtn = document.getElementById('dislikeBtn') as HTMLButtonElement;
const startTestBtn = document.getElementById('startTest') as HTMLButtonElement;
const helpBtn = document.getElementById('helpBtn') as HTMLButtonElement;
const restartBtn = document.getElementById('restart') as HTMLButtonElement;

function formatProgress() {
  progressText.textContent = `${Math.min(state.index + 1, cards.length)} / ${cards.length}`;
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
  tutorialOverlay.classList.remove('hidden');
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
    el.innerHTML = `
      <div class="indicator like">❤</div>
      <div class="indicator dislike">✕</div>
      <div class="card-content">${card.description}</div>
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
    const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement;
    swipeAway(topCard, card, 1);
  });

  dislikeBtn.addEventListener('click', () => {
    const card = cards[state.index];
    if (!card || state.locked) return;
    const topCard = stackEl.querySelector('.card[data-state="front"]') as HTMLDivElement;
    swipeAway(topCard, card, -1);
  });

  startTestBtn.addEventListener('click', () => tutorialOverlay.classList.add('hidden'));
  helpBtn.addEventListener('click', () => tutorialOverlay.classList.toggle('hidden'));
  restartBtn.addEventListener('click', () => resetState());
}

bindControls();
renderStack();
formatProgress();
