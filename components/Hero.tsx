"use client";

import Image from "next/image";
import { useRef } from "react";
import { finePointer, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { PRELOADER_DONE } from "./fx/Preloader";
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
      const title = q(".hero__title")[0] as HTMLElement;

      const rollCounter = (el: HTMLElement, s: (typeof stats)[number], duration = 2) => {
        const counter = { v: 0 };
        return gsap.to(counter, {
          v: s.value,
          duration,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.v) + s.suffix;
          },
        });
      };

      const enableProximity = contextSafe!(() => {
        if (!finePointer()) return;
        const split = SplitText.create(title, { type: "words,chars", charsClass: "hero__char" });
        const chars = split.chars as HTMLElement[];
        const setters = chars.map((c) => ({
          y: gsap.quickTo(c, "y", { duration: 0.5, ease: "power3.out" }),
          r: gsap.quickTo(c, "rotation", { duration: 0.5, ease: "power3.out" }),
          sx: gsap.quickTo(c, "scaleX", { duration: 0.5, ease: "power3.out" }),
          sy: gsap.quickTo(c, "scaleY", { duration: 0.5, ease: "power3.out" }),
        }));
        const scale = (i: number, v: number) => (setters[i].sx(v), setters[i].sy(v));
        let rects: DOMRect[] = [];
        const measure = () => (rects = chars.map((c) => c.getBoundingClientRect()));
        const move = (e: PointerEvent) => {
          if (!rects.length) measure();
          chars.forEach((c, i) => {
            const r = rects[i];
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const f = Math.max(0, 1 - Math.hypot(dx, dy) / 160);
            setters[i].y(-f * 18);
            setters[i].r(f * (dx > 0 ? -8 : 8));
            scale(i, 1 + f * 0.18);
            c.classList.toggle("is-hot", f > 0.35);
          });
        };
        const leave = () => {
          setters.forEach((s, i) => (s.y(0), s.r(0), scale(i, 1)));
          chars.forEach((c) => c.classList.remove("is-hot"));
        };
        const reset = () => (rects = []);
        title.addEventListener("pointermove", move);
        title.addEventListener("pointerleave", leave);
        window.addEventListener("scroll", reset, { passive: true });
        window.addEventListener("resize", reset);
        return () => {
          title.removeEventListener("pointermove", move);
          title.removeEventListener("pointerleave", leave);
          window.removeEventListener("scroll", reset);
          window.removeEventListener("resize", reset);
          split.revert();
        };
      });

      const intro = contextSafe!(() => {
        gsap.set([q("[data-intro]"), header], { visibility: "visible" });
        if (reduced) return;

        const split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            split.revert();
            enableProximity();
          },
        });
        tl.from(q(".hero__media-inner"), { scale: 1.25, autoAlpha: 0, duration: 2.4, ease: "power3.out" }, 0)
          .from(q(".hero__glow"), { autoAlpha: 0, scale: 0.4, duration: 2.4, ease: "power2.out" }, 0.1)
          .from(header, { yPercent: -100, autoAlpha: 0, duration: 1.4 }, 0.25)
          .from(q(".hero .label"), { x: -30, autoAlpha: 0, duration: 1.2 }, 0.35)
          .from(split.lines, { yPercent: 115, rotate: 3, transformOrigin: "0% 100%", duration: 1.6, stagger: 0.12 }, 0.4)
          .from(q(".hero .lead"), { y: 30, autoAlpha: 0, duration: 1.3 }, 0.9)
          .from(q(".hero__actions > *"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1)
          .from(q(".stat"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 1.15)
          .from(q(".hero__scroll"), { autoAlpha: 0, y: 20, duration: 1 }, 1.4);

        q<HTMLElement>(".stat__num").forEach((el, i) => tl.add(rollCounter(el, stats[i]), 1.2 + i * 0.1));
      });

      const w = window as unknown as { __preloaderDone?: boolean };
      if (w.__preloaderDone) intro();
      else window.addEventListener(PRELOADER_DONE, intro, { once: true });
      const offIntro = () => window.removeEventListener(PRELOADER_DONE, intro);

      if (reduced) return offIntro;

      q<HTMLElement>(".stat").forEach((stat, i) => {
        const num = stat.querySelector<HTMLElement>(".stat__num")!;
        stat.addEventListener("mouseenter", () => rollCounter(num, stats[i], 1));
      });

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

      if (!finePointer()) return offIntro;
      const media = q(".hero__depth")[0];
      const glow = q(".hero__glow")[0];
      const content = q(".hero__content-inner")[0];
      const mx = gsap.quickTo(media, "x", { duration: 1.4, ease: "power3.out" });
      const my = gsap.quickTo(media, "y", { duration: 1.4, ease: "power3.out" });
      const mr = gsap.quickTo(media, "rotationY", { duration: 1.4, ease: "power3.out" });
      const mrx = gsap.quickTo(media, "rotationX", { duration: 1.4, ease: "power3.out" });
      const gx = gsap.quickTo(glow, "x", { duration: 2, ease: "power3.out" });
      const gy = gsap.quickTo(glow, "y", { duration: 2, ease: "power3.out" });
      const cx = gsap.quickTo(content, "x", { duration: 1.6, ease: "power3.out" });
      const cy = gsap.quickTo(content, "y", { duration: 1.6, ease: "power3.out" });

      const move = (e: PointerEvent) => {
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        mx(-px * 50);
        my(-py * 30);
        mr(px * 6);
        mrx(-py * 4);
        gx(px * window.innerWidth * 0.5);
        gy(py * window.innerHeight * 0.5);
        cx(px * 14);
        cy(py * 10);
      };
      root.current!.addEventListener("pointermove", move);
      return () => {
        offIntro();
        root.current?.removeEventListener("pointermove", move);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="hero">
      <div className="hero__media" aria-hidden>
        <div className="hero__depth">
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
        </div>
        <div className="hero__glow" data-intro />
      </div>

      <div className="container">
        <div className="hero__content" id="about">
          <div className="hero__content-inner">
            <p className="label" data-intro data-scramble>
              <b>01 /</b> <span>Frontend разработчик</span>
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
              <a href="#projects" className="btn btn--primary" data-magnetic>
                <span className="btn__label">Смотреть проекты</span> <ArrowRight />
              </a>
              <a href="#contacts" className="btn btn--ghost" data-magnetic>
                <span className="btn__label">Связаться со мной</span> <CircleArrow />
              </a>
            </div>
            <ul className="stats" data-intro>
              {stats.map((s) => (
                <li key={s.label} className="stat" data-hover>
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
      </div>

      <a href="#stack" className="hero__scroll" data-intro data-magnetic aria-label="Листать вниз">
        <span className="hero__scroll-mouse">
          <span className="hero__scroll-wheel" />
        </span>
        <span>Листай</span>
      </a>

      <span className="anchor anchor--dot hero__anchor" data-anchor="1" />
    </section>
  );
}
