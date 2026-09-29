"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { ArrowRight, CircleArrow } from "./icons";

const stats = [
  { value: 7, suffix: "+", label: "Лет опыта" },
  { value: 30, suffix: "+", label: "Проектов" },
  { value: 100, suffix: "%", label: "Реальных кейсов" },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const header = document.querySelector("[data-intro-header]");

      const intro = contextSafe!(() => {
        gsap.set([q("[data-intro]"), header], { visibility: "visible" });
        if (reduced) return;

        const split = SplitText.create(q(".hero__title")[0], { type: "lines", mask: "lines", linesClass: "split-line" });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => split.revert() });
        tl.from(q(".hero__media-inner"), { scale: 1.3, autoAlpha: 0, duration: 2.6, ease: "power3.out" }, 0)
          .from(q(".hero__glow"), { autoAlpha: 0, scale: 0.6, duration: 2.4, ease: "power2.out" }, 0.2)
          .from(header, { yPercent: -100, autoAlpha: 0, duration: 1.4 }, 0.35)
          .from(q(".hero .label"), { x: -30, autoAlpha: 0, duration: 1.2 }, 0.5)
          .from(split.lines, { yPercent: 115, rotate: 3, transformOrigin: "0% 100%", duration: 1.6, stagger: 0.12 }, 0.55)
          .from(q(".hero .lead"), { y: 30, autoAlpha: 0, duration: 1.3 }, 1.05)
          .from(q(".hero__actions > *"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1.15)
          .from(q(".stat"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1.3);

        q<HTMLElement>(".stat__num").forEach((el, i) => {
          const s = stats[i];
          const counter = { v: 0 };
          tl.to(
            counter,
            {
              v: s.value,
              duration: 2,
              ease: "power3.out",
              onUpdate: () => {
                el.textContent = Math.round(counter.v) + s.suffix;
              },
            },
            1.35 + i * 0.1,
          );
        });
      });

      if (document.fonts?.status === "loaded") intro();
      else document.fonts.ready.then(intro);

      if (reduced) return;

      gsap.to(q(".hero__media"), {
        yPercent: 22,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q(".hero__content"), {
        y: -140,
        autoAlpha: 0.1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "20% top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="hero">
      <div className="hero__media" aria-hidden>
        <div className="hero__media-inner" data-intro>
          <Image
            src="/images/hero.png"
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            quality={95}
          />
        </div>
        <div className="hero__glow" data-intro />
      </div>

      <div className="container">
        <div className="hero__content" id="about">
          <p className="label" data-intro>
            <b>01 /</b> Frontend разработчик
          </p>
          <h1 className="h1 hero__title" data-intro>
            Программист,
            <br />
            который <span className="accent">проектирует</span>
            <br />
            опыт, а не просто
            <br />
            пишет код
          </h1>
          <p className="lead" data-intro>
            Создаю веб-продукты с продуманной архитектурой, эстетичным интерфейсом и вниманием к деталям.
          </p>
          <div className="hero__actions" data-intro>
            <a href="#projects" className="btn btn--primary">
              Смотреть проекты <ArrowRight />
            </a>
            <a href="#contacts" className="btn btn--ghost">
              Связаться со мной <CircleArrow />
            </a>
          </div>
          <ul className="stats" data-intro>
            {stats.map((s) => (
              <li key={s.label} className="stat">
                <span className="stat__num">
                  {s.value}
                  {s.suffix}
                </span>
                <span className="stat__txt">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span className="anchor anchor--dot hero__anchor" data-anchor="1" />
    </section>
  );
}
