"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Lang = "en" | "ru";
export const LANGS: Lang[] = ["en", "ru"];
export const langHref = (lang: Lang) => (lang === "en" ? "/" : "/ru");
/** The light, effect-free version of the site for slow phones. */
export const liteHref = (lang: Lang) => (lang === "en" ? "/mobile" : "/ru/mobile");

const ru = {
  nav: ["Главная", "Стек", "Проекты", "Процесс", "Контакты"],
  lite: {
    badge: "Лёгкая версия",
    full: "Полная версия",
    fullHint: "с 3D и анимациями",
    offer: "Тормозит? Лёгкая версия →",
    footer: "Лёгкая версия сайта",
    discuss: "Обсудить проект",
  },
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
    role: "Дизайнер и разработчик",
    title: (
      <>
        Привет, я <span className="accent">Алексей.</span>
        <br />
        Дизайн.
        <br />
        Фуллстек-разработка.
        <br />
        Нейросети.
      </>
    ),
    lead: "Сам делаю дизайн, фронтенд и бэкенд на React, Next.js, TypeScript и Node.js, выкладываю в продакшен и поддерживаю. Встраиваю ИИ в продукты и работаю с ИИ-инструментами.",
    projects: "Смотреть проекты",
    discuss: "Расскажете о проекте?",
    scrollAria: "Листать вниз",
    scroll: "Листайте",
  },
  stack: {
    label: "Стек",
    title: (
      <>
        Современный стек.
        <br />
        <span className="accent">Без лишнего.</span>
      </>
    ),
    lead: "Инструменты, на которых держатся современные веб-продукты. Листайте — полетим от планеты к планете.",
    planets: [
      { text: "Компонентный UI: хуки, композиция, Suspense. Мемоизация — там, где она реально нужна.", tags: ["Hooks", "Suspense", "Tailwind"] },
      { text: "App Router, серверные компоненты, SSR и SSG — быстрая первая загрузка и страницы, которые находит поиск.", tags: ["App Router", "SSR / SSG", "SEO"] },
      { text: "Strict mode, generics, discriminated unions и type guards. Ошибки ловятся при сборке, а не у пользователя.", tags: ["Strict", "Generics", "Zod"] },
      { text: "Серверная часть на JavaScript: REST API, авторизация, валидация и обработка ошибок.", tags: ["Express", "REST", "JWT"] },
      { text: "Реляционная база: схемы, связи, индексы и запросы. Типизированный доступ через ORM.", tags: ["SQL", "Prisma", "Supabase"] },
      { text: "Клиентское состояние отдельно от серверного: стор для UI, кеш запросов, инвалидация и оптимистичные обновления.", tags: ["Redux Toolkit", "Zustand", "TanStack Query"] },
      { text: "Unit- и компонентные тесты, e2e-сценарии и прогон в CI перед каждым релизом.", tags: ["Vitest", "Playwright", "CI/CD"] },
      { text: "Анимации интерфейса: скролл-сцены, переходы, работа с текстом — плавно и без тормозов на телефоне.", tags: ["ScrollTrigger", "SplitText", "60 fps"] },
    ],
    system: (n: number) => `${n} планет`,
    system0: "Система",
    distance: "Дистанция",
    au: "а.е.",
  },
  projects: {
    label: "Проекты",
    title: (
      <>
        Живые проекты. <span className="accent">Любой можно открыть.</span>
      </>
    ),
    items: [
      {
        role: "Full-stack",
        text: "Платформа тестов личности: MBTI, эннеаграмма и код Голланда с мгновенным результатом, курсы, личный кабинет и три языка — RU, EN, 中文.",
      },
      {
        role: "Full-stack · PWA",
        text: "Приложение для целей, задач, фокуса и настроения. Ставится на телефон, работает офлайн и синхронизирует данные между устройствами.",
      },
      {
        role: "Full-stack",
        text: "Агрегатор новостей из 20 изданий и YouTube: режим чтения, поиск, каналы и серверный прокси для доступа к заблокированным источникам.",
      },
      { title: "Елизавета", role: "Frontend", text: "Сайт психолога: подход и стоимость, отзывы и онлайн-запись на консультацию. SSR и SEO для поиска." },
      {
        title: "Ярослава",
        role: "Full-stack",
        text: "Сайт мастерской трикотажа и кружева: каталог, видео-уроки, индивидуальные заказы и админ-панель для управления контентом.",
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
    retrying: "Сервер задумался, пробую ещё раз…",
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
  lite: {
    badge: "Lite version",
    full: "Full version",
    fullHint: "with 3D and animations",
    offer: "Laggy? Lite version →",
    footer: "Lite version of the site",
    discuss: "Discuss a project",
  },
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
    role: "Designer & developer",
    title: (
      <>
        Hi, I’m <span className="accent">Alexsey.</span>
        <br />
        Design.
        <br />
        Full-stack development.
        <br />
        AI.
      </>
    ),
    lead: "I design, build the frontend and backend with React, Next.js, TypeScript and Node.js, ship to production and support it. I build AI into products and work with AI tools.",
    projects: "View projects",
    discuss: "Tell me about your project",
    scrollAria: "Scroll down",
    scroll: "Scroll",
  },
  stack: {
    label: "Stack",
    title: (
      <>
        A modern stack.
        <br />
        <span className="accent">Nothing extra.</span>
      </>
    ),
    lead: "The tools modern web products are built on. Scroll to fly from planet to planet.",
    planets: [
      { text: "Component UI: hooks, composition, Suspense. Memoization where it actually pays off.", tags: ["Hooks", "Suspense", "Tailwind"] },
      { text: "App Router, server components, SSR and SSG — a fast first load and pages that search engines find.", tags: ["App Router", "SSR / SSG", "SEO"] },
      { text: "Strict mode, generics, discriminated unions and type guards. Errors are caught at build time, not by users.", tags: ["Strict", "Generics", "Zod"] },
      { text: "The server side in JavaScript: REST APIs, authentication, validation and error handling.", tags: ["Express", "REST", "JWT"] },
      { text: "A relational database: schemas, relations, indexes and queries. Typed access through an ORM.", tags: ["SQL", "Prisma", "Supabase"] },
      { text: "Client state kept apart from server state: a store for the UI, a request cache, invalidation and optimistic updates.", tags: ["Redux Toolkit", "Zustand", "TanStack Query"] },
      { text: "Unit and component tests, end-to-end scenarios and a CI run before every release.", tags: ["Vitest", "Playwright", "CI/CD"] },
      { text: "Interface animation: scroll scenes, transitions and text effects — smooth, and no lag on phones.", tags: ["ScrollTrigger", "SplitText", "60 fps"] },
    ],
    system: (n: number) => `${n} planets`,
    system0: "System",
    distance: "Distance",
    au: "AU",
  },
  projects: {
    label: "Projects",
    title: (
      <>
        Live projects. <span className="accent">Open any of them.</span>
      </>
    ),
    items: [
      {
        role: "Full-stack",
        text: "A personality test platform: MBTI, Enneagram and Holland code with instant results, courses, a personal account and three languages — RU, EN, 中文.",
      },
      {
        role: "Full-stack · PWA",
        text: "An app for goals, tasks, focus and mood. Installs on a phone, works offline and syncs data across devices.",
      },
      {
        role: "Full-stack",
        text: "A news aggregator for 20 outlets and YouTube: reader mode, search, channels and a server-side proxy for blocked sources.",
      },
      { title: "Elizaveta", role: "Frontend", text: "A psychologist’s website: approach and prices, reviews and online booking. SSR and SEO for search." },
      {
        title: "Yaroslava",
        role: "Full-stack",
        text: "A site for a knitwear and lace workshop: catalog, video lessons, custom orders and an admin panel for the content.",
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
    retrying: "Server hiccup, trying again…",
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
