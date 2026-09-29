"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowLeft, ArrowRight } from "./icons";

const projects = [
  { title: "Crater Studio", tags: ["Next.js", "GSAP", "WebGL"], image: "/images/mountains.png" },
  { title: "Nebula Commerce", tags: ["React", "Node.js", "PostgreSQL"], image: "/images/planet.png" },
  { title: "Orbit Analytics", tags: ["TypeScript", "GraphQL", "Docker"], image: "/images/orbit.png" },
];

const slots = [
  { xPercent: 0, scale: 1, rotationY: 16, z: 0, autoAlpha: 1, zIndex: 3, filter: "grayscale(0) brightness(1)" },
  { xPercent: 42, scale: 0.84, rotationY: 22, z: -120, autoAlpha: 0.9, zIndex: 2, filter: "grayscale(1) brightness(0.75)" },
  { xPercent: 72, scale: 0.66, rotationY: 26, z: -240, autoAlpha: 0.7, zIndex: 1, filter: "grayscale(1) brightness(0.55)" },
];

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const first = useRef(true);

  const { contextSafe } = useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".card", root.current);
      cards.forEach((card, i) => {
        const { zIndex, ...slot } = slots[(i - index + cards.length) % cards.length];
        gsap.set(card, { zIndex });
        if (first.current) gsap.set(card, { ...slot, yPercent: -50 });
        else gsap.to(card, { ...slot, yPercent: -50, duration: 1.3, ease: "expo.inOut" });
      });
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
    },
    { scope: root },
  );

  const go = (dir: number) => setIndex((i) => (i + dir + projects.length) % projects.length);

  const onMove = contextSafe((e: React.PointerEvent<HTMLElement>, active: boolean) => {
    if (!active) return;
    const inner = e.currentTarget.querySelector(".card__inner");
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(inner, { rotationY: px * 10, rotationX: -py * 10, duration: 0.8, ease: "power3.out" });
  });

  const onLeave = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget.querySelector(".card__inner"), {
      rotationY: 0,
      rotationX: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
    });
  });

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
            <b>03 /</b> Мои проекты
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
          </div>
        </div>

        <div className="stage">
          <div className="stage__inner">
            {projects.map((p, i) => {
              const active = i === index;
              return (
                <article
                  key={p.title}
                  className={`card${active ? " is-active" : ""}`}
                  onClick={() => !active && setIndex(i)}
                  onPointerMove={(e) => onMove(e, active)}
                  onPointerLeave={onLeave}
                >
                  <div className="card__inner">
                    <Image src={p.image} alt={p.title} fill sizes="(max-width: 900px) 90vw, 560px" quality={90} />
                    <span className="card__num">
                      <b>/</b>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="card__info">
                      <h3>{p.title}</h3>
                      <ul>
                        {p.tags.map((t) => (
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
    </section>
  );
}
