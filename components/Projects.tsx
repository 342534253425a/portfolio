"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Draggable, finePointer, gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ArrowLeft, ArrowRight } from "./icons";

const projects = [
  {
    title: "Psyches Strings",
    tags: ["React", "Vite", "Node.js"],
    image: "/images/projects/psyches-strings.jpg",
    url: "https://psyches-strings.vercel.app",
    pos: "30% 50%",
    role: "Frontend + бэкенд",
    text: "Платформа тестов личности: MBTI, эннеаграмма и код Голланда с результатом сразу, курсы, личный кабинет и три языка — RU, EN, 中文.",
  },
  {
    title: "Bloom",
    tags: ["React", "Supabase", "PWA"],
    image: "/images/projects/bloom.webp",
    url: "https://bloom-love.online",
    pos: "25% 50%",
    role: "Frontend + бэкенд",
    text: "PWA для привычек и спокойного дня: цели, задачи, фокус, настроение и рефлексия в одном приложении, синхронизация телефона и компьютера через Supabase.",
  },
  {
    title: "Tideline",
    tags: ["Node.js", "RSS", "YouTube API"],
    image: "/images/projects/tideline.jpg",
    url: "https://world-news-snowy.vercel.app",
    pos: "50% 50%",
    role: "Frontend + бэкенд",
    text: "Агрегатор мировых новостей из 20 изданий и YouTube в одном спокойном интерфейсе: режим чтения, поиск, каналы и прокси, чтобы сайт открывался там, где источники заблокированы.",
  },
  {
    title: "Елизавета",
    tags: ["Next.js", "GSAP", "Tailwind"],
    image: "/images/projects/elizaveta.webp",
    url: "https://elizaveta-pi.vercel.app",
    pos: "30% 50%",
    role: "Frontend",
    text: "Сайт психолога: бережная подача, рассказ о подходе и стоимости, отзывы и онлайн-запись на консультацию.",
  },
  {
    title: "Ярослава",
    tags: ["Node.js", "Express", "GSAP"],
    image: "/images/projects/yaroslava.jpg",
    url: "https://yaroslava-knit.vercel.app",
    pos: "40% 50%",
    role: "Frontend + бэкенд",
    text: "Сайт мастерской авторского трикотажа и кружева: каталог изделий, видео-уроки, индивидуальные заказы и админка для управления контентом.",
  },
];

const N = projects.length;
const STEP = 360 / N;
const PER_CARD = 0.75;
const TILT = -10;
const wrap = (i: number) => ((i % N) + N) % N;

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const dragged = useRef(false);
  const goTo = useRef<(i: number) => void>(() => {});

  useGSAP(
    () => {
      const section = root.current!;
      const camera = section.querySelector<HTMLElement>(".camera")!;
      const ring = section.querySelector<HTMLElement>(".ring")!;
      const floor = section.querySelector<HTMLElement>(".floor")!;
      const cards = gsap.utils.toArray<HTMLElement>(".card", section);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = { pos: 0, intro: reduced ? 0 : -1.6 };
      let radius = 0;
      let cardH = 0;
      let current = 0;

      const render = () => {
        const pos = state.pos + state.intro;
        ring.style.transform = `translateZ(${-radius}px) rotateX(${TILT}deg) rotateY(${-pos * STEP}deg)`;
        cards.forEach((card, i) => {
          let d = wrap(i - pos);
          if (d > N / 2) d -= N;
          const a = Math.abs(d);
          const lift = Math.max(0, 1 - a) * radius * 0.18;
          card.style.transform = `translate(-50%, -50%) rotateY(${i * STEP}deg) translateZ(${radius + lift}px)`;
          card.style.setProperty("--dim", String(Math.min(0.88, a * 0.42)));
          card.classList.toggle("is-active", a < 0.5);
        });
        const idx = wrap(Math.round(pos));
        if (idx !== current) {
          current = idx;
          setIndex(idx);
        }
      };

      const layout = () => {
        const w = cards[0].offsetWidth;
        cardH = cards[0].offsetHeight;
        radius = w / 2 / Math.tan(Math.PI / N) + w * 0.22;
        floor.style.width = floor.style.height = `${radius * 3}px`;
        floor.style.transform = `translate(-50%, -50%) translateY(${cardH * 0.62}px) rotateX(90deg)`;
        render();
      };
      layout();

      const pin = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * PER_CARD * (N - 1)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          state.pos = self.progress * (N - 1);
          render();
        },
        onRefresh: layout,
      });

      const scrollFor = (i: number) => pin.start + (gsap.utils.clamp(0, N - 1, i) / (N - 1)) * (pin.end - pin.start);
      goTo.current = (i) =>
        getLenis()?.scrollTo(scrollFor(i), {
          duration: 1.4,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });

      const proxy = document.createElement("div");
      proxy.className = "stage__proxy";
      section.appendChild(proxy);
      let startScroll = 0;
      const [drag] = Draggable.create(proxy, {
        type: "x",
        trigger: section.querySelector<HTMLElement>(".stage3d")!,
        allowNativeTouchScrolling: true,
        minimumMovement: 6,
        onPress() {
          startScroll = window.scrollY;
          gsap.set(proxy, { x: 0 });
          this.update();
        },
        onDragStart() {
          dragged.current = true;
          section.classList.add("is-dragging");
        },
        onDrag() {
          const perPx = (pin.end - pin.start) / (N - 1) / (cards[0].offsetWidth * 0.9);
          const y = gsap.utils.clamp(pin.start, pin.end, startScroll - this.x * perPx);
          getLenis()?.scrollTo(y, { immediate: true });
        },
        onRelease() {
          section.classList.remove("is-dragging");
          setTimeout(() => (dragged.current = false), 60);
          if (!this.isDragging && Math.abs(this.x) < 6) return;
          const v = gsap.utils.clamp(-1, 1, -this.deltaX / 12);
          goTo.current(Math.round(state.pos + v * 0.6));
        },
      });

      const ro = new ResizeObserver(layout);
      ro.observe(cards[0]);

      if (!reduced) {
        const intro = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 70%", once: true },
        });
        intro
          .from(camera, {
            z: -900,
            rotationX: 24,
            duration: 2.2,
            ease: "expo.out",
          })
          /* Faded outside the preserve-3d chain: opacity below 1 on .camera would flatten the ring until it hits 1. */
          .from(".stage3d", { opacity: 0, duration: 1.4, ease: "power2.out" }, 0)
          .to(state, { intro: 0, duration: 2.6, ease: "expo.out", onUpdate: render }, 0)
          .from(".floor", { autoAlpha: 0, duration: 2, ease: "power2.out" }, 0.4)
          .from(
            ".projects__hud > *",
            {
              y: 40,
              autoAlpha: 0,
              duration: 1.2,
              stagger: 0.1,
              ease: "expo.out",
            },
            0.5,
          );
        if (finePointer()) {
          const rig = section.querySelector<HTMLElement>(".rig")!;
          const ry = gsap.quickTo(rig, "rotationY", {
            duration: 1.6,
            ease: "power3.out",
          });
          const rx = gsap.quickTo(rig, "rotationX", {
            duration: 1.6,
            ease: "power3.out",
          });
          const move = (e: PointerEvent) => {
            ry((e.clientX / window.innerWidth - 0.5) * 10);
            rx((e.clientY / window.innerHeight - 0.5) * -6);
          };
          section.addEventListener("pointermove", move);
        }
      }

      let inView = false;
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: () => `bottom+=${window.innerHeight * PER_CARD * (N - 1)} center`,
        onToggle: (s) => (inView = s.isActive),
      });
      const onKey = (e: KeyboardEvent) => {
        if (!inView || document.documentElement.classList.contains("modal-open")) return;
        if (e.key === "ArrowRight") goTo.current(Math.round(state.pos) + 1);
        if (e.key === "ArrowLeft") goTo.current(Math.round(state.pos) - 1);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        drag.kill();
        proxy.remove();
        ro.disconnect();
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const ghost = SplitText.create(".projects__ghost", { type: "chars" });
      gsap.from(ghost.chars, {
        rotationX: -100,
        yPercent: 40,
        autoAlpha: 0,
        transformOrigin: "50% 100% -40",
        duration: 0.9,
        stagger: 0.025,
        ease: "expo.out",
      });
      gsap.from(".hud__title, .hud__tags li, .hud__meta", {
        y: 26,
        autoAlpha: 0,
        rotationX: -40,
        transformPerspective: 600,
        duration: 0.8,
        stagger: 0.04,
        ease: "expo.out",
      });
      gsap.fromTo(".projects__count b", { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.out" });
      gsap.to(".projects__progress i", {
        scaleX: (index + 1) / N,
        duration: 0.8,
        ease: "expo.out",
      });
      return () => ghost.revert();
    },
    { dependencies: [index], scope: root, revertOnUpdate: true },
  );

  const select = (i: number) => {
    if (dragged.current) return;
    if (i === index) return setOpen(i);
    goTo.current(i);
  };

  const onMove = (e: React.PointerEvent<HTMLElement>, active: boolean) => {
    if (!active || e.pointerType !== "mouse" || dragged.current) return;
    const inner = e.currentTarget.querySelector<HTMLElement>(".card__inner")!;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    gsap.to(inner, {
      rotationY: (x - 0.5) * 14,
      rotationX: -(y - 0.5) * 14,
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.to(inner.querySelector("img"), {
      x: (0.5 - x) * 24,
      y: (0.5 - y) * 16,
      scale: 1.1,
      duration: 0.8,
      ease: "power3.out",
    });
    inner.style.setProperty("--gx", `${x * 100}%`);
    inner.style.setProperty("--gy", `${y * 100}%`);
  };

  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    const inner = e.currentTarget.querySelector(".card__inner")!;
    gsap.to(inner, {
      rotationY: 0,
      rotationX: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
    });
    gsap.to(inner.querySelector("img"), {
      x: 0,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
    });
  };

  useEffect(() => {
    if (open === null) return;
    const html = document.documentElement;
    html.classList.add("modal-open");
    getLenis()?.stop();

    const card = root.current!.querySelectorAll<HTMLElement>(".card__inner")[open];
    const modal = modalRef.current!;
    const media = modal.querySelector<HTMLElement>(".modal__media")!;
    const from = card.getBoundingClientRect();
    const to = media.getBoundingClientRect();

    const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    tl.fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "none" })
      .fromTo(
        media,
        {
          x: from.left - to.left,
          y: from.top - to.top,
          scaleX: from.width / to.width,
          scaleY: from.height / to.height,
          transformOrigin: "0 0",
          borderRadius: 14,
        },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 20, duration: 1.1 },
        0,
      )
      .from(modal.querySelectorAll(".modal__reveal"), { y: 60, autoAlpha: 0, duration: 1, stagger: 0.07, ease: "expo.out" }, 0.6);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    const modal = modalRef.current;
    if (!modal) return;
    gsap.to(modal.querySelectorAll(".modal__reveal"), {
      y: 30,
      autoAlpha: 0,
      duration: 0.35,
      stagger: 0.03,
    });
    gsap.to(modal, {
      autoAlpha: 0,
      duration: 0.6,
      delay: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        document.documentElement.classList.remove("modal-open");
        getLenis()?.start();
        setOpen(null);
      },
    });
  };

  const cur = projects[index];
  const p = open !== null ? projects[open] : null;

  return (
    <section ref={root} id="projects" className="projects">
      <div className="projects__backdrop" aria-hidden />
      <p className="projects__ghost" aria-hidden key={`g${index}`}>
        {cur.title}
      </p>

      <div className="container projects__head">
        <p className="label" data-reveal>
          <b>03 /</b> <span>Мои проекты</span>
        </p>
        <h2 className="h2 h2--light projects__title" data-split>
          Реальные проекты. <span className="accent">Реальный результат.</span>
        </h2>
      </div>

      <div className="stage3d">
        <div className="camera">
          <div className="rig">
            <div className="ring">
              <div className="floor" aria-hidden />
              {projects.map((proj, i) => (
                <article
                  key={proj.title}
                  className="card"
                  onClick={() => select(i)}
                  onPointerMove={(e) => onMove(e, i === index)}
                  onPointerLeave={onLeave}
                >
                  <div className="card__inner">
                    <Image
                      src={proj.image}
                      alt={proj.title}
                      fill
                      sizes="(max-width: 900px) 80vw, 40vw"
                      quality={90}
                      style={{ objectPosition: proj.pos }}
                    />
                    <span className="card__glare" />
                    <span className="card__num">
                      <b>/</b>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container projects__hud">
        <div className="hud__info" key={`i${index}`}>
          <p className="hud__meta">
            <b>/{String(index + 1).padStart(2, "0")}</b> {cur.role}
          </p>
          <h3 className="hud__title">{cur.title}</h3>
          <ul className="hud__tags">
            {cur.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="hud__controls">
          <button type="button" className="lnk hud__open" onClick={() => setOpen(index)}>
            <span className="lnk__text">Смотреть кейс</span>
            <span className="lnk__icon">
              <ArrowRight />
            </span>
          </button>
          <a className="lnk lnk--muted hud__site" href={cur.url} target="_blank" rel="noopener noreferrer">
            <span className="lnk__text">Открыть сайт</span>
            <span className="lnk__icon">
              <ArrowRight />
            </span>
          </a>
          <div className="arrows">
            <button type="button" className="arrow" onClick={() => goTo.current(index - 1)} aria-label="Предыдущий проект">
              <ArrowLeft />
            </button>
            <button type="button" className="arrow arrow--next" onClick={() => goTo.current(index + 1)} aria-label="Следующий проект">
              <ArrowRight />
            </button>
            <div className="projects__meta">
              <span className="projects__count">
                <b key={index}>{String(index + 1).padStart(2, "0")}</b> / {String(N).padStart(2, "0")}
              </span>
              <span className="projects__progress">
                <i />
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="projects__hint" aria-hidden>
        Листайте или тяните ↔
      </p>

      {p && (
        <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-label={p.title} onClick={close}>
          <div className="modal__body" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
            <div className="modal__media">
              <Image src={p.image} alt={p.title} fill sizes="90vw" quality={90} style={{ objectPosition: p.pos }} />
              <span className="modal__num modal__reveal">
                <b>/</b>
                {String(open! + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="modal__content">
              <h3 className="modal__title modal__reveal">{p.title}</h3>
              <p className="modal__text modal__reveal">{p.text}</p>
              <dl className="modal__facts modal__reveal">
                <div>
                  <dt>Роль</dt>
                  <dd>{p.role}</dd>
                </div>
                <div>
                  <dt>Стек</dt>
                  <dd>{p.tags.join(" · ")}</dd>
                </div>
              </dl>
              <div className="modal__actions modal__reveal">
                <a className="btn btn--primary" href={p.url} target="_blank" rel="noopener noreferrer">
                  <span className="btn__label">Открыть сайт</span>
                  <ArrowRight />
                </a>
                <button type="button" className="btn btn--ghost" onClick={close}>
                  <span className="btn__label">Закрыть</span>
                </button>
              </div>
            </div>
            <button type="button" className="modal__close" onClick={close} aria-label="Закрыть">
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
