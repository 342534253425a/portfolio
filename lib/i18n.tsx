"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Lang = "en" | "ru";
export const LANGS: Lang[] = ["en", "ru"];
export const langHref = (lang: Lang) => (lang === "en" ? "/" : "/ru");

const ru = {
  nav: ["Главная", "Стек", "Проекты", "Процесс", "Контакты"],
  header: {
    home: "На главную",
    mainNav: "Основная навигация",
    mobileNav: "Мобильная навигация",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    contact: "Связаться",
    discuss: "Обсудить проект",
    switchTo: "Switch to English",
  },
  preloader: { loading: "Загрузка опыта", click: "· Кликните, чтобы войти", tap: "Нажмите, чтобы войти" },
  hero: {
    role: "Frontend разработчик",
    title: (
      <>
        Программист,
        <br />
        который <span className="accent">проектирует</span>
        <br />
        опыт, а не просто
        <br />
        пишет код
      </>
    ),
    lead: "Создаю веб-продукты с продуманной архитектурой, эстетичным интерфейсом и вниманием к деталям.",
    projects: "Смотреть проекты",
    discuss: "Расскажете о проекте?",
    scrollAria: "Листать вниз",
    scroll: "Листайте",
  },
  stack: {
    label: "Мой стек",
    title: (
      <>
        Технологии — мои инструменты.
        <br />
        Система — <span className="accent">мой подход.</span>
      </>
    ),
    lead: "Моя вселенная технологий. Листайте — полетим от планеты к планете.",
    planets: [
      { text: "Основа почти всех моих проектов: компоненты, хуки и состояние, которое не разваливается при росте.", tags: ["Hooks", "Context", "Router"] },
      { text: "App Router и SSR: на нём сделаны это портфолио и сайт психолога «Елизавета».", tags: ["App Router", "SSR", "SEO"] },
      { text: "Строгая типизация как страховка: меньше багов в проде, смелее рефакторинг.", tags: ["Strict", "Generics", "Zod"] },
      { text: "Свой сервер, когда он нужен: API и админка мастерской, RSS и прокси для агрегатора новостей.", tags: ["Express", "REST", "RSS"] },
      { text: "Авторизация, база и синхронизация между устройствами в Bloom — без своего сервера.", tags: ["Auth", "Postgres", "Sync"] },
      { text: "Анимации, которые вы видите на этом сайте: скролл, 3D-карусель, текстовые эффекты.", tags: ["ScrollTrigger", "SplitText", "Draggable"] },
      { text: "Быстрая вёрстка адаптивных интерфейсов без разрастающегося CSS.", tags: ["Адаптив", "UI-кит", "A11y"] },
      { text: "Сайт, который ставится на телефон как приложение и работает офлайн — так устроен Bloom.", tags: ["Offline", "Vite", "i18n"] },
    ],
    system: (n: number) => `${n} планет`,
    system0: "Система",
    distance: "Дистанция",
    au: "а.е.",
  },
  projects: {
    label: "Мои проекты",
    title: (
      <>
        Реальные проекты. <span className="accent">Реальный результат.</span>
      </>
    ),
    items: [
      {
        role: "Frontend + бэкенд",
        text: "Платформа тестов личности: MBTI, эннеаграмма и код Голланда с результатом сразу, курсы, личный кабинет и три языка — RU, EN, 中文.",
      },
      {
        role: "Frontend + бэкенд",
        text: "PWA для привычек и спокойного дня: цели, задачи, фокус, настроение и рефлексия в одном приложении, синхронизация телефона и компьютера через Supabase.",
      },
      {
        role: "Frontend + бэкенд",
        text: "Агрегатор мировых новостей из 20 изданий и YouTube в одном спокойном интерфейсе: режим чтения, поиск, каналы и прокси, чтобы сайт открывался там, где источники заблокированы.",
      },
      { title: "Елизавета", role: "Frontend", text: "Сайт психолога: бережная подача, рассказ о подходе и стоимости, отзывы и онлайн-запись на консультацию." },
      {
        title: "Ярослава",
        role: "Frontend + бэкенд",
        text: "Сайт мастерской авторского трикотажа и кружева: каталог изделий, видео-уроки, индивидуальные заказы и админка для управления контентом.",
      },
    ] as { title?: string; role: string; text: string }[],
    seeCase: "Смотреть кейс",
    openSite: "Открыть сайт",
    prev: "Предыдущий проект",
    next: "Следующий проект",
    hint: "Листайте или тяните ↔",
    role: "Роль",
    stack: "Стек",
    close: "Закрыть",
  },
  marquee: ["Анимации", "Интерфейсы", "Архитектура", "Скорость", "Детали", "Опыт", "Система", "Результат"],
  process: {
    label: "Мой процесс",
    title: (
      <>
        От идеи
        <br />
        до <span className="accent">результата.</span>
      </>
    ),
    steps: [
      { title: "Анализ", text: "Разбираюсь в задаче: для кого сайт, что он должен делать и что уже есть у конкурентов.", tags: ["Цели", "Конкуренты", "ТЗ"] },
      { title: "Проектирование", text: "Структура страниц, сценарии и визуальный стиль — до того, как написана первая строка.", tags: ["Сценарии", "Дизайн", "Структура"] },
      { title: "Разработка", text: "Типизированный код, адаптив под телефон и живая ссылка на демо по ходу работы.", tags: ["TypeScript", "Адаптив", "Демо"] },
      { title: "Запуск", text: "Сначала демо-сервер, чтобы всё проверить. Потом — ваш хостинг или VPS, домен и HTTPS. И дальше — правки и поддержка.", tags: ["Демо", "Хостинг / VPS", "Поддержка"] },
    ],
    stage: "Этап",
    holdAria: "Зажмите, чтобы запустить ракету",
    hint: "Зажмите ракету, чтобы запустить 🚀",
    launches: (n: number) => `🚀 Запусков: ${n} — ещё?`,
    stages: "Этапы",
    depth: "Глубина",
    depthUnit: "м",
    speed: "Скорость",
  },
  contact: {
    label: "Контакты",
    title: (
      <>
        Обсудим ваш
        <br />
        <span className="accent">следующий проект?</span>
      </>
    ),
    lead: "Открыт к работе в команде и интересным проектам. Люблю сложные интерфейсы, где важны детали и скорость.",
    choose: "Выбрать способ связи",
    reply: "Обычно отвечаю в течение дня",
    footer: "A/ — Frontend разработчик",
    top: "Наверх ↑",
    topAria: "Наверх",
    finaleKicker: "Готовы к запуску?",
    finaleWord: "Поехали!",
    copy: "Копировать",
    copied: "Скопировано ✓",
  },
  holo: {
    status: "Открыт к предложениям",
    role: "Frontend разработчик",
    flip: "Перевернуть визитку",
    flipBack: "Перевернуть визитку обратно",
    tap: "Нажмите ↻",
    backTitle: "Где меня найти",
    back: "↻ Назад",
  },
  dialog: {
    aria: "Связаться со мной",
    kicker: "Связь",
    title: (
      <>
        Как вам удобнее <span className="accent">связаться?</span>
      </>
    ),
    lead: "Выберите вариант — это займёт меньше минуты.",
    back: "Назад",
    close: "Закрыть",
    options: {
      request: { title: "Оставить заявку", text: "Опишите задачу — я сам свяжусь с вами в течение дня.", meta: "≈ 1 минута" },
      call: { title: "Назначить созвон", text: "Выберите день и время — обсудим проект голосом.", meta: "20–30 минут" },
      direct: { title: "Написать самому", text: "Telegram, WhatsApp, телефон или почта — как вам привычнее.", meta: "Сразу" },
    },
    name: "Как вас зовут",
    namePh: "Имя",
    reach: "Куда вам ответить",
    methods: { telegram: "Telegram", email: "Почта", phone: "Телефон", whatsapp: "WhatsApp" },
    reachPh: { telegram: "@username", email: "you@mail.com", phone: "+7 900 000-00-00", whatsapp: "+7 900 000-00-00" },
    need: "Что нужно",
    needs: ["Лендинг", "Сайт компании", "Веб-приложение", "Интернет-магазин", "Работа в команде", "Другое"],
    budget: "Бюджет",
    optional: "необязательно",
    budgets: ["до 50 тыс. ₽", "50–150 тыс. ₽", "от 150 тыс. ₽", "Обсудим"],
    message: "Пара слов о задаче",
    messagePh: "Что хотите сделать, сроки, ссылки на примеры…",
    consent: "Данные нужны только чтобы ответить вам и никуда не передаются.",
    send: "Отправить заявку",
    sending: "Отправляю…",
    day: "Выберите день",
    time: "Время",
    tz: (tz: string) => `по вашему времени · ${tz}`,
    noSlots: "На этот день свободного времени уже нет — выберите другой.",
    format: "Где созвонимся",
    formats: ["Telegram", "Zoom", "Google Meet", "Телефон"],
    about: "О чём поговорим",
    optionalAbout: "необязательно",
    aboutPh: "Пара слов о проекте — чтобы я пришёл подготовленным",
    book: "Забронировать созвон",
    pick: "Выберите день и время",
    required: "Заполните это поле",
    badEmail: "Похоже, в адресе ошибка",
    badPhone: "Проверьте номер",
    done: {
      request: { title: "Заявка отправлена", text: "Спасибо! Отвечу в течение дня — туда, куда вы указали." },
      call: { title: "Созвон забронирован", text: "Подтвержу время и пришлю ссылку туда, куда вы указали." },
    },
    toSite: "Вернуться на сайт",
    fail: "Не получилось отправить. Напишите мне напрямую — так даже быстрее:",
    direct: {
      telegram: { text: "Самый быстрый способ", action: "Открыть чат" },
      phone: { title: "Телефон и WhatsApp", text: "Звонок или сообщение", call: "Позвонить", whatsapp: "WhatsApp" },
      email: {
        text: "Для подробных писем",
        action: "Написать в Gmail",
        actionMobile: "Написать",
        hint: "Откроется Gmail с готовым письмом. Другая почта — скопируйте адрес.",
        subject: "Вопрос по проекту",
      },
    },
  },
};

export type Dict = typeof ru;

const en: Dict = {
  nav: ["Home", "Stack", "Projects", "Process", "Contact"],
  header: {
    home: "Back to top",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    contact: "Contact",
    discuss: "Discuss a project",
    switchTo: "Переключить на русский",
  },
  preloader: { loading: "Loading experience", click: "· Click to enter", tap: "Tap to enter" },
  hero: {
    role: "Frontend developer",
    title: (
      <>
        A developer
        <br />
        who <span className="accent">designs</span>
        <br />
        experiences, not just
        <br />
        writes code
      </>
    ),
    lead: "I build web products with thoughtful architecture, a refined interface and attention to detail.",
    projects: "View projects",
    discuss: "Tell me about your project",
    scrollAria: "Scroll down",
    scroll: "Scroll",
  },
  stack: {
    label: "My stack",
    title: (
      <>
        Technologies are my tools.
        <br />
        The system is <span className="accent">my approach.</span>
      </>
    ),
    lead: "My universe of technologies. Scroll to fly from planet to planet.",
    planets: [
      { text: "The core of almost all my projects: components, hooks and state that holds up as the app grows.", tags: ["Hooks", "Context", "Router"] },
      { text: "App Router and SSR: this portfolio and the psychologist site “Elizaveta” are built on it.", tags: ["App Router", "SSR", "SEO"] },
      { text: "Strict typing as insurance: fewer bugs in production, bolder refactoring.", tags: ["Strict", "Generics", "Zod"] },
      { text: "My own server when it’s needed: the workshop API and admin panel, RSS and a proxy for the news aggregator.", tags: ["Express", "REST", "RSS"] },
      { text: "Auth, database and cross-device sync in Bloom — without a server of my own.", tags: ["Auth", "Postgres", "Sync"] },
      { text: "The animations you see on this site: scroll scenes, the 3D carousel, text effects.", tags: ["ScrollTrigger", "SplitText", "Draggable"] },
      { text: "Fast, responsive layouts without an ever-growing stylesheet.", tags: ["Responsive", "UI kit", "A11y"] },
      { text: "A site that installs on your phone like an app and works offline — that’s how Bloom works.", tags: ["Offline", "Vite", "i18n"] },
    ],
    system: (n: number) => `${n} planets`,
    system0: "System",
    distance: "Distance",
    au: "AU",
  },
  projects: {
    label: "My projects",
    title: (
      <>
        Real projects. <span className="accent">Real results.</span>
      </>
    ),
    items: [
      {
        role: "Frontend + backend",
        text: "A personality test platform: MBTI, Enneagram and Holland code with instant results, courses, a personal account and three languages — RU, EN, 中文.",
      },
      {
        role: "Frontend + backend",
        text: "A PWA for habits and a calmer day: goals, tasks, focus, mood and reflection in one app, with phone and desktop synced through Supabase.",
      },
      {
        role: "Frontend + backend",
        text: "World news from 20 outlets and YouTube in one calm interface: reader mode, search, channels and a proxy so it opens where sources are blocked.",
      },
      { title: "Elizaveta", role: "Frontend", text: "A psychologist’s website: a gentle tone, her approach and prices, reviews and online booking for a session." },
      {
        title: "Yaroslava",
        role: "Frontend + backend",
        text: "A site for a knitwear and lace workshop: product catalog, video lessons, custom orders and an admin panel for the content.",
      },
    ],
    seeCase: "View case",
    openSite: "Open site",
    prev: "Previous project",
    next: "Next project",
    hint: "Scroll or drag ↔",
    role: "Role",
    stack: "Stack",
    close: "Close",
  },
  marquee: ["Animation", "Interfaces", "Architecture", "Speed", "Details", "Experience", "System", "Results"],
  process: {
    label: "My process",
    title: (
      <>
        From idea
        <br />
        to <span className="accent">result.</span>
      </>
    ),
    steps: [
      { title: "Research", text: "I dig into the task: who the site is for, what it must do and what competitors already have.", tags: ["Goals", "Competitors", "Brief"] },
      { title: "Design", text: "Page structure, user flows and visual style — before the first line of code.", tags: ["Flows", "Design", "Structure"] },
      { title: "Development", text: "Typed code, a layout that works on phones and a live demo link as the work goes.", tags: ["TypeScript", "Responsive", "Demo"] },
      { title: "Launch", text: "First a demo server to check everything. Then your hosting or a VPS, your domain and HTTPS. And after that — updates and support.", tags: ["Demo", "Hosting / VPS", "Support"] },
    ],
    stage: "Stage",
    holdAria: "Hold to launch the rocket",
    hint: "Hold the rocket to launch it 🚀",
    launches: (n: number) => `🚀 Launches: ${n} — again?`,
    stages: "Stages",
    depth: "Depth",
    depthUnit: "m",
    speed: "Speed",
  },
  contact: {
    label: "Contact",
    title: (
      <>
        Shall we discuss
        <br />
        <span className="accent">your next project?</span>
      </>
    ),
    lead: "Open to joining a team and to interesting projects. I love complex interfaces where details and speed matter.",
    choose: "Choose how to reach me",
    reply: "I usually reply within a day",
    footer: "A/ — Frontend developer",
    top: "Back to top ↑",
    topAria: "Back to top",
    finaleKicker: "Ready for launch?",
    finaleWord: "Let’s go!",
    copy: "Copy",
    copied: "Copied ✓",
  },
  holo: {
    status: "Open to offers",
    role: "Frontend developer",
    flip: "Flip the card",
    flipBack: "Flip the card back",
    tap: "Tap ↻",
    backTitle: "Where to find me",
    back: "↻ Back",
  },
  dialog: {
    aria: "Get in touch",
    kicker: "Contact",
    title: (
      <>
        How would you like to <span className="accent">get in touch?</span>
      </>
    ),
    lead: "Pick an option — it takes less than a minute.",
    back: "Back",
    close: "Close",
    options: {
      request: { title: "Leave a request", text: "Describe the task — I’ll get back to you within a day.", meta: "≈ 1 minute" },
      call: { title: "Book a call", text: "Pick a day and time — we’ll talk the project through.", meta: "20–30 minutes" },
      direct: { title: "Message me directly", text: "Telegram, WhatsApp, phone or email — whatever you prefer.", meta: "Instant" },
    },
    name: "Your name",
    namePh: "Name",
    reach: "Where should I reply",
    methods: { telegram: "Telegram", email: "Email", phone: "Phone", whatsapp: "WhatsApp" },
    reachPh: { telegram: "@username", email: "you@company.com", phone: "+1 555 000 0000", whatsapp: "+1 555 000 0000" },
    need: "What do you need",
    needs: ["Landing page", "Company website", "Web app", "Online store", "Team position", "Something else"],
    budget: "Budget",
    optional: "optional",
    budgets: ["Under $500", "$500–2k", "$2k+", "Let’s discuss"],
    message: "A few words about the task",
    messagePh: "What you want to build, timeline, links to examples…",
    consent: "Your details are only used to reply to you and are never shared.",
    send: "Send request",
    sending: "Sending…",
    day: "Pick a day",
    time: "Time",
    tz: (tz: string) => `in your time zone · ${tz}`,
    noSlots: "No free time left on this day — please pick another.",
    format: "Where shall we talk",
    formats: ["Telegram", "Zoom", "Google Meet", "Phone"],
    about: "What shall we discuss",
    optionalAbout: "optional",
    aboutPh: "A few words about the project so I come prepared",
    book: "Book the call",
    pick: "Pick a day and time",
    required: "Please fill this in",
    badEmail: "This email looks off",
    badPhone: "Please check the number",
    done: {
      request: { title: "Request sent", text: "Thank you! I’ll reply within a day — wherever you told me to." },
      call: { title: "Call booked", text: "I’ll confirm the time and send a link wherever you told me to." },
    },
    toSite: "Back to the site",
    fail: "Couldn’t send it. Message me directly — it’s even faster:",
    direct: {
      telegram: { text: "The fastest way", action: "Open chat" },
      phone: { title: "Phone & WhatsApp", text: "Call or message", call: "Call", whatsapp: "WhatsApp" },
      email: {
        text: "For detailed messages",
        action: "Write in Gmail",
        actionMobile: "Write",
        hint: "Gmail opens with a ready message. Using another mail service? Copy the address.",
        subject: "Project inquiry",
      },
    },
  },
};

export const DICTS: Record<Lang, Dict> = { en, ru };

const I18n = createContext<{ lang: Lang; t: Dict }>({ lang: "en", t: en });

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <I18n.Provider value={{ lang, t: DICTS[lang] }}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
