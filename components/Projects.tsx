"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Draggable, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ArrowLeft, ArrowRight } from "./icons";

const projects = [
  {
    title: "Crater Studio",
    tags: ["Next.js", "GSAP", "WebGL"],
    image: "/images/mountains.png",
    pos: "50% 50%",
    year: "2026",
    role: "Frontend lead",
    text: "Иммерсивный сайт студии с 3D-сценами, плавным скроллом и анимациями, завязанными на взаимодействие пользователя.",
  },
  {
    title: "Nebula Commerce",
    tags: ["React", "Node.js", "PostgreSQL"],
    image: "/images/planet.png",
    pos: "50% 50%",
    year: "2025",
    role: "Fullstack",
    text: "E-commerce платформа: витрина с мгновенным поиском, корзина в реальном времени и админ-панель с аналитикой.",
  },
  {
    title: "Orbit Analytics",
    tags: ["TypeScript", "GraphQL", "Docker"],
    image: "/images/orbit.png",
    pos: "50% 50%",
    year: "2025",
    role: "Frontend",
    text: "Дашборд аналитики с живыми графиками, конструктором отчётов и продуманной системой компонентов.",
  },
  {
    title: "Redline Motion",
    tags: ["GSAP", "Canvas", "Next.js"],
    image: "/images/mountains.png",
    pos: "15% 80%",
    year: "2024",
    role: "Motion developer",
    text: "Промо-сайт с покадровой анимацией на скролле, интерактивными сценами и звуковым сопровождением.",
  },
  {
    title: "Eclipse Bank",
    tags: ["React", "TypeScript", "Storybook"],
    image: "/images/planet.png",
    pos: "90% 90%",
    year: "2024",
    role: "Frontend",
    text: "Интерфейс онлайн-банка: дизайн-система на 120+ компонентов, строгая типизация и доступность AA.",
  },
  {
    title: "Pulse Chat",
    tags: ["Node.js", "WebSocket", "Redis"],
    image: "/images/orbit.png",
    pos: "20% 30%",
    year: "2023",
    role: "Fullstack",
    text: "Мессенджер реального времени: комнаты, статусы набора, доставка сообщений и офлайн-очередь.",
  },
];

const N = projects.length;
const STEP = 360 / N;
const wrap = (i: number) => ((i % N) + N) % N;

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const dragged = useRef(false);
  const goTo = useRef<(target: number) => void>(() => {});
  const posRef = useRef(0);

  useGSAP(
    () => {
      const ring = root.current!.querySelector<HTMLElement>(".ring")!;
      const cards = gsap.utils.toArray<HTMLElement>(".card", root.current);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const state = { pos: 0 };
      let radius = 0;
      let px = 1;
      let current = 0;
      let pressed = 0;

      const render = () => {
        posRef.current = state.pos;
        ring.style.transform = `translateZ(${-radius}px) rotateY(${-state.pos * STEP}deg)`;
        cards.forEach((card, i) => {
          let d = wrap(i - state.pos);
          if (d > N / 2) d -= N;
          const a = Math.abs(d);
          card.style.setProperty("--dim", String(Math.min(0.85, a * 0.45)));
          card.classList.toggle("is-active", a < 0.5);
        });
        const idx = wrap(Math.round(state.pos));
        if (idx !== current) {
          current = idx;
          setIndex(idx);
        }
      };

      const layout = () => {
        const w = cards[0].offsetWidth;
        radius = w / 2 / Math.tan(Math.PI / N) + w * 0.08;
        px = w * 0.9;
        cards.forEach((card, i) => {
          card.style.transform = `translate(-50%, -50%) rotateY(${i * STEP}deg) translateZ(${radius}px)`;
        });
        render();
      };
      layout();

      const proxy = document.createElement("div");
      proxy.className = "stage__proxy";
      root.current!.querySelector(".stage")!.appendChild(proxy);
      const spin = (target: number, duration = 1.2) => {
        gsap.killTweensOf(proxy);
        return gsap.to(state, { pos: target, duration, ease: "expo.out", overwrite: true, onUpdate: render });
      };

      goTo.current = (target) => spin(target);

      const [drag] = Draggable.create(proxy, {
        type: "x",
        trigger: ".stage",
        inertia: true,
        throwResistance: 3500,
        maxDuration: 1.2,
        allowNativeTouchScrolling: true,
        minimumMovement: 6,
        snap: {
          x: (v: number) => {
            const i = gsap.utils.clamp(pressed - 2, pressed + 2, Math.round(-v / px));
            return -i * px;
          },
        },
        onPress() {
          pressed = Math.round(state.pos);
          gsap.killTweensOf(state);
          gsap.set(proxy, { x: -state.pos * px });
          this.update();
        },
        onDragStart() {
          dragged.current = true;
          root.current!.classList.add("is-dragging");
        },
        onDrag() {
          state.pos = -this.x / px;
          render();
        },
        onThrowUpdate() {
          state.pos = -this.x / px;
          render();
        },
        onRelease() {
          root.current!.classList.remove("is-dragging");
          setTimeout(() => (dragged.current = false), 60);
          if (!this.isThrowing) spin(Math.round(state.pos), 0.8);
        },
      });

      const ro = new ResizeObserver(layout);
      ro.observe(cards[0]);

      if (!reduced) {
        state.pos = -1.5;
        render();
        gsap.from(".stage__inner", { autoAlpha: 0, scale: 0.8, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".projects__grid", start: "top 75%", once: true } });
        gsap.to(state, {
          pos: 0,
          duration: 2.4,
          ease: "expo.out",
          onUpdate: render,
          scrollTrigger: { trigger: ".projects__grid", start: "top 75%", once: true },
        });
        gsap.fromTo(
          ".stage",
          { y: 60 },
          { y: -60, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }

      let inView = false;
      ScrollTrigger.create({ trigger: root.current, start: "top 60%", end: "bottom 40%", onToggle: (s) => (inView = s.isActive) });
      const onKey = (e: KeyboardEvent) => {
        if (!inView || document.documentElement.classList.contains("modal-open")) return;
        if (e.key === "ArrowRight") spin(Math.round(state.pos) + 1);
        if (e.key === "ArrowLeft") spin(Math.round(state.pos) - 1);
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
      gsap.fromTo(".projects__count b", { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.out" });
      gsap.to(".projects__progress i", { scaleX: (index + 1) / N, duration: 0.8, ease: "expo.out" });
    },
    { dependencies: [index], scope: root },
  );

  const step = (dir: number) => goTo.current(Math.round(posRef.current) + dir);

  const select = (i: number) => {
    if (dragged.current) return;
    if (i === index) return setOpen(i);
    let d = wrap(i - posRef.current);
    if (d > N / 2) d -= N;
    goTo.current(Math.round(posRef.current + d));
  };

  const onMove = (e: React.PointerEvent<HTMLElement>, active: boolean) => {
    if (!active || e.pointerType !== "mouse" || dragged.current) return;
    const inner = e.currentTarget.querySelector<HTMLElement>(".card__inner")!;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    gsap.to(inner, { rotationY: (x - 0.5) * 12, rotationX: -(y - 0.5) * 12, duration: 0.8, ease: "power3.out" });
    gsap.to(inner.querySelector("img"), { x: (0.5 - x) * 20, y: (0.5 - y) * 14, scale: 1.08, duration: 0.8, ease: "power3.out" });
    inner.style.setProperty("--gx", `${x * 100}%`);
    inner.style.setProperty("--gy", `${y * 100}%`);
  };

  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    const inner = e.currentTarget.querySelector(".card__inner")!;
    gsap.to(inner, { rotationY: 0, rotationX: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" });
    gsap.to(inner.querySelector("img"), { x: 0, y: 0, scale: 1, duration: 1.2, ease: "power3.out" });
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
    gsap.to(modal.querySelectorAll(".modal__reveal"), { y: 30, autoAlpha: 0, duration: 0.35, stagger: 0.03 });
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

  const p = open !== null ? projects[open] : null;

  return (
    <section ref={root} id="projects" className="section projects">
      <div className="section__bg projects__bg" aria-hidden>
        <div className="section__bg-inner">
          {/* <Image src="/images/mountains.png" alt="" fill sizes="100vw" quality={80} /> */}
        </div>
      </div>

      <div className="container projects__grid">
        <div className="projects__text">
          <p className="label" data-reveal>
            <b>03 /</b> <span>Мои проекты</span>
          </p>
          <h2 className="h2 h2--light" data-split>
            Реальные проекты.
            <br />
            <span className="accent">Реальный результат.</span>
          </h2>
          <p className="lead" data-reveal="0.2">
            Здесь собраны проекты, над которыми я работал — от идеи до запуска. Крутите карусель и нажмите
            на проект, чтобы посмотреть подробности.
          </p>
          <div className="arrows" data-reveal="0.3">
            <button type="button" className="arrow" onClick={() => step(-1)} aria-label="Предыдущий проект">
              <ArrowLeft />
            </button>
            <button type="button" className="arrow arrow--next" onClick={() => step(1)} aria-label="Следующий проект">
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

        <div className="stage">
          <div className="stage__inner">
            <div className="ring">
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
                      sizes="(max-width: 900px) 80vw, 520px"
                      quality={90}
                      style={{ objectPosition: proj.pos }}
                    />
                    <span className="card__glare" />
                    <span className="card__num">
                      <b>/</b>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="card__info">
                      <h3>{proj.title}</h3>
                      <ul>
                        {proj.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="stage__hint" aria-hidden>
            ← Тяните, чтобы вращать →
          </p>
        </div>
      </div>

      <span className="anchor anchor--ring projects__anchor" data-anchor="4" />

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
                  <dt>Год</dt>
                  <dd>{p.year}</dd>
                </div>
                <div>
                  <dt>Роль</dt>
                  <dd>{p.role}</dd>
                </div>
                <div>
                  <dt>Стек</dt>
                  <dd>{p.tags.join(" · ")}</dd>
                </div>
              </dl>
              <button type="button" className="btn btn--primary modal__reveal" onClick={close}>
                <span className="btn__label">Закрыть</span>
              </button>
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
