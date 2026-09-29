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
    year: "2026",
    role: "Frontend lead",
    text: "Иммерсивный сайт студии с 3D-сценами, плавным скроллом и анимациями, завязанными на взаимодействие пользователя.",
  },
  {
    title: "Nebula Commerce",
    tags: ["React", "Node.js", "PostgreSQL"],
    image: "/images/planet.png",
    year: "2025",
    role: "Fullstack",
    text: "E-commerce платформа: витрина с мгновенным поиском, корзина в реальном времени и админ-панель с аналитикой.",
  },
  {
    title: "Orbit Analytics",
    tags: ["TypeScript", "GraphQL", "Docker"],
    image: "/images/orbit.png",
    year: "2025",
    role: "Frontend",
    text: "Дашборд аналитики с живыми графиками, конструктором отчётов и продуманной системой компонентов.",
  },
];

const slots = [
  { xPercent: 0, scale: 1, rotationY: 16, z: 0, autoAlpha: 1, zIndex: 3, filter: "grayscale(0) brightness(1)" },
  { xPercent: 42, scale: 0.84, rotationY: 22, z: -120, autoAlpha: 0.9, zIndex: 2, filter: "grayscale(1) brightness(0.75)" },
  { xPercent: 72, scale: 0.66, rotationY: 26, z: -240, autoAlpha: 0.7, zIndex: 1, filter: "grayscale(1) brightness(0.55)" },
];

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const first = useRef(true);
  const dragged = useRef(false);

  const go = (dir: number) => setIndex((i) => (i + dir + projects.length) % projects.length);

  const { contextSafe } = useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".card", root.current);
      cards.forEach((card, i) => {
        const { zIndex, ...slot } = slots[(i - index + cards.length) % cards.length];
        gsap.set(card, { zIndex });
        if (first.current) gsap.set(card, { ...slot, yPercent: -50 });
        else gsap.to(card, { ...slot, yPercent: -50, duration: 1.3, ease: "expo.inOut" });
      });
      gsap.fromTo(
        ".projects__count b",
        { yPercent: 100 },
        { yPercent: 0, duration: 0.8, ease: "expo.out" },
      );
      gsap.to(".projects__progress i", { scaleX: (index + 1) / projects.length, duration: 1, ease: "expo.out" });
      first.current = false;
    },
    { dependencies: [index], scope: root },
  );

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(".stage__inner", {
        xPercent: 35,
        rotationY: -30,
        autoAlpha: 0,
        duration: 1.8,
        ease: "expo.out",
        scrollTrigger: { trigger: ".projects__grid", start: "top 75%", toggleActions: "play none none reverse" },
      });
      gsap.fromTo(
        ".stage",
        { y: 80 },
        {
          y: -80,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      const proxy = document.createElement("div");
      const [drag] = Draggable.create(proxy, {
        type: "x",
        trigger: ".stage",
        allowNativeTouchScrolling: true,
        dragClickables: true,
        minimumMovement: 6,
        onPress() {
          gsap.set(proxy, { x: 0 });
          this.update();
        },
        onDrag() {
          gsap.to(".stage__inner", { x: this.x * 0.35, rotationY: this.x * 0.02, duration: 0.3, overwrite: "auto" });
        },
        onDragStart() {
          dragged.current = true;
        },
        onDragEnd() {
          setTimeout(() => (dragged.current = false), 50);
          if (Math.abs(this.x) > 60) go(this.x < 0 ? 1 : -1);
          gsap.to(".stage__inner", { x: 0, rotationY: 0, duration: 1, ease: "elastic.out(1, 0.6)" });
        },
      });

      let inView = false;
      ScrollTrigger.create({ trigger: root.current, start: "top 60%", end: "bottom 40%", onToggle: (s) => (inView = s.isActive) });
      const onKey = (e: KeyboardEvent) => {
        if (!inView || document.documentElement.classList.contains("modal-open")) return;
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      };
      window.addEventListener("keydown", onKey);
      return () => {
        drag.kill();
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: root },
  );

  const onMove = contextSafe((e: React.PointerEvent<HTMLElement>, active: boolean) => {
    if (!active || e.pointerType !== "mouse") return;
    const inner = e.currentTarget.querySelector<HTMLElement>(".card__inner")!;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(inner, { rotationY: (px - 0.5) * 14, rotationX: -(py - 0.5) * 14, duration: 0.8, ease: "power3.out" });
    gsap.to(inner.querySelector("img"), { x: (0.5 - px) * 24, y: (0.5 - py) * 16, scale: 1.08, duration: 0.8, ease: "power3.out" });
    inner.style.setProperty("--gx", `${px * 100}%`);
    inner.style.setProperty("--gy", `${py * 100}%`);
  });

  const onLeave = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    const inner = e.currentTarget.querySelector(".card__inner")!;
    gsap.to(inner, { rotationY: 0, rotationX: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" });
    gsap.to(inner.querySelector("img"), { x: 0, y: 0, scale: 1, duration: 1.2, ease: "power3.out" });
  });

  useEffect(() => {
    const html = document.documentElement;
    const lenis = getLenis();
    if (open === null) return;
    html.classList.add("modal-open");
    lenis?.stop();

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
        <div className="section__bg-inner" data-zoom>
          <Image src="/images/mountains.png" alt="" fill sizes="100vw" quality={80} />
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
            Здесь собраны проекты, над которыми я работал — от идеи до запуска. Нажмите на проект, чтобы
            посмотреть подробности.
          </p>
          <div className="arrows" data-reveal="0.3">
            <button type="button" className="arrow" onClick={() => go(-1)} aria-label="Предыдущий проект">
              <ArrowLeft />
            </button>
            <button type="button" className="arrow arrow--next" onClick={() => go(1)} aria-label="Следующий проект">
              <ArrowRight />
            </button>
            <div className="projects__meta">
              <span className="projects__count">
                <b key={index}>{String(index + 1).padStart(2, "0")}</b> / {String(projects.length).padStart(2, "0")}
              </span>
              <span className="projects__progress">
                <i />
              </span>
            </div>
          </div>
        </div>

        <div className="stage">
          <div className="stage__inner">
            {projects.map((proj, i) => {
              const active = i === index;
              return (
                <article
                  key={proj.title}
                  className={`card${active ? " is-active" : ""}`}
                  data-cursor={active ? "Открыть" : "Выбрать"}
                  onClick={() => !dragged.current && (active ? setOpen(i) : setIndex(i))}
                  onPointerMove={(e) => onMove(e, active)}
                  onPointerLeave={onLeave}
                >
                  <div className="card__inner">
                    <Image src={proj.image} alt={proj.title} fill sizes="(max-width: 900px) 90vw, 560px" quality={90} />
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
              );
            })}
          </div>
        </div>
      </div>

      <span className="anchor anchor--ring projects__anchor" data-anchor="4" />

      {p && (
        <div ref={modalRef} className="modal" role="dialog" aria-modal="true" aria-label={p.title} onClick={close}>
          <div className="modal__body" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
            <div className="modal__media">
              <Image src={p.image} alt={p.title} fill sizes="90vw" quality={90} />
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
            <button type="button" className="modal__close" onClick={close} aria-label="Закрыть" data-cursor="Закрыть">
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
